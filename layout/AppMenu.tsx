import { MenuModal } from '@/types/layout';
import AppSubMenu from './AppSubMenu';
import { useContext } from 'react';
import { UserContext } from '@/app/userContext';
import "primeicons/primeicons.css";

type Role = 'ADMIN' | 'AGENT_DE_SAISIE' | 'SCOLARITE' | 'CHEF_ETABLISSEMENT' | 'RECEPTIONNISTE' | 'AUTORISATION_RECEPTION' | 'VIGNETTES_COUPONS';

interface User {
  username: string;
  role: Role;
}

const AppMenu = () => {
    const { user } = useContext(UserContext);

    const isRole = (value: string): value is Role => {
        return ['ADMIN', 'AGENT_DE_SAISIE', 'SCOLARITE', 'CHEF_ETABLISSEMENT', 'RECEPTIONNISTE', 'VIGNETTES_COUPONS', 'AUTORISATION_RECEPTION'].includes(value);
    };

    const hasAccess = (roles: Role[]): boolean => {
        const roleName = user?.profil?.name;
        return isRole(roleName) && roles.includes(roleName);
    };

    const model: MenuModal[] = [
        hasAccess(['AGENT_DE_SAISIE', 'SCOLARITE', 'ADMIN']) && {
            //label: 'Dashboards',
            icon: 'pi pi-home',
            items: [
                {
                    label: 'Tableau de bord',
                    icon: 'pi pi-fw pi-home',
                    to: '/tableau-de-bord'
                }
            ]
        },
        { separator: true },
        hasAccess(['ADMIN']) && {
            label: 'Programmation',
            items: [
                {
                    label: 'Programmation',
                    icon: 'pi pi-fw pi-calendar',
                    to: '/pedagogie/programmation-calendrier',
                } 
            ]
        },
        { separator: true },
        hasAccess(['ADMIN']) && {
            label: 'Gestion des données',
            icon: 'pi pi-home',
            items: [
                {
                    label: 'Données',
                    icon: 'pi pi-fw pi-database',
                    to: '/pedagogie/gestion-donnees',
                },
                {
                    label: 'Répartition',
                    icon: 'pi pi-fw pi-sitemap',
                    to: '/pedagogie/repartition-tirage-sujets',
                },
                {
                    label: 'Feuilles',
                    icon: 'pi pi-fw pi-copy',
                    to: '/pedagogie/repartition-feuille'
                },
                
            ]
        }
        
];

    return (
    // <ProtectedRoute allowedRoles={['ADMIN', 'AGENT_DE_SAISIE', 'SCOLARITE', 'CHEF_ETABLISSEMENT']}>
    //   <AppSubMenu model={model} />
    // </ProtectedRoute>
     <AppSubMenu model={model} />
  );
};

export default AppMenu;
