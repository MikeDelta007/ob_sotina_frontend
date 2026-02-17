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
import { CandidatureService, SujetDTO } from '@/demo/service/CandidatureService';
import * as Yup from 'yup';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { InputTextarea } from 'primereact/inputtextarea';
import { useFormik } from 'formik';
import { UserContext } from '@/app/userContext';
import { FiEdit } from 'react-icons/fi';

const Crud = () => {
    const { user } = useContext(UserContext);

    var is_update = useRef(false); // <== valeur persistante entre les appels
    var id_sujet = useRef(null); // <== même chose pour l'ID du candidat

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
    const [deleteProductDialog, setDeleteProductDialog] = useState(false);
    const [deleteProductsDialog, setDeleteProductsDialog] = useState(false);
    const [product, setProduct] = useState(emptyProduct);
    const [selectedProducts, setSelectedProducts] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const [prog, setOneProg] = useState<{ edition?: number } | null>(null);
    const [printDialog, setPrintDialog] = useState(false);
    const [listeSujet, setListeSujet] = useState([]);
    const [reloadTrigger, setReloadTrigger] = useState(false);
    const [groupedCdts, setGroupedCdts] = useState([]);

    const [series, setSeries] = useState(null);

    const [specialites, setSpecialites] = useState(null);

    const [specialite, setSpecialite] = useState('');
    const [wording, setWording] = useState('');
    const [num_sujet, setNumsujet] = useState(0);
    const [sujet, setSujet] = useState(null);
    const [etab_id, setEtab] = useState('');
    const [spec_id, setSpec] = useState('');

    const [message, setMessage] = useState('');

    const [sujets, setSujetData] = useState([]);

    const [isValid, setIsValid] = useState(false);

    const [errors, setErrors] = useState({ subject : ""});

    const [selectedSujet, setSelectedSujet] = useState(null);

    const [deleteDialog, setDeleteDialog] = useState(false);

    const [candidatsParSujet, setCandidatsParSujet] = useState([]);

    useEffect(() => {
        CandidatureService.getLastProg().then((response) => {
            //console.log("📦 Séries chargées :", data);
            setOneProg(response);
        });
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
        CandidatureService.getSpecialites().then((response) => {
            //console.log("📦 Séries chargées :", data);
            setSpecialites(response);
        });
    }, []);

    useEffect(() => {
        if (user?.acteur?.etablissement?.id && Number(prog?.edition)) {
            fetchSujets();
        }
    }, [user, prog]);

    useEffect(() => {
            if (user?.acteur?.etablissement?.id && Number(prog?.edition)) {
                fetchData();
            }
    }, [reloadTrigger, user, prog]);
    
    const fetchData = async () => {
            try {
                const data = await CandidatureService.getCdtsGroupedBySujet(user?.acteur?.etablissement?.id, Number(prog?.edition));
    
                // Vérifie que data est bien un objet
                if (data && typeof data === 'object') {
                    const result = Object.entries(data).map(([subject, cdts]) => ({
                        subject,
                        cdts
                    }));
                    console.log('OHHH :', result);
                    setGroupedCdts(result);
                    const sujetsNames = Object.keys(data || {});
                    const dropdownOptions = sujetsNames
                    .filter(sujet => sujet && sujet.trim() !== "") // retire null, undefined, et les chaînes vides
                    .map(sujet => ({
                        label: sujet,
                        value: sujet
                    }));


    
                    setListeSujet(dropdownOptions);
                    console.log(dropdownOptions);
                } 
                else 
                {
                    console.warn('⚠️ Données inattendues :', data);
                    setGroupedCdts([]); // fallback sécurité
                }
            } catch (error) {
                console.error('❌ Erreur lors du chargement des séries :', error);
                setGroupedCdts([]);
            }
        };

    const fetchSujets = async () => {
        try {
            CandidatureService.getSujetsByEtablissement(user?.acteur?.etablissement?.id, Number(prog?.edition)).then((response) => {
                setSujetData(response);
            });
        } catch (error) {
            console.error('Erreur chargement sujets:', error);
        }
    };

    const formatCurrency = (value) => {
        return value.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
        });
    };
    

    const openNew = () => {
        setSubmitted(false);
        setProductDialog(true);
        formik.resetForm();
        formik.setValues({
            ...formik.initialValues,

            spec_id: '',
            wording: ''
        });
    };

    useEffect(() => {
    const fetchCandidats = async () => {
        if (!sujets || sujets.length === 0) return;

        const sujetsAvecComptage = await Promise.all(
            sujets.map(async (sujet) => {
                try {
                    const candidats = await CandidatureService.getCdtsBySujet(sujet.wording);
                    return {
                        ...sujet,
                        totalCandidats: (candidats || []).length,
                    };
                } catch (error) {
                    console.error("Erreur pour le sujet", sujet.wording, error);
                    return {
                        ...sujet,
                        totalCandidats: 0,
                    };
                }
            })
        );

            setCandidatsParSujet(sujetsAvecComptage); // Met à jour la liste complète des sujets
        };

        fetchCandidats();
    }, [sujets]);


    useEffect(() => {
        console.log("🧩 candidatsParSujet mis à jour :", candidatsParSujet);
    }, [candidatsParSujet]);


    const hideDialog = () => {
        setSubmitted(false);
        setProductDialog(false);
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

    const editProduct = (product) => {
        setProduct({ ...product });
        setProductDialog(true);

        const sujetFormatted = {
            ...product,
            spec_id: product.specialite.id
        };

        id_sujet.current = product.id;
        formik.setValues(sujetFormatted);
        console.log(sujetFormatted);
        is_update.current = true;
    };


    const editProduct2 = (product) => {
        setDeleteDialog(true);
        setSujet({ ...product });
        id_sujet.current = product.id;
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

        const openPrint = () => {
        setPrintDialog(true);
    };

    const DownloadPDFButton: React.FC<DownloadPDFButtonProps> = ({ etablissementId, session, etablissementName, subject }) => {
            const [loading, setLoading] = useState(false);
    
            // ✅ Si aucun établissement n'est sélectionné, ne rien afficher
            if (!etablissementId) return null;
    
            const handleDownload = async () => {
                setLoading(true);
                try 
                {
                    await CandidatureService.getSujetsByEtab(etablissementId, session, etablissementName, user?.login, subject);
                    
                } 
                catch (error) 
                {
                    console.error('Erreur lors du téléchargement du fichier PDF.', error);
                } finally {
                    setLoading(false);
                }
            };
    
            return <Button label={loading ? 'Téléchargement...' : 'Cliquer pour télécharger la liste'} icon="pi pi-download" onClick={handleDownload} disabled={loading} className="p-button-primary mr-1" />;
    };

    const rightToolbarTemplate = () => {
            return (
                <React.Fragment>
                    {/* <Button severity="info" label="Importer la liste" icon="pi pi-arrow-down-right" className="mr-2 inline-block"/>
                    <Button severity="help" label="Exporter la liste" icon="pi pi-upload" onClick={exportCSV} /> */}
                    <Button label="Télécharger la liste des candidats avec leur sujet" icon="pi pi-print" className="p-button-sm mr-2" onClick={openPrint} />
                    
                </React.Fragment>
            );
    };
    
    interface DownloadPDFButtonProps {
            etablissementId: String;
            etablissementName: String;
            session: number;
            subject : String;
    }

    const onInputNumberChange = (e, name) => {
        const val = e.value || 0;
        let _product = { ...product };
        _product[`${name}`] = val;

        setProduct(_product);
    };



    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button severity="success" label="Ajouter un sujet" icon="pi pi-plus" className="mr-2" onClick={openNew} />
                    {/* <Button severity="danger" label="Delete" icon="pi pi-trash" onClick={confirmDeleteSelected} disabled={!selectedProducts || !selectedProducts.length} /> */}
                </div>
            </React.Fragment>
        );
    };

    const codeBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">specialite</span>
                {rowData.specialite.name}
                <br /><b>({rowData.specialite.code})</b>
            </>
        );
    };

    const handleSubmit2 = (e) => {
        e.preventDefault();

        let newErrors = { subject: ""};
        setIsValid(true);

        if (!selectedSujet) {
            newErrors.subject = "Veuillez sélectionner un sujet.";
            setIsValid(false);
        }

        setErrors(newErrors);

        if (!isValid) return;
    };

    const nSujetBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">num_sujet</span>
                {rowData.numSujet}
            </>
        );
    };

    const nameBodyTemplate = (rowData) => {
        return (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>{rowData.wording}</strong>
            </div>
        );
    };

    const nameBodyTemplate_ = (rowData) => {
    const total = rowData.totalCandidats ?? 0;

        return (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "black", fontStyle: "italic" }}>
                    <strong>({total} candidat{total > 1 ? "s" : ""})</strong>
                </span>
            </div>
        );
    };



    const imageBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Image</span>
                <img src={`/demo/images/product/${rowData.image}`} alt={rowData.image} className="shadow-2" width="100" />
            </>
        );
    };

    const priceBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Price</span>
                {formatCurrency(rowData.price)}
            </>
        );
    };

    const categoryBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Category</span>
                {rowData.category}
            </>
        );
    };

    const ratingBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Reviews</span>
                <Rating value={rowData.rating} readOnly cancel={false} />
            </>
        );
    };

    const statusBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Status</span>
                <span className={`product-badge status-${rowData.inventoryStatus.toLowerCase()}`}>{rowData.inventoryStatus}</span>
            </>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <>

                {(rowData.totalCandidats == 0) && 
                <Button
                                                                icon="pi pi-pencil"
                                                                rounded
                                                                tooltip="Modifier le sujet"
                                                                label="Modifier le sujet"
                                                                tooltipOptions={{ position: 'bottom' }}
                                                                severity="warning"
                                                                className="mr-1"
                                                                onClick={() => editProduct(rowData)}
                                                            />
                }
                 

                <Button
                                                                icon="pi pi-trash"
                                                                rounded
                                                                tooltip="Supprimer le sujet"
                                                                label="Supprimer le sujet"
                                                                tooltipOptions={{ position: 'bottom' }}
                                                                severity="danger"
                                                                onClick={() => editProduct2(rowData)}
                                                            />

                {/* <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteProduct(rowData)} /> */}
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Liste des sujets de l&apos;établissement</h5>
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
    
    const hideDeleteProductDialog__ = () => {
        setPrintDialog(false);
    };

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


    const hideDeleteProductDialog_ = () => {
        setDeleteDialog(false);
    };


    const deleteData = async () => {
            console.log(id_sujet.current);
    
            if (id_sujet.current) {
                try {
                await CandidatureService.deleteSujet(id_sujet.current);
                toast.current.show({
                    severity: 'success',
                    summary: 'Office du Bac',
                    detail: 'Le sujet et ses affectations ont été supprimés avec succès',
                    life: 5000
                });
                await fetchSujets();
                } 
                catch (error) 
                {
                toast.current.show({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de supprimer le sujet',
                    life: 5000
                });
                console.error("Erreur suppression:", error);
                }
    
            }
    
            setDeleteDialog(false);
    };

    const deleteDialogFooter = (
            <>
                <Button label="Oui" icon="pi pi-check" text onClick={deleteData} />
                <Button label="Non" icon="pi pi-times" text onClick={hideDeleteProductDialog_} />
            </>
    );

    const formik = useFormik({
        initialValues: {
            spec_id: '',
            wording: ''
        },
        validationSchema: Yup.object({
            spec_id: Yup.string().required('La spécialité est obligatoire'),
            wording: Yup.string().required('Le titre du sujet est obligatoire').min(3, 'Au moins 3 caractères')
        }),

        onSubmit: async (values, { setSubmitting, resetForm }) => {
            const sujetDTO: SujetDTO = {
                wording: values.wording,
                num_sujet: num_sujet || 0,
                etab_id: user?.acteur?.etablissement?.id || '',
                spec_id: values.spec_id,
                session: Number(prog?.edition)
            };
            try {
                if (is_update.current == false) {
                    const response = await CandidatureService.createSujet(sujetDTO);
                    console.log('✅ Sujet créé:', response.data);
                    setMessage('Sujet créé avec succès');
                    toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Sujet créé avec succès', life: 4000 });
                }
                if (is_update.current == true) {
                    const response = await CandidatureService.updateSujet(id_sujet, sujetDTO);
                    console.log(response);
                    if (response === 'Impossible') {
                        toast.current.show({ severity: 'warn', summary: 'Office du Bac', detail: 'Ce sujet ne pourra pas être mis à jour, car il a été déja choisi, au besoin supprimez le avec les affectations et recréez le', life: 4000 });
                    } else {
                        toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Sujet mis à jour avec succès', life: 4000 });
                    }
                    is_update.current = false;
                }
                await fetchSujets();
            } catch (error) {
                console.error('❌ Erreur création sujet:', error);
                setMessage('Erreur lors de la création du sujet');
                toast.current.show({ severity: 'error', summary: 'Office du Bac', detail: 'Erreur lors de la création du sujet', life: 4000 });
            } finally {
                setSubmitting(false);
            }
            setSubmitted(false);
            setProductDialog(false);
        }
    });

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={candidatsParSujet}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Affichage de {first} à {last} des {totalRecords} enregistrement (s)"
                        globalFilter={globalFilter}
                        emptyMessage="Aucun sujet n'a été trouvé"
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column field="numSujet" header="N° du sujet" sortable body={nSujetBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="specialite" header="Spécialité" sortable body={codeBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="wording" header="Libellé du sujet" sortable body={nameBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="numb_of_cdts" header="Effectif" body={nameBodyTemplate_} headerStyle={{ minWidth: '10rem' }}></Column>

                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '30rem' }}></Column>
                    </DataTable>

                    <Dialog visible={productDialog} style={{ width: '700px' }} header="Fiche d'un sujet de soutenance" modal className="p-fluid" onHide={hideDialog} contentStyle={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <form onSubmit={formik.handleSubmit} className="p-4" style={{ width: '100%', maxWidth: '640px' }}>
                            <div className="p-fluid">
                                <div className="grid">
                                    <div className="col-12 py-3">
                                        <label htmlFor="spec_id">
                                            <span className="text-red-500">*</span> <b>Spécialité</b>
                                        </label>
                                        <Dropdown
                                            id="spec_id"
                                            name="spec_id"
                                            value={formik.values.spec_id}
                                            options={specialites}
                                            onChange={(e) => formik.setFieldValue('spec_id', e.value)}
                                            optionLabel="name"
                                            optionValue="id"
                                            placeholder="Sélectionner la spécialité"
                                            className={`p-inputtext-sm w-full ${formik.touched.spec_id && formik.errors.spec_id ? 'p-invalid' : ''}`}
                                            filter
                                        />
                                        {formik.touched.spec_id && typeof formik.errors.spec_id === 'string' && <small className="p-error">{formik.errors.spec_id}</small>}
                                    </div>
                                </div>

                                <div className="grid">
                                    <div className="field col-12 py-3">
                                        <label htmlFor="price">
                                            <span className="text-red-500">*</span> <b>Intitulé du sujet</b>
                                        </label>
                                        <InputTextarea
                                            id="wording"
                                            name="wording"
                                            rows={7}
                                            cols={32}
                                            placeholder="Saisissez votre sujet"
                                            value={formik.values.wording}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            className={`p-inputtext-sm w-full ${formik.touched.wording && formik.errors.wording ? 'p-invalid' : ''}`}
                                        />
                                        {formik.touched.wording && formik.errors.wording && <small className="p-error">{formik.errors.wording}</small>}
                                    </div>
                                </div>
                                <div className="grid">
                                    <div className="field col-12 py-1">
                                        <div>
                                            <Button severity="success" label="Enregistrer" className="mr-2" type="submit" />
                                            {/* <Button severity="danger" label="Delete" icon="pi pi-trash" onClick={confirmDeleteSelected} disabled={!selectedProducts || !selectedProducts.length} /> */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                        ,
                    </Dialog>

                    <Dialog visible={deleteDialog} style={{ width: '500px' }} header="Avertissement pour suppression" modal footer={deleteDialogFooter} onHide={hideDeleteProductDialog_}>
                                                <div className="flex align-items-center justify-content-center">
                                                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                                                    <span>Attention vous vous appretez à supprimer le sujet <br /><b>{sujet?.wording}</b></span>
                                                </div>
                    </Dialog>

                    <Dialog visible={printDialog} style={{ width: '400px' }} header="Impression de liste" modal onHide={hideDeleteProductDialog__}>
                                                <div className="flex align-items-center">
                                                
                                                    <form onSubmit={handleSubmit2} className="p-1" style={{ width: '100%', maxWidth: '640px' }}>
                                                                                <div className="p-fluid">
                                                                                    <div className="grid">
                                                                                        
                                                                                        <div className="col-12">
                                                                                            <label htmlFor="spec_id">
                                                                                                <span className="text-red-500">*</span> Choisir le sujet accompagné des candidats à télécharger :
                                                                                            </label>
                                                                                            <Dropdown
                                                                                                value={selectedSujet}
                                                                                                options={listeSujet}
                                                                                                onChange={(e) => setSelectedSujet(e.value)}
                                                                                                placeholder="Sélectionner le sujet"
                                                                                                style={{
                                                                                                    fontWeight: 'bold',
                                                                                                    color: 'black'
                                                                                                }}
                                                                                                showClear
                                                                                            />
                                                                                            {errors.subject && <small className="p-error">{errors.subject}</small>}
                                                                                        </div>
                    
                                                                                    </div>
                                                    
                                                                                    
                                                                                    <div className="grid">
                                                                                        <div className="field col-12">
                                                                                            <div>
                                                                                                    <DownloadPDFButton etablissementId={user?.acteur?.etablissement?.id} etablissementName={user?.acteur?.etablissement?.name} session={prog?.edition} subject={selectedSujet} />                                                                        
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </form>
                                                    
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
    );
};

export default Crud;
