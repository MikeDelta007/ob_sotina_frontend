'use client'
import { useEffect, useState } from 'react'
import axiosInstance from '@/app/api/axiosInstance'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { InputText } from 'primereact/inputtext'
import { Tag } from 'primereact/tag'
import { useExpressionBesoinStore } from './useExpressionBesoinStore'
import EtapesColonne from './EtapesColonne'
import { fmt, designationEb, type ExpressionBesoin } from './types'

const FILES_ORIGIN = (axiosInstance.defaults.baseURL ?? '').replace(/\/?api\/v1\/?$/, '')

export default function RejeteesTab() {
  const { rejetees, fetchRejetees } = useExpressionBesoinStore()
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => { fetchRejetees() }, [])

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

  return (
    <div>
      <p className="text-color-secondary mb-3">
        {rejetees.length} expression(s) rejetée(s)
      </p>

      <DataTable value={rejetees} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="Aucune expression de besoin rejetée" responsiveLayout="scroll"
        globalFilter={globalFilter} globalFilterFields={['motifLibelle', 'beneficiaireNom', 'creeParNom', 'creePar', 'motifRejet', 'rejeteParNom']}
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
        <Column header="Bénéficiaire" body={(eb: ExpressionBesoin) => eb.beneficiaireNom || '—'} />
        <Column header="Demandeur" body={(eb: ExpressionBesoin) => eb.creeParNom || eb.creePar} />
        <Column header="Étapes" body={(eb: ExpressionBesoin) => <EtapesColonne eb={eb} />} />
        <Column header="Pièce jointe" body={pieceBody} align="center" alignHeader="center" />
      </DataTable>
    </div>
  )
}
