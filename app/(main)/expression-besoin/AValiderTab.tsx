'use client'
import { useEffect, useState } from 'react'
import axiosInstance from '@/app/api/axiosInstance'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dialog } from 'primereact/dialog'
import { InputNumber } from 'primereact/inputnumber'
import { InputTextarea } from 'primereact/inputtextarea'
import { Message } from 'primereact/message'
import { Tag } from 'primereact/tag'
import { useExpressionBesoinStore } from './useExpressionBesoinStore'
import { fmt, directeurRequis, designationLignes, type ExpressionBesoin } from './types'

const FILES_ORIGIN = (axiosInstance.defaults.baseURL ?? '').replace(/\/?api\/v1\/?$/, '')

export default function AValiderTab() {
  const { aValider, actionLoadingId, fetchAValider, valider, rejeter } = useExpressionBesoinStore()
  const [rejetTarget, setRejetTarget] = useState<ExpressionBesoin | null>(null)
  const [motifRejet, setMotifRejet] = useState('')
  const [validerTarget, setValiderTarget] = useState<ExpressionBesoin | null>(null)
  const [quantitesAccordees, setQuantitesAccordees] = useState<(number | null)[]>([])
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

  const ouvrirValidation = (eb: ExpressionBesoin) => {
    setValiderTarget(eb)
    setQuantitesAccordees((eb.lignes ?? []).map(l => l.quantiteAccordeeDirecteur ?? l.quantiteAccordeeCsa ?? l.quantite ?? null))
    setErr('')
  }
  const fermerValidation = () => setValiderTarget(null)

  const confirmerValidation = async () => {
    if (!validerTarget) return
    const lignes = validerTarget.lignes ?? []
    const manquante = lignes.some((l, i) => l.quantite != null && !quantitesAccordees[i])
    if (manquante) { setErr('La quantité accordée est requise pour chaque ligne avec une quantité demandée'); return }
    setErr('')
    try {
      await valider(validerTarget.id, quantitesAccordees)
      fermerValidation()
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? 'Erreur lors de la validation')
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
        <Column header="Désignation" body={(eb: ExpressionBesoin) => designationLignes(eb.lignes)} />
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
          <div className="flex flex-column gap-3">
            <p className="m-0">
              Confirmez-vous la validation de la demande <b>{designationLignes(validerTarget.lignes)}</b> de{' '}
              <b>{validerTarget.creePar}</b> pour un montant initial de <b>{fmt(validerTarget.montantInitial)}</b> ?
            </p>

            {(validerTarget.lignes ?? []).some(l => l.quantite != null) && (
              <div className="flex flex-column gap-2">
                <label className="text-sm font-medium">Quantité accordée par ligne *</label>
                {(validerTarget.lignes ?? []).map((l, i) => l.quantite != null && (
                  <div key={i} className="flex align-items-center justify-content-between gap-2">
                    <span className="text-sm">{l.motifLibelle ?? '—'} (demandée : {l.quantite})</span>
                    <InputNumber value={quantitesAccordees[i] ?? null} min={0} max={l.quantite} style={{ width: '7rem' }}
                      onValueChange={e => setQuantitesAccordees(qs => qs.map((q, j) => j === i ? (e.value ?? null) : q))} />
                  </div>
                ))}
              </div>
            )}

            {err && <Message severity="error" text={err} className="w-full" />}
          </div>
        )}
      </Dialog>
    </div>
  )
}
