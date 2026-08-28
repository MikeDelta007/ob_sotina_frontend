import { MenuModal } from '@/types/layout';
import AppSubMenu from './AppSubMenu';
import { useContext } from 'react';
import { UserContext } from '@/app/userContext';
import "primeicons/primeicons.css";

type Role = 'ADMIN' | 'PLANIFICATION' | 'PEDAGOGIE'
    | 'CHEF_SERVICE' | 'CSA' | 'DIRECTEUR' | 'CHEF_COMPTABLE' | 'AGENT_COMPTABLE';

const ROLES: Role[] = ['ADMIN', 'PLANIFICATION', 'PEDAGOGIE',
    'CHEF_SERVICE', 'CSA', 'DIRECTEUR', 'CHEF_COMPTABLE', 'AGENT_COMPTABLE'];

const AppMenu = () => {

    const { user } = useContext(UserContext);

    const isRole = (value: string): value is Role => {
        return (ROLES as string[]).includes(value);
    };

    const hasAccess = (roles: Role[]): boolean => {
        const roleName = user?.profil?.name;
        return !!roleName && isRole(roleName) && roles.includes(roleName);
    };

    const model: MenuModal[] = [];

    // =========================
    // TABLEAU DE BORD
    // =========================
    if (hasAccess(['ADMIN'])) {

        model.push({
            icon: 'pi pi-home',
            items: [
                {
                    label: 'Relevé Statistique',
                    icon: 'pi pi-fw pi-home',
                    to: '/tableau-de-bord'
                },
                {
                    label: 'Gestion comptabilité',
                    icon: 'pi pi-fw pi-wallet',
                    to: '/caisse-avance'
                }
            ]
        });

        model.push({ separator: true });
    }

    // =========================
    // ADMINISTRATION
    // =========================
    if (hasAccess(['ADMIN'])) {

        model.push({
            label: 'ADMINISTRATION',
            icon: 'pi pi-cog',
            items: [
                {
                    label: 'Acces',
                    icon: 'pi pi-fw pi-users',
                    to: '/editions-systeme/acces',
                },
                {
                    label: 'Données BAC',
                    icon: 'pi pi-fw pi-database',
                    to: '/pedagogie/gestion-donnees',
                },
                {
                    label: 'Programmation BAC',
                    icon: 'pi pi-fw pi-calendar',
                    to: '/pedagogie/programmation-calendrier',
                },
                {
                    label: 'Données CGS',
                    icon: 'pi pi-fw pi-database',
                    to: '/pedagogie-cgs/gestion-donnees',
                },
                {
                    label: 'Programmation CGS',
                    icon: 'pi pi-fw pi-calendar',
                    to: '/pedagogie-cgs/programmation-calendrier',
                }
            ]
        });

        model.push({ separator: true });
    }

    // =========================
    // PEDAGOGIE
    // =========================
    if (hasAccess(['ADMIN', 'PEDAGOGIE'])) {

        model.push({
            label: 'ESPACE PEDAGOGIE',
            icon: 'pi pi-book',
            items: [
                {
                    label: 'Répartition Tirage BAC',
                    icon: 'pi pi-fw pi-sitemap',
                    to: '/pedagogie/repartition-tirage-sujets',
                },
                {
                    label: 'Répartition Tirage CGS',
                    icon: 'pi pi-fw pi-sitemap',
                    to: '/pedagogie-cgs/repartition-tirage-sujets',
                }
            ]
        });

        model.push({ separator: true });
    }

    // =========================
    // PLANIFICATION
    // =========================
    if (hasAccess(['ADMIN', 'PLANIFICATION'])) {

        model.push({
            label: 'ESPACE PLANIFICATION',
            icon: 'pi pi-calendar',
            items: [
                {
                    label: 'Répartition Feuille BAC',
                    icon: 'pi pi-fw pi-copy',
                    to: '/pedagogie/repartition-feuille'
                }

                // {
                //     label: 'Répartition Feuille CGS',
                //     icon: 'pi pi-fw pi-copy',
                //     to: '/pedagogie-cgs/repartition-feuille'
                // }
            ]
        });
    }

    if (hasAccess(['ADMIN'])) {

        model.push({
            label: 'ESPACE BOTTINS',
            icon: 'pi pi-calendar',
            items: [
                {
                    label: 'Bottins',
                    icon: 'pi pi-fw pi-copy',
                    to: '/bottins'
                }
            ]
        });

        model.push({ separator: true });
    }

    // =========================
    // GESTION COMPTABILITÉ (accès comptable, en plus de l'accès ADMIN ci-dessus)
    // =========================
    if (hasAccess(['CHEF_COMPTABLE', 'AGENT_COMPTABLE'])) {

        model.push({
            icon: 'pi pi-wallet',
            items: [
                {
                    label: 'Gestion comptabilité',
                    icon: 'pi pi-fw pi-wallet',
                    to: '/caisse-avance'
                }
            ]
        });

        model.push({ separator: true });
    }

    // =========================
    // EXPRESSION DE BESOIN
    // =========================
    if (hasAccess(['CHEF_SERVICE', 'CSA', 'DIRECTEUR', 'CHEF_COMPTABLE', 'AGENT_COMPTABLE', 'ADMIN'])) {

        model.push({
            label: 'EXPRESSION DE BESOIN',
            icon: 'pi pi-file-edit',
            items: [
                {
                    label: 'Expressions de besoin',
                    icon: 'pi pi-fw pi-file-edit',
                    to: '/expression-besoin'
                }
            ]
        });
    }

    // =========================
    // SUPPRIMER LE DERNIER SEPARATEUR
    // =========================
    if (
        model.length > 0 &&
        model[model.length - 1]?.separator
    ) {
        model.pop();
    }

    return (
        <AppSubMenu model={model} />
    );
};

export default AppMenu;