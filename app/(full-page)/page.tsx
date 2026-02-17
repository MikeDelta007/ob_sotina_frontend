'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { authService } from '@/demo/service/AuthService';
import { userService } from '@/demo/service/UserService';
import Link from 'next/link';
import { classNames } from 'primereact/utils';

const Login: React.FC = () => {
    const [credentials, setCredentials] = useState({ login: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ login?: string; password?: string }>({});
    const router = useRouter();
    const toast = useRef<any>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });

        // Nettoyage de l’erreur quand l’utilisateur saisit
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const login = async (e: React.FormEvent) => {
        e.preventDefault();

        let newErrors: { login?: string; password?: string } = {};

        if (!credentials.login) newErrors.login = 'Le login est obligatoire';
        if (!credentials.password) newErrors.password = 'Le mot de passe est obligatoire';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const response = await authService.login(credentials);
            if (response.user.state_account) {
                toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Connexion réussie', life: 4000 });
                console.log('Login successful', response.user);
                userService.setUser(response.user);
                if (response.user.first_connexion) {
                    window.location.replace('/changement-mot-de-passe');
                    toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Veuillez changer votre mot de passe', life: 4000 });
                } else {
                    if (response.token) 
                        {
                        localStorage.setItem('token', response.token);
                        if (response.user.profil.name === 'SCOLARITE') {
                            // console.log('IF-SCO');
                            window.location.replace('/tableau-de-bord');
                        }
                        if (response.user.profil.name === 'VIGNETTES_COUPONS') {
                            // console.log('IF-VC');
                            window.location.replace('/scolarite/vignettes-coupons');
                        }
                        if (response.user.profil.name === 'AUTORISATION_RECEPTION') {
                            // console.log('IF-AR');
                            window.location.replace('/scolarite/autorisation-reception');
                        }
                        if (response.user.profil.name === 'RECEPTIONNISTE') {
                            // console.log('IF-SCO');
                            window.location.replace('/scolarite/reception-candidats');
                        }
                        if (response.user.profil.name === 'ADMIN') {
                            // console.log('IF-ADM');
                            window.location.replace('/pedagogie/gestion-donnees');
                        }
                        if (response.user.profil.name === 'AGENT_DE_SAISIE' || response.user.profil.name === 'CHEF_ETABLISSEMENT') {
                            // console.log('IF-SCO');
                            window.location.replace('/scolarite/enrolement-candidat');
                        }
                    } else {
                        window.location.replace('/');
                    }
                }
            } else {
                toast.current.show({ severity: 'warn', summary: 'Office du Bac', detail: 'Compte désactivé veuillez contacter OB', life: 4000 });
                console.warn('Account locked', response.user);
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Office du Bac', detail: 'Erreur de connexion', life: 3000 });
            console.error('Login failed', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Toast ref={toast} />
            <div className="flex flex-column relative justify-content-center align-items-center min-h-screen w-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/log1.jpg')" }}>
                <div className="absolute w-full text-center" style={{ top: '10px', left: '50%', transform: 'translateX(-50%)' }}>
                    {/* <h1 className="font-bold text-white">SYSTEME ORGANISATIONNL DE TRACABILITE ET D&apos;INTEGRATION DES INTRANTS DU BACCALAUREAT SENEGALAIS</h1> */}
                </div>
                {/* Card centrée */}
                <div
                    className="p-5 border-round-xl shadow-3"
                    style={{
                        width: '400px',
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        color: 'white'
                    }}
                >
                    {/* Logo centré */}
                    <div className="flex justify-content-center mb-3">
                        <img
                            src={`/layout/images/logo-UCAD.png`}
                            alt="logo-ucad"
                            style={{
                                width: '100px',
                                height: '100px',
                                backgroundColor: 'white',
                                padding: '4px',
                                borderRadius: '50%',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                            }}
                        />
                    </div>

                    <div className="flex flex-column justify-content-center mb-3">
                        <h2 className="text-white text-center mb-2">Connexion à SOTINA</h2>
                        <p className="text-sm text-white text-center mb-4">Veuillez fournir votre login et votre mot de passe</p>
                    </div>

                    <div className="py-2">
                        <InputText autoComplete='off' name="login" placeholder="Login" value={credentials.login} onChange={handleChange} className={classNames('w-full', { 'p-invalid': errors.login })} />
                        {errors.login && <small className="p-error">{errors.login}</small>}
                    </div>

                    <div className="py-2">
                        <span className="p-input-icon-right w-full">
                            <i
                                className={classNames('pi', {
                                    'pi-eye': !showPassword,
                                    'pi-eye-slash': showPassword
                                })}
                                style={{ cursor: 'pointer' }}
                                onClick={() => setShowPassword(!showPassword)}
                            />
                            <InputText autoComplete='off' name="password" type={showPassword ? 'text' : 'password'} placeholder="Mot de passe" value={credentials.password} onChange={handleChange} className={classNames('w-full', { 'p-invalid': errors.password })} />
                        </span>
                        {errors.password && <small className="p-error">{errors.password}</small>}
                    </div>

                    <div className="text-left py-2">
                        <Link href="/mot-de-passe-oublie" className="text-white font-bold text-sm hover:underline">
                            Mot de passe oublié ?
                        </Link>
                    </div>

                    <div className="py-3">
                        <Button label="Connexion" className="w-full text-xl font-bold" onClick={login} loading={loading} />
                    </div>

                    <div className="absolute w-full text-center" style={{ bottom: '2rem', left: '50%', transform: 'translateX(-50%)' }}>
                        <p className="font-bold text-white">
                            <span className="footer-copyright">&#169; Office du Baccalauréat. Tous droits réservés</span>
                        </p>
                        <div className="font-bold text-white flex justify-content-center gap-5">
                            {/* <Link href="/#" className="text-white font-bold text-sm hover:underline">
                                <span className="footer-copyright">Conditions d'utilisation</span>
                            </Link>
                            <Link href="/#" className="text-white font-bold text-sm hover:underline">
                                <span className="footer-copyright">Confidentialité</span>
                            </Link>
                            <Link href="/#" className="text-white font-bold text-sm hover:underline">
                                <span className="footer-copyright">Support</span>
                            </Link> */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;