'use client'
import { useState } from 'react'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { DataTable } from 'primereact/datatable'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Message } from 'primereact/message'
import { Tag } from 'primereact/tag'
import { useCaisseStore } from './useCaisseStore'
import type { Motif } from './types'

export default function MotifsTab() {
  const { allMotifs, motifLoading, createMotif, updateMotif, deleteMotif } = useCaisseStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Motif | null>(null)
  const [libelle, setLibelle] = useState('')
  const [actif, setActif]     = useState(true)
  const [err, setErr]         = useState('')

  const openCreate = () => { setEditing(null); setLibelle(''); setActif(true); setErr(''); setDialogOpen(true) }
  const openEdit = (m: Motif) => { setEditing(m); setLibelle(m.libelle); setActif(m.actif); setErr(''); setDialogOpen(true) }

  const save = async () => {
    if (!libelle.trim()) { setErr('Libellé requis'); return }
    try {
      if (editing) await updateMotif(editing.id, { libelle: libelle.trim(), actif })
      else await createMotif(libelle.trim())
      setDialogOpen(false)
    } catch {
      setErr('Erreur lors de l\'enregistrement')
    }
  }

  const confirmDelete = (m: Motif) => {
    confirmDialog({
      message: `Désactiver le motif "${m.libelle}" ? Il n'apparaîtra plus dans les choix disponibles.`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Désactiver',
      rejectLabel: 'Annuler',
      accept: () => deleteMotif(m.id),
    })
  }

  const actifBody = (m: Motif) => (
    <Tag severity={m.actif ? 'success' : 'secondary'} value={m.actif ? 'Actif' : 'Inactif'} />
  )

  const actionsBody = (m: Motif) => (
    <div className="flex gap-2 justify-content-center">
      <Button icon="pi pi-pencil" text size="small" onClick={() => openEdit(m)} />
      {m.actif && (
        <Button icon="pi pi-trash" text severity="danger" size="small" onClick={() => confirmDelete(m)} />
      )}
    </div>
  )

  return (
    <div>
      <ConfirmDialog />

      <div className="flex justify-content-end mb-3">
        <Button label="Nouveau motif" icon="pi pi-plus" onClick={openCreate} />
      </div>

      <DataTable value={allMotifs} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
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
            <Button label={motifLoading ? 'Enregistrement…' : 'Enregistrer'} className="flex-1"
              loading={motifLoading} disabled={!libelle.trim()} onClick={save} />
          </div>
        }>
        <div className="flex flex-column gap-3">
          <div className="field">
            <label className="block text-sm font-medium mb-1">Libellé</label>
            <InputText value={libelle} onChange={e => setLibelle(e.target.value)} className="w-full" autoFocus />
          </div>
          {editing && (
            <div>
              <label className="block text-sm font-medium mb-1">Statut</label>
              <Button label={actif ? 'Actif' : 'Inactif'} icon={actif ? 'pi pi-check' : 'pi pi-times'}
                severity={actif ? 'success' : 'secondary'} outlined size="small"
                onClick={() => setActif(!actif)} />
            </div>
          )}
          {err && <Message severity="error" text={err} className="w-full" />}
        </div>
      </Dialog>
    </div>
  )
}
