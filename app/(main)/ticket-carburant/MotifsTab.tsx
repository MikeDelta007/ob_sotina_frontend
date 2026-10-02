'use client'
import { MotifsAdmin } from '../ticket-restaurant/ui'
import { useTicketCarburantStore } from './useTicketCarburantStore'

export default function MotifsTab() {
  const { motifsAdmin, fetchMotifsAdmin, creerMotif, modifierMotif, supprimerMotif } = useTicketCarburantStore()
  return (
    <MotifsAdmin motifs={motifsAdmin} fetchMotifs={fetchMotifsAdmin}
      onCreer={creerMotif} onModifier={modifierMotif} onSupprimer={supprimerMotif} />
  )
}
