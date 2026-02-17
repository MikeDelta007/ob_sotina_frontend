import { Metadata } from 'next';
import Layout from '../../layout/layout';
import { addLocale, locale } from 'primereact/api';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const metadata: Metadata = {
    title: 'Office du Bac',
    description: 'Office du Baccalauréat',
    robots: { index: false, follow: false },
    viewport: { initialScale: 1, width: 'device-width' },
    openGraph: {
        type: 'website',
        title: 'Office du Bac',
        url: 'https://officedubac.sn/',
        description: 'OB',
        ttl: 604800
    },
    icons: {
        icon: '/favicon.ico'
    }
};


export default function MainLayout({ children }: MainLayoutProps) {
    return <Layout>{children}</Layout>;
}
