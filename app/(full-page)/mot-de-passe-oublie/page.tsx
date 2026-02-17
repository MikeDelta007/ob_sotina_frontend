'use client';

import React, { useContext, useRef, useState } from 'react';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { ParametrageService } from '@/demo/service/ParametrageService';
import { UserContext, UserProvider } from '@/app/userContext';
import { authService } from '@/demo/service/AuthService';
import ProtectedRoute from '@/layout/ProtectedRoute';

const ChangedPassword = () => {
    const router = useRouter();
    const toast = useRef<any>(null);

    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [strength, setStrength] = useState(0);
    const [isPasswordMatch, setIsPasswordMatch] = useState(true); // Vérifier la correspondance des mots de passe

    const { user } = useContext(UserContext);

    const checkPasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/\d/.test(password)) strength += 1;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
        setStrength(strength);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        checkPasswordStrength(e.target.value);
        checkPasswordMatch(e.target.value, repeatPassword);
    };

    const handleRepeatPasswordChange = (e) => {
        setRepeatPassword(e.target.value);
        checkPasswordMatch(password, e.target.value);
    };

    const checkPasswordMatch = (password, repeatPassword) => {
        if (password !== repeatPassword) {
            setIsPasswordMatch(false);
        } else {
            setIsPasswordMatch(true);
        }
    };

    const getStrengthLabel = () => {
        switch (strength) {
            case 4:
                return 'Mot de passe complexe';
            case 3:
                return 'Complexité moyenne';
            case 2:
                return 'Trop simple';
            default:
                return '';
        }
    };

    const getStrengthColor = () => {
        switch (strength) {
            case 4:
                return 'green';
            case 3:
                return 'orange';
            case 2:
                return 'red';
            default:
                return '';
        }
    };

    const formik = useFormik({
        initialValues: {
            email: '',
        },
        validationSchema: Yup.object({
            email: Yup.string()
                            .email('Email invalide')
                            .trim()
                            .required("L'email est obligatoire")
                            .test(
                                'no-leading-space',
                                "L'email ne peut pas commencer par un espace",
                                (value) => value && !value.startsWith(' ')
                            )
                            .test(
                                'no-trailing-space',
                                "L'email ne peut pas se terminer par un espace",
                                (value) => value && !value.endsWith(' ')
                            )
                            .matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Le domaine doit se terminer par au moins 2 caractères"),
        }),
        onSubmit: async (values, { setSubmitting }) => {
            const emailDTO = {
                email: values.email,
            };

            try {
                // Remplace cette partie avec ta logique API
                console.log('Email fourni :', emailDTO);
                const mail = emailDTO.email;
                const response = await authService.password_forgot(mail);
                console.log(response);
                if (response.error)
                {
                    toast.current.show({ severity: 'warn', summary: 'Erreur', detail: 'Cette adresse email n\'est pas reconnue', life: 4000 });
                }
                else
                {
                    toast.current.show({ severity: 'success', summary: 'Succès', detail: 'L\'email de réinitialisation vous a été envoyé avec succés', life: 4000 });
                    window.location.replace('/');
                }
                
            } 
            catch (error) 
            {
                console.error('Erreur:', error);
                toast.current.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur systéme', life: 4000 });
            } finally {
                setSubmitting(false);
            }
        }
    });

    return (
        
            <form onSubmit={formik.handleSubmit} className="p-4">
                <Toast ref={toast} />
                <div className="flex h-screen">
                    <div className="w-8 hidden lg:flex flex-column justify-content-between align-items-center px-6 py-6"></div>

                    <div className="lg:w-4 h-full text-center px-6 py-6 flex flex-column">
                        <img src={`/layout/images/logo-UCAD.png`} style={{
                            width: '125px',
                            maxWidth: '100%',
                            height: 'auto',
                            backgroundColor: 'white',
                            padding: '1px',
                            borderRadius: '50%',
                            display: 'block',
                            margin: '0 auto',
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)'
                        }} alt = "ucad" />

                        <div className="flex flex-column align-items-center gap-2">
                            <div className="mt-5">
                                <h3>Mot de passe oublié</h3>
                                <p>Veuillez fournir l&apos;adresse email associée au compte</p>
                            </div>

                            <div className="flex flex-column gap-4">
                                <span className="p-input-icon-left w-full md:w-25rem">
                                    <i className="pi pi-envelope" 
                                    style={{
                                            position: 'absolute',
                                            left: '10px',
                                            top: '20px',
                                            transform: 'translateY(-50%)',
                                            color: 'black'
                                        }}></i>
                                   
                                    <InputText
                                        id="email"
                                        autoComplete='off'
                                        placeholder="Saisir l'adresse email rattachée au compte'"
                                        style={{ width: '100%', paddingLeft: '2.5rem' }}
                                        value={formik.values.email}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className={`p-inputtext-sm w-full ${formik.touched.email && formik.errors.email ? 'p-invalid' : ''}`}
                                    />
                                    {formik.touched.email && formik.errors.email && (
                                        <small className="p-error">{formik.errors.email}</small>
                                    )}
                                </span>

                                <div className="flex flex-wrap gap-2 justify-content-between">
                                    <Button label="Cliquez pour recevoir les informations" className="flex-auto justify-content-center" type="submit" />
                                </div>
                                <p className="font-bold text-black">
                                <span className="footer-copyright">&#169; Office du Baccalauréat. Tous droits réservés</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="w-8 hidden lg:flex flex-column justify-content-between align-items-center px-6 py-6"></div>
                </div>
            </form>
    );
};

export default ChangedPassword;
