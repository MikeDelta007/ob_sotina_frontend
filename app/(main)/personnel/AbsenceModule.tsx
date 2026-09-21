'use client'
import { useContext, useEffect, useRef, useState } from 'react'
import { saveAs } from 'file-saver'
import ProtectedRoute from '@/layout/ProtectedRoute'
import { UserContext } from '@/app/userContext'
import axiosInstance from '@/app/api/axiosInstance'
import { TabPanel, TabView } from 'primereact/tabview'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Calendar } from 'primereact/calendar'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { Tag } from 'primereact/tag'
import { Message } from 'primereact/message'
import { Toast } from 'primereact/toast'
import { useAbsenceStore } from './useAbsenceStore'
import { refreshNotificationCounts } from '@/layout/useNotificationCounts'
import { TOUS_ROLES, fmtStatutAbsence, fmtTypePersonnel, type DemandeAbsence, type StatutAbsence, type TypePersonnel, type TypeAbsence } from './types'

const statutSeverity: Record<StatutAbsence, 'warning' | 'success' | 'danger' | 'info'> = {
  EN_ATTENTE_CHEF: 'warning',
  EN_ATTENTE_CSA: 'warning',
  EN_ATTENTE_DIRECTEUR: 'warning',
  VALIDEE: 'success',
  REJETEE: 'danger',
}

const toIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// Détail complet de la chaîne de validation, affiché directement dans les listes (pas
// seulement dans un dialogue) : qui a validé ou rejeté à chaque étape, et pourquoi en cas de
// rejet — visible par toutes les parties concernées (agent, chef, CSA, directeur). Un rejet du
// chef ou du CSA n'arrête pas la chaîne — il reste visible ici comme avis, la décision finale
// appartient au Directeur.
const etapeLigne = (label: string, valide?: boolean, rejete?: boolean, par?: string, motif?: string) => {
  if (!valide && !rejete) return null
  return (
    <div key={label} className="text-xs">
      <span className="font-medium">{label}</span> : {valide
        ? <span className="text-green-600 font-medium">Validé</span>
        : <span className="text-red-600 font-medium">Rejeté</span>}
      {par ? ` (${par})` : ''}
      {rejete && motif && <div className="text-red-500">Motif : {motif}</div>}
    </div>
  )
}
const etapesBody = (d: DemandeAbsence) => (
  <div className="flex flex-column gap-1">
    {etapeLigne('Chef', d.validationChef, d.rejetChef, d.validateurChefNom ?? d.validateurChef, d.motifRejetChef)}
    {etapeLigne('CSA', d.validationCsa, d.rejetCsa, d.validateurCsaNom ?? d.validateurCsa, d.motifRejetCsa)}
    {etapeLigne('Directeur', d.validationDirecteur, !d.validationDirecteur && d.statut === 'REJETEE', d.validateurDirecteurNom ?? d.rejeteParNom ?? d.validateurDirecteur ?? d.rejetePar, d.motifRejet)}
  </div>
)

function MesDemandesTab({ type }: { type: TypeAbsence }) {
  const toast = useRef<Toast>(null)
  const { mesDemandes, loading, error, fetchMesDemandes, creer, clearError } = useAbsenceStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dateDebut, setDateDebut] = useState<Date | null>(null)
  const [dateFin, setDateFin] = useState<Date | null>(null)
  const [motif, setMotif] = useState('')
  const [soldeConges, setSoldeConges] = useState<number | null>(null)
  const [motifsOptions, setMotifsOptions] = useState<{ id: string; libelle: string }[]>([])
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => { fetchMesDemandes(type) }, [type])

  useEffect(() => {
    if (type !== 'AUTORISATION') return
    axiosInstance.get('demande-absence/motifs').then(({ data }) => setMotifsOptions(data)).catch(() => {})
  }, [type])

  const chargerSolde = () => {
    if (type !== 'CONGE') return
    axiosInstance.get('profile/me').then(({ data }) =>
      setSoldeConges(data.personnel?.soldeDisponible ?? data.personnel?.soldeConges ?? null)
    ).catch(() => {})
  }
  useEffect(() => { chargerSolde() }, [type])

  const openCreate = () => {
    setDateDebut(null); setDateFin(null); setMotif(''); clearError()
    chargerSolde()
    setDialogOpen(true)
  }

  const nombreJoursDemandes = dateDebut && dateFin
    ? Math.round((dateFin.getTime() - dateDebut.getTime()) / 86400000) + 1
    : 0
  const depasseSolde = type === 'CONGE' && soldeConges != null && nombreJoursDemandes > soldeConges

  // Pour un congé, la date de fin ne peut pas dépasser le solde restant à partir de la date de
  // début — les jours au-delà apparaissent grisés dans le calendrier.
  const maxDateFin = type === 'CONGE' && dateDebut && soldeConges != null
    ? new Date(dateDebut.getTime() + (soldeConges - 1) * 86400000)
    : undefined

  const motifValide = type === 'AUTORISATION' ? !!motif.trim() : true

  const submit = async () => {
    if (!dateDebut || !dateFin || !motifValide || depasseSolde) return
    try {
      await creer({ type, dateDebut: toIso(dateDebut), dateFin: toIso(dateFin), motif: motif.trim() })
      toast.current?.show({ severity: 'success', summary: 'Office du Bac', detail: 'Demande envoyée avec succès', life: 4000 })
      setDialogOpen(false)
      chargerSolde()
    } catch { /* error déjà affiché via le store */ }
  }

  const statutBody = (d: DemandeAbsence) => <Tag severity={statutSeverity[d.statut]} value={fmtStatutAbsence(d.statut)} />
  const dateBody = (d: DemandeAbsence) => (
    <span>{new Date(d.dateDebut).toLocaleDateString('fr-FR')} → {new Date(d.dateFin).toLocaleDateString('fr-FR')}</span>
  )

  return (
    <div>
      <Toast ref={toast} />
      <div className="flex justify-content-between align-items-center mb-3">
        <span className="text-color-secondary">
          {type === 'CONGE' && soldeConges != null ? `Solde de congés restant : ${soldeConges} jour(s)` : ''}
        </span>
        <Button label="Nouvelle demande" icon="pi pi-plus" onClick={openCreate} />
      </div>

      <DataTable value={mesDemandes} loading={loading} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
        emptyMessage={type === 'CONGE' ? 'Aucune demande de congés' : "Aucune demande d'autorisation d'absence"} responsiveLayout="scroll"
        globalFilter={globalFilter} globalFilterFields={['motif', 'motifRejet', 'motifRejetChef', 'motifRejetCsa', 'statut']}
        header={
          <div className="flex justify-content-end">
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Rechercher…" />
            </span>
          </div>
        }>
        <Column header="Période" body={dateBody} />
        <Column header="Jours" field="nombreJours" />
        {type === 'AUTORISATION' && <Column header="Motif" field="motif" />}
        <Column header="Statut" body={statutBody} />
        <Column header="Étapes" body={etapesBody} />
      </DataTable>

      <Dialog header={type === 'CONGE' ? 'Nouvelle demande de congés' : "Nouvelle demande d'autorisation d'absence"} visible={dialogOpen}
        onHide={() => setDialogOpen(false)} style={{ width: '30rem' }} draggable={false}
        footer={
          <div className="flex gap-2">
            <Button label="Annuler" outlined className="flex-1" onClick={() => setDialogOpen(false)} />
            <Button label={loading ? 'Envoi…' : 'Envoyer'} className="flex-1" loading={loading}
              disabled={!dateDebut || !dateFin || !motifValide || depasseSolde} onClick={submit} />
          </div>
        }>
        <div className="flex flex-column gap-3">
          {type === 'CONGE' && soldeConges != null && (
            <Message severity="info" text={`Solde de congés restant : ${soldeConges} jour(s)`} className="w-full" />
          )}
          <div className="field">
            <label className="block text-sm font-medium mb-1">Date de début</label>
            <Calendar value={dateDebut} onChange={e => setDateDebut(e.value as Date)} dateFormat="dd/mm/yy" showIcon className="w-full" />
          </div>
          <div className="field">
            <label className="block text-sm font-medium mb-1">Date de fin</label>
            <Calendar value={dateFin} onChange={e => setDateFin(e.value as Date)} dateFormat="dd/mm/yy" showIcon className="w-full"
              minDate={dateDebut ?? undefined} maxDate={maxDateFin} disabled={type === 'CONGE' && (!dateDebut || soldeConges == null)} />
          </div>
          {nombreJoursDemandes > 0 && (
            <div className={depasseSolde ? 'text-red-600 text-sm' : 'text-color-secondary text-sm'}>
              {nombreJoursDemandes} jour(s) demandé(s)
              {depasseSolde && soldeConges != null && ` — dépasse votre solde restant (${soldeConges} j.)`}
            </div>
          )}
          {type === 'AUTORISATION' && (
            <div className="field">
              <label className="block text-sm font-medium mb-1">Motif</label>
              <Dropdown value={motif} onChange={e => setMotif(e.value)} options={motifsOptions}
                optionLabel="libelle" optionValue="libelle" placeholder="Sélectionner un motif" className="w-full" />
            </div>
          )}
          {error && <Message severity="error" text={error} className="w-full" />}
        </div>
      </Dialog>
    </div>
  )
}

function AValiderTab({ type, pourAgentsDuChef = false }: { type: TypeAbsence; pourAgentsDuChef?: boolean }) {
  const toast = useRef<Toast>(null)
  const {
    aValider, demandesDeMesAgents, loading, actionLoadingId, error,
    fetchAValider, fetchDemandesDeMesAgents, valider, rejeter, clearError,
  } = useAbsenceStore()
  const [rejetDialogFor, setRejetDialogFor] = useState<DemandeAbsence | null>(null)
  const [motifRejet, setMotifRejet] = useState('')
  const [globalFilter, setGlobalFilter] = useState('')

  const demandes = pourAgentsDuChef ? demandesDeMesAgents : aValider

  useEffect(() => { pourAgentsDuChef ? fetchDemandesDeMesAgents(type) : fetchAValider(type) }, [type, pourAgentsDuChef])

  const doValider = async (d: DemandeAbsence) => {
    try {
      await valider(d.id, type)
      toast.current?.show({ severity: 'success', summary: 'Office du Bac', detail: 'Demande validée', life: 4000 })
      refreshNotificationCounts()
    } catch { /* error déjà affiché via le store */ }
  }

  const confirmValider = (d: DemandeAbsence) => {
    confirmDialog({
      message: `Confirmez-vous la validation de la demande de ${d.demandeurNom} ?`,
      header: 'Confirmation',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Valider',
      rejectLabel: 'Annuler',
      accept: () => doValider(d),
    })
  }

  const openRejet = (d: DemandeAbsence) => { setRejetDialogFor(d); setMotifRejet(''); clearError() }

  const doRejeter = async () => {
    if (!rejetDialogFor || !motifRejet.trim()) return
    try {
      await rejeter(rejetDialogFor.id, motifRejet.trim(), type)
      toast.current?.show({ severity: 'success', summary: 'Office du Bac', detail: 'Demande rejetée', life: 4000 })
      setRejetDialogFor(null)
      refreshNotificationCounts()
    } catch { /* error déjà affiché via le store */ }
  }

  const dateBody = (d: DemandeAbsence) => (
    <span>{new Date(d.dateDebut).toLocaleDateString('fr-FR')} → {new Date(d.dateFin).toLocaleDateString('fr-FR')}</span>
  )
  const statutBody = (d: DemandeAbsence) => <Tag severity={statutSeverity[d.statut]} value={fmtStatutAbsence(d.statut)} />

  // Le chef ne peut agir que sur les demandes encore à l'étape chef (vue "Demandes de mes
  // agents", qui montre tout l'historique) ; CSA/Directeur voient déjà une liste pré-filtrée
  // sur leur propre étape (aValider), donc toujours actionnable.
  const actionsBody = (d: DemandeAbsence) => {
    const actionnable = pourAgentsDuChef ? d.statut === 'EN_ATTENTE_CHEF' : true
    if (!actionnable) return null
    return (
      <div className="flex gap-2 justify-content-center">
        <Button label="Valider" icon="pi pi-check" severity="success" size="small"
          loading={actionLoadingId === d.id} onClick={() => confirmValider(d)} />
        <Button label="Rejeter" icon="pi pi-times" severity="danger" size="small" outlined
          loading={actionLoadingId === d.id} onClick={() => openRejet(d)} />
      </div>
    )
  }

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />
      <DataTable value={demandes} loading={loading} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
        emptyMessage={pourAgentsDuChef ? "Aucune demande de vos agents" : "Aucune demande en attente de votre validation"} responsiveLayout="scroll"
        globalFilter={globalFilter} globalFilterFields={['demandeurNom', 'motif', 'statut', 'motifRejetChef', 'motifRejetCsa', 'motifRejet']}
        header={
          <div className="flex justify-content-end">
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Rechercher…" />
            </span>
          </div>
        }>
        <Column header="Demandeur" field="demandeurNom" />
        <Column header="Période" body={dateBody} />
        {type === 'AUTORISATION' && <Column header="Motif" field="motif" />}
        <Column header="Étapes" body={etapesBody} />
        <Column header="Statut" body={statutBody} />
        <Column header="Actions" body={actionsBody} align="center" alignHeader="center" />
      </DataTable>

      <Dialog header="Motif du rejet" visible={!!rejetDialogFor} onHide={() => setRejetDialogFor(null)}
        style={{ width: '28rem' }} draggable={false}
        footer={
          <div className="flex gap-2">
            <Button label="Annuler" outlined className="flex-1" onClick={() => setRejetDialogFor(null)} />
            <Button label="Confirmer le rejet" severity="danger" className="flex-1"
              disabled={!motifRejet.trim()} onClick={doRejeter} />
          </div>
        }>
        <InputTextarea value={motifRejet} onChange={e => setMotifRejet(e.target.value)} rows={3} className="w-full" autoFocus />
        {error && <Message severity="error" text={error} className="w-full mt-2" />}
      </Dialog>
    </div>
  )
}

// Historique des demandes déjà traitées (VALIDEE ou REJETEE) — visible pour toute la chaîne
// (chef, CSA, directeur, admin), avec le détail de qui a validé/rejeté à chaque étape. Le
// téléchargement du PDF apparaît comme action dès qu'une AUTORISATION est validée, réservé à
// CSA/Directeur/Admin (le chef voit l'historique mais pas le bouton de téléchargement).
function DejaTraiteesTab({ type, peutTelecharger }: { type: TypeAbsence; peutTelecharger: boolean }) {
  const toast = useRef<Toast>(null)
  const { demandesTraitees, loading, fetchDemandesTraitees } = useAbsenceStore()
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => { fetchDemandesTraitees(type) }, [type])

  const telecharger = async (d: DemandeAbsence) => {
    setDownloadingId(d.id)
    try {
      const { data } = await axiosInstance.get(`demande-absence/${d.id}/autorisation.pdf`, { responseType: 'blob' })
      saveAs(data, `autorisation_absence_${d.demandeurNom.replace(/\s+/g, '_')}.pdf`)
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Office du Bac', detail: 'Téléchargement impossible', life: 4000 })
    } finally {
      setDownloadingId(null)
    }
  }

  const dateBody = (d: DemandeAbsence) => (
    <span>{new Date(d.dateDebut).toLocaleDateString('fr-FR')} → {new Date(d.dateFin).toLocaleDateString('fr-FR')}</span>
  )
  const statutBody = (d: DemandeAbsence) => <Tag severity={statutSeverity[d.statut]} value={fmtStatutAbsence(d.statut)} />
  const actionsBody = (d: DemandeAbsence) => (
    peutTelecharger && type === 'AUTORISATION' && d.statut === 'VALIDEE' && (
      <Button label="Télécharger" icon="pi pi-download" size="small"
        loading={downloadingId === d.id} onClick={() => telecharger(d)} />
    )
  )

  return (
    <div>
      <Toast ref={toast} />
      <DataTable value={demandesTraitees} loading={loading} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="Aucune demande déjà traitée" responsiveLayout="scroll"
        globalFilter={globalFilter} globalFilterFields={['demandeurNom', 'motif', 'statut', 'motifRejetChef', 'motifRejetCsa', 'motifRejet']}
        header={
          <div className="flex justify-content-end">
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Rechercher…" />
            </span>
          </div>
        }>
        <Column header="Demandeur" field="demandeurNom" />
        <Column header="Période" body={dateBody} />
        {type === 'AUTORISATION' && <Column header="Motif" field="motif" />}
        <Column header="Étapes" body={etapesBody} />
        <Column header="Statut" body={statutBody} />
        {peutTelecharger && <Column header="Actions" body={actionsBody} align="center" alignHeader="center" />}
      </DataTable>
    </div>
  )
}

interface Agent {
  id: string
  firstname?: string
  lastname?: string
  matricule?: string
  phone?: string
  fonction?: { libelle?: string } | null
  typePersonnel?: TypePersonnel | null
  soldeConges?: number | null
  soldeDisponible?: number | null
  joursAutorisationCumules?: number | null
}

function MesAgentsTab() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => {
    setLoading(true)
    axiosInstance.get('personnel/mes-agents')
      .then(({ data }) => setAgents(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const nomBody = (a: Agent) => `${a.firstname ?? ''} ${a.lastname ?? ''}`.trim() || '—'
  const fonctionBody = (a: Agent) => a.fonction?.libelle || '—'
  const soldeBody = (a: Agent) => {
    const solde = a.soldeDisponible ?? a.soldeConges
    return solde != null ? `${solde} jour(s)` : '—'
  }

  return (
    <DataTable value={agents} loading={loading} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
      emptyMessage="Aucun agent dans votre division" responsiveLayout="scroll"
      globalFilter={globalFilter} globalFilterFields={['firstname', 'lastname', 'matricule', 'phone', 'fonction.libelle']}
      header={
        <div className="flex justify-content-end">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Rechercher…" />
          </span>
        </div>
      }>
      <Column header="Nom" body={nomBody} />
      <Column header="Matricule" field="matricule" body={(a: Agent) => a.matricule || '—'} />
      <Column header="Fonction" body={fonctionBody} />
      <Column header="Type de personnel" body={(a: Agent) => a.typePersonnel ? fmtTypePersonnel(a.typePersonnel) : '—'} />
      <Column header="Solde de congés" body={soldeBody} />
      <Column header="Jours pris depuis le dernier congé" field="joursAutorisationCumules"
        body={(a: Agent) => a.joursAutorisationCumules ?? 0} />
      <Column header="Téléphone" field="phone" body={(a: Agent) => a.phone || '—'} />
    </DataTable>
  )
}

// Seuls ces profils peuvent être amenés à valider une demande (CSA/DIRECTEUR/ADMIN au niveau
// central, CHEF_SERVICE s'il est effectivement chef d'une division) — les autres (Agent, etc.)
// ne valident jamais rien et n'ont donc pas d'onglet "À valider".
const ROLES_VALIDATEURS = ['CSA', 'DIRECTEUR', 'ADMIN', 'CHEF_SERVICE']
// Seuls ces rôles peuvent télécharger le PDF d'une autorisation d'absence validée
const ROLES_TELECHARGEMENT = ['CSA', 'DIRECTEUR', 'ADMIN']

function AbsenceModuleContent({ type, titre, description }: { type: TypeAbsence; titre: string; description: string }) {
  const { user } = useContext(UserContext)
  const roleName = user?.profil?.name
  const estChefService = roleName === 'CHEF_SERVICE'
  const peutValider = !!roleName && ROLES_VALIDATEURS.includes(roleName)
  const peutTelecharger = !!roleName && ROLES_TELECHARGEMENT.includes(roleName)

  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="m-0">{titre}</h3>
        <p className="text-color-secondary mt-1 mb-0">{description}</p>
      </div>
      <TabView>
        <TabPanel header="Mes demandes" leftIcon="pi pi-calendar-times mr-2">
          <MesDemandesTab type={type} />
        </TabPanel>
        {peutValider && (
          <TabPanel header={estChefService ? 'Demandes de mes agents' : 'À valider'} leftIcon="pi pi-check-square mr-2">
            <AValiderTab type={type} pourAgentsDuChef={estChefService} />
          </TabPanel>
        )}
        {peutValider && (
          <TabPanel header="Déjà validées" leftIcon="pi pi-history mr-2">
            <DejaTraiteesTab type={type} peutTelecharger={peutTelecharger} />
          </TabPanel>
        )}
        {estChefService && (
          <TabPanel header="Mes agents" leftIcon="pi pi-users mr-2">
            <MesAgentsTab />
          </TabPanel>
        )}
      </TabView>
    </div>
  )
}

export default function AbsenceModulePage({ type, titre, description }: { type: TypeAbsence; titre: string; description: string }) {
  return (
    <ProtectedRoute allowedRoles={TOUS_ROLES}>
      <AbsenceModuleContent type={type} titre={titre} description={description} />
    </ProtectedRoute>
  )
}
