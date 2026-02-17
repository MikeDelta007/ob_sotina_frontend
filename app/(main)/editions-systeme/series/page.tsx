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
import { useFormik } from 'formik';
import { InputText } from 'primereact/inputtext';
import * as Yup from 'yup';

const PanelDemo = () => {
    var is_update = useRef(false); // <== valeur persistante entre les appels
    var id_serie = useRef(null);     // <== même chose pour l'ID du candidat
    
    const toast = useRef(null);
    const dt = useRef(null);

    const [groupedSeries, setGroupedSeries] = useState([]);
    const [departements, setDepartements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [productDialog, setProductDialog] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    
    useEffect(() => {
    
    }, []);

            useEffect(() => {
                loadData();
            }, []);
    
            const loadData = async () => {
                        setLoading(true);
                        setError(null);
                        try 
                        {
                             ParametrageService.getSeriesByFiliere()
                                .then((response) => {
                                    const data = response?.data;
                                    
                                    const result = Object.entries(response || {}).map(([filiereName, series]) => ({
                                        filiereName,
                                        series,
                                    }));
                                    
                                    console.log("📦 Séries chargées :", result);


                                    setGroupedSeries(result);
                                })
                                .catch((error) => {
                                    console.error("❌ Erreur lors du chargement des données :", error);
                            });
                        } 
                        catch (err) 
                        {
                            console.error("❌ Erreur chargement données :", err);
                            setError("Erreur lors du chargement");
                        } 
                        finally 
                        {
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

    const toolbarLeftTemplate = () => {
        return (
            <>
                <Button label="New" icon="pi pi-plus" style={{ marginRight: '.5em' }} />
                <Button label="Open" icon="pi pi-folder-open" severity="secondary" />

                <i className="pi pi-bars p-toolbar-separator" style={{ marginRight: '.5em' }}></i>

                <Button icon="pi pi-check" severity="success" style={{ marginRight: '.5em' }} />
                <Button icon="pi pi-trash" severity="warning" style={{ marginRight: '.5em' }} />
                <Button icon="pi pi-print" severity="danger" />
            </>
        );
    };
    const toolbarRightTemplate = <SplitButton label="Options" icon="pi pi-check" model={toolbarItems} menuStyle={{ width: '12rem' }}></SplitButton>;
    const cardHeader = (
        <div className="flex align-items-center justify-content-between mb-0 p-3 pb-0">
            <h5 className="m-0">Card</h5>
            <Button icon="pi pi-plus" text onClick={(event) => menu1.current?.toggle(event)} />
            <Menu
                ref={menu1}
                popup
                model={[
                    { label: 'Add New', icon: 'pi pi-fw pi-plus' },
                    { label: 'Remove', icon: 'pi pi-fw pi-minus' },
                    { label: 'Update', icon: 'pi pi-fw pi-sync' }
                ]}
            />
        </div>
    );

    const header = (
                    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                        <h5 className="m-0">Listing des centres d`&apos;etat civil du département</h5>
                            <span className="block mt-2 md:mt-0 p-input-icon-left">
                                <i className="pi pi-search" />
                                <InputText type="search" onChange={(e) => setGlobalFilter((e.target as HTMLInputElement).value)} placeholder = "Recherche..." />
                            </span>
                    </div>
            );
    
            const formik = useFormik({
                initialValues: {
                    name : '',
                    code : '',
                    departement : null
                },
                validationSchema: Yup.object({
                    name : Yup.string().required('Champ requis'),
                    code : Yup.string().required('Champ requis'),
                    departement : Yup.object().required('Champ requis'),
                }),
                
                onSubmit: async (values, { setSubmitting, resetForm }) => {
    
                    const centreEtatCivilDTO : CentreEtatCivilDTO = {
                        name : values.name,
                        code : values.code,
                        departement : values.departement,
                    };
                    try 
                    {
                        if (is_update.current === false)
                        {
                            console.log("POST");
                            const response = await ParametrageService.createCentreEtatCivil(centreEtatCivilDTO);
                            console.log('Data créé:', response.data);
                            toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Département créé avec succès', life: 4000 });
                            resetForm();
                        } 
                        if (is_update.current === true)
                        {
                            console.log("PUT");
                            const response = await ParametrageService.updateCentreEtatCivil(id_serie, centreEtatCivilDTO);
                            console.log('Data créé:', response.data);
                            toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Département mis à jour avec succès', life: 4000 });
                            resetForm();
                        }
                        await loadData();
                    } 
                    catch (error) 
                    {
                        console.error('❌ Erreur création sujet:', error);
                        toast.current.show({ severity: 'error', summary: 'Office du Bac', detail: 'Erreur lors de la création', life: 4000 });
                    
                    } 
                    finally 
                    {
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
                        <h5>Listing des Séries</h5>
                        <Accordion multiple activeIndex={0}>
                            {groupedSeries && groupedSeries.length > 0 ? (
                                groupedSeries.map((group) => (
                                <AccordionTab key={group.filiereName} header={group.filiereName}>
                                    <DataTable
                                        value={group.series}
                                        paginator
                                        rows={5}
                                        responsiveLayout="scroll"
                                        className="p-datatable-sm"
                                        currentPageReportTemplate="Affichage de {first} à {last} des {totalRecords} enregistrement (s)"
                                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                        >
                                        <Column field="code" header="Code" sortable />
                                        <Column field="name" header="Nom" sortable />
                                    </DataTable>
                                </AccordionTab>
                                ))
                            ) : (
                                <AccordionTab header="Chargement">
                                <p className="text-gray-500 italic">Aucune série disponible ou chargement en cours...</p>
                                </AccordionTab>
                            )}
                            </Accordion>




                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default PanelDemo;
