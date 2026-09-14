'use client'
import { useContext, useEffect, useRef, useState } from 'react'
import ProtectedRoute from '@/layout/ProtectedRoute'
import { UserContext } from '@/app/userContext'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { Dropdown } from 'primereact/dropdown'
import { Calendar } from 'primereact/calendar'
import { InputText } from 'primereact/inputtext'
import { Tag } from 'primereact/tag'
import { Message } from 'primereact/message'
import { Toast } from 'primereact/toast'
import { ParametrageService } from '@/demo/service/ParametrageService'
import { useMissionStore } from '../useMissionStore'
import { TOUS_ROLES, type OrdreMission } from '../types'

const toIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function MissionsContent() {
  const toast = useRef<Toast>(null)
  const { user } = useContext(UserContext)
  const role = user?.profil?.name
  const peutGerer = role === 'CSA'

  const { mesMissions, toutes, loading, actionLoadingId, error, fetchMesMissions, fetchToutes, creer, annuler, clearError } = useMissionStore()
  const [agents, setAgents] = useState<{ label: string; value: string }[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [agentId, setAgentId] = useState<string | null>(null)
  const [destination, setDestination] = useState('')
  const [motif, setMotif] = useState('')
  const [dateDebut, setDateDebut] = useState<Date | null>(null)
  const [dateFin, setDateFin] = useState<Date | null>(null)

  useEffect(() => {
    if (peutGerer) fetchToutes()
    else fetchMesMissions()
  }, [peutGerer])

  useEffect(() => {
    if (!peutGerer) return
    ParametrageService.getUsers().then((groupes: Record<string, any[]>) => {
      const tousLesUsers = Object.values(groupes ?? {}).flat()
      setAgents(tousLesUsers.map((u: any) => ({ label: `${u.firstname} ${u.lastname} (${u.login})`, value: u.id })))
    })
  }, [peutGerer])

  const openCreate = () => {
    setAgentId(null); setDestination(''); setMotif(''); setDateDebut(null); setDateFin(null); clearError()
    setDialogOpen(true)
  }

  const submit = async () => {
    if (!agentId || !destination.trim() || !motif.trim() || !dateDebut || !dateFin) return
    try {
      await creer({ agentId, destination: destination.trim(), motif: motif.trim(), dateDebut: toIso(dateDebut), dateFin: toIso(dateFin) })
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
  const statutBody = (m: OrdreMission) => m.annule
    ? <Tag severity="danger" value="Annulé" />
    : <Tag severity="success" value="Actif" />
  const actionsBody = (m: OrdreMission) => !m.annule && (
    <Button label="Annuler" icon="pi pi-times" severity="danger" size="small" outlined
      loading={actionLoadingId === m.id} onClick={() => doAnnuler(m)} />
  )

  const data = peutGerer ? toutes : mesMissions

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
        emptyMessage="Aucun ordre de mission" responsiveLayout="scroll">
        {peutGerer && <Column header="Agent" field="agentNom" />}
        <Column header="Destination" field="destination" />
        <Column header="Motif" field="motif" />
        <Column header="Période" body={dateBody} />
        <Column header="Statut" body={statutBody} align="center" alignHeader="center" />
        {peutGerer && <Column header="Actions" body={actionsBody} align="center" alignHeader="center" />}
      </DataTable>

      <Dialog header="Créer un ordre de mission" visible={dialogOpen} onHide={() => setDialogOpen(false)}
        style={{ width: '32rem' }} draggable={false}
        footer={
          <div className="flex gap-2">
            <Button label="Annuler" outlined className="flex-1" onClick={() => setDialogOpen(false)} />
            <Button label={loading ? 'Création…' : 'Créer'} className="flex-1" loading={loading}
              disabled={!agentId || !destination.trim() || !motif.trim() || !dateDebut || !dateFin} onClick={submit} />
          </div>
        }>
        <div className="flex flex-column gap-3">
          <div className="field">
            <label className="block text-sm font-medium mb-1">Agent</label>
            <Dropdown value={agentId} onChange={e => setAgentId(e.value)} options={agents} filter
              placeholder="Sélectionner un agent" className="w-full" />
          </div>
          <div className="field">
            <label className="block text-sm font-medium mb-1">Destination</label>
            <InputText value={destination} onChange={e => setDestination(e.target.value)} className="w-full" />
          </div>
          <div className="field">
            <label className="block text-sm font-medium mb-1">Date de début</label>
            <Calendar value={dateDebut} onChange={e => setDateDebut(e.value as Date)} dateFormat="dd/mm/yy" showIcon className="w-full" />
          </div>
          <div className="field">
            <label className="block text-sm font-medium mb-1">Date de fin</label>
            <Calendar value={dateFin} onChange={e => setDateFin(e.value as Date)} dateFormat="dd/mm/yy" showIcon className="w-full" minDate={dateDebut ?? undefined} />
          </div>
          <div className="field">
            <label className="block text-sm font-medium mb-1">Motif</label>
            <InputText value={motif} onChange={e => setMotif(e.target.value)} className="w-full" />
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
