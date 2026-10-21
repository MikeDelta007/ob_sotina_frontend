'use client'
import { aUnDesRoles } from '@/app/rolesUtilisateur'
import Link from 'next/link'
import { useContext, useEffect, useRef, useState } from 'react'
import ProtectedRoute from '@/layout/ProtectedRoute'
import { UserContext } from '@/app/userContext'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { Dropdown } from 'primereact/dropdown'
import { MultiSelect } from 'primereact/multiselect'
import { Calendar } from 'primereact/calendar'
import { InputText } from 'primereact/inputtext'
import { Tag } from 'primereact/tag'
import { Message } from 'primereact/message'
import { Toast } from 'primereact/toast'
import { ParametrageService } from '@/demo/service/ParametrageService'
import axiosInstance from '@/app/api/axiosInstance'
import { useMissionStore } from '../useMissionStore'
import { TOUS_ROLES, fmtMoyenTransport, type MoyenTransport, type OrdreMission, type Voiture } from '../types'

const toIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

interface LigneForm {
  agentId: string | null
  moyenTransport: MoyenTransport | null
  voitureId: string | null
  voitureAgentImmat: string | null
}

const ligneVide = (): LigneForm => ({ agentId: null, moyenTransport: null, voitureId: null, voitureAgentImmat: null })

const MOYENS: { valeur: MoyenTransport; label: string }[] = [
  { valeur: 'VEHICULE_PERSONNEL', label: 'Véhicule personnel' },
  { valeur: 'VEHICULE_PARC', label: 'Véhicule du parc' },
  { valeur: 'TRANSPORT_COMMUN', label: 'Transport en commun' },
]

// Trois façons de créer un ordre de mission :
// - INDIVIDUELLE : un seul agent (une ville/une période propres à lui).
// - GROUPEE_MEME : plusieurs agents qui partagent exactement les mêmes villes et les mêmes dates
//   (un seul OrdreMission avec plusieurs lignes, comme avant).
// - GROUPEE_MOTIF : plusieurs agents qui partagent seulement le motif — chacun garde ses propres
//   villes et dates (un OrdreMission distinct est créé par agent, tous avec le même motif).
type TypeCreation = 'INDIVIDUELLE' | 'GROUPEE_MEME' | 'GROUPEE_MOTIF'

const TYPES_CREATION: { valeur: TypeCreation; label: string; description: string }[] = [
  { valeur: 'INDIVIDUELLE', label: 'Individuelle', description: 'Un seul agent, une destination, une période' },
  { valeur: 'GROUPEE_MEME', label: 'Groupée — mêmes villes et dates', description: 'Plusieurs agents, même motif, mêmes villes et mêmes dates' },
  { valeur: 'GROUPEE_MOTIF', label: 'Groupée — motif commun', description: 'Plusieurs agents, même motif, mais villes et dates propres à chacun' },
]

interface BlocForm {
  villeIds: string[]
  dateDebut: Date | null
  dateFin: Date | null
  ligne: LigneForm
}
const blocVide = (): BlocForm => ({ villeIds: [], dateDebut: null, dateFin: null, ligne: ligneVide() })

// Sélection agent + moyen de transport, réutilisée pour une "ligne" (mode groupé mêmes villes/dates)
// comme pour un "bloc" (mode groupé motif commun).
function AgentTransportPicker({ ligne, agents, voitures, onChangeAgent, onChangeMoyen, onChangeVoiture }: {
  ligne: LigneForm
  agents: { label: string; value: string }[]
  voitures: Voiture[]
  onChangeAgent: (agentId: string) => void
  onChangeMoyen: (m: MoyenTransport) => void
  onChangeVoiture: (voitureId: string) => void
}) {
  return (
    <>
      <div className="md:tw-col-span-4">
        <label className="tw-mb-1 tw-block tw-text-xs tw-font-medium tw-text-gray-600">Agent</label>
        <Dropdown value={ligne.agentId} onChange={e => onChangeAgent(e.value)} options={agents}
          filter placeholder="Sélectionner un agent" className="w-full" />
      </div>
      <div className="md:tw-col-span-6">
        <label className="tw-mb-1 tw-block tw-text-xs tw-font-medium tw-text-gray-600">Moyen de transport</label>
        <div className="tw-flex tw-flex-wrap tw-gap-2">
          {MOYENS.map(m => {
            const indisponible = m.valeur === 'VEHICULE_PERSONNEL' && !ligne.voitureAgentImmat
            const actif = ligne.moyenTransport === m.valeur
            return (
              <button key={m.valeur} type="button" disabled={!ligne.agentId || indisponible}
                onClick={() => onChangeMoyen(m.valeur)}
                className={`tw-rounded-full tw-border tw-px-3 tw-py-1 tw-text-xs tw-font-medium tw-transition disabled:tw-cursor-not-allowed disabled:tw-opacity-40 ${actif ? 'tw-border-blue-600 tw-bg-blue-600 tw-text-white' : 'tw-border-gray-300 tw-bg-white tw-text-gray-700 hover:tw-bg-gray-100'}`}>
                {m.label}
              </button>
            )
          })}
        </div>
        {ligne.moyenTransport === 'VEHICULE_PERSONNEL' && ligne.voitureAgentImmat && (
          <p className="tw-mt-2 tw-mb-0 tw-text-xs tw-text-gray-500">
            Véhicule préchargé : <span className="tw-font-semibold tw-text-gray-700">{ligne.voitureAgentImmat}</span>
          </p>
        )}
        {ligne.moyenTransport === 'VEHICULE_PARC' && (
          <Dropdown value={ligne.voitureId} onChange={e => onChangeVoiture(e.value)}
            options={voitures} optionLabel="immatriculation" optionValue="id" filter
            placeholder="Sélectionner un véhicule" className="w-full tw-mt-2" />
        )}
      </div>
    </>
  )
}

function MissionsContent() {
  const toast = useRef<Toast>(null)
  const { user } = useContext(UserContext)
  const aRole = (r: string) => aUnDesRoles(user, [r])
  const peutGerer = aRole('CSA')
  const peutGererMotifs = aUnDesRoles(user, ['ADMIN', 'CSA', 'DIRECTEUR'])

  const {
    mesMissions, toutes, motifs, loading, actionLoadingId, error,
    fetchMesMissions, fetchToutes, fetchMotifs, creer, annuler,
    telechargerPdf, telechargerPdfGroupe, telechargerPdfIntervalle, clearError,
  } = useMissionStore()
  const [agents, setAgents] = useState<{ label: string; value: string }[]>([])
  const [voitures, setVoitures] = useState<Voiture[]>([])
  const [villes, setVilles] = useState<{ id: string; name: string }[]>([])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [typeCreation, setTypeCreation] = useState<TypeCreation>('INDIVIDUELLE')
  const [villeIds, setVilleIds] = useState<string[]>([])
  const [motifId, setMotifId] = useState('')
  const [dateDebut, setDateDebut] = useState<Date | null>(null)
  const [dateFin, setDateFin] = useState<Date | null>(null)
  const [lignes, setLignes] = useState<LigneForm[]>([ligneVide()])
  const [blocs, setBlocs] = useState<BlocForm[]>([blocVide()])
  const [globalFilter, setGlobalFilter] = useState('')
  const [selection, setSelection] = useState<OrdreMission[]>([])
  const [exportGroupeLoading, setExportGroupeLoading] = useState(false)
  const [intervalleDebut, setIntervalleDebut] = useState<Date | null>(null)
  const [intervalleFin, setIntervalleFin] = useState<Date | null>(null)
  const [exportIntervalleLoading, setExportIntervalleLoading] = useState(false)

  useEffect(() => {
    if (peutGerer) fetchToutes()
    else fetchMesMissions()
  }, [peutGerer])

  useEffect(() => {
    if (!peutGerer) return
    fetchMotifs()
    // Les agents de mission viennent toujours du personnel (/personnel/personnels/all), qu'ils
    // aient ou non un compte applicatif — jamais des comptes User.
    axiosInstance.get('personnel/personnels/all').then(({ data }) => {
      const agentsActifs = (data as any[]).filter(p => p.actif)
        .map(p => ({ label: `${p.firstname} ${p.lastname}`, value: p.id }))
      setAgents(agentsActifs)
    }).catch(() => setAgents([]))
    axiosInstance.get('personnel/voitures').then(({ data }) => setVoitures(data)).catch(() => {})
    ParametrageService.getVilles().then((data: { id: string; name: string }[]) => setVilles(data ?? [])).catch(() => setVilles([]))
  }, [peutGerer])

  const vehiculeDeLAgent = (agentId: string) => voitures.find(v =>
    (v.proprietaireType === 'AGENT' && v.proprietaireAgentId === agentId)
    || (v.proprietaireType === 'EXTERNE' && v.proprietairePersonnelId === agentId))

  const openCreate = () => {
    setTypeCreation('INDIVIDUELLE')
    setVilleIds([]); setMotifId(''); setDateDebut(null); setDateFin(null); setLignes([ligneVide()])
    setBlocs([blocVide()])
    setSelection([])
    clearError()
    setDialogOpen(true)
  }

  const changerType = (t: TypeCreation) => {
    setTypeCreation(t)
    if (t === 'INDIVIDUELLE') setLignes([ligneVide()])
  }

  const majLigne = (index: number, patch: Partial<LigneForm>) => {
    setLignes(prev => prev.map((l, i) => i === index ? { ...l, ...patch } : l))
  }
  const choisirAgent = (index: number, agentId: string) => {
    const vehicule = vehiculeDeLAgent(agentId)
    majLigne(index, {
      agentId,
      moyenTransport: vehicule ? 'VEHICULE_PERSONNEL' : null,
      voitureId: null,
      voitureAgentImmat: vehicule?.immatriculation ?? null,
    })
  }
  const ajouterLigne = () => setLignes(prev => [...prev, ligneVide()])
  const retirerLigne = (index: number) => setLignes(prev => prev.length > 1 ? prev.filter((_, i) => i !== index) : prev)

  const majBloc = (index: number, patch: Partial<BlocForm>) => setBlocs(prev => prev.map((b, i) => i === index ? { ...b, ...patch } : b))
  const majBlocLigne = (index: number, patch: Partial<LigneForm>) => majBloc(index, { ligne: { ...blocs[index].ligne, ...patch } })
  const choisirAgentBloc = (index: number, agentId: string) => {
    const vehicule = vehiculeDeLAgent(agentId)
    majBlocLigne(index, {
      agentId,
      moyenTransport: vehicule ? 'VEHICULE_PERSONNEL' : null,
      voitureId: null,
      voitureAgentImmat: vehicule?.immatriculation ?? null,
    })
  }
  const ajouterBloc = () => setBlocs(prev => [...prev, blocVide()])
  const retirerBloc = (index: number) => setBlocs(prev => prev.length > 1 ? prev.filter((_, i) => i !== index) : prev)

  const ligneValide = (l: LigneForm) => !!l.agentId && !!l.moyenTransport
    && (l.moyenTransport !== 'VEHICULE_PARC' || !!l.voitureId)
  const blocValide = (b: BlocForm) => b.villeIds.length > 0 && !!b.dateDebut && !!b.dateFin && ligneValide(b.ligne)

  const peutSoumettre = typeCreation === 'GROUPEE_MOTIF'
    ? !!motifId && blocs.length > 0 && blocs.every(blocValide)
    : villeIds.length > 0 && !!motifId && !!dateDebut && !!dateFin
      && lignes.length > 0 && lignes.every(ligneValide)

  const submit = async () => {
    if (!peutSoumettre) return
    try {
      if (typeCreation === 'GROUPEE_MOTIF') {
        for (const bloc of blocs) {
          await creer({
            villeIds: bloc.villeIds,
            motifId,
            dateDebut: toIso(bloc.dateDebut as Date),
            dateFin: toIso(bloc.dateFin as Date),
            lignes: [{
              agentId: bloc.ligne.agentId as string,
              moyenTransport: bloc.ligne.moyenTransport as MoyenTransport,
              voitureId: bloc.ligne.moyenTransport === 'VEHICULE_PARC' ? bloc.ligne.voitureId : null,
            }],
          })
        }
        toast.current?.show({ severity: 'success', summary: 'Office du Bac', detail: `${blocs.length} ordre(s) de mission créé(s)`, life: 4000 })
      } else {
        if (!dateDebut || !dateFin) return
        await creer({
          villeIds,
          motifId,
          dateDebut: toIso(dateDebut),
          dateFin: toIso(dateFin),
          lignes: lignes.map(l => ({
            agentId: l.agentId as string,
            moyenTransport: l.moyenTransport as MoyenTransport,
            voitureId: l.moyenTransport === 'VEHICULE_PARC' ? l.voitureId : null,
          })),
        })
        toast.current?.show({ severity: 'success', summary: 'Office du Bac', detail: 'Ordre de mission créé', life: 4000 })
      }
      setDialogOpen(false)
    } catch { /* error déjà affiché via le store */ }
  }

  const doAnnuler = async (m: OrdreMission) => {
    try {
      await annuler(m.id)
      toast.current?.show({ severity: 'success', summary: 'Office du Bac', detail: 'Ordre de mission annulé', life: 4000 })
    } catch { /* error déjà affiché via le store */ }
  }

  const doTelecharger = async (m: OrdreMission) => {
    await telechargerPdf(m.id)
  }

  const exporterSelection = async () => {
    if (selection.length === 0) return
    setExportGroupeLoading(true)
    try {
      await telechargerPdfGroupe(selection.map(s => s.id))
    } catch { /* error déjà affiché via le store */ }
    finally { setExportGroupeLoading(false) }
  }

  const exporterIntervalle = async () => {
    if (!intervalleDebut || !intervalleFin) return
    setExportIntervalleLoading(true)
    try {
      await telechargerPdfIntervalle(toIso(intervalleDebut), toIso(intervalleFin))
    } catch { /* error déjà affiché via le store */ }
    finally { setExportIntervalleLoading(false) }
  }

  const memeVilles = (a: string[], b: string[]) => a.length === b.length && [...a].sort().every((v, i) => v === [...b].sort()[i])
  const selectionExportable = selection.length > 0 && selection.every(s =>
    s.dateDebut === selection[0].dateDebut && s.dateFin === selection[0].dateFin
    && s.motifId === selection[0].motifId && memeVilles(s.villeIds, selection[0].villeIds))

  const dateBody = (m: OrdreMission) => (
    <span>{new Date(m.dateDebut).toLocaleDateString('fr-FR')} → {new Date(m.dateFin).toLocaleDateString('fr-FR')}</span>
  )
  const villesBody = (m: OrdreMission) => (m.villeNoms ?? []).join(', ')
  const agentsBody = (m: OrdreMission) => (m.lignes ?? []).map(l => l.agentNom).filter(Boolean).join(', ')
  const vehiculesBody = (m: OrdreMission) => (m.lignes ?? [])
    .map(l => l.moyenTransport === 'TRANSPORT_COMMUN' ? 'Transport en commun' : l.voitureImmatriculation)
    .filter(Boolean).join(', ')
  const statutBody = (m: OrdreMission) => m.annule
    ? <Tag severity="danger" value="Annulé" />
    : <Tag severity="success" value="Actif" />
  const actionsBody = (m: OrdreMission) => (
    <div className="tw-flex tw-justify-center tw-gap-2">
      <Button icon="pi pi-file-pdf" severity="secondary" size="small" outlined
        loading={actionLoadingId === m.id} onClick={() => doTelecharger(m)} tooltip="Télécharger le PDF" />
      {!m.annule && (
        <Button label="Annuler" icon="pi pi-times" severity="danger" size="small" outlined
          loading={actionLoadingId === m.id} onClick={() => doAnnuler(m)} />
      )}
    </div>
  )

  const data = peutGerer ? toutes : mesMissions

  const agentDejaChoisiAilleurs = (index: number, agentId: string | null) =>
    !!agentId && lignes.some((l, i) => i !== index && l.agentId === agentId)
  const agentDejaChoisiDansBlocs = (index: number, agentId: string | null) =>
    !!agentId && blocs.some((b, i) => i !== index && b.ligne.agentId === agentId)

  // Sélection pour l'export groupé — case à cocher Tailwind maison (pas le composant checkbox de PrimeReact).
  const estSelectionne = (m: OrdreMission) => selection.some(s => s.id === m.id)
  const toggleSelection = (m: OrdreMission) =>
    setSelection(prev => estSelectionne(m) ? prev.filter(s => s.id !== m.id) : [...prev, m])
  const toutSelectionne = data.length > 0 && data.every(estSelectionne)
  const toggleToutSelectionner = () => setSelection(toutSelectionne ? [] : [...data])

  const selectionHeader = (
    <input type="checkbox" className="tw-h-4 tw-w-4 tw-accent-blue-600 tw-cursor-pointer"
      checked={toutSelectionne} onChange={toggleToutSelectionner} aria-label="Tout sélectionner" />
  )
  const selectionBody = (m: OrdreMission) => (
    <input type="checkbox" className="tw-h-4 tw-w-4 tw-accent-blue-600 tw-cursor-pointer"
      checked={estSelectionne(m)} onChange={() => toggleSelection(m)} aria-label="Sélectionner cet ordre" />
  )

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
        <div className="tw-flex tw-items-center tw-gap-2">
          {peutGererMotifs && (
            <Link href="/personnel/missions/motifs">
              <Button label="Motifs" icon="pi pi-list" outlined />
            </Link>
          )}
          {peutGerer && (
            <Button label={exportGroupeLoading ? 'Export…' : 'Exporter la sélection (PDF)'} icon="pi pi-file-pdf"
              outlined disabled={!selectionExportable || exportGroupeLoading} loading={exportGroupeLoading}
              onClick={exporterSelection} />
          )}
          {peutGerer && <Button label="Créer un ordre de mission" icon="pi pi-plus" onClick={openCreate} />}
        </div>
      </div>

      {peutGerer && selection.length > 0 && !selectionExportable && (
        <div className="tw-mb-3">
          <Message severity="warn" text="La sélection ne peut être exportée en un seul PDF que si tous les ordres partagent les mêmes dates, le même motif et les mêmes villes." className="w-full" />
        </div>
      )}

      {peutGerer && (
        <div className="tw-mb-4 tw-flex tw-flex-wrap tw-items-end tw-gap-3 tw-rounded-lg tw-border tw-border-gray-200 tw-bg-gray-50 tw-p-3">
          <div>
            <label className="tw-mb-1 tw-block tw-text-xs tw-font-medium tw-text-gray-600">Exporter par intervalle — du</label>
            <Calendar value={intervalleDebut} onChange={e => setIntervalleDebut(e.value as Date)} dateFormat="dd/mm/yy" showIcon />
          </div>
          <div>
            <label className="tw-mb-1 tw-block tw-text-xs tw-font-medium tw-text-gray-600">au</label>
            <Calendar value={intervalleFin} onChange={e => setIntervalleFin(e.value as Date)} dateFormat="dd/mm/yy" showIcon minDate={intervalleDebut ?? undefined} />
          </div>
          <Button label={exportIntervalleLoading ? 'Export…' : 'Exporter l\'intervalle (PDF)'} icon="pi pi-file-pdf" outlined
            disabled={!intervalleDebut || !intervalleFin || exportIntervalleLoading} loading={exportIntervalleLoading}
            onClick={exporterIntervalle} />
          <p className="tw-m-0 tw-text-xs tw-text-gray-500">
            Regroupe dans un même PDF tous les ordres actifs dont la date de début tombe dans cet intervalle (motifs et villes peuvent différer).
          </p>
        </div>
      )}

      <DataTable value={data} loading={loading} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="Aucun ordre de mission" responsiveLayout="scroll" dataKey="id"
        globalFilter={globalFilter} globalFilterFields={['motifLibelle']}
        header={
          <div className="flex justify-content-end">
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Rechercher…" />
            </span>
          </div>
        }>
        {peutGerer && <Column header={selectionHeader} body={selectionBody} headerStyle={{ width: '3rem' }} style={{ width: '3rem' }} align="center" alignHeader="center" />}
        {peutGerer && <Column header="Agents" body={agentsBody} />}
        <Column header="Véhicules" body={vehiculesBody} />
        <Column header="Destination" body={villesBody} />
        <Column header="Motif" field="motifLibelle" />
        <Column header="Période" body={dateBody} />
        <Column header="Statut" body={statutBody} align="center" alignHeader="center" />
        {peutGerer && <Column header="Actions" body={actionsBody} align="center" alignHeader="center" />}
      </DataTable>

      <Dialog header={
        typeCreation === 'INDIVIDUELLE' ? 'Créer un ordre de mission individuel'
          : typeCreation === 'GROUPEE_MEME' ? 'Créer un ordre de mission groupé'
          : 'Créer des ordres de mission groupés (motif commun)'
      } visible={dialogOpen} onHide={() => setDialogOpen(false)}
        style={{ width: '56rem' }} draggable={false}
        footer={
          <div className="flex gap-2">
            <Button label="Annuler" outlined className="flex-1" onClick={() => setDialogOpen(false)} />
            <Button label={loading ? 'Création…' : 'Créer'} className="flex-1" loading={loading}
              disabled={!peutSoumettre} onClick={submit} />
          </div>
        }>
        <div className="flex flex-column gap-3">
          <div>
            <label className="tw-mb-1 tw-block tw-text-sm tw-font-medium tw-text-gray-700">Type de mission</label>
            <div className="tw-flex tw-flex-wrap tw-gap-2">
              {TYPES_CREATION.map(t => {
                const actif = typeCreation === t.valeur
                return (
                  <button key={t.valeur} type="button" onClick={() => changerType(t.valeur)}
                    className={`tw-rounded-lg tw-border tw-px-3 tw-py-2 tw-text-left tw-text-xs tw-transition ${actif ? 'tw-border-blue-600 tw-bg-blue-50' : 'tw-border-gray-300 tw-bg-white hover:tw-bg-gray-50'}`}>
                    <div className={`tw-font-semibold ${actif ? 'tw-text-blue-700' : 'tw-text-gray-700'}`}>{t.label}</div>
                    <div className="tw-mt-0.5 tw-text-gray-500">{t.description}</div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid">
            <div className={typeCreation === 'GROUPEE_MOTIF' ? 'col-12' : 'col-12 md:col-6'}>
              <label className="block text-sm font-medium mb-1">Motif</label>
              <Dropdown value={motifId} onChange={e => setMotifId(e.value)} options={motifs}
                optionLabel="libelle" optionValue="id" filter placeholder="Sélectionner un motif" className="w-full" />
            </div>
            {typeCreation !== 'GROUPEE_MOTIF' && (
              <>
                <div className="col-12 md:col-6">
                  <label className="block text-sm font-medium mb-1">Destination (villes)</label>
                  <MultiSelect value={villeIds} onChange={e => setVilleIds(e.value)} options={villes}
                    optionLabel="name" optionValue="id" filter showSelectAll={false} selectedItemsLabel="{0} villes sélectionnées"
                    placeholder="Sélectionner une ou plusieurs villes" className="w-full"
                    panelClassName="multiselect-sans-checkbox" />
                </div>
                <div className="col-6 md:col-3">
                  <label className="block text-sm font-medium mb-1">Date de début</label>
                  <Calendar value={dateDebut} onChange={e => setDateDebut(e.value as Date)} dateFormat="dd/mm/yy" showIcon className="w-full" />
                </div>
                <div className="col-6 md:col-3">
                  <label className="block text-sm font-medium mb-1">Date de fin</label>
                  <Calendar value={dateFin} onChange={e => setDateFin(e.value as Date)} dateFormat="dd/mm/yy" showIcon className="w-full" minDate={dateDebut ?? undefined} />
                </div>
              </>
            )}
          </div>

          {typeCreation !== 'GROUPEE_MOTIF' ? (
            <div className="field">
              <div className="flex justify-content-between align-items-center mb-2">
                <label className="text-sm font-medium">Agent{typeCreation === 'GROUPEE_MEME' ? 's' : ''} et moyen de transport</label>
                {typeCreation === 'GROUPEE_MEME' && (
                  <Button label="Ajouter une ligne" icon="pi pi-plus" text size="small" onClick={ajouterLigne} />
                )}
              </div>

              <div className="tw-flex tw-flex-col tw-gap-3">
                {lignes.map((ligne, index) => (
                  <div key={index} className="tw-rounded-lg tw-border tw-border-gray-200 tw-bg-gray-50 tw-p-3">
                    <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-12 tw-gap-3 tw-items-start">
                      <AgentTransportPicker ligne={ligne} agents={agents.filter(a => !agentDejaChoisiAilleurs(index, a.value) || a.value === ligne.agentId)}
                        voitures={voitures}
                        onChangeAgent={agentId => choisirAgent(index, agentId)}
                        onChangeMoyen={m => majLigne(index, { moyenTransport: m, voitureId: null })}
                        onChangeVoiture={voitureId => majLigne(index, { voitureId })} />
                      <div className="md:tw-col-span-2 tw-flex md:tw-justify-center tw-mt-5">
                        {typeCreation === 'GROUPEE_MEME' && lignes.length > 1 && (
                          <Button icon="pi pi-trash" text severity="danger" size="small" onClick={() => retirerLigne(index)} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="field">
              <div className="flex justify-content-between align-items-center mb-2">
                <label className="text-sm font-medium">Un bloc par agent — ses propres villes, dates et transport</label>
                <Button label="Ajouter un agent" icon="pi pi-plus" text size="small" onClick={ajouterBloc} />
              </div>

              <div className="tw-flex tw-flex-col tw-gap-3">
                {blocs.map((bloc, index) => (
                  <div key={index} className="tw-rounded-lg tw-border tw-border-gray-200 tw-bg-gray-50 tw-p-3">
                    <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-12 tw-gap-3 tw-items-start">
                      <div className="md:tw-col-span-5">
                        <label className="tw-mb-1 tw-block tw-text-xs tw-font-medium tw-text-gray-600">Destination (villes)</label>
                        <MultiSelect value={bloc.villeIds} onChange={e => majBloc(index, { villeIds: e.value })} options={villes}
                          optionLabel="name" optionValue="id" filter showSelectAll={false} selectedItemsLabel="{0} villes"
                          placeholder="Villes" className="w-full" panelClassName="multiselect-sans-checkbox" />
                      </div>
                      <div className="md:tw-col-span-3">
                        <label className="tw-mb-1 tw-block tw-text-xs tw-font-medium tw-text-gray-600">Date de début</label>
                        <Calendar value={bloc.dateDebut} onChange={e => majBloc(index, { dateDebut: e.value as Date })} dateFormat="dd/mm/yy" showIcon className="w-full" />
                      </div>
                      <div className="md:tw-col-span-3">
                        <label className="tw-mb-1 tw-block tw-text-xs tw-font-medium tw-text-gray-600">Date de fin</label>
                        <Calendar value={bloc.dateFin} onChange={e => majBloc(index, { dateFin: e.value as Date })} dateFormat="dd/mm/yy" showIcon className="w-full" minDate={bloc.dateDebut ?? undefined} />
                      </div>
                      <div className="md:tw-col-span-1 tw-flex md:tw-justify-center tw-mt-5">
                        {blocs.length > 1 && (
                          <Button icon="pi pi-trash" text severity="danger" size="small" onClick={() => retirerBloc(index)} />
                        )}
                      </div>

                      <AgentTransportPicker ligne={bloc.ligne} agents={agents.filter(a => !agentDejaChoisiDansBlocs(index, a.value) || a.value === bloc.ligne.agentId)}
                        voitures={voitures}
                        onChangeAgent={agentId => choisirAgentBloc(index, agentId)}
                        onChangeMoyen={m => majBlocLigne(index, { moyenTransport: m, voitureId: null })}
                        onChangeVoiture={voitureId => majBlocLigne(index, { voitureId })} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
