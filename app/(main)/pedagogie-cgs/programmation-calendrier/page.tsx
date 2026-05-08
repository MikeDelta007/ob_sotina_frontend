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

interface RegleMatiereCGS {
    id?: string;
    valeur?: string;
    level?: string;
    date?: string;
    heure?: string;
}

const PlanningRegleMatiere = () => {
    const toast = useRef<any>(null);

    const emptyRegle: RegleMatiereCGS = {
        valeur: '',
        level: '',
        date: '',
        heure: ''
    };

    const [regles, setRegles] = useState<RegleMatiereCGS[]>([]);
    const [regle, setRegle] = useState<RegleMatiereCGS>(emptyRegle);
    const [series, setSeries] = useState([]);
    const [matieres, setMatieres] = useState([]);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMatieres, setLoadingMatieres] = useState(false); // 🔹 NOUVEAU : état séparé pour les matières
    const [submitted, setSubmitted] = useState(false);

    const levelOptions = [
        { label: 'PREMIERE', value: 'PREMIERE' },
        { label: 'TERMINALE', value: 'TERMINALE' }
    ];

    // 🔹 LOAD
    const loadData = async () => {
        try {
            setLoading(true);
            const data = await ParametrageService.getAllReglesCGS();
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

    useEffect(() => {
        loadData();
    }, []);

    // 🔹 CORRIGÉ : Utilisation d'un état séparé pour éviter de re-render tout le composant
    useEffect(() => {
        const loadMatieres = async () => {
            if (!regle.level) {
                setMatieres([]); // Reset si pas de niveau sélectionné
                return;
            }

            try {
                setLoadingMatieres(true); // 🔹 Utilise l'état spécifique

                const data = await ParametrageService.getMatieresCGS(regle.level);

                setMatieres(data || []);
            } catch (e) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Chargement matières impossible'
                });
            } finally {
                setLoadingMatieres(false);
            }
        };

        loadMatieres();
    }, [regle.level]); // 🔹 Dépendance correcte

    // 🔹 NEW
    const openNew = () => {
        setRegle(emptyRegle);
        setMatieres([]); // Reset des matières
        setSubmitted(false);
        setDialogVisible(true);
    };

    // 🔹 EDIT
    const editRegle = (row: RegleMatiereCGS) => {
        console.log(row);
        setRegle({ ...row });
        setDialogVisible(true);
    };

    // 🔹 DELETE
    const deleteRegle = async (row: RegleMatiereCGS) => {
        try {
            await ParametrageService.deleteRegleCGS(row.id);
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

        if (!regle.valeur) return;

        try {
            if (regle.id) {
                await ParametrageService.updateRegleCGS(regle.id, regle);
                toast.current.show({
                    severity: 'success',
                    summary: 'Mis à jour'
                });
            } else {
                await ParametrageService.createRegleCGS(regle);
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
    const actionBody = (row: RegleMatiereCGS) => (
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

    return (
        <div className="card">
            <Toast ref={toast} />

            <div className="flex justify-content-between mb-3">
                <h3>Gestion des règles matières & Programmation au CGS</h3>
                <Button label="Nouvelle règle" icon="pi pi-plus" onClick={openNew} />
            </div>

            <DataTable value={regles} paginator rows={10} responsiveLayout="scroll">
                <Column field="valeur" header="Type" />
                <Column field="level" header="Classe" />
                <Column field="date" header="Date" />
                <Column field="heure" header="Heure" />
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
                    
                    {/* Type / Classe */}
                    <div className="field grid">
                        <label className="col-4 mb-0">Classe</label>
                        <div className="col-5">
                            <Dropdown
                                value={regle.level}
                                options={levelOptions}
                                onChange={(e) =>
                                    setRegle(prev => ({ ...prev, level: e.value, valeur: '' })) // Reset matière quand classe change
                                }
                                placeholder="Sélectionner"
                            />
                        </div>
                    </div>

                    {/* Discipline avec indicateur de chargement */}
                    <div className="field grid">
                        <label className="col-4 mb-0">Discipline</label>
                        <div className="col-5">
                            {loadingMatieres ? (
                                <div className="flex align-items-center gap-2">
                                    <ProgressSpinner style={{ width: '20px', height: '20px' }} />
                                    <span>Chargement...</span>
                                </div>
                            ) : (
                                <Dropdown
                                    value={regle.valeur}
                                    options={matieres}
                                    optionLabel="specialite"
                                    optionValue="specialite"
                                    onChange={(e) =>
                                        setRegle(prev => ({ ...prev, valeur: e.value }))
                                    }
                                    placeholder="Sélectionner"
                                    disabled={!regle.level}
                                />
                            )}
                        </div>
                    </div>

                    {/* Date */}
                    <div className="field grid">
                        <label className="col-4 mb-0">Date</label>
                        <div className="col-5">
                            <InputText
                                value={regle.date}
                                onChange={(e) =>
                                    setRegle(prev => ({ ...prev, date: e.target.value }))
                                }
                                className={classNames({ 'p-invalid': submitted && !regle.date })}
                            />
                        </div>
                    </div>     

                    {/* Heure */}
                    <div className="field grid">
                        <label className="col-4 mb-0">Heure</label>
                        <div className="col-5">
                            <InputText
                                value={regle.heure}
                                onChange={(e) =>
                                    setRegle(prev => ({ ...prev, heure: e.target.value }))
                                }
                                className={classNames({ 'p-invalid': submitted && !regle.heure })}
                            />
                        </div>
                    </div>         
                </div>
            </Dialog>
        </div>
    );
};

export default PlanningRegleMatiere;