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
import { ActeurDTO, ParametrageService, ProfilDTO, ProgrammationDTO, SujetDTO, UserDTO } from '@/demo/service/ParametrageService';
import * as Yup from 'yup';
import { saveAs } from 'file-saver';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { InputTextarea } from 'primereact/inputtextarea';
import { useFormik } from 'formik';
import { UserContext } from '@/app/userContext';
import { InputMask } from 'primereact/inputmask';
import ProtectedRoute from '@/layout/ProtectedRoute';
import { FileUpload } from 'primereact/fileupload';
import { FiEdit } from 'react-icons/fi';
import { MdLockReset } from 'react-icons/md';
import { TabView, TabPanel } from 'primereact/tabview';
import { classNames } from 'primereact/utils';
import { ProgressSpinner } from 'primereact/progressspinner';

const PlanningForm = () => {
    const toast = useRef(null);

    // 🔹 Liste des épreuves
    const generiques = [
        "FRANCAIS L","FRANCAIS S","FRANCAIS LA","FRANCAIS SA",
        "PHILO L","PHILO S","ANGLAIS S","MATH L","MATH SM","MATH SE",
        "PC SM","PC SE","SVT SM","SVT SE","HG","LLA"
    ];

    const optionnelles = [
        "ALLEMAND LV1","ALLEMAND LV2","ANGLAIS LV1","ANGLAIS LV2",
        "ARABE MODERNE LV1","ARABE MODERNE LV2","ECONOMIE",
        "ESPAGNOL LV1","ESPAGNOL LV2","PORTUGAIS LV1","PORTUGAIS LV2",
        "ITALIEN","LATIN","RUSSE","PC L","SVT L","GENIE ELECTRIQUE",
        "GENIE MECANIQUE","MANAGEMENT DES ORGANISATIONS",
        "SCIENCES ECONOMIQUES ET SOCIALES","GESTION COMPTABLE ET FINANCIERE"
    ];

    // 🔹 State global du formulaire
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedMatiere, setSelectedMatiere] = useState(null);

    // 🔹 Charger les anciennes valeurs depuis le backend
    useEffect(() => {
        const fetchHoraires = async () => {
            try {
                setLoading(true);

                const response = await ParametrageService.getHoraires();
                console.log("Horaires reçus:", response);

                // ✅ sécurité maximale
                if (response?.horaires && typeof response.horaires === 'object') {
                    setFormData(response.horaires);
                } else {
                    setFormData({});
                }

            } catch (error) {
                console.error(error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Office du Bac',
                    detail: 'Impossible de charger les horaires',
                    life: 4000
                });
            } finally {
                setLoading(false);
            }
        };

        fetchHoraires();
    }, []);

    const handleChange = (epreuve, field, value) => {
        setFormData(prev => ({
            ...prev,
            [epreuve]: {
                ...prev[epreuve],
                [field]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { horaires: formData };
        try {
            await ParametrageService.doProg(payload);
            toast.current.show({
                severity: 'success',
                summary: 'Office du Bac',
                detail: 'Calendrier mis à jour avec succès',
                life: 4000
            });
        } catch (error) {
            const errorMessage = error?.response?.data?.errorMessage || "Erreur lors de l'enregistrement";
            toast.current.show({
                severity: 'error',
                summary: 'Office du Bac',
                detail: errorMessage,
                life: 4000
            });
        }
    };

    const matiereOptions = [
        { label: "Français (L)", value: "FRANCAIS L" },
        { label: "Français (S)", value: "FRANCAIS S" },
        { label: "Français (LA)", value: "FRANCAIS LA" },
        { label: "Français (S1A, S2A)", value: "FRANCAIS SA" },

        { label: "Anglais (S)", value: "ANGLAIS S" },

        { label: "Maths (L)", value: "MATH L" },
        { label: "Maths (S1, S1A, S3)", value: "MATH SM" },
        { label: "Maths (S2, S2A, S4, S5)", value: "MATH SE" },

        { label: "PC (S1, S1A, S3)", value: "PC SM" },
        { label: "PC (S2, S2A, S4, S5)", value: "PC SE" },
        { label: "PC/L", value: "PC L" },

        { label: "SVT (S2, S2A, S4, S5)", value: "SVT SE" },
        { label: "SVT (S1, S1A, S3)", value: "SVT SM" },
        { label: "SVT/L", value: "SVT L" },

        { label: "Philo (L)", value: "PHILO L" },
        { label: "Philo (S)", value: "PHILO S" },

        { label: "HG", value: "HG" },
        { label: "LLA", value: "LLA" },

        { label: "Allemand (LV1)", value: "ALLEMAND LV1" },
        { label: "Allemand (LV2)", value: "ALLEMAND LV2" },

        { label: "Anglais (LV1)", value: "ANGLAIS LV1" },
        { label: "Anglais (LV2)", value: "ANGLAIS LV2" },

        { label: "Arabe Moderne (LV1)", value: "ARABE MODERNE LV1" },
        { label: "Arabe Moderne (LV2)", value: "ARABE MODERNE LV2" },

        { label: "Espagnol (LV1)", value: "ESPAGNOL LV1" },
        { label: "Espagnol (LV2)", value: "ESPAGNOL LV2" },

        { label: "Portugais (LV1)", value: "PORTUGAIS LV1" },
        { label: "Portugais (LV2)", value: "PORTUGAIS LV2" },

        { label: "Italien", value: "ITALIEN" },
        { label: "Latin", value: "LATIN" },
        { label: "Russe", value: "RUSSE" },

        { label: "Economie", value: "ECONOMIE" },
        { label: "Sc. Eco. Soc.", value: "SES" },
        { label: "Ges. Compta. Fina.", value: "GCF" },
        { label: "Man. Org.", value: "MO" },

        { label: "Genie Electrique", value: "GELEC" },
        { label: "Genie Mécanique", value: "GEMEC" }
    ];

    const renderRow = (epreuve) => (
        <tr key={epreuve}>
            <td>{epreuve}</td>
            <td>
                <InputText
                    value={formData[epreuve]?.date1 || ""}
                    onChange={(e) => handleChange(epreuve, "date1", e.target.value)}
                    placeholder="Date 1"
                />
            </td>
            <td>
                <InputText
                    value={formData[epreuve]?.heure1 || ""}
                    onChange={(e) => handleChange(epreuve, "heure1", e.target.value)}
                    placeholder="Heure 1"
                />
            </td>
            <td>
                <InputText
                    value={formData[epreuve]?.date2 || ""}
                    onChange={(e) => handleChange(epreuve, "date2", e.target.value)}
                    placeholder="Date 2"
                />
            </td>
            <td>
                <InputText
                    value={formData[epreuve]?.heure2 || ""}
                    onChange={(e) => handleChange(epreuve, "heure2", e.target.value)}
                    placeholder="Heure 2"
                />
            </td>
        </tr>
    );

    if (loading) return <ProgressSpinner />;

    return (
        <form onSubmit={handleSubmit}>
            <Toast ref={toast} />
            <TabView>
                <TabPanel header="Matières génériques">
                    <table className="p-datatable p-component">
                        <thead>
                            <tr>
                                <th>Epreuve</th>
                                <th>Date (1er groupe)</th>
                                <th>Heure (1er groupe)</th>
                                <th>Date (2nd groupe)</th>
                                <th>Heure (2nd groupe)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {generiques.map(renderRow)}
                        </tbody>
                    </table>
                </TabPanel>
                <TabPanel header="Matières optionnelles">
                    <table className="p-datatable p-component">
                        <thead>
                            <tr>
                                <th>Epreuve</th>
                                <th>Date (1er groupe)</th>
                                <th>Heure (1er groupe)</th>
                                <th>Date (2nd groupe)</th>
                                <th>Heure (2nd groupe)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {optionnelles.map(renderRow)}
                        </tbody>
                    </table>
                </TabPanel>
            </TabView>

            <div style={{ marginTop: "1rem", textAlign: "right" }}>
                <Button
                    type="submit"
                    label="Valider"
                    icon="pi pi-check"
                    className="p-button-success"
                />
            </div>
        </form>
    );
};

export default PlanningForm;