'use client'
import { useEffect, useState } from 'react'
import axiosInstance from '@/app/api/axiosInstance'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dialog } from 'primereact/dialog'
import { InputTextarea } from 'primereact/inputtextarea'
import { Message } from 'primereact/message'
import { Tag } from 'primereact/tag'
import { useExpressionBesoinStore } from './useExpressionBesoinStore'
import { fmt, directeurRequis, type ExpressionBesoin } from './types'

const FILES_ORIGIN = (axiosInstance.defaults.baseURL ?? '').replace(/\/?api\/v1\/?$/, '')

export default function AValiderTab() {
  const { aValider, actionLoadingId, fetchAValider, valider, rejeter } = useExpressionBesoinStore()
  const [rejetTarget, setRejetTarget] = useState<ExpressionBesoin | null>(null)
  const [motifRejet, setMotifRejet] = useState('')
  const [validerTarget, setValiderTarget] = useState<ExpressionBesoin | null>(null)
  const [err, setErr] = useState('')

  useEffect(() => { fetchAValider() }, [])

  const ouvrirRejet = (eb: ExpressionBesoin) => { setRejetTarget(eb); setMotifRejet(''); setErr('') }
  const fermerRejet = () => setRejetTarget(null)

  const confirmerRejet = async () => {
    if (!rejetTarget) return
    if (!motifRejet.trim()) { setErr('Le motif du rejet est requis'); return }
    try {
      await rejeter(rejetTarget.id, motifRejet.trim())
      fermerRejet()
    } catch {
      setErr('Erreur lors du rejet')
    }
  }

  const ouvrirValidation = (eb: ExpressionBesoin) => setValiderTarget(eb)
  const fermerValidation = () => setValiderTarget(null)

  const confirmerValidation = async () => {
    if (!validerTarget) return
    try {
      await valider(validerTarget.id)
      fermerValidation()
    } catch {
      fermerValidation()
    }
  }

  const dateBody = (eb: ExpressionBesoin) => (
    <span className="text-color-secondary text-sm">{new Date(eb.dateCreation).toLocaleDateString('fr-FR')}</span>
  )

  const validationsBody = (eb: ExpressionBesoin) => (
    <div className="flex gap-1 flex-wrap justify-content-center">
      <Tag severity={eb.validationCsa ? 'success' : 'warning'} value={`CSA ${eb.validationCsa ? '✓' : '…'}`} />
      {directeurRequis(eb.montantInitial) && (
        <Tag severity={eb.validationDirecteur ? 'success' : 'warning'} value={`Directeur ${eb.validationDirecteur ? '✓' : '…'}`} />
      )}
    </div>
  )

  const pieceBody = (eb: ExpressionBesoin) => {
    const url = eb.aFacturePreformat ? eb.urlPdfFactureProforma : eb.urlPdfDeclarationHonneur
    if (!url) return '—'
    return (
      <a href={`${FILES_ORIGIN}${url}`} target="_blank" rel="noreferrer">
        <Tag severity="secondary" icon="pi pi-file-pdf"
          value={eb.aFacturePreformat ? 'Facture proforma' : 'Déclaration sur l\'honneur'} />
      </a>
    )
  }

  const actionsBody = (eb: ExpressionBesoin) => (
    <div className="flex gap-2 justify-content-center">
      <Button label="Valider" icon="pi pi-check" size="small" severity="success"
        loading={actionLoadingId === eb.id} onClick={() => ouvrirValidation(eb)} />
      <Button label="Rejeter" icon="pi pi-times" size="small" severity="danger" outlined
        loading={actionLoadingId === eb.id} onClick={() => ouvrirRejet(eb)} />
    </div>
  )

  return (
    <div>
      <p className="text-color-secondary mb-3">
        {aValider.length} expression(s) en attente de validation
      </p>

      <DataTable value={aValider} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="Aucune expression de besoin en attente" responsiveLayout="scroll">
        <Column header="Date" body={dateBody} />
        <Column header="Désignation" field="motifLibelle" />
        <Column header="Montant initial" body={(eb: ExpressionBesoin) => fmt(eb.montantInitial)} align="right" alignHeader="right" />
        <Column header="Demandeur" field="creePar" />
        <Column header="Pièce jointe" body={pieceBody} align="center" alignHeader="center" />
        <Column header="Validations requises" body={validationsBody} align="center" alignHeader="center" />
        <Column header="Actions" body={actionsBody} align="center" alignHeader="center" />
      </DataTable>

      <Dialog header="Rejeter l'expression de besoin" visible={!!rejetTarget} onHide={fermerRejet}
        style={{ width: '28rem' }} draggable={false}
        footer={
          <div className="flex gap-2">
            <Button label="Annuler" outlined className="flex-1" onClick={fermerRejet} />
            <Button label="Confirmer le rejet" severity="danger" className="flex-1"
              loading={actionLoadingId === rejetTarget?.id} onClick={confirmerRejet} />
          </div>
        }>
        <div className="flex flex-column gap-3">
          <div className="field">
            <label className="block text-sm font-medium mb-1">Motif du rejet *</label>
            <InputTextarea value={motifRejet} onChange={e => setMotifRejet(e.target.value)}
              rows={3} className="w-full" placeholder="Expliquez pourquoi cette demande est rejetée…" />
          </div>
          {err && <Message severity="error" text={err} className="w-full" />}
        </div>
      </Dialog>

      <Dialog header="Confirmer la validation" visible={!!validerTarget} onHide={fermerValidation}
        style={{ width: '28rem' }} draggable={false}
        footer={
          <div className="flex gap-2">
            <Button label="Annuler" outlined className="flex-1" onClick={fermerValidation} />
            <Button label="Valider" severity="success" className="flex-1"
              loading={actionLoadingId === validerTarget?.id} onClick={confirmerValidation} />
          </div>
        }>
        {validerTarget && (
          <p className="m-0">
            Confirmez-vous la validation de la demande <b>{validerTarget.motifLibelle}</b> de{' '}
            <b>{validerTarget.creePar}</b> pour un montant initial de <b>{fmt(validerTarget.montantInitial)}</b> ?
          </p>
        )}
      </Dialog>
    </div>
  )
}
