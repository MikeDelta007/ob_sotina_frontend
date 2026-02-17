'use client';

import { usePathname } from 'next/navigation';
import { ObjectUtils } from 'primereact/utils';
import React, { useContext, useEffect, useState } from 'react';
import { LayoutContext } from './context/layoutcontext';
import { Breadcrumb } from '@/types/layout';
import { UserContext } from '@/app/userContext';

const AppBreadcrumb = () => {
    const { user } = useContext(UserContext);
    const pathname = usePathname();
    const [breadcrumb, setBreadcrumb] = useState<Breadcrumb | null>(null);
    const { breadcrumbs } = useContext(LayoutContext);

    useEffect(() => {
        const filteredBreadcrumbs = breadcrumbs?.find((crumb) => {
            const lastPathSegment = crumb.to.split('/').pop();
            const lastRouterSegment = pathname.split('/').pop();

            if (lastRouterSegment?.startsWith('[') && !isNaN(Number(lastPathSegment))) {
                return pathname.split('/').slice(0, -1).join('/') === crumb.to?.split('/').slice(0, -1).join('/');
            }
            return crumb.to === pathname;
        });

        setBreadcrumb(filteredBreadcrumbs);
    }, [pathname, breadcrumbs]);

    return (
        <nav className="layout-breadcrumb">

            <span style={{fontWeight: "bold", color: "black", fontSize: "14px"}}>
                Bienvenue sur SOTINA </span>
                <span style={{color: "darkgreen", fontWeight: "bold", fontSize: "14px"}}>
                    {user?.acteur?.etablissement?.name}
                </span>
                <br />                         
                <span style={{color: "blue", fontWeight: "bold", fontSize: "12px"}}>
                    {user?.acteur?.etablissement?.inspectionAcademie?.name}
                </span> 
        </nav>
    );
};

export default AppBreadcrumb;
