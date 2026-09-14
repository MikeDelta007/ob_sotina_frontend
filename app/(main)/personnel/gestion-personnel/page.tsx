'use client'
import { useEffect, useState } from 'react'
import ProtectedRoute from '@/layout/ProtectedRoute'
import { TabPanel, TabView } from 'primereact/tabview'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Checkbox } from 'primereact/checkbox'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Dialog } from 'primereact/dialog'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { Message } from 'primereact/message'
import { Tag } from 'primereact/tag'
import { ParametrageService } from '@/demo/service/ParametrageService'
import { usePersonnelStore } from '../usePersonnelStore'
import type { Division, Fonction } from '../types'

function DivisionsTab() {
  const { allDivisions, loading, error, fetchAllDivisions, createDivision, updateDivision, deleteDivision, clearError } = usePersonnelStore()
  const [chefs, setChefs] = useState<{ label: string; value: string }[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Division | null>(null)
  const [libelle, setLibelle] = useState('')
  const [chefServiceId, setChefServiceId] = useState<string | null>(null)
  const [actif, setActif] = useState(true)

  useEffect(() => { fetchAllDivisions() }, [])
  useEffect(() => {
    ParametrageService.getUsers().then((groupes: Record<string, any[]>) => {
      const chefsDeService = groupes?.CHEF_SERVICE ?? []
      setChefs(chefsDeService.map((u: any) => ({ label: `${u.firstname} ${u.lastname} (${u.login})`, value: u.id })))
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

  const chefBody = (d: Division) => chefs.find(c => c.value === d.chefServiceId)?.label ?? '—'
  const actifBody = (d: Division) => <Tag severity={d.actif ? 'success' : 'secondary'} value={d.actif ? 'Actif' : 'Inactif'} />
  const actionsBody = (d: Division) => (
    <div className="flex gap-2 justify-content-center">
      <Button icon="pi pi-pencil" text size="small" onClick={() => openEdit(d)} />
      {d.actif && <Button icon="pi pi-trash" text severity="danger" size="small" onClick={() => confirmDelete(d)} />}
    </div>
  )

  return (
    <div>
      <ConfirmDialog />
      <div className="flex justify-content-end mb-3">
        <Button label="Nouvelle division" icon="pi pi-plus" onClick={openCreate} />
      </div>

      <DataTable value={allDivisions} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="Aucune division enregistrée" responsiveLayout="scroll">
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
              <Checkbox inputId="actifDivision" checked={actif} onChange={e => setActif(!!e.checked)} />
              <label htmlFor="actifDivision" className="text-sm">Actif</label>
            </div>
          )}
          {error && <Message severity="error" text={error} className="w-full" />}
        </div>
      </Dialog>
    </div>
  )
}

function FonctionsTab() {
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
    <div>
      <ConfirmDialog />
      <div className="flex justify-content-end mb-3">
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
              <Checkbox inputId="actifFonction" checked={actif} onChange={e => setActif(!!e.checked)} />
              <label htmlFor="actifFonction" className="text-sm">Actif</label>
            </div>
          )}
          {error && <Message severity="error" text={error} className="w-full" />}
        </div>
      </Dialog>
    </div>
  )
}

function GestionPersonnelContent() {
  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="m-0">Gestion du personnel</h3>
        <p className="text-color-secondary mt-1 mb-0">Divisions et fonctions utilisées pour les comptes agents</p>
      </div>
      <TabView>
        <TabPanel header="Divisions" leftIcon="pi pi-sitemap mr-2">
          <DivisionsTab />
        </TabPanel>
        <TabPanel header="Fonctions" leftIcon="pi pi-briefcase mr-2">
          <FonctionsTab />
        </TabPanel>
      </TabView>
    </div>
  )
}

export default function GestionPersonnelPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'CSA', 'DIRECTEUR']}>
      <GestionPersonnelContent />
    </ProtectedRoute>
  )
}
