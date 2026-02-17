'use client';

declare global {
  interface Window {
    sendPaymentInfos: (
      orderNumber: string,
      amount: string,
      phoneNumber: string,
      countryCode: string,
      secureCode: string,
      agencyCode: string,
      currency: string,
      description: string,
      successUrl: string,
      failureUrl: string,
      cancelUrl: string,
      logoUrl: string
    ) => void;
  }
}

import React, { useContext, useEffect, useRef, useState } from 'react';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { FileService } from '@/demo/service/FileService';
import axiosInstance2 from '@/app/api/axiosInstance2';
import { Document, Page, pdfjs } from 'react-pdf';
import { AutorisationReception, CandidatDTO, CandidatureService } from '@/demo/service/CandidatureService';
import { UserContext } from '@/app/userContext';
import { dt } from '@fullcalendar/core/internal-common';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { FileUpload } from 'primereact/fileupload';
import axios from 'axios';
import axiosInstance from '@/app/api/axiosInstance';
import dynamic from 'next/dynamic';
import { Dropdown } from 'primereact/dropdown';
import { InputMask } from 'primereact/inputmask';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { useFormik } from 'formik';
import * as Yup from 'yup';

//pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs"

const PdfViewer = dynamic(() => import('../../pdfViewer'), {
  ssr: false,  // Désactive le rendu côté serveur pour ce composant
});

const UploadPdf = () => {
  const { user } = useContext(UserContext);

  const [file, setFile] = useState(null);
  const [fileId, setFileId] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [paids, setPaids] = useState(null);
  const [prog, setOneProg] = useState<{ edition?: number } | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recuDialog, setRecuDialog] = useState(false);
  const [recuDialog2, setRecuDialog2] = useState(false);
  const [globalFilter, setGlobalFilter] = useState(null);
  const dt = useRef(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [ddis, setDdisData] = useState([]);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const toast = useRef(null);
  

  useEffect(() => {
    CandidatureService.getLastProg().then((response) => {
      //console.log("📦 Séries chargées :", data);
      setOneProg(response);
    });
  }, []);

  //Charger le script du widget InTouch
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://touchpay.gutouch.net/touchpayv2/script/touchpaynr/prod_touchpay-0.0.1.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);



  const handlePay = async () => {
    setRecuDialog(true);
  }

  useEffect(() => {
  const loadDroitsInscription = async () => {
          setLoading(true);
          setError(null);
          try 
          {
              const response = await CandidatureService.getDIByEtab(user?.acteur?.etablissement?.code, Number(prog?.edition));
              console.log("DROITS INSCRIPTION", response);
              setDdisData(response);
          } 
          catch (err) 
          {
              console.error("❌ Erreur chargement files :", err);
              setError("Erreur lors du chargement");
          } 
          finally 
          {
              setLoading(false);
          }
  };

      if (user?.acteur?.etablissement?.id, Number(prog?.edition)) {
            loadDroitsInscription();
        }
  }, [reloadTrigger, user, prog]);

      

  //const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleFileChange = (e) => 
    {
        const fileOK = e.files?.[0];
         if (fileOK) {
            if (fileOK.size > 5242880) {
                console.log("OK");
                setErrorMessage("❌ Le fichier dépasse la taille maximale autorisée de 5 Mo.");
                setFile(null);
            } else {
                setFile(fileOK);
                setErrorMessage('');
            }
        }
    };



  const handleUpload = async () => 
  {
    if (!file) 
    {
            setErrorMessage("⚠️ Veuillez d'abord charger un fichier PDF valide.");
            return;
    }
    else
    {
      let code = 1;
      await FileService.uploadFile(file, Number(prog?.edition), user?.acteur?.etablissement?.id, code);
    }  
  };

  const sessionBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">sesssion</span>
                {rowData.session}
            </>
        );
  };

const formatDate = (dateString: string) => {
    if (!dateString) return "-"; // sécurité si null ou vide
    const date = new Date(dateString.replace(" ", "T")); // corrige les formats "yyyy-mm-dd hh:mm:ss"
    
    if (isNaN(date.getTime())) return "Date invalide";

    return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }) + " " + date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

  const dateVBodyTemplate = (rowData) => {
      return (
          <span>{formatDate(rowData.dateTransaction)}</span>
      );
  };

  const callBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">phone</span>
                {rowData.phoneNumber}
            </>
        );
  };

  const numbCBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">numbC</span>
                {rowData.nbCdtsInscrits}
            </>
        );
  };

  const somVBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">somV</span>
                {rowData.montantVerser}
            </>
        );
  };

const statutVBodyTemplate = (rowData) => {
    return (
        <>
            <span className="p-column-title">paid</span>
          <span
            className={`font-semibold ${
              rowData.paid ? "text-green-600" : "text-red-600"
            }`}
          >
            <b>{rowData.paid ? "✅ PAYÉ" : "❌ IMPAYÉ"}</b>
          </span>

        </>
    );
};

 

    const hideDialog = () => {
        if (recuDialog)
        {
            setRecuDialog(false);
        }
        
    };

    const hideDialog2 = () => {
        if (recuDialog2)
        {
            setRecuDialog2(false);
        }
        
    };

    const openNew = () => {
      setRecuDialog2(true);
    };

    const formik = useFormik({
                initialValues: {
                    nbCdtsInscrits: 0, // RENDRE DYNAMIQUE
                    montantAVerser: 0, // IL FAUDRA FAIRE LE CALCUL AVANT PROD (5 x 1000)
                    phoneNumber: "",
                    montantVerser: 0, // RENDRE DYNAMIQUE
                },
    
                validationSchema: Yup.object({
                nbCdtsInscrits: Yup.number()
                .required('Champ requis')
                .moreThan(0, 'Le nombre doit être supérieur à 0'),
                phoneNumber : Yup.string().required('Champ requis'),
                
            }),
    
            onSubmit: async (values, { setSubmitting, resetForm }) => {
         
            try 
                {
                const session = Number(prog?.edition);
                const etab_code = user?.acteur?.etablissement?.code;

                try {
                  const res = await axiosInstance.post(
                    `/payment-FAEB3/createPayment/${etab_code}/${session}`,
                    {
                      nbCdtsInscrits: values.nbCdtsInscrits, // RENDRE DYNAMIQUE
                      montantAVerser: values.nbCdtsInscrits * 1000, // IL FAUDRA FAIRE LE CALCUL AVANT PROD (5 x 1000)
                      phoneNumber: values.phoneNumber,
                      montantVerser: values.nbCdtsInscrits * 1000, // RENDRE DYNAMIQUE
                    }
                  );


                  //toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Dossiers de candidatures autorisés à la réception avec succès', life: 4000 });
                  const { orderNumber, amount, phoneNumber } = res.data;

                  // // Ouvre la nouvelle fenêtre AVANT toute écriture
                  const newWin = window.open("", "_blank", "width=500,height=700");

                  if (!newWin) {
                    alert("Veuillez autoriser les popups pour ce site.");
                    return;
                  }

                  // Écrit tout le HTML d'un coup
                  newWin.document.open();
                  newWin.document.write(`
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <title>Paiement</title>
                      </head>
                      <body>
                        <div id="touchpay-container"></div>

                        <script src="https://touchpay.gutouch.net/touchpayv2/script/touchpaynr/prod_touchpay-0.0.1.js"></script>
                        <script>
                          window.onload = function() {
                            if (typeof window.sendPaymentInfos !== "function") {
                              alert("Le widget de paiement n'a pas pu être chargé.");
                              return;
                            }

                            window.sendPaymentInfos(
                              "${orderNumber}",
                              "ODB26571",
                              "cBbFbOecN700AnZX6SvSJoYAhVOBusnStLx90ULZ6jaNi6ZD0C",
                              "odb.sn",
                              "https://portailbac.ucad.sn/scolarite/droits-dossier-1000",
                              "https://portailbac.ucad.sn/scolarite/droits-dossier-1000",
                              "${amount}",
                              "Dakar",
                              "",
                              "",
                              "",
                              "${phoneNumber}"
                            );
                          };
                        </script>
                      </body>
                    </html>
                  `);
                  newWin.document.close();
                  setRecuDialog(false);
                } catch (error) {
                  toast.current.show({
                    severity: "error",
                    summary: "Office du Bac",
                    detail: "Erreur lors du paiement",
                    life: 4000
                  });
                  console.error("❌ Erreur de paiement", error);
                }
    
                } 
                catch (error) 
                {
                    console.error('❌ Erreur :', error);
                    
                    toast.current.show({ severity: 'error', summary: 'Office du Bac', detail: 'Erreur lors de l\'autorisation', life: 4000 });
                    
                } 
                finally 
                {
                    setSubmitting(false);
                }
               
            }
        });



  return (
    <div>
     

      <Dialog visible={recuDialog} header="Versement des droits d'inscription à l'office du BAC" modal className="p-fluid" onHide={hideDialog} contentStyle={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ color: 'red' }}>
        <span><b>Mention utile 1 :</b> Cette opération étant cruciale, veuillez vous assurer de disposer d&apos;une connexion Internet stable et de bonne qualité.</span>
        <br />
        <span><b>Mention utile 2 :</b> Avant d&apos;enclencher le processus de paiement veuillez obligatoirement détenir le montant à verser dans votre compte.</span>
        <br />
        <span><b>Mention utile 3 :</b> Aucun frais ne sera déduit des paiements.</span>
        <br />
        <span><b>Mention utile 4 :</b> Aucun remboursement ne sera effectué une fois le paiement validé.</span>
        <br />
        <span><b>Mention utile 5 :</b> Pour garder un justificatif du paiement, veuillez préciser votre email lors du paiement.</span>
        <br />
        </div>
        <br />
        <form onSubmit={(e) => {
                                e.preventDefault();
                                console.log('Formik errors:', formik.errors);
                                formik.handleSubmit(e);
                            }}>
            <div className="formgrid grid">
                                        <div className="field col-4">
                                            <label htmlFor="price">* Numéro de téléphone</label>
                                            <InputMask
                                                id="phoneNumber"
                                                name="phoneNumber"
                                                mask="999999999"
                                                placeholder="Numéro de téléphone du Sénégal"
                                                value={formik.values.phoneNumber}
                                                onChange={(e) => formik.setFieldValue('phoneNumber', e.value)}
                                                onBlur={formik.handleBlur}
                                                className={`p-inputtext-sm w-full ${formik.touched.phoneNumber && formik.errors.phoneNumber ? 'p-invalid' : ''}`}
                                                />
                                                {formik.touched.phoneNumber && typeof formik.errors.phoneNumber === 'string' && (
                                                <small className="p-error">{formik.errors.phoneNumber}</small>
                                                )}
                                        </div>
                                        
                                        <div className="field col-3">
                                            <label htmlFor="quantity">* Nombre de candidats</label>
                                            <InputNumber placeholder="Fournir le nombre de candidats" 
                                                id="nbCdtsInscrits"
                                                name="nbCdtsInscrits"
                                                min={1}
                                                value={formik.values.nbCdtsInscrits}
                                                onChange={(e) => formik.setFieldValue('nbCdtsInscrits', e.value)}
                                                onBlur={formik.handleBlur}
                                                mode="decimal"
                                                useGrouping={true} 
                                                locale="fr-FR"
                                                className={`p-inputtext-sm w-full ${formik.touched.nbCdtsInscrits && formik.errors.nbCdtsInscrits ? 'p-invalid' : ''}`}
                                                />
                                                {formik.touched.nbCdtsInscrits && typeof formik.errors.nbCdtsInscrits === 'number' && (
                                                  <small className="p-error">{formik.errors.nbCdtsInscrits}</small>
                                                )}
                                        
                                        </div>
                                        <div className="field col-4">
                                            <label htmlFor="quantity">* Somme à verser</label><br />
                                            <span className="font-bold text-green-600 text-3xl">
                                                {((formik.values.nbCdtsInscrits || 0) * 1000).toLocaleString('fr-FR')} FCFA
                                            </span>
                                        </div>
                                         </div> 
            <div className="formgrid grid">
                                        <div className="field mt-0 col-7 py-0">
                                                          <Button severity="success" label="Effectuer le paiement" className="mr-2" type="submit"/>
                                                      </div>
                                                      </div>
           
        </form>
      </Dialog>


      <div className="grid crud-demo">
            <Toast ref={toast} />
            <div className="col-12">
                <div className="card">
                    
                    <h5 className="mb-3">Droits de dossier à 1000 FCFA (paiement par Wave, Orange Money ou Free Money) destiné à l&apos;Office du Bac</h5>

                    <div className="flex flex-column md:flex-row md:items-center gap-3 ml-0">
                        <div className="my-2">
                          <Button severity="success" label="Effectuer un versement" icon="pi pi-plus" className="mr-2" onClick={handlePay}/>
                          </div>
                    </div>
                </div>
                <div className="card">              

                              <DataTable
                                  ref={dt}
                                  value={ddis}
                                  paginator
                                  rows={10}
                                  rowsPerPageOptions={[10, 20]}
                                  className="datatable-responsive"
                                  paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                  currentPageReportTemplate="Affichage de {first} à {last} des {totalRecords} enregistrement (s)"
                                  globalFilter={globalFilter}
                                  emptyMessage="Aucune transaction n'a été trouvée"
                                  
                                  responsiveLayout="scroll"
                              >
                                  <Column field="session" header="Session" sortable body={sessionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                                  <Column field="date" header="Date transaction" sortable body={dateVBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                                  <Column field="phone" header="Téléphone" sortable body={callBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                                  <Column field="numbC" header="Nombre" sortable body={numbCBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                                  <Column field="somV" header="Somme versée" body={somVBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                                  <Column field="paid" header="Statut" body={statutVBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                              </DataTable>
                </div>
              </div>
            </div>
    </div>

    

    
    
  );
}
export default UploadPdf;