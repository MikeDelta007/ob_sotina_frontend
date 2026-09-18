'use client'
import { useContext, useEffect, useRef, useState } from 'react'
import ProtectedRoute from '@/layout/ProtectedRoute'
import { UserContext } from '@/app/userContext'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { Dropdown } from 'primereact/dropdown'
import { MultiSelect } from 'primereact/multiselect'
import { RadioButton } from 'primereact/radiobutton'
import { Calendar } from 'primereact/calendar'
import { InputText } from 'primereact/inputtext'
import { Tag } from 'primereact/tag'
import { Message } from 'primereact/message'
import { Toast } from 'primereact/toast'
import { ParametrageService } from '@/demo/service/ParametrageService'
import axiosInstance from '@/app/api/axiosInstance'
import { useMissionStore } from '../useMissionStore'
import { TOUS_ROLES, type OrdreMission, type Voiture } from '../types'

const toIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

interface LigneForm {
  agentId: string | null
  disponibiliteVoiture: boolean | null
  voitureId: string | null
}

const ligneVide = (): LigneForm => ({ agentId: null, disponibiliteVoiture: null, voitureId: null })

function MissionsContent() {
  const toast = useRef<Toast>(null)
  const { user } = useContext(UserContext)
  const role = user?.profil?.name
  const peutGerer = role === 'CSA'

  const { mesMissions, toutes, loading, actionLoadingId, error, fetchMesMissions, fetchToutes, creer, annuler, clearError } = useMissionStore()
  const [agents, setAgents] = useState<{ label: string; value: string }[]>([])
  const [voitures, setVoitures] = useState<Voiture[]>([])
  const [regions, setRegions] = useState<{ id: string; name: string }[]>([])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [regionIds, setRegionIds] = useState<string[]>([])
  const [motif, setMotif] = useState('')
  const [dateDebut, setDateDebut] = useState<Date | null>(null)
  const [dateFin, setDateFin] = useState<Date | null>(null)
  const [lignes, setLignes] = useState<LigneForm[]>([ligneVide()])
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => {
    if (peutGerer) fetchToutes()
    else fetchMesMissions()
  }, [peutGerer])

  useEffect(() => {
    if (!peutGerer) return
    ParametrageService.getUsers().then((groupes: Record<string, any[]>) => {
      // Seuls les comptes du personnel (chef de service, CSA, directeur, etc.) peuvent être
      // désignés agents de mission — pas les comptes de saisie/correction, bien plus nombreux.
      const agentsEligibles = Object.entries(groupes ?? {})
        .filter(([profilName]) => TOUS_ROLES.includes(profilName))
        .flatMap(([, u]) => u)
      const agentsInternes = agentsEligibles.map((u: any) =>
        ({ label: `${u.personnel?.firstname ?? ''} ${u.personnel?.lastname ?? ''} (${u.login})`, value: u.id }))
      // Le personnel externe (sans compte, ex. importé par Excel) peut aussi être agent de mission.
      axiosInstance.get('personnel/personnels').then(({ data }) => {
        const agentsExternes = (data as any[]).map(p =>
          ({ label: `${p.firstname} ${p.lastname} (Externe)`, value: p.id }))
        setAgents([...agentsInternes, ...agentsExternes])
      }).catch(() => setAgents(agentsInternes))
    })
    axiosInstance.get('personnel/voitures').then(({ data }) => setVoitures(data)).catch(() => {})
    ParametrageService.getRegions().then((data: { id: string; name: string }[]) => setRegions(data ?? [])).catch(() => {})
  }, [peutGerer])

  const openCreate = () => {
    setRegionIds([]); setMotif(''); setDateDebut(null); setDateFin(null); setLignes([ligneVide()])
    clearError()
    setDialogOpen(true)
  }

  const majLigne = (index: number, patch: Partial<LigneForm>) => {
    setLignes(prev => prev.map((l, i) => i === index ? { ...l, ...patch } : l))
  }
  const ajouterLigne = () => setLignes(prev => [...prev, ligneVide()])
  const retirerLigne = (index: number) => setLignes(prev => prev.length > 1 ? prev.filter((_, i) => i !== index) : prev)

  const ligneValide = (l: LigneForm) => !!l.agentId && l.disponibiliteVoiture !== null && (l.disponibiliteVoiture === true || !!l.voitureId)
  const peutSoumettre = regionIds.length > 0 && !!motif.trim() && !!dateDebut && !!dateFin
    && lignes.length > 0 && lignes.every(ligneValide)

  const submit = async () => {
    if (!peutSoumettre || !dateDebut || !dateFin) return
    try {
      await creer({
        regionIds,
        motif: motif.trim(),
        dateDebut: toIso(dateDebut),
        dateFin: toIso(dateFin),
        lignes: lignes.map(l => ({
          agentId: l.agentId as string,
          disponibiliteVoiture: l.disponibiliteVoiture as boolean,
          voitureId: l.disponibiliteVoiture ? null : l.voitureId,
        })),
      })
      toast.current?.show({ severity: 'success', summary: 'Office du Bac', detail: 'Ordre de mission créé', life: 4000 })
      setDialogOpen(false)
    } catch { /* error déjà affiché via le store */ }
  }

  const doAnnuler = async (m: OrdreMission) => {
    try {
      await annuler(m.id)
      toast.current?.show({ severity: 'success', summary: 'Office du Bac', detail: 'Ordre de mission annulé', life: 4000 })
    } catch { /* error déjà affiché via le store */ }
  }

  const dateBody = (m: OrdreMission) => (
    <span>{new Date(m.dateDebut).toLocaleDateString('fr-FR')} → {new Date(m.dateFin).toLocaleDateString('fr-FR')}</span>
  )
  const regionsBody = (m: OrdreMission) => (m.regionNoms ?? []).join(', ')
  const agentsBody = (m: OrdreMission) => (m.lignes ?? []).map(l => l.agentNom).filter(Boolean).join(', ')
  const vehiculesBody = (m: OrdreMission) => (m.lignes ?? []).map(l => l.voitureImmatriculation).filter(Boolean).join(', ')
  const statutBody = (m: OrdreMission) => m.annule
    ? <Tag severity="danger" value="Annulé" />
    : <Tag severity="success" value="Actif" />
  const actionsBody = (m: OrdreMission) => !m.annule && (
    <Button label="Annuler" icon="pi pi-times" severity="danger" size="small" outlined
      loading={actionLoadingId === m.id} onClick={() => doAnnuler(m)} />
  )

  const data = peutGerer ? toutes : mesMissions

  const agentDejaChoisiAilleurs = (index: number, agentId: string | null) =>
    !!agentId && lignes.some((l, i) => i !== index && l.agentId === agentId)

  return (
    <div className="card">
      <Toast ref={toast} />
      <div className="mb-4 flex justify-content-between align-items-start">
        <div>
          <h3 className="m-0">{peutGerer ? 'Ordres de mission' : 'Mes missions'}</h3>
          <p className="text-color-secondary mt-1 mb-0">
            {peutGerer ? 'Créez et gérez les ordres de mission des agents' : 'Consultez les ordres de mission qui vous sont assignés'}
          </p>
        </div>
        {peutGerer && <Button label="Créer un ordre de mission" icon="pi pi-plus" onClick={openCreate} />}
      </div>

      <DataTable value={data} loading={loading} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="Aucun ordre de mission" responsiveLayout="scroll"
        globalFilter={globalFilter} globalFilterFields={['motif']}
        header={
          <div className="flex justify-content-end">
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Rechercher…" />
            </span>
          </div>
        }>
        {peutGerer && <Column header="Agents" body={agentsBody} />}
        <Column header="Véhicules" body={vehiculesBody} />
        <Column header="Destination" body={regionsBody} />
        <Column header="Motif" field="motif" />
        <Column header="Période" body={dateBody} />
        <Column header="Statut" body={statutBody} align="center" alignHeader="center" />
        {peutGerer && <Column header="Actions" body={actionsBody} align="center" alignHeader="center" />}
      </DataTable>

      <Dialog header="Créer un ordre de mission" visible={dialogOpen} onHide={() => setDialogOpen(false)}
        style={{ width: '48rem' }} draggable={false}
        footer={
          <div className="flex gap-2">
            <Button label="Annuler" outlined className="flex-1" onClick={() => setDialogOpen(false)} />
            <Button label={loading ? 'Création…' : 'Créer'} className="flex-1" loading={loading}
              disabled={!peutSoumettre} onClick={submit} />
          </div>
        }>
        <div className="flex flex-column gap-3">
          <div className="grid">
            <div className="col-12 md:col-6">
              <label className="block text-sm font-medium mb-1">Destination (régions)</label>
              <MultiSelect value={regionIds} onChange={e => setRegionIds(e.value)} options={regions}
                optionLabel="name" optionValue="id" filter showSelectAll={false} selectedItemsLabel="{0} régions sélectionnées"
                placeholder="Sélectionner une ou plusieurs régions" className="w-full"
                panelClassName="multiselect-sans-checkbox" />
            </div>
            <div className="col-12 md:col-6">
              <label className="block text-sm font-medium mb-1">Motif</label>
              <InputText value={motif} onChange={e => setMotif(e.target.value)} className="w-full" />
            </div>
            <div className="col-6 md:col-3">
              <label className="block text-sm font-medium mb-1">Date de début</label>
              <Calendar value={dateDebut} onChange={e => setDateDebut(e.value as Date)} dateFormat="dd/mm/yy" showIcon className="w-full" />
            </div>
            <div className="col-6 md:col-3">
              <label className="block text-sm font-medium mb-1">Date de fin</label>
              <Calendar value={dateFin} onChange={e => setDateFin(e.value as Date)} dateFormat="dd/mm/yy" showIcon className="w-full" minDate={dateDebut ?? undefined} />
            </div>
          </div>

          <div className="field">
            <div className="flex justify-content-between align-items-center mb-2">
              <label className="text-sm font-medium">Agents et véhicules de la mission</label>
              <Button label="Ajouter une ligne" icon="pi pi-plus" text size="small" onClick={ajouterLigne} />
            </div>

            <div className="flex flex-column gap-3">
              {lignes.map((ligne, index) => (
                <div key={index} className="p-3 border-round surface-100">
                  <div className="grid align-items-start">
                    <div className="col-12 md:col-4">
                      <label className="block text-xs font-medium mb-1">Agent</label>
                      <Dropdown value={ligne.agentId} onChange={e => majLigne(index, { agentId: e.value })}
                        options={agents.filter(a => !agentDejaChoisiAilleurs(index, a.value) || a.value === ligne.agentId)}
                        filter placeholder="Sélectionner un agent" className="w-full" />
                    </div>
                    <div className="col-12 md:col-4">
                      <label className="block text-xs font-medium mb-1">Disponibilité d&apos;une voiture</label>
                      <div className="flex align-items-center gap-3 mt-2">
                        <div className="flex align-items-center gap-2">
                          <RadioButton inputId={`dispoOui-${index}`} checked={ligne.disponibiliteVoiture === true}
                            onChange={() => majLigne(index, { disponibiliteVoiture: true, voitureId: null })} />
                          <label htmlFor={`dispoOui-${index}`} className="text-sm">Oui</label>
                        </div>
                        <div className="flex align-items-center gap-2">
                          <RadioButton inputId={`dispoNon-${index}`} checked={ligne.disponibiliteVoiture === false}
                            onChange={() => majLigne(index, { disponibiliteVoiture: false })} />
                          <label htmlFor={`dispoNon-${index}`} className="text-sm">Non</label>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 md:col-3">
                      {ligne.disponibiliteVoiture === false && (
                        <>
                          <label className="block text-xs font-medium mb-1">Véhicule</label>
                          <Dropdown value={ligne.voitureId} onChange={e => majLigne(index, { voitureId: e.value })}
                            options={voitures} optionLabel="immatriculation" optionValue="id" filter
                            placeholder="Sélectionner un véhicule" className="w-full" />
                        </>
                      )}
                    </div>
                    <div className="col-12 md:col-1 flex md:justify-content-center">
                      {lignes.length > 1 && (
                        <Button icon="pi pi-trash" text severity="danger" size="small" onClick={() => retirerLigne(index)} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && <Message severity="error" text={error} className="w-full" />}
        </div>
      </Dialog>
    </div>
  )
}

export default function MissionsPage() {
  return (
    <ProtectedRoute allowedRoles={TOUS_ROLES}>
      <MissionsContent />
    </ProtectedRoute>
  )
}
