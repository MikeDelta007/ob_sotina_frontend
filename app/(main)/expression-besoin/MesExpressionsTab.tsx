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
import { fmt, designationLignes, type ExpressionBesoin, type StatutEB } from './types'

const STATUT_SEVERITE: Record<StatutEB, 'warning' | 'success' | 'danger' | 'info'> = {
  EN_ATTENTE: 'warning', VALIDEE: 'info', REJETEE: 'danger', TRAITEE: 'success',
}
const STATUT_LABEL: Record<StatutEB, string> = {
  EN_ATTENTE: 'En attente', VALIDEE: 'Validée', REJETEE: 'Rejetée', TRAITEE: 'Traitée',
}

interface LigneLocale {
  _localId: string
  motifId: string
  motifLibelle?: string
  quantite: number | null
  prixUnitaire: number | null
}

const nouvelleLigne = (): LigneLocale => ({
  _localId: Math.random().toString(36).slice(2),
  motifId: '', quantite: null, prixUnitaire: null,
})

export default function MesExpressionsTab() {
  const { motifs, mesExpressions, loading, error, fetchMotifs, fetchMesExpressions, creer, modifier } = useExpressionBesoinStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ExpressionBesoin | null>(null)
  const [lignes, setLignes] = useState<LigneLocale[]>([nouvelleLigne()])
  const [aFacturePreformat, setAFacturePreformat] = useState(false)
  const [pdfFactureProforma, setPdfFactureProforma] = useState<File | null>(null)
  const [err, setErr] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchMotifs(); fetchMesExpressions() }, [])

  const openCreate = () => {
    setEditing(null); setLignes([nouvelleLigne()]); setAFacturePreformat(false)
    setPdfFactureProforma(null); setErr(''); setDialogOpen(true)
  }
  const openEdit = (eb: ExpressionBesoin) => {
    setEditing(eb)
    setLignes((eb.lignes ?? []).map(l => ({
      _localId: Math.random().toString(36).slice(2),
      motifId: l.motifId, motifLibelle: l.motifLibelle, quantite: l.quantite, prixUnitaire: l.prixUnitaire,
    })))
    setAFacturePreformat(eb.aFacturePreformat); setPdfFactureProforma(null)
    setErr(''); setDialogOpen(true)
  }
  const fermer = () => setDialogOpen(false)

  const updLigne = (id: string, patch: Partial<LigneLocale>) =>
    setLignes(ls => ls.map(l => l._localId === id ? { ...l, ...patch } : l))
  const addLigne = () => setLignes(ls => [...ls, nouvelleLigne()])
  const removeLigne = (id: string) => setLignes(ls => ls.filter(l => l._localId !== id))

  const montantLigne = (l: LigneLocale) => (l.quantite ?? 1) * (l.prixUnitaire ?? 0)
  const total = lignes.reduce((s, l) => s + montantLigne(l), 0)
  const lignesValides = lignes.length > 0
    && lignes.every(l => !!l.motifId && !!l.prixUnitaire && l.prixUnitaire > 0)
  const pieceValide = !aFacturePreformat
    || !!pdfFactureProforma || (!!editing && editing.aFacturePreformat && !!editing.urlPdfFactureProforma)
  const formulaireValide = lignesValides && pieceValide

  const enregistrer = async () => {
    if (!formulaireValide) { setErr('Veuillez compléter toutes les lignes et la pièce jointe requise'); return }
    setSubmitting(true)
    try {
      const payload = {
        lignes: lignes.map(l => {
          const motif = motifs.find(m => m.id === l.motifId)
          return { motifId: l.motifId, motifLibelle: motif?.libelle ?? l.motifLibelle, quantite: l.quantite ?? undefined, prixUnitaire: l.prixUnitaire! }
        }),
        aFacturePreformat, pdfFactureProforma,
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
  const designationBody = (eb: ExpressionBesoin) => designationLignes(eb.lignes)
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
        <Column header="Désignation" body={designationBody} />
        <Column header="Montant initial" body={(eb: ExpressionBesoin) => fmt(eb.montantInitial)} align="right" alignHeader="right" />
        <Column header="Statut" body={statutBody} align="center" alignHeader="center" />
        <Column header="Montant réel" body={(eb: ExpressionBesoin) => eb.montantReel ? fmt(eb.montantReel) : '—'} align="right" alignHeader="right" />
        <Column header="Bénéficiaire" body={(eb: ExpressionBesoin) => eb.beneficiaire || '—'} />
        <Column header="Motif de rejet" body={(eb: ExpressionBesoin) => eb.motifRejet || '—'} />
        <Column header="Actions" body={actionsBody} align="center" alignHeader="center" />
      </DataTable>

      <Dialog header={editing ? 'Modifier l\'expression de besoin' : 'Nouvelle expression de besoin'}
        visible={dialogOpen} onHide={fermer} style={{ width: '42rem' }} draggable={false}
        footer={
          <div className="flex gap-2">
            <Button label="Annuler" outlined className="flex-1" onClick={fermer} disabled={submitting} />
            <Button label="Enregistrer" className="flex-1" loading={submitting}
              disabled={submitting} onClick={enregistrer} />
          </div>
        }>
        <div className="flex flex-column gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Lignes de la demande *</label>
            {lignes.map((l, i) => (
              <div key={l._localId} className="card mb-2 p-3">
                <div className="flex align-items-center justify-content-between mb-2">
                  <span className="text-sm font-medium text-color-secondary">Ligne {i + 1}</span>
                  {lignes.length > 1 && (
                    <Button icon="pi pi-trash" text severity="danger" size="small"
                      onClick={() => removeLigne(l._localId)} />
                  )}
                </div>
                <div className="grid formgrid">
                  <div className="col-12 field mb-2">
                    <label className="block text-sm text-color-secondary mb-1">Désignation</label>
                    <Dropdown value={l.motifId} options={motifs.map(m => ({ label: m.libelle, value: m.id }))}
                      onChange={e => updLigne(l._localId, { motifId: e.value })}
                      className="w-full" placeholder="Choisir un motif…" />
                  </div>
                  <div className="col-6 field mb-0">
                    <label className="block text-sm text-color-secondary mb-1">Quantité (optionnelle)</label>
                    <InputNumber value={l.quantite} min={1} className="w-full"
                      onValueChange={e => updLigne(l._localId, { quantite: e.value ?? null })} placeholder="—" />
                  </div>
                  <div className="col-6 field mb-0">
                    <label className="block text-sm text-color-secondary mb-1">Prix unitaire (FCFA)</label>
                    <InputNumber value={l.prixUnitaire} min={1} className="w-full"
                      onValueChange={e => updLigne(l._localId, { prixUnitaire: e.value ?? null })} placeholder="0" />
                  </div>
                </div>
                {!!l.prixUnitaire && (
                  <div className="text-right text-sm text-color-secondary mt-2">
                    Sous-total : <strong>{fmt(montantLigne(l))}</strong>
                  </div>
                )}
              </div>
            ))}
            <Button type="button" label="Ajouter une ligne" icon="pi pi-plus" outlined
              className="w-full" onClick={addLigne} />
          </div>

          {total > 0 && (
            <div className="card mt-0 flex justify-content-between align-items-center py-2">
              <span className="text-color-secondary">Montant initial total</span>
              <strong>{fmt(total)}</strong>
            </div>
          )}

          <div className="flex align-items-center gap-2">
            <Checkbox inputId="aProforma" checked={aFacturePreformat}
              onChange={e => setAFacturePreformat(!!e.checked)} />
            <label htmlFor="aProforma" className="text-sm">J'ai une facture proforma</label>
          </div>

          {aFacturePreformat && (
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
          )}

          {err && <Message severity="error" text={err} className="w-full" />}
          {error && <Message severity="error" text={error} className="w-full" />}
        </div>
      </Dialog>
    </div>
  )
}
