'use client'
import { useContext, useEffect, useRef, useState } from 'react'
import axiosInstance from '@/app/api/axiosInstance'
import { UserContext } from '@/app/userContext'
import { aUnDesRoles } from '@/app/rolesUtilisateur'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { DataTable } from 'primereact/datatable'
import { InputText } from 'primereact/inputtext'
import { Tag } from 'primereact/tag'
import { Toast } from 'primereact/toast'
import { useExpressionBesoinStore } from './useExpressionBesoinStore'
import EtapesColonne from './EtapesColonne'
import { fmt, designationEb, montantClassName, type ExpressionBesoin } from './types'

const FILES_ORIGIN = (axiosInstance.defaults.baseURL ?? '').replace(/\/?api\/v1\/?$/, '')

export default function RejeteesTab() {
  const toast = useRef<Toast>(null)
  const { user } = useContext(UserContext)
  const peutArchiver = aUnDesRoles(user, ['DIRECTEUR', 'ADMIN'])
  const { rejetees, actionLoadingId, fetchRejetees, archiver } = useExpressionBesoinStore()
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => { fetchRejetees() }, [])

  const confirmArchiver = (eb: ExpressionBesoin) => {
    confirmDialog({
      message: 'Archiver cette expression de besoin ? Elle sortira des listes actives.',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Archiver',
      rejectLabel: 'Annuler',
      accept: async () => {
        try {
          await archiver(eb.id)
          toast.current?.show({ severity: 'success', summary: 'Office du Bac', detail: 'Expression de besoin archivée', life: 4000 })
        } catch {
          toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Archivage impossible', life: 4000 })
        }
      },
    })
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

  const archiverBody = (eb: ExpressionBesoin) => (
    <Button icon="pi pi-inbox" label="Archiver" severity="secondary" size="small" outlined
      loading={actionLoadingId === eb.id} onClick={() => confirmArchiver(eb)} />
  )

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />
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
        <Column header="Description" body={(eb: ExpressionBesoin) => eb.description || '—'} />
        <Column header="Montant initial"
          body={(eb: ExpressionBesoin) => <span className={montantClassName(eb.montantInitial)}>{fmt(eb.montantInitial)}</span>}
          align="right" alignHeader="right" />
        <Column header="Bénéficiaire" body={(eb: ExpressionBesoin) => eb.beneficiaireNom || '—'} />
        <Column header="Demandeur" body={(eb: ExpressionBesoin) => eb.creeParNom || eb.creePar} />
        <Column header="Étapes" body={(eb: ExpressionBesoin) => <EtapesColonne eb={eb} />} />
        <Column header="Pièce jointe" body={pieceBody} align="center" alignHeader="center" />
        {peutArchiver && <Column header="Actions" body={archiverBody} align="center" alignHeader="center" />}
      </DataTable>
    </div>
  )
}
