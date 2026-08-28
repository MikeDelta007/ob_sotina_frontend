'use client'
import { useEffect, useState } from 'react'
import axiosInstance from '@/app/api/axiosInstance'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dialog } from 'primereact/dialog'
import { InputNumber } from 'primereact/inputnumber'
import { InputText } from 'primereact/inputtext'
import { Message } from 'primereact/message'
import { Tag } from 'primereact/tag'
import { useExpressionBesoinStore } from './useExpressionBesoinStore'
import { fmt, type ExpressionBesoin } from './types'

const FILES_ORIGIN = (axiosInstance.defaults.baseURL ?? '').replace(/\/?api\/v1\/?$/, '')

export default function ATraiterTab() {
  const { aTraiter, actionLoadingId, fetchATraiter, traiter } = useExpressionBesoinStore()
  const [selected, setSelected] = useState<ExpressionBesoin | null>(null)
  const [montantReel, setMontantReel] = useState<number | null>(null)
  const [beneficiaire, setBeneficiaire] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => { fetchATraiter() }, [])

  const ouvrir = (eb: ExpressionBesoin) => {
    setSelected(eb); setMontantReel(eb.montantInitial); setBeneficiaire(''); setErr('')
  }
  const fermer = () => setSelected(null)

  const confirmer = async () => {
    if (!selected) return
    if (!montantReel || montantReel <= 0) { setErr('Montant réel invalide'); return }
    if (!beneficiaire.trim()) { setErr('Le nom du bénéficiaire est requis'); return }
    try {
      await traiter(selected.id, montantReel, beneficiaire.trim())
      fermer()
    } catch {
      setErr('Erreur lors du traitement')
    }
  }

  const dateBody = (eb: ExpressionBesoin) => (
    <span className="text-color-secondary text-sm">{new Date(eb.dateCreation).toLocaleDateString('fr-FR')}</span>
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
    <Button label="Traiter" icon="pi pi-pencil" size="small"
      loading={actionLoadingId === eb.id} onClick={() => ouvrir(eb)} />
  )

  return (
    <div>
      <p className="text-color-secondary mb-3">
        {aTraiter.length} expression(s) validée(s) à traiter
      </p>

      <DataTable value={aTraiter} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="Aucune expression de besoin à traiter" responsiveLayout="scroll">
        <Column header="Date" body={dateBody} />
        <Column header="Désignation" field="motifLibelle" />
        <Column header="Montant initial" body={(eb: ExpressionBesoin) => fmt(eb.montantInitial)} align="right" alignHeader="right" />
        <Column header="Demandeur" field="creePar" />
        <Column header="Pièce jointe" body={pieceBody} align="center" alignHeader="center" />
        <Column header="Actions" body={actionsBody} align="center" alignHeader="center" />
      </DataTable>

      <Dialog header="Traiter l'expression de besoin" visible={!!selected} onHide={fermer}
        style={{ width: '28rem' }} draggable={false}
        footer={
          <div className="flex gap-2">
            <Button label="Annuler" outlined className="flex-1" onClick={fermer} />
            <Button label="Confirmer" className="flex-1"
              loading={actionLoadingId === selected?.id} onClick={confirmer} />
          </div>
        }>
        {selected && (
          <div className="flex flex-column gap-3">
            <Message severity="info" text={`Montant initial demandé : ${fmt(selected.montantInitial)}`} className="w-full" />

            <div className="field">
              <label className="block text-sm font-medium mb-1">Montant réel (FCFA) *</label>
              <InputNumber value={montantReel} min={1} className="w-full"
                onValueChange={e => setMontantReel(e.value ?? null)} placeholder="0" />
              <small className="text-color-secondary">Peut différer du montant initial estimé par le chef de service.</small>
            </div>

            <div className="field">
              <label className="block text-sm font-medium mb-1">Bénéficiaire *</label>
              <InputText value={beneficiaire} onChange={e => setBeneficiaire(e.target.value)}
                className="w-full" placeholder="Nom du bénéficiaire" />
            </div>

            {err && <Message severity="error" text={err} className="w-full" />}
          </div>
        )}
      </Dialog>
    </div>
  )
}
