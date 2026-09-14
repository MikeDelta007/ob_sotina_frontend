'use client'
import { useEffect, useRef, useState } from 'react'
import ProtectedRoute from '@/layout/ProtectedRoute'
import axiosInstance from '@/app/api/axiosInstance'
import { TabPanel, TabView } from 'primereact/tabview'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { Calendar } from 'primereact/calendar'
import { InputTextarea } from 'primereact/inputtextarea'
import { Tag } from 'primereact/tag'
import { Message } from 'primereact/message'
import { Toast } from 'primereact/toast'
import { useAbsenceStore } from '../useAbsenceStore'
import { TOUS_ROLES, fmtStatutAbsence, type DemandeAbsence, type StatutAbsence } from '../types'

const statutSeverity: Record<StatutAbsence, 'warning' | 'success' | 'danger' | 'info'> = {
  EN_ATTENTE_CHEF: 'warning',
  EN_ATTENTE_CSA: 'warning',
  EN_ATTENTE_DIRECTEUR: 'warning',
  VALIDEE: 'success',
  REJETEE: 'danger',
}

const toIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function MesDemandesTab() {
  const toast = useRef<Toast>(null)
  const { mesDemandes, loading, error, fetchMesDemandes, creer, clearError } = useAbsenceStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dateDebut, setDateDebut] = useState<Date | null>(null)
  const [dateFin, setDateFin] = useState<Date | null>(null)
  const [motif, setMotif] = useState('')
  const [soldeConges, setSoldeConges] = useState<number | null>(null)

  useEffect(() => { fetchMesDemandes() }, [])

  const chargerSolde = () => {
    axiosInstance.get('profile/me').then(({ data }) => setSoldeConges(data.soldeConges ?? null)).catch(() => {})
  }
  useEffect(() => { chargerSolde() }, [])

  const openCreate = () => {
    setDateDebut(null); setDateFin(null); setMotif(''); clearError()
    chargerSolde()
    setDialogOpen(true)
  }

  const nombreJoursDemandes = dateDebut && dateFin
    ? Math.round((dateFin.getTime() - dateDebut.getTime()) / 86400000) + 1
    : 0
  const depasseSolde = soldeConges != null && nombreJoursDemandes > soldeConges

  const submit = async () => {
    if (!dateDebut || !dateFin || !motif.trim() || depasseSolde) return
    try {
      await creer({ dateDebut: toIso(dateDebut), dateFin: toIso(dateFin), motif: motif.trim() })
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
          {soldeConges != null ? `Solde de congés restant : ${soldeConges} jour(s)` : ''}
        </span>
        <Button label="Nouvelle demande" icon="pi pi-plus" onClick={openCreate} />
      </div>

      <DataTable value={mesDemandes} loading={loading} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="Aucune demande d'absence" responsiveLayout="scroll">
        <Column header="Période" body={dateBody} />
        <Column header="Jours" field="nombreJours" />
        <Column header="Motif" field="motif" />
        <Column header="Statut" body={statutBody} />
        <Column header="Motif de rejet" field="motifRejet" body={(d: DemandeAbsence) => d.motifRejet || '—'} />
      </DataTable>

      <Dialog header="Nouvelle demande d'autorisation d'absence" visible={dialogOpen}
        onHide={() => setDialogOpen(false)} style={{ width: '30rem' }} draggable={false}
        footer={
          <div className="flex gap-2">
            <Button label="Annuler" outlined className="flex-1" onClick={() => setDialogOpen(false)} />
            <Button label={loading ? 'Envoi…' : 'Envoyer'} className="flex-1" loading={loading}
              disabled={!dateDebut || !dateFin || !motif.trim() || depasseSolde} onClick={submit} />
          </div>
        }>
        <div className="flex flex-column gap-3">
          {soldeConges != null && (
            <Message severity="info" text={`Solde de congés restant : ${soldeConges} jour(s)`} className="w-full" />
          )}
          <div className="field">
            <label className="block text-sm font-medium mb-1">Date de début</label>
            <Calendar value={dateDebut} onChange={e => setDateDebut(e.value as Date)} dateFormat="dd/mm/yy" showIcon className="w-full" />
          </div>
          <div className="field">
            <label className="block text-sm font-medium mb-1">Date de fin</label>
            <Calendar value={dateFin} onChange={e => setDateFin(e.value as Date)} dateFormat="dd/mm/yy" showIcon className="w-full" minDate={dateDebut ?? undefined} />
          </div>
          {nombreJoursDemandes > 0 && (
            <div className={depasseSolde ? 'text-red-600 text-sm' : 'text-color-secondary text-sm'}>
              {nombreJoursDemandes} jour(s) demandé(s)
              {depasseSolde && soldeConges != null && ` — dépasse votre solde restant (${soldeConges} j.)`}
            </div>
          )}
          <div className="field">
            <label className="block text-sm font-medium mb-1">Motif</label>
            <InputTextarea value={motif} onChange={e => setMotif(e.target.value)} rows={3} className="w-full" />
          </div>
          {error && <Message severity="error" text={error} className="w-full" />}
        </div>
      </Dialog>
    </div>
  )
}

function AValiderTab() {
  const toast = useRef<Toast>(null)
  const { aValider, loading, actionLoadingId, error, fetchAValider, valider, rejeter, clearError } = useAbsenceStore()
  const [rejetDialogFor, setRejetDialogFor] = useState<DemandeAbsence | null>(null)
  const [motifRejet, setMotifRejet] = useState('')

  useEffect(() => { fetchAValider() }, [])

  const doValider = async (d: DemandeAbsence) => {
    try {
      await valider(d.id)
      toast.current?.show({ severity: 'success', summary: 'Office du Bac', detail: 'Demande validée', life: 4000 })
    } catch { /* error déjà affiché via le store */ }
  }

  const openRejet = (d: DemandeAbsence) => { setRejetDialogFor(d); setMotifRejet(''); clearError() }

  const doRejeter = async () => {
    if (!rejetDialogFor || !motifRejet.trim()) return
    try {
      await rejeter(rejetDialogFor.id, motifRejet.trim())
      toast.current?.show({ severity: 'success', summary: 'Office du Bac', detail: 'Demande rejetée', life: 4000 })
      setRejetDialogFor(null)
    } catch { /* error déjà affiché via le store */ }
  }

  const dateBody = (d: DemandeAbsence) => (
    <span>{new Date(d.dateDebut).toLocaleDateString('fr-FR')} → {new Date(d.dateFin).toLocaleDateString('fr-FR')}</span>
  )
  const actionsBody = (d: DemandeAbsence) => (
    <div className="flex gap-2 justify-content-center">
      <Button label="Valider" icon="pi pi-check" severity="success" size="small"
        loading={actionLoadingId === d.id} onClick={() => doValider(d)} />
      <Button label="Rejeter" icon="pi pi-times" severity="danger" size="small" outlined
        loading={actionLoadingId === d.id} onClick={() => openRejet(d)} />
    </div>
  )

  return (
    <div>
      <Toast ref={toast} />
      <DataTable value={aValider} loading={loading} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="Aucune demande en attente de votre validation" responsiveLayout="scroll">
        <Column header="Demandeur" field="demandeurNom" />
        <Column header="Période" body={dateBody} />
        <Column header="Motif" field="motif" />
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

function AbsencesContent() {
  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="m-0">Autorisation d&apos;absence</h3>
        <p className="text-color-secondary mt-1 mb-0">
          Soumettez une demande d&apos;absence ou validez celles de vos agents
        </p>
      </div>
      <TabView>
        <TabPanel header="Mes demandes" leftIcon="pi pi-calendar-times mr-2">
          <MesDemandesTab />
        </TabPanel>
        <TabPanel header="À valider" leftIcon="pi pi-check-square mr-2">
          <AValiderTab />
        </TabPanel>
      </TabView>
    </div>
  )
}

export default function AbsencesPage() {
  return (
    <ProtectedRoute allowedRoles={TOUS_ROLES}>
      <AbsencesContent />
    </ProtectedRoute>
  )
}
