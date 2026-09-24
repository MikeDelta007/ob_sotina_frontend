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
import type { Division } from '../types'

function DivisionsContent() {
  const { allDivisions, loading, error, fetchAllDivisions, createDivision, updateDivision, deleteDivision, clearError } = usePersonnelStore()
  const [chefs, setChefs] = useState<{ label: string; value: string }[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Division | null>(null)
  const [libelle, setLibelle] = useState('')
  const [chefServiceId, setChefServiceId] = useState<string | null>(null)
  const [actif, setActif] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => { fetchAllDivisions() }, [])
  useEffect(() => {
    ParametrageService.getUsers().then((groupes: Record<string, any[]>) => {
      // Tous les comptes du personnel : le chef d'une division peut avoir un autre rôle principal
      // (ADMIN, PEDAGOGIE...) avec CHEF_SERVICE en rôle supplémentaire.
      const tous = Object.entries(groupes ?? {}).flatMap(([role, u]) => u.map((x: any) => ({ ...x, _role: role })))
      setChefs(tous.map((u: any) => ({ label: `${u.personnel?.firstname} ${u.personnel?.lastname} (${u.login} — ${u._role})`, value: u.id })))
    })
  }, [])

  const openCreate = () => {
    setEditing(null); setLibelle(''); setChefServiceId(null); setActif(true); clearError()
    setDialogOpen(true)
  }
  const openEdit = (d: Division) => {
    setEditing(d); setLibelle(d.libelle); setChefServiceId(d.chefServiceId ?? null); setActif(d.actif); clearError()
    setDialogOpen(true)
  }

  const save = async () => {
    if (!libelle.trim()) return
    try {
      if (editing) await updateDivision(editing.id, { libelle: libelle.trim(), chefServiceId, actif })
      else await createDivision(libelle.trim(), chefServiceId)
      setDialogOpen(false)
    } catch { /* error déjà affiché via le store */ }
  }

  const confirmDelete = (d: Division) => {
    confirmDialog({
      message: `Désactiver la division "${d.libelle}" ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Désactiver',
      rejectLabel: 'Annuler',
      accept: () => deleteDivision(d.id),
    })
  }

  const chefBody = (d: Division) => d.chefServiceNom ?? chefs.find(c => c.value === d.chefServiceId)?.label ?? '—'
  const actifBody = (d: Division) => <Tag severity={d.actif ? 'success' : 'secondary'} value={d.actif ? 'Actif' : 'Inactif'} />
  const actionsBody = (d: Division) => (
    <div className="flex gap-2 justify-content-center">
      <Button icon="pi pi-pencil" text size="small" onClick={() => openEdit(d)} />
      {d.actif && <Button icon="pi pi-trash" text severity="danger" size="small" onClick={() => confirmDelete(d)} />}
    </div>
  )

  return (
    <div className="card">
      <ConfirmDialog />
      <div className="mb-4 flex justify-content-between align-items-start">
        <div>
          <h3 className="m-0">Divisions</h3>
          <p className="text-color-secondary mt-1 mb-0">Divisions utilisées pour rattacher les agents et router les demandes d&apos;absence</p>
        </div>
        <Button label="Nouvelle division" icon="pi pi-plus" onClick={openCreate} />
      </div>

      <DataTable value={allDivisions} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="Aucune division enregistrée" responsiveLayout="scroll"
        globalFilter={globalFilter} globalFilterFields={['libelle']}
        header={
          <div className="flex justify-content-end">
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Rechercher…" />
            </span>
          </div>
        }>
        <Column header="Libellé" field="libelle" />
        <Column header="Chef de service" body={chefBody} />
        <Column header="Statut" body={actifBody} align="center" alignHeader="center" />
        <Column header="Actions" body={actionsBody} align="center" alignHeader="center" />
      </DataTable>

      <Dialog header={editing ? 'Modifier la division' : 'Nouvelle division'} visible={dialogOpen}
        onHide={() => setDialogOpen(false)} style={{ width: '28rem' }} draggable={false}
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
          <div className="field">
            <label className="block text-sm font-medium mb-1">Chef de service</label>
            <Dropdown value={chefServiceId} onChange={e => setChefServiceId(e.value)} options={chefs}
              showClear placeholder="Sélectionner un chef de service" className="w-full" />
          </div>
          {editing && (
            <div className="flex align-items-center gap-2">
              <InputSwitch inputId="actifDivision" checked={actif} onChange={e => setActif(!!e.value)} />
              <label htmlFor="actifDivision" className="text-sm">Actif</label>
            </div>
          )}
          {error && <Message severity="error" text={error} className="w-full" />}
        </div>
      </Dialog>
    </div>
  )
}

export default function DivisionsPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'CSA', 'DIRECTEUR']}>
      <DivisionsContent />
    </ProtectedRoute>
  )
}
