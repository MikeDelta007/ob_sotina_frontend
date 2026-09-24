'use client'
import { useEffect, useState } from 'react'
import { Button } from 'primereact/button'
import { Calendar } from 'primereact/calendar'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Message } from 'primereact/message'
import { MultiSelect } from 'primereact/multiselect'
import { Tag } from 'primereact/tag'
import { useTicketRestaurantStore } from './useTicketRestaurantStore'
import { fmt, joursCoches, compterJours, MONTANT_PAR_JOUR, STATUT_LABEL, STATUT_SEVERITE, type TicketRestaurant } from './types'

const JOURS = [
  { key: 'lundi', label: 'Lundi' },
  { key: 'mardi', label: 'Mardi' },
  { key: 'mercredi', label: 'Mercredi' },
  { key: 'jeudi', label: 'Jeudi' },
  { key: 'vendredi', label: 'Vendredi' },
] as const

export default function MesTicketsTab() {
  const { mesAgents, mesTickets, loading, error, fetchMesAgents, fetchMesTickets, creer } = useTicketRestaurantStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dateDebut, setDateDebut] = useState<Date | null>(null)
  const [dateFin, setDateFin] = useState<Date | null>(null)
  const [jours, setJours] = useState({ lundi: false, mardi: false, mercredi: false, jeudi: false, vendredi: false })
  const [agentIds, setAgentIds] = useState<string[]>([])
  const [err, setErr] = useState('')
  const [globalFilter, setGlobalFilter] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchMesAgents(); fetchMesTickets() }, [])

  const openCreate = () => {
    setDateDebut(null); setDateFin(null)
    setJours({ lundi: false, mardi: false, mercredi: false, jeudi: false, vendredi: false })
    setAgentIds([]); setErr(''); setDialogOpen(true)
  }

  const auMoinsUnJour = Object.values(jours).some(Boolean)
  const nombreJours = dateDebut && dateFin ? compterJours(dateDebut, dateFin, jours) : 0
  const montantTotal = nombreJours * MONTANT_PAR_JOUR * agentIds.length
  const formulaireValide = !!dateDebut && !!dateFin && dateFin >= dateDebut && auMoinsUnJour && agentIds.length > 0

  const toIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  const enregistrer = async () => {
    if (!formulaireValide || !dateDebut || !dateFin) {
      setErr('Veuillez compléter la période, au moins un jour de la semaine et au moins un agent')
      return
    }
    setSubmitting(true)
    try {
      await creer({ dateDebut: toIso(dateDebut), dateFin: toIso(dateFin), ...jours, agentIds })
      setDialogOpen(false)
    } catch {
      setErr('Erreur lors de l\'enregistrement')
    } finally {
      setSubmitting(false)
    }
  }

  const statutBody = (t: TicketRestaurant) => <Tag severity={STATUT_SEVERITE[t.statut]} value={STATUT_LABEL[t.statut]} />
  const periodeBody = (t: TicketRestaurant) => (
    <span>{new Date(t.dateDebut).toLocaleDateString('fr-FR')} → {new Date(t.dateFin).toLocaleDateString('fr-FR')}</span>
  )
  const agentsBody = (t: TicketRestaurant) => `${t.agentNoms?.length ?? 0} agent(s)`

  return (
    <div>
      <div className="flex justify-content-end mb-3">
        <Button label="Nouvelle demande" icon="pi pi-plus" onClick={openCreate} />
      </div>

      <DataTable value={mesTickets} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
        loading={loading} emptyMessage="Aucune demande de tickets restaurant" responsiveLayout="scroll"
        globalFilter={globalFilter} globalFilterFields={['statut', 'motifRejet']}
        header={
          <div className="flex justify-content-end">
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Rechercher…" />
            </span>
          </div>
        }>
        <Column header="Période" body={periodeBody} />
        <Column header="Jours" body={(t: TicketRestaurant) => joursCoches(t)} />
        <Column header="Agents" body={agentsBody} align="center" alignHeader="center" />
        <Column header="Nombre de jours" field="nombreJours" align="center" alignHeader="center" />
        <Column header="Montant" body={(t: TicketRestaurant) => fmt(t.montantTotal)} align="right" alignHeader="right" />
        <Column header="Statut" body={statutBody} align="center" alignHeader="center" />
        <Column header="Motif de rejet" body={(t: TicketRestaurant) => t.motifRejet || '—'} />
      </DataTable>

      <Dialog header="Nouvelle demande de tickets restaurant" visible={dialogOpen} onHide={() => setDialogOpen(false)}
        style={{ width: '34rem' }} draggable={false}
        footer={
          <div className="flex gap-2">
            <Button label="Annuler" outlined className="flex-1" onClick={() => setDialogOpen(false)} disabled={submitting} />
            <Button label="Enregistrer" className="flex-1" loading={submitting} disabled={submitting} onClick={enregistrer} />
          </div>
        }>
        <div className="flex flex-column gap-4">
          <div className="grid formgrid">
            <div className="col-6 field mb-0">
              <label className="block text-sm font-medium mb-1">Date de début</label>
              <Calendar value={dateDebut} onChange={e => setDateDebut(e.value as Date)} dateFormat="dd/mm/yy" showIcon
                className="w-full" minDate={new Date()} />
            </div>
            <div className="col-6 field mb-0">
              <label className="block text-sm font-medium mb-1">Date de fin</label>
              <Calendar value={dateFin} onChange={e => setDateFin(e.value as Date)} dateFormat="dd/mm/yy" showIcon
                className="w-full" minDate={dateDebut ?? new Date()} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Jours de la semaine concernés *</label>
            <div className="flex flex-wrap gap-3">
              {JOURS.map(j => (
                <label key={j.key} className="flex align-items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={jours[j.key]}
                    onChange={e => setJours(js => ({ ...js, [j.key]: e.target.checked }))} />
                  <span className="text-sm">{j.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="field mb-0">
            <label className="block text-sm font-medium mb-1">Agents *</label>
            <MultiSelect value={agentIds} onChange={e => setAgentIds(e.value)}
              options={mesAgents.map(a => ({ label: `${a.firstname} ${a.lastname}`, value: a.id }))}
              placeholder={mesAgents.length ? 'Choisir les agents…' : 'Aucun agent dans ma division'}
              disabled={!mesAgents.length} display="chip" filter className="w-full" />
          </div>

          {nombreJours > 0 && agentIds.length > 0 && (
            <div className="card mt-0 flex justify-content-between align-items-center py-2">
              <span className="text-color-secondary">
                {nombreJours} jour(s) × {fmt(MONTANT_PAR_JOUR)} × {agentIds.length} agent(s)
              </span>
              <strong>{fmt(montantTotal)}</strong>
            </div>
          )}

          {err && <Message severity="error" text={err} className="w-full" />}
          {error && <Message severity="error" text={error} className="w-full" />}
        </div>
      </Dialog>
    </div>
  )
}
