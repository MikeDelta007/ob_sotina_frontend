'use client'
import { useEffect, useState } from 'react'
import { saveAs } from 'file-saver'
import axiosInstance from '@/app/api/axiosInstance'
import { Alerte, Badge, Bouton, Tableau, type Colonne } from './ui'
import { useTicketRestaurantStore } from './useTicketRestaurantStore'
import { fmt, datesCochees, STATUT_LABEL, type StatutTR, type TicketRestaurant } from './types'

const COULEUR_STATUT: Record<StatutTR, 'attente' | 'succes' | 'danger'> = { EN_ATTENTE: 'attente', VALIDEE: 'succes', REJETEE: 'danger' }

export default function ToutesTab() {
  const { toutes, loading, fetchToutes } = useTicketRestaurantStore()
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [erreurTelechargement, setErreurTelechargement] = useState(false)

  useEffect(() => { fetchToutes() }, [])

  const telecharger = async (t: TicketRestaurant) => {
    setDownloadingId(t.id); setErreurTelechargement(false)
    try {
      const { data } = await axiosInstance.get(`ticket-restaurant/${t.id}/liste.pdf`, { responseType: 'blob' })
      saveAs(data, `tickets_restaurant_${t.id}.pdf`)
    } catch {
      setErreurTelechargement(true)
    } finally {
      setDownloadingId(null)
    }
  }

  const colonnes: Colonne<TicketRestaurant>[] = [
    { titre: 'Demandeur', rendu: t => t.creeParNom || t.creePar },
    { titre: 'Dates', rendu: t => datesCochees(t) },
    { titre: 'Agents', rendu: t => `${t.agentNoms?.length ?? 0} agent(s)`, alignement: 'centre' },
    { titre: 'Montant', rendu: t => fmt(t.montantTotal), alignement: 'droite' },
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
        recherche={t => `${t.creeParNom ?? ''} ${t.creePar} ${STATUT_LABEL[t.statut]} ${t.motifRejet ?? ''} ${(t.agentNoms ?? []).join(' ')}`}
        vide="Aucune demande de tickets restaurant" />
    </div>
  )
}
