'use client'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { useCaisseStore } from './useCaisseStore'
import { fmt, type Mandatement } from './types'

export default function ReliquatsTab() {
  const { mandatements, reliquatLoadingId, payerReliquat } = useCaisseStore()

  const reliquats = mandatements.filter(m =>
    m.typePaiement === 'AVANCE' && (m.montantReliquat ?? 0) > 0 && !m.reliquatPaye)

  const totalReliquats = reliquats.reduce((s, m) => s + (m.montantReliquat ?? 0), 0)

  const facturesBody = (m: Mandatement) => (
    <div className="flex flex-column gap-1">
      {m.factures.map(f => (
        <span key={f.numero} className="font-mono text-sm text-primary">{f.numero}</span>
      ))}
    </div>
  )

  const dateBody = (m: Mandatement) => (
    <span className="text-color-secondary text-sm">
      {new Date(m.dateCreation).toLocaleDateString('fr-FR')}
    </span>
  )

  const actionsBody = (m: Mandatement) => (
    <Button label="Payer le reliquat" icon="pi pi-check" size="small"
      loading={reliquatLoadingId === m.id} onClick={() => payerReliquat(m.id)} />
  )

  return (
    <div>
      <p className="text-color-secondary mb-3">
        {reliquats.length} reliquat(s) en attente · total à payer {fmt(totalReliquats)}
      </p>

      <DataTable value={reliquats} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="Aucun reliquat en attente" responsiveLayout="scroll">
        <Column header="N° Facture(s)" body={facturesBody} />
        <Column header="Total" body={(m: Mandatement) => fmt(m.montantTotal)} align="right" alignHeader="right" />
        <Column header="Avance versée" body={(m: Mandatement) => fmt(m.montantAvance ?? 0)} align="right" alignHeader="right" />
        <Column header="Reliquat à payer"
          body={(m: Mandatement) => <strong className="text-orange-600">{fmt(m.montantReliquat ?? 0)}</strong>}
          align="right" alignHeader="right" />
        <Column header="Date" body={dateBody} />
        <Column header="Action" body={actionsBody} align="center" alignHeader="center" />
      </DataTable>
    </div>
  )
}
