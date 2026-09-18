'use client'
import { useEffect, useState } from 'react'
import ProtectedRoute from '@/layout/ProtectedRoute'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { InputSwitch } from 'primereact/inputswitch'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Dialog } from 'primereact/dialog'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { Message } from 'primereact/message'
import { Tag } from 'primereact/tag'
import { ParametrageService } from '@/demo/service/ParametrageService'
import { usePersonnelStore } from '../usePersonnelStore'
import type { Voiture, ProprietaireVoiture } from '../types'

const proprietaireOptions: { label: string; value: ProprietaireVoiture }[] = [
  { label: "Office (institution)", value: 'OFFICE' },
  { label: 'Agent (personnel interne)', value: 'AGENT' },
  { label: 'Externe', value: 'EXTERNE' },
]

function VoituresContent() {
  const { allVoitures, loading, error, fetchAllVoitures, createVoiture, updateVoiture, deleteVoiture, clearError } = usePersonnelStore()
  const [agents, setAgents] = useState<{ label: string; value: string }[]>([])
  const [personnels, setPersonnels] = useState<{ label: string; value: string }[]>([])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Voiture | null>(null)
  const [immatriculation, setImmatriculation] = useState('')
  const [marque, setMarque] = useState('')
  const [actif, setActif] = useState(true)
  const [proprietaireType, setProprietaireType] = useState<ProprietaireVoiture>('OFFICE')
  const [proprietaireAgentId, setProprietaireAgentId] = useState<string | null>(null)
  const [proprietairePersonnelId, setProprietairePersonnelId] = useState<string | null>(null)
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => {
    fetchAllVoitures()
    ParametrageService.getUsers().then((groupes: Record<string, any[]>) => {
      const tousLesUsers = Object.values(groupes ?? {}).flat()
      setAgents(tousLesUsers.map((u: any) => ({ label: `${u.personnel?.firstname} ${u.personnel?.lastname} (${u.login})`, value: u.id })))
    })
    ParametrageService.getAllPersonnels().then((data: any[]) => {
      setPersonnels(data.map((p: any) => ({ label: `${p.firstname} ${p.lastname}`, value: p.id })))
    })
  }, [])

  const openCreate = () => {
    setEditing(null); setImmatriculation(''); setMarque(''); setActif(true)
    setProprietaireType('OFFICE'); setProprietaireAgentId(null); setProprietairePersonnelId(null)
    clearError(); setDialogOpen(true)
  }
  const openEdit = (v: Voiture) => {
    setEditing(v); setImmatriculation(v.immatriculation); setMarque(v.marque ?? ''); setActif(v.actif)
    setProprietaireType(v.proprietaireType ?? 'OFFICE')
    setProprietaireAgentId(v.proprietaireAgentId ?? null)
    setProprietairePersonnelId(v.proprietairePersonnelId ?? null)
    clearError(); setDialogOpen(true)
  }

  const proprietaireValide = proprietaireType === 'OFFICE'
    || (proprietaireType === 'AGENT' && !!proprietaireAgentId)
    || (proprietaireType === 'EXTERNE' && !!proprietairePersonnelId)

  const save = async () => {
    if (!immatriculation.trim() || !proprietaireValide) return
    try {
      const data = {
        immatriculation: immatriculation.trim(), marque, actif,
        proprietaireType,
        proprietaireAgentId: proprietaireType === 'AGENT' ? proprietaireAgentId : null,
        proprietairePersonnelId: proprietaireType === 'EXTERNE' ? proprietairePersonnelId : null,
      }
      if (editing) await updateVoiture(editing.id, data)
      else await createVoiture(data)
      setDialogOpen(false)
    } catch { /* error déjà affiché via le store */ }
  }

  const confirmDelete = (v: Voiture) => {
    confirmDialog({
      message: `Désactiver le véhicule "${v.immatriculation}" ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Désactiver',
      rejectLabel: 'Annuler',
      accept: () => deleteVoiture(v.id),
    })
  }

  const proprietaireBody = (v: Voiture) => {
    if (v.proprietaireType === 'AGENT') return v.proprietaireAgentNom || 'Agent'
    if (v.proprietaireType === 'EXTERNE') return v.proprietairePersonnelNom || 'Externe'
    return 'Office'
  }
  const actifBody = (v: Voiture) => <Tag severity={v.actif ? 'success' : 'secondary'} value={v.actif ? 'Actif' : 'Inactif'} />
  const actionsBody = (v: Voiture) => (
    <div className="flex gap-2 justify-content-center">
      <Button icon="pi pi-pencil" text size="small" onClick={() => openEdit(v)} />
      {v.actif && <Button icon="pi pi-trash" text severity="danger" size="small" onClick={() => confirmDelete(v)} />}
    </div>
  )

  return (
    <div className="card">
      <ConfirmDialog />
      <div className="mb-4 flex justify-content-between align-items-start">
        <div>
          <h3 className="m-0">Véhicules</h3>
          <p className="text-color-secondary mt-1 mb-0">Véhicules utilisables pour les ordres de mission</p>
        </div>
        <Button label="Nouveau véhicule" icon="pi pi-plus" onClick={openCreate} />
      </div>

      <DataTable value={allVoitures} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="Aucun véhicule enregistré" responsiveLayout="scroll"
        globalFilter={globalFilter} globalFilterFields={['immatriculation', 'marque', 'proprietaireAgentNom', 'proprietairePersonnelNom']}
        header={
          <div className="flex justify-content-end">
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Rechercher…" />
            </span>
          </div>
        }>
        <Column header="Immatriculation" field="immatriculation" />
        <Column header="Marque" field="marque" body={(v: Voiture) => v.marque || '—'} />
        <Column header="Places" field="capacite" />
        <Column header="Propriétaire" body={proprietaireBody} />
        <Column header="Statut" body={actifBody} align="center" alignHeader="center" />
        <Column header="Actions" body={actionsBody} align="center" alignHeader="center" />
      </DataTable>

      <Dialog header={editing ? 'Modifier le véhicule' : 'Nouveau véhicule'} visible={dialogOpen}
        onHide={() => setDialogOpen(false)} style={{ width: '26rem' }} draggable={false}
        footer={
          <div className="flex gap-2">
            <Button label="Annuler" outlined className="flex-1" onClick={() => setDialogOpen(false)} />
            <Button label={loading ? 'Enregistrement…' : 'Enregistrer'} className="flex-1" loading={loading}
              disabled={!immatriculation.trim() || !proprietaireValide} onClick={save} />
          </div>
        }>
        <div className="flex flex-column gap-3">
          <div className="field">
            <label className="block text-sm font-medium mb-1">Immatriculation</label>
            <InputText value={immatriculation} onChange={e => setImmatriculation(e.target.value)} className="w-full" autoFocus />
          </div>
          <div className="field">
            <label className="block text-sm font-medium mb-1">Marque</label>
            <InputText value={marque} onChange={e => setMarque(e.target.value)} className="w-full" />
          </div>
          <div className="text-sm text-color-secondary">Capacité fixe : 4 places</div>

          <div className="field">
            <label className="block text-sm font-medium mb-1">Propriétaire</label>
            <Dropdown value={proprietaireType}
              onChange={e => { setProprietaireType(e.value); setProprietaireAgentId(null); setProprietairePersonnelId(null) }}
              options={proprietaireOptions} className="w-full" />
          </div>
          {proprietaireType === 'AGENT' && (
            <div className="field">
              <label className="block text-sm font-medium mb-1">Agent propriétaire</label>
              <Dropdown value={proprietaireAgentId} onChange={e => setProprietaireAgentId(e.value)}
                options={agents} filter placeholder="Sélectionner un agent" className="w-full" />
            </div>
          )}
          {proprietaireType === 'EXTERNE' && (
            <div className="field">
              <label className="block text-sm font-medium mb-1">Personne externe propriétaire</label>
              <Dropdown value={proprietairePersonnelId} onChange={e => setProprietairePersonnelId(e.value)}
                options={personnels} filter placeholder="Sélectionner une personne" className="w-full" />
            </div>
          )}

          {editing && (
            <div className="flex align-items-center gap-2">
              <InputSwitch inputId="actifVoiture" checked={actif} onChange={e => setActif(!!e.value)} />
              <label htmlFor="actifVoiture" className="text-sm">Actif</label>
            </div>
          )}
          {error && <Message severity="error" text={error} className="w-full" />}
        </div>
      </Dialog>
    </div>
  )
}

export default function VoituresPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'CSA', 'DIRECTEUR']}>
      <VoituresContent />
    </ProtectedRoute>
  )
}
