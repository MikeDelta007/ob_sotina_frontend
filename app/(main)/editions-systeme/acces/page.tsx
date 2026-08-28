'use client';

import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Rating } from 'primereact/rating';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import React, { useContext, useEffect, useRef, useState } from 'react';
import type { Demo } from '@/types';
import { ProductService } from '@/demo/service/ProductService';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { Calendar } from 'primereact/calendar';
import { Carousel } from 'primereact/carousel';
import { ActeurDTO, ParametrageService, ProfilDTO, ProgrammationDTO, SujetDTO, UserDTO } from '@/demo/service/ParametrageService';
import * as Yup from 'yup';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { InputTextarea } from 'primereact/inputtextarea';
import { useFormik } from 'formik';
import { UserContext } from '@/app/userContext';
import { InputMask } from 'primereact/inputmask';
import ProtectedRoute from '@/layout/ProtectedRoute';
import { FileUpload } from 'primereact/fileupload';
import { FiEdit } from 'react-icons/fi';
import { MdLockReset } from 'react-icons/md';
import { TabView, TabPanel } from 'primereact/tabview';
import { classNames } from 'primereact/utils';
import { ProgressSpinner } from 'primereact/progressspinner';

const CalendarDemo = () => {
    const [is_update, setIsUpdate] = useState(false); // <== valeur persistante entre les appels
    var id_acces = useRef(null); // <== même chose pour l'ID du candidat
    const [email, setEmail] = useState('');
    const [id_user, setIdUser] = useState('');
    const [getResultDialog, setGetResultDialog] = useState(false);
    const [resultImport, setResultImport] = useState(false);
    const [is_go_by_smtp, setIsGoBySmtp] = useState(false); // <== valeur persistante entre les appels
    const [groupedUsers, setGroupedUsers] = useState([]);
    const { user } = useContext(UserContext);

    let emptyProduct: Demo.Product = {
        id: null,
        name: '',
        image: null,
        description: '',
        category: null,
        price: 0,
        quantity: 0,
        rating: 0,
        inventoryStatus: 'INSTOCK'
    };

    const [products, setProducts] = useState(null);
    const [productDialog, setProductDialog] = useState(false);
    const [productDialog2, setProductDialog2] = useState(false);
    const [productDialog3, setProductDialog3] = useState(false);
    const [codifDialog, setCodifDialog] = useState(false);
    const [deleteProductDialog, setDeleteProductDialog] = useState(false);
    const [supprimerDialog, setSupprimerDialog] = useState(false);
    const [desactiveAccessDialog, setDesactiveAccessDialog] = useState(false);
    const [deleteProductsDialog, setDeleteProductsDialog] = useState(false);
    const [product, setProduct] = useState(emptyProduct);
    const [selectedProducts, setSelectedProducts] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const [file, setFile] = useState(null);
    const [fileId, setFileId] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);

    const [users, setUsers] = useState([]);

    const [etabs, setEtabs] = useState([]);

    const [infosUsers, setInfosUsers] = useState(null);

    const [errorMessage, setErrorMessage] = useState('');

    const profilsOptions = [
        { label: 'ADMIN', value: 'ADMIN' },
        { label: 'PLANIFICATION', value: 'PLANIFICATION' },
        { label: 'PEDAGOGIE', value: 'PEDAGOGIE' },
        { label: 'Chef de service', value: 'CHEF_SERVICE' },
        { label: 'CSA', value: 'CSA' },
        { label: 'Directeur', value: 'DIRECTEUR' },
        { label: 'Chef comptable', value: 'CHEF_COMPTABLE' },
        { label: 'Agent comptable', value: 'AGENT_COMPTABLE' }
    ];

    useEffect(() => {
        ProductService.getProducts().then((data) => setProducts(data));
    }, []);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        ParametrageService.getEtablissements().then((response) => {
            setEtabs(response);
        });
    }, []);

    useEffect(() => {}, [is_update]);

    useEffect(() => {
        ParametrageService.getInfoUsers().then((response) => {
            setInfosUsers(response);
        });
    }, []);

    const formatCurrency = (value) => {
        return value.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
        });
    };

    const openNew = () => {
        setProduct(emptyProduct);
        setSubmitted(false);
        setProductDialog(true);
        setIsUpdate(false);
        formik.resetForm();
    };

    const hideDialog = () => {
        setSubmitted(false);
        setProductDialog(false);
    };

    const hideDialog2 = () => {
        setSubmitted(false);
        setProductDialog2(false);
        setIsUpdate(false);
        setIsAdmin(false)
    };

    const hideDialog3 = () => {
        setProductDialog3(false);
    };

    const hideDialog4 = () => {
        setCodifDialog(false);
    };

    const hideDeleteProductDialog = () => {
        setDeleteProductDialog(false);
    };

    const hideBatchCreatedDialog = () => {
        setGetResultDialog(false);
        window.location.replace('/editions-systeme/acces');
    };


    const hideDeleteProductDialog_ = () => {
        setSupprimerDialog(false);
    };

    const hideDeleteProductDialog__ = () => {
        setDesactiveAccessDialog(false);
    };

    const hideDeleteProductsDialog = () => {
        setDeleteProductsDialog(false);
    };

    const saveProduct = () => {
        setSubmitted(true);

        if (product.name.trim()) {
            let _products = [...products];
            let _product = { ...product };
            if (product.id) {
                const index = findIndexById(product.id);

                _products[index] = _product;
                toast.current.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Product Updated',
                    life: 3000
                });
            } else {
                _product.id = createId();
                _product.code = createId();
                _product.image = 'product-placeholder.svg';
                _products.push(_product);
                toast.current.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Product Created',
                    life: 3000
                });
            }

            setProducts(_products);
            setProductDialog(false);
            setProduct(emptyProduct);
        }
    };

    const formatProfil = (profil) => {
        if (!profil) return null;
        // Si c’est déjà un objet complet avec un id, on le retourne tel quel
        if (typeof profil === 'object' && profil.id && profil.name) return profil;
        // Sinon on cherche par nom
        return profil.find((p) => p.name === profil) || null;
    };

    const formatEtab = (etab) => {
        console.log(etab);
        if (!etab) return null;
        // Si c’est déjà un objet complet avec un id, on le retourne tel quel
        if (typeof etab === 'object' && etab.id && etab.name) return etab;
        // Sinon on cherche par nom
        return etab.find((e) => e.name === etab) || null;
    };

    const editProduct = (acces) => {
        if (acces.login === 'ADMIN CENTRAL')
        {
            setIsAdmin(true);
        }
        setProduct({ ...product });
        setProductDialog2(true);
        setIsUpdate(true);
        const accesFormatted = {
            ...acces,
            profil: formatProfil(acces.profil).name,
            etablissement: formatEtab(acces.acteur.etablissement)
        };

        console.log(accesFormatted);
        id_acces.current = acces.id;
        console.log(id_acces);
        formik2.setValues(accesFormatted);
    };

    console.log(is_update);

    const generateSimplePassword = () => {
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        const randomLetters = letters.charAt(Math.floor(Math.random() * letters.length)) + letters.charAt(Math.floor(Math.random() * letters.length));

        const randomDigits = String(Math.floor(1000 + Math.random() * 9000)); // 4 chiffres

        return randomLetters + randomDigits;
    };

    const editProduct2 = (acces) => {
        setDeleteProductDialog(true);
        const accesFormatted2 = {
            ...acces,
            password: generateSimplePassword() // ajoute le mot de passe généré
        };
        formik.setValues(accesFormatted2);
        setEmail(accesFormatted2.email);
        console.log(email);
    };

    const editProduct3 = (acces) => {
        setSupprimerDialog(true);
        const accesFormatted3 = {...acces};
        formik.setValues(accesFormatted3);
        setIdUser(accesFormatted3.id);
        console.log(id_user);
    };

    const editProduct4 = (acces) => {
        setDesactiveAccessDialog(true);
        const accesFormatted4 = {...acces};
        formik.setValues(accesFormatted4);
        setIdUser(accesFormatted4.id);
        console.log(id_user);
    };

    const confirmDeleteProduct = (product) => {
        setProduct(product);
        setDeleteProductDialog(true);
    };

    const deleteProduct = async (values, { setSubmitting, resetForm }) => {
        setDeleteProductDialog(false);
        console.log('PUT');
        console.log(email);

        try {
            const response = await ParametrageService.updatePassword(email);
            console.log('✅ Candidat mis à jour:', response.data);
            setMessage('Candidat créé avec succès');
            toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Mot de passe réinitialisé avec succés', life: 4000 });
            resetForm();
        } catch (error) {
            console.error('❌ Erreur lors de la création du candidat:', error);
            setMessage('Erreur lors de la réinitialisation');
            toast.current.show({ severity: 'error', summary: 'Office du Bac', detail: 'Erreur lors de la réinitialisation', life: 4000 });
        } finally {
            setSubmitting(false);
        }
    };

    const deleteUser = async (values, { setSubmitting, resetForm }) => {
        console.log('DELETE');
        try 
        {
            const response = await ParametrageService.deleteUser(id_user);
            console.log('✅ Candidat mis à jour:', response);
            setMessage('Candidat supprimé avec succès');
            toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Compte supprimé avec succés', life: 4000 });
            resetForm();
        } 
        catch (error) 
        {
            console.error('❌ Erreur lors de la suppression du compte:', error);
            setMessage('Erreur lors de la suppression');
            toast.current.show({ severity: 'error', summary: 'Office du Bac', detail: 'Erreur lors de la suppression', life: 4000 });
        } 
        finally 
        {
            setSubmitting(false);
        }
        await loadData();
        setSupprimerDialog(false);
    };


    const desactiveUser = async (values, { setSubmitting, resetForm }) => {
        console.log('DELETE');
        try 
        {
            const response = await ParametrageService.desactiveUser(id_user, true);
            console.log('✅ Candidat mis à jour:', response);
            setMessage('Candidat supprimé avec succès');

            if (response)
            {
                toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Compte réactivé avec succés', life: 4000 });
            }
            else
            {
                toast.current.show({ severity: 'warn', summary: 'Office du Bac', detail: 'Compte désactivé avec succés', life: 4000 });
            }
            
            resetForm();
        } 
        catch (error) 
        {
            console.error('❌ Erreur lors de la suppression du compte:', error);
            setMessage('Erreur lors de la suppression');
            toast.current.show({ severity: 'error', summary: 'Office du Bac', detail: 'Erreur lors de la suppression', life: 4000 });
        } 
        finally 
        {
            setSubmitting(false);
        }
        await loadData();
        setDesactiveAccessDialog(false);
    };

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try 
        {
            const data = await ParametrageService.getUsers();
            if (data && typeof data === 'object') {
                const result = Object.entries(data).map(([profilName, usr]) => ({
                    profilName,
                    usr
                }));
                console.log('OHHH :', result);
                setGroupedUsers(result);
            }
            else 
            {
                console.warn('Données inattendues :', data);
                setGroupedUsers([]); // fallback sécurité
            }
        } 
        catch (err) 
        {
            console.error('❌ Erreur chargement données :', err);
            setError('Erreur lors du chargement');
            setGroupedUsers([]);
        } 
        finally 
        {
            setLoading(false);
        }
    };

    const findIndexById = (id) => {
        let index = -1;
        for (let i = 0; i < products.length; i++) {
            if (products[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    };

    const createId = () => {
        let id = '';
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 5; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteProductsDialog(true);
    };

    const deleteSelectedProducts = () => {
        let _products = products.filter((val) => !selectedProducts.includes(val));
        setProducts(_products);
        setDeleteProductsDialog(false);
        setSelectedProducts(null);
        toast.current.show({
            severity: 'success',
            summary: 'Successful',
            detail: 'Products Deleted',
            life: 3000
        });
    };

    const onCategoryChange = (e) => {
        let _product = { ...product };
        _product['category'] = e.value;
        setProduct(_product);
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _product = { ...product };
        _product[`${name}`] = val;

        setProduct(_product);
    };

    const onInputNumberChange = (e, name) => {
        const val = e.value || 0;
        let _product = { ...product };
        _product[`${name}`] = val;

        setProduct(_product);
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex align-items-center justify-content-start gap-3 my-2">
                {/* Boutons */}
                <Button 
                    size="small"
                    severity="success" 
                    label="Créer un nouvel accès" 
                    icon="pi pi-plus" 
                    onClick={openNew} 
                />
               
                {/* <Button 
                    size="small"
                    severity="warning" 
                    label="Télécharger les états de connexion" 
                    icon="pi pi-download" 
                    onClick={openNew3} 
                /> */}

                {/* Carte alignée avec les boutons */}
                
            </div>
        );
    };


    const rightToolbarTemplate = () => {
        return <React.Fragment>{/* <Button severity="help" label="Exporter la liste" icon="pi pi-upload" onClick={exportCSV} /> */}</React.Fragment>;
    };

    const codeBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">username</span>
                {rowData.login}
            </>
        );
    };

    const date1BodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">username</span>
                {rowData.profil?.name?.replace(/_/g, ' ')}
            </>
        );
    };

    const date2BodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">username</span>
                {rowData.acteur.etablissement?.name}
            </>
        );
    };

    

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <div className="flex gap-2">
                    <Button
                                icon="pi pi-user-edit"
                                tooltip="Modifier infos accès"
                                tooltipOptions={{ position: 'bottom' }}
                                rounded
                                severity="warning"
                                onClick={() => editProduct(rowData)}
                    />

                    {!(rowData.profil.name === "ADMIN") && (
                            <Button
                                    icon="pi pi-history"
                                    tooltip="Réinitialiser le mot de passe"
                                    tooltipOptions={{ position: 'bottom' }}
                                    rounded
                                    severity="help"
                                    onClick={() => editProduct2(rowData)}
                        />
                    )}
                    
                    {!(rowData.profil.name === "ADMIN") && (
                    <Button
                                icon="pi pi-trash"
                                tooltip="Supprimer le compte"
                                tooltipOptions={{ position: 'bottom' }}
                                rounded
                                severity="danger"
                                onClick={() => editProduct3(rowData)}
                    />
                    )}

                    {!(rowData.profil.name === "ADMIN") && (
                    <Button
                                icon="pi pi-eject"
                                tooltip="Activé ou Désactivé le compte"
                                tooltipOptions={{ position: 'bottom' }}
                                rounded
                                severity="danger"
                                onClick={() => editProduct4(rowData)}
                    />
                    )}

                    {/* <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteProduct(rowData)} /> */}
                </div>
            </>
        );
    };

    const statutCompteTemplate = (rowData) => {
    const colorClass = rowData.first_connexion ? "bg-red-500" : "bg-green-500";
    const titleText = rowData.first_connexion ? "Pas encore connecté" : "Première connexion effectuée";

        return (
            <div
                className={`border-circle ${colorClass}`}
                style={{ width: 24, height: 24, boxShadow: "0 0 6px rgba(0,0,0,0.15)" }}
                title={titleText}
            />
        );
    }


    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gestion des accés à la plateforme PortailBAC</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onChange={(e) => setGlobalFilter((e.target as HTMLInputElement).value)} placeholder="Recherche..." />
            </span>
        </div>
    );

    const productDialogFooter = (
        <>
            <Button label="Valider" icon="pi pi-check" text onClick={saveProduct} />
            <Button label="Fermer" icon="pi pi-times" text onClick={hideDialog} />
        </>
    );
    const deleteProductDialogFooter = (
        <>
            <Button label="Oui" icon="pi pi-check" text onClick={() => deleteProduct(formik.values, { setSubmitting: formik.setSubmitting, resetForm: formik.resetForm })} />
            <Button label="Non" icon="pi pi-times" text onClick={hideDeleteProductDialog} />
        </>
    );

    const createBatchDialogFooter = (
        <>
            <Button label="OK" icon="pi pi-times" text onClick={hideBatchCreatedDialog} />
        </>
    );

    const deleteProductDialogFooter_ = (
        <>
            <Button label="Oui" icon="pi pi-check" text onClick={() => deleteUser(formik.values, { setSubmitting: formik.setSubmitting, resetForm: formik.resetForm })} />
            <Button label="Non" icon="pi pi-times" text onClick={hideDeleteProductDialog_} />
        </>
    );

    const deleteProductDialogFooter__ = (
        <>
            <Button label="Oui" icon="pi pi-check" text onClick={() => desactiveUser(formik.values, { setSubmitting: formik.setSubmitting, resetForm: formik.resetForm })} />
            <Button label="Non" icon="pi pi-times" text onClick={hideDeleteProductDialog__} />
        </>
    );

    const deleteProductsDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteProductsDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={deleteSelectedProducts} />
        </>
    );

    const openNew3 = () => {
        setCodifDialog(true);
    };

    const formik = useFormik({
        initialValues: {
            firstname: '',
            lastname: '',
            login: '',
            password: '',
            conf_password: '',
            phone: '',
            email: '',
            state_account: true,
            etablissement: null,
            profil: null,
            acteur: null
        },

        validationSchema: Yup.object({
            login: Yup.string().required('Champ obligatoire'),
            firstname: Yup.string().required('Champ obligatoire'),
            lastname: Yup.string().required('Champ obligatoire'),
            phone: Yup.string()
                            .required('Le téléphone est obligatoire')
                            .test('valid-phone', 'Numéro de téléphone invalide', (value) => {
                                if (!value) return false;
                                const digitsOnly = value.replace(/\s/g, ''); // supprime les espaces
                                const allowedPrefixes = ['77', '78', '76', '75', '71', '70'];
            
                                // doit faire exactement 9 chiffres et avoir un préfixe valide
                                return digitsOnly.length === 9 && allowedPrefixes.includes(digitsOnly.slice(0, 2));
                            }),
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
            
            profil: Yup.string().required('Champ obligatoire'),
            password: Yup.string().required('Champ obligatoire')
                .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
            conf_password: Yup.string()
                .required('Champ obligatoire')
                .oneOf([Yup.ref('password'), null], 'Les mots de passe ne correspondent pas'),
            etablissement: Yup.mixed()
                .nullable()
                .when('profil', {
                    is: (val) => val === 'AGENT_DE_SAISIE',
                    then: (schema) => schema.required('Champ obligatoire'),
                    otherwise: (schema) => schema.nullable()
                })
        }),

        onSubmit: async (values, { setSubmitting, resetForm }) => {
            console.log('cliquer...');

            const acteurDTO: ActeurDTO = { etablissement: values.etablissement };
            const profilDTO: ProfilDTO = { name: values.profil };

            const userDTO: UserDTO = {
                firstname: values.firstname,
                lastname: values.lastname,
                login: values.login,
                password: values.password,
                phone: values.phone.replace(/\s/g, ''),
                email: values.email,
                state_account: true,
                profil: profilDTO,
                acteur: acteurDTO
            };

            try {
                //console.log(is_update);
                if (is_update === false) 
                {
                    console.log('POST', is_go_by_smtp);
                    const response = await ParametrageService.createUser(userDTO, is_go_by_smtp);
                    console.log('✅ User créé:', response.data);
                    setMessage('User créé avec succès');
                    toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Utilisateur créé avec succès', life: 4000 });
                }
                resetForm();
                await loadData();
                setProductDialog(false);
            } 
            catch (error) {
            // On essaie de récupérer un message clair depuis le backend
            const errorMessage = error.response?.data?.errorMessage;
            setMessage(errorMessage);
                toast.current.show({ 
                    severity: 'error', 
                    summary: 'Office du Bac', 
                    detail: errorMessage, 
                    life: 4000 
                });
            }
            finally 
            {
                setSubmitting(false);
            }
        }
    });


    const formik2 = useFormik({
        initialValues: {
            firstname: '',
            lastname: '',
            login: '',
            phone: '',
            email: '',
            state_account: true,
            etablissement: null,
            profil: null,
            acteur: null
        },

        validationSchema: Yup.object({
            login: Yup.string().required('Champ obligatoire'),
            firstname: Yup.string().required('Champ obligatoire'),
            lastname: Yup.string().required('Champ obligatoire'),
            phone: Yup.string().required('Champ obligatoire'),
            email: Yup.string().required('Champ obligatoire'),
            profil: Yup.string().required('Champ obligatoire'),
            etablissement: Yup.mixed()
                .nullable()
                .when('profil', {
                    is: (val) => val === 'AGENT_DE_SAISIE',
                    then: (schema) => schema.required('Champ obligatoire'),
                    otherwise: (schema) => schema.nullable()
                })
        }),

        onSubmit: async (values, { setSubmitting, resetForm }) => {
            console.log('cliquer...');

            const acteurDTO: ActeurDTO = { etablissement: values.etablissement };
            const profilDTO: ProfilDTO = { name: values.profil };

            const userDTO_ = {
                firstname: values.firstname,
                lastname: values.lastname,
                login: values.login,
                phone: values.phone,
                email: values.email,
                state_account: true,
                profil: profilDTO,
                acteur: acteurDTO
            };

            try {
                //console.log(is_update);
                if (is_update === true) {
                    console.log('PUT');
                    const response = await ParametrageService.updateUser(id_acces, userDTO_);
                    console.log('✅ Candidat mis à jour:', response.data);
                    setMessage('Candidat créé avec succès');
                    toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Utilisateur mis à jour avec succès', life: 4000 });
                    resetForm();
                }
                await loadData();
                setProductDialog2(false);
                setIsAdmin(false);
            } 
            catch (error) 
            {
            // On essaie de récupérer un message clair depuis le backend
            const errorMessage = error.response?.data?.errorMessage;
            setMessage(errorMessage);
                toast.current.show({ 
                    severity: 'error', 
                    summary: 'Office du Bac', 
                    detail: errorMessage, 
                    life: 4000 
                });
            } 
            finally 
            {
                setSubmitting(false);
            }
        }
    });


    const handleFileChange = (e) => {
        const fileOK = e.files?.[0];
        setFile(fileOK);
        setErrorMessage('');
    };

    const handleUpload = async () => {
        setResultImport(null);
        setLoading(false);
        if (!file) 
        {
            setErrorMessage("⚠️ Veuillez d'abord charger un fichier Excel valide.");
            return;
        } 
        else {
            setCodifDialog(false);
            setLoading(true);
            setGetResultDialog(true);
            console.log(file);
            const message = await ParametrageService.uploadFile(file);
            setLoading(false);
            setResultImport(message);
            toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Fichier chargé avec succès', life: 4000 });
            
        }
    };

    //console.log(is_update);

    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="grid crud-demo">
                <div className="col-12">
                    <div className="card">
                        <style>
                                {`
                    .accepted-row {
                        background-color: #e6ffed !important; /* Vert très clair */
                    }

                    .rejected-row {
                        background-color: #ffe6e6 !important; /* Rouge très clair */
                    }
                    `}
                            </style>
                        <Toast ref={toast} />
                        <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                            {groupedUsers && Object.keys(groupedUsers).length > 0 && (
                                <TabView>
                                    {groupedUsers.map(({ profilName, usr }) => (
                                        <TabPanel key={profilName} header={profilName}>
                                            <DataTable
                                                ref={dt}
                                                stripedRows
                                                showGridlines
                                                value={Array.isArray(usr) ? usr : []} // force tableau
                                                paginator
                                                rows={10}
                                                rowsPerPageOptions={[5, 10, 25]}
                                                className="p-datatable-sm"
                                                currentPageReportTemplate="Affichage de {first} à {last} des {totalRecords} enregistrement (s)"
                                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                                globalFilter={globalFilter}
                                                emptyMessage="Aucun utilisateur n'a été trouvé"
                                                header={header}
                                                rowClassName={(rowData) => {
                                                    if (rowData.state_account === true) return 'accepted-row';
                                                    if (rowData.state_account === false) return 'rejected-row';
                                                    return '';
                                                }}
                                            >
                                                <Column field="statut" header="Statut" body={statutCompteTemplate} headerStyle={{ minWidth: '2rem' }}></Column>
                                                <Column field="login" header="Username" body={codeBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                                                <Column field="profil" header="Profil" sortable body={date1BodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                                                <Column field="etablissement" header="Etablissement" sortable body={date2BodyTemplate} headerStyle={{ minWidth: '25rem' }}></Column>
                                                <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                                            </DataTable>
                                       </TabPanel>
                                    ))}
                                </TabView>
                            )}

                        <Dialog visible={productDialog} style={{ width: '65%', maxHeight: '95vh' }} header="Panneau de création d'un accés" modal className="p-fluid" onHide={hideDialog}>
                            <form onSubmit={formik.handleSubmit} className="p-0">
                                <div className="p-1">
                                    <div className="formgrid grid mt-0">
                                        <div className="field col-4">
                                            <label htmlFor="quantity"><span className="text-red-600">*</span> Login</label>

                                            <InputText
                                                placeholder="Fournir un login"
                                                autoComplete='off'
                                                id="login"
                                                name="login"
                                                value={formik.values.login}
                                                onChange={(e) => formik.setFieldValue('login', e.target.value)}
                                                onBlur={formik.handleBlur}
                                                className={`p-inputtext-sm w-full ${formik.touched.login && formik.errors.login ? 'p-invalid' : ''}`}
                                            />
                                            {formik.touched.login && typeof formik.errors.login === 'string' && <small className="p-error">{formik.errors.login}</small>}
                                        </div>
                                    </div>
                                    <div className="formgrid grid">
                                        <div className="field col-6">
                                            <label htmlFor="price"><span className="text-red-600">*</span> Prénom (s)</label>
                                            <InputText
                                                placeholder="Saisir le prénom (s)"
                                                autoCapitalize='on'
                                                autoComplete='off'
                                                id="firstname"
                                                name="firstname"
                                                value={formik.values.firstname}
                                                onChange={(e) => formik.setFieldValue('firstname', e.target.value)}
                                                onBlur={formik.handleBlur}
                                                className={`p-inputtext-sm w-full ${formik.touched.firstname && formik.errors.firstname ? 'p-invalid' : ''}`}
                                            />
                                            {formik.touched.firstname && typeof formik.errors.firstname === 'string' && <small className="p-error">{formik.errors.firstname}</small>}
                                        </div>

                                        <div className="field col-3">
                                            <label htmlFor="quantity"><span className="text-red-600">*</span> Nom</label>
                                            <InputText
                                                placeholder="Saisir le nom"
                                                autoCapitalize='on'
                                                autoComplete='off'
                                                id="lastname"
                                                name="lastname"
                                                value={formik.values.lastname}
                                                onChange={(e) => formik.setFieldValue('lastname', e.target.value)}
                                                onBlur={formik.handleBlur}
                                                className={`p-inputtext-sm w-full ${formik.touched.lastname && formik.errors.lastname ? 'p-invalid' : ''}`}
                                            />
                                            {formik.touched.lastname && typeof formik.errors.lastname === 'string' && <small className="p-error">{formik.errors.lastname}</small>}
                                        </div>

                                        <div className="field col-3">
                                            <label htmlFor="quantity">Téléphone (Portable)</label>
                                             <InputText
                                                autoComplete='off'
                                                placeholder="Téléphone"
                                                id="phone"
                                                name="phone"
                                                value={formik.values.phone}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                className={`p-inputtext-sm w-full ${formik.touched.phone && formik.errors.phone ? 'p-invalid' : ''}`}
                                            />
                                            
                                        </div>
                                    </div>
                                    <div className="formgrid grid">
                                        
                                        <div className="field col-6">
                                            <label htmlFor="email"><span className="text-red-600">*</span> Email</label>
                                            <InputText
                                                autoComplete='off'      
                                                placeholder="Email"
                                                id="email"
                                                name="email"
                                                value={formik.values.email}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                className={`p-inputtext-sm w-full ${formik.touched.email && formik.errors.email ? 'p-invalid' : ''}`}
                                            />
                                            {formik.touched.email && typeof formik.errors.email === 'string' && <small className="p-error">{formik.errors.email}</small>}
                                        </div>

                                        <div className="field col-6">
                                            <label htmlFor="quantity"><span className="text-red-600">*</span> Choisissez un profil</label>
                                            <Dropdown
                                                id="profil"
                                                name="profil"
                                                value={formik.values.profil}
                                                onChange={(e) => formik.setFieldValue('profil', e.value)}
                                                options={profilsOptions}
                                                // optionLabel="code" // adapter si ton objet contient un champ "libelle"
                                                placeholder="Sélectionner le profil"
                                                className={`p-inputtext-sm w-full ${formik.touched.profil && formik.errors.profil ? 'p-invalid' : ''}`}
                                            />
                                            {formik.touched.profil && typeof formik.errors.profil === 'string' && <small className="p-error">{formik.errors.email}</small>}
                                        </div>
                                    </div>
                                    <div className="formgrid grid">
                                        {formik.values.profil === 'AGENT_DE_SAISIE' && (
                                            <div className="field col-8">
                                                <label htmlFor="email"><span className="text-red-600">*</span> Précisez l&apos;établissement</label>
                                                <Dropdown
                                                    showClear
                                                    id="etablissement"
                                                    name="etablissement"
                                                    value={formik.values.etablissement}
                                                    onChange={(e) => formik.setFieldValue('etablissement', e.value)}
                                                    options={etabs}
                                                    optionLabel="name" // adapter si ton objet contient un champ "libelle"
                                                    placeholder="Sélectionner l'etablissement"
                                                    filter
                                                    virtualScrollerOptions={{ itemSize: 30 }}
                                                    className={`p-inputtext-sm w-full ${formik.touched.etablissement && formik.errors.etablissement ? 'p-invalid' : ''}`}
                                                />
                                                {formik.touched.etablissement && typeof formik.errors.etablissement === 'string' && <small className="p-error">{formik.errors.email}</small>}
                                            </div>
                                        )}
                                    </div>
                                    <hr />
                                    {!is_update && (
                                        <div className="formgrid grid">
                                            <div className="field col-6">
                                                <label htmlFor="password"><span className="text-red-600">*</span> Fournir le mot de passe</label>
                                                <InputText
                                                    placeholder="Fournir le mot de passe"
                                                    id="password"
                                                    name="password"
                                                    type="password"
                                                    value={formik.values.password}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    className={`p-inputtext-sm w-full ${formik.touched.password && formik.errors.password ? 'p-invalid' : ''}`}
                                                />
                                                {formik.touched.password && typeof formik.errors.password === 'string' && <small className="p-error">{formik.errors.password}</small>}
                                            </div>

                                            <div className="field col-6">
                                                <label htmlFor="confirmPassword"><span className="text-red-600">*</span> Confirmer le mot de passe</label>
                                                <InputText
                                                    placeholder="Confirmer le mot de passe"
                                                    id="conf_password"
                                                    name="conf_password"
                                                    type="password"
                                                    value={formik.values.conf_password}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    className={`p-inputtext-sm w-full ${formik.touched.conf_password && formik.errors.conf_password ? 'p-invalid' : ''}`}
                                                />
                                                {formik.touched.conf_password && typeof formik.errors.conf_password && <small className="p-error">{formik.errors.conf_password}</small>}
                                            </div>
                                        </div>
                                    )}

                                    <div className="formgrid grid">
                                        {/* <div className="field col-6">
                                            <Checkbox name="category" value={is_go_by_smtp} onChange={(e) => setIsGoBySmtp(e.checked)} checked={is_go_by_smtp} />
                                            <span className="ml-2">
                                                <b>Transmettre les accés pas SMTP ?</b>
                                            </span>
                                        </div> */}
                                        <div className="field col-6">
                                            <div>
                                                <Button severity="success" label="Creer l'accés" className="mr-2" type="submit" />
                                                {/* <Button severity="danger" label="Delete" icon="pi pi-trash" onClick={confirmDeleteSelected} disabled={!selectedProducts || !selectedProducts.length} /> */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                            ,
                        </Dialog>

                        <Dialog visible={codifDialog} style={{ width: '1000px' }} header="Création automatique d'accés pour les établissements" modal className="p-fluid" onHide={hideDialog4}>
                            <div style={{ color: 'red' }}>
                                <span><b>Mention utile 1 : </b>Veuillez charger exclusivement un fichier Excel.</span>
                                <br />
                                <span><b>Mention utile 2 : </b>Le fichier devra contenir obligatoirement ces colonnes dans l&apos;ordre suivant : </span>
                                <br />
                                <span>- Colonne 1 : Adresse email existante et utilisable de l&apos;établissement ;</span>
                                <br />
                                <span>- Colonne 2 : Code du nom de l&apos;établissement ;</span>
                                <br />
                                <span>- Colonne 3 : Numéro de téléphone de l&apos;établissement.</span>
                                <br />
                                <span><b>Mention utile 3 : </b>Deux établissements ne peuvent en aucun cas partager le même code ni la même adresse email.</span>
                            </div>
                            <div className="col-md-6">
                                <FileUpload mode="basic" accept=".xls, .xlsx" customUpload name="xls" chooseLabel="Charger le fichier excel" onSelect={handleFileChange} className="mr-2 mt-5" />
                                {errorMessage && <div style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</div>}

                                <Button label="Enregistrer les données du fichier pour la création des accés" icon="pi pi-upload" className="p-button-success mt-2" onClick={handleUpload} />
                            </div>
                        </Dialog>

                        <Dialog 
                            visible={productDialog2} 
                            style={{ width: '65%', maxHeight: '95vh' }} 
                            header="Panneau d'édition d'un accés" 
                            modal 
                            className="p-fluid" onHide={hideDialog2}>
                            <form onSubmit={formik2.handleSubmit} className="p-0">
                                <div className="p-0">
                                    <div className="formgrid grid">
                                        <div className="field col-4">
                                            <label htmlFor="quantity"><span className="text-red-600">*</span> Login</label>

                                            <InputText
                                                disabled={isAdmin}
                                                placeholder="Fournir un login"
                                                autoComplete='off'
                                                id="login"
                                                name="login"
                                                value={formik2.values.login}
                                                onChange={(e) => formik2.setFieldValue('login', e.target.value)}
                                                onBlur={formik2.handleBlur}
                                                className={`p-inputtext-sm w-full ${formik2.touched.login && formik2.errors.login ? 'p-invalid' : ''}`}
                                            />
                                            {formik2.touched.login && typeof formik2.errors.login === 'string' && <small className="p-error">{formik2.errors.login}</small>}
                                        </div>
                                    </div>
                                    <div className="formgrid grid">
                                        <div className="field col-8">
                                            <label htmlFor="price"><span className="text-red-600">*</span> Prénom (s)</label>
                                            <InputText
                                                placeholder="Saisir le prénom (s)"
                                                autoCapitalize='on'
                                                autoComplete='off'
                                                id="firstname"
                                                name="firstname"
                                                value={formik2.values.firstname}
                                                onChange={(e) => formik2.setFieldValue('firstname', e.target.value)}
                                                onBlur={formik2.handleBlur}
                                                className={`p-inputtext-sm w-full ${formik2.touched.firstname && formik2.errors.firstname ? 'p-invalid' : ''}`}
                                            />
                                            {formik2.touched.firstname && typeof formik2.errors.firstname === 'string' && <small className="p-error">{formik2.errors.firstname}</small>}
                                        </div>

                                        <div className="field col-4">
                                            <label htmlFor="quantity"><span className="text-red-600">*</span> Nom</label>
                                            <InputText
                                                placeholder="Saisir le nom"
                                                autoCapitalize='on'
                                                autoComplete='off'
                                                id="lastname"
                                                name="lastname"
                                                value={formik2.values.lastname}
                                                onChange={(e) => formik2.setFieldValue('lastname', e.target.value)}
                                                onBlur={formik2.handleBlur}
                                                className={`p-inputtext-sm w-full ${formik2.touched.lastname && formik2.errors.lastname ? 'p-invalid' : ''}`}
                                            />
                                            {formik2.touched.lastname && typeof formik2.errors.lastname === 'string' && <small className="p-error">{formik2.errors.lastname}</small>}
                                        </div>
                                    </div>
                                    <div className="formgrid grid">
                                        
                                        <div className="field col-8">
                                            <label htmlFor="email"><span className="text-red-600">*</span> Email</label>
                                            <InputText
                                                placeholder="Email"
                                                autoComplete='off'
                                                id="email"
                                                name="email"
                                                value={formik2.values.email}
                                                onChange={formik2.handleChange}
                                                onBlur={formik2.handleBlur}
                                                className={`p-inputtext-sm w-full ${formik2.touched.email && formik2.errors.email ? 'p-invalid' : ''}`}
                                            />
                                            {formik2.touched.email && typeof formik2.errors.email === 'string' && <small className="p-error">{formik2.errors.email}</small>}
                                        </div>
                                        <div className="field col-4">
                                            <label htmlFor="quantity">Téléphone (Portable)</label>
                                             <InputText
                                                autoComplete='off'
                                                id="phone"
                                                name="phone"
                                                value={formik2.values.phone}
                                                onChange={formik2.handleChange}
                                                onBlur={formik2.handleBlur}
                                                className={`p-inputtext-sm w-full ${formik2.touched.phone && formik2.errors.phone ? 'p-invalid' : ''}`}
                                            />
                                            {/* {formik2.touched.phone && typeof formik2.errors.phone === 'string' && <small className="p-error">{formik2.errors.phone}</small>} */}
                                        </div>
                                    </div>
                                    <div className="formgrid grid">

                                        {formik2.values.profil === 'AGENT_DE_SAISIE' && (
                                            <div className="field col-8">
                                                <label htmlFor="email"><span className="text-red-600">*</span> Précisez l&apos;établissement</label>
                                                <Dropdown
                                                    showClear
                                                    id="etablissement"
                                                    name="etablissement"
                                                    value={formik2.values.etablissement}
                                                    onChange={(e) => formik2.setFieldValue('etablissement', e.value)}
                                                    options={etabs}
                                                    optionLabel="name" // adapter si ton objet contient un champ "libelle"
                                                    placeholder="Sélectionner l'etablissement"
                                                    filter
                                                    virtualScrollerOptions={{ itemSize: 30 }}
                                                    className={`p-inputtext-sm w-full ${formik2.touched.etablissement && formik2.errors.etablissement ? 'p-invalid' : ''}`}
                                                />
                                                {formik2.touched.etablissement && typeof formik2.errors.etablissement === 'string' && <small className="p-error">{formik2.errors.email}</small>}
                                            </div>
                                        )}

                                        <div className="field col-4">
                                            <label htmlFor="quantity"><span className="text-red-600">*</span> Choisissez un profil</label>
                                            <Dropdown
                                                disabled={isAdmin}
                                                id="profil"
                                                name="profil"
                                                value={formik2.values.profil}
                                                onChange={(e) => formik2.setFieldValue('profil', e.value)}
                                                options={profilsOptions}
                                                // optionLabel="code" // adapter si ton objet contient un champ "libelle"
                                                placeholder="Sélectionner le profil"
                                                className={`p-inputtext-sm w-full ${formik2.touched.profil && formik2.errors.profil ? 'p-invalid' : ''}`}
                                            />
                                            {formik2.touched.profil && typeof formik2.errors.profil === 'string' && <small className="p-error">{formik2.errors.email}</small>}
                                        </div>
                                    </div>
                                    <div className="formgrid grid">
                                        <div className="field col-8"></div>
                                        <div className="field col-4">
                                            <div>
                                                <Button severity="success" label="Modifier les infos de l'accés" className="mr-2" type="submit" />
                                                {/* <Button severity="danger" label="Delete" icon="pi pi-trash" onClick={confirmDeleteSelected} disabled={!selectedProducts || !selectedProducts.length} /> */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                            ,
                        </Dialog>

                        <Dialog visible={deleteProductDialog} style={{ width: '550px' }} header="Réinitialisation du mot de passe" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
                            <form onSubmit={formik.handleSubmit} className="p-0">
                                <div className="flex align-items-center justify-content-center">
                                    <i className="pi pi-exclamation-circle mr-3" style={{ fontSize: '2rem', color: 'orange' }} />
                                    <span>
                                        Êtes-vous sûr(e) de vouloir réinitialiser le mot de passe du compte <br /><b>{formik.values.login}</b> ?<br />
                                    </span>
                                </div>
                            </form>
                        </Dialog>

                        <Dialog visible={supprimerDialog} style={{ width: '550px' }} header="Suppression d'un compte" modal footer={deleteProductDialogFooter_} onHide={hideDeleteProductDialog_}>
                            <form onSubmit={formik.handleSubmit}>
                                <div className="flex align-items-center justify-content-center">
                                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem', color: 'red' }} />
                                    <span>
                                        Êtes-vous sûr(e) de vouloir supprimer le compte rattaché à l&apos;email <br /><b>{formik.values.email}</b> ?<br />
                                    </span>
                                </div>
                            </form>
                        </Dialog>

                        <Dialog visible={desactiveAccessDialog} style={{ width: '550px' }} header="Gestion de l'activité d'un compte" modal footer={deleteProductDialogFooter__} onHide={hideDeleteProductDialog__}>
                            <form onSubmit={formik.handleSubmit}>
                                <div className="flex align-items-center justify-content-center">
                                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem', color:'red' }} />
                                    <span>
                                        Êtes-vous sûr de vouloir modifier le statut du compte rattaché à l&apos;email <br /><b>{formik.values.email}</b> ?<br />
                                    </span>
                                </div>
                            </form>
                        </Dialog>

                        <Dialog 
                            visible={getResultDialog} 
                            style={{ width: '600px' }} 
                            header="Création de comptes pour les Agents de Saisie" 
                            modal 
                            onHide={hideBatchCreatedDialog}
                        >
                            <div className="flex flex-column align-items-center">
                                {loading && (
                                    <div className="flex flex-column justify-content-center align-items-center" style={{ height: '100px' }}>
                                        <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="6" />
                                        <span>Les comptes sont en cours de création...</span>
                                    </div>
                                )}

                                {!loading && resultImport && (
                                    <div className="flex flex-column align-items-center">
                                        <span>
                                            <b style={{ color: "green" }}>
                                                {resultImport}
                                            </b>
                                        </span>
                                        <Button 
                                            label="OK" 
                                            icon="pi pi-times" 
                                            text 
                                            onClick={hideBatchCreatedDialog} 
                                            className="mt-3"
                                        />
                                    </div>
                                )}
                            </div>
                        </Dialog>

                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default CalendarDemo;
