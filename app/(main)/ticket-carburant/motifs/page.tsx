'use client'
import ProtectedRoute from '@/layout/ProtectedRoute'
import MotifsTab from '../MotifsTab'

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'CSA', 'DIRECTEUR', 'CHEF_COMPTABLE']}>
      <div className="tw-rounded-xl tw-bg-white tw-p-6 tw-shadow">
        <div className="tw-mb-5">
          <h3 className="tw-m-0 tw-text-xl tw-font-semibold tw-text-gray-800">Motifs — Tickets carburant</h3>
          <p className="tw-mb-0 tw-mt-1 tw-text-sm tw-text-gray-500">
            Liste des motifs proposés à la création d&apos;une demande de tickets carburant.
          </p>
        </div>
        <MotifsTab />
      </div>
    </ProtectedRoute>
  )
}
