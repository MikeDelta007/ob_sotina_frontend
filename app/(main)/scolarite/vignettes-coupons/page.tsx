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
import { Document, Page, pdfjs } from 'react-pdf';
import type { Demo } from '@/types';
import { ProductService } from '@/demo/service/ProductService';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { Calendar } from 'primereact/calendar';
import { Carousel } from 'primereact/carousel';
import { CandidatDecisionDTO, CandidatDTO, CandidatureService, VignetteAddDTO } from '@/demo/service/CandidatureService';
import * as Yup from 'yup';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { UserContext } from '@/app/userContext';
import { useFormik } from 'formik';
import { FileService } from '@/demo/service/FileService';
import { InputNumber } from 'primereact/inputnumber';
import dynamic from 'next/dynamic';
import ProtectedRoute from '@/layout/ProtectedRoute';
import './style.css'

//pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs"
const PdfViewer = dynamic(() => import('../../pdfViewer'), {
    ssr: false // Désactive le rendu côté serveur pour ce composant
});

const ValidationCandidat = () => {
    const { user } = useContext(UserContext);

    var is_update = useRef(false); // <== valeur persistante entre les appels
    var id_ev = useRef(null); // <== même chose pour l'ID du candidat

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
    const [recuDialog, setRecuDialog] = useState(false);
    const [deactiveButton, setDeactiveButton] = useState(false);
    const [recuDialog2, setRecuDialog2] = useState(false);
    const [file, setFile] = useState(null);
    const [fileId, setFileId] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);
    const [etabs, setEtabs] = useState(null);
    const [numPages, setNumPages] = useState(null);

    const [matieres, setMatiereOptions] = useState([]);

    const [evs, setEVData] = useState([]);
    const [reloadTrigger, setReloadTrigger] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    const [annees, setAnnees] = useState(null);
    const [edition, setEdition] = useState(null);
    const [etablissement, setEtablissement] = useState(null);
    const [rejets, setRejets] = useState(null);
    const [selectedValues, setSelectedValues] = useState<string[]>([]);

    const [radioValue, setRadioValue] = useState(null);

    const [prog, setOneProg] = useState<{ edition?: number } | null>(null);

    const [decisionStats, setDecisionStats] = useState({ decision0: 0, decision1: 0, decision2: 0, total: 0 });

    const [filterText, setFilterText] = useState('');

    useEffect(() => {
        ProductService.getProducts().then((data) => setProducts(data));
    }, []);

    useEffect(() => {
        CandidatureService.getLastProg().then((response) => {
            //console.log("📦 Séries chargées :", data);
            setOneProg(response);
        });
    }, []);

    useEffect(() => {
        CandidatureService.getEtablissements().then((response) => {
            //console.log("📦 Séries chargées :", data);
            setEtabs(response);
        });
    }, []);

    useEffect(() => {
        CandidatureService.getProgs().then((response) => {
            //console.log("📦 Séries chargées :", data);
            setAnnees(response);
        });
    }, []);

    const loadDatas = useCallback(async () => {
        setLoading(true);
        setError(null);

        if (!edition) {
            console.warn('Filtres manquants pour charger les données');
            setLoading(false);
            return;
        }

        try {
            const response = await CandidatureService.filterEtatsVersements(edition?.edition);
            console.log('OK', edition?.edition);
            setEVData(response);
        } catch (err) {
            console.error('❌ Erreur chargement données :', err);
            setError('Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    }, [edition]);

    useEffect(() => {
        loadDatas();
    }, [reloadTrigger, loadDatas]);

    const openNew = () => {
        formik.resetForm(); // remet à zéro les erreurs et touches
        formik.setValues(Object); // valeurs initiales
        setSubmitted(false);
        //setIsEditMode(false); // facultatif : flag pour différencier "ajouter" / "modifier"
        setProductDialog(true); // ou ton Dialog / Carousel
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

    const editProduct = async (rowData) => {
        id_ev.current = rowData.id;
        setDeactiveButton(rowData.state);
        console.log(rowData);
        setRecuDialog(true);
        if (rowData.file_id) {
            setFileId(rowData.file_id);
            const response = await FileService.getViewUrl(rowData.file_id);
            if (response) {
                console.log('URL PDF:', response); // <---- ici
                const dataFormatted = {
                    v1000: rowData.count_1000_EF,
                    v5000: rowData.count_5000
                };
                formik.setValues(dataFormatted);
                console.log('ICi', rowData);
                setFileUrl(response);
                setRecuDialog(true);
            }
        }
    };

    const hideDialog = () => {
        if (recuDialog) {
            setRecuDialog(false);
        }
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
                        <fieldset className="custom-fieldset text-sm" style={{ padding: '5px' }}>
                            <legend className="font-bold text-sm">Effectuer les filtres</legend>

                            <div
                                className="filter-container"
                                style={{
                                    display: 'flex',
                                    gap: '10px', // espace entre les deux champs
                                    alignItems: 'flex-start',
                                    flexWrap: 'wrap'
                                }}
                            >
                                {/* <div style={{ width: '600px' }}>
                                    <label htmlFor="etablissement">
                                        <h6 className="m-0">Liste des établissements</h6>
                                    </label>
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
                                        virtualScrollerOptions={{ itemSize: 40 }} // ou 30 selon le style
                                    />
                                </div> */}

                                <div style={{ width: '200px' }}>
                                    <label htmlFor="serieCode">
                                        <h6 className="mb-1">Edition du bac</h6>
                                    </label>
                                    <Dropdown
                                        showClear
                                        id="edition"
                                        name="edition"
                                        options={annees}
                                        value={edition}
                                        onChange={(e) => setEdition(e.value)}
                                        disabled={!etabs || etabs.length === 0}
                                        optionLabel="edition"
                                        placeholder="Choisir une édition du bac"
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
                {/* <Button severity="info" label="Importer la liste" icon="pi pi-arrow-down-right" className="mr-2 inline-block"/> */}
                {/* <Button severity="help" label="Exporter la liste" icon="pi pi-upload" onClick={exportCSV} /> */}
            </React.Fragment>
        );
    };

    const DDBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">date_deposit</span>
                {rowData.date_deposit}
            </>
        );
    };

    const SBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">session</span>
                {rowData.session}
            </>
        );
    };

    const EtabBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">etablissement</span>
                {rowData.etablissement.code}
            </>
        );
    };

    const C5000BodyTemplate = (rowData) => {
        return <span>{rowData.count_5000}</span>;
    };

    const C1000BodyTemplate = (rowData) => {
        return <span>{rowData.count_1000_EF}</span>;
    };

    const action0BodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-eye" label="Consulter l'état pour l'attribution" rounded severity={'warning'} className="mr-2" onClick={() => editProduct(rowData)} />
            </>
        );
    };

    // const actionBodyTemplate = (rowData) => {
    //     return (
    //         <>
    //             <Button
    //                 icon="pi pi-check-square"
    //                 label="Valider l'attribution"
    //                 rounded
    //                 severity={"success"}
    //                 className="mr-2"
    //                 //onClick={() => editProduct(rowData)}
    //             />
    //         </>
    //     );
    // };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <div className="flex flex-wrap gap-3">
                <h4>Vignettes & Coupons</h4>
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
            v1000: 0,
            v5000: 0
        },

        validationSchema: Yup.object({
                        v1000: Yup.number()
                            .required('Champ obligatoire')
                            .moreThan(0, 'La valeur doit être supérieure à 0'),
                            
                        v5000: Yup.number()
                            .required('Champ obligatoire')
                            .moreThan(0, 'La valeur doit être supérieure à 0'),
        }),

        onSubmit: async (values, { setSubmitting, resetForm }) => {
            const vignetteAddDTO: VignetteAddDTO = {
                v1000: values.v1000,
                v5000: values.v5000
            };

            console.log(vignetteAddDTO);

            try {
                console.log('PATCH');
                const response = await CandidatureService.updateCoupons(id_ev, vignetteAddDTO, user?.firstname, user?.lastname);
                console.log('✅ Coupons mis à jour:', response.data);
                setMessage('Coupons mis à jour avec succès');
                toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Coupons rajoutés avec succès', life: 4000 });
                //resetForm();
                await loadDatas();
            } catch (error) {
                console.error('❌ Erreur :', error);
                setMessage('Erreur');
                toast.current.show({ severity: 'error', summary: 'Office du Bac', detail: 'Erreur lors de la validation des coupons', life: 4000 });
            } finally {
                setSubmitting(false);
            }
            setSubmitted(false);
            setRecuDialog(false);
        }
    });

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

    return (
        <ProtectedRoute allowedRoles={['SCOLARITE', 'ADMIN', 'VIGNETTES_COUPONS']}>
            <div className="grid crud-demo">
                <div className="col-12">
                    <div className="card">
                        <Toast ref={toast} />
                        <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                        <DataTable
                            ref={dt}
                            value={evs}
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25]}
                            className="datatable-responsive"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Affichage de {first} à {last} des {totalRecords} enregistrement (s)"
                            globalFilter={globalFilter}
                            emptyMessage="Aucune transaction n'a été trouvée"
                            header={header}
                            responsiveLayout="scroll"
                        >
                            <Column field="session" header="Session" body={SBodyTemplate} headerStyle={{ minWidth: '5rem' }} />
                            <Column field="etab" header="Etablissement" body={EtabBodyTemplate} headerStyle={{ minWidth: '10rem' }} />
                            <Column
                                field="date_deposit"
                                header="Date de dépôt"
                                sortable
                                headerStyle={{ minWidth: '10rem' }}
                                body={(rowData) => {
                                    const date = new Date(rowData.date_deposit);

                                    const day = String(date.getDate()).padStart(2, '0');
                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                    const year = date.getFullYear();

                                    const hours = String(date.getHours()).padStart(2, '0');
                                    const minutes = String(date.getMinutes()).padStart(2, '0');

                                    return `${day}/${month}/${year} - ${hours}:${minutes}`;
                                }}
                            />
                            <Column field="count_5000" header="Vignettes de 5000 F" body={C5000BodyTemplate} />
                            <Column field="count_1000_EF" header="Vignettes de 1000 F" body={C1000BodyTemplate} />
                            <Column body={action0BodyTemplate} headerStyle={{ minWidth: '10rem' }} />
                            {/* <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} /> */}
                        </DataTable>

                        <Dialog visible={recuDialog} style={{ width: '1000px' }} header="Etat de versement" modal className="p-fluid" onHide={hideDialog}>
                            <div className="formgrid grid">
                                <form onSubmit={formik.handleSubmit}>
                                    <div className="field col-12">
                                        <fieldset className="p-2 border-round-md surface-border text-sm">
                                            <legend className="text-primary font-bold text-sm">Décompte des vignettes selon la somme versée</legend>
                                            <div className="formgrid grid">
                                                <div className="field col-3">
                                                    <label htmlFor="email"><b>Vignettes à 5000 FCFA</b></label>
                                                    <InputNumber id="v5000" 
                                                    name="v5000" 
                                                    value={formik.values.v5000} 
                                                    onChange={(e) => formik.setFieldValue('v5000', e.value)} 
                                                    className="p-inputtext-sm font-bold text-black" 
                                                    placeholder="Droits d'inscription à 5000 FCFA" 
                                                    min={0}
                                                    onBlur={formik.handleBlur}
                                                    disabled={deactiveButton}
                                                        style={{
                                                            fontWeight: 'bold',
                                                            color: 'black'
                                                    }}
                                                    />
                                                    {formik.touched.v5000 && typeof formik.errors.v5000 === 'number' && <small className="p-error">{formik.errors.v5000}</small>}
                                                </div>
                                                <div className="field col-3">
                                                    <label htmlFor="email"><b>Vignettes à 1000 FCFA</b></label>
                                                    <InputNumber
                                                        id="v1000"
                                                        name="v1000"
                                                        value={formik.values.v1000}
                                                        onChange={(e) => formik.setFieldValue('v1000', e.value)}
                                                        className="p-inputtext-sm font-bold text-black"
                                                        placeholder="Epreuves Facultatives à 1000 FCFA"
                                                        min={0}
                                                        disabled={deactiveButton}
                                                        onBlur={formik.handleBlur}
                                                        style={{
                                                            fontWeight: 'bold',
                                                            color: 'black'
                                                        }} 
                                                    />
                                                    {formik.touched.v1000 && typeof formik.errors.v1000 === 'number' && <small className="p-error">{formik.errors.v1000}</small>}
                                                </div>
                                                {!deactiveButton ? (
                                                <div className="field col-3">
                                                    <label htmlFor="email"></label>
                                                    <Button
                                                    icon="pi pi-check-square"
                                                    label="Valider l'attribution"
                                                    rounded
                                                    severity="success"
                                                    className="mr-1 mt-1"
                                                    type="submit"
                                                    />
                                                </div>
                                                ) : (
                                                <div className="field col-3 flex align-items-center">
                                                    <span className="text-red-500 text-md">
                                                    <b>⚠️ Une fois l&apos;attribution des vignettes effectuée, tout ajustement relève de la compétence exclusive du service de la SCOLARITE.
                                                    </b>
                                                    </span>
                                                </div>
                                                )}
                                            </div>
                                        </fieldset>
                                    </div>
                                </form>
                            </div>

                            {fileUrl ? <PdfViewer fileUrl={fileUrl} /> : <p>Chargement du PDF...</p>}
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
