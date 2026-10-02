'use client'
import ProtectedRoute from '@/layout/ProtectedRoute'
import TicketRestaurantPage from './TicketRestaurantPage'

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={['DIRECTEUR', 'ASSISTANTE_DIRECTEUR', 'TICKET_RESTAURANT']}>
      <TicketRestaurantPage />
    </ProtectedRoute>
  )
}
