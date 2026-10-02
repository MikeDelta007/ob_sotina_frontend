'use client'
import { MotifsAdmin } from './ui'
import { useTicketRestaurantStore } from './useTicketRestaurantStore'

// Rôles/droits pouvant être associés à un motif — un compte ne voit, à la création, que les
// motifs dont l'un de ses rôles (principal ou supplémentaire) figure ici (vide = tous).
const ROLES_DISPONIBLES = [
  { label: 'Administrateur', value: 'ADMIN' },
  { label: 'Pédagogie', value: 'PEDAGOGIE' },
  { label: 'Planification', value: 'PLANIFICATION' },
  { label: 'Chef de service', value: 'CHEF_SERVICE' },
  { label: 'CSA', value: 'CSA' },
  { label: 'Directeur', value: 'DIRECTEUR' },
  { label: 'Chef comptable', value: 'CHEF_COMPTABLE' },
  { label: 'Agent comptable', value: 'AGENT_COMPTABLE' },
  { label: 'Assistante Directeur', value: 'ASSISTANTE_DIRECTEUR' },
  { label: 'Chef de service Diplôme', value: 'CHEF_SERVICE_DIPLOME' },
  { label: 'Scolarité', value: 'SCOLARITE' },
]

export default function MotifsTab() {
  const { motifsAdmin, fetchMotifsAdmin, creerMotif, modifierMotif, supprimerMotif } = useTicketRestaurantStore()
  return (
    <MotifsAdmin motifs={motifsAdmin} fetchMotifs={fetchMotifsAdmin}
      onCreer={creerMotif} onModifier={modifierMotif} onSupprimer={supprimerMotif}
      rolesDisponibles={ROLES_DISPONIBLES} />
  )
}
