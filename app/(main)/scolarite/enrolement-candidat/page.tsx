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
import { CandidatDTO, CandidatureService } from '@/demo/service/CandidatureService';
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
import { Tooltip } from 'primereact/tooltip';
import { FaUserEdit } from 'react-icons/fa';
import { RiDeleteBin5Line } from 'react-icons/ri';
import './style.css';
import { MdDelete } from 'react-icons/md';
import { ProgressSpinner } from 'primereact/progressspinner';

const Crud = () => {
    const { user } = useContext(UserContext);

    var is_update = useRef(false);
    var id_cdt = useRef(null);

    var alreadyBac = useRef(false);

    const [age, setAge] = useState(null);

    const calculateAge = (dateString: string): number | null => {
        if (!dateString) return null;

        const parts = dateString.split('/');
        if (parts.length !== 3) return null;
        const [day, month, year] = parts;
        const isoDate = `${year}-${month}-${day}`;

        const birthDate = new Date(isoDate);
        if (isNaN(birthDate.getTime())) return null;

        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };




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
    const [deleteProductsDialog1, setDeleteProductsDialog1] = useState(false);
    const [deleteProductsDialog2, setDeleteProductsDialog2] = useState(false);
    const [printDialog, setPrintDialog] = useState(false);

    const [getResultDialog, setGetResultDialog] = useState(false);

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
    const [cexam, setCentreExam] = useState(null);
    const [pays, setPays] = useState(null);
    const [baseMorte, setBaseMorte] = useState(null);
    const [faeb, setFaebs] = useState(null);
    const [matieres, setMatiereOptions] = useState([]);
    const [prog, setOneProg] = useState<{ edition?: number; bfem_IfEPI?: number; bfem_IfI?: number ; date_end?: string } | null>(null);
    const [candidats, setCandidatData] = useState([]);
    const [candidat, setCandidat] = useState(null);
    const [reloadTrigger, setReloadTrigger] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [locked, setLocked] = useState(false);
    const [lockedAlreadyBac, setLockedAlreadyBac] = useState(false);
    const [lockedButton, setLockedButton] = useState(false);

    const [age1, setAge1] = useState(null);
    const [age2, setAge2] = useState(null);

    const [isValid, setIsValid] = useState(false);

    const [listeSerie, setListeSerie] = useState([]);

    const [groupedCdts, setGroupedCdts] = useState([]);
    
    const [selectedSerie, setSelectedSerie] = useState(null);

    const [selectedCT, setSelectedCT] = useState(null);

    const [selectedTL, setSelectedTL] = useState(null);
    
    const [errors, setErrors] = useState({ serie: "", cle: "" });


    let diffDays: number | null = null;
    if (prog?.date_end) 
    {
        const today = new Date().getTime();
        const endDate = new Date(prog.date_end).getTime();
        diffDays = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));
    }
    console.log(Number(diffDays));


    useEffect(() => {
        CandidatureService.getLastProg().then((response) => {
            //console.log("📦 Séries chargées :", data);
            setOneProg(response);
        });
    }, []);


    useEffect(() => {
        if (user?.acteur?.etablissement?.id && Number(prog?.edition)) {
            fetchData();
        }
    }, [reloadTrigger, user, prog]);

    useEffect(() => {
        if (selectedTL == 'officiel') 
            {
            setSelectedCT('lastname');
            }
    }, []);

    const fetchData = async () => {
        try {
            const data = await CandidatureService.getCdtsBySerie(user?.acteur?.etablissement?.id, Number(prog?.edition));

            // Vérifie que data est bien un objet
            if (data && typeof data === 'object') {
                const result = Object.entries(data).map(([serieName, cdts]) => ({
                    serieName,
                    cdts
                }));
                console.log('OHHH :', result);
                setGroupedCdts(result);
                const seriesNames = Object.keys(data || {});
                const dropdownOptions = [
                    { label: 'Toutes les séries', value: 'all' },
                    ...seriesNames.map((serie) => ({
                        label: serie,
                        value: serie
                    }))
                ];

                setListeSerie(dropdownOptions);
                console.log(dropdownOptions);
            } 
            else 
            {
                console.warn('Données inattendues :', data);
                setGroupedCdts([]); // fallback sécurité
            }
        } catch (error) {
            console.error('Erreur lors du chargement des séries :', error);
            setGroupedCdts([]);
        }
    };

    useEffect(() => {
        const storedSerie = localStorage.getItem('serie');
        if (storedSerie) {
            try {
                const parsedSerie = JSON.parse(storedSerie);
                formik.setFieldValue('serie', parsedSerie);
                handleSerieChange(parsedSerie);
            } catch (err) {
                console.error('Erreur parsing série locale :', err);
            }
        }
    }, []);

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
        CandidatureService.getCentreExamen().then((response) => {
            setCentreExam(response);
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
            setNbrTCdts(response.length);
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

    const [nbrTCdts, setNbrTCdts] = useState(null);


    console.log(faeb);

    const origineOptions = [
        { label: 'National', value: 'National' },
        { label: 'Etranger', value: 'Etranger' }
    ];

    const sexeOptions = [
        { label: 'M', value: 'M' },
        { label: 'F', value: 'F' }
    ];

    const handicapOptions = [
        { label: 'Aucun', value: 'Néant' },
        { label: 'Aveugle', value: 'Aveugle' },
        { label: 'Mal Entendant', value: 'Mal Entendant' },
        { label: 'Mal Voyant', value: 'Mal Voyant' },
        { label: 'Sourd-Muet', value: 'Sourd-Muet' },
        { label: 'Moteur', value: 'Moteur' }
    ];

    const epsOptions = [
        { label: 'Apte', value: 'Apte' },
        { label: 'Inapte', value: 'Inapte' }
    ];

    const efOptions = [
        { label: 'Dessin', value: 'Dessin' },
        { label: 'Couture', value: 'Couture' },
        { label: 'Musique', value: 'Musique' }
    ];

    const cleDeTrie = [
        { label: 'Ordre Alphabétique', value: 'lastname' },
        { label: 'Numéro de dossier', value: 'dosNumber' }
    ];

    
    const typeListe = [
        { label: 'Provisoire', value: 'notOfficiel' },
        // { label: 'Définitive', value: 'officiel' },
        { label: 'Liste des contacts', value: 'callList' }
    ];


    const countryOptionTemplate = (country) => {
        if (!country) return "Selectionner un pays";
        return (
            <div className="country-item">
                <img alt={country?.code} src={`https://flagcdn.com/16x12/${country?.code.toLowerCase()}.png`} className="mr-2" />
                <span>{country?.name}</span>
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
            // met à jour Formik
            formik.setFieldValue('date_birth', value);
            formik.setFieldError('date_birth', '');

            // 🔹 calcule l'âge directement à partir de la valeur saisie
            const newAge = calculateAge(value);
            setAge(newAge);
        } else {
            formik.setFieldError('date_birth', 'Date invalide');
            setAge(null);
        }
    };


    const getAvailableOptions = (code, order, exclude1, exclude2, exclude3) =>
        matieres.filter((m) => {
            return m.order == order && m.serie.code === code && m.name !== exclude1 && m.name !== exclude2 && m.name !== exclude3;
        });

    const getAvailableOptions2 = (code: string | undefined, order: number, exclude1?: string, exclude2?: string, exclude3?: string) => {
        if (!code) {
            return [];
        }

        console.log(exclude1, exclude2, exclude3)

        const allForSerie = matieres.filter((m) => m.serie.code === code);
        const seriesSansExclusion = series?.map(item => item.code);;

        const isSerieSansExclusion = seriesSansExclusion?.includes(code);
        if (isSerieSansExclusion) {
            const allForSerieX = matieres.filter((m) => m.serie.code !== code);
            const uniqueNames = new Set<string>();
            return allForSerieX.filter((m) => {
                const isExcluded = (m.matiere === 'SN' || m.name === 'ECONOMIE' || m.name === 'GENIE MECANIQUE' || m.name === 'GENIE ELECTRIQUE' || m.name === 'FRANCAIS');
                const isExcluded5 = (code === 'STEG' && (m.name === 'ANGLAIS' || m.name === 'ESPAGNOL'));
                const isExcluded6 = ((code === 'L1A' || code === 'S1A' || code === 'S2A' || code === 'LA' || code === 'L-AR' || code === 'S1AR' || code === 'S2AR') && (m.name === 'ARABE MODERNE' || m.name === 'ARABE CLASSIQUE'));
                const isExcluded7 = ((code === 'S1A' || code === 'S2A' || code === 'S1' || code === 'S2' || code === 'S3' || code === 'S4' || code === 'S5' || code === 'T1' || code === 'T2' || code === 'STIDD' || code === 'F6') && (m.name === 'ANGLAIS'));
                const isExcluded8 = ((code === 'L1A' || code === 'L1B') && (m.name === 'LATIN'));
                const isExcluded9 = (m.name == exclude1 || m.name == exclude2 || m.name == exclude3)

                if (!isExcluded && !isExcluded5 && !isExcluded6 && !isExcluded7 && !isExcluded8 && !isExcluded9 && !uniqueNames.has(m.name)) {
                    uniqueNames.add(m.name);
                    return true;
                }
                return false;
            });
        }

    
    };

    const formatCurrency = (value) => {
        return value.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
        });
    };

    const rowClass = (rowData) => {
        if (rowData.decision === 1) return 'accepted-row';
        if (rowData.decision === 2) return 'rejected-row';
        return '';
    };

    const openNew = () => {
        formik.resetForm();
        setAge(null);
        // setLocked(true);
        // setLockedAlreadyBac(false);
        setLockedButton(false);
        alreadyBac.current = false;

        const safeParse = (key) => {
            const value = localStorage.getItem(key);
            if (!value || value === 'undefined') return null;
            try {
                return JSON.parse(value);
            } catch (e) {
                console.warn(`Impossible de parser ${key} :`, value);
                return null;
            }
        };
        const storedSerie = safeParse('serie');
        const storedMatiere1 = safeParse('matiere1');
        const storedMatiere2 = safeParse('matiere2');
        const storedMatiere3 = safeParse('matiere3');

        formik.setValues({
            ...formik.initialValues,

            serie: storedSerie,
            matiere1: storedMatiere1,
            matiere2: storedMatiere2,
            matiere3: storedMatiere3,
            // Forcer handicap et EPS
            type_handicap: 'Néant',

            // Tout le reste repasse à vide
            dosNumber: '',
            firstname: '',
            lastname: '',
            date_birth: '',
            place_birth: '',
            nationality: null,
            countryBirth: null,
            phone1: '',
            email: '',
            eps: 'Apte',
            bac_do_count: '1',
            registry_num: '',
            year_registry_num: '',
            centreEtatCivil: null,
            codeCentre: '',
            origine_bfem: null,
            year_bfem: ''
        });

        setSubmitted(false);
        //setIsEditMode(false); // facultatif : flag pour différencier "ajouter" / "modifier"
        setProductDialog(true); // ou ton Dialog / Carousel

        console.log(candidats);
        console.log(candidats.length);
    };

    const hideDialog = () => {
        if (productDialog) 
            {
                setSubmitted(false);
                setProductDialog(false);
                formData.tableNum = '';
                formData.yearBac = '';
            }
        if (modifCandDialog) 
            {
                setSubmitted(false);
                setModifCandDialog(false);
            }
        formik.resetForm();
        setBaseMorte(null);
        setLocked(false);
        setLockedAlreadyBac(false);

    };

    const openPrint = () => {
        setPrintDialog(true);
    };

    const hideDeleteProductDialog_ = () => {
        setDeleteDialog(false);
    };

    const hideDeleteProductDialog = () => {
        setDeleteProductDialog(false);   
        setProductDialog(true);   
        // setBaseMorte(null);
        // setLoading(false);
        // setLocked(false);
        // setLockedButton(true);
        // setLockedAlreadyBac(true);
    };

    const hideDeleteProductDialog__ = () => {
        setPrintDialog(false);
    };

    const hideAgeDialog = () => {
        setAgeDialog(false);
    };

    const hideDeleteProductsDialog = () => {
        setDeleteProductsDialog(false);
        //setProductDialog(false);
    };

    const hideDeleteProductsDialog1 = () => {
        setDeleteProductsDialog1(false);
        //setProductDialog(false);
    };

    const hideDeleteProductsDialog2_ = () => {
        setDeleteProductsDialog2(false);
        //setProductDialog(false);
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
        setAge(0);
        is_update.current = true;
        setModifCandDialog(true);
        // setCandidat({ ...candidat });

        const candidatFormatted = {
            ...candidat,
            date_birth: candidat.date_birth ? formatDateToInput(candidat.date_birth) : '',
            matiere1: formatMatiere(candidat.matiere1),
            matiere2: formatMatiere(candidat.matiere2),
            matiere3: formatMatiere(candidat.matiere3),
            matiere4: formatMatiere(candidat.eprFacListB),
            codeCentre: candidat.centreEtatCivil?.code || ''
        };
        (id_cdt.current = candidat.id), console.log(id_cdt);
        formik.setValues(candidatFormatted);
        formik.setFieldValue('hasBac','no')
        console.log(formik.values);


        setAge(calculateAge(candidatFormatted.date_birth));

        // récupérer les rejets
        const rejets = candidat.rejets
            ? candidat.rejets.map((r) => ({
                  id: r.id,
                  name: r.name,
                  observation: r.observation
              }))
            : [];

        setRejets(rejets);
    };

    const handleSubmit2 = (e) => {
        e.preventDefault();

        let newErrors = { serie: "", cle: "" };
        setIsValid(true);

        if (!selectedSerie) {
            newErrors.serie = "Veuillez sélectionner une série.";
            setIsValid(false);
        }
        if (!selectedCT) {
            newErrors.cle = "Veuillez sélectionner une clé de tri.";
            setIsValid(false);
        }

        setErrors(newErrors);

        if (!isValid) return;
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
        console.log(baseMorte);
        setLockedButton(true);
        setLockedAlreadyBac(true);
        if ((baseMorte?.exclusionDuree === 0 || (baseMorte?.exclusionDuree + 1 + baseMorte?.exYearBac <= prog?.edition)))
        {
            setLocked(true);
            setLockedAlreadyBac(true);
            // Mise à jour des champs Formik
            formik.setFieldValue('firstname', baseMorte.firstname.toUpperCase() || '');
            formik.setFieldValue('lastname', baseMorte.lastname.toUpperCase() || '');
            formik.setFieldValue('date_birth', formatDateForMask(baseMorte.date_birth) || '');
            formik.setFieldValue('place_birth', baseMorte.place_birth || '');
            // Au moment de charger baseMorte :

            console.log(baseMorte.countryBirth.toUpperCase());
            console.log(pays.find((c) => normalize(c.name)));
            const countryObj = pays.find((c) => normalize(c.name) === normalize(baseMorte.countryBirth));
            const matchingCentre = cecs.find((c) => c.code === baseMorte.codeCentreEtatCivil);
            formik.setFieldValue('countryBirth', countryObj || null);
            formik.setFieldValue('gender', baseMorte.gender || '');
            formik.setFieldValue('bac_do_count', baseMorte.bac_do_count || 0);
            formik.setFieldValue('codeCentre', baseMorte.codeCentreEtatCivil || 0);
            formik.setFieldValue('centreEtatCivil', matchingCentre || null);
            formik.setFieldValue('year_registry_num', baseMorte.yearRegistryNum || 0);
            formik.setFieldValue('registry_num', baseMorte.registryNum || '');
            formik.setFieldValue('year_bfem', 0);
            toast.current.show({
                severity: 'success',
                summary: 'Office du Bac',
                detail: 'Les information du candidat ont été préchargées avec succés',
                life: 3000
            });

            alreadyBac.current = true;
            console.log(alreadyBac.current);
        } 
        else 
        {
            setLocked(false);
            toast.current.show({
                severity: 'error',
                summary: 'Office du Bac',
                detail: 'Désolé, les informations du candidat ne pourront pas être préchargées.',
                life: 3000
            });
            setLocked(true);
            //openNew();
        }
        setLoading(false);
        setDeleteProductDialog(false);

    };


    const close = () => {
        setGetResultDialog(false);
        setDeleteProductDialog(false); 
        setBaseMorte(null); 
        setLocked(false);
        setLockedAlreadyBac(false);

    }

    // const close2 = () => {
    //     setGetResultDialog(false);
    // }

    const deleteData = async () => {
        console.log(id_cdt.current);

        if (id_cdt.current) {
            try {
            await CandidatureService.deleteCandidat(id_cdt.current);
            toast.current.show({
                severity: 'success',
                summary: 'Office du Bac',
                detail: 'Le dossier de candidature a été supprimé avec succès',
                life: 5000
            });
            await loadCandidats();
            await fetchData();
            } 
            catch (error) 
            {
            toast.current.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de supprimer le dossier',
                life: 5000
            });
            console.error("Erreur suppression:", error);
            }

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
    };


    const deleteSelectedProducts_1 = () => {
        setDeleteProductsDialog1(false);
        //toast.current.show({ severity: 'error', summary: 'Office du Bac', detail: 'Ce dossier de candidature ne pourra être enregistré en aucun cas', life: 5000 });
    };

    const deleteSelectedProducts_2 = () => {
        setDeleteProductsDialog2(false);
        //toast.current.show({ severity: 'error', summary: 'Office du Bac', detail: 'Ce dossier de candidature ne pourra être enregistré en aucun cas', life: 5000 });
    };

    const deleteSelectedProducts2 = () => {
        setBfemDialog(false);
    };

    const deleteSelectedProducts3 = () => {
        setBfemDialog2(false);
    };

    const onCategoryChange = (e) => {
        let _product = { ...product };
        _product['category'] = e.value;
        setProduct(_product);
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
                    {(faeb && Number(nbrTCdts) < Number(faeb?.count_1000_OB)) && (diffDays > 0) ? (
                        <>
                            <Button
                                severity="success"
                                label="Ajouter un candidat"
                                icon="pi pi-plus"
                                className="p-button-sm mr-2 mb-2"
                                onClick={openNew}
                            />
                            <br />
                        </>
                    ) : null}


                    <span className="font-bold text-red-500">
                        <b>
                            {faeb
                                ? `👉 Il vous reste ${Number(faeb.count_1000_OB) - Number(nbrTCdts)} vignette${Number(faeb.count_1000_OB) - Number(nbrTCdts) > 1 ? 's' : ''} d'inscription non remboursable pour ${Number(prog?.edition)}.`
                                : '❌ Veuillez payer les droits de dossier à 1000 FCFA non remboursable pour démarrer les inscriptions.'}
                        </b>
                    </span>
                    <br />
                    <span className="font-bold text-red-500">
                        <b>
                            {diffDays > 0
                                ? `⏳ Il reste ${Number(diffDays)} jour (s) avant la fermeture des inscriptions pour ${Number(prog?.edition)}.`
                                : '⚠️ La période d\'ouverture des inscriptions est arrivée à échéance'}
                            
                        </b>
                    </span>

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
                <Button label="Télécharger la liste des inscrits" icon="pi pi-print" className="p-button-sm mr-2" onClick={openPrint} />
                <DownloadPDFButton2 etablissementId={user?.acteur?.etablissement?.id} etablissementName={user?.acteur?.etablissement?.name} session={prog?.edition} />
            </React.Fragment>
        );
    };

    interface DownloadPDFButtonProps {
        etablissementId: String;
        etablissementName: String;
        session: number;
        serie : String;
        cleDeTri : String
    }

    interface DownloadPDFButtonProps2 {
        etablissementId: String;
        etablissementName: String;
        session: number
    }

    const DownloadPDFButton: React.FC<DownloadPDFButtonProps> = ({ etablissementId, session, etablissementName, serie, cleDeTri }) => {
        const [loading, setLoading] = useState(false);

        // ✅ Si aucun établissement n'est sélectionné, ne rien afficher
        if (!etablissementId) return null;

        const handleDownload = async () => {
            setLoading(true);
            try 
            {
                if (selectedTL == "notOfficiel")
                {
                    await CandidatureService.getListByEtab(etablissementId, session, etablissementName, user?.login, serie, cleDeTri);
                }

                if (selectedTL == "officiel")
                {
                    await CandidatureService.getListOLByEtab(etablissementId, session, etablissementName, user?.login, serie);
                }

                if (selectedTL == "callList")
                {
                    await CandidatureService.getListContactsByEtab(etablissementId, session, etablissementName, user?.login);
                }
                
            } 
            catch (error) 
            {
                console.error('Erreur lors du téléchargement du fichier PDF.', error);
            } finally {
                setLoading(false);
            }
        };

        return faeb ? <Button label={loading ? 'Téléchargement...' : 'Cliquer pour télécharger la liste'} icon="pi pi-download" onClick={handleDownload} disabled={loading} className="p-button-primary mr-1" /> : null;
    };

    const DownloadPDFButton2: React.FC<DownloadPDFButtonProps2> = ({ etablissementId, session, etablissementName }) => {
        const [loading2, setLoading2] = useState(false);

        // Si aucun établissement n'est sélectionné, ne rien afficher
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

        return faeb ? <Button label={loading2 ? 'Téléchargement...' : 'Télécharger la liste des rejets'} icon="pi pi-download" onClick={handleDownload2} disabled={loading2} severity="help" className="p-button-sm" /> : null;
    };

    const dNBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">dosNumber</span>
                {rowData.dosNumber}
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
                {rowData.decision === 1 ? (
                    <div>
                        <span style={{ fontSize: '12px' }}>✅</span>
                        <span style={{ fontSize: '12px' }}>
                            <b> Dossier validé avec succès par OB</b>
                        </span>
                    </div>
                ) : (
                    <>
                        <div className="flex gap-3">
                            {/* Bouton Modifier */}
                            <Button
                                                icon="pi pi-user-edit"
                                                rounded
                                                tooltip="Modifier le dossier"
                                                tooltipOptions={{ position: 'bottom' }}
                                                severity="warning"
                                                className="mr-2"
                                                onClick={() => editProduct(rowData)}
                                            />

                            {/* Bouton Supprimer */}
                            {rowData.decision !== 2 && (

                                <Button
                                                icon="pi pi-trash"
                                                rounded
                                                tooltip="Supprimer le dossier"
                                                tooltipOptions={{ position: 'bottom' }}
                                                severity="danger"
                                                className="mr-2"
                                                onClick={() => editProduct2(rowData)}
                                            />
                            )}
                        </div>
                    </>
                )}
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
            {(!loading && baseMorte && (deleteProductDialog && baseMorte?.exclusionDuree + 1 + baseMorte?.exYearBac <= prog?.edition)) ? (
                <div>
                    <Button label="Précharger" icon="pi pi-check" text onClick={getData} />
                    {/* <Button label="Non" icon="pi pi-times" text onClick={hideDeleteProductDialog} /> */}
                </div>
            ) : (!loading && (!baseMorte || baseMorte.length === 0 || baseMorte.exclusionDuree > 0 || (getResultDialog && baseMorte.exclusionDuree == 0)) ? (
                <div>
                    <Button label="OK" icon="pi pi-times" text onClick={close} />
                </div>
            ) : (!baseMorte && !loading) ? (
            <div>
                    <Button label="OK" icon="pi pi-times" text onClick={close} />
            </div>
        ) : null)}
        </>
    );



    const deleteProductsDialogFooter = (
        <>
            <Button label="Compris" icon="pi pi-check" text onClick={deleteSelectedProducts} />
        </>
    );

    const deleteProductsDialogFooter1 = (
        <>
            <Button label="Compris" icon="pi pi-check" text onClick={deleteSelectedProducts_1} />
        </>
    );

    const deleteProductsDialogFooter2_ = (
        <>
            <Button label="Compris" icon="pi pi-check" text onClick={deleteSelectedProducts_2} />
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
            formik.setFieldValue('phone1', '');
            return;
        }

        // limite à 9 chiffres
        if (value.length > 9) value = value.slice(0, 9);

        // vérifie le préfixe dès que les deux premiers chiffres sont présents
        const allowedPrefixes = ['77', '78', '76', '75', '71', '70'];
        if (value.length >= 2 && !allowedPrefixes.includes(value.slice(0, 2))) {
            formik.setFieldValue('phone1', value.slice(0, 1)); // garde seulement le premier chiffre correct
            return;
        }

        // formatage automatique : XX XXX XX XX
        let formatted = value;
        if (value.length > 2) formatted = value.slice(0, 2) + ' ' + value.slice(2);
        if (value.length > 5) formatted = formatted.slice(0, 6) + ' ' + formatted.slice(6, 8) + ' ' + formatted.slice(8);

        formik.setFieldValue('phone1', formatted);
    };

    const formik = useFormik({
        initialValues: {
            dosNumber: '',
            session: 0,
            firstname: '',
            lastname: '',
            date_birth: '',
            place_birth: '',
            gender: '',
            phone1: '',
            phone2: '',
            email: '',
            year_registry_num: '',
            registry_num: '',
            bac_do_count: '1',
            year_bfem: '',
            origine_bfem: '',
            subject: '',
            handicap: false,
            type_handicap: '',
            eps: '',
            cdt_is_cgs: false,
            decision: 1,
            options: [],
            matiere1: null,
            matiere2: null,
            matiere3: null,
            matiere4: null,
            etablissement: null,
            centreEtatCivil: null,
            centreExamen: null,
            typeCandidat: null,
            serie: null,
            nationality: null,
            countryBirth: null,
            concoursGeneral: null,
            eprFacListA: '',
            eprFacListB: null,
            codeCentre: '',

            hasBac: 'no',
            tableNum: '',
            yearBac: ''
        },

        validationSchema: Yup.object({
            serie: Yup.object().nullable().required('Série obligatoire'),
            dosNumber: Yup.string()
                .required('Numéro de dossier obligatoire')
                .matches(/^[0-9]+$/, 'Numéro dossier invalide')
                .test('unique-dos-number', 'Ce numéro de dossier existe déjà', function (value) {
                    return !candidats.some((c) => c.dosNumber === value && is_update.current === false);
                }),
            bac_do_count: Yup.number()
                .transform((value, originalValue) => Number(originalValue || 0))
                .min(1, 'Le nombre de passages doit être au moins 1')
                .when('hasBac', {
                    is: 'yes', // si le candidat a déjà fait le bac
                    then: (schema) => schema.required('Le nombre de passages est obligatoire'),
                    otherwise: (schema) => schema.notRequired()
                }),
            centreEtatCivil: Yup.object().nullable().required("Le centre d'état civil est obligatoire"),
            
            /* year_registry_num: Yup.number().required('Requis'), */
            year_registry_num: Yup.number().required('Année obligatoire').min(1900, "L'année doit être supérieure à 1900").max(new Date().getFullYear(), "L'année ne peut pas être dans le futur"),
            registry_num: Yup.string()
                .required('N° acte obligatoire')
                .matches(/^\S.*$/, 'Le numéro de registre ne peut pas commencer par un espace'),
            ...(user?.acteur?.etablissement?.typeCandidat?.name !== 'Régulier/Officiel' && {
                /* origine_bfem: Yup.string().required('Requis'), */
                year_bfem: Yup.string()
                    .required('Année BFEM obligatoire')
                    .matches(/^[0-9]+$/, 'Année invalide'),
                centreExamen: Yup.object().nullable().required("Le centre d'examen est obligatoire")
            }),
            hasBac: Yup.string().oneOf(['yes', 'no'], 'Choix invalide').required('Veuillez indiquer si vous avez déjà fait le bac'),

            tableNum: Yup.string().when('hasBac', {
                is: 'yes',
                then: (schema) => schema.required('Champ obligatoire')
                .matches(/^[0-9]+$/, 'Le numéro de table doit contenir uniquement des chiffres'),
                otherwise: (schema) => schema.notRequired()
            }),

            yearBac: Yup.string().when('hasBac', {
                is: 'yes',
                then: (schema) =>
                    schema
                        .required("Champ obligatoire")
                        .matches(/^[0-9]{4}$/, "L'année doit contenir 4 chiffres")
                        .test('valid-year', "L'année doit être comprise entre 1900 et l'année en cours", (value) => {
                            if (!value) return false;
                            const year = Number(value);
                            return year >= 1900 && year <= new Date().getFullYear();
                        }),
                otherwise: (schema) => schema.notRequired()
            }),
            gender: Yup.string().required('Le genre est obligatoire'),
            type_handicap: Yup.string().trim().required('Le type de handicap est obligatoire'),
            firstname: Yup.string()
                .required('Le prénom est obligatoire')
                .matches(/^[a-zA-ZÀ-ÿ]+(?:[ '-][a-zA-ZÀ-ÿ]+)*$/, 'Le prénom ne doit pas contenir de caractères speciaux')
                .test('no-leading-space', 'Le prénom ne peut pas commencer par un espace', (value) => value && !value.startsWith(' '))
                .test('no-trailing-space', 'Le prénom ne peut pas se terminer par un espace', (value) => value && !value.endsWith(' ')),
            lastname: Yup.string()
                .required('Le nom est obligatoire')
                .matches(/^[a-zA-ZÀ-ÿ]+(?:[ '-][a-zA-ZÀ-ÿ]+)*$/, 'Le nom contient des caractères invalides')
                .test('no-leading-space', 'Le nom ne peut pas commencer par un espace', (value) => value && !value.startsWith(' '))
                .test('no-trailing-space', 'Le nom ne peut pas se terminer par un espace', (value) => value && !value.endsWith(' ')),
            date_birth: Yup.string().required('La date de naissance est obligatoire').test('valid-date', 'Format de date invalide (JJ/MM/AAAA)', isValidDate),
            place_birth: Yup.string()
                .required('Le lieu de naissance est obligatoire')
                .matches(/^[a-zA-ZÀ-ÿ]+(?:[ '-][a-zA-ZÀ-ÿ]+)*$/, 'Le lieu de naissance est invalide')
                .test('no-leading-space', 'Le lieu de naissance ne peut pas commencer par un espace', (value) => value && !value.startsWith(' '))
                .test('no-trailing-space', 'Le lieu de naissance ne peut pas se terminer par un espace', (value) => value && !value.endsWith(' ')),
            nationality: Yup.object().nullable().required('La nationalité est obligatoire'),
            countryBirth: Yup.object().nullable().required('Le pays de naissance est obligatoire'),
            phone1: Yup.string()
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

            //year_bfem: Yup.string().required('Requis'),
            eps: Yup.string().required('Le statut EPS est obligatoire'),


            matiere1: Yup.mixed()
            .nullable()
            .when('serie', {
                is: (val) => ["L'1", "L1A", "L1B", "L2", "LA", "S1A", "S2A", "STIDD"].includes(val?.code),
                then: (schema) => schema.required('Champ obligatoire'),
                otherwise: (schema) => schema.nullable()
            }),

            matiere2: Yup.mixed()
            .nullable()
            .when('serie', {
                is: (val) => ["L'1", "L1A", "L1B", "L2", "LA"].includes(val?.code),
                then: (schema) => schema.required('Champ obligatoire'),
                otherwise: (schema) => schema.nullable()
            }),

            matiere3: Yup.mixed()
            .nullable()
            .when('serie', {
                is: (val) => ["L2"].includes(val?.code),
                then: (schema) => schema.required('Champ obligatoire'),
                otherwise: (schema) => schema.nullable()
            })


            // Ajoute ici d’autres règles de validation pour chaque champ
        }),

        onSubmit: async (values, { setSubmitting, resetForm }) => {
            setIsSaving(true);

            const selectedOptions = [values.matiere1?.name, values.matiere2?.name, values.matiere3?.name].filter((m) => m !== null);

            console.log(selectedOptions);
            console.log(alreadyBac.current);

            const series = ["L2"];
            const series_ = ["L'1", "L1A", "LA", "L1B"];
            const series__ = ["S1A", "S2A", "STIDD"];

            console.log(series.includes(values.serie.code));
            console.log(series_.includes(values.serie.code));
            console.log(series__.includes(values.serie.code));

            setBaseMorte(null)

            const candidatDTO: CandidatDTO = {
                dosNumber: values.dosNumber,
                firstname: values.firstname,
                lastname: values.lastname,
                date_birth: values.date_birth,
                place_birth: values.place_birth,
                gender: values.gender,
                phone1: values.phone1.replace(/\s/g, ''),
                phone2: values.phone2,
                email: values.email,
                year_registry_num: Number(values.year_registry_num),
                registry_num: values.registry_num,
                bac_do_count: Number(values.bac_do_count),
                year_bfem: Number(values.year_bfem),
                subject: values.subject,
                handicap: values.handicap,
                type_handicap: values.type_handicap,
                eps: values.eps,
                alreadyBac : alreadyBac.current,
                decision: values.decision,

                etablissement: user?.acteur?.etablissement,
                centreEtatCivil: values.centreEtatCivil,
                centreExamen: values.centreExamen,
                typeCandidat: user?.acteur?.etablissement?.typeCandidat,
                serie: values.serie,

                ...(series.includes(values.serie.code) && {
                    matiere1: values.matiere1,
                    matiere2: values.matiere2,
                    matiere3: values.matiere3,
                }),
                ...(series_.includes(values.serie.code) && {
                    matiere1: values.matiere1,
                    matiere2: values.matiere2,
                }),
                ...(series__.includes(values.serie.code) && {
                    matiere1: values.matiere1,
                }),

                nationality: values.nationality,
                concoursGeneral: values.concoursGeneral,
                countryBirth: values.countryBirth,
                eprFacListA: values.eprFacListA || 'Aucun',
                eprFacListB: values.matiere4,
                session: Number(prog?.edition),
                origine_bfem: values.origine_bfem || 'Aucun',
                codeEnrolementEC : baseMorte?.codeEnrolement
            };

            try {
                
                if (is_update.current === false) 
                    {
                    console.log(candidatDTO.year_registry_num, candidatDTO.registry_num, (candidatDTO.centreEtatCivil as { name: string })?.name, candidatDTO.session);
                    console.log('POST');
                    setLoading(true);
                    setGetResultDialog(true);
                    CandidatureService.createCandidat(candidatDTO).then((response) => 
                        {
                            console.log(candidatDTO.alreadyBac);
                            if (!response) 
                            {
                                setBaseMorte(null);
                                setMessage('Candidat créé avec succès');
                                toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Données du candidat sont créées avec succès', life: 2000 });
                                loadCandidats();
                                fetchData();
                                console.log(Number(faeb.count_1000_OB));
                                console.log(Number(nbrTCdts));
                                
                                if (Number(nbrTCdts) + 1 < Number(faeb?.count_1000_OB))
                                {
                                    openNew();
                                }
                                else
                                {
                                    toast.current.show({ severity: 'warn', summary: 'Office du Bac', detail: 'Vous avez épuisé le nombre de vignettes d\'inscription disponibles', life: 4000 });
                                    setProductDialog(false);
                                }
                                setLocked(false);
                            } 
                            else 
                            {
                                setBaseMorte(response);
                                setGetResultDialog(true);
                            }
                        })
                        .catch((error) => {
                            console.error('Erreur :', error);
                        })
                        .finally(() => {
                            setLoading(false);
                        });
 
                }
                
                if (is_update.current === true) 
                {
                    console.log('PUT');
                    const response = await CandidatureService.updateCandidat(id_cdt, candidatDTO);
                    console.log('Candidat mis à jour:', response.data);
                    toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Données du candidat sont mises à jour avec succès', life: 4000 });
                    is_update.current = false;
                    setModifCandDialog(false);
                    await loadCandidats();
                    await fetchData();
                }
            } 
            catch (error) 
            {
            console.error('❌ Erreur lors de la création du candidat:', error);

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
        finally {
                setIsSaving(false);
                setSubmitting(false);
            }

        }
    });

    useEffect(() => {
        if (formik.values.hasBac === 'yes') {
            const table = formik.values.tableNum;
            const year = formik.values.yearBac;

            if (table && year) {
                const previousAttempts = candidats.filter((c) => c.tableNum === table && c.yearBac === year).length;

                // Si déjà passé, on ajoute 1
                formik.setFieldValue('bac_do_count', previousAttempts + 1);
            } else {
                // Sinon, par défaut 1
                formik.setFieldValue('bac_do_count', 1);
            }
        } else {
            // Si le candidat n'a jamais passé le bac
            formik.setFieldValue('bac_do_count', 1);
        }
    }, [formik.values.tableNum, formik.values.yearBac, formik.values.hasBac]);

    useEffect(() => {
        if (formik.values.hasBac === 'yes')
        {
            setLocked(true);
        }
        // if (formik.values.hasBac === 'no')
        // {
        //     setLocked(false);
        // }
    }, [formik.values.hasBac]);

    useEffect(() => {
        const checkDoublon = async () => {
            try {
                const response = await CandidatureService.checkDoublon(Number(formik.values.year_registry_num), formik.values.registry_num, (formik.values.centreEtatCivil as { name: string })?.name, Number(prog?.edition));

               if (response && Object.keys(response).length > 0) {
                console.log('Réponse API :', response);
                setCandidat(response);
                setDeleteProductsDialog(true);
                }

            } catch (error) {
                console.error('Erreur lors du checkDoublon :', error);
            }
        };

        console.log('useEffect déclenché avec : ', {
            year_registry_num: formik.values.year_registry_num,
            registry_num: formik.values.registry_num,
            centreEtatCivil: formik.values.centreEtatCivil,
            edition: prog?.edition
        });

        if (productDialog === true && formik.values.year_registry_num && formik.values.registry_num && formik.values.centreEtatCivil) {
            const timer = setTimeout(() => {
                console.log('Appel checkDoublon');
                checkDoublon();
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [formik.values.year_registry_num, formik.values.registry_num, formik.values.centreEtatCivil, prog?.edition]);



    useEffect(() => {
        const checkDoublon2 = async () => {
            try {
                let value = formik.values.phone1.replace(/\D/g, '');
                const response = await CandidatureService.checkDoublonTel(value, Number(prog?.edition));

                console.log(value);

                if (response) {
                    console.log('Réponse API :', response);
                    setCandidat(response);
                    setDeleteProductsDialog1(true);
                }
            } catch (error) {
                console.error('Erreur lors du checkDoublon :', error);
            }
        };

        if (productDialog === true && formik.values.phone1) {
            const timer = setTimeout(() => {
                console.log('Appel checkDoublon');
                checkDoublon2();
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [formik.values.phone1, prog?.edition]);


    useEffect(() => {
        const checkDoublon3 = async () => {
            try {
                const response = await CandidatureService.checkDoublonEmail(formik.values.email, Number(prog?.edition));

                if (response) {
                    console.log('Réponse API :', response);
                    setCandidat(response);
                    setDeleteProductsDialog2(true);
                }
            } catch (error) {
                console.error('Erreur lors du checkDoublon :', error);
            }
        };

        if (productDialog === true && formik.values.email) {
            const timer = setTimeout(() => {
                console.log('Appel checkDoublon');
                checkDoublon3();
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [formik.values.email, prog?.edition]);

    const handleMatiere1Change = useFormikLocalStorageDefault(formik, 'matiere1');
    const handleMatiere2Change = useFormikLocalStorageDefault(formik, 'matiere2');
    const handleMatiere3Change = useFormikLocalStorageDefault(formik, 'matiere3');
    const handleSerieChange = useFormikLocalStorageDefault(formik, 'serie');
    

    const [formData, setFormData] = useState({
        tableNum: '',
        yearBac: '',
        hasBac: 'no'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

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

    const handleChangeAnneeBac = (e) => {
        const { name, value } = e.target;
        // supprimer tout ce qui n'est pas un chiffre et limiter à 4 chiffres
        const newValue = value.replace(/\D/g, '').slice(0, 4);
        setFormData((prev) => ({ ...prev, [name]: newValue }));
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
                const birthDate = new Date(year, month - 1, day);
                let age = currentYear - year;
                const today = new Date();

                if (today.getMonth() < birthDate.getMonth() ||
                    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
                    age--;
                }

                setAge2(age);
            } else {
                setAge2(null);
            }
        } else {
            setAge2(null);
        }
    };


    // useEffect(() => {
    //     console.log(formik.values.tableNum, formik.values.yearBac, formik.values.hasBac)
    //     if (formik.values.tableNum && formik.values.yearBac) {
    //         fetchCandidateInfo(Number(formik.values.tableNum), Number(formik.values.yearBac));
    //     }
    // }, [formik.values.tableNum, formik.values.yearBac]);

    const fetchCandidateInfo = async (tableNumber, yearBac) => {
        try {
            setLoading(true);
            setDeleteProductDialog(true);

            // Vérifier le redoublant ou fraudeur
            const response = await CandidatureService.checkRedoublantOrFraude(tableNumber, yearBac);

            if (!response) {
                setBaseMorte(null);
                return; // stop ici si aucune donnée
            }

            // Vérifier les infos d’état civil à partir de la première réponse
            const response_ = await CandidatureService.checkByEtatCivil(
                response.codeCentreEtatCivil,
                response.yearRegistryNum,
                response.registryNum
            );

            if (!response_) {
                setBaseMorte(null);
                return;
            }

            // Si tout est OK, on enregistre la base morte et on affiche le dialogue
            setBaseMorte(response_);
            setDeleteProductDialog(true);
        } 
        catch (error) {
            console.error("Erreur :", error);
        } 
        finally {
            setLoading(false);
        }
    };


    const handleRegistryNumChange = (e) => {
        // Permettre la saisie du caractère '/' tout en conservant la logique de Formik
        formik.setFieldValue('registry_num', e.target.value);
    };

    // useEffect(() => {
    //     if (formik.values.codeCentre && formik.values.year_registry_num?.length === 4 && formik.values.registry_num) {
    //         fetchCandidateInfo2(formik.values.codeCentre, formik.values.year_registry_num, formik.values.registry_num);
    //     }
    // }, [formik.values.codeCentre, formik.values.year_registry_num, formik.values.registry_num]);

    const fetchCandidateInfo2 = (codeCentreEtatCivil, yearRegistryNum, registryNum) => {
        console.log("Recherche lancée avec :", codeCentreEtatCivil, yearRegistryNum, registryNum);
        setLoading(true);
        setGetResultDialog(true);

        CandidatureService.checkByEtatCivil(codeCentreEtatCivil, yearRegistryNum, registryNum)
            .then((response) => {
                if (!response) 
                {
                    setBaseMorte(null);
                } 
                else 
                {
                    setBaseMorte(response);
                    setGetResultDialog(true);
                }
            })
            .catch((error) => {
                console.error('Erreur :', error);
            })
            .finally(() => {
                setLoading(false);
            });

        
    };




    const carouselItems = [
        <div key="step1">
            <h5 className="text-primary">
                <span
                    className="p-inputtext-sm"
                    style={{
                        fontWeight: 'bold',
                        color: user?.acteur?.etablissement?.typeCandidat?.name === 'Individuel/Libre' ? 'darkblue' : 'darkgreen'
                    }}
                >
                    Type de candidat : {user?.acteur?.etablissement?.typeCandidat?.name}
                </span>
            </h5>

            {age !== null && age < 17 && (           
                <div className="formgrid grid">
                    <div className="field col-12">
                        <span
                                            style={{
                                                backgroundColor: "orangered",
                                                borderRadius: "2.5px",
                                                color: "white",
                                                fontWeight: "bold",
                                                marginTop: "1px",
                                                fontSize: "15px",
                                                padding : "2px"
                                                
                                            }}
                                            >
                            Attention, ce candidat devra justifier son cursus à la réception !
                        </span>
                    </div>
                </div>
            )}

            <div className="formgrid grid">
                <div className="field col-3">
                    <div className="formgrid grid mt-1">
                        <div className="field col-3">
                            <label>
                                <b>
                                    <span className="text-red-600">*</span> Série
                                </b>
                            </label>
                        </div>
                        <div className="field col-9">
                            <Dropdown
                                showClear
                                id="serie"
                                name="serie"
                                value={formik.values.serie}
                                style={{
                                    fontWeight: 'bold',
                                    color: 'black'
                                }}
                                onChange={(e) => handleSerieChange(e.value)}
                                options={series}
                                optionLabel="code"
                                placeholder="Sélectionner une série"
                                virtualScrollerOptions={{ itemSize: 30 }}
                                filter
                                className={`p-inputtext-sm w-full ${formik.touched.serie && formik.errors.serie ? 'p-invalid' : ''}`}
                            />
                            {formik.touched.serie && typeof formik.errors.serie === 'string' && <small className="p-error">{formik.errors.serie}</small>}
                        </div>
                    </div>
                    <div className="formgrid grid">
                        {/* Question "Déjà fait le BAC ?" */}
                        <div className="field col-8">
                            <label>
                                <b className="text-sm text-primary">
                                    Ce candidat a-t-il déjà fait le BAC ?
                                </b>

                            </label>
                        </div>

                        <div className="field col-4 flex items-center">
                            {['yes', 'no'].map((val) => (
                                <label key={val} className="flex items-center gap-1">
                                    <input type="radio" name="hasBac" value={val} disabled={lockedAlreadyBac} checked={formik.values.hasBac === val} onChange={formik.handleChange} />
                                    {val === 'yes' ? 'Oui' : 'Non'}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Inputs conditionnels si le candidat a déjà fait le bac */}
                    {formik.values.hasBac === 'yes' && (
                        <div className="formgrid grid">
                            {[
                                { name: 'tableNum', placeholder: 'N° de table', type: 'number', id: 'tableNum' },
                                { name: 'yearBac', placeholder: 'Année du BAC', maxLength: 4, id: 'yearBac' }
                            ].map((field) => (
                                <div key={field.name} className="field col-5">
                                    <InputText
                                        id={field.name}
                                        name={field.name}
                                        type={field.type || 'text'}
                                        autoComplete="off"
                                        value={formik.values[field.name]}
                                        placeholder={field.placeholder}
                                        maxLength={field.maxLength}
                                        className="p-inputtext-sm"
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (field.type === 'number') {
                                                formik.setFieldValue(field.name, val.replace(/\D/g, ''));
                                            } else {
                                                formik.handleChange(e);
                                            }
                                        }}
                                        onBlur={formik.handleBlur}
                                        style={{ fontWeight: 'bold', color: 'black' }}
                                    />
                                    {formik.touched[field.name] && formik.errors[field.name] && <small className="p-error">{formik.errors[field.name]}</small>}
                                </div>
                                
                            ))}
                            
                            <div className="field col-2 flex align-items-end">
                            <Button
                                icon="pi pi-search"
                                type="button"
                                className="p-button-success p-button-rounded"
                                tooltip="Rechercher"
                                disabled={lockedButton}
                                onMouseDown={() => {
                                    const tableNum = (document.getElementById('tableNum') as HTMLInputElement)?.value.trim() || '';
                                    const yearBac = (document.getElementById('yearBac') as HTMLInputElement)?.value.trim() || '';

                                    // Vérifier si les champs sont remplis
                                    if (!tableNum || !yearBac) {
                                        console.log('Veuillez remplir tous les champs avant de rechercher.');
                                        return; // sortir sans rien faire
                                    }

                                    fetchCandidateInfo(Number(tableNum), Number(yearBac));
                                }}
                            />
                        </div>

                        </div>
                    )}
                </div>
                <div className="field col-6">
                    <fieldset className="custom-fieldset text-sm">
                        <legend className="font-bold">Référence de la pièce tenant lieu d&apos;acte de naissance</legend>

                        <div className="formgrid grid">
                            <div className="field col-2">
                                <label>
                                    <b><span className="text-red-600">*</span> Code</b>
                                </label>
                                <InputText
                                    id="codeCentre"
                                    value={formik.values.codeCentre || ''}
                                    autoComplete="off" 
                                    style={{
                                        fontWeight: 'bold',
                                        color: 'black'
                                    }}
                                    onChange={(e) => {
                                        const code = e.target.value;
                                        formik.setFieldValue('codeCentre', code);

                                        const matchingCentre = cecs.find((c) => c.code === code);
                                        formik.setFieldValue('centreEtatCivil', matchingCentre || null);
                                    }}
                                    onBlur={() => formik.setFieldTouched('codeCentre', true)}
                                    className={`p-inputtext-sm w-full ${formik.touched.codeCentre && formik.errors.codeCentre ? 'p-invalid' : ''}`}
                                    disabled={locked}
                                    maxLength={4}
                                />
                                {formik.touched.codeCentre && formik.errors.codeCentre && <small className="p-error">{formik.errors.codeCentre}</small>}
                            </div>

                            <div className="field col-5">
                                <label>
                                    <b><span className="text-red-600">*</span> Nom du Centre Etat-Civil</b>
                                </label>
                                <Dropdown
                                    showClear
                                    id="centreEtatCivil"
                                    name="centreEtatCivil"
                                    style={{
                                        fontWeight: 'bold',
                                        color: 'black'
                                    }}
                                    value={formik.values.centreEtatCivil}
                                    onChange={(e) => {
                                        formik.setFieldValue('centreEtatCivil', e?.value);
                                        formik.setFieldValue('codeCentre', e?.value?.code);
                                    }}
                                    options={cecs}
                                    optionLabel="name"
                                    placeholder="Sélectionner le centre d'état civil"
                                    disabled={locked}
                                    virtualScrollerOptions={{ itemSize: 30 }}
                                    filter
                                    onBlur={() => formik.setFieldTouched('centreEtatCivil', true)}
                                    className={`p-inputtext-sm w-full ${formik.touched.centreEtatCivil && formik.errors.centreEtatCivil ? 'p-invalid' : ''}`}
                                />
                                {formik.touched.centreEtatCivil && typeof formik.errors.centreEtatCivil === 'string' && <small className="p-error">{formik.errors.centreEtatCivil}</small>}
                            </div>

                            <div className="field col-2">
                                <label>
                                    <b>
                                        <span className="text-red-600">*</span> Année
                                    </b>
                                </label>
                                <InputText
                                    id="year_registry_num"
                                    name="year_registry_num"
                                    autoComplete="off" 
                                    style={{
                                        fontWeight: 'bold',
                                        color: 'black'
                                    }}
                                    value={formik.values.year_registry_num}
                                    //onChange={formik.handleChange}
                                    onBlur={handleBlurYear}
                                    onChange={handleChangeAnneeNumPiece}
                                    maxLength={4}
                                    disabled={locked}
                                    className={`p-inputtext-sm w-full ${formik.touched.year_registry_num && formik.errors.year_registry_num ? 'p-invalid' : ''}`}
                                />
                                {formik.touched.year_registry_num && formik.errors.year_registry_num && <small className="p-error">{formik.errors.year_registry_num}</small>}
                            </div>

                            <div className="field col-2">
                                <label>
                                    <b>
                                        <span className="text-red-600">*</span> N° acte
                                    </b>
                                </label>
                                <InputText
                                    id="registry_num"
                                    name="registry_num"
                                    autoComplete="off" 
                                    value={formik.values.registry_num}
                                    style={{
                                        fontWeight: 'bold',
                                        color: 'black'
                                    }}
                                    onChange={handleRegistryNumChange}
                                    onBlur={formik.handleBlur}
                                    disabled={locked}
                                    className={`p-inputtext-sm w-full ${formik.touched.registry_num && formik.errors.registry_num ? 'p-invalid' : ''}`}
                                />
                                {formik.touched.registry_num && formik.errors.registry_num && <small className="p-error">{formik.errors.registry_num}</small>}
                            </div>

                            {/* {(!baseMorte && formik.values.hasBac === 'no') && (
                            <div className="field col-1 flex align-items-end">
                                <Button
                                    icon="pi pi-search"
                                    type="button"
                                    className="p-button-success p-button-rounded"
                                    tooltip="Rechercher"
                                    disabled={lockedButton}
                                    onMouseDown={() => {
                                        const codeCentre = (document.getElementById('codeCentre') as HTMLInputElement)?.value || '';
                                        const year_registry_num = (document.getElementById('year_registry_num') as HTMLInputElement)?.value || '';
                                        const registryNum = (document.getElementById('registry_num') as HTMLInputElement)?.value || '';

                                        fetchCandidateInfo2(codeCentre, year_registry_num, registryNum);
                                    }}
                                />
                            </div>
                        )} */}

                        </div>
                    </fieldset>
                </div>
                {/* Section BFEM */}
                <div className="field col-3">
                    {user?.acteur?.etablissement?.typeCandidat.name !== 'Régulier/Officiel' && (
                        <fieldset className="custom-fieldset text-sm">
                            <legend className="font-bold text-sm">Diplôme d&apos;accès & Centre d&apos;examen</legend>
                            <div className="formgrid grid">
                                
                                <div className="field col-5">
                                    <label htmlFor="year_bfem">
                                        <b>
                                            <span className="text-red-600">*</span> Année BFEM
                                        </b>
                                    </label>
                                    <InputText
                                        id="year_bfem"
                                        name="year_bfem"
                                        autoComplete="off"
                                        disabled={locked}
                                        value={formik.values.year_bfem}
                                        style={{
                                            fontWeight: 'bold',
                                            color: 'black'
                                        }}
                                        onChange={(e) => {
                                            formik.handleChange(e);

                                            const value = Number(e.target.value);

                                            if (user?.acteur?.etablissement?.typeEtablissement?.code === 'EPI' && value > prog?.bfem_IfEPI) {
                                                setBfemDialog(true);
                                            }
                                            if (user?.acteur?.etablissement?.typeEtablissement?.code === 'I' && value > prog?.bfem_IfI) {
                                                setBfemDialog(true);
                                            }
                                        }}
                                        onBlur={formik.handleBlur}
                                        className={`p-inputtext-sm w-full ${formik.touched.year_bfem && formik.errors.year_bfem ? 'p-invalid' : ''}`}
                                    />
                                    {formik.touched.year_bfem && typeof formik.errors.year_bfem === 'string' && <small className="p-error">{formik.errors.year_bfem}</small>}
                                </div>
                                <div className="field col-7">
                                <label>
                                    <b><span className="text-red-600">*</span> Centre d&apos;examen</b>
                                </label>
                                <Dropdown
                                    showClear
                                    id="centreExamen"
                                    name="centreExamen"
                                    style={{
                                        fontWeight: 'bold',
                                        color: 'black'
                                    }}
                                    value={formik.values.centreExamen}
                                    onChange={(e) => {
                                        formik.setFieldValue('centreExamen', e?.value)
                                    }}
                                    options={cexam}
                                    optionLabel="name"
                                    placeholder="Sélectionner le centre d'examen"
                                    virtualScrollerOptions={{ itemSize: 30 }}
                                    filter
                                    onBlur={() => formik.setFieldTouched('centreExamen', true)}
                                    className={`p-inputtext-sm w-full ${formik.touched.centreExamen && formik.errors.centreExamen ? 'p-invalid' : ''}`}
                                />
                                {formik.touched.centreExamen && typeof formik.errors.centreExamen === 'string' && <small className="p-error">{formik.errors.centreExamen}</small>}
                            </div>

                                
                            </div>
                        </fieldset>
                    )}
                </div>
            </div>

            <fieldset className="custom-fieldset text-sm">
                <legend className="font-bold text-sm">Informations personnelles</legend>
                <div className="formgrid grid">
                    <div className="field col-2">
                        <label htmlFor="quantity">
                            <b>
                                <span className="text-red-600">*</span> N° de dossier
                            </b>
                        </label>
                        <InputText
                        style={{ fontWeight: 'bold', color: 'blue' }}
                        id="dosNumber"
                        name="dosNumber"
                        placeholder="N° de dossier"
                        autoComplete="off" 
                        value={formik.values.dosNumber}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (!/^\d*$/.test(value)) return;
                            if (/^0\d*/.test(value)) return;
                            formik.setFieldValue("dosNumber", value);
                        }}
                        onBlur={formik.handleBlur}
                        className={`p-inputtext-sm w-full ${formik.touched.dosNumber && formik.errors.dosNumber ? 'p-invalid' : ''}`}
                    />

                        {formik.touched.dosNumber && typeof formik.errors.dosNumber === 'string' && <small className="p-error">{formik.errors.dosNumber}</small>}
                    </div>
                    <div className="field col-4">
                        <label htmlFor="price">
                            <b>
                                <span className="text-red-600">*</span> Prénom (s)
                            </b>
                        </label>
                        <InputText
                            placeholder="SAISIR LE PRENOM (S)"
                            style={{
                                fontWeight: 'bold',
                                color: 'black'
                            }}
                            id="firstname"
                            autoComplete="off" 
                            name="firstname"
                            disabled={locked}
                            value={formik.values.firstname}
                            onChange={(e) => {
                            const value = e.target.value
                                .toUpperCase()
                                .normalize("NFD")
                                .replace(/[\u0300-\u036f]/g, "");
                            formik.setFieldValue("firstname", value);
                            }}

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
                            placeholder="SAISIR LE NOM"
                            autoComplete="off" 
                            value={formik.values.lastname}
                            style={{
                                fontWeight: 'bold',
                                color: 'black'
                            }}
                            id="lastname"
                            name="lastname"
                            disabled={locked}
                            onChange={(e) => {
                            const value = e.target.value
                                .toUpperCase()
                                .normalize("NFD")
                                .replace(/[\u0300-\u036f]/g, "");
                            formik.setFieldValue("lastname", value);
                            }}

                            onBlur={handleTrimBlur('lastname')}
                            onKeyPress={preventLeadingSpace}
                            className={`p-inputtext-sm w-full ${formik.touched.lastname && formik.errors.lastname ? 'p-invalid' : ''}`}
                        />
                        {formik.touched.lastname && typeof formik.errors.lastname === 'string' && <small className="p-error">{formik.errors.lastname}</small>}
                    </div>
                    <div className="field col-2">
                        <label htmlFor="price">
                            <b>
                                <span className="text-red-600">*</span> Date de naissance
                            </b>
                        </label>
                        <InputMask
                            id="date_birth"
                            name="date_birth"
                            style={{
                                fontWeight: 'bold',
                                color: 'black'
                            }}
                            value={formik.values.date_birth}
                            onChange={formik.handleChange}
                            onBlur={(e) => {
                                formik.handleBlur(e);              
                                const computedAge = calculateAge(e.target.value);
                                console.log(e.target.value);
                                setAge(computedAge);
                            }}
                            autoComplete="off" 
                            disabled={locked}
                            mask="99/99/9999"
                            placeholder="JJ/MM/AAAA"
                            className={`p-inputtext-sm w-full ${formik.touched.date_birth && formik.errors.date_birth ? 'p-invalid' : ''}`}
                        />

                        {formik.touched.date_birth && typeof formik.errors.date_birth === 'string' && <small className="p-error">{formik.errors.date_birth}</small>}
                    </div>
                    <div className="field col-2">
                        <label htmlFor="quantity">
                            <b>
                                <span className="text-red-600">*</span> Sexe
                            </b>
                        </label>

                        <Dropdown
                            id="gender"
                            name="gender"
                            style={{
                                fontWeight: 'bold',
                                color: 'black'
                            }}
                            value={formik.values.gender}
                            onChange={(e) => formik.setFieldValue('gender', e.value)}
                            options={sexeOptions}
                            disabled={locked}
                            // optionLabel="code" // adapter si ton objet contient un champ "libelle"
                            placeholder="Sélectionner le sexe"
                            className={`p-inputtext-sm w-full ${formik.touched.gender && formik.errors.gender ? 'p-invalid' : ''}`}
                        />
                        {formik.touched.gender && typeof formik.errors.gender === 'string' && <small className="p-error">{formik.errors.gender}</small>}
                    </div>
                </div>

                <div className="formgrid grid">
                    <div className="field col-2">
                        <label htmlFor="quantity">
                            <b>
                                <span className="text-red-600">*</span> Lieu de naissance
                            </b>
                        </label>
                        <InputText
                            placeholder="Saisir le lieu de naissance"
                            value={formik.values.place_birth}
                            id="place_birth"
                            name="place_birth"
                            autoComplete="off" 
                            disabled={locked}
                            style={{
                                fontWeight: 'bold',
                                color: 'black'
                            }}
                            onChange={(e) => {
                                    const value = e.target.value
                                        .toUpperCase()
                                        .normalize("NFD")
                                        .replace(/[\u0300-\u036f]/g, "");
                                    formik.setFieldValue("place_birth", value);
                            }}
                            onBlur={handleTrimBlur('place_birth')}
                            onKeyPress={preventLeadingSpace}
                            className={`p-inputtext-sm uppercase w-full ${formik.touched.place_birth && formik.errors.place_birth ? 'p-invalid' : ''}`}
                        />
                        {formik.touched.place_birth && typeof formik.errors.place_birth === 'string' && <small className="p-error">{formik.errors.place_birth}</small>}
                    </div>

                    <div className="field col-2">
                        <label htmlFor="quantity">
                            <b>
                                <span className="text-red-600">*</span> Nationalité
                            </b>
                        </label>
                        <Dropdown
                            id="nationality"
                            name="nationality"
                            value={formik.values.nationality}
                            onChange={(e) => formik.setFieldValue('nationality', e.value)}
                            options={pays}
                            optionLabel="name"
                            style={{
                                fontWeight: 'bold',
                                color: 'black'
                            }}
                            virtualScrollerOptions={{ itemSize: 30 }}
                            placeholder="Nationalité"
                            itemTemplate={countryOptionTemplate}
                            valueTemplate={countryOptionTemplate}
                            filter
                            className={`p-inputtext-sm w-full ${formik.touched.nationality && formik.errors.nationality ? 'p-invalid' : ''}`}
                        />
                        {formik.touched.nationality && typeof formik.errors.nationality === 'string' && <small className="p-error">{formik.errors.lastname}</small>}
                    </div>
                    <div className="field col-2">
                        <label htmlFor="quantity">
                            <b>
                                <span className="text-red-600">*</span> Pays de naissance
                            </b>
                        </label>
                        <Dropdown
                            id="countryBirth"
                            name="countryBirth"
                            value={formik.values.countryBirth}
                            onChange={(e) => formik.setFieldValue('countryBirth', e.value)}
                            options={pays}
                            // disabled={locked}
                            optionLabel="name"
                            style={{
                                fontWeight: 'bold',
                                color: 'black'
                            }}
                            virtualScrollerOptions={{ itemSize: 30 }}
                            placeholder="Pays de naissance"
                            filter
                            itemTemplate={countryOptionTemplate}
                            valueTemplate={countryOptionTemplate}
                            className={`p-inputtext-sm w-full ${formik.touched.countryBirth && formik.errors.countryBirth ? 'p-invalid' : ''}`}
                        />
                        {formik.touched.countryBirth && typeof formik.errors.countryBirth === 'string' && <small className="p-error">{formik.errors.lastname}</small>}
                    </div>
                    <div className="field col-2">
                        <label htmlFor="phone1">
                            <b>
                                <span className="text-red-600">*</span> Téléphone (Portable)
                            </b>
                        </label>
                        <InputMask
                            mask="999999999"
                            placeholder="Téléphone"
                            style={{
                                fontWeight: 'bold',
                                color: 'black'
                            }}
                            autoComplete="off" 
                            value={formik.values.phone1}
                            id="phone1"
                            name="phone1"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`p-inputtext-sm w-full ${formik.touched.phone1 && formik.errors.phone1 ? 'p-invalid' : ''}`}
                        />
                        {formik.touched.phone1 && typeof formik.errors.phone1 === 'string' && <small className="p-error">{formik.errors.phone1}</small>}
                    </div>
                    <div className="field col-4">
                        <label htmlFor="email">
                            <b>
                                <span className="text-red-600">*</span> Email du candidat
                            </b>
                        </label>
                        <InputText
                            placeholder="Email du candidat"
                            value={formik.values.email}
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="off" 
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            style={{
                                fontWeight: 'bold',
                                color: 'black'
                            }}
                            className={`p-inputtext-sm w-full ${formik.touched.email && formik.errors.email ? 'p-invalid' : ''}`}
                        />
                        {formik.touched.email && typeof formik.errors.email === 'string' && <small className="p-error">{formik.errors.email}</small>}
                    </div>
                </div>
            </fieldset>

            <div className="formgrid grid">
                <div className="field col-8">
                    {formik.values.serie?.code !== 'F6' &&
                        formik.values.serie?.code !== 'L-AR' &&
                        formik.values.serie?.code !== 'S1' &&
                        formik.values.serie?.code !== 'S2' &&
                        formik.values.serie?.code !== 'S3' &&
                        formik.values.serie?.code !== 'S4' &&
                        formik.values.serie?.code !== 'S5' &&
                        formik.values.serie?.code !== 'T1' &&
                        formik.values.serie?.code !== 'T2' &&
                        formik.values.serie?.code !== 'STEG' &&
                        formik.values.serie?.code !== 'S1AR' &&
                        formik.values.serie?.code !== 'S2AR' && (
                            <fieldset className="custom-fieldset text-sm">
                                    <legend className="font-bold text-sm">
                                        {formik.values?.serie?.code === 'STIDD'
                                        ? 'Spécialité'
                                        : 'Matière(s) optionnelle(s)'}
                                    </legend>
                                <div className="formgrid grid">
                                    <div className="field col-4">
                                        <label htmlFor="quantity">
                                            <span className="text-red-600">* </span> 
                                            <b>{formik.values?.serie?.code === 'STIDD'
                                                ? 'Spécialité'
                                                : 'LV1'}</b>
                                        </label>
                                        <Dropdown
                                            showClear
                                            id="matiere1"
                                            name="matiere1"
                                            value={formik.values.matiere1}
                                            onChange={(e) => handleMatiere1Change(e.value)}
                                            options={getAvailableOptions(formik.values.serie?.code, 1, formik.values.matiere2?.name, formik.values.matiere3?.name, formik.values.matiere4?.name)}
                                            optionLabel="name"
                                            placeholder={formik.values?.serie?.code === 'STIDD'
                                            ? 'Choisir une spécialité'
                                            : 'Choisir une matière'}
                                            className={`p-inputtext-sm w-full ${formik.touched.matiere1 && formik.errors.matiere1 ? 'p-invalid' : ''}`}
                                            style={{
                                                fontWeight: 'bold',
                                                color: 'black'
                                            }}
                                            filter
                                        />
                                        {formik.touched.matiere1 && typeof formik.errors.matiere1 === 'string' && <small className="p-error">{formik.errors.matiere1}</small>}
                            
                                    </div>
                                    {formik.values.serie?.code !== 'STIDD' && formik.values.serie?.code !== 'S1A' && formik.values.serie?.code !== 'S2A' && (
                                        <div className="field col-4">
                                            <label htmlFor="quantity">
                                                <b><span className="text-red-600">*</span> LV2 OU ECONOMIE</b>
                                            </label>
                                            <Dropdown
                                                showClear
                                                id="matiere2"
                                                name="matiere2"
                                                value={formik.values.matiere2}
                                                onChange={(e) => handleMatiere2Change(e.value)}
                                                options={getAvailableOptions(formik.values.serie?.code, 2, formik.values.matiere1?.name, formik.values.matiere3?.name, formik.values.matiere4?.name)}
                                                optionLabel="name"
                                                placeholder="Choisir une matière"
                                                className={`p-inputtext-sm w-full ${formik.touched.matiere2 && formik.errors.matiere2 ? 'p-invalid' : ''}`}
                                                style={{
                                                    fontWeight: 'bold',
                                                    color: 'black'
                                                }}
                                                filter
                                            />
                                                        {formik.touched.matiere2 && typeof formik.errors.matiere2 === 'string' && <small className="p-error">{formik.errors.matiere2}</small>}
                                        </div>
                                    )}
                                    {formik.values.serie?.code !== 'LA' && formik.values.serie?.code !== 'STIDD' && formik.values.serie?.code !== "L'1" && formik.values.serie?.code !== 'L1A' && formik.values.serie?.code !== 'L1B' && formik.values.serie?.code !== 'S1A' && formik.values.serie?.code !== 'S2A' && (
                                        <div className="field col-4">
                                            <label htmlFor="quantity">
                                                <b><span className="text-red-600">*</span> SCIENCES (PC OU SVT)</b>
                                            </label>
                                            <Dropdown
                                                showClear
                                                id="matiere3"
                                                name="matiere3"
                                                value={formik.values.matiere3}
                                                onChange={(e) => handleMatiere3Change(e.value)}
                                                options={getAvailableOptions(formik.values.serie?.code, 3, formik.values.matiere1?.name, formik.values.matiere2?.name, formik.values.matiere4?.name)}
                                                optionLabel="name"
                                                placeholder="Choisir une matière"
                                                className={`p-inputtext-sm w-full ${formik.touched.matiere3 && formik.errors.matiere3 ? 'p-invalid' : ''}`}
                                                filter
                                                style={{
                                                    fontWeight: 'bold',
                                                    color: 'black'
                                                }}
                                            />
                                                        {formik.touched.matiere3 && typeof formik.errors.matiere3 === 'string' && <small className="p-error">{formik.errors.matiere3}</small>}
                                        </div>
                                    )}
                                </div>
                            </fieldset>
                        )}
                </div>

                <div className="col-4">
                    <fieldset className="custom-fieldset text-sm">
                        <legend className="font-bold text-sm">EPS & Handicap</legend>
                        <div className="formgrid grid">
                            <div className="field col-6">
                                <label htmlFor="type_handicap">
                                    <b>Handicap</b>
                                </label>
                                <Dropdown
                                    id="type_handicap"
                                    name="type_handicap"
                                    value={formik.values.type_handicap}
                                    onChange={(e) => {
                                        formik.setFieldValue('type_handicap', e.value);
                                        formik.setFieldValue('eps', e.value === 'Néant' ? 'Apte' : 'Inapte');
                                    }}
                                    options={handicapOptions}
                                    placeholder="Sélectionner l'handicap"
                                    className="p-inputtext-sm w-full"
                                    style={{ fontWeight: 'bold', color: 'black' }}
                                />
                            </div>

                            <div className="field col-6">
                                <label htmlFor="eps">
                                    <b>
                                        <span className="text-red-600">*</span> EPS
                                    </b>
                                </label>
                                <Dropdown
                                    id="eps"
                                    name="eps"
                                    value={formik.values.eps}
                                    onChange={(e) => formik.setFieldValue('eps', e.value)}
                                    options={epsOptions}
                                    placeholder="Aptitude EPS"
                                    className={`p-inputtext-sm w-full ${formik.touched.eps && formik.errors.eps ? 'p-invalid' : ''}`}
                                    style={{ fontWeight: 'bold', color: 'black' }}
                                />
                                {formik.touched.eps && typeof formik.errors.eps === 'string' && <small className="p-error">{formik.errors.eps}</small>}
                            </div>
                        </div>
                    </fieldset>
                </div>
            </div>

            <div className="formgrid grid">
                <div className="field col-6">
                    <fieldset className="custom-fieldset text-sm">
                        <legend className="font-bold text-sm">Epreuve (s) facultative (s)</legend>
                        <div className="formgrid grid">
                            <div className="field col-6">
                                <label htmlFor="quantity">
                                    <b>Liste A (Des, Mus, Cout...)</b>
                                </label>
                                <Dropdown
                                    showClear
                                    id="eprFacListA"
                                    name="eprFacListA"
                                    value={formik.values.eprFacListA}
                                    onChange={(e) => formik.setFieldValue('eprFacListA', e.value)}
                                    options={efOptions}
                                    style={{
                                        fontWeight: 'bold',
                                        color: 'black'
                                    }}
                                    placeholder="Dessin, Musique, Couture..."
                                    className={`p-inputtext-sm w-full ${formik.touched.eprFacListA && formik.errors.eprFacListA ? 'p-invalid' : ''}`}
                                />
                            </div>
                            <div className="field col-6">
                                <label htmlFor="quantity">
                                    <b>Liste B (Langues...)</b>
                                </label>
                                <Dropdown
                                    showClear
                                    id="matiere4"
                                    name="matiere4"
                                    value={formik.values.matiere4}
                                    onChange={(e) => {
                                        console.log('matiere4 :', e.value);
                                        formik.setFieldValue('matiere4', e.value);
                                    }}
                                    style={{
                                        fontWeight: 'bold',
                                        color: 'black'
                                    }}
                                    options={getAvailableOptions2(formik.values.serie?.code, 3, formik.values.matiere1?.name, formik.values.matiere2?.name, formik.values.matiere3?.name)}
                                    optionLabel="name"
                                    placeholder="Choisir une matière facultative"
                                    filter
                                    className={`p-inputtext-sm w-full ${formik.touched.eprFacListB && formik.errors.eprFacListB ? 'p-invalid' : ''}`}
                                />
                            </div>
                        </div>
                    </fieldset>
                </div>
                <div className="field col-2">
                    <label htmlFor="price">
                        <b>
                            <span className="text-red-600">*</span> Nombre de fois
                        </b>
                    </label>
                    <InputText
                        id="bac_do_count"
                        name="bac_do_count"
                        value={formik.values.bac_do_count}
                        autoComplete="off" 
                        style={{
                            fontWeight: 'bold',
                            color: 'black'
                        }}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={locked}
                        className={`p-inputtext-sm w-full ${formik.touched.bac_do_count && formik.errors.bac_do_count ? 'p-invalid' : ''}`}
                        placeholder="Nombre de fois"
                    />
                    {formik.touched.bac_do_count && typeof formik.errors.bac_do_count === 'string' && <small className="p-error">{formik.errors.bac_do_count}</small>}
                    
                </div>
                <div className="field col-4">
                    <Button icon={isSaving ? 'pi pi-spin pi-spinner' : 'pi pi-save'} label={isSaving ? 'Enregistrement...' : 'Enregistrer les informations du dossier de candidature'} className="mt-4" type="submit" disabled={isSaving} />
                </div>

            </div>
        </div>
    ];

    const carouselItems2 = 
    [
        <div key="step1">
            <h5 className="text-primary">Étape 1 / 4 : Etat Civil</h5>
            <div className="formgrid grid">
                <div className="field col-2">
                    <fieldset className="px-3 custom-fieldset text-sm">
                        <legend className="font-bold text-sm">Type de candidat</legend>
                        <div className="formgrid grid">
                            <div className="field">
                                <label htmlFor="price">Type de candidat</label>
                                <InputText
                                    readOnly
                                    className="p-inputtext-sm"
                                    value={user?.acteur?.etablissement?.typeCandidat?.name}
                                    style={{
                                        fontWeight: 'bold',
                                        color: user?.acteur?.etablissement?.typeCandidat?.name === 'Individuel/Libre' ? 'darkblue' : 'darkgreen'
                                    }}
                                />
                            </div>
                        </div>
                    </fieldset>
                </div>

                <div className="field col-4">
                    {user?.acteur?.etablissement?.typeCandidat.name !== 'Régulier/Officiel' && (
                        <fieldset className="px-3 custom-fieldset text-sm">
                            <legend className="font-bold text-sm">Diplôme d&apos;accès & Centre d&apos;examen</legend>
                                <div className="formgrid grid">
                                    {/* <div className="field col-6 mt-1">
                                        <label htmlFor="quantity">Origine du BFEM</label>
                                        <Dropdown
                                            id="origine_bfem"
                                            name="origine_bfem"
                                            value={formik.values.origine_bfem}
                                            onChange={(e) => formik.setFieldValue('origine_bfem', e.value)}
                                            options={origineOptions}
                                            placeholder="Origine du BFEM"
                                            className={`p-inputtext-sm w-full ${formik.touched.origine_bfem && formik.errors.origine_bfem ? 'p-invalid' : ''}`}
                                        />
                                        {formik.touched.origine_bfem && typeof formik.errors.origine_bfem === 'string' && <small className="p-error">{formik.errors.origine_bfem}</small>}
                                    </div> */}
                                    <div className="field col-5">
                                        <label htmlFor="year_bfem">
                                            <b>
                                                <span className="text-red-600">*</span> Année BFEM
                                            </b>
                                        </label>
                                        <InputText
                                            id="year_bfem"
                                            name="year_bfem"
                                            autoComplete="off" 
                                            value={formik.values.year_bfem}
                                            style={{
                                                fontWeight: 'bold',
                                                color: 'black'
                                            }}
                                            onChange={(e) => {
                                                formik.handleChange(e);

                                                const value = Number(e.target.value);

                                                if (user?.acteur?.etablissement?.typeEtablissement?.code === 'EPI' && value > prog?.bfem_IfEPI) {
                                                    setBfemDialog(true);
                                                }
                                                if (user?.acteur?.etablissement?.typeEtablissement?.code === 'I' && value > prog?.bfem_IfI) {
                                                    setBfemDialog(true);
                                                }
                                            }}
                                            onBlur={formik.handleBlur}
                                            className={`p-inputtext-sm w-full ${formik.touched.year_bfem && formik.errors.year_bfem ? 'p-invalid' : ''}`}
                                        />
                                        {formik.touched.year_bfem && typeof formik.errors.year_bfem === 'string' && <small className="p-error">{formik.errors.year_bfem}</small>}
                                    </div>
                                    <div className="field col-7">
                                    <label>
                                        <b><span className="text-red-600">*</span> Centre d&apos;examen</b>
                                    </label>
                                    <Dropdown
                                        showClear
                                        id="centreExamen"
                                        name="centreExamen"
                                        style={{
                                            fontWeight: 'bold',
                                            color: 'black'
                                        }}
                                        value={formik.values.centreExamen}
                                        onChange={(e) => {
                                            formik.setFieldValue('centreExamen', e?.value)
                                        }}
                                        options={cexam}
                                        optionLabel="name"
                                        placeholder="Sélectionner le centre d'examen"
                                        virtualScrollerOptions={{ itemSize: 30 }}
                                        filter
                                        onBlur={() => formik.setFieldTouched('centreExamen', true)}
                                        className={`p-inputtext-sm w-full ${formik.touched.centreExamen && formik.errors.centreExamen ? 'p-invalid' : ''}`}
                                    />
                                    {formik.touched.centreExamen && typeof formik.errors.centreExamen === 'string' && <small className="p-error">{formik.errors.centreExamen}</small>}
                                </div>
                            </div>
                        </fieldset>
                    )}
                </div>

                <div className="field col-6">
                    <fieldset className="px-3 custom-fieldset text-sm">
                        <legend className="font-bold text-sm">Informations Scolaires</legend>
                        <div className="formgrid grid">
                            <div className="field col-4">
                                <label>
                                    <b>
                                        <span className="text-red-600">*</span> Série : {formik.values.serie?.code}
                                    </b>
                                    
                                </label>
                                <Dropdown
                                    id="serie"
                                    name="serie"
                                    value={formik.values.serie}
                                    onChange={(e) => handleSerieChange(e.value)}
                                    options={series}
                                    optionLabel="code"
                                    style={{
                                        fontWeight: 'bold',
                                        color: 'black'
                                    }}
                                    placeholder="Sélectionner une série"
                                    virtualScrollerOptions={{ itemSize: 30 }}
                                    filter
                                    className={`p-inputtext-sm w-full ${formik.touched.serie && formik.errors.serie ? 'p-invalid' : ''}`}
                                />
                                {formik.touched.serie && typeof formik.errors.serie === 'string' && <small className="p-error">{formik.errors.serie}</small>}
                            </div>

                            <div className="field col-4">
                                <label htmlFor="quantity"><b><span className="text-red-600">*</span> N° de dossier</b></label>
                                <InputText
                                    readOnly
                                    id="dosNumber"
                                    name="dosNumber"
                                    placeholder="N° de dossier"
                                    autoComplete="off"
                                    value={formik.values.dosNumber}
                                    style={{
                                        fontWeight: 'bold',
                                        color: 'black'
                                    }}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`p-inputtext-sm w-full ${formik.touched.dosNumber && formik.errors.dosNumber ? 'p-invalid' : ''}`}
                                />
                                {formik.touched.dosNumber && typeof formik.errors.dosNumber === 'string' && <small className="p-error">{formik.errors.dosNumber}</small>}
                            </div>

                            <div className="field col-4">
                                <label htmlFor="price">
                                    <b><span className="text-red-600">*</span> Nombre de fois</b>
                                </label>
                                <InputText
                                    id="bac_do_count"
                                    name="bac_do_count"
                                    autoComplete="off"
                                    value={formik.values.bac_do_count}
                                    style={{
                                        fontWeight: 'bold',
                                        color: 'black'
                                    }}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`p-inputtext-sm w-full ${formik.touched.bac_do_count && formik.errors.bac_do_count ? 'p-invalid' : ''}`}
                                    placeholder="Nombre de fois"
                                />
                                {formik.touched.bac_do_count && typeof formik.errors.bac_do_count === 'string' && <small className="p-error">{formik.errors.bac_do_count}</small>}
                            </div>
                        </div>
                    </fieldset>
                </div>

                {/* Bloc droit */}
                {/* <div className="col-6">
                    {user?.acteur?.etablissement?.typeCandidat.name !== 'Régulier/Officiel' && (
                        <fieldset className="px-3 py-3 custom-fieldset text-sm">
                            <legend className="text-primary font-bold text-sm">Diplôme d&apos;accès</legend>
                            <div className="formgrid grid">
                                <div className="field col-6 mt-1">
                                    <label htmlFor="quantity">Origine du BFEM</label>
                                    <Dropdown
                                        id="origine_bfem"
                                        name="origine_bfem"
                                        value={formik.values.origine_bfem}
                                        onChange={(e) => formik.setFieldValue('origine_bfem', e.value)}
                                        options={origineOptions}
                                        placeholder="Origine du BFEM"
                                        className={`p-inputtext-sm w-full ${formik.touched.origine_bfem && formik.errors.origine_bfem ? 'p-invalid' : ''}`}
                                    />
                                    {formik.touched.origine_bfem && typeof formik.errors.origine_bfem === 'string' && <small className="p-error">{formik.errors.origine_bfem}</small>}
                                </div>
                                <div className="field col-6 mt-1">
                                    <label htmlFor="price">
                                        <span className="text-red-600">*</span> Année BFEM
                                    </label>
                                    <InputText
                                        id="year_bfem"
                                        name="year_bfem"
                                        value={formik.values.year_bfem}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className={`p-inputtext-sm w-full ${formik.touched.year_bfem && formik.errors.year_bfem ? 'p-invalid' : ''}`}
                                    />
                                    {formik.touched.year_bfem && typeof formik.errors.year_bfem === 'string' && <small className="p-error">{formik.errors.year_bfem}</small>}
                                </div>
                            </div>
                        </fieldset>
                    )}
                </div> */}
            </div>

            <div className="formgrid grid">
                {formik.values.serie?.code !== 'F6' &&
                    formik.values.serie?.code !== 'L-AR' &&
                    formik.values.serie?.code !== 'S1' &&
                    formik.values.serie?.code !== 'S2' &&
                    formik.values.serie?.code !== 'S3' &&
                    formik.values.serie?.code !== 'S4' &&
                    formik.values.serie?.code !== 'S5' &&
                    formik.values.serie?.code !== 'T1' &&
                    formik.values.serie?.code !== 'T2' &&
                    formik.values.serie?.code !== 'STEG' &&
                    formik.values.serie?.code !== 'S1AR' &&
                    formik.values.serie?.code !== 'S2AR' && (
                        <div className="field col-12">
                            <fieldset className="px-3 custom-fieldset text-sm">
                                    <legend className="font-bold text-sm">
                                        {formik.values?.serie?.code === 'STIDD'
                                        ? 'Spécialité'
                                        : 'Matière(s) optionnelle(s)'}
                                    </legend>
                                <div className="formgrid grid">
                                    <div className="field col-4 mt-1">
                                        <label htmlFor="quantity">
                                            <b>
                                            <span className="text-red-600">* </span> 
                                            {formik.values?.serie?.code === 'STIDD'
                                                ? 'Spécialité'
                                                : 'LV1'}
                                            </b>
                                        </label>
                                        <Dropdown
                                            showClear
                                            id="matiere1"
                                            name="matiere1"
                                            value={formik.values.matiere1}
                                            style={{
                                                fontWeight: 'bold',
                                                color: 'black'
                                            }}
                                            onChange={(e) => formik.setFieldValue('matiere1', e.value)}
                                            options={getAvailableOptions(formik.values.serie?.code, 1, formik.values.matiere2?.name, formik.values.matiere3?.name, formik.values.matiere4?.name)}
                                            optionLabel="name"
                                            placeholder="Choisir une matière"
                                            className="w-full"
                                            filter
                                            key={formik.values.matiere1?.id}
                                        />
                                        {formik.touched.matiere1 && typeof formik.errors.matiere1 === 'string' && <small className="p-error">{formik.errors.matiere1}</small>}
                            
                                    </div>
                                    {formik.values.serie?.code !== 'S1A' && formik.values.serie?.code !== 'S2A' && formik.values.serie?.code !== 'STIDD' && (
                                        <div className="field col-4 mt-1">
                                            <label htmlFor="quantity"> 
                                                <b>
                                                    <span className="text-red-600">* </span>LV2 OU ECONOMIE
                                                </b>
                                            </label>
                                            <Dropdown
                                                showClear
                                                id="matiere2"
                                                name="matiere2"
                                                value={formik.values.matiere2}
                                                style={{
                                                    fontWeight: 'bold',
                                                    color: 'black'
                                                }}
                                                onChange={(e) => formik.setFieldValue('matiere2', e.value)}
                                                options={getAvailableOptions(formik.values.serie?.code, 2, formik.values.matiere1?.name, formik.values.matiere3?.name, formik.values.matiere4?.name)}
                                                optionLabel="name"
                                                placeholder="Choisir une matière"
                                                className="w-full"
                                                filter
                                                key={formik.values.matiere2?.id || 'matiere2'}
                                            />
                                            {formik.touched.matiere2 && typeof formik.errors.matiere2 === 'string' && <small className="p-error">{formik.errors.matiere2}</small>}
                            
                                        </div>
                                    )}
                                    {formik.values.serie?.code !== "L'1" && formik.values.serie?.code !== 'L1A' && formik.values.serie?.code !== 'L1B' && formik.values.serie?.code !== 'S1A' && formik.values.serie?.code !== 'S2A' && formik.values.serie?.code !== 'STIDD' && (
                                        <div className="field col-4 mt-1">
                                            <label htmlFor="quantity">
                                                <b>
                                                    <span className="text-red-600">* </span>SCIENCES (PC OU SVT)
                                                </b>
                                            </label>
                                            <Dropdown
                                                showClear
                                                id="matiere3"
                                                name="matiere3"
                                                value={formik.values.matiere3}
                                                style={{
                                                    fontWeight: 'bold',
                                                    color: 'black'
                                                }}
                                                onChange={(e) => formik.setFieldValue('matiere3', e.value)}
                                                options={getAvailableOptions(formik.values.serie?.code, 3, formik.values.matiere1?.name, formik.values.matiere2?.name, formik.values.matiere4?.name)}
                                                optionLabel="name"
                                                placeholder="Choisir une matière"
                                                className="w-full"
                                                filter
                                                key={formik.values.matiere3?.id}
                                            />
                                            {formik.touched.matiere3 && typeof formik.errors.matiere3 === 'string' && <small className="p-error">{formik.errors.matiere3}</small>}
                            
                                        </div>
                                    )}
                                </div>
                            </fieldset>
                        </div>
                    )}
            </div>

            <div className="formgrid grid">
                <div className="field col-12">
                    <fieldset className="custom-fieldset text-sm">
                        <legend className="font-bold">Référence de la pièce tenant lieu d&apos;acte de naissance</legend>
                        <div className="formgrid grid">
                            <div className="field col-5">
                                <label htmlFor="quantity">
                                <b>
                                     <span className="text-red-600">* </span>Nom / Centre Etat-Civil
                                </b>
                                </label>
                                <Dropdown
                                    id="centreEtatCivil"
                                    name="centreEtatCivil"
                                    value={formik.values.centreEtatCivil}
                                    style={{
                                        fontWeight: 'bold',
                                        color: 'black'
                                    }}
                                    onChange={(e) => {
                                        formik.setFieldValue('centreEtatCivil', e.value);
                                        formik.setFieldValue('codeCentre', e.value.code); // si tu veux un champ séparé dans formik
                                    }}
                                    options={cecs}
                                    optionLabel="name" // adapter si ton objet contient un champ "libelle"
                                    placeholder="Sélectionner le centre d'etat civil"
                                    virtualScrollerOptions={{ itemSize: 30 }}
                                    filter
                                    className={`p-inputtext-sm w-full ${formik.touched.centreEtatCivil && formik.errors.centreEtatCivil ? 'p-invalid' : ''}`}
                                />
                                {formik.touched.centreEtatCivil && typeof formik.errors.centreEtatCivil === 'string' && <small className="p-error">{formik.errors.centreEtatCivil}</small>}
                            </div>
                            <div className="field col-2">
                                <label htmlFor="price">
                                    <b>
                                     <span className="text-red-600">* </span>Code Centre Etat Civil
                                    </b>
                                </label>
                                <InputText
                                    value={formik.values.codeCentre || ''}
                                    className="p-inputtext-sm"
                                    autoComplete="off"
                                    maxLength={4}
                                    style={{
                                        fontWeight: 'bold',
                                        color: 'black'
                                    }}
                                    onChange={(e) => {
                                        const code = e.target.value;
                                        formik.setFieldValue('codeCentre', code);

                                        const matchingCentre = cecs.find((c) => c.code === code);
                                        formik.setFieldValue('centreEtatCivil', matchingCentre || null);
                                    }}
                                />
                            </div>
                            <div className="field col-2">
                                <label htmlFor="price">
                                    <b>
                                        <span className="text-red-600">* </span>Année de déclaration
                                    </b>
                                </label>
                                <InputText
                                    maxLength={4}
                                    id="year_registry_num"
                                    name="year_registry_num"
                                    autoComplete="off"
                                    value={formik.values.year_registry_num}
                                    style={{
                                        fontWeight: 'bold',
                                        color: 'black'
                                    }}
                                    // onChange={formik.handleChange}
                                    // onBlur={formik.handleBlur}
                                    onBlur={handleBlurYear}
                                    onChange={handleChangeAnneeNumPiece}
                                    className={`p-inputtext-sm w-full ${formik.touched.year_registry_num && formik.errors.year_registry_num ? 'p-invalid' : ''}`}
                                />
                                {formik.touched.year_registry_num && typeof formik.errors.year_registry_num === 'string' && <small className="p-error">{formik.errors.year_registry_num}</small>}
                            </div>
                            
                            <div className="field col-2">
                                <label htmlFor="price">
                                    <b>
                                        <span className="text-red-600">* </span>N° de registre
                                    </b>
                                </label>
                                <InputText
                                    id="registry_num"
                                    name="registry_num"
                                    autoComplete="off"
                                    value={formik.values.registry_num}
                                    style={{
                                        fontWeight: 'bold',
                                        color: 'black'
                                    }}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`p-inputtext-sm w-full ${formik.touched.registry_num && formik.errors.registry_num ? 'p-invalid' : ''}`}
                                />
                                {formik.touched.registry_num && typeof formik.errors.registry_num === 'string' && <small className="p-error">{formik.errors.registry_num}</small>}
                            </div>
                            
                        </div>
                    </fieldset>
                </div>
            </div>
        </div>,
        <div className="p-1" key="step2">
            <h5 className="text-primary">Étape 2 / 4 : Informations personnelles</h5>
            {age !== null && age < 17 && (           
                <div className="formgrid grid">
                    <div className="field col-12">
                        <span
                                            style={{
                                                backgroundColor: "orangered",
                                                borderRadius: "5px",
                                                color: "white",
                                                fontWeight: "bold",
                                                marginTop: "2px",
                                                fontSize: "15px",
                                                padding : "4px"
                                                
                                            }}
                                            >
                            Attention, ce candidat devra justifier son cursus à la réception !
                        </span>
                    </div>
                </div>
            )}
            <fieldset className="px-5 custom-fieldset text-sm">
                <legend className="font-bold">Informations personnelles</legend>
                <div className="formgrid grid">
                    <div className="field col-4">
                        <label htmlFor="quantity">
                            <b><span className="text-red-600">*</span> Sexe</b>
                        </label>

                        <Dropdown
                            id="gender"
                            name="gender"
                            value={formik.values.gender}
                            style={{
                                fontWeight: 'bold',
                                color: 'black'
                            }}
                            onChange={(e) => formik.setFieldValue('gender', e.value)}
                            options={sexeOptions}
                            // optionLabel="code" // adapter si ton objet contient un champ "libelle"
                            placeholder="Sélectionner le sexe"
                            className={`p-inputtext-sm w-full ${formik.touched.gender && formik.errors.gender ? 'p-invalid' : ''}`}
                        />
                        {formik.touched.gender && typeof formik.errors.gender === 'string' && <small className="p-error">{formik.errors.gender}</small>}
                    </div>

                    <div className="field col-4">
                        <label htmlFor="quantity">
                            <b><span className="text-red-600">*</span> EPS</b>
                            
                        </label>
                        <Dropdown
                            id="eps"
                            name="eps"
                            value={formik.values.eps}
                            style={{
                                fontWeight: 'bold',
                                color: 'black'
                            }}
                            onChange={(e) => formik.setFieldValue('eps', e.value)}
                            options={epsOptions}
                            placeholder="Aptitude EPS"
                            className={`p-inputtext-sm w-full ${formik.touched.eps && formik.errors.eps ? 'p-invalid' : ''}`}
                        />
                        {formik.touched.eps && typeof formik.errors.eps === 'string' && <small className="p-error">{formik.errors.eps}</small>}
                    </div>

                    <div className="field col-4">
                        <label htmlFor="quantity">
                            <b>Handicap</b>
                        </label>

                        <Dropdown
                            id="type_handicap"
                            name="type_handicap"
                            value={formik.values.type_handicap}
                            style={{
                                fontWeight: 'bold',
                                color: 'black'
                            }}
                            onChange={(e) => formik.setFieldValue('type_handicap', e.value)}
                            options={handicapOptions}
                            // optionLabel="code" // adapter si ton objet contient un champ "libelle"
                            placeholder="Sélectionner l'handicap"
                            className={`p-inputtext-sm w-full ${formik.touched.type_handicap && formik.errors.type_handicap ? 'p-invalid' : ''}`}
                        />
                        {formik.touched.type_handicap && typeof formik.errors.type_handicap === 'string' && <small className="p-error">{formik.errors.type_handicap}</small>}
                    </div>
                </div>

                <div className="formgrid grid">
                    <div className="field col-8">
                        <label htmlFor="price">
                            <b><span className="text-red-600">*</span> Prénom (s)</b>
                            
                        </label>
                        <InputText
                            placeholder="Saisir le prénom (s)"
                            id="firstname"
                            name="firstname"
                            autoComplete="off"
                            value={formik.values.firstname}
                            style={{
                                fontWeight: 'bold',
                                color: 'black'
                            }}
                            onChange={(e) => {
                            const value = e.target.value
                                .toUpperCase()
                                .normalize("NFD")
                                .replace(/[\u0300-\u036f]/g, "");
                            formik.setFieldValue("firstname", value);
                            }}

                            onBlur={formik.handleBlur}
                            className={`p-inputtext-sm w-full ${formik.touched.firstname && formik.errors.firstname ? 'p-invalid' : ''}`}
                        />
                        {formik.touched.firstname && typeof formik.errors.firstname === 'string' && <small className="p-error">{formik.errors.firstname}</small>}
                    </div>

                    <div className="field col-4">
                        <label htmlFor="quantity">
                            <b><span className="text-red-600">*</span> Nom</b>
                        </label>
                        <InputText
                            placeholder="Saisir le nom"
                            autoComplete="off"
                            value={formik.values.lastname}
                            style={{
                                fontWeight: 'bold',
                                color: 'black'
                            }}
                            id="lastname"
                            name="lastname"
                            onChange={(e) => {
                            const value = e.target.value
                                .toUpperCase()
                                .normalize("NFD")
                                .replace(/[\u0300-\u036f]/g, "");
                            formik.setFieldValue("lastname", value);
                            }}
                            onBlur={formik.handleBlur}
                            className={`p-inputtext-sm w-full ${formik.touched.lastname && formik.errors.lastname ? 'p-invalid' : ''}`}
                        />
                        {formik.touched.lastname && typeof formik.errors.lastname === 'string' && <small className="p-error">{formik.errors.lastname}</small>}
                    </div>
                </div>

                <div className="formgrid grid">
                    <div className="field col-3">
                        <label htmlFor="price">
                            <b><span className="text-red-600">*</span> Date de naissance</b>
                        </label>
                        <InputMask
                            id="date_birth"
                            name="date_birth"
                            autoComplete="off"
                            style={{
                                fontWeight: 'bold',
                                color: 'black'
                            }}
                            value={formik.values.date_birth}
                            onChange={handleChangeDateNaiss}
                            onBlur={handleBlurDateNaissance}
                            mask="99/99/9999"
                            placeholder="JJ/MM/AAAA"
                            className={`p-inputtext-sm w-full ${formik.touched.date_birth && formik.errors.date_birth ? 'p-invalid' : ''}`}
                        />
                        {formik.touched.date_birth && typeof formik.errors.date_birth === 'string' && <small className="p-error">{formik.errors.date_birth}</small>}
                    </div>
                    <div className="field col-3">
                        <label htmlFor="quantity">
                            <b><span className="text-red-600">*</span> Lieu de naissance</b>
                        </label>
                        <InputText
                            placeholder="Saisir le lieu de naissance"
                            autoComplete="off"
                            value={formik.values.place_birth}
                            id="place_birth"
                            name="place_birth"
                            style={{
                                fontWeight: 'bold',
                                color: 'black'
                            }}
                            onChange={(e) => {
                                    const value = e.target.value
                                        .toUpperCase()
                                        .normalize("NFD")
                                        .replace(/[\u0300-\u036f]/g, "");
                                    formik.setFieldValue("place_birth", value);
                            }}
                            onBlur={formik.handleBlur}
                            className={`p-inputtext-sm w-full ${formik.touched.place_birth && formik.errors.place_birth ? 'p-invalid' : ''}`}
                        />
                        {formik.touched.place_birth && typeof formik.errors.place_birth === 'string' && <small className="p-error">{formik.errors.lastname}</small>}
                    </div>

                    <div className="field col-3">
                        <label htmlFor="quantity">
                            <b><span className="text-red-600">*</span> Pays de naissance</b>
                        </label>
                        <Dropdown
                            id="countryBirth"
                            name="countryBirth"
                            style={{
                                fontWeight: 'bold',
                                color: 'black'
                            }}
                            value={formik.values.countryBirth}
                            onChange={(e) => formik.setFieldValue('countryBirth', e.value)}
                            options={pays}
                            optionLabel="name"
                            virtualScrollerOptions={{ itemSize: 30 }}
                            itemTemplate={countryOptionTemplate}
                            valueTemplate={countryOptionTemplate}
                            placeholder="Pays de naissance"
                            filter
                            className={`p-inputtext-sm w-full ${formik.touched.countryBirth && formik.errors.countryBirth ? 'p-invalid' : ''}`}
                        />
                        {formik.touched.countryBirth && typeof formik.errors.countryBirth === 'string' && <small className="p-error">{formik.errors.lastname}</small>}
                    </div>
                    <div className="field col-3">
                        <label htmlFor="quantity">
                            <b><span className="text-red-600">*</span> Nationalité</b>
                        </label>
                        <Dropdown
                            id="nationality"
                            name="nationality"
                            style={{
                                fontWeight: 'bold',
                                color: 'black'
                            }}
                            value={formik.values.nationality}
                            onChange={(e) => formik.setFieldValue('nationality', e.value)}
                            options={pays}
                            optionLabel="name"
                            virtualScrollerOptions={{ itemSize: 30 }}
                            placeholder="Nationalité"
                            itemTemplate={countryOptionTemplate}
                            valueTemplate={countryOptionTemplate}
                            filter
                            className={`p-inputtext-sm w-full ${formik.touched.nationality && formik.errors.nationality ? 'p-invalid' : ''}`}
                        />
                        {formik.touched.nationality && typeof formik.errors.nationality === 'string' && <small className="p-error">{formik.errors.lastname}</small>}
                    </div>
                </div>

                <div className="formgrid grid">
                    <div className="field col-3">
                        <label htmlFor="quantity">
                            <b><span className="text-red-600">*</span> Téléphone (Portable)</b>
                        </label>
                        <InputMask
                            mask="999999999"
                            placeholder="Téléphone"
                            autoComplete="off"
                            value={formik.values.phone1}
                            style={{
                                fontWeight: 'bold',
                                color: 'black'
                            }}
                            id="phone1"
                            name="phone1"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`p-inputtext-sm w-full ${formik.touched.phone1 && formik.errors.phone1 ? 'p-invalid' : ''}`}
                        />
                        {formik.touched.phone1 && typeof formik.errors.phone1 === 'string' && <small className="p-error">{formik.errors.lastname}</small>}
                    </div>
                    <div className="field col-4">
                        <label htmlFor="email">
                            <b><span className="text-red-600">*</span> Email du candidat</b>
                        </label>
                        <InputText
                            placeholder="Email du candidat"
                            autoComplete="off"
                            value={formik.values.email}
                            style={{
                                fontWeight: 'bold',
                                color: 'black'
                            }}
                            id="email"
                            name="email"
                            type="email"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`p-inputtext-sm w-full ${formik.touched.email && formik.errors.email ? 'p-invalid' : ''}`}
                        />
                        {formik.touched.email && typeof formik.errors.email === 'string' && <small className="p-error">{formik.errors.email}</small>}
                    </div>
                    <div className="field col-5">
                        <label htmlFor="email">Adresse</label>
                        <InputText className="p-inputtext-sm" placeholder="Adresse du candidat" style={{
                                fontWeight: 'bold',
                                color: 'black'
                            }} />
                    </div>
                </div>
            </fieldset>
        </div>,
        <div className="p-1" key="step3">
            <h5 className="text-primary">Étape 3 / 4 : Parcours du candidat</h5>

            <div className="formgrid grid">
                <div className="field col-12">
                    <fieldset className="px-5 custom-fieldset text-sm">
                        <legend className="text-primary font-bold text-sm">Epreuve (s) facultative (s)</legend>
                        <div className="formgrid grid">
                            <div className="field col-6 mt-1">
                                <label htmlFor="quantity">
                                    <b>
                                    Liste A (Des, Mus, Cout...)</b></label>
                                <Dropdown
                                    showClear
                                    id="eprFacListA"
                                    name="eprFacListA"
                                    style={{
                                        fontWeight: 'bold',
                                        color: 'black'
                                    }}
                                    value={formik.values.eprFacListA}
                                    onChange={(e) => formik.setFieldValue('eprFacListA', e.value)}
                                    options={efOptions}
                                    placeholder="Dessin, Musique, Couture..."
                                    className={`p-inputtext-sm w-full ${formik.touched.eprFacListA && formik.errors.eprFacListA ? 'p-invalid' : ''}`}
                                />
                            </div>
                            <div className="field col-6 mt-1">
                                <label htmlFor="quantity">
                                    <b>
                                    Liste B (Langues...)</b></label>
                                <Dropdown
                                    showClear
                                    id="matiere4"
                                    name="matiere4"
                                    value={formik.values.matiere4}
                                    style={{
                                        fontWeight: 'bold',
                                        color: 'black'
                                    }}
                                    onChange={(e) => {
                                        console.log('matiere4 :', e.value);
                                        formik.setFieldValue('matiere4', e.value);
                                    }}
                                    options={getAvailableOptions2(formik.values.serie?.code, 3, formik.values.matiere1?.name, formik.values.matiere2?.name, formik.values.matiere3?.name)}
                                    optionLabel="name"
                                    placeholder="Choisir une langue"
                                    filter
                                    className={`p-inputtext-sm w-full ${formik.touched.eprFacListB && formik.errors.eprFacListB ? 'p-invalid' : ''}`}
                                />
                            </div>
                        </div>
                    </fieldset>
                </div>

                {formik.values.subject != '' && (
                    <div className="field col-12">
                        <fieldset className="px-5 custom-fieldset text-sm">
                            <legend className="text-primary font-bold text-sm">Sujet de soutenance choisi par le candidat</legend>
                            <div className="formgrid grid">
                                <div className="field col-12 mt-1">
                                    <InputText
                                        id="subject"
                                        name="subject"
                                        style={{
                                            fontWeight: 'bold',
                                            color: 'black'
                                        }}
                                        value={formik.values.subject} // texte affiché
                                        placeholder="Sujet de soutenance affecté au candidat" // largeur (optionnel)                       // ajuste la taille si le contenu change
                                        readOnly // bloque la saisie
                                        className={`p-inputtext-sm w-full ${formik.touched.subject && formik.errors.subject ? 'p-invalid' : ''}`}
                                    />
                                </div>
                            </div>
                        </fieldset>
                    </div>
                )}
            </div>
        </div>,
        <div className="p-1" key="step4">
            <h5 className="text-primary">Étape 4 / 4 : Enregistrement de l&apos;inscription</h5>
            <div className="formgrid grid">
                <div className="field col-6">
                    <Button severity="success" icon="pi pi-save" label="Enregistrer les informations du dossier" className="mr-2" type="submit" />
                </div>
                {rejets && rejets.length > 0 && (
                    <div className="mt-1">
                        <h5 className="text-red-500 text-center">
                            Motifs de rejet du dossier de candidature
                        </h5>
                        <DataTable value={rejets} responsiveLayout="scroll" stripedRows className="p-datatable-sm">
                            <Column field="name" header="Motif" />
                            <Column field="observation" header="Observation (s) formulée (s) par l'Office du BAC" />
                        </DataTable>
                    </div>
                )}
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

    const options = getAvailableOptions2(formik.values.serie?.code, 3, formik.values.matiere1?.name, formik.values.matiere2?.name, formik.values.matiere3?.name);

    const formatDateForMask = (dateString?: string) => {
        if (!dateString) return '';
        // On s'attend à "1994-12-09"
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`; // -> "09/12/1994"
    };

    // IMPORTANT : Faire correspondre le string stocké dans Formik à l'objet attendu par Dropdown
    const selectedOption = options?.find((option) => option?.name === formik.values.eprFacListB) || null;

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
                            <h5>Enrôlement des candidats édition {prog?.edition}</h5>
                            {groupedCdts && Object.keys(groupedCdts).length > 0 && (
                                <TabView>
                                    {groupedCdts.map(({ serieName, cdts }) => (
                                        <TabPanel key={serieName} header={serieName}>
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
                                                rowClassName={(rowData) => {
                                                    if (rowData.decision === 1) return 'accepted-row';
                                                    if (rowData.decision === 2) return 'rejected-row';
                                                    return '';
                                                }}
                                            >
                                                <Column field="dosNumber" header="N° dossier" sortable body={dNBodyTemplate} headerStyle={{ minWidth: '5rem' }} />
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
                                                <Column field="place_birth" header="Lieu Naiss." sortable headerStyle={{ minWidth: '10rem' }} />
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
                        <Column field="dosNumber" header="N° dossier" sortable body={dNBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
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

                        <Dialog
                            visible={productDialog}
                            style={{ width: '95%', maxHeight: '95vh' }}
                            header="Fiche de candidature"
                            modal
                            className="p-fluid"
                            onHide={hideDialog}
                            contentStyle={{ height: '95vh', display: 'flex', flexDirection: 'column' }}
                        >
                            {/* {product.image && <img src={`/demo/images/product/${product.image}`} alt={product.image} width="150" className="mt-0 mx-auto mb-5 block shadow-2" />} */}

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    console.log('Formik errors:', formik.errors);
                                    formik.handleSubmit(e);
                                }}
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

                        <Dialog visible={modifCandDialog} style={{ width: '85%', maxHeight: '95vh' }} header="Modifier la fiche de candidature" modal className="p-fluid" onHide={hideDialog}>
                            {/* {product.image && <img src={`/demo/images/product/${product.image}`} alt={product.image} width="150" className="mt-0 mx-auto mb-5 block shadow-2" />} */}

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    console.log('Formik errors:', formik.errors);
                                    formik.handleSubmit(e);
                                }}
                                className="p-2"
                                style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'auto' }}
                            >
                                <Carousel value={carouselItems2} itemTemplate={(item) => <div>{item}</div>} numVisible={1} numScroll={1} showNavigators={true} showIndicators={true} responsiveOptions={carouselResponsiveOptions} />
                            </form>
                        </Dialog>
                        

                        <Dialog visible={deleteProductDialog} style={{ width: '600px' }} header="Renseignements du candidat" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
                            <div className="flex align-items-center">
                                {loading && (
                                    <div className="flex justify-content-center align-items-center" style={{ height: '100px' }}>
                                        <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="6" />
                                        Recherche des informations en cours...
                                    </div>
                                )}

                                {(baseMorte?.exclusionDuree === 0 || (baseMorte?.exclusionDuree + 1 + baseMorte?.exYearBac <= prog?.edition)) ? (
                                    <span>
                                        {/* {Number(baseMorte?.exclusionDuree) + 1 + Number(baseMorte?.exYearBac)} */}
                                        Prénom(s) : <b>{baseMorte.firstname.toUpperCase()}</b>
                                        <br />
                                        Nom : <b>{baseMorte.lastname.toUpperCase()}</b>
                                        <br />
                                        Date de naissance : <b>{baseMorte.date_birth}</b>
                                        <br />
                                        Lieu de naissance : <b>{baseMorte.place_birth}</b>
                                        <br />
                                        Sexe : <b>{baseMorte.gender}</b>
                                        <br />
                                        Pays de naissance : <b>{baseMorte.countryBirth?.name || baseMorte.countryBirth}</b>
                                        <br />
                                        Etablissement : <b>{baseMorte.etablissement?.name || baseMorte.etablissement}</b>
                                        <br />
                                        Nombre de fois : <b>{baseMorte.bac_do_count}</b>
                                        <br />
                                        Centre d&apos;Etat Civil : <b>{baseMorte.codeCentreEtatCivil}</b>
                                        <br />
                                        N° de registre : <b>{baseMorte.registryNum}</b>
                                        <br />
                                        Année de déclaration : <b>{baseMorte.yearRegistryNum}</b>
                                        <br />
                                        <b style={{ color: "green" }}>
                                            Ce candidat a déjà fait le BAC, veuillez obligatoirement précharger ses données.
                                        </b>
                                    </span>
                                ) : (baseMorte?.exclusionDuree + 1 + baseMorte?.exYearBac > prog?.edition) ? (
                                    <span>
                                        Attention ce candidat est exclu pour une durée de <b style={{ color: 'red' }}>{baseMorte.exclusionDuree} année(s)</b><br/>
                                        Il s&apos;est déjà présenté au BAC en <b style={{ color: 'blue' }}>{baseMorte.exYearBac}</b><br/>
                                        Il ne pourra faire le BAC qu&apos;en <b style={{ color: 'darkgreen' }}>{baseMorte.exYearBac + baseMorte.exclusionDuree + 1}</b>
                                    </span>
                                ) : (!baseMorte && !loading) ? (
                                    <span>
                                        <b style={{ color: "red" }}>
                                            Désolé, aucun renseignement n&apos;a été retrouvé pour ce candidat.<br/>
                                            Veuillez renseigner toutes les données du candidat.<br/>
                                        </b>
                                    </span>
                                ) : null
                                
                                }
                            </div>
                        </Dialog>


                        <Dialog visible={getResultDialog} style={{ width: '600px' }} header="Contrôle des informations du candidat" modal footer={deleteProductDialogFooter} onHide={close}>
                            <div className="flex align-items-center">
                                {loading && (
                                    <div className="flex justify-content-center align-items-center" style={{ height: '100px' }}>
                                        <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="6" />
                                        Recherche des informations en cours...
                                    </div>
                                )}

                                {(baseMorte?.exclusionDuree === 0 || (baseMorte?.exclusionDuree + 1 + baseMorte?.exYearBac <= prog?.edition)) ? (
                                    <span>
                                        {/* {Number(baseMorte?.exclusionDuree) + 1 + Number(baseMorte?.exYearBac)} */}
                                        Prénom(s) : <b>{baseMorte.firstname.toUpperCase()}</b>
                                        <br />
                                        Nom : <b>{baseMorte.lastname.toUpperCase()}</b>
                                        <br />
                                        Date de naissance : <b>{baseMorte.date_birth}</b>
                                        <br />
                                        Lieu de naissance : <b>{baseMorte.place_birth}</b>
                                        <br />
                                        Sexe : <b>{baseMorte.gender}</b>
                                        <br />
                                        Pays de naissance : <b>{baseMorte.countryBirth?.name || baseMorte.countryBirth}</b>
                                        <br />
                                        Etablissement : <b>{baseMorte.etablissement?.name || baseMorte.etablissement}</b>
                                        <br />
                                        Nombre de fois : <b>{baseMorte.bac_do_count}</b>
                                        <br />
                                        Centre d&apos;Etat Civil : <b>{baseMorte.codeCentreEtatCivil}</b>
                                        <br />
                                        N° de registre : <b>{baseMorte.registryNum}</b>
                                        <br />
                                        Année de déclaration : <b>{baseMorte.yearRegistryNum}</b>
                                        <br />
                                        <b style={{ color: "red" }}>
                                            Ce candidat a déjà fait le BAC, veuillez effectuer la saisie à partir du relevé de note.
                                        </b>
                                    </span>
                                ) : (baseMorte?.exclusionDuree + 1 + baseMorte?.exYearBac > prog?.edition) ? (
                                    <span>
                                        Attention ce candidat est exclu pour une durée de <b style={{ color: 'red' }}>{baseMorte.exclusionDuree} année(s)</b><br/>
                                        Il s&apos;est déjà présenté au BAC en <b style={{ color: 'blue' }}>{baseMorte.exYearBac}</b><br/>
                                        Il ne pourra faire le BAC qu&apos;en <b style={{ color: 'darkgreen' }}>{baseMorte.exYearBac + baseMorte.exclusionDuree + 1}</b>
                                    </span>
                                ) : (!baseMorte && !loading) ? (
                                    <span>
                                        <b style={{ color: "green" }}>
                                        Les informations du candidats ont été transmises avec succés à l&apos;Office du Baccalauréat.
                                        <br />
                                        Bonne chance.
                                        <br />
                                        </b>
                                    </span>
                                ) : null
                                
                                }
                            </div>
                        </Dialog>

                        <Dialog visible={printDialog} style={{ width: '400px' }} header="Impression de liste" modal onHide={hideDeleteProductDialog__}>
                            <div className="flex align-items-center">
                            
                                <form onSubmit={handleSubmit2} className="p-1" style={{ width: '100%', maxWidth: '640px' }}>
                                                            <div className="p-fluid">
                                                                <div className="grid">
                                                                    <div className="col-12">
                                                                        <label htmlFor="spec_id">
                                                                            <span className="text-red-500">*</span> Sélectionner le type de liste :
                                                                        </label>
                                                                         <Dropdown
                                                                            options={typeListe}
                                                                            value={selectedTL}
                                                                            // onChange={(e) => formik.setFieldValue('spec_id', e.value)}
                                                                            onChange={(e) => setSelectedTL(e.value)}
                                                                            optionLabel="label"
                                                                            optionValue="value"
                                                                            placeholder="Sélectionner le type de liste"
                                                                            style={{
                                                                                fontWeight: 'bold',
                                                                                color: 'black'
                                                                            }}
                                                                            // className={`p-inputtext-sm w-full ${formik.touched.spec_id && formik.errors.spec_id ? 'p-invalid' : ''}`}
                                                                            showClear
                                                                        />
                                                                        {errors.serie && <small className="p-error">{errors.serie}</small>}
                                                                    </div>

                                                                    {(selectedTL != 'callList' &&
                                                                    <div className="col-12">
                                                                        <label htmlFor="spec_id">
                                                                            <span className="text-red-500">*</span> Sélectionner la série à imprimer :
                                                                        </label>
                                                                        <Dropdown
                                                                            value={selectedSerie}
                                                                            options={listeSerie}
                                                                            onChange={(e) => setSelectedSerie(e.value)}
                                                                            placeholder="Sélectionner la série"
                                                                            style={{
                                                                                fontWeight: 'bold',
                                                                                color: 'black'
                                                                            }}
                                                                            showClear
                                                                        />
                                                                        {errors.serie && <small className="p-error">{errors.serie}</small>}
                                                                    </div>
                                                                    )}

                                                                    {((selectedTL != 'officiel' && selectedTL != 'callList') && 
                                                                    <div className="col-12">
                                                                        <label htmlFor="spec_id">
                                                                            <span className="text-red-500">*</span> Sélectionner la clé de tri :
                                                                        </label>
                                                                        <Dropdown
                                                                           
                                                                            options={cleDeTrie}
                                                                            value={selectedCT}
                                                                            // onChange={(e) => formik.setFieldValue('spec_id', e.value)}
                                                                            onChange={(e) => setSelectedCT(e.value)}
                                                                            optionLabel="label"
                                                                            optionValue="value"
                                                                            placeholder="Sélectionner la clé de tri"
                                                                            style={{
                                                                                fontWeight: 'bold',
                                                                                color: 'black'
                                                                            }}
                                                                            // className={`p-inputtext-sm w-full ${formik.touched.spec_id && formik.errors.spec_id ? 'p-invalid' : ''}`}
                                                                            showClear
                                                                        />
                                                                        {errors.cle && <small className="p-error">{errors.cle}</small>}
                                                                    </div>
                                                                    )}

                                                                </div>
                                
                                                                
                                                                <div className="grid">
                                                                    <div className="field col-12">
                                                                        <div>
            
                                                                                <DownloadPDFButton etablissementId={user?.acteur?.etablissement?.id} etablissementName={user?.acteur?.etablissement?.name} session={prog?.edition} serie={selectedSerie} cleDeTri={selectedCT} />                                                                        
                                                                            </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </form>
                                
                            </div>
                        </Dialog>

                        <Dialog visible={deleteProductsDialog} style={{ width: '700px' }} header="Avertissement sur fraude à l'état civil" modal footer={deleteProductsDialogFooter} onHide={hideDeleteProductsDialog}>
                            <div className="flex align-items-center justify-content-center">
                                <i className="pi pi-exclamation-triangle mr-2" style={{ fontSize: '2rem' }} />
                                {candidat && (
                                    <span>
                                        Attention cet etat civil a été déjà utilisé cette année pour l&apos;inscription du candidat : 
                                        <br />Numéro de dossier : <b>{candidat.dosNumber}</b>
                                        <br />A l&apos;établissement : <b>{candidat.etablissement?.name}</b>
                                        <br /><span style={{ color: 'red' }}>La falsification sur l&apos;état civil constitue un délit sévèrement puni par la justice Sénégalaise.</span>
                                    </span>
                                )}
                            </div>
                        </Dialog>

                        <Dialog visible={deleteProductsDialog1} style={{ width: '700px' }} header="Avertissement sur le doublon de numéro de téléphone" modal footer={deleteProductsDialogFooter1} onHide={hideDeleteProductsDialog1}>
                            <div className="flex align-items-center justify-content-center">
                                <i className="pi pi-exclamation-triangle mr-2" style={{ fontSize: '2rem' }} />
                                {candidat && (
                                    <span>
                                        Attention ce numéro de téléphone a été déjà utilisé cette année pour l&apos;inscription du candidat : 
                                        <br />Numéro de dossier : <b>{candidat.dosNumber}</b>
                                        <br />A l&apos;établissement : <b>{candidat.etablissement?.name}</b>
                                        <br /><span style={{ color: 'red' }}>Le numéro de téléphone doit être unique pour l&apos;inscription du candidat à une nouvelle session du BAC.</span>
                                    </span>
                                )}
                            </div>
                        </Dialog>

                        <Dialog visible={deleteProductsDialog2} style={{ width: '700px' }} header="Avertissement sur le doublon d'adresse email" modal footer={deleteProductsDialogFooter2_} onHide={hideDeleteProductsDialog2_}>
                            <div className="flex align-items-center justify-content-center">
                                <i className="pi pi-exclamation-triangle mr-2" style={{ fontSize: '2rem' }} />
                                {candidat && (
                                    <span>
                                        Attention cet email a été déjà utilisé cette année pour l&apos;inscription du candidat : <br />
                                        <br />Numéro de dossier : <b>{candidat.dosNumber}</b>
                                        <br />A l&apos;établissement : <b>{candidat.etablissement?.name}</b>
                                        <br /><span style={{ color: 'red' }}>L&apos;email doit être unique pour l&apos;inscription du candidat à une nouvelle session du BAC.</span>
                                    </span>
                                )}
                            </div>
                        </Dialog>

                        <Dialog visible={ageDialog} style={{ width: '700px' }} header="Incohérence année de déclaration et de naissance" modal footer={deleteAgeDialogFooter} onHide={hideAgeDialog}>
                            <div className="flex align-items-center justify-content-center">
                                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                                <p style={{ color: 'red' }}>Attention l&apos;année de déclaration ne doit pas être antérieure à l&apos;année de naissance</p>
                            </div>
                        </Dialog>

                        <Dialog visible={bfemDialog} style={{ width: '500px' }} header="Avertissement année d'obtention BFEM" modal footer={deleteProductsDialogFooter2} onHide={hideDeleteProductsDialog2}>
                            <div className="flex align-items-center justify-content-center">
                                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                                <span>L&apos;année d&apos;obtention du BFEM ne doit pas être supérieure à <b>{prog?.bfem_IfEPI}</b></span>
                            </div>
                        </Dialog>

                        <Dialog visible={bfemDialog2} style={{ width: '500px' }} header="Avertissement année d'obtention BFEM" modal footer={deleteProductsDialogFooter3} onHide={hideDeleteProductsDialog3}>
                            <div className="flex align-items-center justify-content-center">
                                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                                <span>L&apos;année d&apos;obtention du BFEM ne doit pas être supérieure à <b>{prog?.bfem_IfI}</b></span>
                            </div>
                        </Dialog>

                        <Dialog visible={deleteDialog} style={{ width: '500px' }} header="Avertissement pour suppression" modal footer={deleteDialogFooter} onHide={hideDeleteProductDialog_}>
                            <div className="flex align-items-center justify-content-center">
                                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                                <span>Attention vous vous appretez à supprimer le dossier du candidat {candidat?.dosNumber}</span>
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
