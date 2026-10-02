'use client'
import { useEffect, useState } from 'react'
import { saveAs } from 'file-saver'
import axiosInstance from '@/app/api/axiosInstance'
import { Alerte, Badge, Bouton, Tableau, type Colonne } from '../ticket-restaurant/ui'
import { useTicketCarburantStore } from './useTicketCarburantStore'
import { STATUT_LABEL, type StatutTC, type TicketCarburant } from './types'

const COULEUR_STATUT: Record<StatutTC, 'attente' | 'succes' | 'danger'> = { EN_ATTENTE: 'attente', VALIDEE: 'succes', REJETEE: 'danger' }

export default function ToutesTab() {
  const { toutes, loading, fetchToutes } = useTicketCarburantStore()
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [erreurTelechargement, setErreurTelechargement] = useState(false)

  useEffect(() => { fetchToutes() }, [])

  const telecharger = async (t: TicketCarburant) => {
    setDownloadingId(t.id); setErreurTelechargement(false)
    try {
      const { data } = await axiosInstance.get(`ticket-carburant/${t.id}/fiche.pdf`, { responseType: 'blob' })
      saveAs(data, `demande_carburant_${t.id}.pdf`)
    } catch {
      setErreurTelechargement(true)
    } finally {
      setDownloadingId(null)
    }
  }

  const colonnes: Colonne<TicketCarburant>[] = [
    { titre: 'Demandeur', rendu: t => t.creeParNom || t.creePar },
    { titre: 'Date', rendu: t => new Date(t.date).toLocaleDateString('fr-FR') },
    { titre: 'Trajet', rendu: t => `${t.villeDepartNom} — ${t.villeArriveeNom}` },
    { titre: 'Demandé', rendu: t => t.nombreTicketsDemande, alignement: 'centre' },
    { titre: 'Accordé', rendu: t => t.nombreTicketsAccorde ?? '—', alignement: 'centre' },
    { titre: 'Statut', rendu: t => <Badge couleur={COULEUR_STATUT[t.statut]}>{STATUT_LABEL[t.statut]}</Badge>, alignement: 'centre' },
    { titre: 'Motif de rejet', rendu: t => t.motifRejet || '—' },
    {
      titre: 'Actions', alignement: 'centre',
      rendu: t => t.statut === 'VALIDEE' && (
        <Bouton chargement={downloadingId === t.id} onClick={() => telecharger(t)}>Télécharger le PDF</Bouton>
      ),
    },
  ]

  return (
    <div className="tw-flex tw-flex-col tw-gap-3">
      {erreurTelechargement && <Alerte>Téléchargement impossible</Alerte>}
      <Tableau lignes={toutes} colonnes={colonnes} chargement={loading}
        recherche={t => `${t.creeParNom ?? ''} ${t.creePar} ${t.motifLibelle} ${t.villeDepartNom} ${t.villeArriveeNom}`}
        vide="Aucune demande de carburant" />
    </div>
  )
}
