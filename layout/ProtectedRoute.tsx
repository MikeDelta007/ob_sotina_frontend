import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '@/app/userContext'; // Assurez-vous que le chemin est correct
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);  // Pour gérer l'état de chargement
  const [isClient, setIsClient] = useState(false);  // Pour vérifier si on est côté client
  const router = useRouter();  // Utiliser useRouter pour la navigation

  // Effect qui se lance après que le composant soit monté côté client
  useEffect(() => {
    setIsClient(true);  // Une fois monté, on sait que nous sommes côté client
  }, []);

  // Vérification des rôles lorsque le composant est monté côté client
  useEffect(() => {
    if (!isClient) return;  // Ne pas exécuter si on n'est pas côté client

    if (!user) {
      // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
      router.push('/se-connecter');
      setLoading(false);  // Stopper le loading après la redirection
      return;
    }

    // Vérifier les rôles de l'utilisateur
    const roleName = user?.profil?.name;
    if (!roleName || !allowedRoles?.includes(roleName)) {
      router.push('/se-connecter');  // Rediriger si l'utilisateur n'a pas les bons rôles
    } else {
      setLoading(false);  // Si l'utilisateur a accès, arrêter le loading
    }
  }, [user, allowedRoles, router, isClient]);

  if (loading || !isClient) return <div>PortailBAC, chargement en cours...</div>;  // Afficher un message de chargement tant que la vérification est en cours

  // Si l'utilisateur n'a pas les bons rôles, ne rien afficher
  const roleName = user?.profil?.name;
  if (!roleName || !allowedRoles?.includes(roleName)) {
    return <div>Accès refusé à PortailBAC</div>;  // Optionnel : afficher un message d'accès refusé
  }

  return <>{children}</>;  // Afficher les enfants si l'utilisateur est autorisé
};

export default ProtectedRoute;
