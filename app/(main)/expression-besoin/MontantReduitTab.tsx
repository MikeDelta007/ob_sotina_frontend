'use client'
import { useEffect, useState } from 'react'
import axiosInstance from '@/app/api/axiosInstance'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { InputText } from 'primereact/inputtext'
import { Tag } from 'primereact/tag'
import { useExpressionBesoinStore } from './useExpressionBesoinStore'
import EtapesColonne from './EtapesColonne'
import { fmt, designationEb, montantClassName, type ExpressionBesoin, type StatutEB } from './types'

const FILES_ORIGIN = (axiosInstance.defaults.baseURL ?? '').replace(/\/?api\/v1\/?$/, '')

const STATUT_SEVERITE: Record<StatutEB, 'warning' | 'success' | 'danger' | 'info'> = {
  EN_ATTENTE: 'warning', VALIDEE: 'info', REJETEE: 'danger', TRAITEE: 'success',
}
const STATUT_LABEL: Record<StatutEB, string> = {
  EN_ATTENTE: 'En attente', VALIDEE: 'Validée', REJETEE: 'Rejetée', TRAITEE: 'Traitée',
}

// Vue consolidée, tous statuts confondus, des EB ≤ 20 000 FCFA — celles qui ne relèvent jamais
// du Directeur (seul le CSA les valide), regroupées à part pour qu'il les distingue d'un coup
// d'œil de celles qui requièrent sa propre validation.
export default function MontantReduitTab() {
  const { montantReduit, fetchMontantReduit } = useExpressionBesoinStore()
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => { fetchMontantReduit() }, [])

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
        {montantReduit.length} expression(s) de besoin ≤ 20 000 FCFA (tous statuts)
      </p>

      <DataTable value={montantReduit} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="Aucune expression de besoin ≤ 20 000 FCFA" responsiveLayout="scroll"
        globalFilter={globalFilter} globalFilterFields={['motifLibelle', 'beneficiaireNom', 'creeParNom', 'creePar']}
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
        <Column header="Description" body={(eb: ExpressionBesoin) => eb.description || '—'} />
        <Column header="Montant initial"
          body={(eb: ExpressionBesoin) => <span className={montantClassName(eb.montantInitial)}>{fmt(eb.montantInitial)}</span>}
          align="right" alignHeader="right" />
        <Column header="Bénéficiaire" body={(eb: ExpressionBesoin) => eb.beneficiaireNom || '—'} />
        <Column header="Demandeur" body={(eb: ExpressionBesoin) => eb.creeParNom || eb.creePar} />
        <Column header="Pièce jointe" body={pieceBody} align="center" alignHeader="center" />
        <Column header="Statut" body={statutBody} align="center" alignHeader="center" />
        <Column header="Étapes" body={(eb: ExpressionBesoin) => <EtapesColonne eb={eb} />} />
      </DataTable>
    </div>
  )
}
