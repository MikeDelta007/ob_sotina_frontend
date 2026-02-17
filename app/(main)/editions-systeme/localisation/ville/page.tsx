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
import { DepartementDTO, ParametrageService, ProgrammationDTO, RegionDTO, SujetDTO, VilleDTO } from '@/demo/service/ParametrageService';
import * as Yup from 'yup';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { InputTextarea } from 'primereact/inputtextarea';
import { useFormik } from 'formik';
import { UserContext } from '@/app/userContext';
import ProtectedRoute from '@/layout/ProtectedRoute';
import { FiEdit } from 'react-icons/fi';

const Crud = () => {
    const { user } = useContext(UserContext);
    var is_update = useRef(false); // <== valeur persistante entre les appels
    var id_ville = useRef(null); // <== même chose pour l'ID du candidat

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

    const toast = useRef(null);
    const dt = useRef(null);
    const [products, setProducts] = useState(null);
    const [productDialog, setProductDialog] = useState(false);
    const [deleteProductDialog, setDeleteProductDialog] = useState(false);
    const [deleteProductsDialog, setDeleteProductsDialog] = useState(false);
    const [product, setProduct] = useState(emptyProduct);
    const [selectedProducts, setSelectedProducts] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);

    const [villes, setVilles] = useState([]);
    const [departements, setDepartements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        ParametrageService.getDepartements().then((response) => {
            //console.log("📦 Séries chargées :", data);
            setDepartements(response);
        });
    }, []);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            ParametrageService.getVilles()
                .then((response) => {
                    //console.log("📦 Séries chargées :", data);
                    setVilles(response);
                })
                .catch((error) => {
                    console.error('❌ Erreur lors du chargement des données :', error);
                });
        } catch (err) {
            console.error('❌ Erreur chargement données :', err);
            setError('Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

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
    };

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

    const editProduct = (ville) => {
        setProductDialog(true);

        const vFormatted = {
            ...ville
        };
        (id_ville.current = ville.id), console.log(id_ville);
        formik.setValues(vFormatted);
        is_update.current = true;
        console.log(is_update);
        console.log(vFormatted);
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
                <div className="my-2">
                    <Button severity="success" label="Ajouter une ville" icon="pi pi-plus" className="mr-2" onClick={openNew} />
                    {/* <Button severity="danger" label="Delete" icon="pi pi-trash" onClick={confirmDeleteSelected} disabled={!selectedProducts || !selectedProducts.length} /> */}
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return <React.Fragment>{/* <Button severity="help" label="Exporter la liste" icon="pi pi-upload" onClick={exportCSV} /> */}</React.Fragment>;
    };

    const codeBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">name</span>
                {rowData.name}
            </>
        );
    };

    const date1BodyTemplate = (rowData) => {
        const date = new Date(rowData.date_start);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Mois commence à 0
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const date2BodyTemplate = (rowData) => {
        const date = new Date(rowData.date_end);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Mois commence à 0
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
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
                <Button
                                                    icon="pi pi-pencil"
                                                    rounded
                                                    tooltip="Modifier l'intitulé de la ville"
                                                    tooltipOptions={{ position: 'bottom' }}
                                                    severity="warning"
                                                    className="mr-2"
                                                    onClick={() => editProduct(rowData)}
                                                />

                {/* <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteProduct(rowData)} /> */}
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Listing des ville (s)</h5>
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
            name: '',
            departement: null
        },
        validationSchema: Yup.object({
            name: Yup.string().required('Champ requis'),
            departement: Yup.object().required('Champ requis')
        }),

        onSubmit: async (values, { setSubmitting, resetForm }) => {
            const villeDTO: VilleDTO = {
                name: values.name,
                departement: values.departement
            };
            try {
                if (is_update.current === false) {
                    console.log('POST');
                    const response = await ParametrageService.createVille(villeDTO);
                    console.log('Data créé:', response.data);
                    toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Ville créée avec succès', life: 4000 });
                    resetForm();
                }
                if (is_update.current === true) {
                    console.log('PUT');
                    const response = await ParametrageService.updateVille(id_ville, villeDTO);
                    console.log('Data créé:', response.data);
                    toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Ville mise à jour avec succès', life: 4000 });
                    resetForm();
                }
                await loadData();
            } catch (error) {
                console.error('❌ Erreur :', error);
                toast.current.show({ severity: 'error', summary: 'Office du Bac', detail: 'Erreur lors de la création', life: 4000 });
            } finally {
                setSubmitting(false);
            }
            setSubmitted(false);
            setProductDialog(false);
        }
    });

    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="grid crud-demo">
                <div className="col-12">
                    <div className="card">
                        <Toast ref={toast} />
                        <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                        <DataTable
                            ref={dt}
                            value={villes}
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25]}
                            className="p-datatable-sm"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Affichage de {first} à {last} des {totalRecords} enregistrement (s)"
                            globalFilter={globalFilter}
                            emptyMessage="Aucun donnée n'a été trouvée"
                            header={header}
                            responsiveLayout="scroll"
                        >
                            <Column field="name" header="Intitulé" body={codeBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                            <Column body={actionBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        </DataTable>

                        <Dialog visible={productDialog} style={{ width: '700px' }} header="Gestion d'une ville" modal className="p-fluid" onHide={hideDialog}>
                            <form onSubmit={formik.handleSubmit}>
                                <div className="formgrid grid py-3">
                                    <div className="field col-6">
                                        <label htmlFor="spec_id">* Intitulé de la ville</label>
                                        <InputText
                                            id="name"
                                            name="name"
                                            value={formik.values.name}
                                            onChange={formik.handleChange}
                                            placeholder="Saisir l'intitulé du departement"
                                            className={`p-inputtext-sm w-full ${formik.touched.name && formik.errors.name ? 'p-invalid' : ''}`}
                                        />
                                        {formik.touched.name && typeof formik.errors.name === 'string' && <small className="p-error">{formik.errors.name}</small>}
                                    </div>
                                    <div className="field col-6">
                                        <label htmlFor="lastname">* Département</label>
                                        <Dropdown
                                            id="region"
                                            name="region"
                                            value={formik.values.departement}
                                            onChange={(e) => formik.setFieldValue('departement', e.value)}
                                            optionLabel="name"
                                            //optionValue="value"
                                            placeholder="Selectionner la département"
                                            options={departements}
                                            filter
                                            className="p-inputtext-sm w-full"
                                        />
                                        {formik.touched.departement && typeof formik.errors.departement === 'string' && <small className="p-error">{formik.errors.departement}</small>}
                                    </div>
                                </div>

                                <div className="formgrid grid">
                                    <div className="field col-6">
                                        <div>
                                            <Button severity="success" label="Ajouter une ville" className="mr-2" type="submit" />
                                            {/* <Button severity="danger" label="Delete" icon="pi pi-trash" onClick={confirmDeleteSelected} disabled={!selectedProducts || !selectedProducts.length} /> */}
                                        </div>
                                    </div>
                                </div>
                            </form>
                            ,
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

export default Crud;
