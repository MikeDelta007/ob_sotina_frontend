'use client'
import { useEffect, useState } from 'react'
import axiosInstance from '@/app/api/axiosInstance'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dialog } from 'primereact/dialog'
import { InputNumber } from 'primereact/inputnumber'
import { Message } from 'primereact/message'
import { Tag } from 'primereact/tag'
import { useExpressionBesoinStore } from './useExpressionBesoinStore'
import TraceButton from './TraceButton'
import { fmt, designationEb, type ExpressionBesoin } from './types'

const FILES_ORIGIN = (axiosInstance.defaults.baseURL ?? '').replace(/\/?api\/v1\/?$/, '')

interface Props { lectureSeule?: boolean }

export default function ATraiterTab({ lectureSeule = false }: Props) {
  const { aTraiter, actionLoadingId, fetchATraiter, traiter } = useExpressionBesoinStore()
  const [selected, setSelected] = useState<ExpressionBesoin | null>(null)
  const [montantReel, setMontantReel] = useState<number | null>(null)
  const [err, setErr] = useState('')

  useEffect(() => { fetchATraiter() }, [])

  const ouvrir = (eb: ExpressionBesoin) => {
    setSelected(eb); setMontantReel(eb.montantInitial); setErr('')
  }
  const fermer = () => setSelected(null)

  const confirmer = async () => {
    if (!selected) return
    if (!montantReel || montantReel <= 0) { setErr('Montant réel invalide'); return }
    try {
      await traiter(selected.id, montantReel)
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
    <div className="flex gap-1 align-items-center justify-content-center">
      <TraceButton eb={eb} />
      {!lectureSeule && (
        <Button label="Traiter" icon="pi pi-pencil" size="small"
          loading={actionLoadingId === eb.id} onClick={() => ouvrir(eb)} />
      )}
    </div>
  )

  return (
    <div>
      <p className="text-color-secondary mb-3">
        {aTraiter.length} expression(s) validée(s) à traiter
      </p>

      <DataTable value={aTraiter} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="Aucune expression de besoin à traiter" responsiveLayout="scroll">
        <Column header="Date" body={dateBody} />
        <Column header="Désignation" body={designationEb} />
        <Column header="Montant initial" body={(eb: ExpressionBesoin) => fmt(eb.montantInitial)} align="right" alignHeader="right" />
        <Column header="Bénéficiaire" body={(eb: ExpressionBesoin) => eb.beneficiaireNom || '—'} />
        <Column header="Demandeur" body={(eb: ExpressionBesoin) => eb.creeParNom || eb.creePar} />
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
            <p className="m-0 text-sm">
              Bénéficiaire : <b>{selected.beneficiaireNom || '—'}</b>
            </p>

            <div className="field">
              <label className="block text-sm font-medium mb-1">Montant réel (FCFA) *</label>
              <InputNumber value={montantReel} min={1} className="w-full"
                onValueChange={e => setMontantReel(e.value ?? null)} placeholder="0" />
              <small className="text-color-secondary">Peut différer du montant initial estimé par le chef de service.</small>
            </div>

            {err && <Message severity="error" text={err} className="w-full" />}
          </div>
        )}
      </Dialog>
    </div>
  )
}
