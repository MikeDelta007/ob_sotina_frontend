import React from 'react';
import { UserProvider } from '@/app/userContext'; // Assurez-vous que le chemin d'import est correct
import AppConfig from '../../layout/AppConfig';
import './style.css';

interface FullPageLayoutProps {
    children: React.ReactNode;
}

export default function FullPageLayout({ children }: FullPageLayoutProps) {
    return (
        <React.Fragment>
            <AppConfig/>
            <UserProvider>
                {children}
            </UserProvider>
        </React.Fragment>
    );
}
