'use client'
import { useState } from 'react'
import { Button } from 'primereact/button'
import { Checkbox } from 'primereact/checkbox'
import { Dialog } from 'primereact/dialog'
import { Message } from 'primereact/message'
import { useExpressionBesoinStore } from './useExpressionBesoinStore'
import type { ExpressionBesoin } from './types'

interface Props { eb: ExpressionBesoin }

// Action réservée à l'Admin : corrige l'exigence/confirmation de satisfaction d'une EB
// (motif mal renseigné, confirmation oubliée…) tant qu'elle n'est pas encore consommée
// par un mandatement — le backend refuse l'ajustement une fois ce cap franchi.
export default function AjusterSatisfactionAction({ eb }: Props) {
  const { actionLoadingId, ajusterSatisfaction } = useExpressionBesoinStore()
  const [open, setOpen] = useState(false)
  const [requiert, setRequiert] = useState(false)
  const [confirmee, setConfirmee] = useState(false)
  const [err, setErr] = useState('')

  if (eb.utiliseePourMandatement) return null

  const ouvrir = () => {
    setRequiert(!!eb.requiertSatisfaction)
    setConfirmee(!!eb.satisfactionConfirmee)
    setErr(''); setOpen(true)
  }

  const enregistrer = async () => {
    try {
      await ajusterSatisfaction(eb.id, requiert, confirmee)
      setOpen(false)
    } catch {
      setErr("Erreur lors de l'ajustement")
    }
  }

  return (
    <>
      <Button icon="pi pi-cog" text size="small" tooltip="Ajuster la satisfaction (admin)" onClick={ouvrir} />
      <Dialog header="Ajuster la satisfaction (admin)" visible={open} onHide={() => setOpen(false)}
        style={{ width: '26rem' }} draggable={false}
        footer={
          <div className="flex gap-2">
            <Button label="Annuler" outlined className="flex-1" onClick={() => setOpen(false)} />
            <Button label="Enregistrer" className="flex-1"
              loading={actionLoadingId === eb.id} onClick={enregistrer} />
          </div>
        }>
        <div className="flex flex-column gap-3">
          {/* Deux booléens indépendants : l'un ne gouverne pas l'affichage ou la valeur de l'autre */}
          <div className="flex align-items-center gap-2">
            <Checkbox inputId={`requiert-${eb.id}`} checked={requiert}
              onChange={e => setRequiert(!!e.checked)} />
            <label htmlFor={`requiert-${eb.id}`} className="text-sm">
              Exige la confirmation de satisfaction du demandeur
            </label>
          </div>
          <div className="flex align-items-center gap-2">
            <Checkbox inputId={`confirmee-${eb.id}`} checked={confirmee}
              onChange={e => setConfirmee(!!e.checked)} />
            <label htmlFor={`confirmee-${eb.id}`} className="text-sm">Satisfaction confirmée</label>
          </div>
          {err && <Message severity="error" text={err} className="w-full" />}
        </div>
      </Dialog>
    </>
  )
}
