'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { classNames } from 'primereact/utils';
import { ParametrageService } from '@/demo/service/ParametrageService';
import { MultiSelect } from 'primereact/multiselect';

interface RegleMatiere {
    id?: string;
    code: string;
    type: string;
    champ?: string;
    valeur?: string;
    series?: string[];
    groupe?: string;
    date1?: string;
    heure1?: string;
    date2?: string;
    heure2?: string;
}

const PlanningRegleMatiere = () => {
    const toast = useRef<any>(null);

    const emptyRegle: RegleMatiere = {
        code: '',
        type: 'SERIE',
        champ: '',
        valeur: '',
        series: [],
        groupe: '',
        date1: '',
        heure1: '',
        date2: '',
        heure2: ''
    };

    const [regles, setRegles] = useState<RegleMatiere[]>([]);
    const [regle, setRegle] = useState<RegleMatiere>(emptyRegle);
    const [series, setSeries] = useState([]);
    const [matieres, setMatieres] = useState([]);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);

    const typeOptions = [
        { label: 'OBLIGATOIRE', value: 'SERIE' },
        { label: 'OPTIONNELLE', value: 'OPTION' },
        { label: 'FACULTATIVE', value: 'FACULTATIVE' }
    ];

    const groupes = [
        { label: 'PREMIER GROUPE', value: '1ERGRP' },
        { label: 'SECOND GROUPE', value: '2NDGRP' },
        { label: 'PREMIER GROUPE & SECOND GROUPE', value: '1ER2NDGRP' }
    ];

    const champs = [
        { label: 'Matière Optionnelle 1', value: 'matiere1' },
        { label: 'Matière Optionnelle 2', value: 'matiere2' },
        { label: 'Matière Optionnelle 3', value: 'matiere3' },
        { label: 'Epreuve Facultative Liste A', value: 'eprFacListA' },
        { label: 'Epreuve Facultative Liste B', value: 'eprFacListB' }
    ];

    // 🔹 LOAD
    const loadData = async () => {
        try {
            setLoading(true);
            const data = await ParametrageService.getAllRegles();
            setRegles(data || []);
        } catch (e) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Chargement Régles impossible'
            });
        } finally {
            setLoading(false);
        }
    };

    const loadSeries = async () => {
        try {
            setLoading(true);
            const data = await ParametrageService.getSeries();
            setSeries(data || []);
        } catch (e) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Chargement Série impossible'
            });
        } finally {
            setLoading(false);
        }
    };

    const loadMatieres = async () => {
        try {
            setLoading(true);
            const data = await ParametrageService.getMatieres();
            setMatieres(data || []);
        } catch (e) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Chargement Série impossible'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        loadSeries();
        loadMatieres()
    }, []);


    // 🔹 NEW
    const openNew = () => {
        setRegle(emptyRegle);
        setSubmitted(false);
        setDialogVisible(true);
    };

    // 🔹 EDIT
    const editRegle = (row: RegleMatiere) => {
        console.log(row);
        setRegle({ ...row });
        setDialogVisible(true);
    };

    // 🔹 DELETE
    const deleteRegle = async (row: RegleMatiere) => {
        try {
            await ParametrageService.deleteRegle(row.id);
            toast.current.show({
                severity: 'success',
                summary: 'Succès',
                detail: 'Supprimé'
            });
            loadData();
        } catch {
            toast.current.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Suppression échouée'
            });
        }
    };

    // 🔹 SAVE (create/update)
    const saveRegle = async () => {
        setSubmitted(true);

        console.log(regle);

        if (!regle.code) return;

        try {
            if (regle.id) {
                await ParametrageService.updateRegle(regle.id, regle);
                toast.current.show({
                    severity: 'success',
                    summary: 'Mis à jour'
                });
            } else {
                await ParametrageService.createRegle(regle);
                toast.current.show({
                    severity: 'success',
                    summary: 'Créé'
                });
            }

            setDialogVisible(false);
            loadData();
        } catch (e) {
            toast.current.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Enregistrement échoué'
            });
        }
    };

    // 🔹 ACTIONS COLUMN
    const actionBody = (row: RegleMatiere) => (
        <div className="flex gap-2">
            <Button icon="pi pi-pencil" rounded onClick={() => editRegle(row)} />
            <Button icon="pi pi-trash" severity="danger" rounded onClick={() => deleteRegle(row)} />
        </div>
    );

    const dialogFooter = (
        <>
            <Button label="Annuler" icon="pi pi-times" outlined onClick={() => setDialogVisible(false)} />
            <Button label="Enregistrer" icon="pi pi-check" onClick={saveRegle} />
        </>
    );

    if (loading) return <ProgressSpinner />;

    return (
        <div className="card">
            <Toast ref={toast} />

            <div className="flex justify-content-between mb-3">
                <h3>Gestion des règles matières & Programmation du calendrier au BAC</h3>
                <Button label="Nouvelle règle" icon="pi pi-plus" onClick={openNew} />
            </div>

            <DataTable value={regles} paginator rows={10} responsiveLayout="scroll">
                <Column field="code" header="Code" />
                <Column field="type" header="Type" />
                <Column field="date1" header="Date 1" />
                <Column field="heure1" header="Heure 1" />
                <Column field="date2" header="Date 2" />
                <Column field="heure2" header="Heure 2" />
                <Column body={actionBody} header="Actions" />
            </DataTable>

            <Dialog
                header="Règle matière"
                visible={dialogVisible}
                style={{ width: '520px' }}
                footer={dialogFooter}
                onHide={() => setDialogVisible(false)}
            >
                <div className="p-fluid">

                    {/* Code */}
                    

                    {/* Type */}
                    <div className="field grid">
                        <label className="col-4 mb-0">Type Matière</label>
                        <div className="col-5">
                            <Dropdown
                                value={regle.type}
                                options={typeOptions}
                                onChange={(e) =>
                                    setRegle(prev => ({ ...prev, type: e.value }))
                                }
                                placeholder="Sélectionner"
                            />
                        </div>
                    </div>

                    {/* Séries */}
                    {regle.type !== 'FACULTATIVE' && (
                        <div className="field grid">
                            <label className="col-4 mb-0">Séries concernées</label>
                            <div className="col-12">
                                <MultiSelect
                                    value={regle.series}
                                    options={series}
                                    optionLabel="code"
                                    optionValue="code"
                                    onChange={(e) =>
                                        setRegle(prev => ({ ...prev, series: e.value || [] }))
                                    }
                                    placeholder="Choisir série(s)"
                                    filter
                                    display="chip"
                                    className="w-full"

                                    filterPlaceholder="Rechercher une série..."         // placeholder pour la recherche
                                />
                            </div>
                        </div>
                    )}

                    {/* OPTION */}
                    
                            <div className="field grid">
                                <label className="col-4 mb-0">Champ concerné</label>
                                <div className="col-8">
                                    <Dropdown
                                        showClear
                                        value={regle.champ}
                                        options={champs}
                                        onChange={(e) =>
                                            setRegle(prev => ({ ...prev, champ: e.value }))
                                        }
                                        placeholder="Sélectionner"
                                    />
                                </div>
                            </div>

                            <div className="field grid">
                                <label className="col-4 mb-0">Matière concernée</label>
                                <div className="col-8">
                                    <Dropdown
                                        showClear
                                        filter
                                        value={regle.valeur}
                                        options={matieres}
                                        optionLabel="name"
                                        optionValue="name"
                                        onChange={(e) =>
                                            setRegle(prev => ({ ...prev, valeur: e.target.value }))
                                        }
                                        placeholder="Sélectionner"
                                    />
                                   
                                </div>
                            </div>

                            <div className="field grid">
                                <label className="col-4 mb-0">Code Répartition</label>
                                <div className="col-5">
                                    <InputText
                                        value={regle.code}
                                        onChange={(e) =>
                                            setRegle(prev => ({ ...prev, code: e.target.value }))
                                        }
                                        className={classNames({ 'p-invalid': submitted && !regle.code })}
                                    />
                                </div>
                            </div>

                    <div className="field grid">
                        <label className="col-4 mb-0">Groupe concerné</label>
                        <div className="col-8">
                            <Dropdown
                                value={regle.groupe}
                                options={groupes}
                                onChange={(e) =>
                                    setRegle(prev => ({ ...prev, groupe: e.value }))
                                }
                                placeholder="Sélectionner"
                            />
                        </div>
                    </div>

                    
                    {/* Bloc 1 visible pour les deux groupes */}
                    {(regle.groupe === '1ERGRP' || regle.groupe === '1ER2NDGRP') && (
                        <div className="formgrid grid">
                            <div className="field col-6">
                                <label>Date 1</label>
                                <InputText
                                    value={regle.date1}
                                    onChange={(e) =>
                                        setRegle(prev => ({ ...prev, date1: e.target.value }))
                                    }
                                />
                            </div>

                            <div className="field col-6">
                                <label>Heure 1</label>
                                <InputText
                                    value={regle.heure1}
                                    onChange={(e) =>
                                        setRegle(prev => ({ ...prev, heure1: e.target.value }))
                                    }
                                />
                            </div>
                        </div>
                    )}

                    {/* Bloc 2 seulement pour 1ER2NDGRP */}
                    {(regle.groupe === '2NDGRP' || regle.groupe === '1ER2NDGRP') && (
                        <div className="formgrid grid">
                            <div className="field col-6">
                                <label>Date 2</label>
                                <InputText
                                    value={regle.date2}
                                    onChange={(e) =>
                                        setRegle(prev => ({ ...prev, date2: e.target.value }))
                                    }
                                />
                            </div>

                            <div className="field col-6">
                                <label>Heure 2</label>
                                <InputText
                                    value={regle.heure2}
                                    onChange={(e) =>
                                        setRegle(prev => ({ ...prev, heure2: e.target.value }))
                                    }
                                />
                            </div>
                        </div>
                    )}
                  
                </div>
            </Dialog>
        </div>
    );
};

export default PlanningRegleMatiere;