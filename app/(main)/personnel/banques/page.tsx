'use client'
import { useEffect, useState } from 'react'
import ProtectedRoute from '@/layout/ProtectedRoute'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Message } from 'primereact/message'
import { useBanqueStore } from '../useBanqueStore'
import { useBankValidation } from '../useBankValidation'
import type { Banque } from '../types'

function BanquesContent() {
  const { banques, loading, error, reloadBanques, createBanque, updateBanque, deleteBanque, clearError } = useBanqueStore()
  const { formatCodeBanque, validateBankFields } = useBankValidation()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Banque | null>(null)
  const [name, setName] = useState('')
  const [codeBanque, setCodeBanque] = useState('')
  const [nomComplet, setNomComplet] = useState('')
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => { reloadBanques() }, [])

  const openCreate = () => {
    setEditing(null); setName(''); setCodeBanque(''); setNomComplet(''); clearError(); setDialogOpen(true)
  }
  const openEdit = (b: Banque) => {
    setEditing(b); setName(b.name); setCodeBanque(b.codeBanque ?? ''); setNomComplet(b.NomComplet ?? '')
    clearError(); setDialogOpen(true)
  }

  const codeBanqueError = validateBankFields({ code_bank: codeBanque }).code_bank
  const formValide = !!name.trim() && !!codeBanque.trim() && !codeBanqueError

  const save = async () => {
    if (!formValide) return
    try {
      const data = { name: name.trim(), codeBanque: codeBanque.trim(), NomComplet: nomComplet.trim() }
      if (editing) await updateBanque(editing.id, data)
      else await createBanque(data)
      setDialogOpen(false)
    } catch { /* error déjà affiché via le store */ }
  }

  const confirmDelete = (b: Banque) => {
    confirmDialog({
      message: `Supprimer définitivement la banque "${b.name}" ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      accept: () => deleteBanque(b.id),
    })
  }

  const actionsBody = (b: Banque) => (
    <div className="flex gap-2 justify-content-center">
      <Button icon="pi pi-pencil" text size="small" onClick={() => openEdit(b)} />
      <Button icon="pi pi-trash" text severity="danger" size="small" onClick={() => confirmDelete(b)} />
    </div>
  )

  return (
    <div className="card">
      <ConfirmDialog />
      <div className="mb-4 flex justify-content-between align-items-start">
        <div>
          <h3 className="m-0">Banques</h3>
          <p className="text-color-secondary mt-1 mb-0">Référentiel des banques utilisé pour préremplir le code banque des coordonnées bancaires (RIB)</p>
        </div>
        <Button label="Nouvelle banque" icon="pi pi-plus" onClick={openCreate} />
      </div>

      <DataTable value={banques} loading={loading} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="Aucune banque enregistrée" responsiveLayout="scroll"
        globalFilter={globalFilter} globalFilterFields={['name', 'codeBanque', 'NomComplet']}
        header={
          <div className="flex justify-content-end">
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Rechercher…" />
            </span>
          </div>
        }>
        <Column header="Nom" field="name" />
        <Column header="Code banque" field="codeBanque" />
        <Column header="Nom complet" body={(b: Banque) => b.NomComplet || '—'} />
        <Column header="Actions" body={actionsBody} align="center" alignHeader="center" />
      </DataTable>

      <Dialog header={editing ? 'Modifier la banque' : 'Nouvelle banque'} visible={dialogOpen}
        onHide={() => setDialogOpen(false)} style={{ width: '28rem' }} draggable={false}
        footer={
          <div className="flex gap-2">
            <Button label="Annuler" outlined className="flex-1" onClick={() => setDialogOpen(false)} />
            <Button label={loading ? 'Enregistrement…' : 'Enregistrer'} className="flex-1" loading={loading}
              disabled={!formValide} onClick={save} />
          </div>
        }>
        <div className="flex flex-column gap-3">
          <div className="field">
            <label className="block text-sm font-medium mb-1"><span className="text-red-600">*</span> Nom</label>
            <InputText value={name} onChange={e => setName(e.target.value)} className="w-full" autoFocus />
          </div>
          <div className="field">
            <label className="block text-sm font-medium mb-1"><span className="text-red-600">*</span> Code banque</label>
            <InputText value={codeBanque} onChange={e => setCodeBanque(formatCodeBanque(e.target.value))}
              maxLength={5} placeholder="SNXXX" className="w-full" />
            {codeBanqueError && <small className="text-red-600">{codeBanqueError}</small>}
          </div>
          <div className="field">
            <label className="block text-sm font-medium mb-1">Nom complet</label>
            <InputText value={nomComplet} onChange={e => setNomComplet(e.target.value)} className="w-full" placeholder="Optionnel" />
          </div>
          {error && <Message severity="error" text={error} className="w-full" />}
        </div>
      </Dialog>
    </div>
  )
}

export default function BanquesPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <BanquesContent />
    </ProtectedRoute>
  )
}
