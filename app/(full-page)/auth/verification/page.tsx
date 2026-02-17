'use client';

import React, { useState, useContext } from 'react';
import { Button } from 'primereact/button';
import { useRouter } from 'next/navigation';
import type { Page } from '@/types';
import { InputNumber } from 'primereact/inputnumber';

const Verification: Page = () => {
    const [value1, setValue1] = useState<number | null>();
    const [value2, setValue2] = useState<number | null>();
    const [value3, setValue3] = useState<number | null>();
    const [value4, setValue4] = useState<number | null>();
    const router = useRouter();

    const onDigitInput = (event: React.KeyboardEvent<HTMLSpanElement>, currentInputId: number) => {
        const isDigit = event.code.includes('Numpad') || event.code.includes('Digit');
        const isBackspace = event.code === 'Backspace';
        let nextInputId: number | null = null;

        if (isDigit) {
            nextInputId = currentInputId + 1;
        } else if (isBackspace) {
            nextInputId = currentInputId - 1;
        }

        const element = nextInputId !== null ? document.getElementById('val' + nextInputId) : null;

        if (element) {
            element.focus();
        }
    };

    return (
        <>
            <div className="flex h-screen">
                <div className="w-full lg:w-4 h-full text-center px-6 py-6 flex flex-column justify-content-between">
                    <img src={`/layout/images/logo-dark.svg`} className="h-4rem mt-4" alt="diamond-layout" />

                    <div className="flex flex-column w-full align-items-center gap-4">
                        <div className="mb-3">
                            <h2>Verification</h2>
                            <p>We have sent code to you email:</p>
                            <div className="flex align-items-center w-full justify-content-center">
                                <i className="pi pi-envelope text-600 mr-2"></i>
                                <span className="text-900 font-bold">dm**@gmail.com</span>
                            </div>
                        </div>

                        <div className="flex flex-column">
                            <div className="flex justify-content-between w-full align-items-center mb-4 gap-3">
                                <InputNumber inputId="val1" value={value1} onValueChange={(e) => setValue1(e.value)} inputClassName="w-3rem text-center" maxLength={1} onKeyUp={(e) => onDigitInput(e, 1)}></InputNumber>
                                <InputNumber inputId="val2" value={value2} onValueChange={(e) => setValue2(e.value)} inputClassName="w-3rem text-center" maxLength={1} onKeyUp={(e) => onDigitInput(e, 2)}></InputNumber>
                                <InputNumber inputId="val3" value={value3} onValueChange={(e) => setValue3(e.value)} inputClassName="w-3rem text-center" maxLength={1} onKeyUp={(e) => onDigitInput(e, 3)}></InputNumber>
                                <InputNumber inputId="val4" value={value4} onValueChange={(e) => setValue4(e.value)} inputClassName="w-3rem text-center" maxLength={1} onKeyUp={(e) => onDigitInput(e, 4)}></InputNumber>
                            </div>

                            <div className="flex flex-wrap gap-2 justify-content-between">
                                <Button outlined className="flex-auto" onClick={() => router.push('/')} label="Cancel" />
                                <Button className="flex-auto" onClick={() => router.push('/')} label="Verify" />
                            </div>
                        </div>
                    </div>

                    <p className="text-color-secondary font-semibold">
                        A problem? <a className="text-primary hover:underline cursor-pointer font-medium">Click here</a> and let us help you.
                    </p>
                </div>
                <div className="w-8 hidden lg:flex flex-column justify-content-between align-items-center px-6 py-6 bg-cover bg-norepeat" style={{ backgroundImage: "url('/demo/images/auth/bg-login.jpg')" }}>
                    <div className="mt-auto mb-auto">
                        <span className="block text-white text-7xl font-semibold">
                            Verify your
                            <br />
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

export default Verification;
