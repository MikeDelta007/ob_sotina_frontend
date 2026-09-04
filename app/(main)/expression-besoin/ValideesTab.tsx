'use client'
import { useEffect } from 'react'
import axiosInstance from '@/app/api/axiosInstance'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Tag } from 'primereact/tag'
import { useExpressionBesoinStore } from './useExpressionBesoinStore'
import { fmt, directeurRequis, designationLignes, type ExpressionBesoin, type StatutEB } from './types'

const FILES_ORIGIN = (axiosInstance.defaults.baseURL ?? '').replace(/\/?api\/v1\/?$/, '')

const STATUT_SEVERITE: Record<StatutEB, 'warning' | 'success' | 'danger' | 'info'> = {
  EN_ATTENTE: 'warning', VALIDEE: 'info', REJETEE: 'danger', TRAITEE: 'success',
}
const STATUT_LABEL: Record<StatutEB, string> = {
  EN_ATTENTE: 'En attente', VALIDEE: 'Validée', REJETEE: 'Rejetée', TRAITEE: 'Traitée',
}

export default function ValideesTab() {
  const { validees, fetchValidees } = useExpressionBesoinStore()

  useEffect(() => { fetchValidees() }, [])

  const dateBody = (eb: ExpressionBesoin) => (
    <span className="text-color-secondary text-sm">{new Date(eb.dateCreation).toLocaleDateString('fr-FR')}</span>
  )

  const statutBody = (eb: ExpressionBesoin) => <Tag severity={STATUT_SEVERITE[eb.statut]} value={STATUT_LABEL[eb.statut]} />

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

  return (
    <div>
      <p className="text-color-secondary mb-3">
        {validees.length} expression(s) validée(s)
      </p>

      <DataTable value={validees} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="Aucune expression de besoin validée" responsiveLayout="scroll">
        <Column header="Date" body={dateBody} />
        <Column header="Désignation" body={(eb: ExpressionBesoin) => designationLignes(eb.lignes)} />
        <Column header="Montant initial" body={(eb: ExpressionBesoin) => fmt(eb.montantInitial)} align="right" alignHeader="right" />
        <Column header="Demandeur" field="creePar" />
        <Column header="Pièce jointe" body={pieceBody} align="center" alignHeader="center" />
        <Column header="Validations" body={validationsBody} align="center" alignHeader="center" />
        <Column header="Statut" body={statutBody} align="center" alignHeader="center" />
      </DataTable>
    </div>
  )
}
