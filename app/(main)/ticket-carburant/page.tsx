'use client'
import ProtectedRoute from '@/layout/ProtectedRoute'
import TicketCarburantPage from './TicketCarburantPage'

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={['CSA', 'DIRECTEUR', 'ASSISTANTE_DIRECTEUR', 'TICKET_CARBURANT']}>
      <TicketCarburantPage />
    </ProtectedRoute>
  )
}
