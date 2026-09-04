'use client'
import { useEffect } from 'react'
import axiosInstance from '@/app/api/axiosInstance'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Tag } from 'primereact/tag'
import { useExpressionBesoinStore } from './useExpressionBesoinStore'
import { fmt, designationLignes, type ExpressionBesoin } from './types'

const FILES_ORIGIN = (axiosInstance.defaults.baseURL ?? '').replace(/\/?api\/v1\/?$/, '')

export default function TraiteesTab() {
  const { traitees, fetchTraitees } = useExpressionBesoinStore()

  useEffect(() => { fetchTraitees() }, [])

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

  const mandatementBody = (eb: ExpressionBesoin) => (
    eb.utiliseePourMandatement
      ? <Tag severity="success" icon="pi pi-check" value="Déjà traité" />
      : <Tag severity="warning" value="Disponible" />
  )

  return (
    <div>
      <p className="text-color-secondary mb-3">
        {traitees.length} expression(s) traitée(s)
      </p>

      <DataTable value={traitees} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="Aucune expression de besoin traitée" responsiveLayout="scroll">
        <Column header="Date" body={dateBody} />
        <Column header="Désignation" body={(eb: ExpressionBesoin) => designationLignes(eb.lignes)} />
        <Column header="Montant initial" body={(eb: ExpressionBesoin) => fmt(eb.montantInitial)} align="right" alignHeader="right" />
        <Column header="Montant réel" body={(eb: ExpressionBesoin) => eb.montantReel ? fmt(eb.montantReel) : '—'} align="right" alignHeader="right" />
        <Column header="Bénéficiaire" field="beneficiaire" />
        <Column header="Demandeur" field="creePar" />
        <Column header="Pièce jointe" body={pieceBody} align="center" alignHeader="center" />
        <Column header="Mandatement" body={mandatementBody} align="center" alignHeader="center" />
      </DataTable>
    </div>
  )
}
