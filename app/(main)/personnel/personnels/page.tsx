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
import { useBanqueStore } from '../useBanqueStore'
import { useBankValidation } from '../useBankValidation'
import { usePersonnelValidation } from '../usePersonnelValidation'
import { FormField, FormSection } from '../FormField'
import { fmtTypePersonnel, type Banque, type Chauffeur, type TypePersonnel } from '../types'

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
  const { banques, fetchBanques } = useBanqueStore()
  const { validateBankFields } = useBankValidation()
  const { sanitizePhone, formatPhone, validateField } = usePersonnelValidation()

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

  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const [bank, setBank] = useState('')
  const [codeBank, setCodeBank] = useState('')
  const [codeAgc, setCodeAgc] = useState('')
  const [numCompte, setNumCompte] = useState('')
  const [keyRib, setKeyRib] = useState('')

  useEffect(() => { fetchAllChauffeurs(); fetchAllDivisions(); fetchAllFonctions(); fetchBanques() }, [])

  const resetBankFields = () => { setBank(''); setCodeBank(''); setCodeAgc(''); setNumCompte(''); setKeyRib('') }

  const openCreate = () => {
    setEditing(null); setFirstname(''); setLastname(''); setPhone(''); setEmail('')
    setMatricule(''); setCivilite(null); setDivisionId(null); setFonctionId(null); setTypePersonnel(null); setActif(true)
    resetBankFields()
    setTouched({})
    clearError(); setDialogOpen(true)
  }
  const openEdit = (p: Chauffeur) => {
    setEditing(p); setFirstname(p.firstname); setLastname(p.lastname); setPhone(sanitizePhone(p.phone ?? '')); setEmail(p.email ?? '')
    setMatricule(p.matricule ?? ''); setCivilite(p.civilite ?? null); setDivisionId(p.division?.id ?? null)
    setFonctionId(p.fonction?.id ?? null); setTypePersonnel(p.typePersonnel ?? null); setActif(p.actif)
    setBank(p.bank ?? ''); setCodeBank(p.code_bank ?? ''); setCodeAgc(p.code_agc ?? '')
    setNumCompte(p.num_compte ?? ''); setKeyRib(p.key_rib ?? '')
    setTouched({})
    clearError(); setDialogOpen(true)
  }

  const markTouched = (field: string) => setTouched(prev => ({ ...prev, [field]: true }))
  const shouldShowError = (field: string) => !!touched[field]
  const handlePhoneBlur = () => { markTouched('phone'); setPhone(prev => formatPhone(prev)) }

  // La banque doit toujours être choisie dans la liste : le code banque en est déduit et reste
  // grisé en permanence, jamais saisissable à la main.
  const selectedBanque = banques.find(b => b.name === bank) ?? null
  const handleBanqueChange = (selected: Banque | null) => {
    setBank(selected?.name ?? '')
    setCodeBank(selected?.codeBanque ?? '')
  }

  // Le matricule reste facultatif (le personnel d'appui n'en a pas) ; tous les autres champs,
  // y compris les coordonnées bancaires, sont obligatoires.
  const bankErrors: { bank?: string; code_bank?: string; code_agc?: string; num_compte?: string; key_rib?: string } = validateBankFields({
    code_bank: codeBank, code_agc: codeAgc, num_compte: numCompte, key_rib: keyRib,
  })
  if (!bank.trim()) bankErrors.bank = 'La banque est obligatoire'
  if (!bankErrors.code_agc && !codeAgc.trim()) bankErrors.code_agc = 'Le code agence est obligatoire'
  if (!bankErrors.num_compte && !numCompte.trim()) bankErrors.num_compte = 'Le numéro de compte est obligatoire'
  if (!bankErrors.key_rib && !keyRib.trim()) bankErrors.key_rib = 'La clé RIB est obligatoire'
  const hasBankErrors = Object.keys(bankErrors).length > 0

  const fieldErrors = {
    civilite: validateField('civilite', civilite),
    firstname: validateField('firstname', firstname),
    lastname: validateField('lastname', lastname),
    phone: validateField('phone', phone),
    email: validateField('email', email),
    matricule: validateField('matricule', matricule),
  }
  const hasFieldErrors = Object.values(fieldErrors).some(Boolean)

  const formValide = !hasFieldErrors && !!divisionId && !!fonctionId && !!typePersonnel && !hasBankErrors

  const save = async () => {
    if (!formValide) return
    try {
      const division = allDivisions.find(d => d.id === divisionId) ?? null
      const fonction = allFonctions.find(f => f.id === fonctionId) ?? null
      const data = {
        firstname: firstname.trim(), lastname: lastname.trim(), phone, email, matricule, civilite, division, fonction, typePersonnel,
        bank, code_bank: codeBank, code_agc: codeAgc, num_compte: numCompte, key_rib: keyRib,
      }
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
    <div className="tw-flex tw-justify-center tw-gap-2">
      <Button icon="pi pi-pencil" text size="small" onClick={() => openEdit(p)} />
      {p.actif && <Button icon="pi pi-trash" text severity="danger" size="small" onClick={() => confirmDelete(p)} />}
    </div>
  )

  return (
    <div className="card">
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="tw-mb-6 tw-flex tw-flex-col tw-items-start tw-justify-between tw-gap-4 sm:tw-flex-row sm:tw-items-center">
        <div>
          <h3 className="tw-m-0 tw-text-xl tw-font-semibold">Personnel</h3>
          <p className="tw-mt-1 tw-mb-0 tw-text-sm tw-text-[var(--text-color-secondary)]">
            Fiches personnel sans compte applicatif (chauffeurs, personnel externe...) — importables en masse depuis Excel
          </p>
        </div>
        <div className="tw-flex tw-gap-2">
          <Button label="Importer Excel" icon="pi pi-upload" outlined onClick={() => { setImportFile(null); clearError(); setImportDialogOpen(true) }} />
          <Button label="Nouveau" icon="pi pi-plus" onClick={openCreate} />
        </div>
      </div>

      <div className="tw-overflow-hidden tw-rounded-xl tw-border tw-border-[var(--surface-border)]">
        <DataTable value={allChauffeurs} loading={loading} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
          emptyMessage="Aucun personnel enregistré" responsiveLayout="scroll"
          globalFilter={globalFilter} globalFilterFields={['firstname', 'lastname', 'matricule', 'phone', 'division.libelle', 'fonction.libelle']}
          header={
            <div className="tw-flex tw-justify-end">
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
      </div>

      <Dialog header={editing ? 'Modifier' : 'Nouveau personnel'} visible={dialogOpen}
        onHide={() => setDialogOpen(false)} style={{ width: '48rem' }} draggable={false}
        footer={
          <div className="tw-flex tw-gap-2">
            <Button label="Annuler" outlined className="tw-flex-1" onClick={() => setDialogOpen(false)} />
            <Button label={loading ? 'Enregistrement…' : 'Enregistrer'} className="tw-flex-1" loading={loading}
              disabled={!formValide} onClick={save} />
          </div>
        }>
        <div className="tw-flex tw-flex-col tw-gap-4 tw-pt-2">
          <FormSection title="Identité">
            <div className="tw-grid tw-grid-cols-1 tw-gap-4 sm:tw-grid-cols-2">
              <FormField label="Prénom" required error={shouldShowError('firstname') ? fieldErrors.firstname : undefined}>
                <InputText value={firstname} onChange={e => setFirstname(e.target.value)} onBlur={() => markTouched('firstname')} className="w-full" autoFocus />
              </FormField>
              <FormField label="Nom" required error={shouldShowError('lastname') ? fieldErrors.lastname : undefined}>
                <InputText value={lastname} onChange={e => setLastname(e.target.value)} onBlur={() => markTouched('lastname')} className="w-full" />
              </FormField>
              <FormField label="Téléphone" required error={shouldShowError('phone') ? fieldErrors.phone : undefined}>
                <InputText value={phone} onChange={e => setPhone(sanitizePhone(e.target.value))} onBlur={handlePhoneBlur} keyfilter="num" className="w-full" />
              </FormField>
              <FormField label="Email" required error={shouldShowError('email') ? fieldErrors.email : undefined}>
                <InputText value={email} onChange={e => setEmail(e.target.value)} onBlur={() => markTouched('email')} className="w-full" />
              </FormField>
              <FormField label="Civilité" required error={shouldShowError('civilite') ? fieldErrors.civilite : undefined}>
                <Dropdown value={civilite} onChange={e => setCivilite(e.value)} onBlur={() => markTouched('civilite')} options={civiliteOptions} placeholder="Civilité" className="w-full" />
              </FormField>
              <FormField label="Matricule" hint="Optionnel" error={shouldShowError('matricule') ? fieldErrors.matricule : undefined}>
                <InputText value={matricule} onChange={e => setMatricule(e.target.value)} onBlur={() => markTouched('matricule')} className="w-full" />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Affectation">
            <div className="tw-grid tw-grid-cols-1 tw-gap-4 sm:tw-grid-cols-2">
              <FormField label="Type" required>
                <Dropdown value={typePersonnel} onChange={e => setTypePersonnel(e.value)} options={typePersonnelOptions} placeholder="Type" className="w-full" />
              </FormField>
              <FormField label="Division" required>
                <Dropdown value={divisionId} onChange={e => setDivisionId(e.value)} options={allDivisions}
                  optionLabel="libelle" optionValue="id" placeholder="Division" className="w-full" />
              </FormField>
              <FormField label="Fonction" required>
                <Dropdown value={fonctionId} onChange={e => setFonctionId(e.value)} options={allFonctions}
                  optionLabel="libelle" optionValue="id" placeholder="Fonction" className="w-full" />
              </FormField>
              {editing && (
                <div className="tw-flex tw-items-end tw-gap-2 tw-pb-1.5">
                  <InputSwitch inputId="actifPersonnel" checked={actif} onChange={e => setActif(!!e.value)} />
                  <label htmlFor="actifPersonnel" className="tw-text-sm">Actif</label>
                </div>
              )}
            </div>
          </FormSection>

          <FormSection title="Coordonnées bancaires">
            <div className="tw-grid tw-grid-cols-1 tw-gap-4 sm:tw-grid-cols-3">
              <FormField label="Banque" required error={shouldShowError('bank') ? bankErrors.bank : undefined}>
                <Dropdown value={selectedBanque} onChange={e => handleBanqueChange(e.value)} onBlur={() => markTouched('bank')}
                  options={banques} optionLabel="name" filter showClear placeholder="Choisir une banque" className="w-full" />
              </FormField>
              <FormField label="Code banque" required>
                <InputText value={codeBank} readOnly disabled placeholder="Déduit de la banque sélectionnée" className="w-full" />
              </FormField>
              <FormField label="Code agence" required error={shouldShowError('code_agc') ? bankErrors.code_agc : undefined}>
                <InputText value={codeAgc} onChange={e => setCodeAgc(e.target.value)} onBlur={() => markTouched('code_agc')} keyfilter="num" maxLength={5} className="w-full" />
              </FormField>
              <FormField label="N° compte" required error={shouldShowError('num_compte') ? bankErrors.num_compte : undefined}>
                <InputText value={numCompte} onChange={e => setNumCompte(e.target.value)} onBlur={() => markTouched('num_compte')} keyfilter="num" maxLength={12} className="w-full" />
              </FormField>
              <FormField label="Clé RIB" required error={shouldShowError('key_rib') ? bankErrors.key_rib : undefined}>
                <InputText value={keyRib} onChange={e => setKeyRib(e.target.value)} onBlur={() => markTouched('key_rib')} keyfilter="num" maxLength={2} className="w-full" />
              </FormField>
            </div>
          </FormSection>

          {error && <Message severity="error" text={error} className="w-full" />}
        </div>
      </Dialog>

      <Dialog header="Importer un fichier Excel" visible={importDialogOpen} onHide={() => setImportDialogOpen(false)}
        style={{ width: '32rem' }} draggable={false}
        footer={
          <div className="tw-flex tw-gap-2">
            <Button label="Annuler" outlined className="tw-flex-1" onClick={() => setImportDialogOpen(false)} />
            <Button label={importing ? 'Import…' : 'Importer'} className="tw-flex-1" loading={importing}
              disabled={!importFile} onClick={doImport} />
          </div>
        }>
        <div className="tw-flex tw-flex-col tw-gap-3">
          <p className="tw-m-0 tw-text-sm tw-text-[var(--text-color-secondary)]">
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
