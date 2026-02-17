'use client';

import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Rating } from 'primereact/rating';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Demo } from '@/types';
import { ProductService } from '@/demo/service/ProductService';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { Calendar } from 'primereact/calendar';
import { Carousel } from 'primereact/carousel';
import { CandidatDecisionDTO, CandidatDTO, CandidatureService } from '@/demo/service/CandidatureService';
import * as Yup from 'yup';
import './style.css'; // ton style custom

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { UserContext } from '@/app/userContext';
import { useFormik } from 'formik';
import { type } from 'os';

import { InputMask } from 'primereact/inputmask';
import { Candidat } from '@/types/candidat';
import { useFormikLocalStorageDefault } from '../../scolarite/enrolement-candidat/useFormikLocalStorageDefault';
import { RadioButton } from 'primereact/radiobutton';
import { InputTextarea } from 'primereact/inputtextarea';
import ProtectedRoute from '@/layout/ProtectedRoute';
import './style.css'

const ValidationCandidat = () => {
    const { user } = useContext(UserContext);

    var is_update = useRef(false); // <== valeur persistante entre les appels
    var id_cdt = useRef(null); // <== même chose pour l'ID du candidat

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


    interface AuditLog {
        _id: string;
        natureOperation: string;
        idCandidate: string;
        operationType: string;
        fieldValues: Record<string, any>;
        login: string;
        ipAddress: string;
        timestamp: string;
    }

    const [products, setProducts] = useState(null);
    const [productDialog, setProductDialog] = useState(false);
    const [modifCandDialog, setModifCandDialog] = useState(false);
    const [deleteProductDialog, setDeleteProductDialog] = useState(false);
    const [deleteProductsDialog, setDeleteProductsDialog] = useState(false);
    const [product, setProduct] = useState(emptyProduct);
    const [selectedProducts, setSelectedProducts] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const [series, setSeries] = useState(null);
    const [cecs, setCentreECivils] = useState(null);
    const [pays, setPays] = useState(null);
    const [etabs, setEtabs] = useState(null);

    const [matieres, setMatiereOptions] = useState([]);

    const [candidats, setCandidatData] = useState([]);
    const [rawCandidats, setRawCandidats] = useState([]);
    const [reloadTrigger, setReloadTrigger] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    const [serieCode, setSerieCode] = useState(null);
    const [session, setSession] = useState(null);
    const [etablissement, setEtablissement] = useState(null);
    const [rejets, setRejets] = useState(null);

    const [prog, setOneProg] = useState<{ edition?: number } | null>(null);

    const [decisionStats, setDecisionStats] = useState({ decision0: 0, decision1: 0, decision2: 0, total: 0 });

    const [filterText, setFilterText] = useState('');

    const [selectedValues, setSelectedValues] = useState<string[]>([]);

    const [logs, setLogs] = useState<AuditLog[]>([]);
    const formatTrace = (fieldValues: Record<string, any>) => {
        const modified = fieldValues.modified || fieldValues;

        return Object.entries(modified)
            .map(([key, value]) => {
                if (value && typeof value === 'object') {
                    // Vérifie si les valeurs sont des objets et les stringify
                    const ancienne = typeof value['ancienne-donnée'] === 'object' ? JSON.stringify(value['ancienne-donnée']) : value['ancienne-donnée'] ?? '';
                    const nouvelle = typeof value['nouvelle-donnée'] === 'object' ? JSON.stringify(value['nouvelle-donnée']) : value['nouvelle-donnée'] ?? '';

                    return `<b><span style="color:blue;">${key}</span></b><br/>
            <span style="color:red;">ancienne-donnée : ${ancienne}</span><br/>
            <span style="color:green;">nouvelle-donnée : ${nouvelle}</span>`;
                }
                return `${key}: ${String(value)}`;
            })

            .join('<br/>');
    };

    useEffect(() => {
        if (rejets && Array.isArray(rejets)) {
            setSelectedValues(rejets.map((r) => r.name));
        }
    }, [rejets]);

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
        CandidatureService.getRejets().then((response) => {
            console.log('📦 Rejets chargés :', response);
            setRejets(response);
        });
    }, []);

    // Si tu as déjà rejets, pas besoin de redéclarer ici
    const filteredRejets = rejets?.filter((r) => r.name.toLowerCase().includes(filterText.toLowerCase()));

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
        CandidatureService.getEtablissements().then((response) => {
            //console.log("📦 Séries chargées :", data);
            setEtabs(response);
        });
    }, []);

    // useEffect(() => {
    //     CandidatureService.getProg().then((response) => {
    //         //console.log("📦 Séries chargées :", data);
    //         setProgs(response);
    //     });
    // }, []);

    useEffect(() => {
        CandidatureService.getLastProg().then((response) => {
            //console.log("📦 Séries chargées :", data);
            setOneProg(response);
        });
    }, []);

    const loadCandidats = useCallback(async () => {
            setLoading(true);
            setError(null);
    
            try {
                if (!etablissement || !prog) {
                setLoading(false);
                return;
                }
    
                const response = await CandidatureService.filterCandidats(etablissement.id, prog.edition);
                setRawCandidats(response || []);
            } 
            catch (err) 
            {
                console.error(err);
                setError("Erreur lors du chargement");
            } 
            finally 
            {
                setLoading(false);
            }
        }, [etablissement, prog]);
    
        useEffect(() => { 
            loadCandidats(); 
        }, [loadCandidats]);
    
        const filteredCandidats = useMemo(() => {
        if (!rawCandidats || rawCandidats.length === 0) return [];
            const code = typeof serieCode === 'string' ? serieCode : serieCode?.code;
            return code ? rawCandidats.filter(c => c.serie?.code === code) : rawCandidats;
        }, [rawCandidats, serieCode]);
    
        useEffect(() => {
            setCandidatData(filteredCandidats);
    
            const decisionCounts = {
                decision0: filteredCandidats.filter(c => c.decision === 0).length,
                decision1: filteredCandidats.filter(c => c.decision === 1).length,
                decision2: filteredCandidats.filter(c => c.decision === 2).length,
                total: filteredCandidats.length,
            };
            setDecisionStats(decisionCounts);
        }, [filteredCandidats]);

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

    const decisions = [
        { label: 'Dossier Accepté', value: 1 },
        { label: 'Dossier Rejeté', value: 2 }
    ];

    const getColor = (value) => {
        if (value === 1) return 'SpringGreen';
        if (value === 2) return 'Salmon';
        return 'white';
    };

    const countryOptionTemplate = (country) => {
        return (
            <div className="country-item">
                <img alt={country.code} src={`https://flagcdn.com/16x12/${country.code.toLowerCase()}.png`} className="mr-2" />
                <span>{country.name}</span>
            </div>
        );
    };

    const getAvailableOptions = (code, order, exclude1, exclude2, exclude3) =>
        matieres.filter((m) => {
            return m.order == order && m.serie.code === code && m.name !== exclude1 && m.name !== exclude2 && m.name !== exclude3;
        });

    const getAvailableOptions2 = (code: string | undefined, order: number, exclude1?: string, exclude2?: string, exclude3?: string) => {
        if (!code) {
            return [];
        }

        console.log('Etape 1');

        const allForSerie = matieres.filter((m) => m.serie.code === code);

        // Séries pour lesquelles on doit "vider" les exclusions
        const seriesSansExclusion = ['F6', 'L-AR', 'S1', 'S2', 'S3', 'S4', 'S5', 'T1', 'T2', 'STIDD', 'STEG', 'S1AR', 'S2AR'];

        const isSerieSansExclusion = seriesSansExclusion.includes(code);

        console.log('Etape 2');

        console.log(isSerieSansExclusion);

        if (isSerieSansExclusion) {
            const allForSerieX = matieres.filter((m) => m.serie.code !== code);
            console.log('✅ Contenu de allForSerie pour une série sans exclusion :', allForSerie);
            const uniqueNames = new Set<string>();
            return allForSerieX.filter((m) => {
                const isExcluded = m.matiere === 'SN';
                const isExcluded2 = m.name === 'ECONOMIE';
                if (!isExcluded && !isExcluded2 && !uniqueNames.has(m.name)) {
                    uniqueNames.add(m.name);
                    return true;
                }
                return false;
            });
        }

        console.log('Etape 3');

        // Si aucune matière encore choisie (toutes exclusions vides)
        const noExclusionSelected = !exclude1 && !exclude2 && !exclude3;

        console.log('TEK KHEL', exclude1, exclude2, exclude3);
        console.log(noExclusionSelected);

        if (noExclusionSelected) {
            // Aucun filtre d'exclusion → toutes les matières sans doublon
            const uniqueNames = new Set<string>();
            return allForSerie.filter((m) => {
                const isExcluded = m.matiere === 'SN';
                const isExcluded2 = m.name === 'ECONOMIE';
                if (!isExcluded && !isExcluded2 && !uniqueNames.has(m.name)) {
                    uniqueNames.add(m.name);
                    return true;
                }
                return false;
            });
        } else {
            // Cas normal : filtre par ordre + exclusions, puis suppression des doublons sur le name
            const uniqueNames = new Set<string>();
            return allForSerie.filter((m) => {
                const isExcluded = m.matiere === 'SN' || m.name === 'ECONOMIE' || m.name === exclude1 || m.name === exclude2 || m.name === exclude3;

                if (!isExcluded && !uniqueNames.has(m.name)) {
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

    const openNew = () => {
        formik.resetForm(); // remet à zéro les erreurs et touches
        formik.setValues(Object); // valeurs initiales
        setSubmitted(false);
        //setIsEditMode(false); // facultatif : flag pour différencier "ajouter" / "modifier"
        setProductDialog(true); // ou ton Dialog / Carousel
    };

    const hideDialog = () => {
        if (productDialog) {
            setSubmitted(false);
            setProductDialog(false);
        }
        if (modifCandDialog) {
            setSubmitted(false);
            setModifCandDialog(false);
        }
    };

    const hideDeleteProductDialog = () => {
        setDeleteProductDialog(false);
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

    const editProduct = async (candidat) => {
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
        is_update.current = true;
        console.log(is_update);

        const response = await CandidatureService.getAuditReceptionDossier(id_cdt.current);
        setLogs(response); // ici tu affectes la vraie valeur

        // récupérer les rejets
        const rejets = candidat.rejets
            ? candidat.rejets.map((r) => ({
                  id: r.id,
                  name: r.name,
                  observation: r.observation
              }))
            : [];

        // initialiser les checkboxes avec les noms
        setSelectedValues(rejets.map((r) => r.name));
    };

    const confirmDeleteProduct = (product) => {
        setProduct(product);
        setDeleteProductDialog(true);
    };

    const deleteProduct = () => {
        let _products = products.filter((val) => val.id !== product.id);
        setProducts(_products);
        setDeleteProductDialog(false);
        setProduct(emptyProduct);
        toast.current.show({
            severity: 'success',
            summary: 'Successful',
            detail: 'Product Deleted',
            life: 3000
        });
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
            <React.Fragment>
                <div className="formgrid grid">
                    <div className="field col-12">
                        <fieldset className="p-2 border-round-md surface-border text-sm" style={{ padding: '16px' }}>
                            <legend className="text-primary font-bold text-sm">Effectuer les filtres (Tous les champs doivent être sélectionnés)</legend>

                            <div
                                className="filter-container"
                                style={{
                                    display: 'flex',
                                    gap: '10px', // espace entre les deux champs
                                    alignItems: 'flex-start',
                                    flexWrap: 'wrap'
                                }}
                            >
                                <div style={{ width: '600px' }}>
                                    <label htmlFor="etablissement">
                                        <h6 className="m-0">Choisir un établissement</h6>
                                    </label>
                                    <Dropdown
                                        id="etablissement"
                                        name="etablissement"
                                        options={etabs}
                                        optionLabel="code"
                                        placeholder="Choisir un établissement"
                                        value={etablissement}
                                        onChange={(e) => setEtablissement(e.value)}
                                        filter
                                        className="p-inputtext-sm w-full"
                                        style={{ width: '100%' }}
                                        virtualScrollerOptions={{ itemSize: 40 }} // ou 30 selon le style
                                    />
                                </div>

                                <div style={{ width: '200px' }}>
                                    <label htmlFor="serieCode">
                                        <h6 className="m-0">Choisir une série</h6>
                                    </label>
                                    <Dropdown
                                        id="serieCode"
                                        name="serieCode"
                                        options={series}
                                        value={serieCode}
                                        onChange={(e) => setSerieCode(e.value)}
                                        disabled={!etabs || etabs.length === 0}
                                        optionLabel="code"
                                        placeholder="Choisir une série"
                                        filter
                                        className="p-inputtext-sm w-full"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </div>
                        </fieldset>
                    </div>
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                {/* <Button severity="info" label="Importer la liste" icon="pi pi-arrow-down-right" className="mr-2 inline-block"/>
                <Button severity="help" label="Exporter la liste" icon="pi pi-upload" onClick={exportCSV} /> */}
                {/* <DownloadPDFButton etablissementId={etablissement?.id} etablissementName={etablissement?.name} session={prog?.edition} /> */}
            </React.Fragment>
        );
    };

    interface DownloadPDFButtonProps {
        etablissementId: String;
        etablissementName: String;
        session: number;
    }

    // const DownloadPDFButton: React.FC<DownloadPDFButtonProps> = ({ etablissementId, session, etablissementName }) => {
    //     const [loading, setLoading] = useState(false);

    //     // ✅ Si aucun établissement n'est sélectionné, ne rien afficher
    //     if (!etablissementId) return null;

    //     const handleDownload = async () => {
    //         setLoading(true);
    //         try {
    //             await CandidatureService.getListByEtab(etablissementId, session, etablissementName, user?.login);
    //         } catch (error) {
    //             console.error('Erreur lors du téléchargement du fichier PDF.', error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     return <Button label={loading ? 'Téléchargement...' : "Télécharger la liste compléte de l'établissement"} icon="pi pi-download" onClick={handleDownload} disabled={loading} className="p-button-primary" />;
    // };

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
                <span className="p-column-title">gender</span>
                {rowData.gender}
            </>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-search" label="Consultation du dossier" rounded severity="info" className="mr-2" onClick={() => editProduct(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <div className="flex flex-wrap gap-3">
                {candidats && candidats.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-3">
                        <div className="bg-cyan-100 text-black-800 px-4 py-2 rounded-xl">
                            <strong>{etablissement?.name}</strong>
                        </div>
                        <div className="bg-yellow-100 text-black-800 px-4 py-2 rounded-xl">
                            📂 Dossier en attente :{' '}
                            <strong>
                                {decisionStats.decision0} sur {decisionStats.total}
                            </strong>
                        </div>
                        <div className="bg-green-100 text-black-800 px-4 py-2 rounded-xl">
                            ✅ Dossier validé :{' '}
                            <strong>
                                {decisionStats.decision1} sur {decisionStats.total}
                            </strong>
                        </div>
                        <div className="bg-red-100 text-black-800 px-4 py-2 rounded-xl">
                            ❌ Dossier rejeté :{' '}
                            <strong>
                                {decisionStats.decision2} sur {decisionStats.total}
                            </strong>
                        </div>
                    </div>
                )}
            </div>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter((e.target as HTMLInputElement).value)} placeholder="Recherche..." />
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
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteProductDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={deleteProduct} />
        </>
    );
    const deleteProductsDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteProductsDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={deleteSelectedProducts} />
        </>
    );

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
            bac_do_count: '',
            year_bfem: '',
            origine_bfem: '',
            subject: '',
            handicap: false,
            type_handicap: '',
            eps: '',
            cdt_is_cgs: false,
            decision: 0,
            options: [],
            matiere1: null,
            matiere2: null,
            matiere3: null,
            matiere4: null,
            etablissement: null,
            centreEtatCivil: null,
            typeCandidat: null,
            serie: null,
            nationality: null,
            countryBirth: null,
            concoursGeneral: null,
            eprFacListA: '',
            eprFacListB: null,
            codeCentre: '',
            motif: []
        },

        validationSchema: Yup.object({
            serie: Yup.object().nullable().required('Champ obligatoire'),
            dosNumber: Yup.string().required('Champ obligatoire'),
            bac_do_count: Yup.number().required('Champ obligatoire'),
            centreEtatCivil: Yup.object().nullable().required('Champ obligatoire'),
            year_registry_num: Yup.number().required('Champ obligatoire'),
            registry_num: Yup.string().required('Champ obligatoire'),
            // ...(radioValue == 2 && {
            //     motif: Yup.string().required('Champ obligatoire'),
            // }),
            gender: Yup.string().required('Champ obligatoire'),
            type_handicap: Yup.string().required('Champ obligatoire'),
            firstname: Yup.string().required('Champ obligatoire (en majuscule)'),
            lastname: Yup.string().required('Champ obligatoire (en majuscule)'),
            date_birth: Yup.string().required('Champ obligatoire'),
            place_birth: Yup.string().required('Champ obligatoire'),
            nationality: Yup.object().nullable().required('Champ obligatoire'),
            countryBirth: Yup.object().nullable().required('Champ obligatoire'),
            phone1: Yup.string().required('Champ obligatoire'),
            email: Yup.string().required('Champ obligatoire'),
            //year_bfem: Yup.string().required('Champ obligatoire'),
            eps: Yup.string().required('Champ obligatoire')
            // Ajoute ici d’autres règles de validation pour chaque champ
        }),

        onSubmit: async (values, { setSubmitting, resetForm }) => {
            console.log('cliquer...', formik.values.decision);

            console.log('OK OK...', selectedValues);

            // Construire dynamiquement la liste des matières choisies
            const selectedOptions = [values.matiere1?.name, values.matiere2?.name, values.matiere3?.name].filter((m) => m !== null); // transformer chaque matière en objet { id: ... }

            console.log(selectedOptions);

            const candidatDTO: CandidatDecisionDTO = {
                dosNumber: values.dosNumber,
                firstname: values.firstname,
                lastname: values.lastname,
                date_birth: values.date_birth, // Assure-toi qu'il est bien au format 'yyyy-MM-dd'
                place_birth: values.place_birth,
                gender: values.gender,
                phone1: values.phone1,
                phone2: values.phone2,
                email: values.email,
                year_registry_num: Number(values.year_registry_num),
                registry_num: Number(values.registry_num),
                bac_do_count: Number(values.bac_do_count),
                year_bfem: Number(values.year_bfem),
                subject: values.subject,
                handicap: values.handicap,
                type_handicap: values.type_handicap,
                eps: values.eps,
                cdt_is_cgs: values.cdt_is_cgs,
                //options: selectedOptions,
                matiere1: values.matiere1,
                matiere2: values.matiere2,
                matiere3: values.matiere3,

                etablissement: user?.acteur?.etablissement,
                centreEtatCivil: values.centreEtatCivil,
                typeCandidat: user?.acteur?.etablissement?.typeCandidat,
                serie: values.serie,
                nationality: values.nationality,
                concoursGeneral: values.concoursGeneral,
                countryBirth: values.countryBirth,
                eprFacListA: values.eprFacListA,
                eprFacListB: values.matiere4,
                session: Number(prog?.edition),
                origine_bfem: values.origine_bfem || 'Aucun',
                decision: formik.values.decision,
                motif: selectedValues,
                operator: ''
            };

            try {
                console.log('PATCH');
                const response = await CandidatureService.updateDecision(id_cdt, candidatDTO);
                console.log('✅ Candidat mis à jour:', response.data);
                setMessage('Candidat créé avec succès');
                toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Dossier du candidat vérifié avec succès', life: 4000 });
                //resetForm();
                await loadCandidats();
            } catch (error) {
                console.error('❌ Erreur lors de la création du candidat:', error);
                setMessage('Erreur lors de la création du candidat');
                toast.current.show({ severity: 'error', summary: 'Office du Bac', detail: 'Erreur lors de la validation du candidat', life: 4000 });
            } finally {
                setSubmitting(false);
            }
            setSubmitted(false);
            setProductDialog(false);
            setModifCandDialog(false);
        }
    });

    const [radioValue, setRadioValue] = useState(null);

    useEffect(() => {
        setRadioValue(formik.values.decision);
    }, [formik.values.decision]);

    const handleMatiere1Change = useFormikLocalStorageDefault(formik, 'matiere1');
    const handleMatiere2Change = useFormikLocalStorageDefault(formik, 'matiere2');
    const handleMatiere3Change = useFormikLocalStorageDefault(formik, 'matiere3');
    //const handleMatiere4Change = useFormikLocalStorageDefault(formik, 'matiere4');

    const carouselItems2 = [
        <div key="step1">
            <h5 className="text-primary">Étape 1 / 2 : Données du candidat</h5>

            <div className="formgrid grid">
                <div className="field col-6">
                    <fieldset className="p-1 px-1 py-1 border-round-md surface-border text-sm">
                        <legend className="text-primary font-bold">Référence de la pièce tenant lieu d&apos;acte de naissance</legend>
                        <div className="formgrid grid">
                            <div className="field col-4">
                                <label htmlFor="price">
                                    <b>Code Centre Etat Civil</b>
                                </label>
                                <InputText readOnly value={formik.values.codeCentre || ''} className="p-inputtext-sm" />
                            </div>
                            <div className="field col-6">
                                <label htmlFor="quantity">
                                    <b>Nom / Centre Etat-Civil</b>
                                </label>
                                <Dropdown
                                    readOnly
                                    id="centreEtatCivil"
                                    name="centreEtatCivil"
                                    value={formik.values.centreEtatCivil}
                                    onChange={() => {
                                        /* ignore → readonly simulé */
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
                                    <b>Année</b>
                                </label>
                                <InputText
                                    readOnly
                                    id="year_registry_num"
                                    name="year_registry_num"
                                    value={formik.values.year_registry_num}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`p-inputtext-sm w-full ${formik.touched.year_registry_num && formik.errors.year_registry_num ? 'p-invalid' : ''}`}
                                />
                                {formik.touched.year_registry_num && typeof formik.errors.year_registry_num === 'string' && <small className="p-error">{formik.errors.year_registry_num}</small>}
                            </div>
                        </div>
                    </fieldset>
                </div>
                <div className="field col-6">
                    <div className="formgrid grid">
                        {/* <div className="field col-4">
                        <label htmlFor="price">N° de table</label>
                            <InputText readOnly className="p-inputtext-sm" placeholder="N° de table si redoublant"/>
                    </div> */}

                        <div className="field col-2">
                            <label htmlFor="price">
                                <b>N° acte</b>
                            </label>
                            <InputText
                                id="registry_num"
                                readOnly
                                name="registry_num"
                                value={formik.values.registry_num}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`p-inputtext-sm w-full ${formik.touched.registry_num && formik.errors.registry_num ? 'p-invalid' : ''}`}
                            />
                            {formik.touched.registry_num && typeof formik.errors.registry_num === 'string' && <small className="p-error">{formik.errors.registry_num}</small>}
                        </div>
                        <div className="field col-3">
                            <label htmlFor="quantity">
                                <b>* N° de dossier</b>
                            </label>
                            <InputText
                                readOnly
                                id="dosNumber"
                                name="dosNumber"
                                placeholder="N° de dossier"
                                value={formik.values.dosNumber}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`p-inputtext-sm w-full ${formik.touched.dosNumber && formik.errors.dosNumber ? 'p-invalid' : ''}`}
                            />
                            {formik.touched.dosNumber && typeof formik.errors.dosNumber === 'string' && <small className="p-error">{formik.errors.dosNumber}</small>}
                        </div>

                        <div className="field col-4">
                            <label htmlFor="price">
                                <b>Type de candidat</b>
                            </label>
                            <InputText
                                readOnly
                                className="p-inputtext-sm"
                                value={formik.values.typeCandidat?.name}
                                style={{
                                    fontWeight: 'bold',
                                    color: formik.values.typeCandidat?.name === 'Individuel/Libre' ? 'darkblue' : 'darkgreen'
                                }}
                            />
                        </div>
                        <div className="field col-3">
                            <label>
                                <b>* Série</b>
                            </label>
                            <Dropdown
                                readOnly
                                id="serie"
                                name="serie"
                                value={formik.values.serie}
                                onChange={() => {
                                    /* ignore → readonly simulé */
                                }}
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
                </div>
            </div>

            {/* <div className="formgrid grid">
                            <div className="field col-3">
                                <label htmlFor="quantity">* Handicap</label>
                                <Dropdown
                                    id="type_handicap"
                                    name="type_handicap"
                                    value={formik.values.type_handicap}
                                    onChange={(e) => formik.setFieldValue('type_handicap', e.value)}
                                    options={handicapOptions}
                                    // optionLabel="code" // adapter si ton objet contient un champ "libelle"
                                    placeholder="Sélectionner l'handicap"
                                    className={`p-inputtext-sm w-full ${formik.touched.type_handicap && formik.errors.type_handicap ? 'p-invalid' : ''}`}
                                />
                                {formik.touched.type_handicap && typeof formik.errors.type_handicap === 'string' && (
                                <small className="p-error">{formik.errors.type_handicap}</small>
                            )} 

                            </div>
                        </div> */}

            <div className="formgrid grid">
                <div className="field col-8">
                    <label htmlFor="price">
                        <b>* Prénom (s)</b>
                    </label>
                    <InputText
                        placeholder="Saisir le prénom (s)"
                        readOnly
                        id="firstname"
                        name="firstname"
                        value={formik.values.firstname}
                        onChange={(e) => formik.setFieldValue('firstname', e.target.value.toUpperCase())}
                        onBlur={formik.handleBlur}
                        className={`p-inputtext-sm w-full ${formik.touched.firstname && formik.errors.firstname ? 'p-invalid' : ''}`}
                    />
                    {formik.touched.firstname && typeof formik.errors.firstname === 'string' && <small className="p-error">{formik.errors.firstname}</small>}
                </div>

                <div className="field col-3">
                    <label htmlFor="quantity">
                        <b>* Nom</b>
                    </label>
                    <InputText
                        placeholder="Saisir le nom"
                        readOnly
                        value={formik.values.lastname}
                        id="lastname"
                        name="lastname"
                        onChange={(e) => formik.setFieldValue('lastname', e.target.value.toUpperCase())}
                        onBlur={formik.handleBlur}
                        className={`p-inputtext-sm w-full ${formik.touched.lastname && formik.errors.lastname ? 'p-invalid' : ''}`}
                    />
                    {formik.touched.lastname && typeof formik.errors.lastname === 'string' && <small className="p-error">{formik.errors.lastname}</small>}
                </div>
                <div className="field col-1">
                    <label htmlFor="quantity">
                        <b>* Sexe</b>
                    </label>

                    <Dropdown
                        readOnly
                        id="gender"
                        name="gender"
                        value={formik.values.gender}
                        onChange={() => {
                            /* ignore → readonly simulé */
                        }}
                        options={sexeOptions}
                        // optionLabel="code" // adapter si ton objet contient un champ "libelle"
                        placeholder="Sélectionner le sexe"
                        className={`p-inputtext-sm w-full ${formik.touched.gender && formik.errors.gender ? 'p-invalid' : ''}`}
                    />
                    {formik.touched.gender && typeof formik.errors.gender === 'string' && <small className="p-error">{formik.errors.gender}</small>}
                </div>
            </div>

            <div className="formgrid grid">
                <div className="field col-3">
                    <label htmlFor="price">
                        <b>* Date de naissance</b>
                    </label>
                    <InputMask
                        readOnly
                        id="date_birth"
                        name="date_birth"
                        value={formik.values.date_birth}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        mask="99/99/9999"
                        placeholder="JJ/MM/AAAA"
                        className={`p-inputtext-sm w-full ${formik.touched.date_birth && formik.errors.date_birth ? 'p-invalid' : ''}`}
                    />

                    {formik.touched.date_birth && typeof formik.errors.date_birth === 'string' && <small className="p-error">{formik.errors.lastname}</small>}
                </div>
                <div className="field col-3">
                    <label htmlFor="quantity">
                        <b>* Lieu de naissance</b>
                    </label>
                    <InputText
                        readOnly
                        placeholder="Saisir le lieu de naissance"
                        value={formik.values.place_birth}
                        id="place_birth"
                        name="place_birth"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`p-inputtext-sm w-full ${formik.touched.place_birth && formik.errors.place_birth ? 'p-invalid' : ''}`}
                    />
                    {formik.touched.place_birth && typeof formik.errors.place_birth === 'string' && <small className="p-error">{formik.errors.lastname}</small>}
                </div>

                {/* <div className="field col-3">
                                <label htmlFor="quantity">* Pays de naissance</label>
                                    <Dropdown
                                        id="countryBirth"
                                        name="countryBirth"
                                        value={formik.values.countryBirth}
                                        onChange={(e) => formik.setFieldValue('countryBirth', e.value)}
                                        options={pays}
                                        optionLabel="name"
                                        virtualScrollerOptions={{ itemSize: 30 }}
                                        // optionLabel="code" // adapter si ton objet contient un champ "libelle"
                                        placeholder="Pays de naissance"
                                        filter
                                        className={`p-inputtext-sm w-full ${formik.touched.countryBirth && formik.errors.countryBirth ? 'p-invalid' : ''}`}
                                />
                                {formik.touched.countryBirth && typeof formik.errors.countryBirth === 'string' && (
                                <small className="p-error">{formik.errors.lastname}</small>
                                )} 
                            </div> */}
                <div className="field col-3">
                    <label htmlFor="quantity">
                        <b>* Nationalité</b>
                    </label>
                    <Dropdown
                        readOnly
                        id="nationality"
                        name="nationality"
                        value={formik.values.nationality}
                        onChange={() => {
                            /* ignore → readonly simulé */
                        }}
                        options={pays}
                        optionLabel="name"
                        virtualScrollerOptions={{ itemSize: 30 }}
                        // optionLabel="code" // adapter si ton objet contient un champ "libelle"
                        placeholder="Nationalité"
                        filter
                        className={`p-inputtext-sm w-full ${formik.touched.nationality && formik.errors.nationality ? 'p-invalid' : ''}`}
                    />
                    {formik.touched.nationality && typeof formik.errors.nationality === 'string' && <small className="p-error">{formik.errors.lastname}</small>}
                </div>
                <div className="field col-3">
                    <br />
                    <span
                        style={{
                            backgroundColor: formik.values.decision === 1 ? 'lightgreen' : formik.values.decision === 2 ? 'tomato' : 'transparent',
                            borderRadius: '5px',
                            color: 'black',
                            fontWeight: 'bold',
                            marginTop: '2px',
                            fontSize: '28px',
                            padding: '4px'
                        }}
                    >
                        {formik.values.decision === 1 ? 'Dossier Accepté' : formik.values.decision === 2 ? 'Dossier Rejeté' : ''}
                    </span>
                </div>
            </div>

            {/* <div className="formgrid grid">                          
                            <div className="field col-3">
                                <label htmlFor="quantity">* Téléphone (Portable)</label>
                                <InputText 
                                    placeholder="Téléphone du candidat" 
                                    value={formik.values.phone1}
                                    id="phone1"
                                    name="phone1"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`p-inputtext-sm w-full ${formik.touched.phone1 && formik.errors.phone1 ? 'p-invalid' : ''}`}
                                />
                                {formik.touched.phone1 && typeof formik.errors.phone1 === 'string' && (
                                <small className="p-error">{formik.errors.lastname}</small>
                                )} 
                            </div>
                            <div className="field col-4">
                                <label htmlFor="email">* Email du candidat</label>
                                 <InputText 
                                    placeholder="Email du candidat" 
                                    value={formik.values.email}
                                    id="email"
                                    name="email"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`p-inputtext-sm w-full ${formik.touched.email && formik.errors.email ? 'p-invalid' : ''}`}
                                />
                                 {formik.touched.email && typeof formik.errors.email === 'string' && (
                                <small className="p-error">{formik.errors.email}</small>
                                )} 
                            </div>
                            <div className="field col-5">
                                <label htmlFor="email">Adresse</label>
                                <InputText readOnly className="p-inputtext-sm" placeholder="Adresse du candidat"/>
                            </div>
                        </div> */}

            <div className="formgrid grid py-3">
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
                                        <fieldset className="mt-3 px-3 py-3 custom-fieldset text-sm">
                                            <legend className="font-bold text-sm">Matière (s) optionnelle (s)</legend>
                                            <div className="formgrid grid">
                                                <div className="field col-4">
                                                    <label htmlFor="quantity">
                                                        <b>Option 1</b>
                                                    </label>
                                                    <Dropdown
                                                        readOnly
                                                        showClear
                                                        id="matiere1"
                                                        name="matiere1"
                                                        value={formik.values.matiere1}
                                                        onChange={() => {
                                                                /* ignore → readonly simulé */
                                                        }}
                                                        options={getAvailableOptions(formik.values.serie?.code, 1, formik.values.matiere2?.name, formik.values.matiere3?.name, formik.values.matiere4?.name)}
                                                        optionLabel="name"
                                                        placeholder="Choisir une matière"
                                                        className="w-full"
                                                        style={{
                                                            fontWeight: 'bold',
                                                            color: 'black'
                                                        }}
                                                        filter
                                                        key={formik.values.matiere1?.id}
                                                    />
                                                </div>
                                                {formik.values.serie?.code !== 'STIDD' && formik.values.serie?.code !== 'S1A' && formik.values.serie?.code !== 'S2A' && (
                                                    <div className="field col-4">
                                                        <label htmlFor="quantity">
                                                            <b>Option 2</b>
                                                        </label>
                                                        <Dropdown
                                                            readOnly
                                                            showClear
                                                            id="matiere2"
                                                            name="matiere2"
                                                            value={formik.values.matiere2}
                                                            onChange={() => {
                                                                /* ignore → readonly simulé */
                                                            }}
                                                            options={getAvailableOptions(formik.values.serie?.code, 2, formik.values.matiere1?.name, formik.values.matiere3?.name, formik.values.matiere4?.name)}
                                                            optionLabel="name"
                                                            placeholder="Choisir une matière"
                                                            className="w-full"
                                                            style={{
                                                                fontWeight: 'bold',
                                                                color: 'black'
                                                            }}
                                                            filter
                                                            key={formik.values.matiere2?.id}
                                                        />
                                                    </div>
                                                )}
                                                {formik.values.serie?.code !== 'STIDD' && formik.values.serie?.code !== "L'1" && formik.values.serie?.code !== 'L1A' && formik.values.serie?.code !== 'S1A' && formik.values.serie?.code !== 'S2A' && (
                                                    <div className="field col-4">
                                                        <label htmlFor="quantity">
                                                            <b>Option 3</b>
                                                        </label>
                                                        <Dropdown
                                                            readOnly
                                                            showClear
                                                            id="matiere3"
                                                            name="matiere3"
                                                            value={formik.values.matiere3}
                                                            onChange={() => {
                                                                /* ignore → readonly simulé */
                                                            }}
                                                            options={getAvailableOptions(formik.values.serie?.code, 3, formik.values.matiere1?.name, formik.values.matiere2?.name, formik.values.matiere4?.name)}
                                                            optionLabel="name"
                                                            placeholder="Choisir une matière"
                                                            className="w-full"
                                                            filter
                                                            style={{
                                                                fontWeight: 'bold',
                                                                color: 'black'
                                                            }}
                                                            key={formik.values.matiere3?.id}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </fieldset>
                                    )}
                            </div>
            
                            <div className="col-4">
                                <fieldset className="mt-3 px-3 py-3 custom-fieldset text-sm">
                                    <legend className="font-bold text-sm mb-1">EPS & Handicap</legend>
                                    <div className="formgrid grid">
                                        <div className="field col-6">
                                            <label htmlFor="type_handicap">
                                                <b>Handicap</b>
                                            </label>
                                            <Dropdown
                                                readOnly
                                                id="type_handicap"
                                                name="type_handicap"
                                                value={formik.values.type_handicap}
                                                onChange={() => {
                                                    /* ignore → readonly simulé */
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
                                                readOnly
                                                id="eps"
                                                name="eps"
                                                value={formik.values.eps}
                                                onChange={() => {
                                                    /* ignore → readonly simulé */
                                                }}
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
                    <fieldset className="p-2 px-1 py-1 border-round-md surface-border text-sm">
                        <legend className="text-primary font-bold text-sm">Epreuve (s) facultative (s)</legend>
                        <div className="formgrid grid">
                            <div className="field col-6 mt-1">
                                <label htmlFor="quantity">
                                    <b>Liste B (Langues...)</b>
                                </label>
                                <Dropdown
                                    readOnly
                                    id="matiere4"
                                    name="matiere4"
                                    value={formik.values.matiere4}
                                    onChange={() => {
                                        /* ignore → readonly simulé */
                                    }}
                                    options={getAvailableOptions2(formik.values.serie?.code, 3, formik.values.matiere1?.name, formik.values.matiere2?.name, formik.values.matiere3?.name)}
                                    optionLabel="name"
                                    placeholder="Choisir une langue"
                                    filter
                                    className={`p-inputtext-sm w-full ${formik.touched.eprFacListB && formik.errors.eprFacListB ? 'p-invalid' : ''}`}
                                />
                            </div>
                            <div className="field col-6 mt-1">
                                <label htmlFor="quantity">
                                    <b>Liste A (Des, Mus, Cout...)</b>
                                </label>
                                <Dropdown
                                    readOnly
                                    id="eprFacListA"
                                    name="eprFacListA"
                                    value={formik.values.eprFacListA}
                                    onChange={() => {
                                        /* ignore → readonly simulé */
                                    }}
                                    options={efOptions}
                                    placeholder="Dessin, Musique, Couture..."
                                    className={`p-inputtext-sm w-full ${formik.touched.eprFacListA && formik.errors.eprFacListA ? 'p-invalid' : ''}`}
                                />
                            </div>
                        </div>
                    </fieldset>
                </div>
                <div className="field col-2">
                    <label htmlFor="price">
                        <b>* Nombre de fois</b>
                    </label>
                    <InputText
                        readOnly
                        id="bac_do_count"
                        name="bac_do_count"
                        value={formik.values.bac_do_count}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`p-inputtext-sm w-full ${formik.touched.bac_do_count && formik.errors.bac_do_count ? 'p-invalid' : ''}`}
                        placeholder="Nombre de fois"
                    />
                </div>
                <div className="field col-4">
                    {formik.values.typeCandidat?.name != 'Régulier/Officiel' && (
                        <fieldset className="p-2 px-1 py-1 border-round-md surface-border text-sm">
                            <legend className="text-primary font-bold text-sm">Diplôme d&apos;accès au BAC</legend>
                            <div className="formgrid grid">
                                <div className="field col-7 mt-1">
                                    <label htmlFor="quantity">
                                        <b>Origine du BFEM</b>
                                    </label>
                                    <Dropdown
                                        id="origine_bfem"
                                        name="origine_bfem"
                                        value={formik.values.origine_bfem}
                                        onChange={() => {
                                            /* ignore → readonly simulé */
                                        }}
                                        options={origineOptions}
                                        // optionLabel="code" // adapter si ton objet contient un champ "libelle"
                                        placeholder="Origine du BFEM"
                                        className={`p-inputtext-sm w-full ${formik.touched.origine_bfem && formik.errors.origine_bfem ? 'p-invalid' : ''}`}
                                    />
                                    {formik.touched.origine_bfem && typeof formik.errors.origine_bfem === 'string' && <small className="p-error">{formik.errors.origine_bfem}</small>}
                                </div>
                                <div className="field col-5 mt-1">
                                    <label htmlFor="price">
                                        <b>* Année BFEM</b>
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
                </div>
            </div>
        </div>,

        //         <h5 className="text-primary">Étape 3 / 4 : Parcours du candidat</h5>

        //             {formik.values.subject !== ""
        //                 && (
        //             <div className="formgrid grid">
        //         <div className="field col-12">
        //                     <fieldset className="border-round-md surface-border text-sm">
        //                         <legend className="text-primary font-bold">Sujet choisi par le candidat</legend>
        //                         <div className="formgrid grid">

        //                             <div className="field col-12">
        //                                 <label htmlFor="quantity">Libellé du sujet</label>
        //                                 <InputTextarea
        //                                     readOnly
        //                                     style={{ resize: 'none' }}
        //                                     rows={7}
        //                                     cols={32}
        //                                     id="centreEtatCivil"
        //                                     name="centreEtatCivil"
        //                                     value={formik.values.subject}
        //                                     placeholder="Libellé du sujet"
        //                                     className={`p-inputtext-sm w-full ${formik.touched.centreEtatCivil && formik.errors.centreEtatCivil ? 'p-invalid' : ''}`}
        //                                 />
        //                                 {formik.touched.centreEtatCivil && typeof formik.errors.centreEtatCivil === 'string' && (
        //                                     <small className="p-error">{formik.errors.centreEtatCivil}</small>
        //                                 )}
        //                             </div>

        //                         </div>
        //                     </fieldset>
        //                 </div>
        //             </div>)}

        // </div>,
        <div key="step2">
            <h5 className="text-primary">Étape 2 / 2 : Audit des logs du dossier de candidature</h5>
            <div className="formgrid grid">
                <div className="col-12 md:col-12">
                    <div className="card">
                        <table className="min-w-full border border-gray-300 shadow-lg rounded-lg overflow-hidden">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-2 py-2 border">Opérateur</th>
                                    <th className="px-2 py-2 border">Traces</th>
                                    <th className="px-2 py-2 border">Horodatage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 border">
                                            {log.login} <br />
                                            {log.ipAddress}
                                        </td>
                                        <td className="px-4 py-2 border text-sm">
                                            {formatTrace(log.fieldValues) ? (
                                                <span dangerouslySetInnerHTML={{ __html: formatTrace(log.fieldValues) }} />
                                            ) : (
                                                <span
                                                    style={{
                                                        fontWeight: 'bold',
                                                        color: 'black'
                                                    }}
                                                >
                                                    Aucune écriture sur le dossier, ouverture - lecture
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 border">{new Date(log.timestamp).toLocaleString('fr-FR')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
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

    const itemTemplate = (item) => {
        return <div>{item}</div>;
    };

    const options = getAvailableOptions2(formik.values.serie?.code, 3, formik.values.matiere1?.name, formik.values.matiere2?.name, formik.values.matiere3?.name);

    // IMPORTANT : Faire correspondre le string stocké dans Formik à l'objet attendu par Dropdown
    const selectedOption = options.find((option) => option.name === formik.values.eprFacListB) || null;

    return (
        <ProtectedRoute allowedRoles={['ADMIN', 'SCOLARITE']}>
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
                            <DataTable
                                ref={dt}
                                value={candidats}
                                paginator
                                rows={10}
                                rowsPerPageOptions={[5, 10, 25]}
                                className="datatable-responsive"
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                currentPageReportTemplate="Affichage de {first} à {last} des {totalRecords} enregistrement (s)"
                                globalFilter={globalFilter}
                                emptyMessage="Aucun dossier n'a été retrouvée"
                                header={header}
                                rowClassName={(rowData) => {
                                    if (rowData.decision === 1) return 'accepted-row';
                                    if (rowData.decision === 2) return 'rejected-row';
                                    return '';
                                }}
                            >
                                <Column field="dosNumber" header="N° dossier" sortable body={dNBodyTemplate} headerStyle={{ minWidth: '5rem' }} />
                                <Column field="firstname" header="Prénom (s)" sortable body={fNBodyTemplate} headerStyle={{ minWidth: '20rem' }} />
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

                            <Dialog visible={modifCandDialog} style={{ width: '1250px' }} header="Vérification de la fiche d'un candidat" modal className="p-fluid" onHide={hideDialog}>
                                {/* {product.image && <img src={`/demo/images/product/${product.image}`} alt={product.image} width="150" className="mt-0 mx-auto mb-5 block shadow-2" />} */}

                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        console.log('Formik errors:', formik.errors);
                                        formik.handleSubmit(e);
                                    }}
                                >
                                    <Carousel
                                        value={carouselItems2}
                                        itemTemplate={(item) => <div>{item}</div>}
                                        numVisible={1}
                                        numScroll={1}
                                        showNavigators={true}
                                        showIndicators={true}
                                        responsiveOptions={carouselResponsiveOptions}
                                        className="custom-carousel"
                                    />
                                </form>
                            </Dialog>

                            <Dialog visible={deleteProductDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
                                <div className="flex align-items-center justify-content-center">
                                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                                    {product && (
                                        <span>
                                            Are you sure you want to delete <b>{product.name}</b>?
                                        </span>
                                    )}
                                </div>
                            </Dialog>

                            <Dialog visible={deleteProductsDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteProductsDialogFooter} onHide={hideDeleteProductsDialog}>
                                <div className="flex align-items-center justify-content-center">
                                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                                    {product && <span>Are you sure you want to delete the selected products?</span>}
                                </div>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default ValidationCandidat;
