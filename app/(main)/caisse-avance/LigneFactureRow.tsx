'use client'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import { FileUpload, FileUploadSelectEvent } from 'primereact/fileupload'
import { InputNumber } from 'primereact/inputnumber'
import { Message } from 'primereact/message'
import { Tag } from 'primereact/tag'
import type { LigneLocale } from './types'
import { modeAuto, fmt } from './types'
import { useCaisseStore } from './useCaisseStore'
import { useMandatementStore } from './useMandatementStore'

interface Props { ligne: LigneLocale; index: number; canRemove: boolean }

export default function LigneFactureRow({ ligne, index, canRemove }: Props) {
  const { motifs, caisse } = useCaisseStore()
  const { typePaiement, montantAvance, getMontantTotal, updateLigne, removeLigne } = useMandatementStore()
  const upd = (p: Partial<LigneLocale>) => updateLigne(ligne._localId, p)

  // En paiement AVANCE, tant que l'avance globale n'est pas saisie, on ne peut pas
  // encore décider du mode ; une fois saisie, on répartit l'avance au prorata de
  // cette facture (même logique que le backend pour les mandatements cumulatifs).
  const total = getMontantTotal()
  const attenteAvance = typePaiement === 'AVANCE' && montantAvance <= 0
  const montantPourMode = typePaiement === 'AVANCE'
    ? (total > 0 ? montantAvance * (ligne.montant / total) : 0)
    : ligne.montant
  const mode = modeAuto(montantPourMode, caisse?.montant ?? 0)

  return (
    <div className="card mb-3">
      <div className="flex align-items-center justify-content-between mb-3">
        <span className="font-medium">Facture {index + 1}</span>
        {canRemove && (
          <Button icon="pi pi-trash" text severity="danger" size="small"
            onClick={() => removeLigne(ligne._localId)} />
        )}
      </div>

      <div className="grid formgrid">
        <div className="col-12 md:col-6 field">
          <label className="block text-sm text-color-secondary mb-1">Montant (FCFA)</label>
          <InputNumber value={ligne.montant || null} min={1} className="w-full"
            onValueChange={e => upd({ montant: e.value ?? 0 })}
            placeholder="0" />
        </div>
        <div className="col-12 md:col-6 field">
          <label className="block text-sm text-color-secondary mb-1">Motif</label>
          <Dropdown value={ligne.motifId} className="w-full"
            options={motifs.map(m => ({ label: m.libelle, value: m.id }))}
            placeholder="Choisir un motif…"
            onChange={e => {
              const m = motifs.find(x => x.id === e.value)
              upd({ motifId: e.value, motifLibelle: m?.libelle })
            }} />
        </div>
      </div>

      {ligne.montant > 0 && attenteAvance && (
        <Message severity="info" className="mb-3"
          text="Saisissez le montant de l'avance pour déterminer le mode de décaissement." />
      )}

      {ligne.montant > 0 && !attenteAvance && (
        <Tag severity={mode === 'ESPECES' ? 'success' : 'warning'}
          icon={mode === 'ESPECES' ? 'pi pi-money-bill' : 'pi pi-credit-card'}
          value={`${mode === 'ESPECES' ? 'Espèces' : 'Chèque'} — ${fmt(montantPourMode)}`}
          className="mb-3" />
      )}

      {/* PDF Facture — toujours */}
      <div className="field">
        <label className="block text-sm text-color-secondary mb-1">PDF Facture *</label>
        <div className="flex align-items-center gap-2">
          <FileUpload mode="basic" name="pdfFacture" accept="application/pdf" auto={false}
            chooseLabel="Choisir un PDF"
            onSelect={(e: FileUploadSelectEvent) => upd({ pdfFacture: e.files[0] ?? null })} />
          {ligne.pdfFacture && <Tag severity="success" icon="pi pi-check" value={ligne.pdfFacture.name} />}
        </div>
      </div>

      {/* Chèque + CNI si montant > 100k (une fois le mode connu) */}
      {!attenteAvance && mode === 'CHEQUE' && (
        <div className="grid formgrid mt-2">
          <div className="col-12 md:col-6 field">
            <label className="block text-sm text-color-secondary mb-1">Chèque (PDF) *</label>
            <div className="flex align-items-center gap-2">
              <FileUpload mode="basic" name="pdfCheque" accept="application/pdf" auto={false}
                chooseLabel="Choisir un PDF"
                onSelect={(e: FileUploadSelectEvent) => upd({ pdfCheque: e.files[0] ?? null })} />
              {ligne.pdfCheque && <Tag severity="success" icon="pi pi-check" value={ligne.pdfCheque.name} />}
            </div>
          </div>
          <div className="col-12 md:col-6 field">
            <label className="block text-sm text-color-secondary mb-1">CNI (PDF) *</label>
            <div className="flex align-items-center gap-2">
              <FileUpload mode="basic" name="pdfCni" accept="application/pdf" auto={false}
                chooseLabel="Choisir un PDF"
                onSelect={(e: FileUploadSelectEvent) => upd({ pdfCni: e.files[0] ?? null })} />
              {ligne.pdfCni && <Tag severity="success" icon="pi pi-check" value={ligne.pdfCni.name} />}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
