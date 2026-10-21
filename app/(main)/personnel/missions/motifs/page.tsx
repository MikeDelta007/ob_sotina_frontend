'use client'
import ProtectedRoute from '@/layout/ProtectedRoute'
import { MotifsAdmin } from '../../../ticket-restaurant/ui'
import { useMissionStore } from '../../useMissionStore'

function MotifsMissionContent() {
  const { motifsAdmin, fetchMotifsAdmin, creerMotif, modifierMotif, supprimerMotif } = useMissionStore()
  return (
    <div className="tw-rounded-xl tw-bg-white tw-p-6 tw-shadow">
      <div className="tw-mb-5">
        <h3 className="tw-m-0 tw-text-xl tw-font-semibold tw-text-gray-800">Motifs — Ordres de mission</h3>
        <p className="tw-mb-0 tw-mt-1 tw-text-sm tw-text-gray-500">
          Liste des motifs proposés à la création d&apos;un ordre de mission.
        </p>
      </div>
      <MotifsAdmin motifs={motifsAdmin} fetchMotifs={fetchMotifsAdmin}
        onCreer={creerMotif} onModifier={modifierMotif} onSupprimer={supprimerMotif} />
    </div>
  )
}

export default function MotifsMissionPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'CSA', 'DIRECTEUR']}>
      <MotifsMissionContent />
    </ProtectedRoute>
  )
}
