'use client'
import { useEffect, useState } from 'react'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dialog } from 'primereact/dialog'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Dropdown } from 'primereact/dropdown'
import { FileUpload, FileUploadSelectEvent } from 'primereact/fileupload'
import { InputNumber } from 'primereact/inputnumber'
import { InputText } from 'primereact/inputtext'
import { Message } from 'primereact/message'
import { Tag } from 'primereact/tag'
import { useExpressionBesoinStore } from './useExpressionBesoinStore'
import EtapesColonne from './EtapesColonne'
import TwCheckbox from './TwCheckbox'
import { fmt, designationEb, type ExpressionBesoin, type StatutEB } from './types'

const STATUT_SEVERITE: Record<StatutEB, 'warning' | 'success' | 'danger' | 'info'> = {
  EN_ATTENTE: 'warning', VALIDEE: 'info', REJETEE: 'danger', TRAITEE: 'success',
}
const STATUT_LABEL: Record<StatutEB, string> = {
  EN_ATTENTE: 'En attente', VALIDEE: 'Validée', REJETEE: 'Rejetée', TRAITEE: 'Traitée',
}

export default function MesExpressionsTab() {
  const { motifs, mesAgents, mesExpressions, loading, error, actionLoadingId,
          fetchMotifs, fetchMesAgents, fetchMesExpressions, creer, modifier, confirmerSatisfaction } = useExpressionBesoinStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ExpressionBesoin | null>(null)
  const [motifId, setMotifId] = useState('')
  const [quantite, setQuantite] = useState<number | null>(null)
  const [prixUnitaire, setPrixUnitaire] = useState<number | null>(null)
  const [beneficiaireMoiMeme, setBeneficiaireMoiMeme] = useState(true)
  const [beneficiaireId, setBeneficiaireId] = useState('')
  const [aFacturePreformat, setAFacturePreformat] = useState(false)
  const [pdfFactureProforma, setPdfFactureProforma] = useState<File | null>(null)
  const [pdfDeclarationHonneur, setPdfDeclarationHonneur] = useState<File | null>(null)
  const [err, setErr] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => { fetchMotifs(); fetchMesAgents(); fetchMesExpressions() }, [])

  const openCreate = () => {
    setEditing(null)
    setMotifId(''); setQuantite(null); setPrixUnitaire(null)
    setBeneficiaireMoiMeme(true); setBeneficiaireId('')
    setAFacturePreformat(false)
    setPdfFactureProforma(null); setPdfDeclarationHonneur(null); setErr(''); setDialogOpen(true)
  }
  const openEdit = (eb: ExpressionBesoin) => {
    setEditing(eb)
    setMotifId(eb.motifId); setQuantite(eb.quantite ?? null); setPrixUnitaire(eb.prixUnitaire)
    setBeneficiaireMoiMeme(eb.beneficiaireMoiMeme ?? true); setBeneficiaireId(eb.beneficiaireMoiMeme ? '' : (eb.beneficiaireId ?? ''))
    setAFacturePreformat(eb.aFacturePreformat); setPdfFactureProforma(null); setPdfDeclarationHonneur(null)
    setErr(''); setDialogOpen(true)
  }
  const fermer = () => setDialogOpen(false)

  const confirmerSatisfactionAvecConfirmation = (eb: ExpressionBesoin) => {
    confirmDialog({
      message: 'Confirmez-vous être satisfait(e) de cette expression de besoin ? Cette action est définitive.',
      header: 'Confirmation',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Confirmer',
      rejectLabel: 'Annuler',
      accept: () => confirmerSatisfaction(eb.id),
    })
  }

  const montant = (quantite ?? 1) * (prixUnitaire ?? 0)
  const formulaireValide = !!motifId && !!prixUnitaire && prixUnitaire > 0
    && (beneficiaireMoiMeme || !!beneficiaireId)
    && (aFacturePreformat
      ? (!!pdfFactureProforma || (!!editing && editing.aFacturePreformat && !!editing.urlPdfFactureProforma))
      : (!!pdfDeclarationHonneur || (!!editing && !editing.aFacturePreformat && !!editing.urlPdfDeclarationHonneur)))

  const enregistrer = async () => {
    if (!formulaireValide) { setErr('Veuillez compléter le motif, le bénéficiaire et la pièce jointe requise'); return }
    setSubmitting(true)
    try {
      const motif = motifs.find(m => m.id === motifId)
      const payload = {
        motifId, motifLibelle: motif?.libelle, quantite: quantite ?? undefined, prixUnitaire: prixUnitaire!,
        aFacturePreformat, beneficiaireMoiMeme, beneficiaireId: beneficiaireMoiMeme ? undefined : beneficiaireId,
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
  const satisfactionBody = (eb: ExpressionBesoin) => {
    if (!eb.requiertSatisfaction) return <span className="text-color-secondary">—</span>
    return eb.satisfactionConfirmee
      ? <Tag severity="success" icon="pi pi-check" value="Confirmée" />
      : <Tag severity="warning" value="En attente" />
  }

  const actionsBody = (eb: ExpressionBesoin) => (
    <div className="flex gap-1 align-items-center justify-content-center">
      {eb.statut === 'EN_ATTENTE' && (
        <Button icon="pi pi-pencil" label="Modifier" text size="small" onClick={() => openEdit(eb)} />
      )}
      {eb.statut === 'TRAITEE' && eb.requiertSatisfaction && !eb.satisfactionConfirmee && (
        <Button label="Confirmer ma satisfaction" icon="pi pi-check" size="small" severity="success"
          loading={actionLoadingId === eb.id} onClick={() => confirmerSatisfactionAvecConfirmation(eb)} />
      )}
    </div>
  )

  return (
    <div>
      <ConfirmDialog />
      <DataTable value={mesExpressions} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
        loading={loading} emptyMessage="Aucune expression de besoin" responsiveLayout="scroll"
        globalFilter={globalFilter} globalFilterFields={['motifLibelle', 'beneficiaireNom', 'motifRejet', 'statut']}
        header={
          <div className="flex justify-content-between align-items-center">
            <Button label="Nouvelle expression de besoin" icon="pi pi-plus" onClick={openCreate} />
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Rechercher…" />
            </span>
          </div>
        }>
        <Column header="Date" body={dateBody} />
        <Column header="Désignation" body={designationEb} />
        <Column header="Montant initial" body={(eb: ExpressionBesoin) => fmt(eb.montantInitial)} align="right" alignHeader="right" />
        <Column header="Bénéficiaire" body={(eb: ExpressionBesoin) => eb.beneficiaireNom || '—'} />
        <Column header="Statut" body={statutBody} align="center" alignHeader="center" />
        <Column header="Montant réel" body={(eb: ExpressionBesoin) => eb.montantReel ? fmt(eb.montantReel) : '—'} align="right" alignHeader="right" />
        <Column header="Étapes" body={(eb: ExpressionBesoin) => <EtapesColonne eb={eb} />} />
        <Column header="Satisfaction" body={satisfactionBody} align="center" alignHeader="center" />
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
          <div className="grid formgrid">
            <div className="col-12 field mb-2">
              <label className="block text-sm text-color-secondary mb-1">Désignation *</label>
              <Dropdown value={motifId} options={motifs.map(m => ({ label: m.libelle, value: m.id }))}
                onChange={e => setMotifId(e.value)} className="w-full" placeholder="Choisir un motif…" />
            </div>
            <div className="col-6 field mb-0">
              <label className="block text-sm text-color-secondary mb-1">Quantité (optionnelle)</label>
              <InputNumber value={quantite} min={1} className="w-full"
                onValueChange={e => setQuantite(e.value ?? null)} placeholder="—" />
            </div>
            <div className="col-6 field mb-0">
              <label className="block text-sm text-color-secondary mb-1">Prix unitaire (FCFA) *</label>
              <InputNumber value={prixUnitaire} min={1} className="w-full"
                onValueChange={e => setPrixUnitaire(e.value ?? null)} placeholder="0" />
            </div>
          </div>

          {!!prixUnitaire && (
            <div className="card mt-0 flex justify-content-between align-items-center py-2">
              <span className="text-color-secondary">Montant initial</span>
              <strong>{fmt(montant)}</strong>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Bénéficiaire *</label>
            <div className="tw-flex tw-flex-col tw-gap-2">
              <TwCheckbox id="beneficiaireMoiMeme" checked={beneficiaireMoiMeme}
                onChange={c => { setBeneficiaireMoiMeme(c); if (c) setBeneficiaireId('') }}
                label="Moi-même" />
              {!beneficiaireMoiMeme && (
                <Dropdown value={beneficiaireId} options={mesAgents.map(a => ({ label: `${a.firstname} ${a.lastname}`, value: a.id }))}
                  onChange={e => setBeneficiaireId(e.value)} className="w-full" filter
                  placeholder={mesAgents.length ? 'Choisir un agent de ma division…' : 'Aucun agent dans ma division'}
                  disabled={!mesAgents.length} />
              )}
            </div>
          </div>

          <div>
            <TwCheckbox id="aProforma" checked={aFacturePreformat}
              onChange={c => setAFacturePreformat(c)} label="J'ai une facture proforma" />
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
              <label className="block text-sm text-color-secondary mb-1">Déclaration sur l&apos;honneur (PDF) *</label>
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
