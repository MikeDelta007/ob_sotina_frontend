'use client'
import { useContext, useEffect, useState } from 'react'
import axiosInstance from '@/app/api/axiosInstance'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { Dropdown } from 'primereact/dropdown'
import { FileUpload, FileUploadSelectEvent } from 'primereact/fileupload'
import { InputNumber } from 'primereact/inputnumber'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { Message } from 'primereact/message'
import { SelectButton } from 'primereact/selectbutton'
import { Tag } from 'primereact/tag'
import { UserContext } from '@/app/userContext'
import { useMandatementStore } from './useMandatementStore'
import { useCaisseStore } from './useCaisseStore'
import { modeAuto, fmt, SEUIL_CHEQUE, ligneEstValide } from './types'
import type { ExpressionBesoin } from '../expression-besoin/types'
import LigneFactureRow from './LigneFactureRow'

const TYPE_OPTIONS = [
  { label: 'Simple (1 facture)', value: 'SIMPLE' },
  { label: 'Cumulatif (N factures)', value: 'CUMULATIF' },
]
const TYPE_PAIEMENT_OPTIONS = [
  { label: 'Totalité', value: 'TOTALITE' },
  { label: 'Avance + Reliquat', value: 'AVANCE' },
]

export default function MandatementModal() {
  const {
    open, type, typePaiement,
    ligneSimple, lignes, montantAvance, description,
    beneficiaire, numeroCni, expressionBesoinId,
    closeModal, setType, setTypePaiement,
    setLigneSimple, addLigne, setMontantAvance, setDescription,
    setBeneficiaire, setNumeroCni, setExpressionBesoinId,
    getMontantTotal, getMontantReliquat, reset,
  } = useMandatementStore()

  const { motifs, caisse, fetchCaisse, fetchMandatements, openApprovisionnementModal } = useCaisseStore()
  const [loading, setLoading] = useState(false)
  const [err, setErr]         = useState('')
  const [success, setSuccess] = useState('')

  const { user } = useContext(UserContext)
  const role = user?.profil?.name
  const peutLierExpressionBesoin = role === 'CHEF_COMPTABLE' || role === 'AGENT_COMPTABLE' || role === 'ADMIN'
  const [expressionsDisponibles, setExpressionsDisponibles] = useState<ExpressionBesoin[]>([])

  useEffect(() => {
    if (open && peutLierExpressionBesoin) {
      axiosInstance.get('expression-besoin/disponibles-mandatement')
        .then(({ data }) => setExpressionsDisponibles(data))
        .catch(() => setExpressionsDisponibles([]))
    }
  }, [open, peutLierExpressionBesoin])

  // Pour le type SIMPLE uniquement — pour le CUMULATIF, chaque ligne choisit sa
  // propre expression de besoin (voir LigneFactureRow).
  const choisirExpressionBesoin = (id: string) => {
    setExpressionBesoinId(id)
    const eb = expressionsDisponibles.find(e => e.id === id)
    if (!eb) return
    setBeneficiaire(eb.beneficiaire ?? '')
    setLigneSimple({
      montant: eb.montantReel ?? eb.montantInitial, motifId: eb.motifId, motifLibelle: eb.motifLibelle,
      expressionBesoinId: id,
    })
  }

  const soldeCaisse = caisse?.montant ?? 0
  const total    = getMontantTotal()
  const reliquat = getMontantReliquat()
  // En paiement AVANCE, tant que le montant de l'avance n'est pas saisi, on ne peut
  // pas encore décider du mode de décaissement — on attend.
  const attenteAvance = typePaiement === 'AVANCE' && montantAvance <= 0
  // Le mode (espèces/chèque) et la vérification du solde portent sur le montant
  // réellement décaissé maintenant — l'avance en cas de paiement AVANCE, sinon le total.
  const avanceEffective = typePaiement === 'AVANCE' ? montantAvance : total
  const mode = modeAuto(avanceEffective, soldeCaisse)
  const soldeInsuffisant = avanceEffective > 0
    && avanceEffective <= SEUIL_CHEQUE
    && soldeCaisse < avanceEffective

  // Montant à utiliser pour décider du mode de LA facture simple (même logique que
  // le décaissement global) — l'avance si AVANCE, sinon le montant de la facture.
  const montantPourModeSimple = typePaiement === 'AVANCE' ? montantAvance : (ligneSimple.montant ?? 0)

  const avanceValide = typePaiement !== 'AVANCE' || (montantAvance > 0 && montantAvance <= total)
  const piecesValides = type === 'SIMPLE'
    ? ligneEstValide(ligneSimple)
    : lignes.length > 0 && lignes.every(ligneEstValide)
  const nbFacturesValide = type !== 'CUMULATIF' || lignes.length >= 2
  // Un mandatement cumulatif regroupe de petites factures destinées à un paiement en
  // espèces : c'est le CUMUL (total) qui ne doit dépasser ni le seuil chèque, ni ce que
  // la caisse peut couvrir — pas chaque facture individuellement.
  const totalSousLeSeuil = type !== 'CUMULATIF' || total <= SEUIL_CHEQUE
  const totalCouvertParCaisse = type !== 'CUMULATIF' || total <= soldeCaisse
  const formulaireValide = total > 0 && piecesValides && avanceValide && nbFacturesValide
    && totalSousLeSeuil && totalCouvertParCaisse

  const allerApprovisionner = () => {
    closeModal()
    openApprovisionnementModal()
  }

  const valider = async () => {
    setErr(''); setSuccess('')
    if (!formulaireValide) { setErr('Veuillez compléter tous les champs et pièces justificatives requis'); return }

    setLoading(true)
    try {
      const form = new FormData()

      if (type === 'SIMPLE') {
        // ── Simple : 1 facture ──
        const dataSimple = new Blob([JSON.stringify({
          montant: ligneSimple.montant,
          motifId: ligneSimple.motifId,
          motifLibelle: ligneSimple.motifLibelle,
          typePaiement,
          montantAvance: typePaiement === 'AVANCE' ? montantAvance : undefined,
          description: description || undefined,
          beneficiaire: beneficiaire || undefined,
          numeroCni: numeroCni || undefined,
          expressionBesoinId: expressionBesoinId || undefined,
        })], { type: 'application/json' })
        form.append('data', dataSimple)
        if (ligneSimple.piecesJustificatives) form.append('piecesJustificatives', ligneSimple.piecesJustificatives)
        await axiosInstance.post('mandatement/simple', form,
          { headers: { 'Content-Type': 'multipart/form-data' } })

      } else {
        // ── Cumulatif : N lignes = N mandatements simples ──
        const dataCumulatif = new Blob([JSON.stringify({
          lignes: lignes.map(l => ({
            montant: l.montant,
            motifId: l.motifId,
            motifLibelle: l.motifLibelle,
            beneficiaire: l.beneficiaire || undefined,
            expressionBesoinId: l.expressionBesoinId,
          })),
          typePaiement,
          montantAvanceGlobal: typePaiement === 'AVANCE' ? montantAvance : undefined,
          description: description || undefined,
          numeroCni: numeroCni || undefined,
        })], { type: 'application/json' })
        form.append('data', dataCumulatif)
        lignes.forEach(l => {
          if (l.piecesJustificatives) form.append('pieces', l.piecesJustificatives)
        })
        await axiosInstance.post('mandatement/cumulatif', form,
          { headers: { 'Content-Type': 'multipart/form-data' } })
      }

      setSuccess('Mandatement enregistré ✓')
      await Promise.all([fetchCaisse(), fetchMandatements()])
      setTimeout(() => { reset(); closeModal() }, 1400)
    } catch (e: any) {
      setErr(e.response?.data?.message ?? 'Erreur lors du mandatement')
    } finally {
      setLoading(false)
    }
  }

  const footer = (
    <div className="flex gap-2">
      <Button label="Annuler" outlined className="flex-1" onClick={closeModal} disabled={loading} />
      <Button label="Valider le mandatement" className="flex-1" loading={loading}
        disabled={loading || !formulaireValide} onClick={valider} />
    </div>
  )

  return (
    <Dialog header="Nouveau mandatement" visible={open} onHide={closeModal}
      style={{ width: '55rem' }} breakpoints={{ '1200px': '75vw', '960px': '90vw' }} footer={footer} draggable={false}>
      <div className="flex flex-column gap-4">

        {/* ① Type mandatement */}
        <div>
          <label className="font-medium block mb-2">① Type de mandatement</label>
          <SelectButton value={type} onChange={e => e.value && setType(e.value)} options={TYPE_OPTIONS} className="w-full" />
        </div>

        {/* ② Type paiement */}
        <div>
          <label className="font-medium block mb-2">② Mode de règlement</label>
          <SelectButton value={typePaiement} onChange={e => e.value && setTypePaiement(e.value)} options={TYPE_PAIEMENT_OPTIONS} className="w-full" />
        </div>

        {/* ── Expression de besoin traitée (obligatoire) — CUMULATIF : une par ligne ── */}
        {peutLierExpressionBesoin && type === 'SIMPLE' && (
          <div className="field">
            <label className="block text-sm text-color-secondary mb-1">
              Expression de besoin * — pré-remplit montant, motif et bénéficiaire
            </label>
            <Dropdown value={expressionBesoinId} className="w-full"
              options={expressionsDisponibles.map(eb => ({
                label: `${eb.motifLibelle ?? '—'} — ${fmt(eb.montantReel ?? eb.montantInitial)} (${eb.creePar})`,
                value: eb.id,
              }))}
              placeholder="Choisir une expression de besoin…"
              onChange={e => e.value && choisirExpressionBesoin(e.value)} />
          </div>
        )}

        {/* ── Formulaire SIMPLE ── */}
        {type === 'SIMPLE' && (
          <div className="card">
            <p className="font-medium mt-0 mb-3">Facture</p>

            <div className="grid formgrid">
              <div className="col-12 md:col-6 field">
                <label className="block text-sm text-color-secondary mb-1">Montant (FCFA) *</label>
                <InputNumber value={ligneSimple.montant || null} min={1} className="w-full"
                  onValueChange={e => setLigneSimple({ montant: e.value ?? 0 })} placeholder="0" />
              </div>
              <div className="col-12 md:col-6 field">
                <label className="block text-sm text-color-secondary mb-1">Motif *</label>
                <Dropdown value={ligneSimple.motifId} className="w-full"
                  options={motifs.map(m => ({ label: m.libelle, value: m.id }))}
                  placeholder="Choisir un motif…"
                  onChange={e => {
                    const m = motifs.find(x => x.id === e.value)
                    setLigneSimple({ motifId: e.value, motifLibelle: m?.libelle })
                  }} />
              </div>
            </div>

            {(ligneSimple.montant ?? 0) > 0 && attenteAvance && (
              <Message severity="info" className="mb-3"
                text="Saisissez le montant de l'avance pour déterminer le mode de décaissement." />
            )}

            {(ligneSimple.montant ?? 0) > 0 && !attenteAvance && (
              <Tag severity={modeAuto(montantPourModeSimple, soldeCaisse) === 'ESPECES' ? 'success' : 'warning'}
                icon={modeAuto(montantPourModeSimple, soldeCaisse) === 'ESPECES' ? 'pi pi-money-bill' : 'pi pi-credit-card'}
                value={`${modeAuto(montantPourModeSimple, soldeCaisse) === 'ESPECES' ? 'Espèces' : 'Chèque'} — ${fmt(montantPourModeSimple)}`}
                className="mb-3" />
            )}

            {/* Pièces justificatives — un seul PDF (facture, et chèque/CNI si besoin) */}
            <div className="field">
              <label className="block text-sm text-color-secondary mb-1">Pièces justificatives (PDF) *</label>
              <div className="flex align-items-center gap-2">
                <FileUpload mode="basic" name="piecesJustificatives" accept="application/pdf" auto={false}
                  chooseLabel="Choisir un PDF"
                  onSelect={(e: FileUploadSelectEvent) => setLigneSimple({ piecesJustificatives: e.files[0] ?? null })} />
                {ligneSimple.piecesJustificatives && <Tag severity="success" icon="pi pi-check" value={ligneSimple.piecesJustificatives.name} />}
              </div>
            </div>
          </div>
        )}

        {/* ── Formulaire CUMULATIF ── */}
        {type === 'CUMULATIF' && (
          <div>
            <p className="font-medium mb-3">Liste des factures ({lignes.length})</p>
            {!nbFacturesValide && (
              <Message severity="info" className="w-full mb-3"
                text="Un mandatement cumulatif nécessite au moins deux factures." />
            )}
            {total > SEUIL_CHEQUE && !totalSousLeSeuil && (
              <Message severity="error" className="w-full mb-3"
                text={`Le total du mandatement cumulatif (${fmt(total)}) dépasse ${fmt(SEUIL_CHEQUE)}. Supprimez une ou plusieurs factures, ou utilisez un mandatement simple.`} />
            )}
            {lignes.map((l, i) => (
              <LigneFactureRow key={l._localId} ligne={l} index={i}
                canRemove={lignes.length > 1} expressionsDisponibles={expressionsDisponibles} />
            ))}
            <Button type="button" label="Ajouter une facture" icon="pi pi-plus" outlined
              className="w-full" onClick={() => addLigne()} />
            {total > 0 && (
              <div className="card mt-3 flex justify-content-between align-items-center py-2">
                <span className="text-color-secondary">Total {lignes.length} factures</span>
                <strong>{fmt(total)}</strong>
              </div>
            )}
            {total > 0 && !totalCouvertParCaisse && (
              <Message severity="error" className="w-full mt-3" content={
                <div className="p-2 flex flex-column gap-2">
                  <div>
                    <div className="font-semibold mb-1">Le total dépasse le solde de la caisse</div>
                    <div className="text-sm">
                      Total des factures : <strong>{fmt(total)}</strong> — solde disponible : <strong>{fmt(soldeCaisse)}</strong> (dépassement de {fmt(total - soldeCaisse)}).
                      Supprimez une ou plusieurs factures pour réduire le total, ou approvisionnez la caisse pour couvrir ce montant.
                    </div>
                  </div>
                  <Button label="Approvisionner la caisse" icon="pi pi-wallet" size="small"
                    className="align-self-start" onClick={allerApprovisionner} />
                </div>
              } />
            )}
          </div>
        )}

        {/* ── Avance + Reliquat ── */}
        {typePaiement === 'AVANCE' && total > 0 && (
          <div className="card">
            <p className="font-semibold mt-0 mb-3">Décaissement : {fmt(total)}</p>
            <div className="field">
              <label className="block text-sm text-color-secondary mb-1">Montant de l'avance (#2)</label>
              <InputNumber value={montantAvance || null} min={1} max={total} className="w-full"
                onValueChange={e => setMontantAvance(e.value ?? 0)} placeholder="Montant avance…" />
            </div>
            {montantAvance > 0 && (
              <div className="flex flex-column gap-1 pt-2 border-top-1 surface-border">
                <div className="flex justify-content-between text-sm">
                  <span className="text-color-secondary">Avance versée (#2)</span>
                  <strong>{fmt(montantAvance)}</strong>
                </div>
                {reliquat > 0 && (
                  <div className="flex justify-content-between text-sm">
                    <span className="text-color-secondary">Reliquat restant (#2')</span>
                    <strong>{fmt(reliquat)}</strong>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Bénéficiaire (Simple uniquement — en Cumulatif, un par facture) + N° CNI ── */}
        <div className="grid formgrid">
          {type === 'SIMPLE' && (
            <div className="col-12 md:col-6 field">
              <label className="block text-sm text-color-secondary mb-1">Bénéficiaire</label>
              <InputText value={beneficiaire} onChange={e => setBeneficiaire(e.target.value)}
                className="w-full" placeholder="Nom du bénéficiaire" />
            </div>
          )}
          <div className="col-12 md:col-6 field">
            <label className="block text-sm text-color-secondary mb-1">N° CNI (optionnel)</label>
            <InputText value={numeroCni} onChange={e => setNumeroCni(e.target.value)}
              className="w-full" placeholder="Numéro de la CNI" />
          </div>
        </div>

        {/* ── Observations ── */}
        <div className="field">
          <label className="block text-sm text-color-secondary mb-1">Observations (optionnel)</label>
          <InputTextarea value={description} onChange={e => setDescription(e.target.value)}
            rows={2} className="w-full" placeholder="Remarques éventuelles sur ce mandatement…" />
        </div>

        {/* ── Alerte solde caisse insuffisant ── */}
        {soldeInsuffisant && (
          <Message severity="warn" className="w-full" content={
            <div className="p-2 flex flex-column gap-2">
              <div>
                <div className="font-semibold mb-1">Solde de la caisse insuffisant pour un paiement en espèces</div>
                <div className="text-sm">
                  Solde actuel : <strong>{fmt(soldeCaisse)}</strong> — besoin : <strong>{fmt(avanceEffective)}</strong>.
                  Le paiement sera effectué par chèque, ou vous pouvez approvisionner la caisse avant de continuer.
                </div>
              </div>
              <Button label="Approvisionner la caisse" icon="pi pi-wallet" size="small"
                className="align-self-start" onClick={allerApprovisionner} />
            </div>
          } />
        )}

        {/* ── Pièces justificatives manquantes ── */}
        {total > 0 && !attenteAvance && !piecesValides && (
          <Message severity="info" className="w-full"
            text="Chaque facture doit être liée à une expression de besoin, avec ses pièces justificatives (PDF) fournies, pour pouvoir valider." />
        )}

        {/* ── Récap décaissement ── */}
        {avanceEffective > 0 && (
          <Message severity={mode === 'ESPECES' ? 'success' : 'warn'} className="w-full" content={
            <div className="p-2">
              <div className="font-semibold mb-1">
                {mode === 'ESPECES'
                  ? 'Décaissement espèces — caisse débitée'
                  : 'Paiement par chèque — caisse non débitée'}
              </div>
              <div>Montant décaissé : <strong>{fmt(avanceEffective)}</strong></div>
            </div>
          } />
        )}

        {err     && <Message severity="error" text={err} className="w-full" />}
        {success && <Message severity="success" text={success} className="w-full" />}
      </div>
    </Dialog>
  )
}
