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

// Onglet dédié (Directeur/Admin) : toutes les EB archivées, quel que soit leur statut d'origine
// — une fois archivée, une EB ne réapparaît plus jamais dans les autres onglets.
export default function ArchiveesTab() {
  const { archivees, loading, fetchArchivees } = useExpressionBesoinStore()
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => { fetchArchivees() }, [])

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

  const archivageBody = (eb: ExpressionBesoin) => (
    <div className="flex flex-column gap-1 text-sm">
      <span>{eb.archiveePar || '—'}</span>
      {eb.dateArchivage && (
        <span className="text-color-secondary text-xs">{new Date(eb.dateArchivage).toLocaleDateString('fr-FR')}</span>
      )}
    </div>
  )

  return (
    <div>
      <p className="text-color-secondary mb-3">
        {archivees.length} expression(s) de besoin archivée(s)
      </p>

      <DataTable value={archivees} loading={loading} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="Aucune expression de besoin archivée" responsiveLayout="scroll"
        globalFilter={globalFilter} globalFilterFields={['motifLibelle', 'beneficiaireNom', 'creeParNom', 'creePar', 'archiveePar']}
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
        <Column header="Statut d'origine" body={statutBody} align="center" alignHeader="center" />
        <Column header="Archivée par" body={archivageBody} />
        <Column header="Étapes" body={(eb: ExpressionBesoin) => <EtapesColonne eb={eb} />} />
      </DataTable>
    </div>
  )
}
