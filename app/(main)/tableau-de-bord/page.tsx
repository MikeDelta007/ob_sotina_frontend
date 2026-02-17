
'use client';
import { ChartData, ChartOptions } from 'chart.js';
import { Chart } from 'primereact/chart';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ChartDataState, ChartOptionsState } from '@/types';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { CandidatureService } from '@/demo/service/CandidatureService';
import { UserContext } from '../../userContext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from "primereact/calendar";
import { dt } from '@fullcalendar/core/internal-common';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { text } from 'stream/consumers';
import { AlignCenter } from 'lucide-react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import MapByMansour from './map';
import MapComponent from './map';
import senegalGeoJSON from '../tableau-de-bord/data/senegal.json';
import { ParametrageService } from '@/demo/service/ParametrageService';
import { Card } from 'primereact/card';

const Dashboard = () => {
    const [options, setOptions] = useState<ChartOptionsState>({});
    const [summarizeData, setSummarizeData] = useState([]);
    const [summarizeData_, setSummarizeData_] = useState(null);
    const [vignettes, setVignettes] = useState(null);
    const [chartData, setChartData] = useState<any>({});
    const [barData, setBarData] = useState(null);
    const [barOptions, setBarOptions] = useState({});
    const [pieData, setPieData] = useState(null);
    const [pieOptions, setPieOptions] = useState({});
    const [pieData1, setPieData1] = useState(null);
    const [pieOptions1, setPieOptions1] = useState({});
    const [doughnutData1, setDoughnutData1] = useState(null);
    const [DoughnutOptions1, setDoughnutOptions1] = useState({});
    const [barData2, setBarData2] = useState(null);
    const [barOptions2, setBarOptions2] = useState({});
    const [barData3, setBarData3] = useState(null);
    const [barOptions3, setBarOptions3] = useState({});
    const { layoutConfig } = useContext(LayoutContext);
    const [faeb, setFaebs] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [reloadTrigger, setReloadTrigger] = useState(false);
    const [compteEF, setCompteEFs] = useState(null);
    const [selectedSession, setSelectedSession] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [globalFilter, setGlobalFilter] = useState(null);
    const dt = useRef(null);
    const [stats, setStats] = useState<any[]>([]);
    const [statGlobales, setStatGlobales] = useState(null);
    const [statAcademies, setStatAcademies] = useState<any[]>([]);

    const [barDataAcademie, setBarDataAcademie] = useState(null);
    const [barOptionsAcademie, setBarOptionsAcademie] = useState({});
    
    const [barDataHandicap, setBarDataHandicap] = useState(null);
    const [barOptionsHandicap, setBarOptionsHandicap] = useState({});

    const [barDataSerie, setBarDataSerie] = useState(null);
    const [barOptionsSerie, setBarOptionsSerie] = useState({});

    const { user } = useContext(UserContext);

    const [prog, setOneProg] = useState<{ edition?: number } | null>(null);
    
    const [annees, setAnnees] = useState(null);
    const [edition, setEdition] = useState(null);
    
    useEffect(() => {
        CandidatureService.getProgs().then((response) => {
            //console.log("📦 Séries chargées :", data);
            setAnnees(response);
        });
    }, []);

    useEffect(() => {
        if (!edition) return;
        ParametrageService.getStatByDepartment(edition.edition).then(res => setStats(res));
    }, [edition]);

    useEffect(() => {
        CandidatureService.getLastProg().then((response) => {
            console.log("📦 Ok chargées :", response);
        setOneProg(response);
        });
    }, []); 

    console.log(prog?.edition);



    // 🔹 Fonction mémorisée pour loadDatas
    const loadDatas = useCallback(async () => 
        {
            setLoading(true);
            setError(null);
            try 
            {
                const response = await CandidatureService.compteFAEBS_(user?.acteur?.etablissement?.id, prog?.edition);
                setFaebs(response);
                console.log(faeb);
            } 
            catch (err) 
            {
                console.error("Erreur chargement données :", err);
                setError("Erreur lors du chargement");
            } 
            finally 
            {
                setLoading(false);
            }
    }, [user?.acteur?.etablissement?.id, prog?.edition]); 

    const loadDatas2 = useCallback(async () => {
            setLoading(true);
            setError(null);
            try 
            {
                const response = await CandidatureService.compteEF_(prog?.edition, user?.acteur?.etablissement?.id);
                console.log("OK", response);
                setCompteEFs(response);
            } 
            catch (err) 
            {
                setError("Erreur lors du chargement");
            } 
            finally 
            {
                setLoading(false);
            }
    }, [user?.acteur?.etablissement?.id, prog?.edition]); 

    useEffect(() => {
       if (user?.acteur?.etablissement?.id && Number(prog?.edition)) {
            loadDatas();
            loadDatas2();
        }
    }, [reloadTrigger, loadDatas, loadDatas2]);


    useEffect(() => {
    if (!user?.acteur?.etablissement?.id  || !prog?.edition) return;

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color') || '#495057';
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#6c757d';
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#dee2e6';

    const backgroundColors = [
        documentStyle.getPropertyValue('--primary-500') || '#42A5F5',
        documentStyle.getPropertyValue('--pink-500') || '#FFB6C1'
    ];

    const backgroundColors2 = [
        documentStyle.getPropertyValue('--red-500') || '#F44336',   // Rouge
        documentStyle.getPropertyValue('--green-500') || '#4CAF50' // Vert
    ];

    const generateColorPalette = (count) => {
        return Array.from({ length: count }, (_, i) =>
            `hsl(${(i * 360) / count}, 100%, 45%)`
        );
    };

    const colorPalette = [
       '#4CAF50', '#FFC107', '#F44336', '#1E90FF'
    ];


    const fetchBarChartData = async () => {
        try {
            const barStats = await CandidatureService.getNombreCandidatsSerieByEtab(user.acteur.etablissement.id, prog?.edition);

            const labels = barStats.map((item) => item.label);
            const data = barStats.map((item) => item.data);
            const colorPalette = generateColorPalette(data.length);

            setBarData({
                labels,
                datasets: [
                    {
                        backgroundColor: colorPalette.slice(0, data.length),
                        borderColor: colorPalette.slice(0, data.length),
                        borderWidth: 1,
                        data
                    }
                ]
            });

            setBarOptions({
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#000000', display: true, font: {size: 10} },
                        grid: { color: '#000000', drawTicks: false }
                    },
                    y: {
                        ticks: { color: '#000000', display: true  },
                        grid: { color: '#000000', drawTicks: false }
                    }
                }
            });
        } catch (error) {
            console.error('Erreur BarChart stats série établissement :', error);
        }
    };


    const fetchPieChartData = async () => {
        try {
            const pieStats = await CandidatureService.getNombreCandidatsSexeByEtab(user.acteur.etablissement.id, prog?.edition); // ← autre endpoint

            const labels = pieStats.map((item) => item.label);
            const data = pieStats.map((item) => item.data);

            setPieData({
                labels,
                datasets: [
                    {
                        data,
                        backgroundColor: backgroundColors.slice(0, data.length),
                        hoverBackgroundColor: backgroundColors.slice(0, data.length)
                    }
                ]
            });

            setPieOptions({
                plugins: {
                    legend: {
                        labels: { color: textColor }
                    }
                }
            });
        } catch (error) {
            console.error('Erreur PieChart stats globales série :', error);
        }
    };

    const fetchPieChartData2 = async () => {
        try {
            const pieStats = await CandidatureService.getNombreCandidatsEPSByEtab(user.acteur.etablissement.id, prog?.edition); // ← autre endpoint

            const labels = pieStats.map((item) => item.label);
            const data = pieStats.map((item) => item.data);

            setPieData1({
                labels,
                datasets: [
                    {
                        data,
                        backgroundColor: backgroundColors2.slice(0, data.length),
                        hoverBackgroundColor: backgroundColors2.slice(0, data.length)
                    }
                ]
            });

            setPieOptions1({
                plugins: {
                    legend: {
                        labels: { color: textColor }
                    }
                }
            });
        } catch (error) {
            console.error('Erreur PieChart stats globales série :', error);
        }
    };

    const fetchDoughnutChartData2 = async () => {
        try {
            const pieStats = await CandidatureService.getNombreCandidatsHandicapByEtab(user.acteur.etablissement.id, prog?.edition); // ← autre endpoint

            const labels = pieStats.map((item) => item.label);
            const data = pieStats.map((item) => item.data);

            setDoughnutData1({
                labels,
                datasets: [
                    {
                        data,
                        backgroundColor: backgroundColors2.slice(0, data.length),
                        hoverBackgroundColor: backgroundColors2.slice(0, data.length)
                    }
                ]
            });

            setDoughnutOptions1({
                plugins: {
                    legend: {
                        labels: { color: textColor }
                    }
                }
            });
        } catch (error) {
            console.error('Erreur PieChart stats globales série :', error);
        }
    };

    const fetchBarChartData2 = async () => {
        try {
            const barStats = await CandidatureService.getNombreCandidatsEFLAByEtab(user.acteur.etablissement.id, prog?.edition);

            const labels = barStats.map((item) => item.label);
            const data = barStats.map((item) => item.data);

            setBarData2({
                labels,
                datasets: [
                    {
                        backgroundColor: colorPalette.slice(0, data.length),
                        borderColor: colorPalette.slice(0, data.length),
                        borderWidth: 1,
                        data
                    }
                ]
            });

            setBarOptions2({
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#000000', display: true, font: {size: 10} },
                        grid: { color: '#000000', drawTicks: false }
                    },
                    y: {
                        ticks: { color: '#000000', display: true  },
                        grid: { color: '#000000', drawTicks: false }
                    }
                }
            });
        } catch (error) {
            console.error('Erreur BarChart stats série établissement :', error);
        }
    };

    const fetchBarChartData3 = async () => {
        try {
            const barStats = await CandidatureService.getNombreCandidatsOptionsByEtab(user.acteur.etablissement.id, prog?.edition);

            const labels = barStats.map((item) => item.label);
            const data = barStats.map((item) => item.data);
            const colorPalette = generateColorPalette(data.length);

            setBarData3({
                labels,
                datasets: [
                    {
                        backgroundColor: colorPalette.slice(0, data.length),
                        borderColor: colorPalette.slice(0, data.length),
                        borderWidth: 1,
                        data
                    }
                ]
            });

            setBarOptions3({
                
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#000000', display: true, font: {size: 10}  },
                        grid: { color: '#000000', drawTicks: false }
                    },
                    y: {
                        ticks: { color: '#000000', display: true },
                        grid: { color: '#000000', drawTicks: false}
                    }
                }
            });
        } catch (error) {
            console.error('Erreur BarChart stats série établissement :', error);
        }
    };


    fetchBarChartData();
    fetchPieChartData();
    fetchPieChartData2();
    fetchDoughnutChartData2();
    fetchBarChartData2();
    fetchBarChartData3();
    }, [user, prog]);

    useEffect(() => {
    if (!prog?.edition) return;

    const fetchBarChartDataAcademie = async () => {
        try {
            const barStats = await ParametrageService.getStatAcademies(prog?.edition);

            if (!barStats || barStats.length === 0) return;

            const labels = barStats.map(item => item.inspectionAcademie);
            const maleData = barStats.map(item => item.male || 0);
            const femaleData = barStats.map(item => item.female || 0);

            const colorMale = '#42A5F5';
            const colorFemale = '#EC407A';

            setBarDataAcademie({
                labels,
                datasets: [
                    {
                        label: 'Garçons',
                        backgroundColor: colorMale,
                        data: maleData
                    },
                    {
                        label: 'Filles',
                        backgroundColor: colorFemale,
                        data: femaleData
                    }
                ]
            });

            setBarOptionsAcademie({
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                        ticks: { color: '#000000', font: { size: 10 } },
                        grid: { color: '#e0e0e0' }
                    },
                    y: {
                        stacked: true,
                        ticks: { color: '#000000' },
                        grid: { color: '#e0e0e0' }
                    }
                }
            });
        } 
        catch (error) 
        {
            console.error('Erreur BarChart stats académie :', error);
        }
    };


    const fetchBarChartDataHandicap = async () => {
        try {
            const barStats = await ParametrageService.getStatHandicap(prog?.edition);

            if (!barStats || barStats.length === 0) return;

            const labels = barStats.map(item => item.handicap);
            const maleData = barStats.map(item => item.male || 0);
            const femaleData = barStats.map(item => item.female || 0);

            const colorMale = '#42A5F5';
            const colorFemale = '#EC407A';

            setBarDataHandicap({
                labels,
                datasets: [
                    {
                        label: 'Garçons',
                        backgroundColor: colorMale,
                        data: maleData
                    },
                    {
                        label: 'Filles',
                        backgroundColor: colorFemale,
                        data: femaleData
                    }
                ]
            });

            setBarOptionsHandicap({
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                        ticks: { color: '#000000', font: { size: 10 } },
                        grid: { color: '#e0e0e0' }
                    },
                    y: {
                        stacked: true,
                        ticks: { color: '#000000' },
                        grid: { color: '#e0e0e0' }
                    }
                }
            });
        } 
        catch (error) 
        {
            console.error('Erreur BarChart stats académie :', error);
        }
    };


    const fetchBarChartDataSerie = async () => {
        try {
            const barStats = await ParametrageService.getStatSerie(prog?.edition);

            if (!barStats || barStats.length === 0) return;

            const labels = barStats.map(item => item.serie);
            const maleData = barStats.map(item => item.male || 0);
            const femaleData = barStats.map(item => item.female || 0);

            const colorMale = '#42A5F5';
            const colorFemale = '#EC407A';

            setBarDataSerie({
                labels,
                datasets: [
                    {
                        label: 'Garçons',
                        backgroundColor: colorMale,
                        data: maleData
                    },
                    {
                        label: 'Filles',
                        backgroundColor: colorFemale,
                        data: femaleData
                    }
                ]
            });

            setBarOptionsSerie({
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                        ticks: { color: '#000000', font: { size: 10 } },
                        grid: { color: '#e0e0e0' }
                    },
                    y: {
                        stacked: true,
                        ticks: { color: '#000000' },
                        grid: { color: '#e0e0e0' }
                    }
                }
            });
        } 
        catch (error) 
        {
            console.error('Erreur BarChart stats académie :', error);
        }
    };

        fetchBarChartDataAcademie(),
        fetchBarChartDataHandicap(),
        fetchBarChartDataSerie()

    }, [prog]);

    useEffect(() => 
    {
        if (startDate && endDate)
        {
            fetchDailyStats();
        }
    }, [startDate, endDate]);

    
    useEffect(() => 
    {
        if (prog?.edition)
        {
            fetchSummarize();
            fetchSummarize_();
            fetchVignettes_()
        }
    }, [prog]);


    
    useEffect(() => {
        if (prog?.edition)
        {
            ParametrageService.getStatGlobales(prog?.edition).then((response) => {
                console.log("📦 Ok chargées :", response);
            setStatGlobales(response);
            });
        }
    }, [prog]); 

    useEffect(() => {
        if (prog?.edition)
        {
            ParametrageService.getStatAcademies(prog?.edition).then((response) => {
                console.log("📦 Ok chargées :", response);
            setStatAcademies(response);
            });
        }
    }, [prog]); 



    interface OperatorDecisionCount {
        operator: string;
        dateOperation: string;
        accepted: number;
        rejected: number;
    }

    const fetchDailyStats = async () => {
        try {
            const res = await CandidatureService.checkReception(startDate,endDate,prog?.edition);
            setChartData(res);
            console.log(chartData);
        } catch (err) {
            console.error("Erreur fetch operator-daily :", err);
        }
    };

    
    const fetchSummarize = async () => {
        try {
            const res = await CandidatureService.getSummarizeOperations(prog?.edition);
            setSummarizeData(res);
            console.log(summarizeData);
        } catch (err) {
            console.error("Erreur fetch operator-daily :", err);
        }
    };

    const fetchSummarize_ = async () => {
        try {
            const res = await CandidatureService.getSummarizeOperations_(prog?.edition);
            setSummarizeData_(res);
            console.log(summarizeData_);
        } catch (err) {
            console.error("Erreur fetch operator-daily :", err);
        }
    };

    const fetchVignettes_ = async () => {
        try {
            const res = await CandidatureService.getVignettes_(prog?.edition);
            setVignettes(res);
            console.log(vignettes);
        } catch (err) {
            console.error("Erreur fetch operator-daily :", err);
        }
    };
    
    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <div className="flex flex-wrap gap-3">
                                <h4>Listing des établissements receptionnés</h4>
                            </div>
                            <span className="p-input-icon-left w-full md:w-25rem">
                                <i className="pi pi-search z-2" style={{ position: 'absolute', left: '10px', top: '25px', transform: 'translateY(-50%)' }}></i>   
                                <InputText
                                    type="search"
                                    onInput={(e) => setGlobalFilter((e.target as HTMLInputElement).value)}
                                    placeholder="Recherche..."
                                />
                            </span>
                            
                        </div>
                        
    );
                

    const processChartData = (data: OperatorDecisionCount[] | undefined | null) => {
        if (!Array.isArray(data) || data.length === 0) {
            return { labels: [], datasets: [] };
        }

        // Extraire la liste unique des opérateurs
        const operators = Array.from(new Set(data.map(d => d.operator)));

        // Calculer les sommes par opérateur
        const acceptedCounts = operators.map(op => {
            return data
                .filter(d => d.operator === op)
                .reduce((sum, d) => sum + d.accepted, 0);
        });

        const rejectedCounts = operators.map(op => {
            return data
                .filter(d => d.operator === op)
                .reduce((sum, d) => sum + d.rejected, 0);
        });

        return {
            labels: operators,
            datasets: [
                {
                    label: "Accepté",
                    data: acceptedCounts,
                    borderColor: "green",
                    fill: false,
                },
                {
                    label: "Rejeté",
                    data: rejectedCounts,
                    borderColor: "red",
                    fill: false,
                },
            ],
        };
    };

    const SBodyTemplate = (rowData) => {
                return (
                    <>
                        <b>{rowData.etablissement?.name}</b><br/>
                        <span style={{
                                display: "inline-block",
                                backgroundColor: "blue",
                                color: "white",
                                padding: "4px 10px",
                                borderRadius: "5px",
                                fontWeight: "bold",
                                fontSize: "0.9rem",
                                textAlign: "center",
                                minWidth: "20px"
                            }}
                        >{rowData.etablissement?.inspectionAcademie?.name}</span>
                        
                    </>
                );
            };
        
    const decision0BodyTemplate = (rowData) => {
                return (
                    <>
                        <span style={{
                                display: "inline-block",
                                backgroundColor: "yellow",
                                color: "black",
                                padding: "4px 10px",
                                borderRadius: "12px",
                                fontWeight: "bold",
                                fontSize: "0.9rem",
                                textAlign: "center",
                                minWidth: "40px"
                            }}
                        >
                        {rowData.decision0}
                        </span>
                    </>
                );
            };   
            
    const decision1BodyTemplate = (rowData) => {
                return (
                    <>
                        <span style={{
                                display: "inline-block",
                                backgroundColor: "palegreen",
                                color: "black",
                                padding: "4px 10px",
                                borderRadius: "12px",
                                fontWeight: "bold",
                                fontSize: "0.9rem",
                                textAlign: "center",
                                minWidth: "40px"
                            }}
                        >
                        {rowData.decision1}
                        </span>
                    </>
                );
            }; 

    const decision2BodyTemplate = (rowData) => {
                return (
                    <>
                        <span style={{
                                display: "inline-block",
                                backgroundColor: "red",
                                color: "white",
                                padding: "4px 10px",
                                borderRadius: "12px",
                                fontWeight: "bold",
                                fontSize: "0.9rem",
                                textAlign: "center",
                                minWidth: "40px"
                            }}
                        >
                        {rowData.decision2}
                        </span>
                    </>
                );
            }; 
    const totalBodyTemplate = (rowData) => {
                return (
                    <>
                        <span style={{
                                display: "inline-block",
                                backgroundColor: "cyan",
                                color: "black",
                                padding: "4px 10px",
                                borderRadius: "12px",
                                fontWeight: "bold",
                                fontSize: "0.9rem",
                                textAlign: "center",
                                minWidth: "40px"
                            }}
                        >
                        {rowData.decision0 + rowData.decision1 + rowData.decision2}
                        </span>
                    </>
                );
            }; 
    
            const opsBodyTemplate = (rowData) => {
                return (
                    <>
                        <span className="p-column-title">Opérateurs</span>
                        {Array.isArray(rowData.operators) 
                            ? rowData.operators.join(" - ") 
                            : rowData.operators}
                    </>
                );
            };

    return (
        <>

    {user?.profil?.name === "AGENT_DE_SAISIE" && (
        <div className="grid p-fluid">

            <div className="grid p-fluid">
                <div className="col-12 xl:col-4">
                    <div className="card flex flex-column align-items-center" style={{ backgroundColor: 'white', minHeight: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        {/* Vérification candidats */}
                        <div className="flex justify-between">
                        <h6 className="m-0">
                            {faeb?.count_5000 < compteEF?.candidats && (
                            <span className="text-red-600 font-bold">
                                Attention vous avez ajouté plus de candidats que la somme versée au Trésor Public (FAEB1)
                            </span>
                            )}
                        </h6>
                        </div>

                        {/* Vérification épreuves facultatives */}
                        <div className="flex justify-between">
                        <h6 className="m-0">
                            {faeb?.count_1000_EF < (compteEF?.facListA + compteEF?.facListB) && (
                            <span className="text-red-600 font-bold">
                                Attention vous avez ajouté plus d&apos;épreuves facultatives que la somme versée au Trésor Public (FAEB2)
                            </span>
                            )}
                        </h6>
                        </div>

                        {/* si tout est stable */}
                        {faeb?.count_5000 >= compteEF?.candidats &&
                            faeb?.count_1000_EF >= compteEF?.facListA + compteEF?.facListB && (
                            <div className="flex justify-between">
                                <span className="text-green-600 font-bold text-lg">
                                ✅ Votre établissement est en situation stable, vous êtes prêt pour la réception des dossiers.
                                </span>
                            </div>
                            )}

                    </div>
                </div>

                <div className="col-12 xl:col-4">
                <div
                        className="card flex flex-column align-items-center"
                        style={{
                            minHeight: '100px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor:
                            Number(faeb?.count_5000) > Number(compteEF?.candidats) &&
                            Number(faeb?.count_5000) !== 0
                                ? 'gold' :
                            Number(faeb?.count_5000) == Number(compteEF?.candidats) &&
                            Number(faeb?.count_5000) !== 0
                                ? 'palegreen'
                                : 'red',
                            color:
                            Number(faeb?.count_5000) > Number(compteEF?.candidats) &&
                            Number(faeb?.count_5000) !== 0
                                ? 'black' :
                            Number(faeb?.count_5000) == Number(compteEF?.candidats) &&
                            Number(faeb?.count_5000) !== 0
                                ? 'black'
                                : 'white',
                        }}
                        >
                        <span className="block text-center text-lg">
                            <b>Droits d&apos;inscription à 5000 FCFA (FAEB1) <br />versés au TRESOR PUBLIC</b>
                            <br /><b>- Vignettes de 5000 FCFA attribuées : {faeb?.count_5000 || 0}</b>
                            <br /><b>- Candidats ajoutés : {Number(compteEF?.candidats) || 0}</b>
                                
                        </span>
                        
                        </div>


                </div>

                <div className="col-12 xl:col-4">
                    <div
                        className="card flex flex-column align-items-center"
                        style={{
                            minHeight: '100px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor:
                            Number(faeb?.count_1000_EF) > Number(compteEF?.facListA + compteEF?.facListB) &&
                            Number(faeb?.count_1000_EF) !== 0
                                ? 'gold':
                            Number(faeb?.count_1000_EF) == Number(compteEF?.facListA + compteEF?.facListB) &&
                            Number(faeb?.count_1000_EF) !== 0
                                ? 'palegreen'
                                : 'red',
                            color:
                            Number(faeb?.count_1000_EF) > Number(compteEF?.facListA + compteEF?.facListB) &&
                            Number(faeb?.count_1000_EF) !== 0
                                ? 'black':
                            Number(faeb?.count_1000_EF) == Number(compteEF?.facListA + compteEF?.facListB) &&
                            Number(faeb?.count_1000_EF) !== 0
                                ? 'black'
                                : 'white',
                        }}
                        >
                        <span className="block text-center text-lg" >
                            <b>Epreuves facultatives à 1000 FCFA (FAEB2) <br />versés au TRESOR PUBLIC</b>
                            <br /><b>- Vignettes de 1000 FCFA attribuées : {faeb?.count_1000_EF || 0}</b>
                            <br /><b>- Epreuves facultatives ajoutées : {Number(compteEF?.facListA + compteEF?.facListB) || 0}</b>
                        </span>
                        </div>


                </div>
                <span className="col-12" style={{
                            minHeight: '5px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor:'palegreen',
                            color : 'black'}}>
                    La somme versée au Trésor, convertie en vignette numérique par l&apos;Office du Bac après téléversement de la quittance est égale au nombre d&apos;éléments ajoutés sur la plateforme.
                </span>
                 <span className="col-12" style={{
                            minHeight: '5px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor:'gold',
                            color : 'black'}}>
                    La somme versée au Trésor, convertie en vignette numérique par l&apos;Office du Bac après téléversement de la quittance est supérieure au nombre d&apos;éléments ajoutés sur la plateforme.
                </span>
                 <span className="col-12" style={{
                            minHeight: '5px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor:'red',
                            color : 'white'}}>
                    La somme versée au Trésor, convertie en vignette numérique par l&apos;Office du Bac après téléversement de la quittance est inférieure au nombre d&apos;éléments ajoutés sur la plateforme.
                </span>
            </div>
            
            
            

            <div className="col-12 xl:col-6">
                <h5>Répartition des candidats selon la série</h5>
                <div className="card flex flex-column align-items-center" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        {barData && 
                        <div style={{ width: '100%'}}>
                            <Chart type="bar" data={barData} options={barOptions} 
                            style={{ width: '100%', height: '100%' }}/>
                        </div>                        
                        }
                </div>
            </div>
            <div className="col-12 xl:col-6">
                <h5>Répartition des candidats selon le sexe</h5>
                <div className="card flex flex-column align-items-center" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    {pieData && <Chart type="pie" data={pieData} options={pieOptions} />}
                </div>
            </div>
            <div className="col-12 xl:col-6">
                <h5>Répartition des candidats selon l&apos;aptitude EPS</h5>
                <div className="card flex flex-column align-items-center" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    {pieData1 && <Chart type="pie" data={pieData1} options={pieOptions1} />}
                </div>
            </div>
            <div className="col-12 xl:col-6">
                <h5>Répartition des candidats selon le handicap</h5>
                <div className="card flex flex-column align-items-center" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    {doughnutData1 && <Chart type="doughnut" data={doughnutData1} options={DoughnutOptions1} />}
                </div>
            </div>
            <div className="col-12 xl:col-6">
                <h5>Répartition des candidats selon les épreuves facultatives</h5>
                <div className="card flex flex-column align-items-center" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        {barData2 && 
                        <div style={{ width: '100%'}}>
                            <Chart type="bar" data={barData2} options={barOptions2} 
                            style={{ width: '100%', height: '100%' }}/>
                        </div>
                        }
                </div>

            </div>
            <div className="col-12 xl:col-6">
                <h5>Répartition des candidats selon l&apos;option</h5>
                <div className="card flex flex-column align-items-center" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        {barData3 && 
                        <div style={{ width: '100%'}}>
                            <Chart type="bar" data={barData3} options={barOptions3} 
                            style={{ width: '100%', height: '100%' }}/>
                        </div>
                        }
                </div>

            </div>
        </div>
    )}
    
    {(user?.profil?.name === "ADMIN" || user?.profil?.name === "SCOLARITE") && (
        <div className="grid"> 
          <div className='col-6'> 
            <h5>Statistiques nationales des candidatures au Baccalauréat {prog?.edition}</h5>
            <div style={{ width: '300px', display: 'flex', alignItems: 'center', gap: '5px' }}> 
              <label htmlFor="serieCode" style={{ margin: 0, minWidth: '100px' }}> 
                <h6 className="m-0">Edition du BAC</h6> 
                </label> 
                <Dropdown 
                showClear 
                id="edition" 
                name="edition" 
                options={annees} 
                value={edition} 
                onChange={(e) => setEdition(e.value)} 
                optionLabel="edition" 
                placeholder="Choisir une édition du bac" 
                filter 
                className="p-inputtext-sm" 
                style={{ flex: 1, color: 'black', fontWeight: 'bold' }} /> 
                </div> 
                <br /> 
                <MapComponent geoJson={senegalGeoJSON} data={stats} />
                </div> 
                <div className='col-6'> 
                  <Accordion activeIndex={0}> 
                        <AccordionTab header="Statistiques globales"> 
                 
                            <div className="grid mt-4">
      {/* Total Candidats */}
      <div className="col-12 md:col-4">
        <Card className="text-center shadow-3 border-round-xl" style={{ background: '#dbdbdb4b' }}>
          <img
            src="/layout/images/people.png"
            alt="Candidats"
            style={{ width: '40px', height: '40px', objectFit: 'contain' }}
          />
          <h3 className="mt-3 mb-1 text-black-700">Candidats</h3>
          <h3 className="text-black-500 mt-2">{statGlobales?.candidats ?? 0}</h3>
        </Card>
      </div>

      {/* Garçons */}
      <div className="col-12 md:col-4">
        <Card className="text-center shadow-3 border-round-xl" style={{ background: '#006aff21' }}>
          <img
            src="/layout/images/man.png"
            alt="Garçons"
            style={{ width: '40px', height: '40px', objectFit: 'contain' }}
          />
          <h3 className="mt-3 mb-1 text-blue-700">Garçons</h3>
          <h3 className="text-blue-600 mt-2">{statGlobales?.male ?? 0}</h3>
        </Card>
      </div>

      {/* Filles */}
      <div className="col-12 md:col-4">
        <Card className="text-center shadow-3 border-round-xl" style={{ background: '#fdf2f8' }}>
          <img
            src="/layout/images/woman.png"
            alt="Filles"
            style={{ width: '40px', height: '40px', objectFit: 'contain' }}
          />
          <h3 className="mt-3 mb-1 text-pink-700">Filles</h3>
          <h3 className="text-pink-600 mt-2">{statGlobales?.female ?? 0}</h3>
        </Card>
      </div>
    </div>

                    
                        </AccordionTab> 
                        <AccordionTab header="Répartition des inscriptions par Académie"> 
                            <div
                                className="flex-column align-items-center"
                                style={{
                                    minHeight: '100px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >                              
                                    
                                        <Chart
                                            type="bar"
                                            data={barDataAcademie}
                                            options={barOptionsAcademie}
                                            style={{ width: '100%', height: '100%' }}
                                        />
                            
                            </div>

                        </AccordionTab> 
                        <AccordionTab header="Répartition des inscriptions par Handicap"> 
                          <div
                                className="flex-column align-items-center"
                                style={{
                                    minHeight: '100px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >                              
                                    
                                        <Chart
                                            type="bar"
                                            data={barDataHandicap}
                                            options={barOptionsHandicap}
                                            style={{ width: '100%', height: '100%' }}
                                        />
                            
                            </div>
                        </AccordionTab> 
                        <AccordionTab header="Répartition des inscriptions par Série"> 
                            <div
                                className="flex-column align-items-center"
                                style={{
                                    minHeight: '100px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >    
                                <Chart type="bar" data={barDataSerie} options={barOptionsSerie} />
                            </div>
                        </AccordionTab> 
                      </Accordion> 
                    </div> 
        </div> 

    )}

        {(user?.profil?.name === "SCOLARITE" || user?.profil?.name === "ADMIN") && (
        <div className="grid p-fluid mt-2">
            
            <div className="col-12 xl:col-12">
                <h5>Situation globale des vignettes et coupons {prog?.edition}</h5>

                <div className="formgrid grid">
                    <div className="col-12 xl:col-4">
                        <div className="card flex flex-column align-items-center" style={{ backgroundColor: 'white', minHeight: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{ textAlign: "center", margin: "1rem 0" }}>
                                <span style={{
                                    display: "inline-block",
                                    padding: "0.5rem 1rem",
                                    borderRadius: "1rem",
                                    backgroundColor: "#ffede0ff",
                                    color: "black",
                                    fontWeight: "bold",
                                    marginBottom: "0.5rem"
                                }}>
                                    Vignettes de 1000 FCFA OB
                                </span>
<br />
                                <div style={{
                                    display: "inline-block",
                                    padding: "0.5rem 1rem",
                                    borderRadius: "1rem",
                                    backgroundColor: "#ffede0ff",
                                    color: "black",
                                    fontWeight: "bold",
                                    marginTop: "0.5rem",
                                    fontSize: '1.5rem'
                                }}>
                                    {vignettes?.vob || 0} attributions
                                    <br />
                                   
                                </div>
                            </div>
                        </div>
                    </div>      

                    <div className="col-12 xl:col-4">
                        <div className="card flex flex-column align-items-center" style={{ backgroundColor: 'white', minHeight: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{ textAlign: "center", margin: "1rem 0" }}>
                                <span style={{
                                    display: "inline-block",
                                    padding: "0.5rem 1rem",
                                    borderRadius: "1rem",
                                    backgroundColor: "#6ef8188e",
                                    color: "black",
                                    fontWeight: "bold",
                                    marginBottom: "0.5rem"
                                }}>
                                    Vignettes de 5000 FCFA
                                </span>
                                <br />
                                <div style={{
                                    display: "inline-block",
                                    padding: "0.5rem 1rem",
                                    borderRadius: "1rem",
                                    backgroundColor: "#6ef8188e",
                                    color: "black",
                                    fontWeight: "bold",
                                    marginTop: "0.5rem",
                                    fontSize: '1.5rem'
                                }}>
                                    {vignettes?.v5000 || 0} attributions
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 xl:col-4">
                        <div className="card flex flex-column align-items-center" style={{ backgroundColor: 'white', minHeight: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{ textAlign: "center", margin: "1rem 0" }}>
                                <span style={{
                                    display: "inline-block",
                                    padding: "0.5rem 1rem",
                                    borderRadius: "1rem",
                                    backgroundColor: "#e0f0ff",
                                    color: "black",
                                    fontWeight: "bold",
                                    marginBottom: "0.5rem"
                                }}>
                                    Vignettes de 1000 FCFA (Epreuve Facultative)
                                </span>
                                <br />
                                <div style={{
                                    display: "inline-block",
                                    padding: "0.5rem 1rem",
                                    borderRadius: "1rem",
                                    backgroundColor: "#f0f8ff",
                                    color: "black",
                                    fontWeight: "bold",
                                    marginTop: "0.5rem",
                                    fontSize: '1.5rem'
                                }}>
                                    {vignettes?.v100EF || 0} attributions
                                   
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
                
            </div>

        </div> 

    )}

    {(user?.profil?.name === "SCOLARITE" || user?.profil?.name === "ADMIN") && (
        <div className="grid p-fluid mt-2">
            
            <div className="col-12 xl:col-4">
                <h5>Situation globale des dossiers {prog?.edition}</h5>

                <div className="formgrid grid">
                    <div className="col-12 xl:col-4">
                        <div className="card flex flex-column align-items-center" style={{ backgroundColor: 'yellow', minHeight: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <span style={{ color: "black", textAlign:"center" }}><b>Dossier (s) en attente <br/>{prog?.edition}</b></span>
                            <h4 style={{ color: "black", textAlign:"center" }}>{summarizeData_?.decision0 || 0}</h4>
                            
                        </div>
                    </div>      

                    <div className="col-12 xl:col-4">
                        <div className="card flex flex-column align-items-center" style={{ backgroundColor: 'palegreen', minHeight: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <span style={{ color: "black", textAlign:"center" }}><b>Dossier (s) validés <br/>{prog?.edition}</b></span>
                            <h4 style={{ color: "black", textAlign:"center" }}>{summarizeData_?.decision1 || 0}</h4>
                        </div>
                    </div>
                    <div className="col-12 xl:col-4">
                        <div className="card flex flex-column align-items-center" style={{ backgroundColor: 'red', minHeight: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <span style={{ color: "white", textAlign:"center" }}><b>Dossier (s) rejetés <br/>{prog?.edition}</b></span>
                            <h4 style={{ color: "white", textAlign:"center" }}>{summarizeData_?.decision2 || 0}</h4>
                        </div>
                    </div>
                </div>
                
            </div>

            <div className="col-12 flex flex-column xl:col-8">
                <h5>Suivi de la situation des réceptionnistes</h5>
                <div className="formgrid grid">
                    
                    <div className="field col-4">
                        <label htmlFor=""><h6 className="m-0">Date de Début des réceptions</h6></label>
                        <Calendar
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.value as Date)}
                            showIcon
                            dateFormat="dd/mm/yy"
                            placeholder="Choisir une date"
                        />
                    </div>
                    <div className="field col-4">
                        <label htmlFor=""><h6 className="m-0">Date de Fin des réceptions</h6></label>
                        <Calendar
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.value as Date)}
                            showIcon
                            dateFormat="dd/mm/yy"
                            placeholder="Choisir une date"
                        />
                    </div>
                </div>
            <div 
                className="card flex flex-column align-items-center" 
                style={{ height: '400px', width: '100%' }}
            >
                <Chart
                style={{ width: '100%', height: '100%' }}
                type="line"
                data={processChartData(chartData)}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                    legend: { position: 'top' },
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'line'
                        }
                    },
                    scales: {
                    y: { 
                        beginAtZero: true,  
                        title: { display: true, text: 'Nombre de dossier (s)' } 
                    },
                    x: { 
                        title: { display: true, text: 'Réceptionnistes' } 
                    }
                    }
                }}
                />
            </div>
            </div>

            <div className="col-12 xl:col-12">
                                        <div className="card">
                                            <DataTable
                                                                        ref={dt}
                                                                        value={summarizeData}
                                                                        paginator
                                                                        rows={4}
                                                                        size="small"
                                                                        className="datatable-responsive"
                                                                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                                                        currentPageReportTemplate="Affichage de {first} à {last} des {totalRecords} enregistrement (s)"
                                                                        globalFilter={globalFilter}
                                                                        emptyMessage="Aucune donnée n'a été trouvée"
                                                                        responsiveLayout="scroll"
                                                                        header={header}
                                                                    >
                                                                                <Column field="etablissement" sortable header="Etablissement" body={SBodyTemplate} headerStyle={{ minWidth: '5rem' }} />
                                                                                <Column header="Dossier en Attente" body={decision0BodyTemplate} headerStyle={{ minWidth: '5rem' }} />
                                                                                <Column header="Dossier Acccepté" body={decision1BodyTemplate} headerStyle={{ minWidth: '5rem' }} />
                                                                                <Column header="Dossier Rejeté" body={decision2BodyTemplate} headerStyle={{ minWidth: '5rem' }} />
                                                                                <Column header="Total" body={totalBodyTemplate} headerStyle={{ minWidth: '5rem' }} />
                                                                                <Column header="Opérateur (s)" body={opsBodyTemplate} headerStyle={{ minWidth: '5rem' }} />
                                                                                
                                                                                
                                                                                
                                            </DataTable>
                                        </div>
            </div>
        </div> 

    )}


    </>


    );
};

export default Dashboard;