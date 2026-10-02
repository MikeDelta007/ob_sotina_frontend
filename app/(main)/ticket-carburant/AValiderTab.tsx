'use client'
import { useContext, useEffect, useState } from 'react'
import { UserContext } from '@/app/userContext'
import { aUnDesRoles } from '@/app/rolesUtilisateur'
import { Alerte, Bouton, Champ, CLASSE_INPUT, Modal, Tableau, type Colonne } from '../ticket-restaurant/ui'
import { useTicketCarburantStore } from './useTicketCarburantStore'
import type { TicketCarburant } from './types'
import { refreshNotificationCounts } from '@/layout/useNotificationCounts'

export default function AValiderTab() {
  const { aValider, loading, actionLoadingId, error, fetchAValider, valider, rejeter } = useTicketCarburantStore()
  const { user } = useContext(UserContext)
  const estDirecteur = aUnDesRoles(user, ['DIRECTEUR', 'ASSISTANTE_DIRECTEUR'])

  const [validerTarget, setValiderTarget] = useState<TicketCarburant | null>(null)
  const [nombreAccorde, setNombreAccorde] = useState<number | ''>('')
  const [rejetTarget, setRejetTarget] = useState<TicketCarburant | null>(null)
  const [motifRejet, setMotifRejet] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => { fetchAValider() }, [])

  const validerDirect = async (t: TicketCarburant) => {
    try { await valider(t.id); refreshNotificationCounts() } catch { /* erreur affichée via le store */ }
  }

  const ouvrirValiderDirecteur = (t: TicketCarburant) => {
    setValiderTarget(t); setNombreAccorde(t.nombreTicketsDemande); setErr('')
  }
  const fermerValider = () => setValiderTarget(null)
  const confirmerValiderDirecteur = async () => {
    if (!validerTarget) return
    if (!nombreAccorde || nombreAccorde <= 0) { setErr('Le nombre de tickets accordé est requis'); return }
    try {
      await valider(validerTarget.id, nombreAccorde as number)
      refreshNotificationCounts()
      fermerValider()
    } catch {
      setErr('Erreur lors de la validation')
    }
  }

  const ouvrirRejet = (t: TicketCarburant) => { setRejetTarget(t); setMotifRejet(''); setErr('') }
  const fermerRejet = () => setRejetTarget(null)
  const confirmerRejet = async () => {
    if (!rejetTarget) return
    if (!motifRejet.trim()) { setErr('Le motif du rejet est requis'); return }
    try {
      await rejeter(rejetTarget.id, motifRejet.trim())
      refreshNotificationCounts()
      fermerRejet()
    } catch {
      setErr('Erreur lors du rejet')
    }
  }

  const colonnes: Colonne<TicketCarburant>[] = [
    { titre: 'Demandeur', rendu: t => t.creeParNom || t.creePar },
    { titre: 'Division', rendu: t => t.divisionLibelle || '—' },
    { titre: 'Date', rendu: t => new Date(t.date).toLocaleDateString('fr-FR') },
    { titre: 'Trajet', rendu: t => `${t.villeDepartNom} — ${t.villeArriveeNom}` },
    { titre: 'Motif', rendu: t => t.motifLibelle },
    { titre: 'Demandé', rendu: t => t.nombreTicketsDemande, alignement: 'centre' },
    {
      titre: 'Actions', alignement: 'centre',
      rendu: t => (
        <div className="tw-flex tw-justify-center tw-gap-2">
          <Bouton variante="succes" chargement={actionLoadingId === t.id}
            onClick={() => (estDirecteur ? ouvrirValiderDirecteur(t) : validerDirect(t))}>
            Valider
          </Bouton>
          <Bouton variante="contour" className="!tw-border-red-300 !tw-text-red-600" disabled={actionLoadingId === t.id}
            onClick={() => ouvrirRejet(t)}>
            Rejeter
          </Bouton>
        </div>
      ),
    },
  ]

  return (
    <div className="tw-flex tw-flex-col tw-gap-3">
      <p className="tw-m-0 tw-text-sm tw-text-gray-500">{aValider.length} demande(s) en attente de votre validation</p>
      {error && <Alerte>{error}</Alerte>}

      <Tableau lignes={aValider} colonnes={colonnes} chargement={loading}
        recherche={t => `${t.creeParNom ?? ''} ${t.creePar} ${t.motifLibelle} ${t.villeDepartNom} ${t.villeArriveeNom}`}
        vide="Aucune demande en attente" />

      <Modal ouvert={!!validerTarget} titre="Valider la demande de carburant" onFermer={fermerValider}
        pied={
          <>
            <Bouton variante="contour" className="tw-flex-1" onClick={fermerValider}>Annuler</Bouton>
            <Bouton variante="succes" className="tw-flex-1" chargement={actionLoadingId === validerTarget?.id} onClick={confirmerValiderDirecteur}>
              Confirmer la validation
            </Bouton>
          </>
        }>
        <div className="tw-flex tw-flex-col tw-gap-3">
          <p className="tw-m-0 tw-text-sm tw-text-gray-500">
            {validerTarget?.nombreTicketsDemande} ticket(s) demandé(s) pour le trajet {validerTarget?.villeDepartNom} — {validerTarget?.villeArriveeNom}.
          </p>
          <Champ etiquette="Nombre de tickets accordé *">
            <input type="number" min={1} value={nombreAccorde}
              onChange={e => setNombreAccorde(e.target.value === '' ? '' : Number(e.target.value))}
              className={CLASSE_INPUT} />
          </Champ>
          {err && <Alerte>{err}</Alerte>}
        </div>
      </Modal>

      <Modal ouvert={!!rejetTarget} titre="Rejeter la demande" onFermer={fermerRejet}
        pied={
          <>
            <Bouton variante="contour" className="tw-flex-1" onClick={fermerRejet}>Annuler</Bouton>
            <Bouton variante="danger" className="tw-flex-1" chargement={actionLoadingId === rejetTarget?.id} onClick={confirmerRejet}>
              Confirmer le rejet
            </Bouton>
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
