'use client';

import Link from 'next/link';
import { useContext, useEffect } from 'react';
import AppMenu from './AppMenu';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import { classNames } from 'primereact/utils';

const AppSidebar = (props: { sidebarRef: React.RefObject<HTMLDivElement> }) => {
    const { setLayoutState, layoutConfig, layoutState } = useContext(LayoutContext);
    const anchor = () => {
        setLayoutState((prevLayoutState) => ({
            ...prevLayoutState,
            anchored: !prevLayoutState.anchored
        }));
    };

    const logoColor = () => {
        let logo: string;

        if (layoutConfig.colorScheme == 'light') {
            logo = layoutConfig.menuTheme === 'white' || layoutConfig.menuTheme === 'orange' ? 'dark' : 'white';
        } else {
            logo = 'dark';
        }
        return logo;
    };

    useEffect(() => {
        return () => {
            resetOverlay();
        };
    }, []);

    const resetOverlay = () => {
        if (layoutState.overlayMenuActive) {
            setLayoutState((prevLayoutState) => ({
                ...prevLayoutState,
                overlayMenuActive: false
            }));
        }
    };

    let timeout = null;

    const onMouseEnter = () => {
        if (!layoutState.anchored) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            setLayoutState((prevLayoutState) => ({
                ...prevLayoutState,
                sidebarActive: true
            }));
        }
    };

    const onMouseLeave = () => {
        if (!layoutState.anchored) {
            if (!timeout) {
                timeout = setTimeout(
                    () =>
                        setLayoutState((prevLayoutState) => ({
                            ...prevLayoutState,
                            sidebarActive: false
                        })),
                    300
                );
            }
        }
    };

    return (
        <>
            <div ref={props.sidebarRef} className="layout-sidebar" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
                <div
                    style={{
                        textAlign: 'center',
                        marginTop: '10px',
                        marginBottom: '0px',
                        padding: '0 1rem'
                    }}
                >
                    <img
                        id="logo-horizontal"
                        src={`/layout/images/logo-UCAD_.png`}
                        alt="logo-ucad"
                        style={{
                            width: '85px',
                            maxWidth: '100%',
                            height: 'auto',
                            backgroundColor: 'white',
                            padding: '1px',
                            borderRadius: '50%',
                            display: 'block',
                            margin: '0 auto',
                            boxShadow: '0 2px 6px rgba(14, 40, 209, 0.15)'
                        }}
                    />

                    <div
                        style={{
                            marginTop: '12px',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            letterSpacing: '1px',
                            color: 'white',
                            textTransform: 'uppercase',
                            marginBottom: '0px'
                        }}
                    >
                        <b>OFFICE DU BACCALAURÉAT</b>
                    </div>
                </div>

                <div className="layout-menu-container"  style={{ marginTop: 0, paddingTop: 0 }}>
                    <MenuProvider>
                        <AppMenu />
                    </MenuProvider>
                </div>
            </div>
        </>
    );
};

export default AppSidebar;
