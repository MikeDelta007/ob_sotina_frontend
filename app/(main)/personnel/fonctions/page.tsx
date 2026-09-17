'use client'
import { useEffect, useState } from 'react'
import ProtectedRoute from '@/layout/ProtectedRoute'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { InputSwitch } from 'primereact/inputswitch'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Message } from 'primereact/message'
import { Tag } from 'primereact/tag'
import { usePersonnelStore } from '../usePersonnelStore'
import type { Fonction } from '../types'

function FonctionsContent() {
  const { allFonctions, loading, error, fetchAllFonctions, createFonction, updateFonction, deleteFonction, clearError } = usePersonnelStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Fonction | null>(null)
  const [libelle, setLibelle] = useState('')
  const [actif, setActif] = useState(true)

  useEffect(() => { fetchAllFonctions() }, [])

  const openCreate = () => { setEditing(null); setLibelle(''); setActif(true); clearError(); setDialogOpen(true) }
  const openEdit = (f: Fonction) => { setEditing(f); setLibelle(f.libelle); setActif(f.actif); clearError(); setDialogOpen(true) }

  const save = async () => {
    if (!libelle.trim()) return
    try {
      if (editing) await updateFonction(editing.id, { libelle: libelle.trim(), actif })
      else await createFonction(libelle.trim())
      setDialogOpen(false)
    } catch { /* error déjà affiché via le store */ }
  }

  const confirmDelete = (f: Fonction) => {
    confirmDialog({
      message: `Désactiver la fonction "${f.libelle}" ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Désactiver',
      rejectLabel: 'Annuler',
      accept: () => deleteFonction(f.id),
    })
  }

  const actifBody = (f: Fonction) => <Tag severity={f.actif ? 'success' : 'secondary'} value={f.actif ? 'Actif' : 'Inactif'} />
  const actionsBody = (f: Fonction) => (
    <div className="flex gap-2 justify-content-center">
      <Button icon="pi pi-pencil" text size="small" onClick={() => openEdit(f)} />
      {f.actif && <Button icon="pi pi-trash" text severity="danger" size="small" onClick={() => confirmDelete(f)} />}
    </div>
  )

  return (
    <div className="card">
      <ConfirmDialog />
      <div className="mb-4 flex justify-content-between align-items-start">
        <div>
          <h3 className="m-0">Fonctions</h3>
          <p className="text-color-secondary mt-1 mb-0">Fonctions utilisées pour les comptes agents</p>
        </div>
        <Button label="Nouvelle fonction" icon="pi pi-plus" onClick={openCreate} />
      </div>

      <DataTable value={allFonctions} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="Aucune fonction enregistrée" responsiveLayout="scroll">
        <Column header="Libellé" field="libelle" />
        <Column header="Statut" body={actifBody} align="center" alignHeader="center" />
        <Column header="Actions" body={actionsBody} align="center" alignHeader="center" />
      </DataTable>

      <Dialog header={editing ? 'Modifier la fonction' : 'Nouvelle fonction'} visible={dialogOpen}
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
              <InputSwitch inputId="actifFonction" checked={actif} onChange={e => setActif(!!e.value)} />
              <label htmlFor="actifFonction" className="text-sm">Actif</label>
            </div>
          )}
          {error && <Message severity="error" text={error} className="w-full" />}
        </div>
      </Dialog>
    </div>
  )
}

export default function FonctionsPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'CSA', 'DIRECTEUR']}>
      <FonctionsContent />
    </ProtectedRoute>
  )
}
