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
import { BaseMorteDTO, ParametrageService, ProgrammationDTO, SujetDTO } from '@/demo/service/ParametrageService';
import * as Yup from 'yup';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { InputTextarea } from 'primereact/inputtextarea';
import { useFormik } from 'formik';
import { UserContext } from '@/app/userContext';
import ProtectedRoute from '@/layout/ProtectedRoute';
import { idText } from 'typescript';
import { FiEdit } from 'react-icons/fi';
import { InputNumber } from 'primereact/inputnumber';

const CalendarDemo = () => {
    var is_update = useRef(false); // <== valeur persistante entre les appels
    var id_prog = useRef(null); // <== même chose pour l'ID du candidat

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
    const [code, setCode] = useState("");

    const [series, setSeries] = useState(null);

    const [specialites, setSpecialites] = useState(null);

    const [specialite, setSpecialite] = useState('');
    const [wording, setWording] = useState('');
    const [num_sujet, setNumsujet] = useState(0);
    const [etab_id, setEtab] = useState('');
    const [spec_id, setSpec] = useState('');

    const [message, setMessage] = useState('');

    const [sujets, setSujetData] = useState([]);

    const [archives, setArchives] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: 10,
        page: 0,
        globalFilter: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        ProductService.getProducts().then((data) => setProducts(data));
    }, []);

    useEffect(() => {
        ParametrageService.getSeries().then((response) => {
            //console.log("📦 Séries chargées :", data);
            setSeries(response);
        });
    }, []);

    useEffect(() => {
        loadData();
    }, [lazyParams]);

    const loadData = () => {
    if (lazyParams.globalFilter?.trim() === "") {
        delete lazyParams.globalFilter;
    }
    ParametrageService.getArchives(lazyParams.page, lazyParams.rows, lazyParams.globalFilter)
        .then((result) => {
            setArchives(result.data);
            setTotalRecords(result.total);
        })
        .catch((error) => {
            console.error("❌ Erreur chargement archives :", error);
        });
    };

    const syllabes = [
        "ma", "ba", "ka", "sa", "di", "fa", "la", "na", "ra", "ta",
        "mo", "lo", "ko", "do", "no", "so", "fo", "bo", "mi", "ni",
        "ou", "ya", "se", "ke", "le", "ga", "chi", "nda", "ndu", "dou",
        "ha", "da", "lu", "me", "ne", "ti", "su", "zi", "kou", "dja"
    ];

    const genererCode = () => {
        let lettres = "";
        let lettres2 = "";
        // On assemble des syllabes jusqu’à atteindre 5 lettres
        while (lettres.length < 5) 
        {
            const s = syllabes[Math.floor(Math.random() * syllabes.length)];
            lettres += s;
        }

        while (lettres2.length < 5) 
        {
            const s = syllabes[Math.floor(Math.random() * syllabes.length)];
            lettres2 += s;
        }

        lettres = lettres.slice(0, 5).toLowerCase();
        lettres2 = lettres2.slice(0, 5).toLowerCase();

        // On génère 2 chiffres aléatoires
        const chiffres = Math.floor(Math.random() * 100)
        .toString()
        .padStart(2, "0"); // ex: 07 au lieu de 7

        const chiffres2 = Math.floor(Math.random() * 100)
        .toString()
        .padStart(2, "0"); // ex: 07 au lieu de 7

        // On combine lettres + chiffres
        const codeFinal = lettres + chiffres;
        const codeFinal2 = lettres2 + chiffres2;

        formik.setFieldValue("codeSup1", codeFinal);
        formik.setFieldValue("codeSup2", codeFinal2);
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

    const formatDateToInput = (isoDateStr) => {
        const date = new Date(isoDateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const editProduct = (product) => {
        const progFormatted = {
            ...product
        };
        console.log(progFormatted);
        setProductDialog(true);
        (id_prog.current = product.id),
            // console.log(id_prog);
            formik.setValues(progFormatted);
        is_update.current = true;
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
                    <Button severity="success" label="Ajouter des lignes d'archives" icon="pi pi-plus" className="mr-2" onClick={openNew} disabled = {true}/>
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
                <span className="p-column-title">N° Table</span>
                {rowData.tableNum}
            </>
        );
    };

    const anneeBACBodyTemplate = (rowData) => {
        return (
            <>{rowData.exYearBac}</>
             );
    };

    const firstnameTemplate = (rowData) => {
        return (
            <>{rowData.firstname}</>
             );
    };

    const lastnameTemplate = (rowData) => {
        return (
            <>{rowData.lastname}</>
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
                {/* <Button tooltip="Modifier la programmation" tooltipOptions={{ position: 'bottom' }} rounded className="p-2" severity="warning" onClick={() => editProduct(rowData)}>
                    <FiEdit style={{ width: '20px', height: '20px' }} />
                </Button> */}
                <Button
                    icon="pi pi-pencil"
                    rounded
                    label="Editer la durée d'exclusion"
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
            <h5 className="m-0">Listing des archives candidats</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    type="search"
                    value={globalFilter ?? ''}   // <-- si globalFilter est null, on met ''
                    onChange={(e) => {
                        const value = e.target.value;
                        setGlobalFilter(value);

                        setLazyParams(prev => ({
                            ...prev,
                            page: 0,
                            first: 0,
                            globalFilter: value // on laisse le backend gérer la conversion en int
                        }));
                    }}
                    placeholder="Numéro de table..."
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

    const formik = useFormik({
        initialValues: {
            tableNum : 0,
            exYearBac : 0,
            firstname : '',
            lastname : '',
            date_birth: null as Date | null,
            place_birth : '',
            gender : '',
            countryBirth : '',
            etablissement : '',
            bac_do_count : 0,
            codeCentreEtatCivil : '',
            yearRegistryNum : 0,
            registryNum : '',
            exclusionDuree : 0
        },
        validationSchema: Yup.object({
            exclusionDuree : Yup.number().required("Champ requis"),
        }),

        onSubmit: async (values, { setSubmitting, resetForm }) => {

            const baseMorteDTO : BaseMorteDTO = {
                exclusionDuree: values.exclusionDuree
            };

            console.log(baseMorteDTO);
            console.log(id_prog);

            try {
                if (is_update.current === false) {
                    // console.log('POST');
                    // const response = await ParametrageService.updateDureeMention(programmationDTO);
                    // console.log('✅ Prog créé:', response.data);
                    // toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Programmation créé avec succès', life: 4000 });
                }
                if (is_update.current === true) {
                    console.log('PUT');
                    const response = await ParametrageService.updateDureeMention(id_prog.current, baseMorteDTO.exclusionDuree);
                    console.log('✅ Progrg mis à jour:', response.data);
                    toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Durée d\'exclusion mise à jour avec succès', life: 4000 });
                    is_update.current = false;
                }
                await loadData();
                resetForm();
            } 
            catch (error) 
            {
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
                            paginator
                            value={archives}
                            lazy
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
                            globalFilter={globalFilter}
                            emptyMessage="Aucune archive n'a été trouvée"
                            header={header}
                            responsiveLayout="scroll"
                        >
                            <Column field="numTable" header="N° de table" body={codeBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                            <Column field="exYearBac" header="Année BAC" sortable body={anneeBACBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                            <Column field="firstname" header="Prénom (s)" sortable body={firstnameTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                            <Column field="lastname" header="NOM" sortable body={lastnameTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                            <Column body={actionBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        </DataTable>

                        <Dialog visible={productDialog} style={{ width: '500px' }} header="Archive du candidat" modal className="p-fluid" onHide={hideDialog}>
                            <form onSubmit={formik.handleSubmit}>
                                <div className="formgrid grid">
                                    <div className="field col-3">
                                        <label htmlFor="spec_id">
                                            <b>N° de table</b>
                                        </label>
                                        <InputText
                                            disabled = {true}
                                            style={{
                                            fontWeight: 'bold',
                                            color: 'black'
                                            }}
                                            id="tableNum"
                                            name="tableNum"
                                            value={formik.values.tableNum?.toString() ?? ''}
                                            className={`p-inputtext-sm w-full`}
                                        />
                                        
                                    </div>
                                    <div className="field col-3">
                                        <label htmlFor="spec_id">
                                            <b>Année du BAC</b>
                                        </label>
                                        <InputText
                                            disabled = {true}
                                            style={{
                                            fontWeight: 'bold',
                                            color: 'black'
                                            }}
                                            id="tableNum"
                                            name="tableNum"
                                            value={formik.values.exYearBac?.toString() ?? ''}
                                            className={`p-inputtext-sm w-full`}
                                        />
                                        </div>
                                    
                                    <div className="field col-3">
                                        <label htmlFor="spec_id">
                                            <b>Nb. Fois</b>
                                        </label>
                                        <InputText
                                            disabled = {true}
                                            style={{
                                            fontWeight: 'bold',
                                            color: 'black'
                                            }}
                                            id="tableNum"
                                            name="tableNum"
                                            value={formik.values.bac_do_count?.toString() ?? ''}
                                            className={`p-inputtext-sm w-full`}
                                        />
                                    </div>
                                </div>

                                <div className="formgrid grid">
                                    <div className="field col-2">
                                        <label htmlFor="spec_id">
                                            <b>Sexe</b>
                                        </label>
                                        <InputText
                                            disabled = {true}
                                            style={{
                                            fontWeight: 'bold',
                                            color: 'black'
                                            }}
                                            id="edition"
                                            name="edition"
                                            value={formik.values.gender}
                                            onChange={formik.handleChange}
                                            placeholder="Saisir l'édition du bac"
                                            className={`p-inputtext-sm w-full`}
                                        />
                                    </div>
                                    <div className="field col-5">
                                        <label htmlFor="spec_id">
                                            <b>Prénom (s)</b>
                                        </label>
                                        <InputText
                                            disabled = {true}
                                            style={{
                                            fontWeight: 'bold',
                                            color: 'black'
                                            }}
                                            id="edition"
                                            name="edition"
                                            value={formik.values.firstname}
                                            onChange={formik.handleChange}
                                            placeholder="Saisir l'édition du bac"
                                            className={`p-inputtext-sm w-full`}
                                        />
                                    </div>

                                    <div className="field col-5">
                                        <label htmlFor="spec_id">
                                            <b>NOM</b>
                                        </label>
                                        <InputText
                                            disabled = {true}
                                            style={{
                                            fontWeight: 'bold',
                                            color: 'black'
                                            }}
                                            id="edition"
                                            name="edition"
                                            value={formik.values.lastname}
                                            onChange={formik.handleChange}
                                            placeholder="Saisir l'édition du bac"
                                            className={`p-inputtext-sm w-full`}
                                        />
                                        
                                    </div>
                                </div>

                                <div className="formgrid grid">
                                    <div className="field col-3">
                                        <label htmlFor="price">
                                            <b>Date de naissance</b>
                                        </label>
                                        <InputText
                                            disabled = {true}
                                            style={{
                                            fontWeight: 'bold',
                                            color: 'black'
                                            }}
                                            id="edition"
                                            name="edition"
                                            value={formik.values.date_birth?.toString() ?? ''}
                                            onChange={formik.handleChange}
                                            placeholder="Saisir l'édition du bac"
                                            className={`p-inputtext-sm w-full`}
                                        />
                                    </div>

                                    <div className="field col-4">
                                        <label htmlFor="spec_id">
                                            <b>Lieu de naissance</b>
                                        </label>
                                        <InputText
                                            disabled = {true}
                                            style={{
                                            fontWeight: 'bold',
                                            color: 'black'
                                            }}
                                            id="edition"
                                            name="edition"
                                            value={formik.values.place_birth}
                                            onChange={formik.handleChange}
                                            placeholder="Saisir l'édition du bac"
                                            className={`p-inputtext-sm w-full`}
                                        />
                                        
                                    </div>

                                     <div className="field col-5">
                                        <label htmlFor="spec_id">
                                            <b>Pays de naissance</b>
                                        </label>
                                        <InputText
                                            disabled = {true}
                                            style={{
                                            fontWeight: 'bold',
                                            color: 'black'
                                            }}
                                            id="edition"
                                            name="edition"
                                            value={formik.values.countryBirth}
                                            onChange={formik.handleChange}
                                            placeholder="Saisir l'édition du bac"
                                            className={`p-inputtext-sm w-full`}
                                        />
                                    </div>
                                </div>

                                <div className="formgrid grid">
                                    <div className="field col-3">
                                        <label htmlFor="price">
                                            <b>Etablissement</b>
                                        </label>
                                        <InputText
                                            disabled = {true}
                                            style={{
                                            fontWeight: 'bold',
                                            color: 'black'
                                            }}
                                            id="edition"
                                            name="edition"
                                            value={formik.values.etablissement}
                                            onChange={formik.handleChange}
                                            placeholder="Saisir l'édition du bac"
                                            className={`p-inputtext-sm w-full`}
                                        />
                                    </div>

                                    <div className="field col-3">
                                        <label htmlFor="spec_id">
                                            <b>Durée d&apos;exclusion</b>
                                        </label>
                                        <InputNumber
                                            id="exclusionDuree"
                                            name="exclusionDuree"
                                            min={0}
                                            value={formik.values.exclusionDuree}
                                            onValueChange={(e) => {
                                                // Vérifie que la nouvelle valeur ne dépasse pas 999
                                                const newValue = e.value > 999 ? 999 : e.value;
                                                formik.setFieldValue('exclusionDuree', newValue);
                                            }}
                                            placeholder="Durée Exclusion"
                                            className="p-inputtext-sm w-full"
                                            inputStyle={{
                                                fontWeight: 'bold',
                                                color: 'red',
                                                fontSize: '1.5rem'
                                            }}
                                        />


                                        {formik.touched.exclusionDuree && formik.errors.exclusionDuree && <small className="p-error">{formik.errors.exclusionDuree as string}</small>}
                                    </div>
                                </div>

                                <fieldset className="border-1 border-round-md surface-border" style={{ borderColor: "#0040ffff", borderRadius: "8px" }}>
                                <legend className="text-sm font-semibold text-gray-700 px-2">
                                    <b>Informations Etat Civil</b>
                                </legend>

                                <div className="formgrid grid">
                                    <div className="formgrid grid align-items-end">

                                    {/* CODE SUPERVISEUR ÉTAT CIVIL */}
                                    <div className="field col-4">
                                        <label htmlFor="codeSup1">
                                        <b>Code</b>
                                        </label>
                                        <InputText
                                        id="codeSup1"
                                        name="codeSup1"
                                        readOnly
                                        value={formik.values.codeCentreEtatCivil}
                                        onChange={formik.handleChange}
                                        placeholder="Cliquez sur Générer pour obtenir le code"
                                        className={`p-inputtext-sm w-full`}
                                        style={{
                                            fontWeight: "bold",
                                            color: "black",
                                        }}
                                        />
                                       
                                    </div>

                                    {/* CODE SUPERVISEUR DNP */}
                                    <div className="field col-4">
                                        <label htmlFor="codeSup2">
                                        <b>Année</b>
                                        </label>
                                        <InputText
                                        id="codeSup2"
                                        name="codeSup2"
                                        readOnly
                                        value={formik.values.yearRegistryNum?.toString() ?? ''}
                                        onChange={formik.handleChange}
                                        placeholder="Saisir ou générer un code"
                                        className={`p-inputtext-sm w-full`}
                                        style={{
                                            fontWeight: "bold",
                                            color: "black",
                                        }}
                                        />
                                       
                                    </div>

                                     <div className="field col-4">
                                        <label htmlFor="codeSup2">
                                        <b>Numéro</b>
                                        </label>
                                        <InputText
                                        id="codeSup2"
                                        name="codeSup2"
                                        readOnly
                                        value={formik.values.registryNum}
                                        onChange={formik.handleChange}
                                        placeholder="Saisir ou générer un code"
                                        className={`p-inputtext-sm w-full`}
                                        style={{
                                            fontWeight: "bold",
                                            color: "black",
                                        }}
                                        />
                                       
                                    </div>
                                    </div>
                                </div>
                                </fieldset>
                                

                                <div className="formgrid grid">
                                    <div className="field col-6">
                                        <div>
                                            <Button severity="success" label="Enregistrer" className="mr-2 mt-3" type="submit" />
                                        </div>
                                    </div>
                                </div>
                                
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
        </ProtectedRoute>
    );
};

export default CalendarDemo;
