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
import { ParametrageService, ProgrammationDTO, SujetDTO } from '@/demo/service/ParametrageService';
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

    const [progs, setProgs] = useState([]);

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
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            ParametrageService.getProg()
                .then((response) => {
                    //console.log("📦 Séries chargées :", data);
                    setProgs(response);
                })
                .catch((error) => {
                    console.error('❌ Erreur lors du chargement des séries :', error);
                });
        } catch (err) {
            console.error('❌ Erreur chargement candidats :', err);
            setError('Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
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
            ...product,
            date_start: product.date_start,
            date_end: product.date_end
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
                    <Button severity="success" label="Ajouter une programmation" icon="pi pi-plus" className="mr-2" onClick={openNew} />
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
                <span className="p-column-title">edition</span>
                {rowData.edition}
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
                {/* <Button tooltip="Modifier la programmation" tooltipOptions={{ position: 'bottom' }} rounded className="p-2" severity="warning" onClick={() => editProduct(rowData)}>
                    <FiEdit style={{ width: '20px', height: '20px' }} />
                </Button> */}
                <Button
                    icon="pi pi-pencil"
                    rounded
                    tooltip="Editer la programmation"
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
            <h5 className="m-0">Listing des dates d`&apos;ouverture de la plateforme d`&apos;enrôlement</h5>
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
            edition: '',
            date_start: null as Date | null,
            date_end: null as Date | null,
            codeSup1 : '',
            codeSup2 : '',
        },
        validationSchema: Yup.object({
            edition: Yup.string().required("Edition du bac requise"),
            date_start: Yup.string().required("La date de début d'enrôlement est requise"),
            date_end: Yup.string().required("La date de fin d'enrôlement est requise"),
            codeSup1: Yup.string().required("Code superviseur Etat Civil requis"),
            codeSup2: Yup.string().required("Code superviseur DNP requis")
        }),

        onSubmit: async (values, { setSubmitting, resetForm }) => {
            console.log(values.date_start);
            console.log(values.date_end);

            // Convertir la date en string ISO (yyyy-mm-dd) si elle existe
            const date1 = values.date_start ? new Date(values.date_start).toISOString().split('T')[0] : null;

            const date2 = values.date_end ? new Date(values.date_end).toISOString().split('T')[0] : null;

            const programmationDTO: ProgrammationDTO = {
                edition: values.edition,
                date_start: date1,
                date_end: date2,
                bfemEPI: Number(values.edition) - 3,
                bfemI: Number(values.edition) - 4,
                codeSup1: values.codeSup1,
                codeSup2: values.codeSup2
            };

            console.log(programmationDTO);

            try {
                if (is_update.current === false) {
                    console.log('POST');
                    const response = await ParametrageService.createProg(programmationDTO);
                    console.log('✅ Prog créé:', response.data);
                    toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Programmation créé avec succès', life: 4000 });
                }
                if (is_update.current === true) {
                    console.log('PUT');
                    const response = await ParametrageService.updateProg(id_prog, programmationDTO);
                    console.log('✅ Progrg mis à jour:', response.data);
                    toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Programmation mis à jour avec succès', life: 4000 });
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
                            value={progs}
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25]}
                            className="p-datatable-sm"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Affichage de {first} à {last} des {totalRecords} enregistrement (s)"
                            globalFilter={globalFilter}
                            emptyMessage="Aucun sujet n'a été trouvé"
                            header={header}
                            responsiveLayout="scroll"
                        >
                            <Column field="edition" header="Edition du bac" body={codeBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                            <Column field="date_start" header="Date de début des enrôlements" sortable body={date1BodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                            <Column field="date_end" header="Date de fin des enrôlements" sortable body={date2BodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                            <Column body={actionBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        </DataTable>

                        <Dialog visible={productDialog} style={{ width: '500px' }} header="Informations sur la période d'ouverture de PortailBAC" modal className="p-fluid" onHide={hideDialog}>
                            <form onSubmit={formik.handleSubmit}>
                                <div className="formgrid grid">
                                    <div className="field col-3">
                                        <label htmlFor="spec_id">
                                            <b>* Edition du bac</b>
                                        </label>
                                        <InputText
                                            style={{
                                            fontWeight: 'bold',
                                            color: 'black'
                                            }}
                                            id="edition"
                                            name="edition"
                                            value={formik.values.edition}
                                            onChange={formik.handleChange}
                                            placeholder="Saisir l'édition du bac"
                                            className={`p-inputtext-sm w-full ${formik.touched.edition && formik.errors.edition ? 'p-invalid' : ''}`}
                                        />
                                        {formik.touched.edition && typeof formik.errors.edition === 'string' && <small className="p-error">{formik.errors.edition}</small>}
                                    </div>
                                    <div className="field col-3">
                                        <label htmlFor="quantity">
                                            <b>BFEM pour EPI</b>
                                        </label>
                                        <br />
                                        <span className="font-bold text-green-600 text-xl">- de {formik.values.edition ? Number(formik.values.edition) - 3 : 0}</span>
                                    </div>

                                    <div className="field col-3">
                                        <label htmlFor="quantity">
                                            <b>BFEM pour I</b>
                                        </label>
                                        <br />
                                        <span className="font-bold text-green-600 text-xl">- de {formik.values.edition ? Number(formik.values.edition) - 4 : 0}</span>
                                    </div>
                                </div>

                                <div className="formgrid grid">
                                    <div className="field col-6">
                                        <label htmlFor="price">
                                            <b>* Date de début des enrôlements</b>
                                        </label>
                                        <Calendar
                                            style={{
                                                fontWeight: 'bold',
                                                color: 'black'
                                            }}
                                            id="date_start"
                                            name="date_start"
                                            value={formik.values.date_start ? new Date(formik.values.date_start) : null}
                                            onChange={(e) => formik.setFieldValue('date_start', e.value as Date)}
                                            showIcon
                                            dateFormat="dd/mm/yy"
                                            placeholder="Choisir une date"
                                        />

                                        {formik.touched.date_start && formik.errors.date_start && <small className="p-error">{formik.errors.date_start as string}</small>}
                                    </div>
                                </div>

                                <div className="formgrid grid">
                                    <div className="field col-6">
                                        <label htmlFor="price">
                                            <b>* Date de fin des enrôlements</b>
                                        </label>
                                        <Calendar
                                            style={{
                                                fontWeight: 'bold',
                                                color: 'black'
                                            }}
                                            id="date_end"
                                            name="date_end"
                                            value={formik.values.date_end ? new Date(formik.values.date_end) : null}
                                            onChange={(e) => formik.setFieldValue('date_end', e.value as Date)}
                                            showIcon
                                            dateFormat="dd/mm/yy"
                                            placeholder="Choisir une date"
                                        />

                                        {formik.touched.date_end && formik.errors.date_end && <small className="p-error">{formik.errors.date_end as string}</small>}
                                    </div>
                                </div>

                                <fieldset className="border-1 border-round-md surface-border" style={{ borderColor: "#0040ffff", borderRadius: "8px" }}>
                                <legend className="text-sm font-semibold text-gray-700 px-2">
                                    <b>Codes superviseurs pour la reception de dossier</b>
                                </legend>

                                <div className="formgrid grid">
                                    <div className="formgrid grid align-items-end">

                                    {/* BOUTON GÉNÉRER */}
                                    <div className="field col-2 flex align-items-end">
                                    <Button
                                        type="button"
                                        severity="info"
                                        onClick={genererCode}
                                        className="ml-2 w-full flex flex-column justify-center items-center text-center py-3"
                                    >
                                        <span style={{ lineHeight: "1.2" }}>
                                        Générer<br />les codes
                                        </span>
                                    </Button>
                                    </div>


                                    {/* CODE SUPERVISEUR ÉTAT CIVIL */}
                                    <div className="field col-5">
                                        <label htmlFor="codeSup1">
                                        <b>* Code superviseur État Civil</b>
                                        </label>
                                        <InputText
                                        id="codeSup1"
                                        name="codeSup1"
                                        readOnly
                                        value={formik.values.codeSup1}
                                        onChange={formik.handleChange}
                                        placeholder="Cliquez sur Générer pour obtenir le code"
                                        className={`p-inputtext-sm w-full ${
                                            formik.touched.codeSup1 && formik.errors.codeSup1
                                            ? "p-invalid"
                                            : ""
                                        }`}
                                        style={{
                                            fontWeight: "bold",
                                            color: "black",
                                        }}
                                        />
                                        {formik.touched.codeSup1 &&
                                        typeof formik.errors.codeSup1 === "string" && (
                                            <small className="p-error">{formik.errors.codeSup1}</small>
                                        )}
                                    </div>

                                    {/* CODE SUPERVISEUR DNP */}
                                    <div className="field col-5">
                                        <label htmlFor="codeSup2">
                                        <b>* Code superviseur DNP</b>
                                        </label>
                                        <InputText
                                        id="codeSup2"
                                        name="codeSup2"
                                        readOnly
                                        value={formik.values.codeSup2}
                                        onChange={formik.handleChange}
                                        placeholder="Saisir ou générer un code"
                                        className={`p-inputtext-sm w-full ${
                                            formik.touched.codeSup2 && formik.errors.codeSup2
                                            ? "p-invalid"
                                            : ""
                                        }`}
                                        style={{
                                            fontWeight: "bold",
                                            color: "black",
                                        }}
                                        />
                                        {formik.touched.codeSup2 &&
                                        typeof formik.errors.codeSup2 === "string" && (
                                            <small className="p-error">{formik.errors.codeSup2}</small>
                                        )}
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
                                <div className="formgrid grid">
                                    <div className="field col-12">
                                        <span>EPI : Etablissement Encadrant des Candidats Individuels</span>
                                        <br />
                                        <span>I : Candidats Individuels</span>
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
