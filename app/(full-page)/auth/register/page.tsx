'use client';

import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { useRouter } from 'next/navigation';
import { Checkbox } from 'primereact/checkbox';
import { Page } from '@/types/layout';

const Register: Page = () => {
    const [confirmed, setConfirmed] = useState(false);
    const router = useRouter();

    return (
        <>
            <div className="flex h-screen">
                <div className="w-full lg:w-4 h-full text-center px-6 py-6 flex flex-column justify-content-between">
                    <img src={`/layout/images/logo-dark.svg`} className="h-4rem mt-4" alt="diamond-layout" />

                    <div className="flex flex-column align-items-center gap-4">
                        <div className="mb-3">
                            <h2>Register</h2>
                            <p>Let&lsquo;s get started</p>
                        </div>

                        <div className="flex flex-column gap-4">
                            <span className="p-input-icon-left w-full">
                                <i className="pi pi-user"></i>
                                <InputText id="username" type="text" className="w-full md:w-25rem" placeholder="Username" />
                            </span>
                            <span className="p-input-icon-left w-full">
                                <i className="pi pi-envelope"></i>
                                <InputText id="email" type="text" className="w-full md:w-25rem" placeholder="Email" />
                            </span>
                            <span className="p-input-icon-left w-full">
                                <i className="pi pi-lock z-2"></i>
                                <Password id="password" type="password" className="w-full" inputClassName="w-full md:w-25rem" inputStyle={{ paddingLeft: '2.5rem' }} placeholder="Password" toggleMask />
                            </span>
                            <div className="flex flex-wrap">
                                <Checkbox name="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.checked)} className="mr-2"></Checkbox>

                                <label htmlFor="checkbox" className="text-900 font-medium mr-2">
                                    I have read the
                                </label>
                                <a className="text-color-secondary font-semibold cursor-pointerhover:text-primary cursor-pointer">Terms and Conditions</a>
                            </div>
                            <Button label="SIGN UP" className="w-full mb-4" onClick={() => router.push('/')}></Button>
                            <span className="font-semibold text-color-secondary">
                                Already have an account? <a className="font-semibold cursor-pointer primary-color">Login</a>
                            </span>
                        </div>
                    </div>

                    <p className="text-color-secondary font-semibold">
                        A problem? <a className="text-primary hover:underline cursor-pointer font-medium">Click here</a> and let us help you.
                    </p>
                </div>
                <div className="w-8 hidden lg:flex flex-column justify-content-between align-items-center px-6 py-6 bg-cover bg-norepeat" style={{ backgroundImage: "url('/demo/images/auth/bg-login.jpg')" }}>
                    <div className="mt-auto mb-auto">
                        <span className="block text-white text-7xl font-semibold">
                            Create a<br />
                            Diamond
                            <br />
                            Account
                        </span>
                        <span className="block text-white text-3xl mt-4">
                            Lorem ipsum dolor sit amet, consectetur
                            <br /> adipiscing elit. Donec posuere velit nec enim
                            <br /> sodales, nec placerat erat tincidunt.{' '}
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Register;
