import { MenuModal } from '@/types/layout';
import AppSubMenu from './AppSubMenu';
import { useContext } from 'react';
import { UserContext } from '@/app/userContext';
import { useNotificationCounts } from './useNotificationCounts';
import "primeicons/primeicons.css";

type Role = 'ADMIN' | 'PLANIFICATION' | 'PEDAGOGIE'
    | 'CHEF_SERVICE' | 'CSA' | 'DIRECTEUR' | 'CHEF_COMPTABLE' | 'AGENT_COMPTABLE' | 'AGENT';

const ROLES: Role[] = ['ADMIN', 'PLANIFICATION', 'PEDAGOGIE',
    'CHEF_SERVICE', 'CSA', 'DIRECTEUR', 'CHEF_COMPTABLE', 'AGENT_COMPTABLE', 'AGENT'];

const AppMenu = () => {

    const { user } = useContext(UserContext);
    const notificationCounts = useNotificationCounts(!!user);

    const isRole = (value: string): value is Role => {
        return (ROLES as string[]).includes(value);
    };

    const hasAccess = (roles: Role[]): boolean => {
        const roleName = user?.profil?.name;
        return !!roleName && isRole(roleName) && roles.includes(roleName);
    };

    const model: MenuModal[] = [];

    const progBacLectureSeule = {
        label: 'Programmation BAC',
        icon: 'pi pi-fw pi-calendar',
        to: '/pedagogie/programmation-calendrier'
    };

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
                    label: 'Banques',
                    icon: 'pi pi-fw pi-building',
                    to: '/personnel/banques',
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
                },
                // Consultation seule (l'ADMIN l'a déjà, modifiable, dans ADMINISTRATION)
                ...(hasAccess(['PEDAGOGIE']) ? [progBacLectureSeule] : [])
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
                },
                // Consultation seule (l'ADMIN l'a déjà, modifiable, dans ADMINISTRATION)
                ...(hasAccess(['PLANIFICATION']) ? [progBacLectureSeule] : [])

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
    // GESTION COMPTABILITÉ (accès comptable, + lecture seule CSA/Directeur, en plus de l'accès ADMIN ci-dessus)
    // =========================
    if (hasAccess(['CHEF_COMPTABLE', 'AGENT_COMPTABLE', 'CSA', 'DIRECTEUR'])) {

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
    if (hasAccess(['AGENT', 'CHEF_SERVICE', 'CSA', 'DIRECTEUR', 'CHEF_COMPTABLE', 'AGENT_COMPTABLE', 'ADMIN'])) {

        model.push({
            label: 'EXPRESSION DE BESOIN',
            icon: 'pi pi-file-edit',
            items: [
                {
                    label: 'Expressions de besoin',
                    icon: 'pi pi-fw pi-file-edit',
                    to: '/expression-besoin',
                    badge: notificationCounts.expressionBesoin
                }
            ]
        });

        model.push({ separator: true });
    }

    // =========================
    // MON ESPACE (visible à tous les rôles authentifiés, sans garde)
    // =========================
    model.push({
        label: 'MON ESPACE',
        icon: 'pi pi-user',
        items: [
            { label: 'Mon profil', icon: 'pi pi-fw pi-id-card', to: '/personnel/mon-profil' },
            { label: 'Demandes de congés', icon: 'pi pi-fw pi-calendar-plus', to: '/personnel/conges', badge: notificationCounts.conges },
            { label: "Autorisation d'absence", icon: 'pi pi-fw pi-calendar-times', to: '/personnel/absences', badge: notificationCounts.absences },
            { label: 'Mes missions', icon: 'pi pi-fw pi-send', to: '/personnel/missions' }
        ]
    });

    // =========================
    // GESTION PERSONNEL (Divisions, Fonctions, Véhicules, Chauffeurs — un menu par entité)
    // =========================
    if (hasAccess(['ADMIN', 'CSA', 'DIRECTEUR'])) {
        model.push({ separator: true });
        model.push({
            label: 'GESTION PERSONNEL',
            icon: 'pi pi-sitemap',
            items: [
                { label: 'Personnel', icon: 'pi pi-fw pi-users', to: '/personnel/personnels' },
                { label: 'Divisions', icon: 'pi pi-fw pi-sitemap', to: '/personnel/divisions' },
                { label: 'Fonctions', icon: 'pi pi-fw pi-briefcase', to: '/personnel/fonctions' },
                { label: 'Véhicules', icon: 'pi pi-fw pi-car', to: '/personnel/voitures' },
                { label: 'Chauffeurs', icon: 'pi pi-fw pi-id-card', to: '/personnel/chauffeurs' },
                { label: "Motifs d'absence", icon: 'pi pi-fw pi-list', to: '/personnel/motifs-absence' }
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