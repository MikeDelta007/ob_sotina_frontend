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
import { usePersonnelStore } from '../usePersonnelStore'
import type { Chauffeur } from '../types'

function ChauffeursContent() {
  const {
    allChauffeurs, allFonctions, loading, error,
    fetchAllChauffeurs, fetchAllFonctions, createChauffeur, updateChauffeur, deleteChauffeur, clearError,
  } = usePersonnelStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Chauffeur | null>(null)
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [phone, setPhone] = useState('')
  const [fonctionId, setFonctionId] = useState<string | null>(null)
  const [actif, setActif] = useState(true)

  useEffect(() => { fetchAllChauffeurs(); fetchAllFonctions() }, [])

  const fonctionChauffeurParDefaut = () =>
    allFonctions.find(f => f.libelle.trim().toLowerCase() === 'chauffeur') ?? null

  const openCreate = () => {
    setEditing(null); setFirstname(''); setLastname(''); setPhone(''); setFonctionId(fonctionChauffeurParDefaut()?.id ?? null); setActif(true)
    clearError(); setDialogOpen(true)
  }
  const openEdit = (c: Chauffeur) => {
    setEditing(c); setFirstname(c.firstname); setLastname(c.lastname); setPhone(c.phone ?? ''); setFonctionId(c.fonction?.id ?? null); setActif(c.actif)
    clearError(); setDialogOpen(true)
  }

  const save = async () => {
    if (!firstname.trim() || !lastname.trim()) return
    try {
      const fonction = allFonctions.find(f => f.id === fonctionId) ?? null
      if (editing) await updateChauffeur(editing.id, { firstname: firstname.trim(), lastname: lastname.trim(), phone, fonction, actif })
      else await createChauffeur({ firstname: firstname.trim(), lastname: lastname.trim(), phone, fonction })
      setDialogOpen(false)
    } catch { /* error déjà affiché via le store */ }
  }

  const confirmDelete = (c: Chauffeur) => {
    confirmDialog({
      message: `Désactiver "${c.firstname} ${c.lastname}" ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Désactiver',
      rejectLabel: 'Annuler',
      accept: () => deleteChauffeur(c.id),
    })
  }

  const fonctionBody = (c: Chauffeur) => c.fonction?.libelle || '—'
  const actifBody = (c: Chauffeur) => <Tag severity={c.actif ? 'success' : 'secondary'} value={c.actif ? 'Actif' : 'Inactif'} />
  const actionsBody = (c: Chauffeur) => (
    <div className="flex gap-2 justify-content-center">
      <Button icon="pi pi-pencil" text size="small" onClick={() => openEdit(c)} />
      {c.actif && <Button icon="pi pi-trash" text severity="danger" size="small" onClick={() => confirmDelete(c)} />}
    </div>
  )

  return (
    <div className="card">
      <ConfirmDialog />
      <div className="mb-4 flex justify-content-between align-items-start">
        <div>
          <h3 className="m-0">Chauffeurs</h3>
          <p className="text-color-secondary mt-1 mb-0">
            Personnel de fonction &quot;Chauffeur&quot; (généralement externe à l&apos;Office du Bac, sans compte),
            pouvant être désigné conducteur d&apos;une mission
          </p>
        </div>
        <Button label="Nouveau chauffeur" icon="pi pi-plus" onClick={openCreate} />
      </div>

      <DataTable value={allChauffeurs} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="Aucun chauffeur enregistré" responsiveLayout="scroll">
        <Column header="Prénom" field="firstname" />
        <Column header="Nom" field="lastname" />
        <Column header="Téléphone" field="phone" body={(c: Chauffeur) => c.phone || '—'} />
        <Column header="Fonction" body={fonctionBody} />
        <Column header="Statut" body={actifBody} align="center" alignHeader="center" />
        <Column header="Actions" body={actionsBody} align="center" alignHeader="center" />
      </DataTable>

      <Dialog header={editing ? 'Modifier' : 'Nouveau personnel'} visible={dialogOpen}
        onHide={() => setDialogOpen(false)} style={{ width: '25rem' }} draggable={false}
        footer={
          <div className="flex gap-2">
            <Button label="Annuler" outlined className="flex-1" onClick={() => setDialogOpen(false)} />
            <Button label={loading ? 'Enregistrement…' : 'Enregistrer'} className="flex-1" loading={loading}
              disabled={!firstname.trim() || !lastname.trim()} onClick={save} />
          </div>
        }>
        <div className="flex flex-column gap-3">
          <div className="field">
            <label className="block text-sm font-medium mb-1">Prénom</label>
            <InputText value={firstname} onChange={e => setFirstname(e.target.value)} className="w-full" autoFocus />
          </div>
          <div className="field">
            <label className="block text-sm font-medium mb-1">Nom</label>
            <InputText value={lastname} onChange={e => setLastname(e.target.value)} className="w-full" />
          </div>
          <div className="field">
            <label className="block text-sm font-medium mb-1">Téléphone</label>
            <InputText value={phone} onChange={e => setPhone(e.target.value)} className="w-full" />
          </div>
          <div className="field">
            <label className="block text-sm font-medium mb-1">Fonction</label>
            <Dropdown value={fonctionId} onChange={e => setFonctionId(e.value)} options={allFonctions}
              optionLabel="libelle" optionValue="id" showClear placeholder="Sélectionner une fonction (ex : Chauffeur)" className="w-full" />
            {!fonctionChauffeurParDefaut() && (
              <small className="text-color-secondary">
                Aucune fonction &quot;Chauffeur&quot; n&apos;existe encore — crée-la dans Gestion personnel → Fonctions.
              </small>
            )}
          </div>
          {editing && (
            <div className="flex align-items-center gap-2">
              <InputSwitch inputId="actifChauffeur" checked={actif} onChange={e => setActif(!!e.value)} />
              <label htmlFor="actifChauffeur" className="text-sm">Actif</label>
            </div>
          )}
          {error && <Message severity="error" text={error} className="w-full" />}
        </div>
      </Dialog>
    </div>
  )
}

export default function ChauffeursPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'CSA', 'DIRECTEUR']}>
      <ChauffeursContent />
    </ProtectedRoute>
  )
}
