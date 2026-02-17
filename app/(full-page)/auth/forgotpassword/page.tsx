'use client';

import React from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useRouter } from 'next/navigation';
import { Page } from '@/types/layout';

const ForgotPassword: Page = () => {
    const router = useRouter();

    return (
        <div className="flex h-screen justify-center items-center bg-gray-100">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
                {/* Logo cerclé */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                        <img src={`/layout/images/logo-dark.svg`} className="h-12" alt="logo" />
                    </div>
                </div>

                {/* Titre et description */}
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-2">Forgot Password</h2>
                    <p className="text-gray-600">Enter your email to reset your password</p>
                </div>

                {/* Input email */}
                <div className="mb-6">
                    <span className="p-input-icon-left w-full">
                        <i className="pi pi-envelope"></i>
                        <InputText id="email" type="text" className="w-full" placeholder="Email" />
                    </span>
                </div>

                {/* Boutons */}
                <div className="flex gap-3 mb-6">
                    <Button outlined className="flex-auto" onClick={() => router.push('/')} label="CANCEL" />
                    <Button className="flex-auto" onClick={() => router.push('/')} label="SUBMIT" />
                </div>

                {/* Aide */}
                <p className="text-gray-500 text-sm">
                    A problem? <a className="text-blue-600 hover:underline cursor-pointer font-medium">Click here</a> and let us help you.
                </p>
            </div>
    </div>
);

};

export default ForgotPassword;
