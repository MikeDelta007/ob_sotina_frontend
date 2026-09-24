'use client'
import { useEffect, useState } from 'react'
import { Alerte, Bouton, Champ, CLASSE_INPUT, Modal, Tableau, type Colonne } from './ui'
import { useTicketRestaurantStore } from './useTicketRestaurantStore'
import { fmt, datesCochees, type TicketRestaurant } from './types'

export default function AValiderTab() {
  const { aValider, loading, actionLoadingId, error, fetchAValider, valider, rejeter } = useTicketRestaurantStore()
  const [rejetTarget, setRejetTarget] = useState<TicketRestaurant | null>(null)
  const [motifRejet, setMotifRejet] = useState('')
  const [err, setErr] = useState('')

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

  const colonnes: Colonne<TicketRestaurant>[] = [
    { titre: 'Demandeur', rendu: t => t.creeParNom || t.creePar },
    { titre: 'Dates', rendu: t => datesCochees(t) },
    { titre: 'Agents', rendu: t => (t.agentNoms ?? []).join(', ') || '—' },
    { titre: 'Jours', rendu: t => t.nombreJours, alignement: 'centre' },
    { titre: 'Montant', rendu: t => fmt(t.montantTotal), alignement: 'droite' },
    {
      titre: 'Actions', alignement: 'centre',
      rendu: t => (
        <div className="tw-flex tw-justify-center tw-gap-2">
          <Bouton variante="succes" chargement={actionLoadingId === t.id} onClick={() => valider(t.id)}>Valider</Bouton>
          <Bouton variante="contour" className="!tw-border-red-300 !tw-text-red-600" disabled={actionLoadingId === t.id} onClick={() => ouvrirRejet(t)}>Rejeter</Bouton>
        </div>
      ),
    },
  ]

  return (
    <div className="tw-flex tw-flex-col tw-gap-3">
      <p className="tw-m-0 tw-text-sm tw-text-gray-500">{aValider.length} demande(s) en attente de validation</p>
      {error && <Alerte>{error}</Alerte>}

      <Tableau lignes={aValider} colonnes={colonnes} chargement={loading}
        recherche={t => `${t.creeParNom ?? ''} ${t.creePar} ${(t.agentNoms ?? []).join(' ')}`}
        vide="Aucune demande en attente" />

      <Modal ouvert={!!rejetTarget} titre="Rejeter la demande" onFermer={fermerRejet}
        pied={
          <>
            <Bouton variante="contour" className="tw-flex-1" onClick={fermerRejet}>Annuler</Bouton>
            <Bouton variante="danger" className="tw-flex-1" chargement={actionLoadingId === rejetTarget?.id} onClick={confirmerRejet}>Confirmer le rejet</Bouton>
          </>
        }>
        <div className="tw-flex tw-flex-col tw-gap-3">
          <Champ etiquette="Motif du rejet *">
            <textarea value={motifRejet} onChange={e => setMotifRejet(e.target.value)} rows={3} className={CLASSE_INPUT}
              placeholder="Expliquez pourquoi cette demande est rejetée…" />
          </Champ>
          {err && <Alerte>{err}</Alerte>}
        </div>
      </Modal>
    </div>
  )
}
