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
import { classNames } from 'primereact/utils';

const ChangedPassword = () => {
    const router = useRouter();
    const toast = useRef<any>(null);

    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [showPassword3, setShowPassword3] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState('');
    const [strength, setStrength] = useState(0);
    const [isPasswordMatch, setIsPasswordMatch] = useState(true); // Vérifier la correspondance des mots de passe

    const { user } = useContext(UserContext);


    const handlePasswordChange = (e) => {
        formik.handleChange(e);
        const value = e.target.value;
        setPasswordStrength(checkPasswordStrength(value));
    };

    const handlePasswordChange2 = (e) => {
        formik.handleChange(e);
        const value = e.target.value;
        setPasswordStrength(checkPasswordStrength(value));
    };

    // Fonction de contrôle de complexité
    const checkPasswordStrength = (password) => {
        if (!password) return '';
        const strongRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        const mediumRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{6,}$/;

        if (strongRegex.test(password)) return 'fort';
        if (mediumRegex.test(password)) return 'moyen';
        return 'faible';
    };

    

    const formik = useFormik({
        initialValues: {
            usr_password: '',
            new_password: '',
            conf_password: ''
        },
        validationSchema: Yup.object({
            usr_password: Yup.string().required('Champ obligatoire'),
            new_password: Yup.string()
                .required('Champ obligatoire')
                .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
                .matches(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
                .matches(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
                .matches(/\d/, 'Le mot de passe doit contenir au moins un chiffre')
                .matches(/[!@#$%^&*(),.?":{}|<>_¨`'-;]/, 'Le mot de passe doit contenir au moins un caractère spécial'),
            conf_password: Yup.string()
                .required('Champ obligatoire')
                .oneOf([Yup.ref('new_password'), null], 'Les mots de passe ne correspondent pas')
        }),
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            const changedPasswordDTO = {
                usr_password: values.usr_password,
                new_password: values.new_password
            };

            try {
                // Remplace cette partie avec ta logique API
                console.log('Mot de passe changé :', changedPasswordDTO);
                console.log('User :', user?.id);
                const response = await ParametrageService.changedPassword(user?.id, changedPasswordDTO);
                console.log(response);
                if (response === "Le mot de passe a été mis à jour avec succés.")
                {
                    toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Mot de passe changé avec succès', life: 4000 });
                    resetForm();
                    authService.logout();
                }
                if (response === "Le mot de passe d’origine est incorrect.")
                {
                    toast.current.show({ severity: 'warn', summary: 'Erreur de mot de passe', detail: 'Le mot de passe d\'origine est incorrect.', life: 4000 });
                }
                
            } 
            catch (error) 
            {
                console.error('Erreur lors du changement de mot de passe:', error);
                toast.current.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors du changement de mot de passe', life: 4000 });
            } finally {
                setSubmitting(false);
            }
        }
    });

    return (
        <ProtectedRoute allowedRoles={['ADMIN', 'PEDAGOGIE', 'PLANIFICATION', 'CHEF_SERVICE', 'CSA', 'DIRECTEUR', 'CHEF_COMPTABLE', 'AGENT_COMPTABLE']}>
            <form onSubmit={formik.handleSubmit} className="p-4">
                <Toast ref={toast} />
                <div className="flex h-screen bg-white">
                    <div className="w-8 hidden lg:flex flex-column justify-content-between align-items-center px-6"></div>

                    <div className="w-8 h-full text-center py-3 flex flex-column">
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

                        <div className="flex flex-column align-items-center gap-4">
                            <div className="mt-3">
                                <h3>Changement de mot de passe</h3>
                                {/* <p>Veuillez changer obligatoirement l&apos;ancien mot de passe</p> */}
                            </div>

                            <div className="flex flex-column gap-2">
                                <span className="p-input-icon-right w-full relative">
                                    {/* Icône cadenas à gauche */}
                                    <i
                                        className="pi pi-lock"
                                        style={{
                                            position: 'absolute',
                                            left: '10px',
                                            top: '20px',
                                            transform: 'translateY(-50%)',
                                            color: 'black'
                                        }}
                                    />

                                    {/* Icône œil à droite */}
                                    <i
                                        className={classNames('pi cursor-pointer', {
                                            'pi-eye': !showPassword,
                                            'pi-eye-slash': showPassword
                                        })}
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '20px',
                                            transform: 'translateY(-50%)',
                                            color: 'black'
                                        }}
                                        onClick={() => setShowPassword(!showPassword)}
                                    />

                                    {/* Champ de saisie */}
                                    <InputText
                                        id="usr_password"
                                        autoComplete='off'
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Saisir le mot de passe reçu"
                                        value={formik.values.usr_password}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                                        className={`p-inputtext-sm w-full ${formik.touched.usr_password && formik.errors.usr_password ? 'p-invalid' : ''}`}
                                    />
                                </span>

                                {/* Message d’erreur */}
                                {formik.touched.usr_password && formik.errors.usr_password && (
                                    <small className="p-error">{formik.errors.usr_password}</small>
                                )}

                                
                                <span className="p-input-icon-right w-full relative">
                                    {/* Icône cadenas à gauche */}
                                    <i
                                        className="pi pi-lock"
                                        style={{
                                            position: 'absolute',
                                            left: '10px',
                                            top: '20px',
                                            transform: 'translateY(-50%)',
                                            color: 'black'
                                        }}
                                    />

                                    {/* Icône œil à droite */}
                                    <i
                                        className={classNames('pi cursor-pointer', {
                                            'pi-eye': !showPassword2,
                                            'pi-eye-slash': showPassword2
                                        })}
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '20px',
                                            transform: 'translateY(-50%)',
                                            color: 'black'
                                        }}
                                        onClick={() => setShowPassword2(!showPassword2)}
                                    />

                                    {/* Champ de saisie */}
                                    <InputText
                                        id="new_password"
                                        autoComplete='off'
                                        type={showPassword2 ? 'text' : 'password'}
                                        placeholder="Fournir un nouveau mot de passe"
                                        value={formik.values.new_password}
                                        onChange={handlePasswordChange2}
                                        onBlur={formik.handleBlur}
                                        style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                                        className={`p-inputtext-sm w-full ${formik.touched.new_password && formik.errors.new_password ? 'p-invalid' : ''}`}
                                    />
                                </span>

                                {/* Message d’erreur */}
                                {formik.touched.new_password && formik.errors.new_password && (
                                    <small className="p-error">{formik.errors.new_password}</small>
                                )}

                                {/* Indicateur de force du mot de passe */}
                                {formik.values.new_password && !formik.errors.new_password && (
                                    <small
                                        className={`block mt-2 px-3 py-1 rounded-md text-sm font-semibold shadow-sm text-center
                                            ${
                                                passwordStrength === 'fort'
                                                    ? 'bg-green-600 text-white'
                                                    : passwordStrength === 'moyen'
                                                    ? 'bg-yellow-500 text-black'
                                                    : 'bg-red-500 text-white'
                                            }`}
                                    >
                                        Niveau du mot de passe : <b>{passwordStrength}</b>
                                    </small>



                                )}

                                

                                <span className="p-input-icon-left w-full relative">
                                    {/* Icône cadenas à gauche */}
                                    <i
                                        className="pi pi-lock"
                                        style={{
                                            position: 'absolute',
                                            left: '10px',
                                            top: '20px',
                                            transform: 'translateY(-50%)',
                                            color: 'black'
                                        }}
                                    />

                                    {/* Icône œil à droite */}
                                    <i
                                        className={classNames('pi cursor-pointer', {
                                            'pi-eye': !showPassword3,
                                            'pi-eye-slash': showPassword3
                                        })}
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '20px',
                                            transform: 'translateY(-50%)',
                                            color: 'black'
                                        }}
                                        onClick={() => setShowPassword3(!showPassword3)}
                                    />
                                     <InputText
                                        id="conf_password"
                                        type={showPassword3 ? 'text' : 'password'}
                                        placeholder="Confirmer le nouveau mot de passe"
                                        value={formik.values.conf_password}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                                        className={`p-inputtext-sm w-full ${formik.touched.conf_password && formik.errors.conf_password ? 'p-invalid' : ''}`}
                                    />
                                    {formik.touched.conf_password && formik.errors.conf_password && (
                                        <small className="p-error">{formik.errors.conf_password}</small>
                                    )}
                                </span>

                                {/* Affichage du message de confirmation */}
                                {!isPasswordMatch && (
                                    <span className="text-red-500 text-sm mt-1">Les mots de passe ne correspondent pas</span>
                                )}
                                <br />

                                <div className="flex flex-wrap gap-2 justify-content-between">
                                    <Button label="Enregistrer le nouveau mot de passe" className="flex-auto justify-content-center" type="submit" />
                                </div>
                                <br />
                                <p className="font-bold text-black">
                                <span className="footer-copyright">&#169; Office du Baccalauréat. Tous droits réservés</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="w-8 hidden lg:flex flex-column justify-content-between align-items-center px-6 py-6"></div>
                    
                    
                </div>
                 
            </form>

           
        </ProtectedRoute>
    );
};

export default ChangedPassword;
