'use client';

import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Rating } from 'primereact/rating';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Demo } from '@/types';
import { ProductService } from '@/demo/service/ProductService';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { Calendar } from 'primereact/calendar';
import { Carousel } from 'primereact/carousel';
import { CandidatDTO, CandidatureService, ConcoursGeneralDTO } from '@/demo/service/CandidatureService';
import * as Yup from 'yup';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { UserContext } from '@/app/userContext';
import { useFormik } from 'formik';
import { type } from 'os';
import { useFormikLocalStorageDefault } from './useFormikLocalStorageDefault';
import { InputMask } from 'primereact/inputmask';
import { Candidat } from '@/types/candidat';
import { TabView, TabPanel } from 'primereact/tabview';
import ProtectedRoute from '@/layout/ProtectedRoute';
import { InputTextarea } from 'primereact/inputtextarea';
import './style.css';

const Crud = () => {
    const { user } = useContext(UserContext);

    var is_update = useRef(false);
    var id_cdt = useRef(null);

    //console.log(user);

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
    const [modifCandDialog, setModifCandDialog] = useState(false);
    const [deleteProductDialog, setDeleteProductDialog] = useState(false);
    const [deleteProductsDialog, setDeleteProductsDialog] = useState(false);

    const [ageDialog, setAgeDialog] = useState(false);

    const [bfemDialog, setBfemDialog] = useState(false);
    const [bfemDialog2, setBfemDialog2] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [product, setProduct] = useState(emptyProduct);
    const [selectedProducts, setSelectedProducts] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const [series, setSeries] = useState(null);
    const [cecs, setCentreECivils] = useState(null);
    const [pays, setPays] = useState(null);
    const [baseMorte, setBaseMorte] = useState(null);
    const [faeb, setFaebs] = useState(null);
    const [matieres, setMatiereOptions] = useState([]);
    const [prog, setOneProg] = useState<{ edition?: number; bfem_IfEPI?: number; bfem_IfI?: number } | null>(null);
    const [candidats, setCandidatData] = useState([]);
    const [candidat, setCandidat] = useState(null);
    const [reloadTrigger, setReloadTrigger] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [specialites, setSpecialiteData] = useState([]);
    const [reste, setReste] = useState(null);
    const [printDialog, setPrintDialog] = useState(false);

    const [locked, setLocked] = useState(false);

    const [errors, setErrors] = useState({ specialite: "", level: "" });
    const [isValid, setIsValid] = useState(false);


    const [spec, setSpec] = useState(null);
    const [classe, setClasse] = useState(null);

    const [getSpec, setSpecData] = useState([]);

    const [age1, setAge1] = useState(null);
    const [age2, setAge2] = useState(null);

    const [groupedCdts, setGroupedCdts] = useState([]);

    const [age, setAge] = useState(null);


    const calculateAge = (dateString: string): number | null => {
        if (!dateString) return null;

        const birthDate = new Date(dateString); // ISO YYYY-MM-DD reconnu par JS
        if (isNaN(birthDate.getTime())) return null; // sécurité
        console.log("birthDate:", birthDate);

        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        console.log(age);

        // Vérifie si l'anniversaire n'est pas encore passé cette année
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };

    
    

    useEffect(() => {
        CandidatureService.getLastProg().then((response) => {
            //console.log("📦 Séries chargées :", data);
            setOneProg(response);
        });
    }, []);

    const hideDeleteProductDialog__ = () => {
        setPrintDialog(false);
    };

    useEffect(() => {
        if (user?.acteur?.etablissement?.id && Number(prog?.edition)) {
            fetchData();
        }
    }, [reloadTrigger, user, prog]);


    const handleSubmit2 = (e) => {
        e.preventDefault();

        let newErrors = { specialite: "", level: "" };
        setIsValid(true);

        if (!classe) {
            newErrors.level = "Veuillez sélectionner la classe.";
            setIsValid(false);
        }
        if (!spec) {
            newErrors.specialite = "Veuillez sélectionner la discipline.";
            setIsValid(false);
        }

        setErrors(newErrors);

        if (!isValid) return;
    };
    

    const fetchData = async () => {
        try {
            const data = await CandidatureService.getCdtsCgsByClasse(user?.acteur?.etablissement?.id, Number(prog?.edition));
            console.log(data);

            // Vérifie que data est bien un objet
            if (data && typeof data === 'object') 
            {
                const result = Object.entries(data).map(([level, cdts]) => ({
                    level,
                    cdts
                }));
                console.log('OHHH :', result);
                setGroupedCdts(result);
            } else {
                console.warn('⚠️ Données inattendues :', data);
                setGroupedCdts([]); // fallback sécurité
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement des séries :', error);
            setGroupedCdts([]);
        }
    };

    useEffect(() => {
        ProductService.getProducts().then((data) => setProducts(data));
    }, []);

    useEffect(() => {
        CandidatureService.getSeries().then((response) => {
            //console.log("📦 Séries chargées :", data);
            setSeries(response);
        });
    }, []);

    useEffect(() => {
        CandidatureService.getCentreEtatCivils().then((response) => {
            //console.log("📦 Séries chargées :", data);
            setCentreECivils(response);
        });
    }, []);

    useEffect(() => {
        CandidatureService.getPays().then((response) => {
            //console.log("📦 Séries chargées :", data);
            setPays(response);
        });
    }, []);

    useEffect(() => {
        CandidatureService.getMatiereOptions().then((response) => {
            //console.log("📦 Séries chargées :", data);
            setMatiereOptions(response);
        });
    }, []);

    useEffect(() => {
        if (user?.acteur?.etablissement?.id && Number(prog?.edition)) {
            loadCandidats();
            loadFaebs();
        }
    }, [reloadTrigger, user, prog]);


    const loadCandidats = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await CandidatureService.getCandidatsByEtablissement(user?.acteur?.etablissement?.id, prog?.edition);
            console.log('OK', response);
            setCandidatData(response);
        } catch (err) {
            console.error('Erreur chargement candidats :', err);
            setError('Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    const loadFaebs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await CandidatureService.compteFAEBS_(user?.acteur?.etablissement?.id, prog?.edition);
            console.log('OK', response);
            setFaebs(response);
        } catch (err) {
            console.error('❌ Erreur chargement faebs :', err);
            setError('Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    }, [user?.acteur?.etablissement?.id, prog?.edition]);

    useEffect(() => {
                    CandidatureService.getAllSpecialite().then((response) => {
                    setSpecialiteData(response);
                });
    }, []);

    const nbrTCdts = candidats.length;
    console.log(faeb);

    const classeOptions = [
        { label: 'Troisième', value: 'Troisième' },
        { label: 'Seconde', value: 'Seconde' },
        { label: 'Première', value: 'Première' },
    ];

    const classeOptions_ = [
        { label: 'Première', value: 'PREMIERE' },
        { label: 'Terminale', value: 'TERMINALE' }
    ];

    const sexeOptions = [
        { label: 'M', value: 'M' },
        { label: 'F', value: 'F' }
    ];

    const countryOptionTemplate = (country) => {
        return (
            <div className="country-item">
                <img alt={country.code} src={`https://flagcdn.com/16x12/${country.code.toLowerCase()}.png`} className="mr-2" />
                <span>{country.name}</span>
            </div>
        );
    };

    function isValidDate(dateStr) {
        // Vérifie le format avec regex
        const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
        if (!regex.test(dateStr)) return false;

        // Séparer jour, mois, année
        const [day, month, year] = dateStr.split('/').map(Number);

        // Créer un objet Date
        const date = new Date(year, month - 1, day);

        // Vérifier que le jour, mois, année correspondent bien
        return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
    }

    const handleChangeDateNaiss = (e) => {
        const value = e.target.value;

        if (value === '' || isValidDate(value)) {
            formik.setFieldValue('date_birth', value);
            formik.setFieldError('date_birth', '');
        } else {
            formik.setFieldError('date_birth', 'Date invalide');
        }

        setAge(calculateAge(formik.values.date_birth));
        if (formik.values.level === "PREMIERE" && age > 20) 
        {
            setDeleteProductsDialog(true);
        }
        console.log(age);
        console.log(formik.values.level)
    };




    const rowClass = (rowData) => {
        if (rowData.decision === 1) return 'accepted-row';
        if (rowData.decision === 2) return 'rejected-row';
        return '';
    };

    
    useEffect(() => {
            const storedSerie = localStorage.getItem('serie');
            if (storedSerie) {
                try {
                    const parsedSerie = JSON.parse(storedSerie); // si tu as stocké un objet
                    formik.setFieldValue('serie', parsedSerie);
                    handleSerieChange(parsedSerie); // si tu dois charger les matières, candidats, etc.
                } catch (err) {
                    console.error('Erreur parsing série locale :', err);
                }
            }
    }, []);

    const openNew = () => {
        is_update.current = false;
        formik.resetForm();
        setBaseMorte(null);

        // Fonction utilitaire pour parser localStorage en toute sécurité
        // const safeParse = (key) => {
        //     const value = localStorage.getItem(key);
        //     if (!value || value === 'undefined') return null;
        //     try {
        //         return JSON.parse(value);
        //     } catch (e) {
        //         console.warn(`Impossible de parser ${key} :`, value);
        //         return null;
        //     }
        // };
        
        //const storedSerie = safeParse('serie');

        formik.setValues({
            ...formik.initialValues,

            // Tout le reste repasse à vide
            firstname: '',
            lastname: '',
            date_birth: '',
            place_birth: '',
            phone: '',
            gender: '',
            classe_0: '',
            note_student_disc: '',
            classe_1: '',
            note_classe_disc:'',
            firstname_prof:'',
            lastname_prof:'',
            serie: '',
            etablissement: '',
            level : '',
            specialite: ''
        });

        setSubmitted(false);
        setProductDialog(true);
    };

    const hideDialog = () => {
        if (productDialog) {
            formik.resetForm();
            setSubmitted(false);
            setProductDialog(false);
            is_update.current = false;
        }
        if (modifCandDialog) {
            formik.resetForm();
            setSubmitted(false);
            setModifCandDialog(false);
            is_update.current = false;
        }
    };

    const hideDeleteProductDialog_ = () => {
        setDeleteDialog(false);
    };

    const hideDeleteProductDialog = () => {
        setDeleteProductDialog(false);
        setProductDialog(false);
        setBaseMorte(null);
    };

    const hideAgeDialog = () => {
        setAgeDialog(false);
    };

    const hideDeleteProductsDialog = () => {
        setDeleteProductsDialog(false);
        setProductDialog(false);
    };

    const hideDeleteProductsDialog2 = () => {
        setBfemDialog(false);
    };

    const hideDeleteProductsDialog3 = () => {
        setBfemDialog2(false);
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

    const formatDateToInput = (isoDateStr) => {
        const date = new Date(isoDateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatMatiere = (matiere) => {
        if (!matiere) return null;
        // Si c’est déjà un objet complet avec un id, on le retourne tel quel
        if (typeof matiere === 'object' && matiere.id && matiere.name) return matiere;
        // Sinon on cherche par nom
        return matieres.find((m) => m.name === matiere) || null;
    };

    const [rejets, setRejets] = useState([]);
    

    const editProduct = (candidat) => {
        is_update.current = true;
        setModifCandDialog(true);
        // setCandidat({ ...candidat });

        const candidatFormatted = {
            ...candidat,
            date_birth: candidat.date_birth ? formatDateToInput(candidat.date_birth) : '',
        };
        (id_cdt.current = candidat.id), console.log(id_cdt);
        formik.setValues(candidatFormatted);
        console.log(is_update);
    };

    const editProduct2 = (candidat) => {
        setDeleteDialog(true);
        setCandidat({ ...candidat });
        id_cdt.current = candidat.id;
    };

    const confirmDeleteProduct = (product) => {
        setProduct(product);
        setDeleteProductDialog(true);
    };

    function normalize(str) {
        return str
            ? str
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .toUpperCase()
            : '';
    }

    const getData = () => {
        if (baseMorte) {
            // Mise à jour des champs Formik
            formik.setFieldValue('firstname', baseMorte?.firstname.toUpperCase() || '');
            formik.setFieldValue('lastname', baseMorte?.lastname.toUpperCase() || '');
            formik.setFieldValue('date_birth', formatDateForMask(baseMorte?.date_birth) || '');
            formik.setFieldValue('place_birth', baseMorte?.place_birth || '');
            // Au moment de charger baseMorte :

            // console.log(baseMorte.countryBirth.toUpperCase());
            // console.log(pays.find((c) => normalize(c.name)));
            // const countryObj = pays.find((c) => normalize(c.name) === normalize(baseMorte.countryBirth));
            // const matchingCentre = cecs.find((c) => c.code === baseMorte.code_centre_etat_civil);
            // formik.setFieldValue('countryBirth', countryObj || null);
            formik.setFieldValue('gender', baseMorte?.gender || '');
            formik.setFieldValue('serie', baseMorte?.serie || '');
            formik.setFieldValue('phone', baseMorte?.phone1 || '');
            // formik.setFieldValue('bac_do_count', baseMorte.bac_do_count + 1 || 0);
            // formik.setFieldValue('codeCentre', baseMorte.code_centre_etat_civil || 0);
            // formik.setFieldValue('centreEtatCivil', matchingCentre || null);
            // formik.setFieldValue('year_registry_num', baseMorte.yearRegistryNum || 0);
            // formik.setFieldValue('registry_num', baseMorte.registryNum || '');
            toast.current.show({
                severity: 'success',
                summary: 'Office du Bac',
                detail: 'Les information du candidat ont été préchargées avec succés',
                life: 3000
            });
            setDeleteProductDialog(false);
        } else {
            toast.current.show({
                severity: 'error',
                summary: 'Office du Bac',
                detail: 'Désolé, les informations du candidat ne pourront pas être préchargées.',
                life: 3000
            });
            setDeleteProductDialog(false);
            setProductDialog(false);
        }
        formik.setFieldValue('dos_number', '');
        setLocked(true);

    };

    const deleteData = async () => {
        console.log(id_cdt.current);
        if (id_cdt.current) {
            CandidatureService.deleteCandidatCGS(id_cdt.current); // passer la valeur, pas le RefObject
            await loadCandidats();
            await fetchData();
            toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Le dossier de candidature a été supprimé avec succés', life: 5000 });
        }
        setDeleteDialog(false);
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
        setDeleteProductsDialog(false);
        //toast.current.show({ severity: 'error', summary: 'Office du Bac', detail: 'Ce dossier de candidature ne pourra être enregistré en aucun cas', life: 5000 });
        setProductDialog(false);
    };

    const deleteSelectedProducts2 = () => {
        setBfemDialog(false);
        setProductDialog(false);
    };

    const deleteSelectedProducts3 = () => {
        setBfemDialog2(false);
        setProductDialog(false);
    };

    const onCategoryChange = (e) => {
        let _product = { ...product };
        _product['category'] = e.value;
        setProduct(_product);
    };

    
    const openPrint = () => {
        setPrintDialog(true);
    };

    const onChangeChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _product = { ...product };
        _product[`${name}`] = val;

        setProduct(_product);
    };

    const onChangeNumberChange = (e, name) => {
        const val = e.value || 0;
        let _product = { ...product };
        _product[`${name}`] = val;

        setProduct(_product);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-1">
                            <Button severity="success" label="Ajouter un candidat au concours général" icon="pi pi-plus" className="mr-2" onClick={openNew} />
                            <Button label="Télécharger la liste des inscrits au CGS" icon="pi pi-print" className="mr-2" onClick={openPrint} />
                    {/* <Button severity="danger" label="Delete" icon="pi pi-trash" onClick={confirmDeleteSelected} disabled={!selectedProducts || !selectedProducts.length} /> */}
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                {/* <Button severity="info" label="Importer la liste" icon="pi pi-arrow-down-right" className="mr-2 inline-block"/>
                <Button severity="help" label="Exporter la liste" icon="pi pi-upload" onClick={exportCSV} /> */}
                {/* <DownloadPDFButton etablissementId={user?.acteur?.etablissement?.id} etablissementName={user?.acteur?.etablissement?.name} session={prog?.edition} />
                 */}
            </React.Fragment>
        );
    };

    interface DownloadPDFButtonProps {
        etablissementId: String;
        etablissementName: String;
        session: number;
        spec : String,
        level : String
    }

    const DownloadPDFButton: React.FC<DownloadPDFButtonProps> = ({ etablissementId, session, etablissementName, spec, level }) => {
        const [loading, setLoading] = useState(false);

        // Si aucun établissement n'est sélectionné, ne rien afficher
        if (!etablissementId) return null;

        const handleDownload = async () => {
            setLoading(true);
            try {
                await CandidatureService.getListCGS(etablissementId, session, etablissementName, user?.login, spec, classe);
            } catch (error) {
                console.error('Erreur lors du téléchargement du fichier PDF.', error);
            } finally {
                setLoading(false);
            }
        };

        return faeb ? <Button label={loading ? 'Téléchargement...' : 'Télécharger la liste compléte des inscrits au CGS'} icon="pi pi-download" onClick={handleDownload} disabled={loading} className="p-button-primary mr-2" /> : null;
    };

    const DownloadPDFButton2: React.FC<DownloadPDFButtonProps> = ({ etablissementId, session, etablissementName }) => {
        const [loading2, setLoading2] = useState(false);

        // ✅ Si aucun établissement n'est sélectionné, ne rien afficher
        if (!etablissementId) return null;

        const handleDownload2 = async () => {
            setLoading2(true);
            try {
                await CandidatureService.getListRejetByEtab(etablissementId, session, etablissementName, user?.login);
            } catch (error) {
                console.error('Erreur lors du téléchargement du fichier PDF.', error);
            } finally {
                setLoading2(false);
            }
        };

        return faeb ? <Button label={loading2 ? 'Téléchargement...' : 'Télécharger la liste des rejets'} icon="pi pi-download" onClick={handleDownload2} disabled={loading2} severity="help" className="p-button-primary" /> : null;
    };

    const dNBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">dos_number</span>
                {rowData.dos_number}
            </>
        );
    };

    const fNBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">firstname</span>
                {rowData.firstname}
            </>
        );
    };

    const lNBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">lastname</span>
                {rowData.lastname}
            </>
        );
    };

    const serieBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">serie</span>
                {rowData.gender}
            </>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (

                    <>
                        <Button icon="pi pi-pencil" label="Modifier le dossier" rounded severity="warning" className="mr-2" onClick={() => editProduct(rowData)} />
                        <Button icon="pi pi-trash" label="Supprimer le dossier" rounded severity="danger" className="mr-2" onClick={() => editProduct2(rowData)} />
                    </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0"></h5>
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
            <Button label="Oui" icon="pi pi-check" text onClick={getData} />
            <Button label="Non" icon="pi pi-times" text onClick={hideDeleteProductDialog} />
        </>
    );

    const deleteProductsDialogFooter = (
        <>
            <Button label="Compris" icon="pi pi-check" text onClick={deleteSelectedProducts} />
        </>
    );

    const deleteAgeDialogFooter = (
        <>
            <Button label="Compris" icon="pi pi-check" text onClick={hideAgeDialog} />
        </>
    );

    const deleteProductsDialogFooter2 = (
        <>
            <Button label="Compris" icon="pi pi-check" text onClick={deleteSelectedProducts2} />
        </>
    );

    const deleteProductsDialogFooter3 = (
        <>
            <Button label="Compris" icon="pi pi-check" text onClick={deleteSelectedProducts3} />
        </>
    );

    const deleteDialogFooter = (
        <>
            <Button label="Oui" icon="pi pi-check" text onClick={deleteData} />
            <Button label="Non" icon="pi pi-times" text onClick={hideDeleteProductDialog_} />
        </>
    );

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            let value = e.target.value.replace(/\D/g, ''); // supprime tout sauf les chiffres
    
            // empêche tout sauf le premier chiffre = 7
            if (value.length === 1 && value !== '7') {
                formik.setFieldValue('phone', '');
                return;
            }
    
            // limite à 9 chiffres
            if (value.length > 9) value = value.slice(0, 9);
    
            // vérifie le préfixe dès que les deux premiers chiffres sont présents
            const allowedPrefixes = ['77', '78', '76', '75', '71', '70'];
            if (value.length >= 2 && !allowedPrefixes.includes(value.slice(0, 2))) {
                formik.setFieldValue('phone', value.slice(0, 1)); // garde seulement le premier chiffre correct
                return;
            }
    
            // formatage automatique : XX XXX XX XX
            let formatted = value;
            if (value.length > 2) formatted = value.slice(0, 2) + ' ' + value.slice(2);
            if (value.length > 5) formatted = formatted.slice(0, 6) + ' ' + formatted.slice(6, 8) + ' ' + formatted.slice(8);
    
            formik.setFieldValue('phone', formatted);
        };

    const formik = useFormik({
        initialValues: {
            firstname: '',
            lastname: '',
            date_birth: '',
            place_birth: '',
            gender: '',
            phone: '',
            classe_0: '',
            note_student_disc: '',
            classe_1: '',
            note_classe_disc: '',
            firstname_prof: '',
            lastname_prof: '',
            serie: null,
            session : 0,
            etablissement : '',
            level: '',
            specialite : '',
            dos_number: ''

        },

        validationSchema: Yup.object({
            

            firstname: Yup.string()
                .required('Champ requis')
                .matches(/^[a-zA-ZÀ-ÿ]+(?:[ '-][a-zA-ZÀ-ÿ]+)*$/, 'Le prénom ne doit pas contenir de caractères speciaux')
                .test('no-leading-space', 'Le prénom ne peut pas commencer par un espace', (value) => value && !value.startsWith(' '))
                .test('no-trailing-space', 'Le prénom ne peut pas se terminer par un espace', (value) => value && !value.endsWith(' ')),
            lastname: Yup.string()
                .required('Champ requis')
                .matches(/^[a-zA-ZÀ-ÿ]+(?:[ '-][a-zA-ZÀ-ÿ]+)*$/, 'Le nom contient des caractères invalides')
                .test('no-leading-space', 'Le nom ne peut pas commencer par un espace', (value) => value && !value.startsWith(' '))
                .test('no-trailing-space', 'Le nom ne peut pas se terminer par un espace', (value) => value && !value.endsWith(' ')),
            date_birth: Yup.string().required('Champ requis').test('valid-date', 'Format de date invalide (JJ/MM/AAAA)', isValidDate),
            gender: Yup.string().required('Champ requis'),
            serie: Yup.object().nullable().required('Série obligatoire'),
            classe_0: Yup.string().required('Champ requis'),
            classe_1: Yup.string().required('Champ requis'),
            specialite: Yup.string().required('Champ requis'),
            note_student_disc: Yup.string().required('Champ requis'),
            note_classe_disc: Yup.string().required('Champ requis'),
            phone: Yup.string().required('Champ requis'),
            place_birth: Yup.string().required('Champ requis'),
            firstname_prof: Yup.string()
                .required('Champ requis')
                .matches(/^[a-zA-ZÀ-ÿ]+(?:[ '-][a-zA-ZÀ-ÿ]+)*$/, 'Le prénom ne doit pas contenir de caractères speciaux')
                .test('no-leading-space', 'Le prénom ne peut pas commencer par un espace', (value) => value && !value.startsWith(' '))
                .test('no-trailing-space', 'Le prénom ne peut pas se terminer par un espace', (value) => value && !value.endsWith(' ')),
            lastname_prof: Yup.string()
                .required('Champ requis')
                .matches(/^[a-zA-ZÀ-ÿ]+(?:[ '-][a-zA-ZÀ-ÿ]+)*$/, 'Le nom contient des caractères invalides')
                .test('no-leading-space', 'Le nom ne peut pas commencer par un espace', (value) => value && !value.startsWith(' '))
                .test('no-trailing-space', 'Le nom ne peut pas se terminer par un espace', (value) => value && !value.endsWith(' ')),
            level: Yup.string().required('Champ requis')
        }),

        onSubmit: async (values, { setSubmitting, resetForm }) => {
            console.log('cliquer...');
            setIsSaving(true);

        
        const cgsDTO: ConcoursGeneralDTO = {
            firstname: values.firstname,
            lastname: values.lastname,
            date_birth: values.date_birth,
            place_birth: values.place_birth,
            phone: values.phone,
            gender: values.gender,
            classe_0 : values.classe_0,
            classe_1 : values.classe_1,
            note_student_disc : Number(values.note_student_disc),
            note_classe_disc : Number(values.note_classe_disc),
            firstname_prof : values.firstname_prof,
            lastname_prof : values.lastname_prof,
            serie : values.serie,
            session : prog?.edition,
            etablissement : user?.acteur?.etablissement?.code,
            level : values.level,
            specialite : values.specialite
            
        };

            try {
                console.log(is_update);
                if (is_update.current === false) 
                {
                    
                    console.log(cgsDTO);
                    const decompt_cgs = await CandidatureService.getDispoCGS(cgsDTO.specialite, cgsDTO.level, cgsDTO.session, cgsDTO.etablissement);
                    console.log("FIIII LEU", decompt_cgs);

                    if (decompt_cgs === 10)
                    {
                        toast.current.show({ severity: 'warn', summary: 'Office du Bac', detail: 'Vous avez atteint le nombre de candidat à inscrire pour cette spécialité', life: 4000 });
                    }
                    else
                    {
                        if ((age > 20 && formik.values.level === 'PREMIERE') || (age > 21 && formik.values.level === 'TERMINALE'))
                        {
                            toast.current.show({ severity: 'warn', summary: 'Office du Bac', detail: 'La limite d\'age est dépassée', life: 4000 });
                        }
                        else
                        {
                            const response = await CandidatureService.createCdtCgs(cgsDTO);
                            console.log('✅ Candidat créé:', response.data);
                            toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Candidat créé avec succès', life: 4000 });
                            openNew();
                        }                       
                    }
                    
                    // }
                }
                if (is_update.current === true) {
                    console.log(cgsDTO);
                    const decompt_cgs = await CandidatureService.getDispoCGS(cgsDTO.specialite, cgsDTO.level, cgsDTO.session, cgsDTO.etablissement);
                    console.log("FIIII LEU", decompt_cgs);

                    if (decompt_cgs === 10)
                    {
                        toast.current.show({ severity: 'warn', summary: 'Office du Bac', detail: 'Vous avez atteint le nombre de candidat à inscrire pour cette spécialité', life: 4000 });
                    }
                    else
                    {
                        console.log('PUT');
                        const response = await CandidatureService.updateCdtCgs(id_cdt, cgsDTO);
                        console.log('✅ Candidat mis à jour:', response.data);
                        toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Candidat mis à jour avec succès', life: 4000 });
                    }
                   
                }
                await loadCandidats();
                await fetchData();
            } catch (error) {
                console.error('❌ Erreur lors de la création du candidat:', error);
                setMessage('Erreur lors de la création du candidat');
                toast.current.show({ severity: 'error', summary: 'Office du Bac', detail: 'Erreur lors de la création du candidat', life: 4000 });
            } finally {
                setIsSaving(false);
                setSubmitting(false);
            }
            setLocked(false);
            setSubmitted(false);
            setProductDialog(false);
            setModifCandDialog(false);
        }
    });

    console.log(formik.values.level)

    useEffect(() => {
    if (
        formik.values.classe_0 &&
        !classe0Options.some((opt) => opt.value === formik.values.classe_0)
    ) {
        formik.setFieldValue("classe_0", "");
    }
    if (
        formik.values.classe_1 &&
        !classe1Options.some((opt) => opt.value === formik.values.classe_1)
    ) {
        formik.setFieldValue("classe_1", "");
    }
    }, [formik.values.level, formik.values.classe_0, formik.values.classe_1]);


    useEffect(() => {
            console.log(formik.values.dos_number)
            if (formik.values.dos_number) {
                console.log(Number(prog?.edition), user?.acteur?.etablissement?.id);
                fetchCandidateInfo(formik.values.dos_number);
            }
        }, [formik.values.dos_number]);
    
        const fetchCandidateInfo = async (dos_number) => {
            try {
                const response = await CandidatureService.retreiveDataByDosNumber(dos_number, Number(prog?.edition), user?.acteur?.etablissement?.id);
                console.log(response);
                if (!response) {
                    setBaseMorte(null);
                } else {
                    setBaseMorte(response);
                    setDeleteProductDialog(true);
                }
            } catch (error) {
                console.error('Erreur :', error);
            }
        };
    

    
    const filteredSpecialites = formik.values.level
        ? specialites.filter((s) => s.classe === formik.values.level)
        : specialites;

    const filteredSpecialitesOptions = filteredSpecialites.map(s => ({
        label: s.specialite,
        value: s.specialite
    }));


        
    const filteredSpecialites_ = classe
        ? specialites.filter((s) => s.classe === classe)
        : specialites;

    const filteredSpecialitesOptions_ = filteredSpecialites_.map(s => ({
        label: s.specialite,
        value: s.specialite
    }));

    useEffect(() => {
        const fetchDispo = async () => {
            if (formik.values.level && formik.values.specialite) {
                try {
                    const ok = await CandidatureService.getDispoCGS(
                        formik.values.specialite,
                        formik.values.level,
                        prog?.edition,
                        user?.acteur?.etablissement?.code
                    );
                    console.log("OK", ok);
                    setReste(ok);
                } catch (error) {
                    console.error("Erreur fetch dispo:", error);
                }
            }
        };

        fetchDispo();  // on appelle la fonction async
    }, [formik.values.level, formik.values.specialite, user, prog]);


    const getAvailableClasseOptions = (level: string) => {
        switch (level) {
            case "PREMIERE":
            return classeOptions.filter(
                (opt) => opt.value === "Troisième" || opt.value === "Seconde"
            );
            case "TERMINALE":
            return classeOptions.filter(
                (opt) => opt.value === "Seconde" || opt.value === "Première"
            );
            default:
            return classeOptions; // si rien choisi → tout afficher
        }
    };

    const availableClasseOptions = getAvailableClasseOptions(formik.values.level);

    const classe0Options = availableClasseOptions.filter(
    (opt) => opt.value !== formik.values.classe_1
    );

    const classe1Options = availableClasseOptions.filter(
    (opt) => opt.value !== formik.values.classe_0
    );


    const handleSerieChange = useFormikLocalStorageDefault(formik, 'serie');


    // Fonction pour empêcher la saisie d'espaces en début de champ
    const preventLeadingSpace = (e) => {
        if (e.target.value === '' && e.key === ' ') {
            e.preventDefault();
        }
    };

    // Fonction pour trimmer automatiquement à la perte de focus
    const handleTrimBlur = (fieldName) => (e) => {
        const value = e.target.value;
        if (value && value.trim() !== value) {
            formik.setFieldValue(fieldName, value.trim());
        }
        formik.handleBlur(e);
    };


    const handleChangeAnneeNumPiece = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
        formik.setFieldValue('year_registry_num', value);
    };

    // Dans ton composant
    const handleBlurYear = (e) => {
        formik.handleBlur(e); // garde la gestion de Formik

        const year = parseInt(e.target.value, 10);
        if (!isNaN(year) && year > 0) {
            const currentYear = new Date().getFullYear();
            const age = currentYear - year;
            setAge1(age); // ou formik.setFieldValue('age', age)
        } else {
            setAge1(null);
        }
    };

    const handleBlurDateNaissance = (e) => {
        formik.handleBlur(e);
        const dateStr = e.target.value;
        if (dateStr) {
            const [day, month, year] = dateStr.split('/').map(Number);

            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                const currentYear = new Date().getFullYear();
                const age = currentYear - year;
                const today = new Date();
                const birthDate = new Date(year, month - 1, day);
                let realAge = age;
                if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
                    realAge--;
                }

                setAge2(realAge);
            } else {
                setAge2(null);
            }
        } else {
            setAge2(null);
        }
    };

    useEffect(() => {
        if (age1 !== null && age2 !== null) {
            if (age1 > age2) {
                setAgeDialog(true);
            } else {
                setAgeDialog(false);
            }
        }
    }, [age1, age2]);


    const carouselItems = [
        <div key="step1">
            <h5 className="text-primary mt-2">
                Données du dossier de candidature.
                {formik.values.specialite && (
                                     <span
                                            style={{
                                                backgroundColor: "SpringGreen",
                                                borderRadius: "5px",
                                                color: "black",
                                                fontWeight: "bold",
                                                marginLeft: "5px",
                                                fontSize: "12px",
                                                padding : "4px"
                                                
                                            }}
                                            >
                            Il vous reste {10-reste} candidat (s) à inscrire pour la spécialité {formik.values.specialite} en classe de {formik.values.level}
                        </span>
                )}

                
            </h5>
            

            <div className="formgrid grid">
                <div className="field col-12">
                    <div className="formgrid grid mt-1">
                                    <div className="field col-2">
                                        <label htmlFor="quantity">
                                            <b><span className="text-red-600">*</span> Classe en Mai {prog?.edition}</b>
                                        </label>
                                        <Dropdown
                                            showClear
                                            id="matiere1"
                                            name="matiere1"
                                            value={formik.values.level}
                                            onChange={(e) => formik.setFieldValue('level', e.value)}
                                            options={classeOptions_}
                                            optionLabel="label"
                                            placeholder="Choisir une classe"
                                            className={`p-inputtext-sm w-full ${formik.touched.level && formik.errors.level ? 'p-invalid' : ''}`}
                           
                                            style={{
                                                fontWeight: 'bold',
                                                color: 'black'
                                            }}
                                            filter
                                        />
                                        {formik.touched.level && typeof formik.errors.level === 'string' && <small className="p-error">{formik.errors.level}</small>}
                                    </div>

                                    {(formik.values.level === 'TERMINALE' && !is_update.current) && (
                                        <div className="field col-2">
                        <label htmlFor="price">
                            <b>
                                <span className="text-red-600">*</span> N° de dossier au BAC {prog?.edition}
                            </b>
                        </label>
                        <InputText
                            placeholder="Saisir le N° de dossier"
                            style={{
                                fontWeight: 'bold',
                                color: 'black'
                            }}
                            disabled={locked}
                            id="dos_number"
                            name="dos_number"
                            autoComplete="off"
                            value={formik.values.dos_number}
                            onChange={(e) => formik.setFieldValue('dos_number', e.target.value)}
                            onBlur={handleTrimBlur('dos_number')}
                            onKeyPress={preventLeadingSpace}
                            className={`p-inputtext-sm w-full ${formik.touched.dos_number && formik.errors.dos_number ? 'p-invalid' : ''}`}
                        />
                        {formik.touched.dos_number && typeof formik.errors.dos_number === 'string' && <small className="p-error">{formik.errors.dos_number}</small>}
                                    </div>
                                    )}
                                    
                                    <div className='field col-3'>
                                                                
                                                                    <label htmlFor="sujet">
                                                                        <b><span className="text-red-600">*</span> Choix de la discipline</b>
                                                                    </label>
                                                                    <Dropdown
                                                                        showClear
                                                                        id="specialite"
                                                                        name="specialite"
                                                                        value={formik.values.specialite}
                                                                        style={{
                                                                            fontWeight: 'bold',
                                                                            color: 'black'
                                                                        }}
                                                                        optionLabel="label"
                                                                        options={filteredSpecialitesOptions}
                                                                        onChange={(e) => formik.setFieldValue('specialite', e.value)}
                                                           
                                                                        placeholder="Liste des disciplines"
                                                                        className={`p-inputtext-sm w-full ${formik.touched.specialite && formik.errors.specialite ? 'p-invalid' : ''}`}
                                                                        />
                                                                        {formik.touched.specialite && typeof formik.errors.specialite === 'string' && <small className="p-error">{formik.errors.specialite}</small>}
                                                                    
                                    </div>

                                    <div className="field col-3">
                                        <label htmlFor="quantity">
                                            <b>
                                                <span className="text-red-600">*</span> Moyenne de l&apos;élève dans la discipline
                                            </b>
                                        </label>
                                        <InputText
                                            placeholder="Saisir la moyenne obtenue dans la discipline"
                                            value={formik.values.note_student_disc}
                                            autoComplete="off"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            style={{
                                                fontWeight: 'bold',
                                                color: 'black'
                                            }}
                                            id="note_student_disc"
                                            name="note_student_disc"
                                            className={`p-inputtext-sm w-full ${formik.touched.note_student_disc && formik.errors.note_student_disc ? 'p-invalid' : ''}`}
                                        />
                                        {formik.touched.note_student_disc && typeof formik.errors.note_student_disc === 'string' && <small className="p-error">{formik.errors.note_student_disc}</small>}
                                    </div>
                                    
                                    
                        <div className="field col-2">
                             <label>
                                <b>
                                    <span className="text-red-600">*</span> Série
                                </b>
                            </label>
                            <Dropdown
                                showClear
                                disabled = {baseMorte}
                                id="serie"
                                name="serie"
                                value={formik.values.serie}
                                style={{
                                    fontWeight: 'bold',
                                    color: 'black'
                                }}
                                onChange={(e) => formik.setFieldValue('serie', e.value)}
                                options={series}
                                optionLabel="code" // adapter si ton objet contient un champ "libelle"
                                placeholder="Sélectionner une série"
                                virtualScrollerOptions={{ itemSize: 30 }}
                                filter
                                className={`p-inputtext-sm w-full ${formik.touched.serie && formik.errors.serie ? 'p-invalid' : ''}`}
                            />
                            {formik.touched.serie && typeof formik.errors.serie === 'string' && <small className="p-error">{formik.errors.serie}</small>}
                        </div>
                    </div>
                    

                    {/* Inputs conditionnels si le candidat a déjà fait le bac */}
                    
                </div>

            </div>

            <fieldset className="px-1 py-1 custom-fieldset text-sm">
                <legend className="font-bold text-sm">Informations personnelles</legend>
                <div className="formgrid grid">
                   
                    <div className="field col-4">
                        <label htmlFor="price">
                            <b>
                                <span className="text-red-600">*</span> Prénom (s)
                            </b>
                        </label>
                        <InputText
                            disabled = {baseMorte}
                            placeholder="Saisir le prénom (s)"
                            style={{
                                fontWeight: 'bold',
                                color: 'black'
                            }}
                            id="firstname"
                            name="firstname"
                            autoComplete="off"
                            value={formik.values.firstname}
                            onChange={(e) => formik.setFieldValue('firstname', e.target.value.toUpperCase())}
                            onBlur={handleTrimBlur('firstname')}
                            onKeyPress={preventLeadingSpace}
                            className={`p-inputtext-sm w-full ${formik.touched.firstname && formik.errors.firstname ? 'p-invalid' : ''}`}
                        />
                        {formik.touched.firstname && typeof formik.errors.firstname === 'string' && <small className="p-error">{formik.errors.firstname}</small>}
                    </div>

                    <div className="field col-2">
                        <label htmlFor="quantity">
                            <b>
                                <span className="text-red-600">*</span> Nom
                            </b>
                        </label>
                        <InputText
                            disabled = {baseMorte}
                            placeholder="Saisir le nom"
                            value={formik.values.lastname}
                            style={{
                                fontWeight: 'bold',
                                color: 'black'
                            }}
                            id="lastname"
                            name="lastname"
                            autoComplete="off"
                            onChange={(e) => formik.setFieldValue('lastname', e.target.value.toUpperCase())}
                            onBlur={handleTrimBlur('lastname')}
                            onKeyPress={preventLeadingSpace}
                            className={`p-inputtext-sm w-full ${formik.touched.lastname && formik.errors.lastname ? 'p-invalid' : ''}`}
                        />
                        {formik.touched.lastname && typeof formik.errors.lastname === 'string' && <small className="p-error">{formik.errors.lastname}</small>}
                    </div>
                    <div className="field col-1">
                        <label htmlFor="price">
                            <b>
                                <span className="text-red-600">*</span> Date de naiss.
                            </b>
                        </label>
                        <InputMask
                            disabled = {baseMorte}
                            id="date_birth"
                            name="date_birth"
                            style={{
                                fontWeight: 'bold',
                                color: 'black'
                            }}
                            value={formik.values.date_birth}
                            onChange={handleChangeDateNaiss}
                            autoComplete="off"
                            mask="99/99/9999"
                            placeholder="JJ/MM/AAAA"
                            className={`p-inputtext-sm w-full ${formik.touched.date_birth && formik.errors.date_birth ? 'p-invalid' : ''}`}
                        />

                        {formik.touched.date_birth && typeof formik.errors.date_birth === 'string' && <small className="p-error">{formik.errors.date_birth}</small>}
                    </div>
                    <div className="field col-2">
                        <label htmlFor="price">
                            <b>
                                <span className="text-red-600">*</span> Lieu de naissance
                            </b>
                        </label>
                        <InputText
                            disabled = {baseMorte}
                            placeholder="Saisir le lieu de naissance"
                            style={{
                                fontWeight: 'bold',
                                color: 'black'
                            }}
                            id="place_birth"
                            name="place_birth"
                            autoComplete="off"
                            value={formik.values.place_birth}
                            onChange={(e) => formik.setFieldValue('place_birth', e.target.value.toUpperCase())}
                            onBlur={handleTrimBlur('place_birth')}
                            onKeyPress={preventLeadingSpace}
                            className={`p-inputtext-sm w-full ${formik.touched.place_birth && formik.errors.place_birth ? 'p-invalid' : ''}`}
                        />
                        {formik.touched.place_birth && typeof formik.errors.place_birth === 'string' && <small className="p-error">{formik.errors.place_birth}</small>}
                    </div>
                    <div className="field col-1">
                        <label htmlFor="quantity">
                            <b>
                                <span className="text-red-600">*</span> Sexe
                            </b>
                        </label>

                        <Dropdown
                            disabled = {baseMorte}
                            id="gender"
                            name="gender"
                            style={{
                                fontWeight: 'bold',
                                color: 'black'
                            }}
                            value={formik.values.gender}
                            onChange={(e) => formik.setFieldValue('gender', e.value)}
                            options={sexeOptions}
                            // optionLabel="code" // adapter si ton objet contient un champ "libelle"
                            placeholder="Sélectionner le sexe"
                            className={`p-inputtext-sm w-full ${formik.touched.gender && formik.errors.gender ? 'p-invalid' : ''}`}
                        />
                        {formik.touched.gender && typeof formik.errors.gender === 'string' && <small className="p-error">{formik.errors.gender}</small>}
                    </div>
                    <div className="field col-2">
                                            <label htmlFor="phone">
                                                <b>
                                                    <span className="text-red-600">*</span> Téléphone
                                                </b>
                                            </label>
                                            <InputText
                                                disabled = {baseMorte}
                                                id="phone"
                                                name="phone"
                                                placeholder="XX XXX XX XX"
                                                value={formik.values.phone}
                                                autoComplete="off"
                                                onChange={handlePhoneChange}
                                                onBlur={formik.handleBlur}
                                                className={`p-inputtext-sm w-full ${formik.touched.phone && formik.errors.phone ? 'p-invalid' : ''}`}
                                                style={{ fontWeight: 'bold', color: 'black' }}
                                            />
                                            {formik.touched.phone && typeof formik.errors.phone === 'string' && <small className="p-error">{formik.errors.phone}</small>}
                                        </div>
                </div>

            </fieldset>

            <div className="formgrid grid">
                <div className="field col-4">
                    
                            <fieldset className="mt-2 px-3 py-1 custom-fieldset text-sm">
                                <legend className="font-bold text-sm">Parcours du candidat</legend>
                                <div className="formgrid grid">
                                    <div className="field col-6">
                                        <label htmlFor="quantity">
                                            <b><span className="text-red-600">*</span> Classe en Mai {prog?.edition - 2}</b>
                                        </label>
                                        <Dropdown
                                            showClear
                                            id="classe0"
                                            name="classe_0"
                                            value={formik.values.classe_0}
                                            onChange={(e) => formik.setFieldValue('classe_0', e.value)}
                                            options={classe0Options}
                                            optionLabel="label"
                                            placeholder="Sélectionner la classe"
                                            style={{
                                                fontWeight: 'bold',
                                                color: 'black'
                                            }}
                                            filter
                                        className={`w-full p-inputtext-sm w-full ${formik.touched.classe_0 && formik.errors.classe_0 ? 'p-invalid' : ''}`}
                                        />
                                        {formik.touched.classe_0 && typeof formik.errors.classe_0 === 'string' && <small className="p-error">{formik.errors.classe_0}</small>}
                                    
                                    </div>

                                     <div className="field col-6">
                                        <label htmlFor="quantity">
                                            <b><span className="text-red-600">*</span> Classe en Mai {prog?.edition - 1}</b>
                                        </label>
                                        <Dropdown
                                            showClear
                                            id="classe1"
                                            name="classe_1"
                                            value={formik.values.classe_1}
                                            onChange={(e) => formik.setFieldValue('classe_1', e.value)}
                                            options={classe1Options}
                                            optionLabel="label"
                                            placeholder="Sélectionner la classe"
                                            style={{
                                                fontWeight: 'bold',
                                                color: 'black'
                                            }}
                                            filter
                                            className={`w-full p-inputtext-sm w-full ${formik.touched.classe_1 && formik.errors.classe_1 ? 'p-invalid' : ''}`}
                                        />
                                        {formik.touched.classe_1 && typeof formik.errors.classe_1 === 'string' && <small className="p-error">{formik.errors.classe_1}</small>}
                                    
                                    </div>

                                    

                                    
                                </div>
                            </fieldset>
                        </div>

                <div className="col-8">
                    <fieldset className="mt-2 px-3 py-1 custom-fieldset text-sm">
                        <legend className="font-bold text-sm ">Enseignant ({formik.values.specialite}) en Mai {prog?.edition}</legend>
                        <div className="formgrid grid">
                            <div className="field col-5">
                                        <label htmlFor="quantity">
                                            <b>
                                                <span className="text-red-600">*</span> Prénom (s)
                                            </b>
                                        </label>
                                        <InputText
                                            placeholder="Saisir le prénom (s)"
                                            value={formik.values.firstname_prof}
                                            autoComplete="off"
                                            style={{
                                                fontWeight: 'bold',
                                                color: 'black'
                                            }}
                                            id="firstname_prof"
                                            name="firstname_prof"
                                            onChange={(e) => formik.setFieldValue('firstname_prof', e.target.value.toUpperCase())}
                                            onBlur={handleTrimBlur('firstname_prof')}
                                            onKeyPress={preventLeadingSpace}
                                            className={`p-inputtext-sm w-full ${formik.touched.firstname_prof && formik.errors.firstname_prof ? 'p-invalid' : ''}`}
                                        />
                                        {formik.touched.firstname_prof && typeof formik.errors.firstname_prof === 'string' && <small className="p-error">{formik.errors.firstname_prof}</small>}
                                    </div>

                                    <div className="field col-3">
                                        <label htmlFor="quantity">
                                            <b>
                                                <span className="text-red-600">*</span> Nom
                                            </b>
                                        </label>
                                        <InputText
                                            placeholder="Saisir le nom"
                                            autoComplete="off"
                                            value={formik.values.lastname_prof}
                                            style={{
                                                fontWeight: 'bold',
                                                color: 'black'
                                            }}
                                            id="lastname_prof"
                                            name="lastname_prof"
                                            onChange={(e) => formik.setFieldValue('lastname_prof', e.target.value.toUpperCase())}
                                            onBlur={handleTrimBlur('lastname_prof')}
                                            onKeyPress={preventLeadingSpace}
                                            className={`p-inputtext-sm w-full ${formik.touched.lastname_prof && formik.errors.lastname_prof ? 'p-invalid' : ''}`}
                                        />
                                        {formik.touched.lastname_prof && typeof formik.errors.lastname_prof === 'string' && <small className="p-error">{formik.errors.lastname_prof}</small>}
                                    </div>
                                    <div className="field col-4">
                                        <label htmlFor="quantity">
                                            <b>
                                                <span className="text-red-600">*</span> Moyenne de la classe dans la discipline
                                            </b>
                                        </label>
                                        <InputText
                                            placeholder="Saisir la moyenne de la classe dans la discipline"
                                            value={formik.values.note_classe_disc}
                                            autoComplete="off"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            style={{
                                                fontWeight: 'bold',
                                                color: 'black'
                                            }}
                                            id="note_classe_disc"
                                            name="note_classe_disc"
                                            className={`p-inputtext-sm w-full ${formik.touched.note_classe_disc && formik.errors.note_classe_disc ? 'p-invalid' : ''}`}
                                        />
                                        {formik.touched.note_classe_disc && typeof formik.errors.note_classe_disc === 'string' && <small className="p-error">{formik.errors.note_classe_disc}</small>}
                                    </div>

                                    
                        </div>
                    </fieldset>
                </div>
            </div>

            <div className="formgrid grid">
                <div className="field col-6">

                </div>
                <div className="field col-2">
                
                </div>
                <div className="field col-4">
                    <Button icon={isSaving ? 'pi pi-spin pi-spinner' : 'pi pi-save'} label={isSaving ? 'Enregistrement...' : 'Enregistrer le dossier de candidature'} className="mr-2 mt-4" type="submit" disabled={isSaving} />
                </div>

                <div className="field col-4"></div>
            </div>
        </div>
    ];

    const carouselResponsiveOptions = [
        {
            breakpoint: '1024px',
            numVisible: 3,
            numScroll: 3
        },
        {
            breakpoint: '768px',
            numVisible: 2,
            numScroll: 2
        },
        {
            breakpoint: '560px',
            numVisible: 1,
            numScroll: 1
        }
    ];

    const carouselResponsiveOptions_ = [
        {
            breakpoint: '560px',
            numVisible: 1,
            numScroll: 1
        }
    ];

    const itemTemplate = (item) => {
        return <div>{item}</div>;
    };

    
    const formatDateForMask = (dateString?: string) => {
        if (!dateString) return '';
        // On s'attend à "1994-12-09"
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`; // -> "09/12/1994"
    };

    return (
        <ProtectedRoute allowedRoles={['AGENT_DE_SAISIE', 'CHEF_ETABLISSEMENT']}>
            <div className="grid crud-demo">
                <div className="col-12">
                    <div className="card">
                        <Toast ref={toast} />
                        <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

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
                            <h5>Enrôlement des candidats au Concours Général Sénégalais édition {prog?.edition}</h5>
                            {groupedCdts && Object.keys(groupedCdts).length > 0 && (
                                <TabView>
                                    {groupedCdts.map(({ level, cdts }) => (
                                        <TabPanel key={level} header={level}>
                                            <DataTable
                                                ref={dt}
                                                value={Array.isArray(cdts) ? cdts : []} // force tableau
                                                paginator
                                                rows={10}
                                                rowsPerPageOptions={[5, 10, 25]}
                                                className="p-datatable-sm"
                                                currentPageReportTemplate="Affichage de {first} à {last} des {totalRecords} enregistrement (s)"
                                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                                globalFilter={globalFilter}
                                                emptyMessage="Aucun candidat n'a été trouvé"
                                                header={header}
                                            >
                                                <Column field="firstname" header="Prénom (s)" sortable body={fNBodyTemplate} headerStyle={{ minWidth: '15rem' }} />
                                                <Column field="lastname" header="Nom" body={lNBodyTemplate} sortable headerStyle={{ minWidth: '10rem' }} />
                                                <Column
                                                    field="date_birth"
                                                    header="Date Naiss."
                                                    sortable
                                                    headerStyle={{ minWidth: '10rem' }}
                                                    body={(rowData) => {
                                                        const date = new Date(rowData.date_birth);
                                                        const day = String(date.getDate()).padStart(2, '0');
                                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                                        const year = date.getFullYear();
                                                        return `${day}/${month}/${year}`;
                                                    }}
                                                />
                                                <Column field="gender" header="Sexe" body={serieBodyTemplate} sortable headerStyle={{ minWidth: '5rem' }} />
                                                <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} />
                                            </DataTable>
                                        </TabPanel>
                                    ))}
                                </TabView>
                            )}
                        </div>

                        {/* <DataTable
                        ref={dt}
                        value={candidats}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="p-datatable-sm"
                        currentPageReportTemplate="Affichage de {first} à {last} des {totalRecords} enregistrement (s)"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        globalFilter={globalFilter}
                        emptyMessage="Aucun candidat n'a été trouvée"
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column field="dos_number" header="N° dossier" sortable body={dNBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="firstname" header="Prénom (s)" sortable body={fNBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="lastname" header="Nom" body={lNBodyTemplate} sortable></Column>
                        <Column field="date_birth" header="Date Naiss." sortable headerStyle={{ minWidth: '10rem' }}
                            body={(rowData) => {
                                const date = new Date(rowData.date_birth);
                                const day = String(date.getDate()).padStart(2, '0');
                                const month = String(date.getMonth() + 1).padStart(2, '0'); // Mois commence à 0
                                const year = date.getFullYear();
                                return `${day}/${month}/${year}`;
                            }}
                        />
                        <Column field="place_birth" header="Lieu Naiss." sortable></Column>
                        <Column field="serie" header="Serie" body={serieBodyTemplate} sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable> */}

                        <Dialog visible={productDialog} style={{ width: '95%' }} header="Fiche d'un candidat" modal className="p-fluid" onHide={hideDialog} contentStyle={{ height: '75vh', display: 'flex', flexDirection: 'column' }}>
                            {/* {product.image && <img src={`/demo/images/product/${product.image}`} alt={product.image} width="150" className="mt-0 mx-auto mb-5 block shadow-2" />} */}

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    console.log('Formik errors:', formik.errors);
                                    formik.handleSubmit(e);
                                }}
                                className="p-1"
                                style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'auto' }}
                            >
                                <Carousel
                                    style={{ flex: 1 }}
                                    value={carouselItems}
                                    itemTemplate={(item) => <div>{item}</div>}
                                    numVisible={1}
                                    numScroll={1}
                                    showNavigators={false}
                                    showIndicators={false}
                                    responsiveOptions={carouselResponsiveOptions_}
                                />
                            </form>
                        </Dialog>

                        <Dialog visible={modifCandDialog} style={{ width: '95%' }} header="Modifier la fiche d'un candidat" modal className="p-fluid" onHide={hideDialog} contentStyle={{ height: '75vh', display: 'flex', flexDirection: 'column' }}>
                            {/* {product.image && <img src={`/demo/images/product/${product.image}`} alt={product.image} width="150" className="mt-0 mx-auto mb-5 block shadow-2" />} */}

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    console.log('Formik errors:', formik.errors);
                                    formik.handleSubmit(e);
                                }}
                                className="p-1"
                                style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'auto' }}
                            >
                                <Carousel
                                    style={{ flex: 1 }}
                                    value={carouselItems}
                                    itemTemplate={(item) => <div>{item}</div>}
                                    numVisible={1}
                                    numScroll={1}
                                    showNavigators={false}
                                    showIndicators={false}
                                    responsiveOptions={carouselResponsiveOptions}
                                />
                            </form>
                        </Dialog>

                        <Dialog visible={deleteProductDialog} style={{ width: '600px' }} header="Renseignements du candidat" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
                            <div className="flex align-items-center">
                                    <span>
                                        Prénom(s) : <b>{baseMorte?.firstname?.toUpperCase()}</b>
                                        <br />
                                        Nom : <b>{baseMorte?.lastname?.toUpperCase()}</b>
                                        <br />
                                        Date de naissance : <b>{baseMorte?.date_birth}</b>
                                        <br />
                                        Lieu de naissance : <b>{baseMorte?.place_birth}</b>
                                        <br />
                                        Sexe : <b>{baseMorte?.gender}</b>
                                        <br />
                                        Série : <b>{baseMorte?.serie?.code}</b>
                                        <br />
                                        Téléphone : <b>{baseMorte?.phone1}</b>
                                        <br />
                                        <b>Voulez vous précharger ces données ?</b>
                                    </span>
                            </div>
                        </Dialog>

                        <Dialog visible={deleteProductsDialog} style={{ width: '700px' }} header="Avertissement sur fraude à l'état civil" modal footer={deleteProductsDialogFooter} onHide={hideDeleteProductsDialog}>
                            <div className="flex align-items-center justify-content-center">
                                <i className="pi pi-exclamation-triangle" style={{ fontSize: '2rem' }} />
                                    <span>
                                        Ce candidat ne pourra pas être proposé car il a dépassé la limite d&apos;âge.
                                    </span>
                            </div>
                        </Dialog>

                      

                        <Dialog visible={deleteDialog} style={{ width: '500px' }} header="Avertissement pour suppression" modal footer={deleteDialogFooter} onHide={hideDeleteProductDialog_}>
                            <div className="flex align-items-center justify-content-center">
                                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                                <span>Attention vous vous appretez à supprimer le dossier du candidat <br/> <b>{candidat?.firstname} {candidat?.lastname}</b></span>
                            </div>
                        </Dialog>


                        <Dialog visible={printDialog} style={{ width: '400px' }} header="Impression de liste" modal onHide={hideDeleteProductDialog__}>
                                                    <div className="flex align-items-center">
                                                    
                                                        <form onSubmit={handleSubmit2} className="p-1" style={{ width: '100%', maxWidth: '640px' }}>
                                                                                    <div className="p-fluid">
                                                                                        <div className="grid">
                                                                                            <div className="col-12 py-3">
                                                                                                <label htmlFor="spec_id">
                                                                                                    <span className="text-red-500">*</span> Sélectionner la classe :
                                                                                                </label>
                                                                                                <Dropdown
                                                                                                    showClear
                                                                                                    id="matiere1"
                                                                                                    name="matiere1"
                                                                                                    value={classe}
                                                                                                    onChange={(e) => setClasse(e.value)}
                                                                                                    options={classeOptions_}
                                                                                                    optionLabel="label"
                                                                                                    placeholder="Choisir une classe"
                                                                                                    className="p-inputtext-sm w-full"
                                                                                                    style={{
                                                                                                        fontWeight: 'bold',
                                                                                                        color: 'black'
                                                                                                    }}
                                                                                                    filter
                                                                                                />
                                                                                                {errors.level && <small className="p-error">{errors.level}</small>}
                                                                                            </div>
                        
                                                                                            <div className="col-12 py-3">
                                                                                                <label htmlFor="spec_id">
                                                                                                    <span className="text-red-500">*</span> Sélectionner la spécialité :
                                                                                                </label>
                                                                                                <Dropdown
                                                                                                    showClear
                                                                                                    id="specialite"
                                                                                                    value={spec}
                                                                                                    optionLabel="label"
                                                                                                    options={filteredSpecialitesOptions_}
                                                                                                    onChange={(e) => setSpec(e.value)}
                                                                                                    style={{
                                                                                                        fontWeight: 'bold',
                                                                                                        color: 'black'
                                                                                                    }}
                                                                                                    placeholder="Liste des spécialités"
                                                                                                    className="p-inputtext-sm w-full"
                                                                                                />
                                                                                                {errors.specialite && <small className="p-error">{errors.specialite}</small>}
                                                                                            </div>
                                                                                        </div>
                                                        
                                                                                        
                                                                                        <div className="grid">
                                                                                            <div className="field col-12 py-3">
                                                                                                <div>
                                    
                                                                                                        <DownloadPDFButton etablissementId={user?.acteur?.etablissement?.id} etablissementName={user?.acteur?.etablissement?.name} session={prog?.edition} spec={spec} level={classe} />                                                                        
                                                                                                    </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </form>
                                                        
                                                    </div>
                                                </Dialog>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default Crud;

function async(year_registry_num: string, registry_num: string, name: any, edition: number) {
    throw new Error('Function not implemented.');
}
