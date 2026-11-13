'use client'
import { useEffect, useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { Checkbox } from 'primereact/checkbox'
import { Column } from 'primereact/column'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { DataTable } from 'primereact/datatable'
import { Dialog } from 'primereact/dialog'
import { Dropdown } from 'primereact/dropdown'
import { FileUpload, FileUploadSelectEvent } from 'primereact/fileupload'
import { InputNumber } from 'primereact/inputnumber'
import { InputText } from 'primereact/inputtext'
import { Message } from 'primereact/message'
import { Tag } from 'primereact/tag'
import { Toast } from 'primereact/toast'
import { useAxeStore } from './useAxeStore'
import type { Axe, AxeEtablissement } from './types'

interface Props { peutGerer: boolean }

// Une ligne d'établissement dans le formulaire (avant envoi) — un identifiant local suffit à
// React pour le suivi, il n'est jamais envoyé au serveur.
interface LigneLocale extends AxeEtablissement {
  _localId: string
}

const newLigne = (): LigneLocale => ({
  _localId: Math.random().toString(36).slice(2),
  etablissementId: '', etablissementNom: '', centreSecondaire: false, relais: '',
})

export default function AxesTab({ peutGerer }: Props) {
  const toast = useRef<Toast>(null)
  const {
    axes, etablissements, loading, actionLoadingId, importing, importResult, error,
    fetchAxes, fetchEtablissements, creer, modifier, supprimer, importerExcel, clearError, clearImportResult,
  } = useAxeStore()

  const [globalFilter, setGlobalFilter] = useState('')
  const [detailTarget, setDetailTarget] = useState<Axe | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Axe | null>(null)
  const [numero, setNumero] = useState<number | null>(null)
  const [itineraire, setItineraire] = useState('')
  const [lignes, setLignes] = useState<LigneLocale[]>([newLigne()])
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)

  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [fichierChoisi, setFichierChoisi] = useState<File | null>(null)

  useEffect(() => { fetchAxes(); fetchEtablissements() }, [])

  const openCreate = () => {
    setEditing(null)
    setNumero(null); setItineraire('')
    setLignes([newLigne()]); setErr(''); clearError()
    setDialogOpen(true)
  }

  const openEdit = (axe: Axe) => {
    setEditing(axe)
    setNumero(axe.numero); setItineraire(axe.itineraire)
    setLignes(axe.etablissements.length
      ? axe.etablissements.map(e => ({ ...e, _localId: Math.random().toString(36).slice(2) }))
      : [newLigne()])
    setErr(''); clearError()
    setDialogOpen(true)
  }

  const ajouterLigne = () => setLignes(l => [...l, newLigne()])
  const retirerLigne = (localId: string) => setLignes(l => l.length > 1 ? l.filter(x => x._localId !== localId) : l)
  const majLigne = (localId: string, patch: Partial<LigneLocale>) =>
    setLignes(l => l.map(x => x._localId === localId ? { ...x, ...patch } : x))

  const lignesValides = lignes.filter(l => !!l.etablissementId)
  const formulaireValide = !!numero && !!itineraire.trim() && lignesValides.length > 0

  const soumettre = async () => {
    if (!formulaireValide || !numero) { setErr('Veuillez compléter le numéro, l\'itinéraire et au moins un établissement'); return }
    setSaving(true); setErr('')
    try {
      const payload = {
        numero, itineraire: itineraire.trim(),
        etablissements: lignesValides.map(l => ({
          etablissementId: l.etablissementId, centreSecondaire: l.centreSecondaire, relais: l.relais || undefined,
        })),
      }
      if (editing) await modifier(editing.id, payload)
      else await creer(payload)
      toast.current?.show({ severity: 'success', summary: 'Office du Bac', detail: editing ? 'Axe modifié' : 'Axe créé', life: 4000 })
      setDialogOpen(false)
    } catch (e: any) {
      setErr(e?.response?.data?.errorMessage ?? e?.response?.data?.message ?? 'Erreur lors de l\'enregistrement')
    } finally {
      setSaving(false)
    }
  }

  const confirmSupprimer = (axe: Axe) => {
    confirmDialog({
      message: `Désactiver l'axe ${axe.numero} (${axe.itineraire}) ? Il n'apparaîtra plus dans les listes actives.`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Désactiver',
      acceptClassName: 'p-button-danger',
      rejectLabel: 'Annuler',
      accept: async () => {
        try {
          await supprimer(axe.id)
          toast.current?.show({ severity: 'success', summary: 'Office du Bac', detail: 'Axe désactivé', life: 4000 })
        } catch {
          toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Suppression impossible', life: 4000 })
        }
      },
    })
  }

  const ouvrirImport = () => { setFichierChoisi(null); clearImportResult(); setImportDialogOpen(true) }

  const lancerImport = async () => {
    if (!fichierChoisi) return
    try {
      await importerExcel(fichierChoisi)
      toast.current?.show({ severity: 'success', summary: 'Office du Bac', detail: 'Import terminé', life: 4000 })
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Erreur', detail: "Échec de l'import", life: 4000 })
    }
  }

  const itineraireBody = (axe: Axe) => (
    <div className="flex flex-column">
      <span className="font-medium">Axe {axe.numero}</span>
      <span className="text-color-secondary text-sm">{axe.itineraire}</span>
    </div>
  )
  const nbEtablissementsBody = (axe: Axe) => (
    <Tag severity="info" value={`${axe.etablissements.length} établissement(s)`} />
  )
  const actionsBody = (axe: Axe) => (
    <div className="flex gap-1 justify-content-center">
      <Button icon="pi pi-eye" text rounded size="small" tooltip="Voir le détail" onClick={() => setDetailTarget(axe)} />
      {peutGerer && (
        <>
          <Button icon="pi pi-pencil" text rounded size="small" tooltip="Modifier" onClick={() => openEdit(axe)} />
          <Button icon="pi pi-trash" text rounded severity="danger" size="small" tooltip="Désactiver"
            loading={actionLoadingId === axe.id} onClick={() => confirmSupprimer(axe)} />
        </>
      )}
    </div>
  )

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <p className="text-color-secondary m-0">
          Itinéraires géographiques, avec leurs établissements, centres secondaires et relais
        </p>
        {peutGerer && (
          <div className="flex gap-2">
            <Button label="Importer un fichier Excel" icon="pi pi-upload" outlined onClick={ouvrirImport} />
            <Button label="Nouvel axe" icon="pi pi-plus" onClick={openCreate} />
          </div>
        )}
      </div>

      <DataTable value={axes} loading={loading} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="Aucun axe enregistré" responsiveLayout="scroll"
        globalFilter={globalFilter} globalFilterFields={['itineraire', 'numero']}
        header={
          <div className="flex justify-content-end">
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Rechercher…" />
            </span>
          </div>
        }>
        <Column header="Axe / Itinéraire" body={itineraireBody} sortable sortField="numero" />
        <Column header="Établissements" body={nbEtablissementsBody} align="center" alignHeader="center" />
        <Column header="Actions" body={actionsBody} align="center" alignHeader="center" />
      </DataTable>

      {/* ── Détail (lecture seule) ── */}
      <Dialog header={detailTarget ? `Axe ${detailTarget.numero} — ${detailTarget.itineraire}` : ''}
        visible={!!detailTarget} onHide={() => setDetailTarget(null)}
        style={{ width: '45rem' }} breakpoints={{ '960px': '90vw' }} draggable={false}>
        {detailTarget && (
          <DataTable value={detailTarget.etablissements} paginator rows={15} responsiveLayout="scroll">
            <Column header="Établissement" field="etablissementNom" />
            <Column header="Centre secondaire" align="center" alignHeader="center"
              body={(l: AxeEtablissement) => l.centreSecondaire ? <Tag severity="warning" value="Oui" /> : '—'} />
            <Column header="Relais" field="relais" body={(l: AxeEtablissement) => l.relais || '—'} />
          </DataTable>
        )}
      </Dialog>

      {/* ── Création / modification manuelle ── */}
      <Dialog header={editing ? `Modifier l'axe ${editing.numero}` : 'Nouvel axe'} visible={dialogOpen}
        onHide={() => setDialogOpen(false)} style={{ width: '55rem' }} breakpoints={{ '960px': '90vw' }} draggable={false}
        footer={
          <div className="flex gap-2">
            <Button label="Annuler" outlined className="flex-1" onClick={() => setDialogOpen(false)} />
            <Button label={saving ? 'Enregistrement…' : 'Enregistrer'} className="flex-1" loading={saving}
              disabled={!formulaireValide} onClick={soumettre} />
          </div>
        }>
        <div className="flex flex-column gap-3">
          <div className="grid formgrid">
            <div className="col-12 md:col-4 field">
              <label className="block text-sm font-medium mb-1">Numéro d&apos;axe *</label>
              <InputNumber value={numero} min={1} className="w-full" onValueChange={e => setNumero(e.value ?? null)} />
            </div>
            <div className="col-12 md:col-8 field">
              <label className="block text-sm font-medium mb-1">Itinéraire *</label>
              <InputText value={itineraire} onChange={e => setItineraire(e.target.value)} className="w-full"
                placeholder="Ex. Kaffrine - Tamba - Kédougou - Fatick - Diourbel" />
            </div>
          </div>

          <p className="font-medium mb-0">Établissements de l&apos;axe</p>
          {lignes.map(ligne => (
            <div key={ligne._localId} className="card py-2">
              <div className="grid formgrid align-items-center">
                <div className="col-12 md:col-6 field mb-2 md:mb-0">
                  <Dropdown value={ligne.etablissementId} className="w-full" filter showClear
                    options={etablissements.map(e => ({ label: e.name, value: e.id }))}
                    placeholder="Choisir un établissement…"
                    onChange={e => {
                      const etab = etablissements.find(x => x.id === e.value)
                      majLigne(ligne._localId, { etablissementId: e.value ?? '', etablissementNom: etab?.name })
                    }} />
                </div>
                <div className="col-6 md:col-3 field mb-2 md:mb-0">
                  <InputText value={ligne.relais ?? ''} onChange={e => majLigne(ligne._localId, { relais: e.target.value })}
                    className="w-full" placeholder="Relais (optionnel)" />
                </div>
                <div className="col-4 md:col-2 flex align-items-center gap-2">
                  <Checkbox inputId={`cs-${ligne._localId}`} checked={ligne.centreSecondaire}
                    onChange={e => majLigne(ligne._localId, { centreSecondaire: !!e.checked })} />
                  <label htmlFor={`cs-${ligne._localId}`} className="text-sm">Centre secondaire</label>
                </div>
                <div className="col-2 md:col-1 flex justify-content-end">
                  <Button icon="pi pi-trash" text rounded severity="danger" size="small"
                    disabled={lignes.length === 1} onClick={() => retirerLigne(ligne._localId)} />
                </div>
              </div>
            </div>
          ))}
          <Button type="button" label="Ajouter un établissement" icon="pi pi-plus" outlined onClick={ajouterLigne} />

          {(err || error) && <Message severity="error" text={err || error || ''} className="w-full" />}
        </div>
      </Dialog>

      {/* ── Import Excel ── */}
      <Dialog header="Importer un fichier Excel" visible={importDialogOpen} onHide={() => setImportDialogOpen(false)}
        style={{ width: '32rem' }} draggable={false}
        footer={
          <div className="flex gap-2">
            <Button label="Fermer" outlined className="flex-1" onClick={() => setImportDialogOpen(false)} />
            <Button label={importing ? 'Import en cours…' : 'Importer'} className="flex-1" loading={importing}
              disabled={!fichierChoisi} onClick={lancerImport} />
          </div>
        }>
        <div className="flex flex-column gap-3">
          <Message severity="info" text={
            'Le fichier doit contenir les onglets "Récapitulatif" (Axe, Itinéraire) et ' +
            '"Détail" (Axe, Établissement, Centre secondaire (CS), Relais, ID établissement). ' +
            'Un axe déjà existant (même numéro) est entièrement remplacé.'
          } />
          <FileUpload mode="basic" name="fichier" accept=".xlsx" auto={false} chooseLabel="Choisir un fichier .xlsx"
            onSelect={(e: FileUploadSelectEvent) => setFichierChoisi(e.files[0] ?? null)} />
          {fichierChoisi && <Tag severity="success" icon="pi pi-check" value={fichierChoisi.name} />}

          {importResult && (
            <div className="flex flex-column gap-2">
              <Message severity="success" text={
                `${importResult.axesImportes} axe(s) importé(s) — ${importResult.lignesImportees} établissement(s) rattaché(s)`
              } />
              {importResult.lignesIgnorees > 0 && (
                <Message severity="warn" text={`${importResult.lignesIgnorees} ligne(s) ignorée(s) (établissement non résolu)`} />
              )}
              {importResult.avertissements.length > 0 && (
                <div className="text-sm text-color-secondary" style={{ maxHeight: '10rem', overflowY: 'auto' }}>
                  {importResult.avertissements.map((a, i) => <div key={i}>{a}</div>)}
                </div>
              )}
            </div>
          )}

          {error && <Message severity="error" text={error} className="w-full" />}
        </div>
      </Dialog>
    </div>
  )
}
