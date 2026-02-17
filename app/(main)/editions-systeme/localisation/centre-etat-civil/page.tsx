'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { SplitButton } from 'primereact/splitbutton';
import { TabView, TabPanel } from 'primereact/tabview';
import { Menu } from 'primereact/menu';
import { CentreEtatCivilDTO, GroupedSeriesDTO, ParametrageService } from '@/demo/service/ParametrageService';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import ProtectedRoute from '@/layout/ProtectedRoute';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FiEdit } from 'react-icons/fi';

const PanelDemo = () => {
    var is_update = useRef(false); // <== valeur persistante entre les appels
    var id_cec = useRef(null); // <== même chose pour l'ID du candidat

    const toast = useRef(null);
    const dt = useRef(null);

    const [groupedCECs, setGroupedCECs] = useState([]);
    const [departements, setDepartements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [productDialog, setProductDialog] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);

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
            ParametrageService.getCECByDep()
                .then((response) => {
                    const data = response?.data;

                    const result = Object.entries(response || {}).map(([filiereName, series]) => ({
                        filiereName,
                        series
                    }));

                    console.log('📦 Séries chargées :', result);
                    setGroupedCECs(result);
                })
                .catch((error) => {
                    console.error('❌ Erreur lors du chargement des données :', error);
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

    const menu1 = useRef<Menu>(null);
    const toolbarItems = [
        {
            label: 'Save',
            icon: 'pi pi-check'
        },
        {
            label: 'Update',
            icon: 'pi pi-sync'
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash'
        },
        {
            label: 'Home Page',
            icon: 'pi pi-home'
        }
    ];

    const openNew = () => {
        // setProduct(emptyProduct);
        setProductDialog(true);
    };

    const editProduct = (cec) => {
        setProductDialog(true);

        const cecFormatted = {
            ...cec
        };
        (id_cec.current = cec.id), console.log(id_cec);
        formik.setValues(cecFormatted);
        is_update.current = true;
        console.log(is_update);
        console.log(cecFormatted);
    };

    const hideDialog = () => {
        setProductDialog(false);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button severity="success" label="Ajouter un centre d'etat civil" icon="pi pi-plus" className="mr-2" onClick={openNew} />
                    {/* <Button severity="danger" label="Delete" icon="pi pi-trash" onClick={confirmDeleteSelected} disabled={!selectedProducts || !selectedProducts.length} /> */}
                </div>
            </React.Fragment>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button
                                                    icon="pi pi-pencil"
                                                    rounded
                                                    tooltip="Modifier l'intitulé du centre d'etat civil"
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
            <h5 className="m-0">Listing des centres d`&apos;etat civil du département</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onChange={(e) => setGlobalFilter((e.target as HTMLInputElement).value)} placeholder="Recherche..." />
            </span>
        </div>
    );

    const formik = useFormik({
        initialValues: {
            name: '',
            code: '',
            departement: null
        },
        validationSchema: Yup.object({
            name: Yup.string().required('Champ requis'),
            code: Yup.string().required('Champ requis'),
            departement: Yup.object().required('Champ requis')
        }),

        onSubmit: async (values, { setSubmitting, resetForm }) => {
            const centreEtatCivilDTO: CentreEtatCivilDTO = {
                name: values.name,
                code: values.code,
                departement: values.departement
            };
            try {
                if (is_update.current === false) {
                    console.log('POST');
                    const response = await ParametrageService.createCentreEtatCivil(centreEtatCivilDTO);
                    console.log('Data créé:', response.data);
                    toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Département créé avec succès', life: 4000 });
                    resetForm();
                }
                if (is_update.current === true) {
                    console.log('PUT');
                    const response = await ParametrageService.updateCentreEtatCivil(id_cec, centreEtatCivilDTO);
                    console.log('Data créé:', response.data);
                    toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Département mis à jour avec succès', life: 4000 });
                    resetForm();
                }
                await loadData();
            } catch (error) {
                console.error('❌ Erreur création sujet:', error);
                toast.current.show({ severity: 'error', summary: 'Office du Bac', detail: 'Erreur lors de la création', life: 4000 });
            } finally {
                setSubmitting(false);
            }
            setProductDialog(false);
        }
    });

    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="grid">
                <div className="col-12 md:col-12">
                    <div className="card">
                        <Toast ref={toast} />
                        <Toolbar className="mb-4" left={leftToolbarTemplate}></Toolbar>
                        <Accordion multiple activeIndex={0}>
                            {groupedCECs && groupedCECs.length > 0 ? (
                                groupedCECs.map((group) => (
                                    <AccordionTab key={group.filiereName} header={group.filiereName}>
                                        <DataTable
                                            value={group.series}
                                            paginator
                                            rows={5}
                                            rowsPerPageOptions={[5, 10, 25]}
                                            className="p-datatable-sm"
                                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                            currentPageReportTemplate="Affichage de {first} à {last} des {totalRecords} enregistrement (s)"
                                            globalFilter={globalFilter}
                                            header={header}
                                        >
                                            <Column field="code" header="Code" sortable />
                                            <Column field="name" header="Nom" sortable />
                                            <Column body={actionBodyTemplate} headerStyle={{ minWidth: '15rem' }} />
                                        </DataTable>
                                    </AccordionTab>
                                ))
                            ) : (
                                <AccordionTab header="Chargement">
                                    <p className="text-gray-500 italic">Aucune série disponible ou chargement en cours...</p>
                                </AccordionTab>
                            )}
                        </Accordion>

                        <Dialog visible={productDialog} style={{ width: '700px' }} header="Gestion d'un département" modal className="p-fluid" onHide={hideDialog}>
                            <form onSubmit={formik.handleSubmit}>
                                <div className="formgrid grid">
                                    <div className="field col-5">
                                        <label htmlFor="spec_id">* Intitulé du centre d`&apos;etat civil</label>
                                        <InputText
                                            id="name"
                                            name="name"
                                            value={formik.values.name}
                                            onChange={formik.handleChange}
                                            placeholder="Saisir l'intitulé du centre d'etat civil"
                                            className={`p-inputtext-sm w-full ${formik.touched.name && formik.errors.name ? 'p-invalid' : ''}`}
                                        />
                                        {formik.touched.name && typeof formik.errors.name === 'string' && <small className="p-error">{formik.errors.name}</small>}
                                    </div>
                                    <div className="field col-2">
                                        <label htmlFor="lastname">* Code</label>
                                        <InputText
                                            id="code"
                                            name="code"
                                            value={formik.values.code}
                                            onChange={formik.handleChange}
                                            placeholder="Fournir le code"
                                            className={`p-inputtext-sm w-full ${formik.touched.code && formik.errors.code ? 'p-invalid' : ''}`}
                                        />
                                        {formik.touched.code && typeof formik.errors.code === 'string' && <small className="p-error">{formik.errors.code}</small>}
                                    </div>
                                    <div className="field col-5">
                                        <label htmlFor="lastname">* Département</label>
                                        <Dropdown
                                            id="departement"
                                            name="departement"
                                            value={formik.values.departement}
                                            onChange={(e) => formik.setFieldValue('departement', e.value)}
                                            optionLabel="name"
                                            //optionValue="value"
                                            placeholder="Selectionner le département"
                                            options={departements}
                                            filter
                                            className="p-inputtext-sm w-full"
                                        />
                                        {formik.touched.departement && typeof formik.errors.departement === 'string' && <small className="p-error">{formik.errors.departement}</small>}
                                    </div>
                                </div>

                                <div className="formgrid grid">
                                    <div className="field col-5">
                                        <div>
                                            <Button severity="success" label="Ajouter un centre d'état civil" className="mr-2" type="submit" />
                                            {/* <Button severity="danger" label="Delete" icon="pi pi-trash" onClick={confirmDeleteSelected} disabled={!selectedProducts || !selectedProducts.length} /> */}
                                        </div>
                                    </div>
                                </div>
                            </form>
                            ,
                        </Dialog>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default PanelDemo;
