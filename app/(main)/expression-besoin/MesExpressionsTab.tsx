'use client'
import { useEffect, useState } from 'react'
import { Button } from 'primereact/button'
import { Checkbox } from 'primereact/checkbox'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dialog } from 'primereact/dialog'
import { Dropdown } from 'primereact/dropdown'
import { FileUpload, FileUploadSelectEvent } from 'primereact/fileupload'
import { InputNumber } from 'primereact/inputnumber'
import { Message } from 'primereact/message'
import { Tag } from 'primereact/tag'
import { useExpressionBesoinStore } from './useExpressionBesoinStore'
import { fmt, type ExpressionBesoin, type StatutEB } from './types'

const STATUT_SEVERITE: Record<StatutEB, 'warning' | 'success' | 'danger' | 'info'> = {
  EN_ATTENTE: 'warning', VALIDEE: 'info', REJETEE: 'danger', TRAITEE: 'success',
}
const STATUT_LABEL: Record<StatutEB, string> = {
  EN_ATTENTE: 'En attente', VALIDEE: 'Validée', REJETEE: 'Rejetée', TRAITEE: 'Traitée',
}

export default function MesExpressionsTab() {
  const { motifs, mesExpressions, loading, error, fetchMotifs, fetchMesExpressions, creer, modifier } = useExpressionBesoinStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ExpressionBesoin | null>(null)
  const [motifId, setMotifId] = useState('')
  const [montantInitial, setMontantInitial] = useState<number | null>(null)
  const [aFacturePreformat, setAFacturePreformat] = useState(false)
  const [pdfFactureProforma, setPdfFactureProforma] = useState<File | null>(null)
  const [pdfDeclarationHonneur, setPdfDeclarationHonneur] = useState<File | null>(null)
  const [err, setErr] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchMotifs(); fetchMesExpressions() }, [])

  const openCreate = () => {
    setEditing(null); setMotifId(''); setMontantInitial(null); setAFacturePreformat(false)
    setPdfFactureProforma(null); setPdfDeclarationHonneur(null); setErr(''); setDialogOpen(true)
  }
  const openEdit = (eb: ExpressionBesoin) => {
    setEditing(eb); setMotifId(eb.motifId); setMontantInitial(eb.montantInitial)
    setAFacturePreformat(eb.aFacturePreformat); setPdfFactureProforma(null); setPdfDeclarationHonneur(null)
    setErr(''); setDialogOpen(true)
  }
  const fermer = () => setDialogOpen(false)

  const pieceValide = aFacturePreformat
    ? (!!pdfFactureProforma || (!!editing && editing.aFacturePreformat && !!editing.urlPdfFactureProforma))
    : (!!pdfDeclarationHonneur || (!!editing && !editing.aFacturePreformat && !!editing.urlPdfDeclarationHonneur))
  const formulaireValide = !!motifId && !!montantInitial && montantInitial > 0 && pieceValide

  const enregistrer = async () => {
    if (!formulaireValide) { setErr('Veuillez compléter tous les champs et la pièce jointe requise'); return }
    const motif = motifs.find(m => m.id === motifId)
    setSubmitting(true)
    try {
      const payload = {
        motifId, motifLibelle: motif?.libelle, montantInitial: montantInitial!, aFacturePreformat,
        pdfFactureProforma, pdfDeclarationHonneur,
      }
      if (editing) await modifier(editing.id, payload)
      else await creer(payload)
      fermer()
    } catch {
      setErr('Erreur lors de l\'enregistrement')
    } finally {
      setSubmitting(false)
    }
  }

  const statutBody = (eb: ExpressionBesoin) => <Tag severity={STATUT_SEVERITE[eb.statut]} value={STATUT_LABEL[eb.statut]} />
  const dateBody = (eb: ExpressionBesoin) => (
    <span className="text-color-secondary text-sm">{new Date(eb.dateCreation).toLocaleDateString('fr-FR')}</span>
  )
  const actionsBody = (eb: ExpressionBesoin) => (
    eb.statut === 'EN_ATTENTE'
      ? <Button icon="pi pi-pencil" label="Modifier" text size="small" onClick={() => openEdit(eb)} />
      : null
  )

  return (
    <div>
      <div className="flex justify-content-end mb-3">
        <Button label="Nouvelle expression de besoin" icon="pi pi-plus" onClick={openCreate} />
      </div>

      <DataTable value={mesExpressions} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
        loading={loading} emptyMessage="Aucune expression de besoin" responsiveLayout="scroll">
        <Column header="Date" body={dateBody} />
        <Column header="Désignation" field="motifLibelle" />
        <Column header="Montant initial" body={(eb: ExpressionBesoin) => fmt(eb.montantInitial)} align="right" alignHeader="right" />
        <Column header="Statut" body={statutBody} align="center" alignHeader="center" />
        <Column header="Montant réel" body={(eb: ExpressionBesoin) => eb.montantReel ? fmt(eb.montantReel) : '—'} align="right" alignHeader="right" />
        <Column header="Bénéficiaire" body={(eb: ExpressionBesoin) => eb.beneficiaire || '—'} />
        <Column header="Motif de rejet" body={(eb: ExpressionBesoin) => eb.motifRejet || '—'} />
        <Column header="Actions" body={actionsBody} align="center" alignHeader="center" />
      </DataTable>

      <Dialog header={editing ? 'Modifier l\'expression de besoin' : 'Nouvelle expression de besoin'}
        visible={dialogOpen} onHide={fermer} style={{ width: '32rem' }} draggable={false}
        footer={
          <div className="flex gap-2">
            <Button label="Annuler" outlined className="flex-1" onClick={fermer} disabled={submitting} />
            <Button label="Enregistrer" className="flex-1" loading={submitting}
              disabled={submitting} onClick={enregistrer} />
          </div>
        }>
        <div className="flex flex-column gap-4">
          <div className="field">
            <label className="block text-sm font-medium mb-1">Désignation *</label>
            <Dropdown value={motifId} options={motifs.map(m => ({ label: m.libelle, value: m.id }))}
              onChange={e => setMotifId(e.value)} className="w-full" placeholder="Choisir un motif…" />
          </div>

          <div className="field">
            <label className="block text-sm font-medium mb-1">Montant initial (FCFA) *</label>
            <InputNumber value={montantInitial} min={1} className="w-full"
              onValueChange={e => setMontantInitial(e.value ?? null)} placeholder="0" />
          </div>

          <div className="flex align-items-center gap-2">
            <Checkbox inputId="aProforma" checked={aFacturePreformat}
              onChange={e => setAFacturePreformat(!!e.checked)} />
            <label htmlFor="aProforma" className="text-sm">J'ai une facture proforma</label>
          </div>

          {aFacturePreformat ? (
            <div className="field">
              <label className="block text-sm text-color-secondary mb-1">Facture proforma (PDF) *</label>
              <div className="flex align-items-center gap-2">
                <FileUpload mode="basic" name="pdfFactureProforma" accept="application/pdf" auto={false}
                  chooseLabel="Choisir un PDF"
                  onSelect={(e: FileUploadSelectEvent) => setPdfFactureProforma(e.files[0] ?? null)} />
                {pdfFactureProforma && <Tag severity="success" icon="pi pi-check" value={pdfFactureProforma.name} />}
                {!pdfFactureProforma && editing?.urlPdfFactureProforma && editing.aFacturePreformat && (
                  <Tag severity="secondary" icon="pi pi-file-pdf" value="Fichier existant" />
                )}
              </div>
            </div>
          ) : (
            <div className="field">
              <label className="block text-sm text-color-secondary mb-1">Déclaration sur l'honneur (PDF) *</label>
              <div className="flex align-items-center gap-2">
                <FileUpload mode="basic" name="pdfDeclarationHonneur" accept="application/pdf" auto={false}
                  chooseLabel="Choisir un PDF"
                  onSelect={(e: FileUploadSelectEvent) => setPdfDeclarationHonneur(e.files[0] ?? null)} />
                {pdfDeclarationHonneur && <Tag severity="success" icon="pi pi-check" value={pdfDeclarationHonneur.name} />}
                {!pdfDeclarationHonneur && editing?.urlPdfDeclarationHonneur && !editing.aFacturePreformat && (
                  <Tag severity="secondary" icon="pi pi-file-pdf" value="Fichier existant" />
                )}
              </div>
            </div>
          )}

          {err && <Message severity="error" text={err} className="w-full" />}
          {error && <Message severity="error" text={error} className="w-full" />}
        </div>
      </Dialog>
    </div>
  )
}
