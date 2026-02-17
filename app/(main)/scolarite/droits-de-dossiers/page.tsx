'use client';

import React, { useContext, useEffect, useRef, useState } from 'react';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { FileService } from '@/demo/service/FileService';
import axiosInstance2 from '@/app/api/axiosInstance2';
import { Document, Page, pdfjs } from 'react-pdf';
import { CandidatDTO, CandidatureService } from '@/demo/service/CandidatureService';
import { UserContext } from '@/app/userContext';
import { dt } from '@fullcalendar/core/internal-common';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { GrView } from 'react-icons/gr';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { FileUpload } from 'primereact/fileupload';
import dynamic from 'next/dynamic';

//pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs"

const PdfViewer = dynamic(() => import('../../pdfViewer'), {
    ssr: false // Désactive le rendu côté serveur pour ce composant
});

const UploadPdf = () => {
    const { user } = useContext(UserContext);

    const [file, setFile] = useState(null);
    const [fileId, setFileId] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [prog, setOneProg] = useState<{ edition?: number } | null>(null);
    const [reloadTrigger, setReloadTrigger] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [recuDialog, setRecuDialog] = useState(false);
    const [recuDialog2, setRecuDialog2] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const dt = useRef(null);
    const [errorMessage, setErrorMessage] = useState('');
    const toast = useRef(null);

    const [pixs, setPixsData] = useState([]);

    useEffect(() => {
        CandidatureService.getLastProg().then((response) => {
            //console.log("📦 Séries chargées :", data);
            setOneProg(response);
        });
    }, []);

    useEffect(() => {
        if (user?.acteur?.etablissement?.id && prog?.edition) {
            loadFiles();
        }
    }, [reloadTrigger, user, prog]);

    const loadFiles = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await CandidatureService.filterEtatsVersements_(user?.acteur?.etablissement?.id, prog?.edition).then((response) => {
                setPixsData(response);
            });
            console.log('OK', response);
            //setCandidatData(response);
        } catch (err) {
            console.error('❌ Erreur chargement files :', err);
            setError('Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    // useEffect(() => {
    //       if (user?.acteur?.etablissement?.id) {
    //           FileService.getFiles(user?.acteur?.etablissement?.id).then((response) => {
    //               setPixsData(response);
    //           });
    //       }
    //   }, [user]);

    useEffect(() => {
        if (fileUrl) {
            console.log('fileUrl chargé :', fileUrl);
        }
    }, [fileUrl]);

    //const handleFileChange = (e) => setFile(e.target.files[0]);

    const handleFileChange = (e) => {
        const fileOK = e.files?.[0];
        if (fileOK) {
            if (fileOK.size > 5242880) {
                console.log('OK');
                setErrorMessage('❌ Le fichier dépasse la taille maximale autorisée de 5 Mo.');
                setFile(null);
            } else {
                setFile(fileOK);
                setErrorMessage('');
            }
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setErrorMessage("⚠️ Veuillez d'abord charger un fichier PDF valide.");
            return;
        } else {
            let code = 1;
            await FileService.uploadFile(file, Number(prog?.edition), user?.acteur?.etablissement?.id, code);
            toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Fichier chargé avec succès', life: 4000 });
            setRecuDialog2(false);
            await loadFiles();
        }
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

    const codeBodyTemplate = (rowData) => {
        const hasData =
        Number(rowData?.count_5000 ?? 0) > 0 ||
        Number(rowData?.count_1000_EF ?? 0) > 0;
        return (
            <>
                <span className="p-column-title">id</span>
                {rowData.id}
                <br />
                {!hasData ? (
                    <span className="font-semibold text-blue-600"><b>🔄 EN COURS DE TRAITEMENT PAR OB</b></span>
                ) : (
                    <span className="font-semibold text-green-600"><b>✅ VIGNETTES ATTRIBUEÉS PAR OB</b></span>
                )}

            </>
        );
    };

    const sessionBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">sesssion</span>
                <b>{rowData.session}</b>
            </>
        );
    };

    const dateBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">date</span>
                {formatDate(rowData.date_deposit)}
            </>
        );
    };

    const v5000 = (rowData) => {
        return (
            <>
                <span className="p-column-title">v5000</span>
                <span
                    className="rounded-full px-3 py-1 bg-yellow-100 text-black"
                >
                    <b>{rowData.count_5000}</b>
                </span>
            </>
        );
    };


    const v1000 = (rowData) => {
        return (
            <>
                <span className="p-column-title">v1000</span>
                <span
                    className="rounded-full px-3 py-1 bg-yellow-100 text-black"
                ><b>{rowData.count_1000_EF}</b></span>
                
            </>
        );
    };

    const actionBodyTemplate = (rowData) => {
        const hasData =
        Number(rowData?.count_5000 ?? 0) > 0 ||
        Number(rowData?.count_1000_EF ?? 0) > 0;
        return (
            <>
                <Button
                    icon="pi pi-eye"
                    rounded
                    tooltip="Ouvrir le reçu"
                    tooltipOptions={{ position: 'bottom' }}
                    severity="info"
                    className="mr-2"
                    onClick={() => editProduct(rowData)}
                />

                {!hasData && (
                <Button
                    icon="pi pi-trash"
                    rounded
                    tooltip="Supprimer le fichier"
                    tooltipOptions={{ position: 'bottom' }}
                    severity="danger"
                    className="mr-2"
                    onClick={() => editProduct2(rowData)}
                />
                )}
            </>
        );
    };

    const editProduct = async (rowData) => {
        setRecuDialog(true);
        //console.log(rowData)
        if (rowData.file_id) {
            setFileId(rowData.file_id);
            const response = await FileService.getViewUrl(rowData.file_id);
            if (response) {
                console.log('URL PDF:', response); // <---- ici
                setFileUrl(response);
                setRecuDialog(true);
            }
        }
    };

    const editProduct2 = async (rowData) => 
    {
        try 
        {
            if (rowData.file_id) 
            {
                await FileService.deleteFile(rowData.file_id);
            }
        loadFiles();
        toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Fichier supprimé avec succès', life: 4000 });
        } 
            catch (error) 
            {
                    toast.current.show({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Impossible de supprimer le dossier',
                        life: 5000
                    });
            }
    };

    const hideDialog = () => {
        if (recuDialog) {
            setRecuDialog(false);
        }
    };

    const hideDialog2 = () => {
        if (recuDialog2) {
            setRecuDialog2(false);
        }
    };

    const openNew = () => {
        setRecuDialog2(true);
    };

    return (
        <div>
            <Dialog visible={recuDialog} style={{ width: '1000px' }} header="Etat de versement" modal className="p-fluid" onHide={hideDialog}>
                {fileUrl ? <PdfViewer fileUrl={fileUrl} /> : <p>Chargement du PDF...</p>}
            </Dialog>

            <Dialog visible={recuDialog2} style={{ width: '1000px' }} header="Dépôt d'un état de versement des droits d'inscription des candidats au Trésor Public du Sénégal" modal className="p-fluid" onHide={hideDialog2}>
                <div style={{ color: 'red' }}>
                    <span><b>Mention utile 1 :</b> Veuillez remplir et signer l&apos;état de versement des droits d&apos;inscription.</span>
                    <br />
                    <span><b>Mention utile 2 :</b> Agrafez la <em><b>quittance numérique</b></em> délivrée par le Trésor en haut de l&apos;état de versement.</span>
                    <br />
                    <span><b>Mention utile 3 :</b> Veuillez scanner clairement (en couleur) l&apos;état de versement, quittance comprise, puis générez le exclusivement au format PDF.</span>
                    <br />
                    <span><b>Mention utile 4 :</b> La taille du fichier ne doit pas dépasser 5 Mo.</span>
                    <br />
                    <span><b>Mention utile 5 :</b> Chargez-le, puis téléversez-le sur la plateforme.</span>
                    <br />
                    <span><b>Mention utile 6 :</b> Aucun remboursement ne sera effectué une fois le paiement éffectué et validé par le trésor.</span>
                    <br />
                    <span><b>Mention utile 7 :</b> Malgré le dépôt électronique sur la plateforme, la présentation des documents originaux en version physique sera exigée lors de la réception, <br/> veuillez les garder soigneusement.</span>
                
                </div>
                <div className="col-md-6">
                    <FileUpload mode="basic" accept="application/pdf" customUpload name="pdf" chooseLabel="Charger le PDF généré" onSelect={handleFileChange} className="mr-2 mt-5" />
                    {errorMessage && <div style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</div>}

                    <Button label="Téléverser l'état de versement dans la plateforme" icon="pi pi-upload" className="p-button-success mt-2" onClick={handleUpload} />
                </div>
            </Dialog>

            <div className="grid crud-demo">
                <Toast ref={toast} />
                <div className="col-12">
                    <div className="card">
                        <h5 className="mb-3">Droits d&apos;inscription des candidats : 5 000 FCFA et 1 000 FCFA (pour épreuve facultative) versés au Trésor Public</h5>

                        <div className="flex flex-column md:flex-row md:items-center gap-3 ml-0">
                            <div className="my-2">
                                <Button severity="success" label="Déposer un état de versement" icon="pi pi-plus" className="mr-2" onClick={openNew} />
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <DataTable
                            ref={dt}
                            value={pixs}
                            paginator
                            rows={5}
                            rowsPerPageOptions={[5, 10, 25]}
                            className="datatable-responsive"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Affichage de {first} à {last} des {totalRecords} enregistrement (s)"
                            globalFilter={globalFilter}
                            emptyMessage="Aucun versement n'a été effectué"
                            responsiveLayout="scroll"
                        >
                            <Column field="id" header="Id" sortable body={codeBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                            <Column field="session" header="Session" sortable body={sessionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                            <Column field="date" header="Date du dépôt" sortable body={dateBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                            <Column field="count_5000" header="Vignettes de 5000 FCFA" body={v5000} headerStyle={{ minWidth: '5rem' }}></Column>
                            <Column field="count_1000" header="Vignettes de 1000 FCFA (Epr. Fac.)" body={v1000} headerStyle={{ minWidth: '5rem' }}></Column>
                            <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        </DataTable>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default UploadPdf;
