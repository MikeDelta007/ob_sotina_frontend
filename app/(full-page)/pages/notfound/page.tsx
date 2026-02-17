'use client';

import React from 'react';
import { Button } from 'primereact/button';
import Link from 'next/link';

function NotFound() {
    return (
        <>
            
            <div className="px-5 min-h-screen flex justify-content-center align-items-center bg-cover bg-center" style={{ backgroundImage: 'url(/demo/images/notfound/bg-404.jpg)' }}>
                <div className="z-1 text-center">
                    <div className="text-900 font-bold text-white text-8xl mb-4">La page demandée est indisponible</div>
                    <Link href="/">
                        <Button raised className="font-medium" label="Se connecter" />
                    </Link>
                </div>
            </div>
        </>
    );
}

export default NotFound;
