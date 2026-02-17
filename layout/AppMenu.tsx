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
                    items : 
                    [
                        {
                            label: 'Centre Principal',
                            // icon: 'pi pi-fw pi-tags',
                            to: '/pedagogie/repartition-sujets-cp'
                        },
                        {
                            label: 'Centre Secondaire',
                            // icon: 'pi pi-fw pi-tags',
                            to: '/pedagogie/repartition-sujets-cs'
                        }
                        // {
                        //     label: 'Université',
                        //     // icon: 'pi pi-fw pi-tags',
                        //     to: '/editions-systeme/structures/universite'
                        // },
                    ]
                },
                {
                    label: 'Feuilles',
                    icon: 'pi pi-fw pi-database',
                    items : 
                    [
                        {
                            label: 'Centre Principal',
                            // icon: 'pi pi-fw pi-tags',
                            to: '/pedagogie/decompte-feuilles-cp'
                        },
                        {
                            label: 'Centre Secondaire',
                            // icon: 'pi pi-fw pi-tags',
                            to: '/pedagogie/decompte-feuilles-cs'
                        }
                        // {
                        //     label: 'Université',
                        //     // icon: 'pi pi-fw pi-tags',
                        //     to: '/editions-systeme/structures/universite'
                        // },
                    ]
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
