'use client'
import { useState } from 'react'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dialog } from 'primereact/dialog'
import { FileUpload, FileUploadSelectEvent } from 'primereact/fileupload'
import { Message } from 'primereact/message'
import { Tag } from 'primereact/tag'
import { useCaisseStore } from './useCaisseStore'
import { modeAuto, fmt, type Mandatement } from './types'

export default function ReliquatsTab() {
  const { mandatements, caisse, reliquatLoadingId, payerReliquat } = useCaisseStore()
  const [selected, setSelected] = useState<Mandatement | null>(null)
  const [pdfCheque, setPdfCheque] = useState<File | null>(null)
  const [pdfCni, setPdfCni]       = useState<File | null>(null)
  const [err, setErr]             = useState('')

  const soldeCaisse = caisse?.montant ?? 0
  const reliquats = mandatements.filter(m =>
    m.typePaiement === 'AVANCE' && (m.montantReliquat ?? 0) > 0 && !m.reliquatPaye)
  const totalReliquats = reliquats.reduce((s, m) => s + (m.montantReliquat ?? 0), 0)

  const mode = selected ? modeAuto(selected.montantReliquat ?? 0, soldeCaisse) : 'ESPECES'
  const piecesValides = mode === 'ESPECES' || (!!pdfCheque && !!pdfCni)

  const ouvrir = (m: Mandatement) => {
    setSelected(m); setPdfCheque(null); setPdfCni(null); setErr('')
  }
  const fermer = () => setSelected(null)

  const confirmer = async () => {
    if (!selected) return
    if (!piecesValides) { setErr('Le chèque et la CNI sont requis pour ce paiement.'); return }
    try {
      await payerReliquat(selected.id, pdfCheque, pdfCni)
      fermer()
    } catch {
      setErr('Erreur lors du paiement du reliquat')
    }
  }

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
      loading={reliquatLoadingId === m.id} onClick={() => ouvrir(m)} />
  )

  const footer = (
    <div className="flex gap-2">
      <Button label="Annuler" outlined className="flex-1" onClick={fermer} disabled={reliquatLoadingId === selected?.id} />
      <Button label="Payer le reliquat" className="flex-1" loading={reliquatLoadingId === selected?.id}
        disabled={reliquatLoadingId === selected?.id || !piecesValides} onClick={confirmer} />
    </div>
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

      <Dialog header="Confirmer le paiement du reliquat" visible={!!selected} onHide={fermer}
        style={{ width: '30rem' }} footer={footer} draggable={false}>
        {selected && (
          <div className="flex flex-column gap-3">
            <div className="text-sm">
              Facture <strong>{selected.factures[0]?.numero ?? selected.id}</strong> —
              reliquat de <strong>{fmt(selected.montantReliquat ?? 0)}</strong>.
            </div>

            <Tag severity={mode === 'ESPECES' ? 'success' : 'warning'}
              icon={mode === 'ESPECES' ? 'pi pi-money-bill' : 'pi pi-credit-card'}
              value={mode === 'ESPECES' ? 'Paiement en espèces — caisse débitée' : 'Paiement par chèque — caisse non débitée'} />

            {mode === 'CHEQUE' && (
              <div className="grid formgrid mt-1">
                <div className="col-12 md:col-6 field">
                  <label className="block text-sm text-color-secondary mb-1">Chèque (PDF) *</label>
                  <div className="flex align-items-center gap-2">
                    <FileUpload mode="basic" name="pdfCheque" accept="application/pdf" auto={false}
                      chooseLabel="Choisir un PDF"
                      onSelect={(e: FileUploadSelectEvent) => setPdfCheque(e.files[0] ?? null)} />
                    {pdfCheque && <Tag severity="success" icon="pi pi-check" value={pdfCheque.name} />}
                  </div>
                </div>
                <div className="col-12 md:col-6 field">
                  <label className="block text-sm text-color-secondary mb-1">CNI (PDF) *</label>
                  <div className="flex align-items-center gap-2">
                    <FileUpload mode="basic" name="pdfCni" accept="application/pdf" auto={false}
                      chooseLabel="Choisir un PDF"
                      onSelect={(e: FileUploadSelectEvent) => setPdfCni(e.files[0] ?? null)} />
                    {pdfCni && <Tag severity="success" icon="pi pi-check" value={pdfCni.name} />}
                  </div>
                </div>
              </div>
            )}

            <Message severity="warn" text="Cette action débite la caisse (ou enregistre le paiement par chèque) et ne peut pas être annulée." className="w-full" />

            {err && <Message severity="error" text={err} className="w-full" />}
          </div>
        )}
      </Dialog>
    </div>
  )
}
