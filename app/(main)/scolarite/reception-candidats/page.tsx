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
import './style.css';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { UserContext } from '@/app/userContext';
import { useFormik } from 'formik';
import { type } from 'os';

import { InputMask } from 'primereact/inputmask';
import { Candidat } from '@/types/candidat';
import { useFormikLocalStorageDefault } from '../enrolement-candidat/useFormikLocalStorageDefault';
import { RadioButton } from 'primereact/radiobutton';
import { InputTextarea } from 'primereact/inputtextarea';
import ProtectedRoute from '@/layout/ProtectedRoute';

const ValidationCandidat = () => {
    const { user } = useContext(UserContext);

    var is_update = useRef(false);
    var id_cdt = useRef(null);

    const [age, setAge] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [candidat, setCandidat] = useState(null);

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
    const [error2, setError2] = useState(null);
    const [message, setMessage] = useState('');

    const [serieCode, setSerieCode] = useState(null);
    const [session, setSession] = useState(null);
    const [etablissement, setEtablissement] = useState(null);
    const [rejets, setRejets] = useState(null);

    const [edition, setEdition] = useState(null);

    const [prog, setOneProg] = useState<{ edition? : number, codeSup1? : string, codeSup2? : string } | null>(null);

    const [decisionStats, setDecisionStats] = useState({ decision0: 0, decision1: 0, decision2: 0, total: 0 });

    const [filterText, setFilterText] = useState('');

    const [selectedValues, setSelectedValues] = useState<string[]>([]);

    const [showFieldset, setShowFieldset] = useState(false);
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [isReadOnly, setIsReadOnly] = useState(true);
    const [isDNP, setIsDNP] = useState(false);

    const [faeb, setFaebs] = useState(null);

    const handleValidatePassword = () => {
        if (password === prog.codeSup1) {
            setError("");
            setIsReadOnly(false); // champs débloqués
            setShowPasswordInput(false); // cache l'input mot de passe si besoin
        } else {
            setError("❌ Code superviseur pour correction Etat Civil incorrect");
        }
    };

    const handleValidatePassword2 = () => {
        if (password2 === prog.codeSup2) {
            setError2("");
            setIsDNP(true); // champs débloqués
        } else {
            setError2("❌ Code superviseur pour suppression DNP incorrect");
        }
    };

    useEffect(() => {
        if (rejets && Array.isArray(rejets)) {
            setSelectedValues(rejets.map(r => r.name));
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
            console.log("📦 Rejets chargés :", response);
            setRejets(response);
        });
    }, []);

    // Si tu as déjà rejets, pas besoin de redéclarer ici
    const filteredRejets = rejets?.filter((r) =>
        r.name.toLowerCase().includes(filterText.toLowerCase())
    );

    useEffect(() => {
        CandidatureService.getCentreEtatCivils().then((response) => {
            //console.log("📦 Séries chargées :", data);
            setCentreECivils(response);
        });
    }, [])

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

    const loadFAEB = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!etablissement || !prog) {
        console.warn("Filtres manquants pour charger les données");
        setLoading(false);
        return;
    }

    try {
        const response = await CandidatureService.compteFAEBS(etablissement?.id, prog?.edition);
        console.log("OK", prog?.edition);
        setFaebs(response);
    } catch (err) {
        console.error("❌ Erreur chargement FAEB :", err);
        setError("Erreur lors du chargement");
    } finally {
        setLoading(false);
        }
    }, [etablissement, prog]);


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

    useEffect(() => {
        loadFAEB();
    }, [loadFAEB]);

    useEffect(() => {
        if (faeb?.enabled) {
            loadCandidats();
            console.log(faeb);
        } else {
            setMessage("TEST");
            console.log(faeb);
        }
    }, [reloadTrigger, faeb, loadCandidats]);

    
    const origineOptions = 
    [
        { label: 'National', value: 'National' },
        { label: 'Etranger', value: 'Etranger' }
    ];

    const sexeOptions = 
    [
        { label: 'M', value: 'M' },
        { label: 'F', value: 'F' }
    ];

    const handicapOptions = 
    [
        { label: 'Aucun', value: 'Néant' },
        { label: 'Aveugle', value: 'Aveugle' },
        { label: 'Mal Entendant', value: 'Mal Entendant' },
        { label: 'Mal Voyant', value: 'Mal Voyant' },
        { label: 'Sourd-Muet', value: 'Sourd-Muet' },
        { label: 'Moteur', value: 'Moteur' }

    ];

    const epsOptions = 
    [
        { label: 'Apte', value: 'Apte' },
        { label: 'Inapte', value: 'Inapte' }
    ];

    const efOptions = 
    [
        { label: 'Dessin', value: 'Dessin' },
        { label: 'Couture', value: 'Couture' },
        { label: 'Musique', value: 'Musique' }
    ];

    const decisions = 
    [
        { label: 'Dossier Accepté', value: 1 },
        { label: 'Dossier Rejeté', value: 2 },
        { label: 'Dossier Non Parvenu', value: 3 }
    ];

    const getColor = (value) => {
        console.log(value)
        if (value === 1) return 'SpringGreen';
        if (value === 2) return 'Salmon';
        if (value === 3) return 'Black';
        return "white";
    };

    const getColor2 = (value) => {
        console.log(value)
        if (value === 1) return 'black';
        if (value === 2) return 'white';
        if (value === 3) return 'white';
        return "black";
    };

    const countryOptionTemplate = (country) => {
        if (!country) return "Selectionner un pays";
        return (
            <div className="country-item">
                <img alt={country?.code} src={`https://flagcdn.com/16x12/${country?.code.toLowerCase()}.png`} className="mr-2" />
                <span>{country?.name}</span>
            </div>
        );
    };

    const getAvailableOptions = (code, order, exclude1, exclude2, exclude3) =>
        matieres.filter((m) => {
            return (
            m.order == order &&
            m.serie.code === code &&
            m.name !== exclude1 &&
            m.name !== exclude2 &&
            m.name !== exclude3
            );
        });

    const getAvailableOptions2 = (
        code: string | undefined,
        order: number,
        exclude1?: string,
        exclude2?: string,
        exclude3?: string
        ) => {
        if (!code) {
            return [];
        }
        
        console.log("Etape 1");

        const allForSerie = matieres.filter((m) => m.serie.code === code);

        // Séries pour lesquelles on doit "vider" les exclusions
        const seriesSansExclusion = ["F6", "L-AR", "S1", "S2", "S3", "S4", "S5", "T1", "T2", "STIDD", "STEG", "S1AR", "S2AR"];

        const isSerieSansExclusion = seriesSansExclusion.includes(code);

        console.log("Etape 2");

        console.log(isSerieSansExclusion);

        if (isSerieSansExclusion) {
            const allForSerieX = matieres.filter((m) => m.serie.code !== code);
            console.log("✅ Contenu de allForSerie pour une série sans exclusion :", allForSerie);
            const uniqueNames = new Set<string>();
            return allForSerieX.filter((m) => {
                const isExcluded = m.matiere === "SN";
                const isExcluded2 = m.name === "ECONOMIE";
                if (!isExcluded && !isExcluded2 && !uniqueNames.has(m.name)) {
                    uniqueNames.add(m.name);
                    return true;
                }
                return false;
            });
        }


        console.log("Etape 3");

        // Si aucune matière encore choisie (toutes exclusions vides)
        const noExclusionSelected = !exclude1 && !exclude2 && !exclude3;

        console.log("TEK KHEL", exclude1, exclude2, exclude3);
        console.log(noExclusionSelected);

        if (noExclusionSelected) {
            // Aucun filtre d'exclusion → toutes les matières sans doublon
            const uniqueNames = new Set<string>();
            return allForSerie.filter((m) => {
                const isExcluded = m.matiere === "SN";
                const isExcluded2 = m.name === "ECONOMIE";
                if (!isExcluded && !isExcluded2 && !uniqueNames.has(m.name)) {
                    uniqueNames.add(m.name);
                    return true;
                }
                return false;
            });
        } 
        else 
        {
            // Cas normal : filtre par ordre + exclusions, puis suppression des doublons sur le name
            const uniqueNames = new Set<string>();
            return allForSerie.filter((m) => {
                const isExcluded =
                    m.matiere === "SN" ||
                    m.name === "ECONOMIE" ||
                    m.name === exclude1 ||
                    m.name === exclude2 ||
                    m.name === exclude3;

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


    function getAge(dateString) 
    {
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
    }

    const openNew = () => {
        formik.resetForm(); // remet à zéro les erreurs et touches
        formik.setValues(Object); // valeurs initiales
        setSubmitted(false);
        //setIsEditMode(false); // facultatif : flag pour différencier "ajouter" / "modifier"
        setProductDialog(true); // ou ton Dialog / Carousel
    };

    const hideDialog = () => {
        
        setIsReadOnly(true);
        setPassword(null);

        if (productDialog)
        {
            setSubmitted(false);
            setProductDialog(false);
        }
        if (modifCandDialog)
        {
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

    const editProduct = (candidat) => {
        setAge(0);
        setShowFieldset(false);
        setShowPasswordInput(true);
        setPassword(null);
        // setCandidat({ ...candidat });

         const candidatFormatted = {
            ...candidat,
            date_birth: candidat.date_birth ? formatDateToInput(candidat.date_birth) : '',
            matiere1: formatMatiere(candidat.matiere1) ?? null,
            matiere2: formatMatiere(candidat.matiere2) ?? null,
            matiere3: formatMatiere(candidat.matiere3) ?? null,
            matiere4: formatMatiere(candidat.eprFacListB) ?? null,
            codeCentre: candidat.centreEtatCivil?.code ?? ''
        };
        id_cdt.current = candidat.id,
        console.log(id_cdt);
        formik.setValues(candidatFormatted);
        is_update.current = true;
        console.log(is_update);

        // récupérer les rejets
        const rejets = candidat.rejets ? candidat.rejets.map(r => ({
            id: r.id,
            name: r.name,
            observation: r.observation
        })) : [];

        // initialiser les checkboxes avec les noms
        setSelectedValues(rejets.map(r => r.name));

        setAge(getAge(candidatFormatted.date_birth));

        console.log("Âge :", getAge(candidatFormatted.date_birth));

        setModifCandDialog(true);

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
                                                    <fieldset
                                                        className="custom-fieldset text-sm"
                                                        style={{ padding: '5px' }}
                                                        >
                                                        <legend className="font-bold text-sm">Effectuer les filtres (Tous les champs doivent être sélectionnés)</legend>

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
                                                            <label htmlFor="etablissement"><h6 className="m-0">Choisir un établissement</h6></label>
                                                            <Dropdown
                                                                showClear
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
                                                                virtualScrollerOptions={{ itemSize: 40 }}
                                                            />
                                                            </div>

                                                            <div style={{ width: '200px' }}>
                                                            <label htmlFor="serieCode"><h6 className="m-0">Choisir une série</h6></label>
                                                            <Dropdown
                                                                showClear
                                                                id="serieCode"
                                                                name="serieCode"
                                                                options={series}
                                                                value={serieCode}
                                                                onChange={(e) => setSerieCode(e.value)}
                                                                disabled={!etabs || etabs.length === 0}
                                                                optionLabel="code"
                                                                optionValue="code"
                                                                placeholder="Choisir une série"
                                                                filter
                                                                className="p-inputtext-sm w-full"
                                                                style={{ width: '100%' }}
                                                            />
                                                            </div>

                                                            
                                                        </div>
                                                        </fieldset>
                                                        {faeb?.enabled && faeb?.representative && (
                                                            <span style={{ color: "darkgreen", fontSize: "20px" }}>
                                                                <b>Mandataire : {faeb.representative}</b>
                                                            </span>

                                                        )}     
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

                {faeb?.enabled ? (
                <>
                {/* <DownloadPDFButton etablissementId={etablissement?.id} etablissementName={etablissement?.name} session={prog?.edition} /> */}
                </>
                ) : (
                    <div className="p-2 text-red-600 font-semibold">
                        
                    </div>
                )}
            </React.Fragment>
        );
    };

interface DownloadPDFButtonProps {
  etablissementId: String;
  etablissementName: String;
  session: number;
}

// const DownloadPDFButton: React.FC<DownloadPDFButtonProps> = ({ etablissementId, session, etablissementName }) => {
//   const [loading, setLoading] = useState(false);

//   // ✅ Si aucun établissement n'est sélectionné, ne rien afficher
//   if (!etablissementId) return null;

//   const handleDownload = async () => {
//     setLoading(true);
//     try {
//       await CandidatureService.getListByEtab(etablissementId, session, etablissementName, user?.login);
//     } catch (error) {
//       console.error('Erreur lors du téléchargement du fichier PDF.', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Button
//       label={loading ? "Téléchargement..." : "Télécharger la liste compléte de l'établissement"}
//       icon="pi pi-download"
//       onClick={handleDownload}
//       disabled={loading}
//       className="p-button-primary"
//     />
//   );
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

    const editProduct2 = (candidat) => {
        setDeleteDialog(true);
        setCandidat({ ...formik.values });
        id_cdt.current = candidat;
    };

    const actionBodyTemplate = (rowData) => {
    return (
        rowData && (
        <Button
            icon="pi pi-check-square"
            label={
            rowData.decision === 1
                ? "Dossier Validé"   // vert clair
                : rowData.decision === 2
                ? "Dossier Rejeté"    // rouge tomate
                : "Dossier en Attente"   // par défaut (jaune/orange)
            }
            rounded
            severity={
            rowData.decision === 1
                ? "success"   // vert clair
                : rowData.decision === 2
                ? "danger"    // rouge tomate
                : "warning"   // par défaut (jaune/orange)
            }
            className="mr-2"
            onClick={() => editProduct(rowData)}
        />
        )
    );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <div className="flex flex-wrap gap-3">
                {candidats && candidats.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-0">
                        {serieCode && (
                        <div className="bg-cyan-100 text-black-800 px-4 py-2 rounded-xl">
                            <strong>Série : {serieCode}</strong>
                        </div>
                        )}
                        <div className="bg-yellow-100 text-black-800 px-2 py-2 rounded-xl">
                            📂 Attentes : <strong>{decisionStats.decision0} sur {decisionStats.total}</strong>
                        </div>
                        <div className="bg-green-100 text-black-800 px-2 py-2 rounded-xl">
                            ✅ Validés : <strong>{decisionStats.decision1} sur {decisionStats.total}</strong>
                        </div>
                        <div className="bg-red-100 text-black-800 px-2 py-2 rounded-xl">
                            ❌ Rejetés : <strong>{decisionStats.decision2} sur {decisionStats.total}</strong>
                        </div>
                    </div>
                )}

            </div>
            <span className="block mt-0 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    type="search"
                    onInput={(e) => setGlobalFilter((e.target as HTMLInputElement).value)}
                    placeholder="Recherche..."
                />
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

    const deleteData = async () => {
        console.log(id_cdt.current);

        if (id_cdt.current) {
            try {
            await CandidatureService.deleteCandidat(id_cdt.current);
            toast.current.show({
                severity: 'success',
                summary: 'Office du Bac (Cas de DNP)',
                detail: 'Le dossier non parvenu a été supprimé avec succès',
                life: 5000
            });
            await loadCandidats();
            } 
            catch (error) 
            {
            toast.current.show({
                severity: 'error',
                summary: 'Office du Bac (Cas de DNP)',
                detail: 'Impossible de supprimer le dossier non parvenu',
                life: 5000
            });
            console.error("Erreur suppression:", error);
            }

        }

        setDeleteDialog(false);
        setModifCandDialog(false);
    };

    const deleteDialogFooter = (
            <>
                <Button label="Confirmer" icon="pi pi-check" text onClick={deleteData} />
            </>
    );

    const hideDeleteProductDialog_ = () => {
        setDeleteDialog(false);
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


    const formik = useFormik({
            initialValues: {
                id : '',
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
                codeCentre : '',
                motif : []
            },

            validationSchema: Yup.object({
            serie: Yup.object().nullable().required('Champ obligatoire'),
            
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
                            .required('Numéro de registre obligatoire')
                            .matches(/^\S.*$/, 'Le numéro de registre ne peut pas commencer par un espace'),
                        ...(user?.acteur?.etablissement?.typeCandidat?.name !== 'Régulier/Officiel' && {
                            /* origine_bfem: Yup.string().required('Requis'), */
                            year_bfem: Yup.string()
                                .required('Année BFEM obligatoire')
                                .matches(/^[0-9]+$/, 'Année invalide')
                        }),
            // ...(radioValue == 2 && {
            //     motif: Yup.string().required('Champ obligatoire'),  
            // }),
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
        console.log("cliquer...", formik.values.decision);
        setIsReadOnly(true);

        console.log("OK OK...", selectedValues);
        
                // Construire dynamiquement la liste des matières choisies
                const selectedOptions = [
                    values.matiere1?.name,
                    values.matiere2?.name,
                    values.matiere3?.name
                ].filter(m => m !== null);  // transformer chaque matière en objet { id: ... }
        
                console.log(selectedOptions);

                const series = ["L2"];
                const series_ = ["L'1", "L1A", "LA", "L1B"];
                const series__ = ["S1A", "S2A", "STIDD"];
                
                const candidatDTO: CandidatDecisionDTO = {
                    dosNumber: values.dosNumber,
                    firstname: values.firstname,
                    lastname: values.lastname,
                    date_birth: values.date_birth, // Assure-toi qu'il est bien au format 'yyyy-MM-dd'
                    place_birth: values.place_birth,
                    gender: values.gender,
                    phone1: values.phone1.replace(/\s/g, ''),
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
        
                    etablissement: user?.acteur?.etablissement,
                    centreEtatCivil: values.centreEtatCivil,
                    typeCandidat: user?.acteur?.etablissement?.typeCandidat,
                    serie: values.serie,
                    nationality: values.nationality,
                    concoursGeneral: values.concoursGeneral,
                    countryBirth: values.countryBirth,
                    eprFacListA: values.eprFacListA,
                    eprFacListB: values.matiere4,
                    session : Number(prog?.edition),
                    origine_bfem: values.origine_bfem || "Aucun",
                    decision: formik.values.decision,
                    motif: selectedValues,
                    operator : user?.login
                };

                console.log(candidatDTO);

        try 
            {
                    console.log("PATCH");
                    const response = await CandidatureService.updateDecision(id_cdt, candidatDTO);
                    console.log('Candidat mis à jour:', response.data);
                    setMessage('Candidat créé avec succès');
                    toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: '✅ Dossier de candidature enregistré avec succès', life: 4000 });
                    //resetForm();
                    await loadCandidats();

            } 
            catch (error) 
            {
                console.error('Erreur lors de la création du candidat:', error);
                setMessage('Erreur lors de la création du candidat');
                toast.current.show({ severity: 'error', summary: 'Office du Bac', detail: '❌ Erreur lors de l\'enregistrement du dossier de candidature', life: 4000 });
                
            } 
            finally 
            {
                setSubmitting(false);
            }
            setSubmitted(false);
            setProductDialog(false);
            setModifCandDialog(false)
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
            <h5 className="text-primary">Étape 1 / 2 : Données du dossier de candidature</h5>

            <div className="formgrid grid">
                <div className="field col-7">
                    <fieldset className="custom-fieldset text-sm">
                    <legend className="font-bold text-sm">
                        Référence de la pièce tenant lieu d&apos;acte de naissance
                    </legend>


                    {showPasswordInput && (
                        <div className="flex items-center gap-2 mb-1">
                               
                        <InputText
                            type="password"
                            value={password}
                            autoComplete="off"
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Entrer le code superviseur"
                            className="p-inputtext-sm"
                        />
                        <Button
                            type="button"
                            label="Valider le code superviseur"
                            onClick={handleValidatePassword}
                            className="p-button-sm"
                        />
                        </div>
                    )}

                    {error && <span style={{
                                                color: "red",
                                                fontWeight: "bold",
                                                marginTop: "0px",
                                                fontSize: "12px"
                                                
                                            }}>{error}</span>}

                    <div className="formgrid grid">
                        <div className="field col-3">
                        <label><b>Code Centre Etat Civil</b></label>
                        <InputText
                            value={formik.values.codeCentre || ""}
                            readOnly={isReadOnly}
                            autoComplete="off"
                            style={{
                                    fontWeight: 'bold',
                                    color: "black"
                                }}
                            onChange={(e) => {
                            const code = e.target.value;
                            formik.setFieldValue("codeCentre", code);

                            const matchingCentre = cecs.find((c) => c.code === code);
                            formik.setFieldValue("centreEtatCivil", matchingCentre || null);
                            }}
                            className="p-inputtext-sm"
                        />
                        </div>

                        <div className="field col-5">
                        <label><b>Nom / Centre Etat-Civil</b></label>
                        <Dropdown
                            id="centreEtatCivil"
                            name="centreEtatCivil"
                            style={{
                                    fontWeight: 'bold',
                                    color: "black"
                                }}
                            value={formik.values.centreEtatCivil}
                            onChange={(e) => {
                            formik.setFieldValue("centreEtatCivil", e.value);
                            formik.setFieldValue("codeCentre", e.value.code);
                            }}
                            options={cecs}
                            optionLabel="name"
                            placeholder="Sélectionner le centre d'état civil"
                            virtualScrollerOptions={{ itemSize: 30 }}
                            filter
                            className={`p-inputtext-sm w-full ${
                            formik.touched.centreEtatCivil && formik.errors.centreEtatCivil
                                ? "p-invalid"
                                : ""
                            }`}
                            disabled={isReadOnly}
                        />
                        </div>

                        <div className="field col-2">
                        <label><b>Année</b></label>
                        <InputText
                            id="year_registry_num"
                            name="year_registry_num"
                            autoComplete="off"
                            style={{
                                    fontWeight: 'bold',
                                    color: "black"
                                }}
                            value={formik.values.year_registry_num}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            readOnly={isReadOnly}
                            className={`p-inputtext-sm w-full ${
                            formik.touched.year_registry_num && formik.errors.year_registry_num
                                ? "p-invalid"
                                : ""
                            }`}
                        />
                        </div>

                        <div className="field col-2">
                        <label><b>N° acte</b></label>
                        <InputText
                            id="registry_num"
                            name="registry_num"
                            autoComplete="off"
                            value={formik.values.registry_num}
                            style={{
                                    fontWeight: 'bold',
                                    color: "black"
                                }}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            readOnly={isReadOnly}
                            className={`p-inputtext-sm w-full ${
                            formik.touched.registry_num && formik.errors.registry_num
                                ? "p-invalid"
                                : ""
                            }`}
                        />
                        </div>
                    </div>
                    </fieldset>

                </div>

            <div className="field col-5">
                <div className="formgrid grid">
                    {/* <div className="field col-4">
                        <label htmlFor="price">N° de table</label>
                            <InputText readOnly className="p-inputtext-sm" placeholder="N° de table si redoublant"/>
                    </div> */}
                    
                  
                    <div className="field col-3">
                        <label htmlFor="quantity"><b>* N° de dossier</b></label>
                            <InputText
                                readOnly 
                                autoComplete="off"
                                style={{
                                    fontWeight: 'bold',
                                    color: "black"
                                }}
                                id="dosNumber"
                                name="dosNumber"
                                placeholder="N° de dossier"
                                value={formik.values.dosNumber || ""}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="w-full"                                                    
                            />
                          
                    </div>          
                    <div className="field col-5">
                        <label htmlFor="price"><b>Type de candidat</b></label>
                            <InputText readOnly className="p-inputtext-sm" value={formik.values.typeCandidat?.name}
                                style={{
                                    fontWeight: 'bold',
                                    color:
                                    formik.values.typeCandidat?.name === 'Individuel/Libre'
                                        ? 'darkblue'
                                        : 'darkgreen',
                                }}/>
                                    
                    </div>
                    <div className="field col-4">
                        <label><b>* Série</b></label>
                            <Dropdown
                                id="serie"
                                name="serie"
                                value={formik.values.serie}
                                style={{
                                    fontWeight: 'bold',
                                    color: "black"
                                }}
                                onChange={(e) => formik.setFieldValue('serie', e.value)}
                                options={series}
                                optionLabel="code" // adapter si ton objet contient un champ "libelle"
                                placeholder="Sélectionner une série"
                                virtualScrollerOptions={{ itemSize: 30 }}
                                filter
                                className={`p-inputtext-sm w-full ${formik.touched.serie && formik.errors.serie ? 'p-invalid' : ''}`}
                            />
                            {formik.touched.serie && typeof formik.errors.serie === 'string' && (
                                <small className="p-error">{formik.errors.serie}</small>
                            )}
                    </div>
                    
                </div>

                {age < 17 && (           
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
                                <label htmlFor="price"><b>* Prénom (s)</b></label>
                                <InputText placeholder="Saisir le prénom (s)"
                                autoComplete="off"
                                style={{
                                    fontWeight: 'bold',
                                    color: "black"
                                }}
                                id="firstname"
                                name="firstname"
                                value={formik.values.firstname}
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
                            {formik.touched.firstname && typeof formik.errors.firstname === 'string' && (
                                <small className="p-error">{formik.errors.firstname}</small>
                            )}
                            </div>
                            
                            <div className="field col-3">
                                <label htmlFor="quantity"><b>* Nom</b></label>
                                <InputText 
                                    placeholder="Saisir le nom" 
                                    autoComplete="off"
                                    value={formik.values.lastname}
                                    style={{
                                    fontWeight: 'bold',
                                    color: "black"
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
                            {formik.touched.lastname && typeof formik.errors.lastname === 'string' && (
                                <small className="p-error">{formik.errors.lastname}</small>
                            )}
                            </div>
                            <div className="field col-1">
                                <label htmlFor="quantity"><b>* Sexe</b></label>

                                <Dropdown
                                    id="gender"
                                    name="gender"
                                    style={{
                                        fontWeight: 'bold',
                                        color: "black"
                                    }}
                                    value={formik.values.gender}
                                    onChange={(e) => formik.setFieldValue('gender', e.value)}
                                    options={sexeOptions}
                                    // optionLabel="code" // adapter si ton objet contient un champ "libelle"
                                    placeholder="Sélectionner le sexe"
                                    className={`p-inputtext-sm w-full ${formik.touched.gender && formik.errors.gender ? 'p-invalid' : ''}`}
                                />
                                 {formik.touched.gender && typeof formik.errors.gender === 'string' && (
                                <small className="p-error">{formik.errors.gender}</small>
                                )}                               
                            </div>
                        </div>

                        <div className="formgrid grid">  
                              <div className="field col-2">
                                <label htmlFor="price"><b>* Date de naissance</b></label>
                                    <InputMask
                                        id="date_birth"
                                        autoComplete="off"
                                        name="date_birth"
                                        style={{
                                            fontWeight: 'bold',
                                            color: "black"
                                        }}
                                        value={formik.values.date_birth}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        mask="99/99/9999"
                                        placeholder="JJ/MM/AAAA"
                                        className={`p-inputtext-sm w-full ${formik.touched.date_birth && formik.errors.date_birth ? 'p-invalid' : ''}`}
                                    />
                                    
                                    {formik.touched.date_birth && typeof formik.errors.date_birth === 'string' && (
                                    <small className="p-error">{formik.errors.date_birth}</small>
                                    )}

                            </div>
                            <div className="field col-2">
                                <label htmlFor="quantity"><b>* Lieu de naissance</b></label>
                                 <InputText 
                                    placeholder="Saisir le lieu de naissance" 
                                    autoComplete="off"
                                    value={formik.values.place_birth}
                                    id="place_birth"
                                    name="place_birth"
                                    style={{
                                        fontWeight: 'bold',
                                        color: "black"
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
                                {formik.touched.place_birth && typeof formik.errors.place_birth === 'string' && (
                                <small className="p-error">{formik.errors.place_birth}</small>
                                )}
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
                                <label htmlFor="quantity"><b>* Nationalité</b></label>
                                    <Dropdown
                                        id="nationality"
                                        name="nationality"
                                        value={formik.values.nationality}
                                        onChange={(e) => formik.setFieldValue('nationality', e.value)}
                                        options={pays}
                                        optionLabel="name"
                                        style={{
                                            fontWeight: 'bold',
                                            color: "black"
                                        }}
                                        virtualScrollerOptions={{ itemSize: 30 }}
                                        itemTemplate={countryOptionTemplate}
                                        valueTemplate={countryOptionTemplate}
                                        placeholder="Nationalité"
                                        filter
                                        className={`p-inputtext-sm w-full ${formik.touched.nationality && formik.errors.nationality ? 'p-invalid' : ''}`}
                                    />
                                 {formik.touched.nationality && typeof formik.errors.nationality === 'string' && (
                                <small className="p-error">{formik.errors.nationality}</small>
                                )} 
                            </div>

                            <div className="field col-1">
                                <label htmlFor="quantity"><b>* Téléphone</b></label>
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
                                <label htmlFor="quantity"><b>* Email</b></label>
                                 <InputText 
                                    placeholder="Saisir le lieu de naissance" 
                                    autoComplete="off"
                                    value={formik.values.email}
                                    id="email"
                                    name="email"
                                    style={{
                                        fontWeight: 'bold',
                                        color: "black"
                                    }}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`p-inputtext-sm w-full ${formik.touched.email && formik.errors.email ? 'p-invalid' : ''}`}
                                />
                                {formik.touched.email && typeof formik.errors.email === 'string' && (
                                <small className="p-error">{formik.errors.email}</small>
                                )}
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
                                                            placeholder="Choisir une matière"
                                                            className={`p-inputtext-sm w-full ${formik.touched.matiere1 && formik.errors.matiere1 ? 'p-invalid' : ''}`}
                                                            style={{
                                                                fontWeight: 'bold',
                                                                color: 'black'
                                                            }}
                                                            filter
                                                            key={formik.values.matiere1?.id}
                                                        />
                                                        {formik.touched.matiere1 && typeof formik.errors.matiere1 === 'string' && <small className="p-error">{formik.errors.matiere1}</small>}
                                                    </div>
                                                    {formik.values.serie?.code !== 'STIDD' && formik.values.serie?.code !== 'S1A' && formik.values.serie?.code !== 'S2A' && (
                                                        <div className="field col-4">
                                                            <label htmlFor="quantity">
                                                                <b><span className="text-red-600">* </span> LV2 OU ECONOMIE</b>
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
                                                                key={formik.values.matiere2?.id}
                                                            />
                                                            {formik.touched.matiere2 && typeof formik.errors.matiere2 === 'string' && <small className="p-error">{formik.errors.matiere2}</small>}
                                                    
                                                        </div>
                                                    )}
                                                    {formik.values.serie?.code !== 'STIDD' && formik.values.serie?.code !== "L'1" && formik.values.serie?.code !== 'L1A'  && formik.values.serie?.code !== 'L1B' && formik.values.serie?.code !== 'S1A' && formik.values.serie?.code !== 'S2A' && (
                                                        <div className="field col-4">
                                                            <label htmlFor="quantity">
                                                                <b><span className="text-red-600">* </span> SCIENCES (PC OU SVT)</b>
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
                                                                key={formik.values.matiere3?.id}
                                                            />
                                                            {formik.touched.matiere2 && typeof formik.errors.matiere3 === 'string' && <small className="p-error">{formik.errors.matiere3}</small>}
                                                    
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
                                        
                                        <div className="field col-6 mt-0">
                                        <label htmlFor="quantity"><b>Liste A (Des, Mus, Cout...)</b></label>
                                            <Dropdown
                                                showClear
                                                id="eprFacListA"
                                                name="eprFacListA"
                                                value={formik.values.eprFacListA}
                                                style={{
                                                    fontWeight: 'bold',
                                                    color: "black"
                                                }}
                                                onChange={(e) => formik.setFieldValue('eprFacListA', e.value)}
                                                options={efOptions}
                                                placeholder="Dessin, Musique, Couture..."
                                                className={`p-inputtext-sm w-full ${formik.touched.eprFacListA && formik.errors.eprFacListA ? 'p-invalid' : ''}`}
                                            />
                                        </div>
                                        <div className="field col-6 mt-0">
                                        <label htmlFor="quantity"><b>Liste B (Langues...)</b></label>
                                            <Dropdown
                                                showClear
                                                id="matiere4"
                                                name="matiere4"
                                                value={formik.values.matiere4}
                                                style={{
                                                    fontWeight: 'bold',
                                                    color: "black"
                                                }}
                                                onChange={(e) => {
                                                    console.log('matiere4 :', e.value);
                                                    formik.setFieldValue('matiere4', e.value)
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
                                <div className="field col-2">
                                    <label htmlFor="price"><b>* Nombre de fois</b></label>
                                        <InputText 
                                            id="bac_do_count"
                                            name="bac_do_count"
                                            autoComplete="off"
                                            value={formik.values.bac_do_count}
                                            style={{
                                                fontWeight: 'bold',
                                                color: "black"
                                            }}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            className={`p-inputtext-sm w-full ${formik.touched.bac_do_count && formik.errors.bac_do_count ? 'p-invalid' : ''}`}
                                            placeholder="Nombre de fois"
                                        />
                                        {formik.touched.bac_do_count && typeof formik.errors.bac_do_count === 'string' && (
                                            <small className="p-error">{formik.errors.bac_do_count}</small>
                                        )}    
                                </div>
                                <div className="field col-4">
                                            {formik.values.typeCandidat?.name != "Régulier/Officiel" && (
                                                <fieldset className="p-2  border-round-md surface-border text-sm">
                                                    <legend className="text-primary font-bold text-sm">Diplôme d&apos;accès au BAC</legend>
                                                    <div className="formgrid grid">
                                                        <div className="field col-7 mt-0">
                                                        <label htmlFor="quantity"><b>Origine du BFEM</b></label>
                                                            <Dropdown
                                                                id="origine_bfem"
                                                                name="origine_bfem"
                                                                style={{
                                                                    fontWeight: 'bold',
                                                                    color: "black"
                                                                }}
                                                                value={formik.values.origine_bfem}
                                                                onChange={(e) => formik.setFieldValue('origine_bfem', e.value)}
                                                                options={origineOptions}
                                                                // optionLabel="code" // adapter si ton objet contient un champ "libelle"
                                                                placeholder="Origine du BFEM"
                                                                className={`p-inputtext-sm w-full ${formik.touched.origine_bfem && formik.errors.origine_bfem ? 'p-invalid' : ''}`}
                                                            />
                                                            {formik.touched.origine_bfem && typeof formik.errors.origine_bfem === 'string' && (
                                                                <small className="p-error">{formik.errors.origine_bfem}</small>
                                                            )} 
                                                        </div>
                                                        <div className="field col-5 mt-0">
                                                        <label htmlFor="price"><b>* Année BFEM</b></label>
                                                        <InputText
                                                            id="year_bfem"
                                                            name="year_bfem"
                                                            value={formik.values.year_bfem}
                                                            style={{
                                                                fontWeight: 'bold',
                                                                color: "black"
                                                            }}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            className={`p-inputtext-sm w-full ${formik.touched.year_bfem && formik.errors.year_bfem ? 'p-invalid' : ''}`}
                                                            />
                                                            {formik.touched.year_bfem && typeof formik.errors.year_bfem === 'string' && (
                                                                <small className="p-error">{formik.errors.year_bfem}</small>
                                                            )} 
                                                        </div>
                                                        
                                                    </div>
                                                    </fieldset>)}
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
            <h5 className="text-primary">Étape 2 / 2 : Validation du dossier de candidature</h5>
            <div className="formgrid grid">

                <div className="col-12 md:col-12">
                                <div className="card">
                                    <h5>Décision</h5>
                                    <div className="formgrid grid">
                                        <div className="field col-4">
                                            <Dropdown
                                                id="decision"
                                                value={radioValue}
                                                options={decisions}
                                                onChange={(e) => {
                                                    setRadioValue(e.value);  
                                                    formik.setFieldValue('decision', e.value);
                                                    setPassword2("");
                                                    setIsDNP(false)
                                                }}
                                                optionLabel="label"
                                                placeholder="Sélectionner une décision"
                                                style={{
                                                    backgroundColor: getColor(Number(radioValue)),
                                                    fontWeight: 'bold',
                                                    color: getColor2(Number(radioValue))
                                                }}
                                                />
                                        </div>
                                         <div className="field col-4">
                                            
                                                {(radioValue === 1 || radioValue == 2) && (
                                                <Button severity="info" icon="pi pi-save" label="Cliquez pour enregistrer l'état du dossier de candidature" className="mr-2" type="submit"/>
                                                )}

                                                {(radioValue === 3 && !isDNP) && (
                                                    <div className="flex items-center gap-2 mb-1">
                                                        
                                                    <InputText
                                                        type="password"
                                                        value={password2}
                                                        onChange={(e) => setPassword2(e.target.value)}
                                                        placeholder="Entrer le code superviseur"
                                                        className="p-inputtext-sm"
                                                    />
                                                    <Button
                                                        type="button"
                                                        label="Valider le code superviseur"
                                                        onClick={handleValidatePassword2}
                                                        className="p-button-sm"
                                                    />
                                                    </div>
                                                )}
                                                {error2 && <span style={{
                                                    color: "red",
                                                    fontWeight: "bold",
                                                    marginTop: "0px",
                                                    fontSize: "12px"
                                                }}>{error2}</span>}

                                                {(isDNP && radioValue === 3) && (
                                                    <Button type="button" severity="danger" icon="pi pi-trash" rounded label="Cliquez pour supprimer le dossier non parvenu" className="mr-2" onClick={() => editProduct2(formik.values.id)}/>
                                                )}
                                        </div>
                                         <hr />
                                        <div className="field col-12">
                                            {formik.values.decision == 2 && (
                                            <>
                                            <div>
                                                <div className="p-input-icon-left" style={{ marginBottom: '1rem' }}>
                                                <i className="pi pi-search" />
                                                <InputText
                                                    placeholder="Rechercher un motif de rejet..."
                                                    value={filterText || ''}
                                                    onChange={(e) => setFilterText(e.target.value)}
                                                />
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                    {rejets.filter((option) =>
                                                                option.name.toLowerCase().includes((filterText || '').toLowerCase())
                                                            ).map((option, index) => (
                                                        <div className="field-checkbox" key={option.id}>
                                                            <Checkbox
                                                            inputId={`checkOption${option.id}`}
                                                            name="name"
                                                            value={option.name}
                                                            checked={selectedValues.includes(option.name)}
                                                            onChange={(e) => {
                                                                const selected = [...selectedValues];
                                                                if (e.checked) {
                                                                selected.push(option.name);
                                                                } else {
                                                                const idx = selected.indexOf(option.name);
                                                                if (idx !== -1) selected.splice(idx, 1);
                                                                }
                                                                setSelectedValues(selected);
                                                            }}
                                                            />
                                                            <label htmlFor={`checkOption${option.id}`}>
                                                            <b>Motif {index + 1} : </b> {option.name}
                                                            </label>
                                                        </div>
                                                        ))}

                                                    </div>

                                            </div>
                                            </> 
                                        
                                        )}                                          
 
                                        </div>
                                      
                                    </div>
                
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

        const options = getAvailableOptions2(
    formik.values.serie?.code,
    3,
    formik.values.matiere1?.name,
    formik.values.matiere2?.name,
    formik.values.matiere3?.name
);

// IMPORTANT : Faire correspondre le string stocké dans Formik à l'objet attendu par Dropdown
const selectedOption = options.find(option => option.name === formik.values.eprFacListB) || null;

    return (
        <ProtectedRoute allowedRoles={['SCOLARITE', 'RECEPTIONNISTE', 'ADMIN']}>
            <div className="grid crud-demo">
                <div className="col-12">
                    <div className="card">
                        <Toast ref={toast} />
                        <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                        {(!etablissement) ? (
                            <div className="p-2 text-black-600 font-semibold">
                                ⚠ Aucun établissement n&apos;est pour le moment sélectionné.
                            </div>
                        ) : (
                            faeb?.enabled ? (
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
                                    emptyMessage="Aucun candidat n'a été trouvée"
                                    header={header}
                                    responsiveLayout="scroll"
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
                            ) : (
                                <div className="p-2 text-red-600 font-semibold">
                                    ❌ Attention, cet établissement n&apos;est pas autorisé par la <b>scolarité</b> pour la réception des dossiers.
                                </div>
                            )
                        )}


                        <Dialog visible={modifCandDialog} style={{width: '1250px'}} header="Vérification de la fiche d'un candidat" modal className="p-fluid" onHide={hideDialog}>
                            {/* {product.image && <img src={`/demo/images/product/${product.image}`} alt={product.image} width="150" className="mt-0 mx-auto mb-5 block shadow-2" />} */}

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                console.log('Formik errors:', formik.errors);
                                formik.handleSubmit(e);
                            }}>
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

                        <Dialog visible={deleteDialog} style={{ width: '500px' }} header="Avertissement pour suppression" modal footer={deleteDialogFooter} onHide={hideDeleteProductDialog_}>
                                                    <div className="flex align-items-center justify-content-center">
                                                        <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                                                        <span>Attention vous vous appretez à supprimer le dossier du candidat {candidat?.dosNumber}</span>
                                                    </div>
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
        </ProtectedRoute>
    );
};

export default ValidationCandidat;


