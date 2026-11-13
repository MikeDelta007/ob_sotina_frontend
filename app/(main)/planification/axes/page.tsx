'use client'
import ProtectedRoute from '@/layout/ProtectedRoute'
import AxesPage from './AxesPage'

export default function Page() {
  return (
    // Le rôle seul ne suffit pas à distinguer "chef de la division Hygiène et Sécurité" d'un
    // autre chef de service — CHEF_SERVICE n'est inclus ici que pour ne pas bloquer ce chef-là
    // avant même d'atteindre la page ; AxesPage fait ensuite la vérification précise (serveur
    // compris) et refuse l'accès à tout autre chef de service.
    <ProtectedRoute allowedRoles={['ADMIN', 'DIRECTEUR', 'ASSISTANTE_DIRECTEUR', 'CSA', 'CHEF_SERVICE']}>
      <AxesPage />
    </ProtectedRoute>
  )
}
