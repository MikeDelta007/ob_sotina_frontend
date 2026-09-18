'use client'
import { useEffect, useRef, useState } from 'react'
import ProtectedRoute from '@/layout/ProtectedRoute'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { InputSwitch } from 'primereact/inputswitch'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Dialog } from 'primereact/dialog'
import { Dropdown } from 'primereact/dropdown'
import { FileUpload, type FileUploadSelectEvent } from 'primereact/fileupload'
import { InputText } from 'primereact/inputtext'
import { Message } from 'primereact/message'
import { Tag } from 'primereact/tag'
import { Toast } from 'primereact/toast'
import { usePersonnelStore } from '../usePersonnelStore'
import { fmtTypePersonnel, type Chauffeur, type TypePersonnel } from '../types'

const civiliteOptions = [
  { label: 'M.', value: 'Mr' },
  { label: 'Mme', value: 'Mme' },
  { label: 'Mlle', value: 'Mlle' },
]

const typePersonnelOptions: { label: string; value: TypePersonnel }[] = [
  { label: 'Permanent (30 j/an)', value: 'PERMANENT' },
  { label: 'Personnel de sécurité (30 j/an)', value: 'PERSONNEL_SECURITE' },
  { label: "Personnel d'appui (10 j/an)", value: 'PERSONNEL_APPUI' },
  { label: 'Externe (0 j/an)', value: 'EXTERNE' },
]

function PersonnelContent() {
  const toast = useRef<Toast>(null)
  const {
    allChauffeurs, allDivisions, allFonctions, loading, error,
    fetchAllChauffeurs, fetchAllDivisions, fetchAllFonctions,
    createChauffeur, updateChauffeur, deleteChauffeur, importPersonnels, clearError,
  } = usePersonnelStore()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)

  const [editing, setEditing] = useState<Chauffeur | null>(null)
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [matricule, setMatricule] = useState('')
  const [civilite, setCivilite] = useState<string | null>(null)
  const [divisionId, setDivisionId] = useState<string | null>(null)
  const [fonctionId, setFonctionId] = useState<string | null>(null)
  const [typePersonnel, setTypePersonnel] = useState<TypePersonnel | null>(null)
  const [actif, setActif] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => { fetchAllChauffeurs(); fetchAllDivisions(); fetchAllFonctions() }, [])

  const openCreate = () => {
    setEditing(null); setFirstname(''); setLastname(''); setPhone(''); setEmail('')
    setMatricule(''); setCivilite(null); setDivisionId(null); setFonctionId(null); setTypePersonnel(null); setActif(true)
    clearError(); setDialogOpen(true)
  }
  const openEdit = (p: Chauffeur) => {
    setEditing(p); setFirstname(p.firstname); setLastname(p.lastname); setPhone(p.phone ?? ''); setEmail(p.email ?? '')
    setMatricule(p.matricule ?? ''); setCivilite(p.civilite ?? null); setDivisionId(p.division?.id ?? null)
    setFonctionId(p.fonction?.id ?? null); setTypePersonnel(p.typePersonnel ?? null); setActif(p.actif)
    clearError(); setDialogOpen(true)
  }

  // Tout est obligatoire sauf le matricule (le personnel d'appui n'en a pas)
  const formValide = !!firstname.trim() && !!lastname.trim() && !!phone.trim() && !!email.trim()
    && !!civilite && !!divisionId && !!fonctionId && !!typePersonnel

  const save = async () => {
    if (!formValide) return
    try {
      const division = allDivisions.find(d => d.id === divisionId) ?? null
      const fonction = allFonctions.find(f => f.id === fonctionId) ?? null
      const data = { firstname: firstname.trim(), lastname: lastname.trim(), phone, email, matricule, civilite, division, fonction, typePersonnel }
      if (editing) await updateChauffeur(editing.id, { ...data, actif })
      else await createChauffeur(data)
      setDialogOpen(false)
    } catch { /* error déjà affiché via le store */ }
  }

  const confirmDelete = (p: Chauffeur) => {
    confirmDialog({
      message: `Désactiver "${p.firstname} ${p.lastname}" ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Désactiver',
      rejectLabel: 'Annuler',
      accept: () => deleteChauffeur(p.id),
    })
  }

  const doImport = async () => {
    if (!importFile) return
    setImporting(true)
    try {
      const message = await importPersonnels(importFile)
      toast.current?.show({ severity: 'success', summary: 'Office du Bac', detail: message, life: 5000 })
      setImportDialogOpen(false)
      setImportFile(null)
    } catch { /* error déjà affiché via le store, montré dans le dialog */ }
    finally { setImporting(false) }
  }

  const divisionBody = (p: Chauffeur) => p.division?.libelle || '—'
  const fonctionBody = (p: Chauffeur) => p.fonction?.libelle || '—'
  const typeBody = (p: Chauffeur) => p.typePersonnel ? fmtTypePersonnel(p.typePersonnel) : '—'
  const actifBody = (p: Chauffeur) => <Tag severity={p.actif ? 'success' : 'secondary'} value={p.actif ? 'Actif' : 'Inactif'} />
  const actionsBody = (p: Chauffeur) => (
    <div className="flex gap-2 justify-content-center">
      <Button icon="pi pi-pencil" text size="small" onClick={() => openEdit(p)} />
      {p.actif && <Button icon="pi pi-trash" text severity="danger" size="small" onClick={() => confirmDelete(p)} />}
    </div>
  )

  return (
    <div className="card">
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="mb-4 flex justify-content-between align-items-start">
        <div>
          <h3 className="m-0">Personnel</h3>
          <p className="text-color-secondary mt-1 mb-0">
            Fiches personnel sans compte applicatif (chauffeurs, personnel externe...) — importables en masse depuis Excel
          </p>
        </div>
        <div className="flex gap-2">
          <Button label="Importer Excel" icon="pi pi-upload" outlined onClick={() => { setImportFile(null); clearError(); setImportDialogOpen(true) }} />
          <Button label="Nouveau" icon="pi pi-plus" onClick={openCreate} />
        </div>
      </div>

      <DataTable value={allChauffeurs} loading={loading} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="Aucun personnel enregistré" responsiveLayout="scroll"
        globalFilter={globalFilter} globalFilterFields={['firstname', 'lastname', 'matricule', 'phone', 'division.libelle', 'fonction.libelle']}
        header={
          <div className="flex justify-content-end">
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Rechercher…" />
            </span>
          </div>
        }>
        <Column header="Prénom" field="firstname" />
        <Column header="Nom" field="lastname" />
        <Column header="Matricule" field="matricule" body={(p: Chauffeur) => p.matricule || '—'} />
        <Column header="Téléphone" field="phone" body={(p: Chauffeur) => p.phone || '—'} />
        <Column header="Division" body={divisionBody} />
        <Column header="Fonction" body={fonctionBody} />
        <Column header="Type" body={typeBody} />
        <Column header="Statut" body={actifBody} align="center" alignHeader="center" />
        <Column header="Actions" body={actionsBody} align="center" alignHeader="center" />
      </DataTable>

      <Dialog header={editing ? 'Modifier' : 'Nouveau personnel'} visible={dialogOpen}
        onHide={() => setDialogOpen(false)} style={{ width: '30rem' }} draggable={false}
        footer={
          <div className="flex gap-2">
            <Button label="Annuler" outlined className="flex-1" onClick={() => setDialogOpen(false)} />
            <Button label={loading ? 'Enregistrement…' : 'Enregistrer'} className="flex-1" loading={loading}
              disabled={!formValide} onClick={save} />
          </div>
        }>
        <div className="flex flex-column gap-3">
          <div className="formgrid grid">
            <div className="field col-6">
              <label className="block text-sm font-medium mb-1"><span className="text-red-600">*</span> Prénom</label>
              <InputText value={firstname} onChange={e => setFirstname(e.target.value)} className="w-full" autoFocus />
            </div>
            <div className="field col-6">
              <label className="block text-sm font-medium mb-1"><span className="text-red-600">*</span> Nom</label>
              <InputText value={lastname} onChange={e => setLastname(e.target.value)} className="w-full" />
            </div>
          </div>
          <div className="formgrid grid">
            <div className="field col-6">
              <label className="block text-sm font-medium mb-1"><span className="text-red-600">*</span> Téléphone</label>
              <InputText value={phone} onChange={e => setPhone(e.target.value)} className="w-full" />
            </div>
            <div className="field col-6">
              <label className="block text-sm font-medium mb-1"><span className="text-red-600">*</span> Email</label>
              <InputText value={email} onChange={e => setEmail(e.target.value)} className="w-full" />
            </div>
          </div>
          <div className="formgrid grid">
            <div className="field col-4">
              <label className="block text-sm font-medium mb-1"><span className="text-red-600">*</span> Civilité</label>
              <Dropdown value={civilite} onChange={e => setCivilite(e.value)} options={civiliteOptions} placeholder="Civilité" className="w-full" />
            </div>
            <div className="field col-4">
              <label className="block text-sm font-medium mb-1">Matricule</label>
              <InputText value={matricule} onChange={e => setMatricule(e.target.value)} className="w-full" placeholder="Optionnel" />
            </div>
            <div className="field col-4">
              <label className="block text-sm font-medium mb-1"><span className="text-red-600">*</span> Type</label>
              <Dropdown value={typePersonnel} onChange={e => setTypePersonnel(e.value)} options={typePersonnelOptions} placeholder="Type" className="w-full" />
            </div>
          </div>
          <div className="formgrid grid">
            <div className="field col-6">
              <label className="block text-sm font-medium mb-1"><span className="text-red-600">*</span> Division</label>
              <Dropdown value={divisionId} onChange={e => setDivisionId(e.value)} options={allDivisions}
                optionLabel="libelle" optionValue="id" placeholder="Division" className="w-full" />
            </div>
            <div className="field col-6">
              <label className="block text-sm font-medium mb-1"><span className="text-red-600">*</span> Fonction</label>
              <Dropdown value={fonctionId} onChange={e => setFonctionId(e.value)} options={allFonctions}
                optionLabel="libelle" optionValue="id" placeholder="Fonction" className="w-full" />
            </div>
          </div>
          {editing && (
            <div className="flex align-items-center gap-2">
              <InputSwitch inputId="actifPersonnel" checked={actif} onChange={e => setActif(!!e.value)} />
              <label htmlFor="actifPersonnel" className="text-sm">Actif</label>
            </div>
          )}
          {error && <Message severity="error" text={error} className="w-full" />}
        </div>
      </Dialog>

      <Dialog header="Importer un fichier Excel" visible={importDialogOpen} onHide={() => setImportDialogOpen(false)}
        style={{ width: '32rem' }} draggable={false}
        footer={
          <div className="flex gap-2">
            <Button label="Annuler" outlined className="flex-1" onClick={() => setImportDialogOpen(false)} />
            <Button label={importing ? 'Import…' : 'Importer'} className="flex-1" loading={importing}
              disabled={!importFile} onClick={doImport} />
          </div>
        }>
        <div className="flex flex-column gap-3">
          <p className="text-sm text-color-secondary m-0">
            Les colonnes sont détectées par leur nom d&apos;en-tête (peu importe l&apos;ordre) : Prénom(s), Nom,
            Téléphone (ou Contact), Email, Division (ou Service), Fonction — obligatoires. Matricule, Civilité,
            Type de personnel — optionnels (absents d&apos;un export classique, à ajouter si besoin). Division et
            Fonction sont créées automatiquement si leur libellé n&apos;existe pas encore. Matricule (si renseigné),
            email et téléphone doivent être uniques — doublons et lignes incomplètes ignorés.
          </p>
          <FileUpload mode="basic" accept=".xls,.xlsx" customUpload auto={false} chooseLabel="Choisir un fichier Excel"
            onSelect={(e: FileUploadSelectEvent) => setImportFile(e.files[0] ?? null)} />
          {importFile && <Tag severity="success" icon="pi pi-check" value={importFile.name} />}
          {error && <Message severity="error" text={error} className="w-full" />}
        </div>
      </Dialog>
    </div>
  )
}

export default function PersonnelPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'CSA', 'DIRECTEUR']}>
      <PersonnelContent />
    </ProtectedRoute>
  )
}
