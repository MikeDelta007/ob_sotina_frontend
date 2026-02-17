'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { SplitButton } from 'primereact/splitbutton';
import { TabView, TabPanel } from 'primereact/tabview';
import { Menu } from 'primereact/menu';
import { CandidatDTO, EtabDTO, GroupedSeriesDTO, ParametrageService } from '@/demo/service/ParametrageService';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toolbar } from 'primereact/toolbar';
import ProtectedRoute from '@/layout/ProtectedRoute';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CandidatureService } from '@/demo/service/CandidatureService';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { FiEdit } from 'react-icons/fi';

const PanelDemo = () => {

    var is_update = useRef(false); // <== valeur persistante entre les appels
    var id_etab = useRef(null);     // <== même chose pour l'ID du candidat
    const toast = useRef(null);

    const [groupedEtabs, setGroupedEtabs] = useState([]);
    const [productDialog, setProductDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [reloadTrigger, setReloadTrigger] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    const [acads, setAca] = useState([]);
    const [deps, setDep] = useState([]);
    const [vils, setVil] = useState([]);
    const [ces, setCE] = useState([]);
    
    const [typeCdtOptions, setTypeCdtOptions] = useState([]);
    const [typeEnsOptions, setTypeEnsOptions] = useState([]);
    const [typeEtabsOptions, setTypeEtabsOptions] = useState([]);

    useEffect(() => {
       ParametrageService.getIAs().then((response) => {
            //console.log("📦 Séries chargées :", data);
            setAca(response);
        });     
    }, []);

    useEffect(() => {
       ParametrageService.getDepartements().then((response) => {
            //console.log("📦 Séries chargées :", data);
            setDep(response);
        });     
    }, []);

    useEffect(() => {
       ParametrageService.getVilles().then((response) => {
            //console.log("📦 Séries chargées :", data);
            setVil(response);
        });     
    }, []);

    useEffect(() => {
       ParametrageService.getCExam().then((response) => {
            //console.log("📦 Séries chargées :", data);
            setCE(response);
        });     
    }, []);

    useEffect(() => {
       ParametrageService.getTypeCdts().then((response) => {
            //console.log("📦 Séries chargées :", data);
            setTypeCdtOptions(response);
        });     
    }, []);

    useEffect(() => {
       ParametrageService.getTypeEns().then((response) => {
            //console.log("📦 Séries chargées :", data);
            setTypeEnsOptions(response);
        });     
    }, []);

    useEffect(() => {
       ParametrageService.getTypeEtabs().then((response) => {
            //console.log("📦 Séries chargées :", data);
            setTypeEtabsOptions(response);
        });     
    }, []); 
    
    useEffect(() => {
        loadData();
    }, []);

    const openNew = () => {
        setSubmitted(false);
        setProductDialog(true);
        // Force a key change each time the dialog opens
        setDialogKey(prevKey => prevKey + 1); // Increment key to force a re-render
        console.log(dialogKey);
    };

    const zones = 
    [
        { name: '1', value: 1 },
        { name: '2', value: 2 },
        { name: '3', value: 3 },
        { name: '4', value: 4 },
        { name: '5', value: 5 }
    ];

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

    const editProduct = (etab) => {
        setProductDialog(true);

        const etabFormatted = {
        ...etab,
        };
        id_etab.current = etab.id,
        console.log(id_etab);
        formik.setValues(etabFormatted);
        is_update.current = true;
        console.log(is_update);
        console.log(etabFormatted);
    };

        const leftToolbarTemplate = () => {
            return (
                <React.Fragment>
                    <div className="my-2">
                        <Button severity="success" label="Ajouter un etablissement" icon="pi pi-plus" className="mr-2" onClick={openNew}/>
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
                                                        tooltip="Modifier les infos de l'etablissement"
                                                        tooltipOptions={{ position: 'bottom' }}
                                                        severity="warning"
                                                        className="mr-2"
                                                        onClick={() => editProduct(rowData)}
                                                    />
                </>
            );
        };

    const hideDialog = () => {
        setSubmitted(false);
        setProductDialog(false);
        console.log(productDialog);
    };

    const categories = [
        { name: "Peut avoir des candidats", key: 'A' },
        { name: "Etablissement avec des acteurs", key: 'B' },
        { name: "Etablissement pouvant servir de Centre d\'Ecrit", key: 'C' },
        { name: "Etablissement avec autres acteurs", key: 'D' }
    ];

    const categories2 = [
        { name: "Etablissement avec candidats", key: 'E' },
        { name: "Etablissement de provenance des acteurs", key: 'F' },
        { name: "Centre d\'Ecrit", key: 'G' },
        { name: "Centre pour autre activité", key: 'H' }
    ];

    const [selectedCategories, setSelectedCategories] = useState([categories[0]]);

    const onCategoryChange = (e) => {
        let _selectedCategories = [...selectedCategories];
        if (e.checked)
            _selectedCategories.push(e.value);
        else
            _selectedCategories = _selectedCategories.filter(category => category.key !== e.value.key);

        setSelectedCategories(_selectedCategories);
        console.log(selectedCategories);
    };

    const [selectedCategories_, setSelectedCategories_] = useState([categories2[0]]);

    const onCategoryChange_ = (e) => {
        let _selectedCategories0 = [...selectedCategories_];

        if (e.checked)
            _selectedCategories0.push(e.value);
        else
            _selectedCategories0 = _selectedCategories0.filter(category => category.key !== e.value.key);

        setSelectedCategories_(_selectedCategories0);
    };

    const [dialogKey, setDialogKey] = React.useState(0);

    // console.log(selectedCategories);
    // console.log(selectedCategories_);

    useEffect(() => {
    // Exécution de l'effet uniquement si productDialog change
        console.log('Dialog ouvert ou fermé');
    }, [productDialog]); // L'effet ne se déclenche que si productDialog change


    const formik = useFormik({
                initialValues: {
                    code : '',
                    name : '',
                    typeCandidat : null,
                    typeEnseignement : null,
                    typeEtablissement : null,
                    zone : 0,
                    inspectionAcademie : null,
                    departement : null,
                    centreExamen : null,
                    ville : null,
                    capacity : 0,
                    nb_of_jury : 0,
                    capacity_eps : 0,
                    nb_act_sur_site : 0,
                    peut_avoir_candidats : false,
                    etab_avec_acteurs : false,
                    etab_pouvant_servir_CE : false,
                    etab_avec_autres_acteurs : false,
                    etab_avec_candidats : false,
                    etab_de_provenance_acteurs : false,
                    CE : false,
                    centre_pour_autres_activites : false
                },
    
                validationSchema: Yup.object({
                code : Yup.string().nullable().required('Champ requis'),
                name : Yup.string().required('Champ requis'),
                typeCandidat : Yup.object().required('Champ requis'),
                typeEnseignement : Yup.object().nullable().required('Champ requis'),
                typeEtablissement : Yup.object().required('Champ requis'),

                zone : Yup.number().required('Champ requis'),
                inspectionAcademie : Yup.object().required('Champ requis'),
                departement : Yup.object().required('Champ requis'),
                centreExamen : Yup.object().required('Champ requis'),
                ville : Yup.object().required('Champ requis'),
                capacity: Yup.number().min(0, "Impossible").required("Champ requis"),
                nb_of_jury : Yup.number().min(0, "Impossible").required("Champ requis"),
                capacity_eps : Yup.number().min(0, "Impossible").required("Champ requis"),
                nb_act_sur_site: Yup.number().min(0, "Impossible").required("Champ requis")

            }),
    
            onSubmit: async (values, { setSubmitting, resetForm }) => {
            console.log("cliquer...")
    
            // Construire dynamiquement la liste des matières choisies
            // const selectedOptions = [
            //     values.matiere1?.name,
            //     values.matiere2?.name,
            //     values.matiere3?.name
            // ].filter(m => m !== null);
    
            // console.log(selectedOptions);
            
            const etabDTO : EtabDTO = {
                code : values.code,
                name : values.name,
                type_cdts : values.typeCandidat,
                type_ens : values.typeEnseignement, // Assure-toi qu'il est bien au format 'yyyy-MM-dd'
                type_etab : values.typeEtablissement,
                zone : values.zone,
                insp_aca : values.inspectionAcademie,
                dep : values.departement,
                centre_exam : values.centreExamen,
                ville : values.ville,
                capacity: values.capacity,
                nb_of_jury: values.nb_of_jury,
                capacity_eps: values.capacity_eps,
                nb_act_sur_site: values.nb_act_sur_site
            };
    
                try 
                {
                    console.log(is_update);

                    if (is_update.current === false)
                    {
                        console.log("POST");

                        const response = await ParametrageService.createEtab(etabDTO);
                        console.log('✅ Donnée créée :', response.data);
                        setMessage('Donnée créée avec succès');
                        toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Etablissement créé avec succès', life: 4000 });
                        resetForm();
                    }
                    if (is_update.current === true)
                    {
                        console.log("PUT");
                        const response = await ParametrageService.updateEtab(id_etab, etabDTO);
                        console.log('✅ Donnée mise à jour avec succès :', response.data);
                        setMessage('Donnée mise à jour avec succès');
                        toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Etablissement mis à jour avec succès', life: 4000 });
                        resetForm();
                        is_update.current = false
                    }
                    await loadData();
    
                } 
                catch (error) 
                {
                    console.error('❌ Erreur lors de la création du candidat:', error);
                    setMessage('Erreur lors de la création du candidat');
                    toast.current.show({ severity: 'error', summary: 'Office du Bac', detail: 'Erreur lors de la création du candidat', life: 4000 });
                    
                } finally 
                {
                    setSubmitting(false);
                }
                setSubmitted(false);
                setProductDialog(false);
            }
        });

        const loadData = async () => {
                setLoading(true);
                setError(null);
                try 
                {
                    ParametrageService.getEtabsByIA()
                    .then((response) => {
                        const result = Object.entries(response || {}).map(([filiereName, series]) => ({
                            filiereName,
                            series,
                        }));
                        
                        console.log("📦 Séries chargées :", result);

                        setGroupedEtabs(result);
                    })
                    .catch((error) => {
                        console.error("❌ Erreur lors du chargement des séries :", error);
                    });
                } 
                catch (err) 
                {
                    console.error("❌ Erreur chargement candidats :", err);
                    setError("Erreur lors du chargement");
                } 
                finally 
                {
                    setLoading(false);
                }
            };


    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="grid">
                <div className="col-12 md:col-12">
                    <div className="card">
                        <Toast ref={toast} />
                        <Toolbar className="mb-4" left={leftToolbarTemplate}></Toolbar>

                            <Dialog visible={productDialog} style={{ width: "800px" }} header="Panneau de gestion d'un etablissement" modal className="p-fluid" onHide={hideDialog} key={productDialog ? "open" : "closed"}>
                                 <form onSubmit={(e) => {
                                    e.preventDefault();
                                    console.log('Formik errors:', formik.errors);
                                    formik.handleSubmit(e);
                                    }} className="p-0">
                                    <div className="p-1">
                                    <div className="formgrid grid mt-0">
                                        <div className="field col-2">
                                        <label htmlFor="login">* Code</label>
                                        <InputText
                                            placeholder="Code"
                                            id="code"
                                            name="code"
                                            value={formik.values.code}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            className="p-inputtext-sm w-full"
                                        />
                                        {formik.touched.code && typeof formik.errors.code === 'string' && (
                                            <small className="p-error">{formik.errors.code}</small>
                                        )}
                                        </div>
                                        <div className="field col-6">

                                        </div>
                                        <div className="field col-4">
                                            <Button severity="success" label="Créer un établissement" className="mr-2 mt-3" type="submit" />
                                        </div>
                                    </div>

                                    <div className="formgrid grid">
                                        <div className="field col-9">
                                        <label htmlFor="firstname">* Libellé</label>
                                        <InputText
                                            placeholder="Libellé"
                                            id="name"
                                            name="name"
                                            value={formik.values.name}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            className="p-inputtext-sm w-full"
                                        />
                                        {formik.touched.name && typeof formik.errors.name === 'string' && (
                                            <small className="p-error">{formik.errors.name}</small>
                                        )}
                                        </div>
                                        <div className="field col-3">
                                        <label htmlFor="lastname">* Type candidat présenté</label>
                                        <Dropdown
                                            id="typeCandidat"
                                            name="typeCandidat"
                                            value={formik.values.typeCandidat}
                                            onChange={(e) => formik.setFieldValue("typeCandidat", e.value)}
                                            optionLabel="name"
                                            //optionValue="value"
                                            placeholder="Type candidat présenté"
                                            options={typeCdtOptions}
                                            className="p-inputtext-sm w-full"
                                        />
                                        {formik.touched.typeCandidat && typeof formik.errors.typeCandidat === 'string' && (
                                            <small className="p-error">{formik.errors.typeCandidat}</small>
                                        )}
                                        </div>
                                    </div>

                                    <div className="formgrid grid">
                                        <div className="field col-6">
                                        <label htmlFor="lastname">* Type d`&apos;enseignement</label>
                                        <Dropdown
                                            id="typeEnseignement"
                                            name="typeEnseignement"
                                            value={formik.values.typeEnseignement}
                                            onChange={(e) => formik.setFieldValue("typeEnseignement", e.value)}
                                            optionLabel="name"
                                            //optionValue="value"
                                            placeholder="Type d'enseignement"
                                            options={typeEnsOptions}
                                            className="p-inputtext-sm w-full"
                                        />
                                        {formik.touched.typeEnseignement && typeof formik.errors.typeEnseignement === 'string' && (
                                            <small className="p-error">{formik.errors.typeEnseignement}</small>
                                        )}
                                        </div>
                                        <div className="field col-4">
                                        <label htmlFor="lastname">* Type d`&apos;établissement</label>
                                        <Dropdown
                                            id="typeEtablissement"
                                            name="typeEtablissement"
                                            value={formik.values.typeEtablissement}
                                            onChange={(e) => formik.setFieldValue("typeEtablissement", e.value)}
                                            optionLabel="name"
                                            //optionValue="value"
                                            placeholder="Type d'etablissement"
                                            options={typeEtabsOptions}
                                            className="p-inputtext-sm w-full"
                                        />
                                        {formik.touched.typeEtablissement && typeof formik.errors.typeEtablissement === 'string' && (
                                            <small className="p-error">{formik.errors.typeEtablissement}</small>
                                        )}
                                        </div>
                                        <div className="field col-2">
                                        <label htmlFor="lastname">* Zone</label>
                                        <Dropdown
                                            id="zone"
                                            name="zone"
                                            value={formik.values.zone}
                                            onChange={(e) => formik.setFieldValue("zone", e.value)}
                                            optionLabel="name"
                                            optionValue="value"
                                            placeholder="Zone"
                                            options={zones}
                                            className="p-inputtext-sm w-full"
                                        />
                                        {formik.touched.zone && typeof formik.errors.zone === 'number' && (
                                            <small className="p-error">{formik.errors.zone}</small>
                                        )}
                                        </div>
                                        
                                    </div>

                                    <div className="formgrid grid">
                                        <div className="field col-3">
                                        <label htmlFor="profil">* Académie</label>
                                        <Dropdown
                                            id="inspectionAcademie"
                                            name="inspectionAcademie"
                                            value={formik.values.inspectionAcademie}
                                            onChange={(e) => formik.setFieldValue("inspectionAcademie", e.value)}
                                            optionLabel="name"
                                            //optionValue="value"
                                            placeholder="Académie"
                                            options={acads}
                                            filter
                                            className="p-inputtext-sm w-full"
                                        />
                                        {formik.touched.inspectionAcademie && typeof formik.errors.inspectionAcademie === 'string' && (
                                            <small className="p-error">{formik.errors.inspectionAcademie}</small>
                                        )}
                                        </div>
                                        <div className="field col-3">
                                        <label htmlFor="etablissement">* Département</label>
                                        <Dropdown
                                            id="departement"
                                            name="departement"
                                            value={formik.values.departement}
                                            onChange={(e) => formik.setFieldValue("departement", e.value)}
                                            optionLabel="name"
                                            //optionValue="value"
                                            placeholder="Département"
                                            options={deps}
                                            filter
                                            className="p-inputtext-sm w-full"
                                        />
                                        {formik.touched.departement && typeof formik.errors.departement === 'string' && (
                                            <small className="p-error">{formik.errors.departement}</small>
                                        )}
                                        </div>
                                        <div className="field col-3">
                                        <label htmlFor="etablissement">* Centre d`&apos;examen</label>
                                        <Dropdown
                                            id="centreExamen"
                                            name="centreExamen"
                                            value={formik.values.centreExamen}
                                            onChange={(e) => formik.setFieldValue("centreExamen", e.value)}
                                            optionLabel="name"
                                            //optionValue="value"
                                            placeholder="Centre d'examen"
                                            options={ces}
                                            filter
                                            className="p-inputtext-sm w-full"
                                        />
                                        {formik.touched.centreExamen && typeof formik.errors.centreExamen === 'string' && (
                                            <small className="p-error">{formik.errors.centreExamen}</small>
                                        )}
                                        </div>
                                        <div className="field col-3">
                                        <label htmlFor="etablissement">* Ville</label>
                                        <Dropdown
                                            id="ville"
                                            name="ville"
                                            value={formik.values.ville}
                                            onChange={(e) => formik.setFieldValue("ville", e.value)}
                                            optionLabel="name"
                                            //optionValue="value"
                                            placeholder="Ville"
                                            options={vils}
                                            filter
                                            className="p-inputtext-sm w-full"
                                        />
                                        {formik.touched.ville && typeof formik.errors.ville === 'string' && (
                                            <small className="p-error">{formik.errors.ville}</small>
                                        )}
                                        </div>
                                    </div>

                                    
                                        <div className="formgrid grid">
                                        <div className="field col-3">
                                            <label htmlFor="password">* Capacité Accueil</label>
                                            <InputNumber
                                                placeholder="Capacité Accueil"
                                                id="capacity"
                                                name="capacity"
                                                //type="number"
                                                value={formik.values.capacity}
                                                onValueChange={(e) => formik.setFieldValue("capacity", e.value)}
                                                className="p-inputtext-sm w-full"
                                                min={0}
                                            />
                                            {formik.touched.capacity && typeof formik.errors.capacity === 'number' && (
                                                <small className="p-error">{formik.errors.capacity}</small>
                                            )}
                                        </div>
                                        <div className="field col-3">
                                            <label htmlFor="confirmPassword">* Nb. Jury à l`&apos;écrit</label>
                                            <InputNumber
                                                placeholder="Nombre de jury"
                                                id="nb_of_jury"
                                                name="nb_of_jury"
                                                //type="number"
                                                value={formik.values.nb_of_jury}
                                                onValueChange={(e) => formik.setFieldValue("nb_of_jury", e.value)}
                                                className="p-inputtext-sm w-full"
                                                min={0}
                                            />
                                            {formik.touched.nb_of_jury && typeof formik.errors.nb_of_jury === 'number' && (
                                                <small className="p-error">{formik.errors.nb_of_jury}</small>
                                            )}
                                        </div>
                                        <div className="field col-3">
                                            <label htmlFor="confirmPassword">* Capacité Accueil EPS</label>
                                            <InputNumber
                                                placeholder="Capacité Accueil EPS"
                                                id="capacity_eps"
                                                name="capacity_eps"
                                                //type="number"
                                                value={formik.values.capacity_eps}
                                                onValueChange={(e) => formik.setFieldValue("capacity_eps", e.value)}
                                                className="p-inputtext-sm w-full"
                                                min={0}
                                            />
                                            {formik.touched.capacity_eps && typeof formik.errors.capacity_eps === 'number' && (
                                                <small className="p-error">{formik.errors.capacity_eps}</small>
                                            )}
                                        </div>
                                        <div className="field col-3">
                                            <label htmlFor="confirmPassword3">* Nb. Acteur Sur site</label>
                                            <InputNumber
                                                placeholder="Nb. Acteur Sur site"
                                                id="nb_act_sur_site"
                                                name="nb_act_sur_site"
                                                //type="number"
                                                value={formik.values.nb_act_sur_site}
                                                onValueChange={(e) => formik.setFieldValue("nb_act_sur_site", e.value)}
                                                className="p-inputtext-sm w-full"
                                                min={0}
                                            />
                                            {formik.touched.nb_act_sur_site && typeof formik.errors.nb_act_sur_site === 'number' && (
                                                <small className="p-error">{formik.errors.nb_act_sur_site}</small>
                                            )}
                                        </div>
                                        </div>
                                        <div key={dialogKey}>
                                        <div className="card flex justify-content-center">
                                            <div className="flex flex-column" style={{ width: '50%' }}>
                                                {categories.map((category) => {
                                                    return (
                                                        <div key={category.key} className="flex align-items-center">
                                                            <Checkbox inputId={category.key} name="category" value={category} onChange={onCategoryChange} checked={selectedCategories.some((item) => item.key === category.key)} />
                                                            <label htmlFor={category.key} className="ml-2">
                                                                {category.name}
                                                            </label>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="flex flex-column" style={{ width: '50%' }}>
                                                {categories2.map((category) => {
                                                    return (
                                                        <div key={category.key} className="flex align-items-center">
                                                            <Checkbox inputId={category.key} name="category" value={category} onChange={onCategoryChange_} checked={selectedCategories_.some((item) => item.key === category.key)} />
                                                            <label htmlFor={category.key} className="ml-2">
                                                                {category.name}
                                                            </label>
                                                        </div>
                                                    );
                                                })}
                                            </div>            
                                        </div>
                                        </div>

                                    
                                    </div>
                                </form>
                            </Dialog>
                        
                        <h5>Listing des établissements du Sénégal par académie</h5>
                        <Accordion multiple activeIndex={0}>
                            {groupedEtabs && groupedEtabs.length > 0 ? (
                                groupedEtabs.map((group) => (
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
                                    <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} />
                                    </DataTable>
                                </AccordionTab>
                                ))
                            ) : (
                                <AccordionTab header="Chargement">
                                <p className="text-gray-500 italic">Aucun établissement disponible ou chargement en cours...</p>
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