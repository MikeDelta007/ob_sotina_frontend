'use client'
import { useEffect, useState } from 'react'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { Message } from 'primereact/message'
import { useTicketRestaurantStore } from './useTicketRestaurantStore'
import { fmt, joursCoches, type TicketRestaurant } from './types'

export default function AValiderTab() {
  const { aValider, actionLoadingId, fetchAValider, valider, rejeter } = useTicketRestaurantStore()
  const [rejetTarget, setRejetTarget] = useState<TicketRestaurant | null>(null)
  const [motifRejet, setMotifRejet] = useState('')
  const [err, setErr] = useState('')
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => { fetchAValider() }, [])

  const ouvrirRejet = (t: TicketRestaurant) => { setRejetTarget(t); setMotifRejet(''); setErr('') }
  const fermerRejet = () => setRejetTarget(null)

  const confirmerRejet = async () => {
    if (!rejetTarget) return
    if (!motifRejet.trim()) { setErr('Le motif du rejet est requis'); return }
    try {
      await rejeter(rejetTarget.id, motifRejet.trim())
      fermerRejet()
    } catch {
      setErr('Erreur lors du rejet')
    }
  }

  const periodeBody = (t: TicketRestaurant) => (
    <span>{new Date(t.dateDebut).toLocaleDateString('fr-FR')} → {new Date(t.dateFin).toLocaleDateString('fr-FR')}</span>
  )
  const agentsBody = (t: TicketRestaurant) => (t.agentNoms ?? []).join(', ') || '—'

  const actionsBody = (t: TicketRestaurant) => (
    <div className="flex gap-2 justify-content-center">
      <Button label="Valider" icon="pi pi-check" size="small" severity="success"
        loading={actionLoadingId === t.id} onClick={() => valider(t.id)} />
      <Button label="Rejeter" icon="pi pi-times" size="small" severity="danger" outlined
        loading={actionLoadingId === t.id} onClick={() => ouvrirRejet(t)} />
    </div>
  )

  return (
    <div>
      <p className="text-color-secondary mb-3">{aValider.length} demande(s) en attente de validation</p>

      <DataTable value={aValider} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="Aucune demande en attente" responsiveLayout="scroll"
        globalFilter={globalFilter} globalFilterFields={['creeParNom', 'creePar']}
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
        <Column header="Agents" body={agentsBody} />
        <Column header="Nombre de jours" field="nombreJours" align="center" alignHeader="center" />
        <Column header="Montant" body={(t: TicketRestaurant) => fmt(t.montantTotal)} align="right" alignHeader="right" />
        <Column header="Actions" body={actionsBody} align="center" alignHeader="center" />
      </DataTable>

      <Dialog header="Rejeter la demande" visible={!!rejetTarget} onHide={fermerRejet}
        style={{ width: '28rem' }} draggable={false}
        footer={
          <div className="flex gap-2">
            <Button label="Annuler" outlined className="flex-1" onClick={fermerRejet} />
            <Button label="Confirmer le rejet" severity="danger" className="flex-1"
              loading={actionLoadingId === rejetTarget?.id} onClick={confirmerRejet} />
          </div>
        }>
        <div className="flex flex-column gap-3">
          <div className="field">
            <label className="block text-sm font-medium mb-1">Motif du rejet *</label>
            <InputTextarea value={motifRejet} onChange={e => setMotifRejet(e.target.value)}
              rows={3} className="w-full" placeholder="Expliquez pourquoi cette demande est rejetée…" />
          </div>
          {err && <Message severity="error" text={err} className="w-full" />}
        </div>
      </Dialog>
    </div>
  )
}
