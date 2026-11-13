'use client'
import { useEffect, useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { Calendar } from 'primereact/calendar'
import { Column } from 'primereact/column'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { DataTable } from 'primereact/datatable'
import { Dialog } from 'primereact/dialog'
import { Dropdown } from 'primereact/dropdown'
import { InputNumber } from 'primereact/inputnumber'
import { InputText } from 'primereact/inputtext'
import { Message } from 'primereact/message'
import { Tag } from 'primereact/tag'
import { Toast } from 'primereact/toast'
import { useAxeStore } from './useAxeStore'
import { useCampagneStore } from './useCampagneStore'
import type { Campagne, Mission } from './types'

interface Props { peutGerer: boolean }

interface MissionLigne {
  cle: number
  axeId: string
  dateDebut: Date | null
  dateFin: Date | null
  agentIds: string[]
  nombreTickets: number | null
}

const ligneVide = (): MissionLigne =>
  ({ cle: Date.now() + Math.random(), axeId: '', dateDebut: null, dateFin: null, agentIds: [], nombreTickets: null })

const toIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const fromIso = (s: string) => s ? new Date(s) : null
// Comparaison de dates au format ISO (yyyy-mm-dd) : l'ordre lexicographique suit l'ordre chronologique.
const chevauche = (debutA: string, finA: string, debutB: string, finB: string) => !(finA < debutB || debutA > finB)

// Sélection multiple par pastilles (pills) à cocher — chaque agent est un bouton arrondi avec une
// icône ronde (pleine + coche quand sélectionné), plutôt qu'un menu déroulant classique.
function SelectionAgents({ options, value, onChange, disabled }: {
  options: { label: string; value: string }[]
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
}) {
  const [recherche, setRecherche] = useState('')
  const visibles = recherche.trim()
    ? options.filter(o => o.label.toLowerCase().includes(recherche.trim().toLowerCase()))
    : options

  const basculer = (v: string) => {
    if (disabled) return
    onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v])
  }

  return (
    <div>
      {!disabled && options.length > 6 && (
        <InputText value={recherche} onChange={e => setRecherche(e.target.value)}
          placeholder="Rechercher un agent…" className="w-full mb-2" />
      )}
      <div className={`flex flex-wrap gap-2 p-2 border-1 border-300 border-round ${disabled ? 'opacity-50' : ''}`}
        style={{ maxHeight: '13rem', overflowY: 'auto' }}>
        {visibles.length === 0 && <span className="text-color-secondary text-sm p-1">Aucun agent</span>}
        {visibles.map(o => {
          const actif = value.includes(o.value)
          return (
            <button key={o.value} type="button" disabled={disabled} onClick={() => basculer(o.value)}
              className="flex align-items-center gap-2 text-sm font-medium"
              style={{
                borderRadius: '9999px', border: '1px solid', padding: '0.4rem 0.85rem',
                cursor: disabled ? 'not-allowed' : 'pointer', transition: 'background-color .15s, border-color .15s, color .15s',
                borderColor: actif ? 'var(--primary-color)' : 'var(--surface-300)',
                backgroundColor: actif ? 'var(--primary-color)' : 'var(--surface-0)',
                color: actif ? 'var(--primary-color-text)' : 'var(--text-color)',
              }}>
              <i className={actif ? 'pi pi-check-circle' : 'pi pi-circle'} />
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function CampagnesTab({ peutGerer }: Props) {
  const toast = useRef<Toast>(null)
  const { axes, fetchAxes } = useAxeStore()
  const {
    campagnes, campagnesEnCours, campagnesActives, agents, loading, actionLoadingId, error,
    fetchCampagnes, fetchCampagnesEnCours, fetchCampagnesActives, fetchAgents,
    creer, modifier, supprimer, ajouterMissions, modifierMission, supprimerMission, clearError,
  } = useCampagneStore()

  const [globalFilter, setGlobalFilter] = useState('')
  const [detailTarget, setDetailTarget] = useState<Campagne | null>(null)

  // ── Campagne (en-tête) ──
  const [campagneDialogOpen, setCampagneDialogOpen] = useState(false)
  const [editingCampagne, setEditingCampagne] = useState<Campagne | null>(null)
  const [nom, setNom] = useState('')
  const [campagneDateDebut, setCampagneDateDebut] = useState<Date | null>(null)
  const [campagneDateFin, setCampagneDateFin] = useState<Date | null>(null)
  const [errCampagne, setErrCampagne] = useState('')
  const [savingCampagne, setSavingCampagne] = useState(false)

  // ── Mission : modification unitaire d'une mission existante ──
  const [missionDialogOpen, setMissionDialogOpen] = useState(false)
  const [campagneCibleId, setCampagneCibleId] = useState('')
  const [editingMission, setEditingMission] = useState<Mission | null>(null)
  const [axeId, setAxeId] = useState('')
  const [missionDateDebut, setMissionDateDebut] = useState<Date | null>(null)
  const [missionDateFin, setMissionDateFin] = useState<Date | null>(null)
  const [agentIds, setAgentIds] = useState<string[]>([])
  const [nombreTickets, setNombreTickets] = useState<number | null>(null)
  // ── Mission(s) : ajout, une ou plusieurs lignes à la fois sur une campagne en cours ──
  const [missionLignes, setMissionLignes] = useState<MissionLigne[]>([ligneVide()])
  const [errMission, setErrMission] = useState('')
  const [savingMission, setSavingMission] = useState(false)

  useEffect(() => { fetchCampagnes(); fetchCampagnesEnCours(); fetchCampagnesActives(); fetchAgents(); fetchAxes() }, [])

  // ── Disponibilité d'un axe / d'un agent sur une période donnée, pour filtrer les listes
  // déroulantes : on exclut ce qui est déjà pris par une mission existante (campagnes actives,
  // hors la mission en cours de modification) ou par une autre ligne du même lot en cours de saisie.
  const missionsExistantes = (excludeMissionId?: string) =>
    campagnesActives.flatMap(c => c.missions.filter(m => m.id !== excludeMissionId))

  const axesIndisponibles = (debut: Date | null, fin: Date | null, excludeMissionId?: string, autresLignes: MissionLigne[] = []): Set<string> => {
    const ids = new Set<string>()
    if (!debut || !fin) return ids
    const d = toIso(debut), f = toIso(fin)
    missionsExistantes(excludeMissionId).forEach(m => { if (chevauche(d, f, m.dateDebut, m.dateFin)) ids.add(m.axeId) })
    autresLignes.forEach(l => { if (l.axeId && l.dateDebut && l.dateFin && chevauche(d, f, toIso(l.dateDebut), toIso(l.dateFin))) ids.add(l.axeId) })
    return ids
  }

  const agentsIndisponibles = (debut: Date | null, fin: Date | null, excludeMissionId?: string, autresLignes: MissionLigne[] = []): Set<string> => {
    const ids = new Set<string>()
    if (!debut || !fin) return ids
    const d = toIso(debut), f = toIso(fin)
    missionsExistantes(excludeMissionId).forEach(m => { if (chevauche(d, f, m.dateDebut, m.dateFin)) (m.agentIds ?? []).forEach(id => ids.add(id)) })
    autresLignes.forEach(l => { if (l.dateDebut && l.dateFin && chevauche(d, f, toIso(l.dateDebut), toIso(l.dateFin))) l.agentIds.forEach(id => ids.add(id)) })
    return ids
  }

  // ── Campagne : créer / modifier ──
  const openCreateCampagne = () => {
    setEditingCampagne(null)
    setNom(''); setCampagneDateDebut(null); setCampagneDateFin(null); setErrCampagne(''); clearError()
    setCampagneDialogOpen(true)
  }
  const openEditCampagne = (c: Campagne) => {
    setEditingCampagne(c)
    setNom(c.nom); setCampagneDateDebut(fromIso(c.dateDebut)); setCampagneDateFin(fromIso(c.dateFin))
    setErrCampagne(''); clearError()
    setCampagneDialogOpen(true)
  }
  const campagneValide = !!nom.trim() && !!campagneDateDebut && !!campagneDateFin
  const soumettreCampagne = async () => {
    if (!campagneValide || !campagneDateDebut || !campagneDateFin) { setErrCampagne('Veuillez compléter le nom et les deux dates'); return }
    setSavingCampagne(true); setErrCampagne('')
    try {
      const payload = { nom: nom.trim(), dateDebut: toIso(campagneDateDebut), dateFin: toIso(campagneDateFin) }
      if (editingCampagne) await modifier(editingCampagne.id, payload)
      else await creer(payload)
      toast.current?.show({ severity: 'success', summary: 'Office du Bac', detail: editingCampagne ? 'Campagne modifiée' : 'Campagne créée', life: 4000 })
      setCampagneDialogOpen(false)
    } catch (e: any) {
      setErrCampagne(e?.response?.data?.errorMessage ?? e?.response?.data?.message ?? 'Erreur lors de l\'enregistrement')
    } finally {
      setSavingCampagne(false)
    }
  }

  const confirmSupprimerCampagne = (c: Campagne) => {
    confirmDialog({
      message: `Désactiver la campagne "${c.nom}" ? Elle n'apparaîtra plus dans les listes actives.`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Désactiver',
      acceptClassName: 'p-button-danger',
      rejectLabel: 'Annuler',
      accept: async () => {
        try {
          await supprimer(c.id)
          toast.current?.show({ severity: 'success', summary: 'Office du Bac', detail: 'Campagne désactivée', life: 4000 })
        } catch {
          toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Suppression impossible', life: 4000 })
        }
      },
    })
  }

  // ── Mission : d'abord choisir la campagne (parmi celles en cours), puis une ou plusieurs lignes d'axe ──
  const openCreateMission = (campagneId?: string) => {
    setEditingMission(null)
    setCampagneCibleId(campagneId ?? '')
    setMissionLignes([ligneVide()])
    setErrMission(''); clearError()
    setMissionDialogOpen(true)
  }
  const openEditMission = (campagneId: string, mission: Mission) => {
    setEditingMission(mission)
    setCampagneCibleId(campagneId)
    setAxeId(mission.axeId); setMissionDateDebut(fromIso(mission.dateDebut)); setMissionDateFin(fromIso(mission.dateFin))
    setAgentIds(mission.agentIds); setNombreTickets(mission.nombreTickets ?? null)
    setErrMission(''); clearError()
    setMissionDialogOpen(true)
  }

  const majLigne = (cle: number, champs: Partial<MissionLigne>) =>
    setMissionLignes(lignes => lignes.map(l => l.cle === cle ? { ...l, ...champs } : l))
  const ajouterLigne = () => setMissionLignes(lignes => [...lignes, ligneVide()])
  const retirerLigne = (cle: number) => setMissionLignes(lignes => lignes.length > 1 ? lignes.filter(l => l.cle !== cle) : lignes)

  const missionValide = editingMission
    ? !!campagneCibleId && !!axeId && !!missionDateDebut && !!missionDateFin && !!nombreTickets && nombreTickets >= 1
    : !!campagneCibleId && missionLignes.length > 0
      && missionLignes.every(l => !!l.axeId && !!l.dateDebut && !!l.dateFin && !!l.nombreTickets && l.nombreTickets >= 1)

  const soumettreMission = async () => {
    if (!missionValide) { setErrMission(editingMission ? 'Veuillez choisir la campagne, l\'axe, les deux dates et le nombre de tickets' : 'Veuillez choisir la campagne et compléter chaque ligne (axe, dates et nombre de tickets)'); return }
    setSavingMission(true); setErrMission('')
    try {
      if (editingMission) {
        if (!missionDateDebut || !missionDateFin) return
        const payload = {
          axeId, dateDebut: toIso(missionDateDebut), dateFin: toIso(missionDateFin),
          agentIds, nombreTickets: nombreTickets as number,
        }
        await modifierMission(campagneCibleId, editingMission.id, payload)
        toast.current?.show({ severity: 'success', summary: 'Office du Bac', detail: 'Mission modifiée', life: 4000 })
      } else {
        const payloads = missionLignes.map(l => ({
          axeId: l.axeId, dateDebut: toIso(l.dateDebut as Date), dateFin: toIso(l.dateFin as Date),
          agentIds: l.agentIds, nombreTickets: l.nombreTickets as number,
        }))
        await ajouterMissions(campagneCibleId, payloads)
        toast.current?.show({ severity: 'success', summary: 'Office du Bac', detail: payloads.length > 1 ? 'Missions ajoutées' : 'Mission ajoutée', life: 4000 })
      }
      setMissionDialogOpen(false)
    } catch (e: any) {
      setErrMission(e?.response?.data?.errorMessage ?? e?.response?.data?.message ?? 'Erreur lors de l\'enregistrement')
    } finally {
      setSavingMission(false)
    }
  }

  const confirmSupprimerMission = (campagneId: string, mission: Mission) => {
    confirmDialog({
      message: `Retirer la mission sur l'axe ${mission.axeNumero} de cette campagne ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Retirer',
      acceptClassName: 'p-button-danger',
      rejectLabel: 'Annuler',
      accept: async () => {
        try {
          await supprimerMission(campagneId, mission.id)
          toast.current?.show({ severity: 'success', summary: 'Office du Bac', detail: 'Mission retirée', life: 4000 })
        } catch {
          toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Suppression impossible', life: 4000 })
        }
      },
    })
  }

  const nomBody = (c: Campagne) => <span className="font-medium">{c.nom}</span>
  const periodeBody = (c: Campagne) =>
    `${new Date(c.dateDebut).toLocaleDateString('fr-FR')} → ${new Date(c.dateFin).toLocaleDateString('fr-FR')}`
  const nbMissionsBody = (c: Campagne) => <Tag severity="info" value={`${c.missions.length} mission(s)`} />
  const actionsBody = (c: Campagne) => (
    <div className="flex gap-1 justify-content-center">
      <Button icon="pi pi-eye" text rounded size="small" tooltip="Voir le détail" onClick={() => setDetailTarget(c)} />
      {peutGerer && (
        <>
          <Button icon="pi pi-plus" text rounded size="small" tooltip="Ajouter une mission" onClick={() => openCreateMission(c.id)} />
          <Button icon="pi pi-pencil" text rounded size="small" tooltip="Modifier" onClick={() => openEditCampagne(c)} />
          <Button icon="pi pi-trash" text rounded severity="danger" size="small" tooltip="Désactiver"
            loading={actionLoadingId === c.id} onClick={() => confirmSupprimerCampagne(c)} />
        </>
      )}
    </div>
  )

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <p className="text-color-secondary m-0">
          Une campagne (ex. «&nbsp;Campagne de ramassage malles 2026&nbsp;») a sa propre période ; on y ajoute ensuite des missions — chacune affecte un axe avec ses agents et son nombre de tickets, sur sa propre période
        </p>
        {peutGerer && (
          <div className="flex gap-2">
            <Button label="Nouvelle mission" icon="pi pi-plus" outlined onClick={() => openCreateMission()} />
            <Button label="Nouvelle campagne" icon="pi pi-plus" onClick={openCreateCampagne} />
          </div>
        )}
      </div>

      <DataTable value={campagnes} loading={loading} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="Aucune campagne enregistrée" responsiveLayout="scroll"
        globalFilter={globalFilter} globalFilterFields={['nom']}
        header={
          <div className="flex justify-content-end">
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Rechercher…" />
            </span>
          </div>
        }>
        <Column header="Campagne" body={nomBody} />
        <Column header="Période" body={periodeBody} />
        <Column header="Missions" body={nbMissionsBody} align="center" alignHeader="center" />
        <Column header="Actions" body={actionsBody} align="center" alignHeader="center" />
      </DataTable>

      {/* ── Détail d'une campagne (missions) ── */}
      <Dialog header={detailTarget ? detailTarget.nom : ''} visible={!!detailTarget} onHide={() => setDetailTarget(null)}
        style={{ width: '60rem' }} breakpoints={{ '960px': '90vw' }} draggable={false}>
        {detailTarget && (
          <DataTable value={detailTarget.missions} paginator rows={15} responsiveLayout="scroll"
            emptyMessage="Aucune mission pour cette campagne">
            <Column header="Axe" body={(m: Mission) => `Axe ${m.axeNumero ?? ''} — ${m.axeItineraire ?? ''}`} />
            <Column header="Période" body={(m: Mission) =>
              `${new Date(m.dateDebut).toLocaleDateString('fr-FR')} → ${new Date(m.dateFin).toLocaleDateString('fr-FR')}`} />
            <Column header="Agents" body={(m: Mission) => m.agentNoms?.join(', ') || '—'} />
            <Column header="Tickets" body={(m: Mission) => m.nombreTickets ?? '—'} align="center" alignHeader="center" />
            {peutGerer && (
              <Column header="Actions" align="center" alignHeader="center" body={(m: Mission) => (
                <div className="flex gap-1 justify-content-center">
                  <Button icon="pi pi-pencil" text rounded size="small"
                    onClick={() => { openEditMission(detailTarget.id, m); setDetailTarget(null) }} />
                  <Button icon="pi pi-trash" text rounded severity="danger" size="small"
                    loading={actionLoadingId === m.id} onClick={() => confirmSupprimerMission(detailTarget.id, m)} />
                </div>
              )} />
            )}
          </DataTable>
        )}
      </Dialog>

      {/* ── Création / modification d'une campagne ── */}
      <Dialog header={editingCampagne ? 'Modifier la campagne' : 'Nouvelle campagne'} visible={campagneDialogOpen}
        onHide={() => setCampagneDialogOpen(false)} style={{ width: '30rem' }} draggable={false}
        footer={
          <div className="flex gap-2">
            <Button label="Annuler" outlined className="flex-1" onClick={() => setCampagneDialogOpen(false)} />
            <Button label={savingCampagne ? 'Enregistrement…' : 'Enregistrer'} className="flex-1" loading={savingCampagne}
              disabled={!campagneValide} onClick={soumettreCampagne} />
          </div>
        }>
        <div className="flex flex-column gap-3">
          <div className="field">
            <label className="block text-sm font-medium mb-1">Nom de la campagne *</label>
            <InputText value={nom} onChange={e => setNom(e.target.value)} className="w-full"
              placeholder="Ex. Campagne de ramassage malles 2026" />
          </div>
          <div className="field">
            <label className="block text-sm font-medium mb-1">Date début *</label>
            <Calendar value={campagneDateDebut} dateFormat="dd/mm/yy" showIcon className="w-full"
              onChange={e => setCampagneDateDebut(e.value as Date ?? null)} />
          </div>
          <div className="field">
            <label className="block text-sm font-medium mb-1">Date fin *</label>
            <Calendar value={campagneDateFin} dateFormat="dd/mm/yy" showIcon className="w-full"
              minDate={campagneDateDebut ?? undefined} onChange={e => setCampagneDateFin(e.value as Date ?? null)} />
          </div>
          {(errCampagne || error) && <Message severity="error" text={errCampagne || error || ''} className="w-full" />}
        </div>
      </Dialog>

      {/* ── Ajout (une ou plusieurs lignes) / modification unitaire d'une mission ── */}
      <Dialog header={editingMission ? 'Modifier la mission' : 'Nouvelle(s) mission(s)'} visible={missionDialogOpen}
        onHide={() => setMissionDialogOpen(false)} style={{ width: editingMission ? '38rem' : '54rem' }}
        breakpoints={{ '960px': '90vw' }} draggable={false}
        footer={
          <div className="flex gap-2">
            <Button label="Annuler" outlined className="flex-1" onClick={() => setMissionDialogOpen(false)} />
            <Button label={savingMission ? 'Enregistrement…' : 'Enregistrer'} className="flex-1" loading={savingMission}
              disabled={!missionValide} onClick={soumettreMission} />
          </div>
        }>
        <div className="flex flex-column gap-3">
          <div className="field">
            <label className="block text-sm font-medium mb-1">Campagne (en cours) *</label>
            <Dropdown value={campagneCibleId} className="w-full" filter disabled={!!editingMission}
              options={campagnesEnCours.map(c => ({ label: c.nom, value: c.id }))}
              placeholder="Choisir une campagne en cours…"
              onChange={e => setCampagneCibleId(e.value ?? '')} />
          </div>

          {editingMission ? (() => {
            const axesIndispo = axesIndisponibles(missionDateDebut, missionDateFin, editingMission.id)
            const agentsIndispo = agentsIndisponibles(missionDateDebut, missionDateFin, editingMission.id)
            const datesChoisies = !!missionDateDebut && !!missionDateFin
            return (
            <>
              <div className="grid formgrid">
                <div className="col-6 field">
                  <label className="block text-sm font-medium mb-1">Date début *</label>
                  <Calendar value={missionDateDebut} dateFormat="dd/mm/yy" showIcon className="w-full"
                    onChange={e => setMissionDateDebut(e.value as Date ?? null)} />
                </div>
                <div className="col-6 field">
                  <label className="block text-sm font-medium mb-1">Date fin *</label>
                  <Calendar value={missionDateFin} dateFormat="dd/mm/yy" showIcon className="w-full"
                    minDate={missionDateDebut ?? undefined} onChange={e => setMissionDateFin(e.value as Date ?? null)} />
                </div>
              </div>
              <div className="field">
                <label className="block text-sm font-medium mb-1">Axe *</label>
                <Dropdown value={axeId} className="w-full" filter showClear disabled={!datesChoisies}
                  options={axes.filter(a => a.id === axeId || !axesIndispo.has(a.id))
                    .map(a => ({ label: `Axe ${a.numero} — ${a.itineraire}`, value: a.id }))}
                  placeholder={datesChoisies ? 'Choisir un axe…' : 'Choisissez d\'abord les dates'}
                  onChange={e => setAxeId(e.value ?? '')} />
              </div>
              <div className="field">
                <label className="block text-sm font-medium mb-1">Agents</label>
                <SelectionAgents disabled={!datesChoisies} value={agentIds} onChange={setAgentIds}
                  options={agents.filter(a => agentIds.includes(a.id) || !agentsIndispo.has(a.id))
                    .map(a => ({ label: `${a.firstname ?? ''} ${a.lastname ?? ''}`.trim(), value: a.id }))} />
              </div>
              <div className="field">
                <label className="block text-sm font-medium mb-1">Nombre de tickets *</label>
                <InputNumber value={nombreTickets} min={1} className="w-full" onValueChange={e => setNombreTickets(e.value ?? null)} />
              </div>
            </>
            )
          })() : (
            <>
              {missionLignes.map((l, idx) => {
                const autresLignes = missionLignes.filter(x => x.cle !== l.cle)
                const axesIndispo = axesIndisponibles(l.dateDebut, l.dateFin, undefined, autresLignes)
                const agentsIndispo = agentsIndisponibles(l.dateDebut, l.dateFin, undefined, autresLignes)
                const datesChoisies = !!l.dateDebut && !!l.dateFin
                return (
                <div key={l.cle} className="border-1 border-300 border-round p-3 flex flex-column gap-3 relative">
                  <div className="flex align-items-center justify-content-between">
                    <span className="font-medium text-color-secondary">Mission {idx + 1}</span>
                    {missionLignes.length > 1 && (
                      <Button icon="pi pi-times" text rounded severity="danger" size="small" onClick={() => retirerLigne(l.cle)} />
                    )}
                  </div>
                  <div className="grid formgrid m-0">
                    <div className="col-6 field">
                      <label className="block text-sm font-medium mb-1">Date début *</label>
                      <Calendar value={l.dateDebut} dateFormat="dd/mm/yy" showIcon className="w-full"
                        onChange={e => majLigne(l.cle, { dateDebut: e.value as Date ?? null })} />
                    </div>
                    <div className="col-6 field">
                      <label className="block text-sm font-medium mb-1">Date fin *</label>
                      <Calendar value={l.dateFin} dateFormat="dd/mm/yy" showIcon className="w-full"
                        minDate={l.dateDebut ?? undefined} onChange={e => majLigne(l.cle, { dateFin: e.value as Date ?? null })} />
                    </div>
                  </div>
                  <div className="field m-0">
                    <label className="block text-sm font-medium mb-1">Axe *</label>
                    <Dropdown value={l.axeId} className="w-full" filter showClear disabled={!datesChoisies}
                      options={axes.filter(a => a.id === l.axeId || !axesIndispo.has(a.id))
                        .map(a => ({ label: `Axe ${a.numero} — ${a.itineraire}`, value: a.id }))}
                      placeholder={datesChoisies ? 'Choisir un axe…' : 'Choisissez d\'abord les dates'}
                      onChange={e => majLigne(l.cle, { axeId: e.value ?? '' })} />
                  </div>
                  <div className="field m-0">
                    <label className="block text-sm font-medium mb-1">Agents</label>
                    <SelectionAgents disabled={!datesChoisies} value={l.agentIds}
                      onChange={ids => majLigne(l.cle, { agentIds: ids })}
                      options={agents.filter(a => l.agentIds.includes(a.id) || !agentsIndispo.has(a.id))
                        .map(a => ({ label: `${a.firstname ?? ''} ${a.lastname ?? ''}`.trim(), value: a.id }))} />
                  </div>
                  <div className="field m-0">
                    <label className="block text-sm font-medium mb-1">Nombre de tickets *</label>
                    <InputNumber value={l.nombreTickets} min={1} className="w-full"
                      onValueChange={e => majLigne(l.cle, { nombreTickets: e.value ?? null })} />
                  </div>
                </div>
                )
              })}
              <Button label="Ajouter une ligne" icon="pi pi-plus" outlined onClick={ajouterLigne} />
            </>
          )}
          {(errMission || error) && <Message severity="error" text={errMission || error || ''} className="w-full" />}
        </div>
      </Dialog>
    </div>
  )
}
