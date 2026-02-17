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
import { AutorisationReception, CandidatDecisionDTO, CandidatDTO, CandidatureService, VignetteAddDTO } from '@/demo/service/CandidatureService';
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
import { Card } from 'primereact/card';
import './style.css';
import ProtectedRoute from '@/layout/ProtectedRoute';

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
    const [recuDialog2, setRecuDialog2] = useState(false);
    const [file, setFile] = useState(null);
    const [fileId, setFileId] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);
    const [etabs, setEtabs] = useState(null);
    const [operator, setOperator] = useState(null);
    const [motif, setMotif] = useState(null);
    const [dateOps, setDaateOps] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [correctionDialog, setCorrectionDialog] = useState(false);

    const [matieres, setMatiereOptions] = useState([]);

    const [faeb, setFaebs] = useState(null);
    const [compteEF, setCompteEFs] = useState(null);
    const [reloadTrigger, setReloadTrigger] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    const [annees, setAnnees] = useState(null);
    const [edition, setEdition] = useState(null);
    const [etablissement, setEtablissement] = useState(null);
    const [evs, setEVData] = useState([]);
    const [rejets, setRejets] = useState(null);
    const [selectedValues, setSelectedValues] = useState<string[]>([]);

    const [radioValue, setRadioValue] = useState(null);

    const [prog, setOneProg] = useState<{ edition?: number } | null>(null);

    const [decisionStats, setDecisionStats] = useState({ decision0: 0, decision1: 0, decision2: 0, total: 0 });

    const [filterText, setFilterText] = useState('');

    const [mandataire, setMandataire] = useState(faeb?.representative || '');

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

    // 🔹 Fonction mémorisée pour loadDatas
    const loadDatas = useCallback(async () => {
        setLoading(true);
        setError(null);

        console.log(etablissement, edition);
        try {
            if (!etablissement || !edition) {
                console.warn('Filtres manquants pour charger les données');
                setLoading(false);
                return;
            }

            const response = await CandidatureService.compteFAEBS(etablissement?.id, edition?.edition);
            console.log('OK', edition?.edition);
            setFaebs(response);
        } catch (err) {
            console.error('❌ Erreur chargement données :', err);
            setError('Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    }, [etablissement, edition]);

    const loadDatas2 = useCallback(async () => {
        setLoading(true);
        setError(null);

        console.log(etablissement, edition);
        try {
            if (!etablissement || !edition) {
                console.warn('Filtres manquants pour charger les données');
                setLoading(false);
                return;
            }

            const response = await CandidatureService.compteEF(edition?.edition, etablissement?.id);
            console.log('OK', response);
            setCompteEFs(response);
        } catch (err) {
            console.error('❌ Erreur chargement données :', err);
            setError('Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    }, [etablissement, edition]);

    useEffect(() => {
        loadDatas();
        loadDatas2();
    }, [reloadTrigger, loadDatas, loadDatas2]);

    const loadDatas3 = useCallback(async () => {
        setLoading(true);
        setError(null);

        if (!etablissement || !edition) {
            console.warn('Filtres manquants pour charger les données');
            setLoading(false);
            return;
        }

        try {
            const response = await CandidatureService.filterEtatsVersements_(etablissement?.id, edition?.edition);
            console.log('OK', edition?.edition);
            setEVData(response);
        } catch (err) {
            console.error('❌ Erreur chargement données :', err);
            setError('Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    }, [etablissement, edition]);

    useEffect(() => {
        loadDatas3();
    }, [reloadTrigger, loadDatas]);

    const formik2 = useFormik({
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

    const corrigerCoupon = async (values, { setSubmitting, resetForm }) => {
            console.log(motif);
            try 
            {
                const response = await CandidatureService.correctionVignettes(id_ev, motif, user?.firstname, user?.lastname);
                toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Correction effectuée avec succés', life: 4000 });
                resetForm();
                setCorrectionDialog(false);
            } 
            catch (error) 
            {
                toast.current.show({ severity: 'error', summary: 'Office du Bac', detail: 'Erreur lors de la correction', life: 4000 });
            } 
            finally 
            {
                setSubmitting(false);
            }
    };

    const hideDeleteProductDialog__ = () => {
        setCorrectionDialog(false);
    };

    const deleteProductDialogFooter__ = (
            <>
                <Button label="Oui" icon="pi pi-check" text onClick={() => corrigerCoupon(formik.values, { setSubmitting: formik.setSubmitting, resetForm: formik.resetForm })} />
                <Button label="Non" icon="pi pi-times" text onClick={hideDeleteProductDialog__} />
            </>
    );

    const editProduct = async (rowData) => {
        id_ev.current = rowData.id;
        setRecuDialog(true);
        setOperator(rowData.operator)
        setDaateOps(rowData.date_ops)
        if (rowData?.file_id) {
            setFileId(rowData.file_id);
            const response = await FileService.getViewUrl(rowData.file_id);
            if (response) {
                console.log('URL PDF:', response); // <---- ici
                const dataFormatted = {
                    v1000: rowData.count_1000_EF,
                    v5000: rowData.count_5000
                };
                formik2.setValues(dataFormatted);
                setFileUrl(response);
                setRecuDialog(true);
            }
        }
    };

    const editProduct2 = async () => {
        setMotif("");
        setCorrectionDialog(true);
    };

    const hideDialog = () => {
        if (recuDialog) {
            setRecuDialog(false);
        }
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="formgrid grid">
                    <div className="field col-12">
                        <fieldset className="custom-fieldset text-sm" style={{ padding: '5px' }}>
                            <legend className="text-primary font-bold text-sm">Effectuer les filtres (Tous les champs doivent être sélectionnés)</legend>

                            <div
                                className="filter-container"
                                style={{
                                    display: 'flex',
                                    gap: '10px', // espace entre les deux champs
                                    alignItems: 'flex-start',
                                    flexWrap: 'wrap',
                                    width: '100%'
                                }}
                            >
                                <div style={{ width: '600px' }}>
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
                                </div>

                                <div style={{ width: '200px' }}>
                                    <label htmlFor="serieCode">
                                        <h6 className="m-0">Edition du bac</h6>
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

    const formik = useFormik({
        initialValues: {
            representative: ''
        },

        validationSchema: Yup.object({
            representative: Yup.string().required('Saisir le nom complet du mandataire')
        }),

        onSubmit: async (values, { setSubmitting, resetForm }) => {
            const autorisationReception: AutorisationReception = {
                representative: values.representative,
                enabled: true
            };

            console.log(autorisationReception);

            try {
                console.log('PATCH');
                console.log(faeb?.id);
                const response = await CandidatureService.updateAutorisationReception(faeb?.id, autorisationReception);
                console.log('✅ Données mises à jour :', response.data);
                setMessage('Données mises à jour avec succès');
                toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Dossiers de candidatures autorisés à la réception avec succès', life: 4000 });
                //resetForm();
                await loadDatas();
            } catch (error) {
                console.error('❌ Erreur :', error);
                setMessage('Erreur');
                toast.current.show({ severity: 'error', summary: 'Office du Bac', detail: "Erreur lors de l'autorisation", life: 4000 });
            } finally {
                setSubmitting(false);
            }
            setSubmitted(false);
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

    const formatDate = (dateString: string) => {
        if (!dateString) return '-'; // sécurité si null ou vide
        const date = new Date(dateString.replace(' ', 'T')); // corrige les formats "yyyy-mm-dd hh:mm:ss"

        if (isNaN(date.getTime())) return 'Date invalide';

        return (
            date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }) +
            ' ' +
            date.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            })
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <div className="flex flex-wrap gap-3">
                <h6>Historique des dépôts sur la plateforme</h6>
            </div>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter((e.target as HTMLInputElement).value)} placeholder="Recherche..." />
            </span>
        </div>
    );

    const action0BodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-eye" label="Consulter" rounded severity={'warning'} className="mr-2" onClick={() => editProduct(rowData)} />
            </>
        );
    };

    return (
        <ProtectedRoute allowedRoles={['SCOLARITE', 'ADMIN', 'AUTORISATION_RECEPTION']}>
            <div className="grid crud-demo">
                <Toast ref={toast} />
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-5">
                        <div className="card m-2">
                            <Toast ref={toast} />
                            <form onSubmit={formik.handleSubmit}>
                                {faeb?.session && faeb?.etablissement ? (
                                    <>
                                        <div className="p-2 flex justify-between">
                                            <h6 className="m-0">Session : {faeb?.session}</h6>
                                        </div>
                                        <div className="p-2 flex justify-between">
                                            <h6 className="m-0">Nombre total de candidat (s) inscrit (s) sur la plateforme : {compteEF?.candidats}</h6>
                                        </div>
                                        <div className="p-2 flex justify-between">
                                            <h6 className="m-0">Nombre total d&apos;épreuves facultatives saisies : {compteEF?.facListA + compteEF?.facListB}</h6>
                                        </div>

                                        <div className="p-2 flex justify-between">
                                            <h6 className="m-0">
                                                FAEB 1 (5000 FCFA versé au DGCPT) : {faeb?.count_5000} →{' '}
                                                {faeb?.count_5000 >= compteEF?.candidats ? <span className="text-green-600 font-bold">NORMAL</span> : <span className="text-red-600 font-bold">ANORMAL</span>}
                                            </h6>
                                        </div>

                                        <div className="p-2 flex justify-between">
                                            <h6 className="m-0">
                                                FAEB 2 (1000 FCFA versé au DGCPT) : {faeb?.count_1000_EF} →{' '}
                                                {faeb?.count_1000_EF >= compteEF?.facListA + compteEF?.facListB ? <span className="text-green-600 font-bold">NORMAL</span> : <span className="text-red-600 font-bold">ANORMAL</span>}
                                            </h6>
                                        </div>

                                        <div className="p-2 flex justify-between">
                                            <h6 className="m-0">FAEB 3 (1000 FCFA versé à l&apos;office du BAC) : {faeb?.count_1000_OB}</h6>
                                        </div>

                                        {!faeb?.enabled ? (
                                            <>
                                                {faeb?.count_5000 >= compteEF?.candidats && faeb?.count_1000_EF >= compteEF?.facListA + compteEF?.facListB ? (
                                                    <>
                                                        <div className="p-2">
                                                            <label htmlFor="representative" className="block font-medium mb-1">
                                                                <b>Nom complet du Mandataire (Numéro de téléphone) :</b>
                                                            </label>
                                                            <InputText
                                                                id="representative"
                                                                name="representative"
                                                                value={formik.values.representative}
                                                                onChange={(e) => formik.setFieldValue('representative', e.target.value)}
                                                                placeholder="Saisir le nom complet du mandataire"
                                                                className="w-full"
                                                            />
                                                            {formik.touched.representative && typeof formik.errors.representative === 'string' && <small className="p-error block mt-1">{formik.errors.representative}</small>}
                                                        </div>

                                                        <Button label="Autoriser l'opération de réception" icon="pi pi-check" severity={'success'} className="mr-1 mt-0" type="submit" />
                                                    </>
                                                ) : (
                                                    <div className="p-2 text-red-600 font-semibold">❌ Veuillez effectuer la régularisation de votre établissement.</div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="p-2 text-green-600 font-semibold">✅ L&apos;établissement a été autorisé à la réception avec succés.</div>
                                        )}
                                    </>
                                ) : (
                                    <div className="p-2 text-black-600 font-semibold">⚠ Veuillez sélectionner un établissement et une session pour autoriser la reception.</div>
                                )}
                            </form>
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-7">
                        <div className="card m-2">
                            <DataTable
                                ref={dt}
                                value={evs}
                                paginator
                                rows={4}
                                size="small"
                                className="datatable-responsive"
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                currentPageReportTemplate="Affichage de {first} à {last} des {totalRecords} enregistrement (s)"
                                globalFilter={globalFilter}
                                emptyMessage="Aucun donnée n'a été trouvée"
                                responsiveLayout="scroll"
                                header={header}
                            >
                                <Column field="session" header="Session" body={SBodyTemplate} headerStyle={{ minWidth: '5rem' }} />
                                <Column field="etab" header="Etablissement" body={EtabBodyTemplate} headerStyle={{ minWidth: '5rem' }} />
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
                                <Column body={action0BodyTemplate} headerStyle={{ minWidth: '10rem' }} />
                                {/* <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} /> */}
                            </DataTable>
                        </div>
                    </div>
                    <Dialog visible={recuDialog} style={{ width: '1000px' }} header="Etat de versement" modal className="p-fluid" onHide={hideDialog}>
                        <div className="formgrid grid">
                            <form onSubmit={formik2.handleSubmit}>
                                <div className="field col-12">
                                    <fieldset className="p-2 border-round-md surface-border text-sm">
                                    <legend className="text-primary font-bold text-sm">
                                        Attribution des vignettes numériques selon la somme déposée au Trésor
                                    </legend>

                                    <div className="formgrid grid">
                                        <div className="field col-3">
                                        <span>
                                            Attributeur des vignettes :<br /> <b>{operator}</b>
                                        </span>
                                        <br />
                                        <span>
                                            Date & heure d&apos;attribution :<br /> <b>{formatDate(dateOps)}</b>
                                        </span>
                                        </div>

                                        <div className="field col-3">
                                        <label htmlFor="v5000">Vignettes de 5000 FCFA</label>
                                        <InputNumber
                                            id="v5000"
                                            name="v5000"
                                            value={formik2.values.v5000}
                                            onValueChange={(e) => formik2.setFieldValue('v5000', e.value)}
                                            className="p-inputtext-sm"
                                            placeholder="Droits d'inscription à 5000 FCFA"
                                        />
                                        {formik2.touched.v5000 && formik2.errors.v5000 && (
                                            <small className="p-error">{formik2.errors.v5000}</small>
                                        )}
                                        </div>

                                        <div className="field col-3">
                                        <label htmlFor="v1000">Vignettes de 1000 FCFA</label>
                                        <InputNumber
                                            id="v1000"
                                            name="v1000"
                                            value={formik2.values.v1000}
                                            onValueChange={(e) => formik2.setFieldValue('v1000', e.value)}
                                            className="p-inputtext-sm"
                                            placeholder="Épreuves Facultatives à 1000 FCFA"
                                        />
                                        {formik2.touched.v1000 && formik2.errors.v1000 && (
                                            <small className="p-error">{formik2.errors.v1000}</small>
                                        )}
                                        </div>

                                        <div className="field col-3">
                                        <Button
                                            icon="pi pi-delete-left"
                                            label="Corriger l'attribution"
                                            rounded
                                            severity="danger"
                                            className="mr-1 mt-1"
                                            type="button" // ✅ PAS submit
                                            onClick={() => editProduct2()}
                                        />

                                        <Button
                                            icon="pi pi-check-square"
                                            label="Valider la nouvelle attribution"
                                            rounded
                                            severity="success"
                                            className="mr-1 mt-1"
                                            type="submit" // ✅ Formik gère cette soumission
                                        />
                                        </div>
                                    </div>
                                    </fieldset>
                                </div>
                                </form>

                        </div>

                        {fileUrl ? <PdfViewer fileUrl={fileUrl} /> : <p>Chargement du PDF...</p>}
                    </Dialog>
                    <Dialog visible={correctionDialog} style={{ width: '550px' }} header="Documentation de la correction d'une attribution de vignettes" modal footer={deleteProductDialogFooter__} onHide={hideDeleteProductDialog__}>
                                                <form onSubmit={formik.handleSubmit}>
                                                    <div className="flex align-items-center justify-content-center">
                                                        <i className="pi pi-exclamation-circle mr-3" style={{ fontSize: '2rem', color:'blue' }} />
                                                        <span>
                                                            Veuillez fournir le motif de la correction svp en peu de mots
                                                        </span>
                                                        <InputText
                                                                                                        placeholder="Fournir le motif de la correction"
                                                                                                        autoComplete='off'
                                                                                                        id="motif"
                                                                                                        name="motif"
                                                                                                        onChange={(e) => setMotif(e.target.value)}
                                                                                                        onBlur={formik.handleBlur}
                                                                                                        className={`p-inputtext-sm w-full`}
                                                                                                    />
                                                                                                    
                                                    </div>
                                                </form>
                    </Dialog>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default ValidationCandidat;
