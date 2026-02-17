'use client';

import React, { forwardRef, useImperativeHandle, useContext, useRef } from 'react';

import Link from 'next/link';
import AppBreadCrumb from './AppBreadCrumb';
import { LayoutContext } from './context/layoutcontext';
import AppSidebar from './AppSidebar';
import { StyleClass } from 'primereact/styleclass';
import { Ripple } from 'primereact/ripple';
import { authService } from '@/demo/service/AuthService';
import router from 'next/router';
import { UserContext } from '@/app/userContext';
import { Button } from 'primereact/button';
import './styles.css'; 
import NotificationBell from '@/app/(main)/notifBell';
import ProtectedRoute from './ProtectedRoute';

const AppTopbar = forwardRef((props: { sidebarRef: React.RefObject<HTMLDivElement> }, ref) => {
    const btnRef1 = useRef(null);
    const btnRef2 = useRef(null);
    const menubuttonRef = useRef(null);
    const { user } = useContext(UserContext);

     const getInitial = (text: string) => {
        if (!text) return '';
        return text.charAt(0).toUpperCase(); // Prend la première lettre et la met en majuscule
    };


    const { onMenuToggle, toggleSearch, showRightSidebar, layoutConfig } = useContext(LayoutContext);

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current
    }));

    const logout = async () => {
        authService.logout();
        
    };

    return (
        <div className="layout-topbar">
            <div className="topbar-left">
                <button ref={menubuttonRef} type="button" className="menu-button p-link" onClick={onMenuToggle}>
                    <i className="pi pi-chevron-left"></i>
                </button>

                <Link href="/" className="horizontal-logo">
                    <img id="logo-horizontal" src={`/layout/images/logo-${layoutConfig.menuTheme === 'white' || layoutConfig.menuTheme === 'orange' ? 'dark' : 'white'}.svg`} alt="diamond-layout" />
                </Link>

                <span className="topbar-separator"></span>

                <AppBreadCrumb />
                <img id="logo-mobile" className="mobile-logo" src={`/layout/images/logo-${layoutConfig.colorScheme == 'light' ? 'dark' : 'white'}.svg`} alt="diamond-layout" />
            </div>
            <div className="layout-topbar-menu-section">
                <AppSidebar sidebarRef={props.sidebarRef} />
            </div>
            <div className="layout-mask modal-in"></div>

            <div className="topbar-right">
                <ul className="topbar-menu">
                    {/* <li className="search-item">
                        <a type="button" onClick={toggleSearch}>
                            <i className="pi pi-search"></i>
                        </a>
                    </li>  */}

                     {(user?.profil?.name === "SCOLARITE" || user?.profil?.name === "VIGNETTES_COUPONS") && <NotificationBell />}

                    <li className="profile-item static sm:relative">
                        <StyleClass 
                        nodeRef={btnRef2} 
                        selector="@next" 
                        enterClassName="hidden" 
                        enterActiveClassName="scalein" 
                        leaveToClassName="hidden" 
                        leaveActiveClassName="fadeout" 
                        hideOnOutsideClick={true}
                        >
                            <Button
                                tabIndex={1}
                                ref={btnRef2}
                                severity="info"
                                className="p-button-sm p-button-rounded"
                                label={getInitial(user?.acteur?.etablissement?.code || user?.login || 'OB')}
                                style={{ padding: '0.25rem', fontSize: '1.5rem', minWidth: '2.5rem', height: '2.5rem' }}
                            />

                        </StyleClass>
                        <ul className="list-none p-1 m-0 border-round shadow-2 absolute surface-overlay hidden origin-top w-full sm:w-19rem mt-2 right-0 z-5 top-auto">
                            <li>
                                {/* <a className="p-ripple flex p-2 border-round align-items-center hover:surface-hover transition-colors transition-duration-150 cursor-pointer">
                                    <i className="pi pi-user mr-3"></i>
                                    <span className="flex flex-column">
                                        <span className="font-semibold">Profile</span>
                                    </span>
                                    <Ripple />
                                </a> */}
                                {/* <a className="p-ripple flex p-2 border-round align-items-center hover:surface-hover transition-colors transition-duration-150 cursor-pointer">
                                    <i className="pi pi-cog mr-3"></i>
                                    <span className="flex flex-column">
                                        <span className="font-semibold">Settings</span>
                                    </span>
                                    <Ripple />
                                </a>
                                <a className="p-ripple flex p-2 border-round align-items-center hover:surface-hover transition-colors transition-duration-150 cursor-pointer">
                                    <i className="pi pi-calendar mr-3"></i>
                                    <span className="flex flex-column">
                                        <span className="font-semibold">Calendar</span>
                                    </span>
                                    <Ripple />
                                </a>
                                <a className="p-ripple flex p-2 border-round align-items-center hover:surface-hover transition-colors transition-duration-150 cursor-pointer">
                                    <i className="pi pi-inbox mr-3"></i>
                                    <span className="flex flex-column">
                                        <span className="font-semibold">Inbox</span>
                                    </span>
                                    <Ripple />
                                </a> */}
                                <a onClick={logout} className="p-ripple flex p-2 border-round align-items-center hover:surface-hover transition-colors transition-duration-150 cursor-pointer">
                                    <i className="pi pi-file-pdf mr-3"></i>
                                    <span className="flex flex-column">
                                        <span className="font-semibold">Télécharger le guide d&apos;utilisateur</span>
                                    </span>
                                    <Ripple />
                                </a>
                                {/* <a onClick={logout} className="p-ripple flex p-2 border-round align-items-center hover:surface-hover transition-colors transition-duration-150 cursor-pointer">
                                    <i className="pi pi-comments mr-3"></i>
                                    <span className="flex flex-column">
                                        <span className="font-semibold">Avis et commentaires</span>
                                    </span>
                                    <Ripple />
                                </a> */}
                                <a onClick={logout} className="p-ripple flex p-2 border-round align-items-center hover:surface-hover transition-colors transition-duration-150 cursor-pointer">
                                    <i className="pi pi-power-off mr-3"></i>
                                    <span className="flex flex-column">
                                        <span className="font-semibold">Se déconnecter</span>
                                    </span>
                                    <Ripple />
                                </a>
                            </li>
                        </ul>
                    </li>

                    {/* <li className="right-sidebar-item">
                        <a onClick={showRightSidebar}>
                            <i className="pi pi-align-right"></i>
                        </a>
                    </li> */}
                </ul>
            </div>
        </div>
    );
});

export default AppTopbar;

AppTopbar.displayName = 'AppTopbar';
