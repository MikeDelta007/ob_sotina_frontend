'use client'
import { useEffect, useState } from 'react'
import ProtectedRoute from '@/layout/ProtectedRoute'
import axiosInstance from '@/app/api/axiosInstance'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { InputSwitch } from 'primereact/inputswitch'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Message } from 'primereact/message'
import { Tag } from 'primereact/tag'

interface MotifAbsence {
  id: string
  libelle: string
  actif: boolean
}

function MotifsAbsenceContent() {
  const [motifs, setMotifs] = useState<MotifAbsence[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<MotifAbsence | null>(null)
  const [libelle, setLibelle] = useState('')
  const [actif, setActif] = useState(true)

  const fetchAll = () => {
    setLoading(true)
    axiosInstance.get('demande-absence/motifs/all')
      .then(({ data }) => setMotifs(data))
      .catch(() => setError('Erreur chargement des motifs'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchAll() }, [])

  const openCreate = () => { setEditing(null); setLibelle(''); setActif(true); setError(null); setDialogOpen(true) }
  const openEdit = (m: MotifAbsence) => { setEditing(m); setLibelle(m.libelle); setActif(m.actif); setError(null); setDialogOpen(true) }

  const save = async () => {
    if (!libelle.trim()) return
    setLoading(true)
    try {
      if (editing) await axiosInstance.put(`demande-absence/motifs/${editing.id}`, { libelle: libelle.trim(), actif })
      else await axiosInstance.post('demande-absence/motifs', { libelle: libelle.trim() })
      setDialogOpen(false)
      fetchAll()
    } catch {
      setError("Erreur lors de l'enregistrement")
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = (m: MotifAbsence) => {
    confirmDialog({
      message: `Désactiver le motif "${m.libelle}" ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Désactiver',
      rejectLabel: 'Annuler',
      accept: async () => { await axiosInstance.delete(`demande-absence/motifs/${m.id}`); fetchAll() },
    })
  }

  const actifBody = (m: MotifAbsence) => <Tag severity={m.actif ? 'success' : 'secondary'} value={m.actif ? 'Actif' : 'Inactif'} />
  const actionsBody = (m: MotifAbsence) => (
    <div className="flex gap-2 justify-content-center">
      <Button icon="pi pi-pencil" text size="small" onClick={() => openEdit(m)} />
      {m.actif && <Button icon="pi pi-trash" text severity="danger" size="small" onClick={() => confirmDelete(m)} />}
    </div>
  )

  return (
    <div className="card">
      <ConfirmDialog />
      <div className="mb-4 flex justify-content-between align-items-start">
        <div>
          <h3 className="m-0">Motifs d&apos;absence</h3>
          <p className="text-color-secondary mt-1 mb-0">Motifs prédéfinis proposés lors d&apos;une demande d&apos;autorisation d&apos;absence</p>
        </div>
        <Button label="Nouveau motif" icon="pi pi-plus" onClick={openCreate} />
      </div>

      <DataTable value={motifs} loading={loading} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="Aucun motif enregistré" responsiveLayout="scroll">
        <Column header="Libellé" field="libelle" />
        <Column header="Statut" body={actifBody} align="center" alignHeader="center" />
        <Column header="Actions" body={actionsBody} align="center" alignHeader="center" />
      </DataTable>

      <Dialog header={editing ? 'Modifier le motif' : 'Nouveau motif'} visible={dialogOpen}
        onHide={() => setDialogOpen(false)} style={{ width: '25rem' }} draggable={false}
        footer={
          <div className="flex gap-2">
            <Button label="Annuler" outlined className="flex-1" onClick={() => setDialogOpen(false)} />
            <Button label={loading ? 'Enregistrement…' : 'Enregistrer'} className="flex-1" loading={loading}
              disabled={!libelle.trim()} onClick={save} />
          </div>
        }>
        <div className="flex flex-column gap-3">
          <div className="field">
            <label className="block text-sm font-medium mb-1">Libellé</label>
            <InputText value={libelle} onChange={e => setLibelle(e.target.value)} className="w-full" autoFocus />
          </div>
          {editing && (
            <div className="flex align-items-center gap-2">
              <InputSwitch inputId="actifMotif" checked={actif} onChange={e => setActif(!!e.value)} />
              <label htmlFor="actifMotif" className="text-sm">Actif</label>
            </div>
          )}
          {error && <Message severity="error" text={error} className="w-full" />}
        </div>
      </Dialog>
    </div>
  )
}

export default function MotifsAbsencePage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'CSA', 'DIRECTEUR']}>
      <MotifsAbsenceContent />
    </ProtectedRoute>
  )
}
