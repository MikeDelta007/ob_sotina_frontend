'use client'
import { useState } from 'react'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { tracesEb, type ExpressionBesoin } from './types'

const ICONE: Record<string, string> = {
  valide: 'pi pi-check-circle tw-text-green-600',
  rejete: 'pi pi-times-circle tw-text-red-600',
  attente: 'pi pi-clock tw-text-yellow-500',
}

// Bouton affichant la traçabilité complète de l'expression de besoin : qui a créé, validé
// ou rejeté (avec motif), à chaque étape de la chaîne — visible par toutes les parties
// (créateur, CSA, Directeur, comptabilité), comme pour les congés/autorisations.
export default function TraceButton({ eb }: { eb: ExpressionBesoin }) {
  const [visible, setVisible] = useState(false)
  const etapes = tracesEb(eb)

  return (
    <>
      <Button icon="pi pi-history" text rounded severity="secondary" size="small"
        tooltip="Traçabilité" tooltipOptions={{ position: 'top' }} onClick={() => setVisible(true)} />

      <Dialog header="Traçabilité de la demande" visible={visible} onHide={() => setVisible(false)}
        style={{ width: '26rem' }} draggable={false}>
        <div className="tw-flex tw-flex-col tw-gap-3">
          {eb.beneficiaireNom && (
            <div className="tw-text-sm tw-text-gray-500">
              Bénéficiaire : <span className="tw-font-medium tw-text-gray-700">{eb.beneficiaireNom}</span>
            </div>
          )}
          {etapes.map((e, i) => (
            <div key={i} className="tw-flex tw-items-start tw-gap-2">
              <i className={`${ICONE[e.statut]} tw-mt-1`} />
              <div className="tw-flex-1">
                <div className="tw-text-sm tw-font-medium">
                  {e.role}
                  {e.statut === 'attente' && <span className="tw-text-yellow-600"> — en attente</span>}
                  {e.statut === 'rejete' && <span className="tw-text-red-600"> — rejeté</span>}
                </div>
                {e.nom && <div className="tw-text-sm tw-text-gray-600">{e.nom}</div>}
                {e.date && (
                  <div className="tw-text-xs tw-text-gray-400">
                    {new Date(e.date).toLocaleString('fr-FR')}
                  </div>
                )}
                {e.motif && (
                  <div className="tw-text-sm tw-text-red-600 tw-mt-1">Motif : {e.motif}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Dialog>
    </>
  )
}
