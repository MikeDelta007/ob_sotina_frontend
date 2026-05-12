'use client';

import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable, DataTablePageEvent } from 'primereact/datatable';
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
import { ActeurDTO, CandidatGrouped, LazyParams, ParametrageService, ProfilDTO, ProgrammationDTO, SujetDTO, UserDTO } from '@/demo/service/ParametrageService';
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

    const [session, setSession] = useState(2024);
    const [resultat, setResultat] = useState([]);
    const [resultat_, setResultat_] = useState([]);

    const [users, setUsers] = useState([]);

    const [etabs, setEtabs] = useState([]);

    const [infosUsers, setInfosUsers] = useState(null);

    const [errorMessage, setErrorMessage] = useState('');

    // State
    const [totalRecords, setTotalRecords] = useState(0);


    const [groupedCandidats, setGroupedCandidats] = useState<CandidatGrouped>({});

    const [archives, setArchives] = useState([]);

    const profilsOptions = [
        { label: 'ADMIN', value: 'ADMIN' },
        { label: 'AGENT DE SAISIE', value: 'AGENT_DE_SAISIE' },
        // { label: 'CHEF D\'ETABLISSEMENT', value: 'CHEF_ETABLISSEMENT' },
        // { label: 'PLANIFICATION', value: 'PLANIFICATION' },
        //{ label: 'PEDAGOGIE', value: 'PEDAGOGIE' },
        { label: 'SCOLARITE', value: 'SCOLARITE' },
        { label: 'VIGNETTES ET COUPONS', value: 'VIGNETTES_COUPONS' },
        { label: 'AUTORISATION RECEPTION', value: 'AUTORISATION_RECEPTION' },
        { label: 'RECEPTIONNISTE', value: 'RECEPTIONNISTE' }
        //{ label: 'STATISTIQUES', value: 'STATISTIQUES' }
    ];

    const [lazyParams, setLazyParams] = useState({first:0, rows:10, page:0});



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

    useEffect(() => 
    {
        loadData();
    }, [lazyParams.page, lazyParams.rows]);


    const formatCurrency = (value) => {
        return value.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
        });
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
        window.location.replace('/pedagogie/gestion-donnees');
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



    console.log(is_update);

    const generateSimplePassword = () => {
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        const randomLetters = letters.charAt(Math.floor(Math.random() * letters.length)) + letters.charAt(Math.floor(Math.random() * letters.length));

        const randomDigits = String(Math.floor(1000 + Math.random() * 9000)); // 4 chiffres

        return randomLetters + randomDigits;
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
        //await loadData();
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
        //await loadData();
        setDesactiveAccessDialog(false);
    };

    const loadData = () => {
        setLoading(true);

        if (!archives) 
        {
            setLoading(false);
            return;
        }

        try 
        {
            ParametrageService.getAllCandidatsCGS(
            lazyParams.page,
            lazyParams.rows
            
            
        )
            .then((result) => {
                setArchives(result.data);
                setTotalRecords(result.total);
            })
            .catch((error) => {
                console.error("❌ Erreur chargement archives :", error);
            });
        }
        catch (err)
        {
        console.error("❌ Erreur chargement FAEB :", err);
        setError("Erreur lors du chargement");
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
            <div className="flex flex-column">
    
                <div>
                    <h3>Gestion des données sources CGS</h3>
                </div>
    
                <div className="flex align-items-center gap-1 flex-wrap">
                    <Button 
                        size="small"
                        severity="success" 
                        label="Charger la liste de tous les candidats" 
                        icon="pi pi-eject" 
                        onClick={openNew3} 
                    />
                </div>
    
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


    const numTableTemplate = (rowData) => {
        return (
            <>
                {rowData.tableNum}
            </>
        );
    };

    const juryTemplate = (rowData) => {
        return (
            <>
                {rowData.jury}
            </>
        );
    };

    const serieTemplate = (rowData) => {
        return (
            <>
                {rowData.serie}
            </>
        );
    };

    const cpTemplate = (rowData) => {
        return (
            <>
                {rowData.centreEcritPrincipal}
            </>
        );
    };

    const csTemplate = (rowData) => {
        return (
            <>
                {rowData.centreEcritSecondaire}
            </>
        );
    };

    const cexTemplate = (rowData) => {
        return (
            <>
                {rowData.centreExamen}
            </>
        );
    };

    const sessionTemplate = (rowData) => {
        return (
            <>
                {rowData.session}
            </>
        );
    };


    const firstnameTemplate = (rowData) => {
        return (
            <>
                {rowData.firstname}
            </>
        );
    };

    const lastnameTemplate = (rowData) => {
        return (
            <>
                {rowData.lastname}
            </>
        );
    };

    const dateTemplate = (rowData) => {
        return (
            <>
                {rowData.date_birth}
            </>
        );
    };

    const genderTemplate = (rowData) => {
        return (
            <>
                {rowData.gender}
            </>
        );
    };

    const placeBirthTemplate = (rowData) => {
        return (
            <>
                {rowData.place_birth}
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
            <h5 className="m-0">Gestion des données</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onChange={(e) => setGlobalFilter((e.target as HTMLInputElement).value)} placeholder="Recherche..." />
            </span>
        </div>
    );


    const openNew3 = () => {
        setCodifDialog(true);
    };


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
            const message = await ParametrageService.uploadFileCGS(file);
            setLoading(false);
            setResultImport(message);
            toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Fichier chargé avec succès', life: 4000 });
            
        }
    };


    const formatDateToInput = (isoDateStr) => 
    {
        const date = new Date(isoDateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

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

                        <DataTable
                            ref={dt}
                            loading={loading}
                            loadingIcon="pi pi-spin pi-spinner"
                            paginator
                            size='small'
                            showGridlines
                            value={archives}
                            lazy
                            scrollable
                            style={{ width: '100%', whiteSpace: 'nowrap' }}
                            totalRecords={totalRecords}
                            first={lazyParams.first}
                            rows={lazyParams.rows}
                            rowsPerPageOptions={[5, 10, 25]}
                            onPage={(e) => {
                                setLazyParams({
                                    ...lazyParams,
                                    first: e.first,
                                    rows: e.rows,
                                    page: e.page
                                });
                            }}
                            className="p-datatable-sm"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Affichage de {first} à {last} des {totalRecords} enregistrement (s)"
                            emptyMessage="Aucune donnée n'a été trouvée"
                            header={header}
                            responsiveLayout="scroll"
                        >
                                                            <Column field="firstname" header="Prénom (s)" frozen alignFrozen="left"/>
                                                            <Column field="lastname" header="Nom" frozen alignFrozen="left"/>
                                                            <Column
                                                                field="date_birth"
                                                                header="Date Naiss."
                                                                body={(rowData) => {
                                                                    return formatDateToInput(rowData.date_birth);
                                                                }}
                                                            />
                            
                                                            <Column field="place_birth" header="Lieu Naiss." />
                                                            <Column
                                                                field="gender"
                                                                header="Sexe"
                                                            
                                                                style={{ width: '1500px' }}
                                                                sortable
                                                            />
                                                            
                                                            <Column field="level" header="Classe" />
                                                            <Column field="serie" header="Série"/>
                                                            
                                                          
                                                            <Column field="discipline" header="Spécialité"/>
                                                            <Column field="etab" header="Etablissement d'origine"/>
                                                            <Column field="centreCompo" header="Centre de composition"/>
                                                            <Column field="academia" header="Académie"/>
                                                            <Column field="session" header="Séssion" />

                        </DataTable>




                        <Dialog visible={codifDialog} style={{ width: '1000px' }} header="Chargement des données" modal className="p-fluid" onHide={hideDialog4}>
                            <div style={{ color: 'red' }}>
                                <span><b>Mention utile 1 : </b>Veuillez charger exclusivement un fichier Excel.</span>
                            </div>
                            <div className="col-md-6">
                                <FileUpload mode="basic" accept=".xls, .xlsx" customUpload name="xls" chooseLabel="Charger le fichier excel" onSelect={handleFileChange} className="mr-2 mt-5" />
                                {errorMessage && <div style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</div>}

                                <Button label="Enregistrer les données" icon="pi pi-upload" className="p-button-success mt-2" onClick={handleUpload} />
                            </div>
                        </Dialog>


                        <Dialog 
                            visible={getResultDialog} 
                            style={{ width: '600px' }} 
                            header="Chargement des données" 
                            modal 
                            onHide={hideBatchCreatedDialog}
                        >
                            <div className="flex flex-column align-items-center">
                                {loading && (
                                    <div className="flex flex-column justify-content-center align-items-center" style={{ height: '100px' }}>
                                        <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="6" />
                                        <span>Les données sont en cours de chargement...</span>
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
