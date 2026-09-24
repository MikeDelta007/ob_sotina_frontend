'use client'
import { useContext, useEffect, useState } from 'react'
import axiosInstance from '@/app/api/axiosInstance'
import { saveAs } from 'file-saver'
import { Button } from 'primereact/button'
import { UserContext } from '@/app/userContext'
import { aUnDesRoles } from '@/app/rolesUtilisateur'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { InputText } from 'primereact/inputtext'
import { Tag } from 'primereact/tag'
import { useExpressionBesoinStore } from './useExpressionBesoinStore'
import EtapesColonne from './EtapesColonne'
import { fmt, designationEb, type ExpressionBesoin } from './types'

const FILES_ORIGIN = (axiosInstance.defaults.baseURL ?? '').replace(/\/?api\/v1\/?$/, '')

export default function TraiteesTab() {
  const { traitees, fetchTraitees } = useExpressionBesoinStore()
  const [globalFilter, setGlobalFilter] = useState('')
  const { user } = useContext(UserContext)
  const peutDecharge = aUnDesRoles(user, ['CHEF_COMPTABLE', 'AGENT_COMPTABLE'])

  const telechargerDecharge = async (id: string) => {
    const { data } = await axiosInstance.get(`expression-besoin/${id}/decharge.pdf`, { responseType: 'blob' })
    saveAs(data, `decharge_${id}.pdf`)
  }

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

  const satisfactionBody = (eb: ExpressionBesoin) => {
    if (!eb.requiertSatisfaction) return <span className="text-color-secondary">—</span>
    return eb.satisfactionConfirmee
      ? <Tag severity="success" icon="pi pi-check" value="Confirmée" />
      : <Tag severity="warning" value="En attente" />
  }

  const mandatementBody = (eb: ExpressionBesoin) => {
    if (eb.utiliseePourMandatement) return <Tag severity="success" icon="pi pi-check" value="Déjà traité" />
    if (eb.requiertSatisfaction && !eb.satisfactionConfirmee)
      return <Tag severity="danger" value="Bloqué (satisfaction)" />
    return <Tag severity="warning" value="Disponible" />
  }

  return (
    <div>
      <p className="text-color-secondary mb-3">
        {traitees.length} expression(s) traitée(s)
      </p>

      <DataTable value={traitees} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="Aucune expression de besoin traitée" responsiveLayout="scroll"
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
        <Column header="Montant initial" body={(eb: ExpressionBesoin) => fmt(eb.montantInitial)} align="right" alignHeader="right" />
        <Column header="Montant réel" body={(eb: ExpressionBesoin) => eb.montantReel ? fmt(eb.montantReel) : '—'} align="right" alignHeader="right" />
        <Column header="Bénéficiaire" body={(eb: ExpressionBesoin) => eb.beneficiaireNom || '—'} />
        <Column header="Demandeur" body={(eb: ExpressionBesoin) => eb.creeParNom || eb.creePar} />
        <Column header="Pièce jointe" body={pieceBody} align="center" alignHeader="center" />
        <Column header="Satisfaction" body={satisfactionBody} align="center" alignHeader="center" />
        <Column header="Mandatement" body={mandatementBody} align="center" alignHeader="center" />
        <Column header="Étapes" body={(eb: ExpressionBesoin) => <EtapesColonne eb={eb} />} />
        {peutDecharge && (
          <Column header="Décharge" align="center" alignHeader="center"
            body={(eb: ExpressionBesoin) => (
              <Button icon="pi pi-file-pdf" size="small" text tooltip="Télécharger la décharge à faire signer"
                onClick={() => telechargerDecharge(eb.id)} />
            )} />
        )}
      </DataTable>
    </div>
  )
}
