'use client'
import ProtectedRoute from '@/layout/ProtectedRoute'
import ExpressionBesoinPage from './ExpressionBesoinPage'

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={['CHEF_SERVICE', 'CSA', 'DIRECTEUR', 'CHEF_COMPTABLE', 'AGENT_COMPTABLE', 'ADMIN']}>
      <ExpressionBesoinPage />
    </ProtectedRoute>
  )
}
