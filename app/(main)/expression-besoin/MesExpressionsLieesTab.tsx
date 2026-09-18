'use client'
import { useEffect, useState } from 'react'
import axiosInstance from '@/app/api/axiosInstance'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { InputText } from 'primereact/inputtext'
import { Tag } from 'primereact/tag'
import { useExpressionBesoinStore } from './useExpressionBesoinStore'
import EtapesColonne from './EtapesColonne'
import { fmt, designationEb, type ExpressionBesoin, type StatutEB } from './types'

const FILES_ORIGIN = (axiosInstance.defaults.baseURL ?? '').replace(/\/?api\/v1\/?$/, '')

const STATUT_SEVERITE: Record<StatutEB, 'warning' | 'success' | 'danger' | 'info'> = {
  EN_ATTENTE: 'warning', VALIDEE: 'info', REJETEE: 'danger', TRAITEE: 'success',
}
const STATUT_LABEL: Record<StatutEB, string> = {
  EN_ATTENTE: 'En attente', VALIDEE: 'Validée', REJETEE: 'Rejetée', TRAITEE: 'Traitée',
}

// Vue en lecture seule pour un agent simple : les expressions de besoin où il a été
// déclaré bénéficiaire par son chef de service (il n'en crée ni ne les modifie jamais).
export default function MesExpressionsLieesTab() {
  const { lieesAMoi, loading, fetchLieesAMoi } = useExpressionBesoinStore()
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => { fetchLieesAMoi() }, [])

  const dateBody = (eb: ExpressionBesoin) => (
    <span className="text-color-secondary text-sm">{new Date(eb.dateCreation).toLocaleDateString('fr-FR')}</span>
  )
  const statutBody = (eb: ExpressionBesoin) => <Tag severity={STATUT_SEVERITE[eb.statut]} value={STATUT_LABEL[eb.statut]} />

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

  return (
    <div>
      <p className="text-color-secondary mb-3">
        {lieesAMoi.length} expression(s) de besoin vous concernant
      </p>

      <DataTable value={lieesAMoi} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
        loading={loading} emptyMessage="Aucune expression de besoin ne vous concerne pour le moment" responsiveLayout="scroll"
        globalFilter={globalFilter} globalFilterFields={['motifLibelle', 'creeParNom', 'creePar', 'motifRejet', 'statut']}
        header={
          <div className="flex justify-content-end">
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Rechercher…" />
            </span>
          </div>
        }>
        <Column header="Date" body={dateBody} />
        <Column header="Désignation" body={designationEb} />
        <Column header="Montant initial" body={(eb: ExpressionBesoin) => fmt(eb.montantInitial)} align="right" alignHeader="right" />
        <Column header="Demandé par" body={(eb: ExpressionBesoin) => eb.creeParNom || eb.creePar} />
        <Column header="Statut" body={statutBody} align="center" alignHeader="center" />
        <Column header="Montant réel" body={(eb: ExpressionBesoin) => eb.montantReel ? fmt(eb.montantReel) : '—'} align="right" alignHeader="right" />
        <Column header="Étapes" body={(eb: ExpressionBesoin) => <EtapesColonne eb={eb} />} />
        <Column header="Pièce jointe" body={pieceBody} align="center" alignHeader="center" />
      </DataTable>
    </div>
  )
}
