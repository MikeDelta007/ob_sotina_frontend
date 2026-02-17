'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { SplitButton } from 'primereact/splitbutton';
import { TabView, TabPanel } from 'primereact/tabview';
import { Menu } from 'primereact/menu';
import { GroupedSeriesDTO, ParametrageService } from '@/demo/service/ParametrageService';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import ProtectedRoute from '@/layout/ProtectedRoute';

const PanelDemo = () => {

    const [groupedMatieres, setGroupedMatieres] = useState([]);
    
    useEffect(() => {
    ParametrageService.getMatieresByType()
        .then((response) => {
            const data = response?.data;
            
            const result = Object.entries(response || {}).map(([filiereName, series]) => ({
                filiereName,
                series,
            }));
            
            console.log("📦 Séries chargées :", result);

            setGroupedMatieres(result);
        })
        .catch((error) => {
            console.error("❌ Erreur lors du chargement des séries :", error);
        });
    }, []);



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

    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="grid">
                <div className="col-12 md:col-12">
                    <div className="card">
                        <h5>Listing des Matières</h5>
                        <Accordion multiple activeIndex={0}>
                            {groupedMatieres && groupedMatieres.length > 0 ? (
                                groupedMatieres.map((group) => (
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
