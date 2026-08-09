import { MenuModal } from '@/types/layout';
import AppSubMenu from './AppSubMenu';
import { useContext } from 'react';
import { UserContext } from '@/app/userContext';
import "primeicons/primeicons.css";

type Role = 'ADMIN' | 'PLANIFICATION' | 'PEDAGOGIE';

const AppMenu = () => {

    const { user } = useContext(UserContext);

    const isRole = (value: string): value is Role => {
        return ['ADMIN', 'PLANIFICATION', 'PEDAGOGIE'].includes(value);
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