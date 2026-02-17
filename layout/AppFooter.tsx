'use client';

import React from 'react';

import { useContext } from 'react';

import { LayoutContext } from './context/layoutcontext';

const AppFooter = () => {
    const { layoutConfig } = useContext(LayoutContext);

    return (
        <div className="layout-footer">
            <div className="footer-logo-container">
                {/* <img src={`/layout/images/logo-${layoutConfig.colorScheme === 'light' ? 'dark' : 'white'}.svg`} alt="diamond-layout" /> */}
                <span className="footer-app-name">Office du Baccalauréat</span>
            </div>
            <span className="footer-copyright">&#169; 2025</span>
        </div>
    );
};

export default AppFooter;
