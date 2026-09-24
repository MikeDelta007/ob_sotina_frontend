'use client'
import { useEffect, useRef, useState } from 'react'
import { saveAs } from 'file-saver'
import axiosInstance from '@/app/api/axiosInstance'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { InputText } from 'primereact/inputtext'
import { Tag } from 'primereact/tag'
import { Toast } from 'primereact/toast'
import { useTicketRestaurantStore } from './useTicketRestaurantStore'
import { fmt, joursCoches, STATUT_LABEL, STATUT_SEVERITE, type TicketRestaurant } from './types'

export default function ToutesTab() {
  const toast = useRef<Toast>(null)
  const { toutes, loading, fetchToutes } = useTicketRestaurantStore()
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => { fetchToutes() }, [])

  const telecharger = async (t: TicketRestaurant) => {
    setDownloadingId(t.id)
    try {
      const { data } = await axiosInstance.get(`ticket-restaurant/${t.id}/liste.pdf`, { responseType: 'blob' })
      saveAs(data, `tickets_restaurant_${t.id}.pdf`)
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Office du Bac', detail: 'Téléchargement impossible', life: 4000 })
    } finally {
      setDownloadingId(null)
    }
  }

  const statutBody = (t: TicketRestaurant) => <Tag severity={STATUT_SEVERITE[t.statut]} value={STATUT_LABEL[t.statut]} />
  const periodeBody = (t: TicketRestaurant) => (
    <span>{new Date(t.dateDebut).toLocaleDateString('fr-FR')} → {new Date(t.dateFin).toLocaleDateString('fr-FR')}</span>
  )
  const actionsBody = (t: TicketRestaurant) => (
    t.statut === 'VALIDEE' && (
      <Button label="Télécharger" icon="pi pi-download" size="small"
        loading={downloadingId === t.id} onClick={() => telecharger(t)} />
    )
  )

  return (
    <div>
      <Toast ref={toast} />
      <DataTable value={toutes} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
        loading={loading} emptyMessage="Aucune demande de tickets restaurant" responsiveLayout="scroll"
        globalFilter={globalFilter} globalFilterFields={['creeParNom', 'creePar', 'statut', 'motifRejet']}
        header={
          <div className="flex justify-content-end">
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Rechercher…" />
            </span>
          </div>
        }>
        <Column header="Demandeur" body={(t: TicketRestaurant) => t.creeParNom || t.creePar} />
        <Column header="Période" body={periodeBody} />
        <Column header="Jours" body={(t: TicketRestaurant) => joursCoches(t)} />
        <Column header="Agents" body={(t: TicketRestaurant) => `${t.agentNoms?.length ?? 0} agent(s)`} align="center" alignHeader="center" />
        <Column header="Montant" body={(t: TicketRestaurant) => fmt(t.montantTotal)} align="right" alignHeader="right" />
        <Column header="Statut" body={statutBody} align="center" alignHeader="center" />
        <Column header="Motif de rejet" body={(t: TicketRestaurant) => t.motifRejet || '—'} />
        <Column header="Actions" body={actionsBody} align="center" alignHeader="center" />
      </DataTable>
    </div>
  )
}
