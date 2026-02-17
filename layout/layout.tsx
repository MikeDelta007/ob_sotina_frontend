'use client';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useContext } from 'react';
import { classNames, DomHandler } from 'primereact/utils';
import { usePathname, useSearchParams } from 'next/navigation';
import { LayoutContext } from './context/layoutcontext';
import { useEventListener, useMountEffect, useResizeListener, useUnmountEffect } from 'primereact/hooks';
import AppTopbar from './AppTopbar';
import AppFooter from './AppFooter';
import AppConfig from './AppConfig';
import AppSearch from './AppSearch';
import AppBreadCrumb from './AppBreadCrumb';
import AppRightMenu from './AppRightMenu';
import { addLocale, locale, PrimeReactContext } from 'primereact/api';
import { Tooltip } from 'primereact/tooltip';
import { ChildContainerProps } from '@/types';
import { UserProvider } from '@/app/userContext';
import ChangedPassword from '@/app/(full-page)/changement-mot-de-passe/page';
import { authService } from '@/demo/service/AuthService';
import useIdleLogout from '@/app/useIdleLogout';
import './styles.css';


const Layout = (props: ChildContainerProps) => {
    const { layoutConfig, layoutState, setLayoutState, isSlim, isCompact, isHorizontal, isDesktop } = useContext(LayoutContext);
    const { setRipple } = useContext(PrimeReactContext);
    const topbarRef = useRef(null);
    const sidebarRef = useRef(null);
    const copyTooltipRef = useRef(null);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [bindMenuOutsideClickListener, unbindMenuOutsideClickListener] = useEventListener({
        type: 'click',
        listener: (event) => {
            const isOutsideClicked = !(sidebarRef.current.isSameNode(event.target) || sidebarRef.current.contains(event.target) || topbarRef.current.menubutton.isSameNode(event.target) || topbarRef.current.menubutton.contains(event.target));

            if (isOutsideClicked) {
                hideMenu();
            }
        }
    });

    // Activer la locale
    locale('fr');

    // Définir les libellés français
    addLocale('fr', {
        firstDayOfWeek: 1,
        dayNames: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
        dayNamesShort: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
        dayNamesMin: ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'],
        monthNames: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
        monthNamesShort: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
        today: "Aujourd'hui",
        clear: 'Effacer',
        weekHeader: 'Sem',
        // Dropdowns / Autocomplete
        emptyFilterMessage: 'Aucun résultat trouvé',
        emptyMessage: 'Aucune option disponible'
    });

    // Activer la locale
    locale('fr');


    
    const [bindDocumentResizeListener, unbindDocumentResizeListener] = useResizeListener({
        listener: () => {
            if (isDesktop() && !DomHandler.isTouchDevice()) {
                hideMenu();
            }
        }
    });

    const hideMenu = useCallback(() => {
        setLayoutState((prevLayoutState) => ({
            ...prevLayoutState,
            overlayMenuActive: false,
            overlaySubmenuActive: false,
            staticMenuMobileActive: false,
            menuHoverActive: false,
            menuClick: false,
            resetMenu: (isSlim() || isCompact() || isHorizontal()) && isDesktop()
        }));
    }, [isSlim, isHorizontal, isDesktop, setLayoutState]);

    const blockBodyScroll = () => {
        if (document.body.classList) {
            document.body.classList.add('blocked-scroll');
        } else {
            document.body.className += ' blocked-scroll';
        }
    };

    const unblockBodyScroll = () => {
        if (document.body.classList) {
            document.body.classList.remove('blocked-scroll');
        } else {
            document.body.className = document.body.className.replace(new RegExp('(^|\\b)' + 'blocked-scroll'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    };
    useMountEffect(() => {
        setRipple(layoutConfig.ripple);
    });

    useEffect(() => {
        if (layoutState.overlayMenuActive || layoutState.staticMenuMobileActive || layoutState.overlaySubmenuActive) {
            bindMenuOutsideClickListener();
        }

        if (layoutState.staticMenuMobileActive) {
            blockBodyScroll();
            (isSlim() || isCompact() || isHorizontal()) && bindDocumentResizeListener();
        }

        return () => {
            unbindMenuOutsideClickListener();
            unbindDocumentResizeListener();
            unblockBodyScroll();
        };
    }, [layoutState.overlayMenuActive, layoutState.staticMenuMobileActive, layoutState.overlaySubmenuActive]);

    useEffect(() => {
        const onRouteChange = () => {
            hideMenu();
        };
        onRouteChange();
    }, [pathname, searchParams]);

    useUnmountEffect(() => {
        unbindMenuOutsideClickListener();
    });

    const pageKey = React.useMemo(
        () => `${pathname}?${searchParams?.toString() ?? ""}`,
    [pathname, searchParams]
    );

    const containerClassName = classNames(
        'layout-wrapper',
        {
            'layout-static': layoutConfig.menuMode === 'static',
            'layout-slim': layoutConfig.menuMode === 'slim',
            'layout-horizontal': layoutConfig.menuMode === 'horizontal',
            'layout-drawer': layoutConfig.menuMode === 'drawer',
            'layout-overlay': layoutConfig.menuMode === 'overlay',
            'layout-compact': layoutConfig.menuMode === 'compact',
            'layout-reveal': layoutConfig.menuMode === 'reveal',
            'layout-sidebar-dim': layoutConfig.colorScheme === 'dim',
            'layout-sidebar-dark': layoutConfig.colorScheme === 'dark',
            'layout-overlay-active': layoutState.overlayMenuActive,
            'layout-mobile-active': layoutState.staticMenuMobileActive,
            'layout-static-inactive': layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
            'p-input-filled': layoutConfig.inputStyle === 'filled',
            'p-ripple-disabled': !layoutConfig.ripple,
            'layout-sidebar-active': layoutState.sidebarActive,
            'layout-sidebar-anchored': layoutState.anchored
        },
        layoutConfig.colorScheme === 'light' ? 'layout-sidebar-' + layoutConfig.menuTheme : ''
    );

    const router = useRouter();
    const isFullPageRoute = ['/', '/unauthorized'].includes(pathname);

    if (isFullPageRoute)
    {
        return <>{props.children}</>; // Pas de layout pour ces routes
    }

    useEffect(() => {
        const token = localStorage.getItem('token');  // Remplace par ta vraie logique d'authentification

        if (!token) 
        {
            router.push('/');  // Redirection vers la page de connexion
        }
        
    }, []);

    const logout = () => authService.logout();

    useIdleLogout(logout, 5 * 60 * 1000);

    return (
        <UserProvider>
        
        <div className={containerClassName} data-theme={layoutConfig.colorScheme}>
            <AppConfig/>
            <div className="layout-content-wrapper">
                <AppTopbar ref={topbarRef} sidebarRef={sidebarRef} />
                <div className="layout-content">
                    <AppBreadCrumb />
                    <div key={pageKey}>
                        {props.children}
                    </div>
                </div>
                <AppFooter />
            </div>

            {/* <AppSearch /> */}
            {/* <AppRightMenu></AppRightMenu> */}

            <div className="layout-mask"></div>
        </div>
        </UserProvider>
    );
};

export default Layout;
