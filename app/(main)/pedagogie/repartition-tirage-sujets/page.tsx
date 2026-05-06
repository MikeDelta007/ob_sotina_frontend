'use client';

import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Rating } from 'primereact/rating';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Demo } from '@/types';
import { ProductService } from '@/demo/service/ProductService';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { Calendar } from 'primereact/calendar';
import { Carousel } from 'primereact/carousel';
import { ActeurDTO, ParametrageService, ProfilDTO, ProgrammationDTO, SujetDTO, UserDTO } from '@/demo/service/ParametrageService';
import * as Yup from 'yup';
import { saveAs } from 'file-saver';

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
import { data } from 'react-router-dom';
import { CandidatureService } from '@/demo/service/CandidatureService';

type Repartition = {
    jury: number;
    centreEcrit: string;
    session: number;
    effectif: number;
    matieres?: Record<string, number>;
};

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

const CalendarDemo = () => {
    const [is_update, setIsUpdate] = useState(false); // <== valeur persistante entre les appels
    var id_acces = useRef(null); // <== même chose pour l'ID du candidat
    const [email, setEmail] = useState('');
    const [id_user, setIdUser] = useState('');
    const [getResultDialog, setGetResultDialog] = useState(false);
    const [resultImport, setResultImport] = useState(false);
    const [is_go_by_smtp, setIsGoBySmtp] = useState(false); // <== valeur persistante entre les appels
    const [groupedUsers, setGroupedUsers] = useState([]);
    const { user } = useContext(UserContext);
    const [data, setData] = useState<Repartition[]>([]);

    let emptyProduct: Demo.Product = {
        id: null,
        name: '',
        image: null,
        description: '',
        category: null,
        price: 0,
        quantity: 0,
        rating: 0,
        inventoryStatus: 'INSTOCK'
    };

    const [products, setProducts] = useState(null);
    const [productDialog, setProductDialog] = useState(false);
    const [productDialog2, setProductDialog2] = useState(false);
    const [productDialog3, setProductDialog3] = useState(false);
    const [codifDialog, setCodifDialog] = useState(false);
    const [deleteProductDialog, setDeleteProductDialog] = useState(false);
    const [supprimerDialog, setSupprimerDialog] = useState(false);
    const [desactiveAccessDialog, setDesactiveAccessDialog] = useState(false);
    const [deleteProductsDialog, setDeleteProductsDialog] = useState(false);
    const [product, setProduct] = useState(emptyProduct);
    const [selectedProducts, setSelectedProducts] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const [file, setFile] = useState(null);
    const [fileId, setFileId] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);

    const [dialogVisible, setDialogVisible] = useState(false);

    const [dialogVisible_, setDialogVisible_] = useState(false);

    const [session, setSession] = useState(2024);
    const [resultat, setResultat] = useState([]);
    const [resultat_, setResultat_] = useState([]);
    const [resultat__, setResultat__] = useState([]);

    const [users, setUsers] = useState([]);

    const [etabs, setEtabs] = useState([]);

    const [infosUsers, setInfosUsers] = useState(null);

    const [errorMessage, setErrorMessage] = useState('');

    const [exporting, setExporting] = useState(false);
    const [exportStep, setExportStep] = useState('');
    const [seconds, setSeconds] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const [regles, setRegles] = useState<RegleMatiere[]>([]);
    const [regle, setRegle] = useState('');
    const [groupe, setGroupe] = useState('');

    const profilsOptions = [
        { label: 'ADMIN', value: 'ADMIN' },
        { label: 'AGENT DE SAISIE', value: 'AGENT_DE_SAISIE' },
        // { label: 'CHEF D\'ETABLISSEMENT', value: 'CHEF_ETABLISSEMENT' },
        // { label: 'PLANIFICATION', value: 'PLANIFICATION' },
        //{ label: 'PEDAGOGIE', value: 'PEDAGOGIE' },
        { label: 'SCOLARITE', value: 'SCOLARITE' },
        { label: 'VIGNETTES ET COUPONS', value: 'VIGNETTES_COUPONS' },
        { label: 'AUTORISATION RECEPTION', value: 'AUTORISATION_RECEPTION' },
        { label: 'RECEPTIONNISTE', value: 'RECEPTIONNISTE' }
        //{ label: 'STATISTIQUES', value: 'STATISTIQUES' }
    ];

    useEffect(() => {
        ProductService.getProducts().then((data) => setProducts(data));
    }, []);

    useEffect(() => {
        loadData();
        loadData2()
    }, []);

    useEffect(() => {
        ParametrageService.getEtablissements().then((response) => {
            setEtabs(response);
        });
    }, []);

    useEffect(() => {}, [is_update]);

    useEffect(() => {
        ParametrageService.getInfoUsers().then((response) => {
            setInfosUsers(response);
        });
    }, []);

    useEffect(() => {
        if (exporting) {
            setSeconds(0);
            timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [exporting]);

    

    const hideDialog = () => {
        setSubmitted(false);
        setProductDialog(false);
    };

    const typeOptions = [
        { label: '1er Groupe', value: '1ER' },
        { label: '2nd Groupe', value: '2ND' }
    ];

    const hideDialog2 = () => {
        setSubmitted(false);
        setProductDialog2(false);
        setIsUpdate(false);
        setIsAdmin(false)
    };

    const hideDialog3 = () => {
        setProductDialog3(false);
    };

    const hideDialog4 = () => {
        setCodifDialog(false);
    };

    const hideDeleteProductDialog = () => {
        setDeleteProductDialog(false);
    };

    const hideBatchCreatedDialog = () => {
        setGetResultDialog(false);
        window.location.replace('/pedagogie/gestion-donnees');
    };


    const hideDeleteProductDialog_ = () => {
        setSupprimerDialog(false);
    };

    const hideDeleteProductDialog__ = () => {
        setDesactiveAccessDialog(false);
    };

    const hideDeleteProductsDialog = () => {
        setDeleteProductsDialog(false);
    };

    const saveProduct = () => {
        setSubmitted(true);

        if (product.name.trim()) {
            let _products = [...products];
            let _product = { ...product };
            if (product.id) {
                const index = findIndexById(product.id);

                _products[index] = _product;
                toast.current.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Product Updated',
                    life: 3000
                });
            } else {
                _product.id = createId();
                _product.code = createId();
                _product.image = 'product-placeholder.svg';
                _products.push(_product);
                toast.current.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Product Created',
                    life: 3000
                });
            }

            setProducts(_products);
            setProductDialog(false);
            setProduct(emptyProduct);
        }
    };

    const formatProfil = (profil) => {
        if (!profil) return null;
        // Si c’est déjà un objet complet avec un id, on le retourne tel quel
        if (typeof profil === 'object' && profil.id && profil.name) return profil;
        // Sinon on cherche par nom
        return profil.find((p) => p.name === profil) || null;
    };

    const formatEtab = (etab) => {
        console.log(etab);
        if (!etab) return null;
        // Si c’est déjà un objet complet avec un id, on le retourne tel quel
        if (typeof etab === 'object' && etab.id && etab.name) return etab;
        // Sinon on cherche par nom
        return etab.find((e) => e.name === etab) || null;
    };

    const editProduct = (acces) => {
        if (acces.login === 'ADMIN CENTRAL')
        {
            setIsAdmin(true);
        }
        setProduct({ ...product });
        setProductDialog2(true);
        setIsUpdate(true);
        const accesFormatted = {
            ...acces,
            profil: formatProfil(acces.profil).name,
            etablissement: formatEtab(acces.acteur.etablissement)
        };

        console.log(accesFormatted);
        id_acces.current = acces.id;
        console.log(id_acces);
        formik2.setValues(accesFormatted);
    };


    const generateSimplePassword = () => {
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        const randomLetters = letters.charAt(Math.floor(Math.random() * letters.length)) + letters.charAt(Math.floor(Math.random() * letters.length));

        const randomDigits = String(Math.floor(1000 + Math.random() * 9000)); // 4 chiffres

        return randomLetters + randomDigits;
    };

    const editProduct2 = (acces) => {
        setDeleteProductDialog(true);
        const accesFormatted2 = {
            ...acces,
            password: generateSimplePassword() // ajoute le mot de passe généré
        };
        formik.setValues(accesFormatted2);
        setEmail(accesFormatted2.email);
        console.log(email);
    };

    const editProduct3 = (acces) => {
        setSupprimerDialog(true);
        const accesFormatted3 = {...acces};
        formik.setValues(accesFormatted3);
        setIdUser(accesFormatted3.id);
        console.log(id_user);
    };

    const editProduct4 = (acces) => {
        setDesactiveAccessDialog(true);
        const accesFormatted4 = {...acces};
        formik.setValues(accesFormatted4);
        setIdUser(accesFormatted4.id);
        console.log(id_user);
    };

    const confirmDeleteProduct = (product) => {
        setProduct(product);
        setDeleteProductDialog(true);
    };


    const handleClick = async () => {
        setLoading(true);
        try {
            // 🔹 Étape 1 : doRepCEP
            const data = await ParametrageService.doRepCEP();
            setResultat(data);

            // 🔹 Étape 2 : doRepCS
            const data_ = await ParametrageService.doRepCS();
            setResultat_(data_);

            // 🔹 Étape 3 : fusionRep
            const data__ = await ParametrageService.fusionRep();
            setResultat__(data__);

            // 🔹 Redirection si toutes les étapes ont produit un résultat
            if (data.length && data_.length && data__.length) {
                window.location.replace('/pedagogie/repartition-tirage-sujets');
            }
        } finally {
            setLoading(false);
        }
    };


    const exportAllCandidats = async () => {
    try {
        console.log("Début export...");
        setExporting(true);
        setExportStep('📡 Récupération des données...');

        // 1. Appel API : récupère les données avec le groupe choisi
        const allCandidats = await ParametrageService.getAllDataCP(regle, groupe);

        if (!allCandidats || allCandidats.length === 0) {
            setExportStep('✅ Aucune donnée à exporter');
            setTimeout(() => setExporting(false), 1000);
            return;
        }

        setExportStep('🔄 Préparation des données...');

        // 2. Import dynamique XLSX
        const { utils, write } = await import('xlsx');

        // 3. Transformation des données
        const worksheetData = [];

        // Boucle sur toutes les lignes récupérées
        for (let i = 0; i < allCandidats.length; i++) {
            const row = allCandidats[i];

            // Objet de base avec les infos principales
            let ntTitle = groupe === "1ER" ? "NT 1er Groupe" : groupe === "2ND" ? "NT 2nd Groupe" : "NT";

            let ntValue = groupe === "1ER" ? Math.round(1.05 * row.effectif) : groupe === "2ND" ? Math.round(row.effectif / 2) + 1 : Math.round(row.effectif);

            let data = {
                "Matière": row.matiere,
                "Session": row.session,
                "Jury": row.jury,
                "Centre d'Ecrit": row.centreEcrit,
                "Académie": row.academia,
                "Effectif": Math.round(row.effectif),
                [ntTitle]: ntValue  // Titre dynamique
            };

            worksheetData.push(data);
        }

        setExportStep('💾 Génération du fichier Excel...');

        // 4. Création du workbook
        const worksheet = utils.json_to_sheet(worksheetData);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, `${regle}_${groupe}_GRP`);

        // 5. Génération du fichier
        const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array', compression: true });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `Export_repartition_tirage_${regle}_${groupe}_GROUPE.xlsx`);

        setExportStep('✅ Export terminé avec succès !');
        setTimeout(() => setExporting(false), 1500);

    } catch (error) {
        setExportStep('❌ Erreur lors de l’export');
        setTimeout(() => setExporting(false), 2000);
    }
    };

    const exportAllEtiquettes = async () => {
        try {
            console.log("Début export...");
            setExporting(true);
            setExportStep('📡 Récupération des données...');

            // 1. Appel API : récupère les données avec le groupe choisi
            const allCandidats = await CandidatureService.getEtiquettes(regle, groupe);

            if (!allCandidats || allCandidats.length === 0) {
                setExportStep('✅ Aucune donnée à exporter');
                setTimeout(() => setExporting(false), 1000);
                return;
            }

            setExportStep('🔄 Préparation des données...');

            setExportStep('💾 Génération du fichier Excel...');

            setExportStep('✅ Export terminé avec succès !');
            setTimeout(() => setExporting(false), 1500);

        } catch (error) {
            console.error("❌ Erreur export :", error);
            setExportStep('❌ Erreur lors de l’export');
            setTimeout(() => setExporting(false), 2000);
        }
    };


    const exportAllBLSujet = async () => {
        try {
            console.log("Début export...");
            setExporting(true);
            setExportStep('📡 Récupération des données...');

            // 1. Appel API : récupère les données avec le groupe choisi
            const allCandidats = await CandidatureService.getBLSujets();

            if (!allCandidats || allCandidats.length === 0) {
                setExportStep('✅ Aucune donnée à exporter');
                setTimeout(() => setExporting(false), 1000);
                return;
            }

            setExportStep('🔄 Préparation des données...');

            setExportStep('💾 Génération du bordereau...');

            setExportStep('✅ Export terminé avec succès !');
            setTimeout(() => setExporting(false), 1500);

        } catch (error) {
            console.error("❌ Erreur export :", error);
            setExportStep('❌ Erreur lors de l’export');
            setTimeout(() => setExporting(false), 2000);
        }
    };



    const dialogFooter = (
            <>
                <Button label="Annuler" icon="pi pi-times" outlined onClick={() => setDialogVisible(false)} />
                <Button label="Valider" icon="pi pi-check" onClick={exportAllCandidats} />
            </>
    );

    const dialogFooter_ = (
            <>
                <Button label="Annuler" icon="pi pi-times" outlined onClick={() => setDialogVisible_(false)} />
                <Button label="Valider" icon="pi pi-check" onClick={exportAllEtiquettes} />
            </>
    );


    const deleteProduct = async (values, { setSubmitting, resetForm }) => {
        setDeleteProductDialog(false);
        console.log('PUT');
        console.log(email);

        try {
            const response = await ParametrageService.updatePassword(email);
            console.log('✅ Candidat mis à jour:', response.data);
            setMessage('Candidat créé avec succès');
            toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Mot de passe réinitialisé avec succés', life: 4000 });
            resetForm();
        } catch (error) {
            console.error('❌ Erreur lors de la création du candidat:', error);
            setMessage('Erreur lors de la réinitialisation');
            toast.current.show({ severity: 'error', summary: 'Office du Bac', detail: 'Erreur lors de la réinitialisation', life: 4000 });
        } finally {
            setSubmitting(false);
        }
    };

    const deleteUser = async (values, { setSubmitting, resetForm }) => {
        console.log('DELETE');
        try 
        {
            const response = await ParametrageService.deleteUser(id_user);
            console.log('✅ Candidat mis à jour:', response);
            setMessage('Candidat supprimé avec succès');
            toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Compte supprimé avec succés', life: 4000 });
            resetForm();
        } 
        catch (error) 
        {
            console.error('❌ Erreur lors de la suppression du compte:', error);
            setMessage('Erreur lors de la suppression');
            toast.current.show({ severity: 'error', summary: 'Office du Bac', detail: 'Erreur lors de la suppression', life: 4000 });
        } 
        finally 
        {
            setSubmitting(false);
        }
        await loadData();
        setSupprimerDialog(false);
    };


    const desactiveUser = async (values, { setSubmitting, resetForm }) => {
        console.log('DELETE');
        try 
        {
            const response = await ParametrageService.desactiveUser(id_user, true);
            console.log('✅ Candidat mis à jour:', response);
            setMessage('Candidat supprimé avec succès');

            if (response)
            {
                toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Compte réactivé avec succés', life: 4000 });
            }
            else
            {
                toast.current.show({ severity: 'warn', summary: 'Office du Bac', detail: 'Compte désactivé avec succés', life: 4000 });
            }
            
            resetForm();
        } 
        catch (error) 
        {
            console.error('❌ Erreur lors de la suppression du compte:', error);
            setMessage('Erreur lors de la suppression');
            toast.current.show({ severity: 'error', summary: 'Office du Bac', detail: 'Erreur lors de la suppression', life: 4000 });
        } 
        finally 
        {
            setSubmitting(false);
        }
        await loadData();
        setDesactiveAccessDialog(false);
    };

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try 
        {
            const data = await ParametrageService.getFusionRep();
            if (data && typeof data === 'object') {
                const result = Object.entries(data).map(([aca, cdt]) => ({
                    aca,
                    cdt
                }));
                console.log('OHHH :', result);
                setGroupedUsers(result);
            }
            else 
            {
                console.warn('Données inattendues :', data);
                setGroupedUsers([]); // fallback sécurité
            }
        } 
        catch (err) 
        {
            console.error('❌ Erreur chargement données :', err);
            setError('Erreur lors du chargement');
            setGroupedUsers([]);
        } 
        finally 
        {
            setLoading(false);
        }
    };

    const loadData2 = async () => {
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

    const findIndexById = (id) => {
        let index = -1;
        for (let i = 0; i < products.length; i++) {
            if (products[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    };

    const createId = () => {
        let id = '';
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 5; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteProductsDialog(true);
    };

    const deleteSelectedProducts = () => {
        let _products = products.filter((val) => !selectedProducts.includes(val));
        setProducts(_products);
        setDeleteProductsDialog(false);
        setSelectedProducts(null);
        toast.current.show({
            severity: 'success',
            summary: 'Successful',
            detail: 'Products Deleted',
            life: 3000
        });
    };

    const onCategoryChange = (e) => {
        let _product = { ...product };
        _product['category'] = e.value;
        setProduct(_product);
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _product = { ...product };
        _product[`${name}`] = val;

        setProduct(_product);
    };

    const onInputNumberChange = (e, name) => {
        const val = e.value || 0;
        let _product = { ...product };
        _product[`${name}`] = val;

        setProduct(_product);
    };

    const leftToolbarTemplate = () => {
    return (
        <div className="flex flex-column">

            <div>
                <h3>Gestion de la répartition des tirages</h3>
            </div>

            <div className="flex align-items-center gap-1 flex-wrap">
                <Button
                    severity="info"
                    onClick={handleClick}
                    icon="pi pi-download"
                    label="Lancer toutes les répartitions"
                    className="p-button-primary"
                />

                <Button
                    type="button"
                    icon="pi pi-tag"
                    severity="help"
                    label="Exporter les etiquettes"
                    onClick={() => setDialogVisible_(true)}
                    className="p-button-primary"
                />

                <Button
                    type="button"
                    icon="pi pi-file-excel"
                    severity="success"
                    label="Exporter le chiffrage"
                    onClick={() => setDialogVisible(true)}
                    className="p-button-primary"
                />

                <Button
                    type="button"
                    icon="pi pi-file"
                    severity="warning"
                    label="Exporter les bordereaux de livraison des sujets"
                    onClick={exportAllBLSujet}
                    className="p-button-primary"
                />
            </div>

        </div>
    );
};


    const rightToolbarTemplate = () => {
        return <React.Fragment>{/* <Button severity="help" label="Exporter la liste" icon="pi pi-upload" onClick={exportCSV} /> */}</React.Fragment>;
    };

    const codeBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">username</span>
                {rowData.login}
            </>
        );
    };

    const date1BodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">username</span>
                {rowData.profil?.name?.replace(/_/g, ' ')}
            </>
        );
    };

    const date2BodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">username</span>
                {rowData.acteur.etablissement?.name}
            </>
        );
    };


    const numTableTemplate = (rowData) => {
        return (
            <>
                {rowData.tableNum}
            </>
        );
    };

    const juryTemplate = (rowData) => {
        return (
            <>
                {rowData.jury}
            </>
        );
    };

    const effTemplate = (rowData) => {
        return (
            <>
                {rowData.effectif}
            </>
        );
    };


    const getMatiereColumns = (rows: Repartition[]) => {
        const set = new Set<string>();

        if (!Array.isArray(rows)) return [];

        rows.forEach(item => {
            if (item.matieres) {
                Object.keys(item.matieres).forEach(k => set.add(k));
            }
        });

        return Array.from(set).sort();
    };

   const matiereBody = (rowData: any, code: string) => {
        const matiere = rowData.matieres?.[code];
        const premier = matiere?.premierGroupe ?? 0;
        const second = Math.round(matiere?.secondGroupe) ?? 0;

        return (
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.3', justifyContent: 'left' }}>
                <span style={{ fontWeight: 600, color: '#333' }}>1er Grp : {premier}</span>
                <span style={{ fontWeight: 600, color: '#555' }}>2nd Grp : {second}</span>
            </div>
        );
    };

    const cpTemplate = (rowData) => {
        return (
            <>
                {rowData.centreEcritPrincipal}
            </>
        );
    };

    const csTemplate = (rowData) => {
        return (
            <>
                {rowData.centreEcritSecondaire}
            </>
        );
    };

    const cecTemplate = (rowData) => {
        return (
            <>
                {rowData.centreEcrit}
            </>
        );
    };

    const sessionTemplate = (rowData) => {
        return (
            <>
                {rowData.session}
            </>
        );
    };


    const frenchLTemplate = (rowData) => {
        return (
            <>
                {rowData.frenchL}
            </>
        );
    };

    const frenchSTemplate = (rowData) => {
        return (
            <>
                {rowData.frenchS}
            </>
        );
    };

    const frenchLATemplate = (rowData) => {
        return (
            <>
                {rowData.frenchLA}
            </>
        );
    };

    const frenchSATemplate = (rowData) => {
        return (
            <>
                {rowData.frenchSA}
            </>
        );
    };

    const englishSTemplate = (rowData) => {
        return (
            <>
                {rowData.englishS}
            </>
        );
    };

    const mathLTemplate = (rowData) => {
        return (
            <>
                {rowData.mathL}
            </>
        );
    };

    const mathSMTemplate = (rowData) => {
        return (
            <>
                {rowData.mathSM}
            </>
        );
    };

    const pcSMTemplate = (rowData) => {
        return (
            <>
                {rowData.pcSM}
            </>
        );
    };

    const mathSETemplate = (rowData) => {
        return (
            <>
                {rowData.mathSE}
            </>
        );
    };

    const pcSETemplate = (rowData) => {
        return (
            <>
                {rowData.pcSE}
            </>
        );
    };

    const svtSMTemplate = (rowData) => {
        return (
            <>
                {rowData.svtSM}
            </>
        );
    };

    const svtSETemplate = (rowData) => {
        return (
            <>
                {rowData.svtSE}
            </>
        );
    };

    const philoLTemplate = (rowData) => {
        return (
            <>
                {rowData.philoL}
            </>
        );
    };

    const philoSTemplate = (rowData) => {
        return (
            <>
                {rowData.philoS}
            </>
        );
    };

    const hgTemplate = (rowData) => {
        return (
            <>
                {rowData.hg}
            </>
        );
    };

    const llaTemplate = (rowData) => {
        return (
            <>
                {rowData.lla}
            </>
        );
    };

    const allLV1Template = (rowData) => {
        return (
            <>
                {rowData.allemendLV1}
            </>
        );
    };

    const angLV1Template = (rowData) => {
        return (
            <>
                {rowData.anglaisLV1}
            </>
        );
    };

    const araMLV1Template = (rowData) => {
        return (
            <>
                {rowData.arabeModerneLV1}
            </>
        );
    };

    const espLV1Template = (rowData) => {
        return (
            <>
                {rowData.espagnolLV1}
            </>
        );
    };

    const portLV1Template = (rowData) => {
        return (
            <>
                {rowData.portugaisLV1}
            </>
        );
    };

    const allLV2Template = (rowData) => {
        return (
            <>
                {rowData.allemendLV2}
            </>
        );
    };

    const angLV2Template = (rowData) => {
        return (
            <>
                {rowData.anglaisLV2}
            </>
        );
    };

    const araMLV2Template = (rowData) => {
        return (
            <>
                {rowData.arabeModerneLV2}
            </>
        );
    };

    const espLV2Template = (rowData) => {
        return (
            <>
                {rowData.espagnolLV2}
            </>
        );
    };

    const portLV2Template = (rowData) => {
        return (
            <>
                {rowData.portugaisLV2}
            </>
        );
    };

    const ecoTemplate = (rowData) => {
        return (
            <>
                {rowData.economie}
            </>
        );
    };

    const itaTemplate = (rowData) => {
        return (
            <>
                {rowData.italien}
            </>
        );
    };

    const latTemplate = (rowData) => {
        return (
            <>
                {rowData.latin}
            </>
        );
    };

    const rusTemplate = (rowData) => {
        return (
            <>
                {rowData.russe}
            </>
        );
    };

    const pcLTemplate = (rowData) => {
        return (
            <>
                {rowData.pcL}
            </>
        );
    };

    const svtLTemplate = (rowData) => {
        return (
            <>
                {rowData.svtL}
            </>
        );
    };

    const gElTemplate = (rowData) => {
        return (
            <>
                {rowData.gelec}
            </>
        );
    };


    const gMcTemplate = (rowData) => {
        return (
            <>
                {rowData.gemec}
            </>
        );
    };

    const mOTemplate = (rowData) => {
        return (
            <>
                {rowData.mo}
            </>
        );
    };

    const sESTemplate = (rowData) => {
        return (
            <>
                {rowData.ses}
            </>
        );
    };

    const gCFTemplate = (rowData) => {
        return (
            <>
                {rowData.gcf}
            </>
        );
    };


    
    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Répartition par centre d&apos;ecrit principal et par discipline</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onChange={(e) => setGlobalFilter((e.target as HTMLInputElement).value)} placeholder="Recherche..." />
            </span>
        </div>
    );

    const productDialogFooter = (
        <>
            <Button label="Valider" icon="pi pi-check" text onClick={saveProduct} />
            <Button label="Fermer" icon="pi pi-times" text onClick={hideDialog} />
        </>
    );
    const deleteProductDialogFooter = (
        <>
            <Button label="Oui" icon="pi pi-check" text onClick={() => deleteProduct(formik.values, { setSubmitting: formik.setSubmitting, resetForm: formik.resetForm })} />
            <Button label="Non" icon="pi pi-times" text onClick={hideDeleteProductDialog} />
        </>
    );

    const createBatchDialogFooter = (
        <>
            <Button label="OK" icon="pi pi-times" text onClick={hideBatchCreatedDialog} />
        </>
    );

    const deleteProductDialogFooter_ = (
        <>
            <Button label="Oui" icon="pi pi-check" text onClick={() => deleteUser(formik.values, { setSubmitting: formik.setSubmitting, resetForm: formik.resetForm })} />
            <Button label="Non" icon="pi pi-times" text onClick={hideDeleteProductDialog_} />
        </>
    );

    const deleteProductDialogFooter__ = (
        <>
            <Button label="Oui" icon="pi pi-check" text onClick={() => desactiveUser(formik.values, { setSubmitting: formik.setSubmitting, resetForm: formik.resetForm })} />
            <Button label="Non" icon="pi pi-times" text onClick={hideDeleteProductDialog__} />
        </>
    );

    const deleteProductsDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteProductsDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={deleteSelectedProducts} />
        </>
    );

    const openNew3 = () => {
        setCodifDialog(true);
    };

    const formik = useFormik({
        initialValues: {
            firstname: '',
            lastname: '',
            login: '',
            password: '',
            conf_password: '',
            phone: '',
            email: '',
            state_account: true,
            etablissement: null,
            profil: null,
            acteur: null
        },

        validationSchema: Yup.object({
            login: Yup.string().required('Champ obligatoire'),
            firstname: Yup.string().required('Champ obligatoire'),
            lastname: Yup.string().required('Champ obligatoire'),
            phone: Yup.string()
                            .required('Le téléphone est obligatoire')
                            .test('valid-phone', 'Numéro de téléphone invalide', (value) => {
                                if (!value) return false;
                                const digitsOnly = value.replace(/\s/g, ''); // supprime les espaces
                                const allowedPrefixes = ['77', '78', '76', '75', '71', '70'];
            
                                // doit faire exactement 9 chiffres et avoir un préfixe valide
                                return digitsOnly.length === 9 && allowedPrefixes.includes(digitsOnly.slice(0, 2));
                            }),
            email: Yup.string()
                            .email('Email invalide')
                            .trim()
                            .required("L'email est obligatoire")
                            .test(
                                'no-leading-space',
                                "L'email ne peut pas commencer par un espace",
                                (value) => value && !value.startsWith(' ')
                            )
                            .test(
                                'no-trailing-space',
                                "L'email ne peut pas se terminer par un espace",
                                (value) => value && !value.endsWith(' ')
                            )
                            .matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Le domaine doit se terminer par au moins 2 caractères"),
            
            profil: Yup.string().required('Champ obligatoire'),
            password: Yup.string().required('Champ obligatoire')
                .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
            conf_password: Yup.string()
                .required('Champ obligatoire')
                .oneOf([Yup.ref('password'), null], 'Les mots de passe ne correspondent pas'),
            etablissement: Yup.mixed()
                .nullable()
                .when('profil', {
                    is: (val) => val === 'AGENT_DE_SAISIE',
                    then: (schema) => schema.required('Champ obligatoire'),
                    otherwise: (schema) => schema.nullable()
                })
        }),

        onSubmit: async (values, { setSubmitting, resetForm }) => {
            console.log('cliquer...');

            const acteurDTO: ActeurDTO = { etablissement: values.etablissement };
            const profilDTO: ProfilDTO = { name: values.profil };

            const userDTO: UserDTO = {
                firstname: values.firstname,
                lastname: values.lastname,
                login: values.login,
                password: values.password,
                phone: values.phone.replace(/\s/g, ''),
                email: values.email,
                state_account: true,
                profil: profilDTO,
                acteur: acteurDTO
            };

            try {
                //console.log(is_update);
                if (is_update === false) 
                {
                    console.log('POST', is_go_by_smtp);
                    const response = await ParametrageService.createUser(userDTO, is_go_by_smtp);
                    console.log('✅ User créé:', response.data);
                    setMessage('User créé avec succès');
                    toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Utilisateur créé avec succès', life: 4000 });
                }
                resetForm();
                await loadData();
                setProductDialog(false);
            } 
            catch (error) {
            // On essaie de récupérer un message clair depuis le backend
            const errorMessage = error.response?.data?.errorMessage;
            setMessage(errorMessage);
                toast.current.show({ 
                    severity: 'error', 
                    summary: 'Office du Bac', 
                    detail: errorMessage, 
                    life: 4000 
                });
            }
            finally 
            {
                setSubmitting(false);
            }
        }
    });


    const formik2 = useFormik({
        initialValues: {
            firstname: '',
            lastname: '',
            login: '',
            phone: '',
            email: '',
            state_account: true,
            etablissement: null,
            profil: null,
            acteur: null
        },

        validationSchema: Yup.object({
            login: Yup.string().required('Champ obligatoire'),
            firstname: Yup.string().required('Champ obligatoire'),
            lastname: Yup.string().required('Champ obligatoire'),
            phone: Yup.string().required('Champ obligatoire'),
            email: Yup.string().required('Champ obligatoire'),
            profil: Yup.string().required('Champ obligatoire'),
            etablissement: Yup.mixed()
                .nullable()
                .when('profil', {
                    is: (val) => val === 'AGENT_DE_SAISIE',
                    then: (schema) => schema.required('Champ obligatoire'),
                    otherwise: (schema) => schema.nullable()
                })
        }),

        onSubmit: async (values, { setSubmitting, resetForm }) => {
            console.log('cliquer...');

            const acteurDTO: ActeurDTO = { etablissement: values.etablissement };
            const profilDTO: ProfilDTO = { name: values.profil };

            const userDTO_ = {
                firstname: values.firstname,
                lastname: values.lastname,
                login: values.login,
                phone: values.phone,
                email: values.email,
                state_account: true,
                profil: profilDTO,
                acteur: acteurDTO
            };

            try {
                //console.log(is_update);
                if (is_update === true) {
                    console.log('PUT');
                    const response = await ParametrageService.updateUser(id_acces, userDTO_);
                    console.log('✅ Candidat mis à jour:', response.data);
                    setMessage('Candidat créé avec succès');
                    toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Utilisateur mis à jour avec succès', life: 4000 });
                    resetForm();
                }
                await loadData();
                setProductDialog2(false);
                setIsAdmin(false);
            } 
            catch (error) 
            {
            // On essaie de récupérer un message clair depuis le backend
            const errorMessage = error.response?.data?.errorMessage;
            setMessage(errorMessage);
                toast.current.show({ 
                    severity: 'error', 
                    summary: 'Office du Bac', 
                    detail: errorMessage, 
                    life: 4000 
                });
            } 
            finally 
            {
                setSubmitting(false);
            }
        }
    });


    const handleFileChange = (e) => {
        const fileOK = e.files?.[0];
        setFile(fileOK);
        setErrorMessage('');
    };

    const handleUpload = async () => {
        setResultImport(null);
        setLoading(false);
        if (!file) 
        {
            setErrorMessage("⚠️ Veuillez d'abord charger un fichier Excel valide.");
            return;
        } 
        else {
            setCodifDialog(false);
            setLoading(true);
            setGetResultDialog(true);
            console.log(file);
            const message = await ParametrageService.uploadFile(file);
            setLoading(false);
            setResultImport(message);
            toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Fichier chargé avec succès', life: 4000 });
            
        }
    };


    



    //console.log(is_update);

    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="grid crud-demo">
                <div className="col-12">
                    <div className="card">
                        <style>
                                {`
                    .accepted-row {
                        background-color: #e6ffed !important; /* Vert très clair */
                    }

                    .rejected-row {
                        background-color: #ffe6e6 !important; /* Rouge très clair */
                    }
                    `}
                            </style>
                        <Toast ref={toast} />
                        <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                            {(loading || (groupedUsers && groupedUsers.length > 0)) && (
                                <TabView>
                                    {groupedUsers.map(({ aca, cdt }) => {
                                        const matiereColumns = getMatiereColumns(cdt);

                                        return (
                                            <TabPanel key={aca} header={aca}>
                                                <DataTable
                                                    ref={dt}
                                                    loading={loading}
                                                    loadingIcon="pi pi-spin pi-spinner"
                                                    stripedRows
                                                    showGridlines
                                                    scrollable
                                                    value={Array.isArray(cdt) ? cdt : []}
                                                    paginator
                                                    rows={10}
                                                    rowsPerPageOptions={[5, 10]}
                                                    className="p-datatable-sm"
                                                    currentPageReportTemplate="Affichage de {first} à {last} des {totalRecords} enregistrement (s)"
                                                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                                    globalFilter={globalFilter}
                                                    emptyMessage="Aucune donnée n'a été trouvée"
                                                    header={header}
                                                >
                                                    <Column frozen alignFrozen="left" field="jury" header="Jury" body={juryTemplate} />
                                                    <Column frozen alignFrozen="left" field="centreEcrit" header="Centre d'Ecrit" body={cecTemplate} />
                                                    <Column frozen alignFrozen="left" field="session" header="Session" body={sessionTemplate} />
                                                    <Column frozen alignFrozen="left" field="effectif" header="Effectif du jury" body={effTemplate} />

                                                    {matiereColumns.map((code: string) => (
                                                        <Column
                                                            key={code}
                                                            header={code}
                                                            body={(rowData) => matiereBody(rowData, code)}
                                                            headerStyle={{ minWidth: '9rem', textAlign: 'left' }} // plus large et centré
                                                            bodyStyle={{ minWidth: '9rem', textAlign: 'left' }}   // applique aussi au corps
                                                        />
                                                    ))}
                                                </DataTable>
                                            </TabPanel>
                                        );
                                    })}
                                </TabView>
                            )}

                        <Dialog visible={productDialog} style={{ width: '65%', maxHeight: '95vh' }} header="Panneau de création d'un accés" modal className="p-fluid" onHide={hideDialog}>
                            <form onSubmit={formik.handleSubmit} className="p-0">
                                <div className="p-1">
                                    <div className="formgrid grid mt-0">
                                        <div className="field col-4">
                                            <label htmlFor="quantity"><span className="text-red-600">*</span> Login</label>

                                            <InputText
                                                placeholder="Fournir un login"
                                                autoComplete='off'
                                                id="login"
                                                name="login"
                                                value={formik.values.login}
                                                onChange={(e) => formik.setFieldValue('login', e.target.value)}
                                                onBlur={formik.handleBlur}
                                                className={`p-inputtext-sm w-full ${formik.touched.login && formik.errors.login ? 'p-invalid' : ''}`}
                                            />
                                            {formik.touched.login && typeof formik.errors.login === 'string' && <small className="p-error">{formik.errors.login}</small>}
                                        </div>
                                    </div>
                                    <div className="formgrid grid">
                                        <div className="field col-6">
                                            <label htmlFor="price"><span className="text-red-600">*</span> Prénom (s)</label>
                                            <InputText
                                                placeholder="Saisir le prénom (s)"
                                                autoCapitalize='on'
                                                autoComplete='off'
                                                id="firstname"
                                                name="firstname"
                                                value={formik.values.firstname}
                                                onChange={(e) => formik.setFieldValue('firstname', e.target.value)}
                                                onBlur={formik.handleBlur}
                                                className={`p-inputtext-sm w-full ${formik.touched.firstname && formik.errors.firstname ? 'p-invalid' : ''}`}
                                            />
                                            {formik.touched.firstname && typeof formik.errors.firstname === 'string' && <small className="p-error">{formik.errors.firstname}</small>}
                                        </div>

                                        <div className="field col-3">
                                            <label htmlFor="quantity"><span className="text-red-600">*</span> Nom</label>
                                            <InputText
                                                placeholder="Saisir le nom"
                                                autoCapitalize='on'
                                                autoComplete='off'
                                                id="lastname"
                                                name="lastname"
                                                value={formik.values.lastname}
                                                onChange={(e) => formik.setFieldValue('lastname', e.target.value)}
                                                onBlur={formik.handleBlur}
                                                className={`p-inputtext-sm w-full ${formik.touched.lastname && formik.errors.lastname ? 'p-invalid' : ''}`}
                                            />
                                            {formik.touched.lastname && typeof formik.errors.lastname === 'string' && <small className="p-error">{formik.errors.lastname}</small>}
                                        </div>

                                        <div className="field col-3">
                                            <label htmlFor="quantity">Téléphone (Portable)</label>
                                             <InputText
                                                autoComplete='off'
                                                placeholder="Téléphone"
                                                id="phone"
                                                name="phone"
                                                value={formik.values.phone}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                className={`p-inputtext-sm w-full ${formik.touched.phone && formik.errors.phone ? 'p-invalid' : ''}`}
                                            />
                                            
                                        </div>
                                    </div>
                                    <div className="formgrid grid">
                                        
                                        <div className="field col-6">
                                            <label htmlFor="email"><span className="text-red-600">*</span> Email</label>
                                            <InputText
                                                autoComplete='off'      
                                                placeholder="Email"
                                                id="email"
                                                name="email"
                                                value={formik.values.email}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                className={`p-inputtext-sm w-full ${formik.touched.email && formik.errors.email ? 'p-invalid' : ''}`}
                                            />
                                            {formik.touched.email && typeof formik.errors.email === 'string' && <small className="p-error">{formik.errors.email}</small>}
                                        </div>

                                        <div className="field col-6">
                                            <label htmlFor="quantity"><span className="text-red-600">*</span> Choisissez un profil</label>
                                            <Dropdown
                                                id="profil"
                                                name="profil"
                                                value={formik.values.profil}
                                                onChange={(e) => formik.setFieldValue('profil', e.value)}
                                                options={profilsOptions}
                                                // optionLabel="code" // adapter si ton objet contient un champ "libelle"
                                                placeholder="Sélectionner le profil"
                                                className={`p-inputtext-sm w-full ${formik.touched.profil && formik.errors.profil ? 'p-invalid' : ''}`}
                                            />
                                            {formik.touched.profil && typeof formik.errors.profil === 'string' && <small className="p-error">{formik.errors.email}</small>}
                                        </div>
                                    </div>
                                    <div className="formgrid grid">
                                        {formik.values.profil === 'AGENT_DE_SAISIE' && (
                                            <div className="field col-8">
                                                <label htmlFor="email"><span className="text-red-600">*</span> Précisez l&apos;établissement</label>
                                                <Dropdown
                                                    showClear
                                                    id="etablissement"
                                                    name="etablissement"
                                                    value={formik.values.etablissement}
                                                    onChange={(e) => formik.setFieldValue('etablissement', e.value)}
                                                    options={etabs}
                                                    optionLabel="name" // adapter si ton objet contient un champ "libelle"
                                                    placeholder="Sélectionner l'etablissement"
                                                    filter
                                                    virtualScrollerOptions={{ itemSize: 30 }}
                                                    className={`p-inputtext-sm w-full ${formik.touched.etablissement && formik.errors.etablissement ? 'p-invalid' : ''}`}
                                                />
                                                {formik.touched.etablissement && typeof formik.errors.etablissement === 'string' && <small className="p-error">{formik.errors.email}</small>}
                                            </div>
                                        )}
                                    </div>
                                    <hr />
                                    {!is_update && (
                                        <div className="formgrid grid">
                                            <div className="field col-6">
                                                <label htmlFor="password"><span className="text-red-600">*</span> Fournir le mot de passe</label>
                                                <InputText
                                                    placeholder="Fournir le mot de passe"
                                                    id="password"
                                                    name="password"
                                                    type="password"
                                                    value={formik.values.password}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    className={`p-inputtext-sm w-full ${formik.touched.password && formik.errors.password ? 'p-invalid' : ''}`}
                                                />
                                                {formik.touched.password && typeof formik.errors.password === 'string' && <small className="p-error">{formik.errors.password}</small>}
                                            </div>

                                            <div className="field col-6">
                                                <label htmlFor="confirmPassword"><span className="text-red-600">*</span> Confirmer le mot de passe</label>
                                                <InputText
                                                    placeholder="Confirmer le mot de passe"
                                                    id="conf_password"
                                                    name="conf_password"
                                                    type="password"
                                                    value={formik.values.conf_password}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    className={`p-inputtext-sm w-full ${formik.touched.conf_password && formik.errors.conf_password ? 'p-invalid' : ''}`}
                                                />
                                                {formik.touched.conf_password && typeof formik.errors.conf_password && <small className="p-error">{formik.errors.conf_password}</small>}
                                            </div>
                                        </div>
                                    )}

                                    <div className="formgrid grid">
                                        <div className="field col-6">
                                            <Checkbox name="category" value={is_go_by_smtp} onChange={(e) => setIsGoBySmtp(e.checked)} checked={is_go_by_smtp} />
                                            <span className="ml-2">
                                                <b>Transmettre les accés pas SMTP ?</b>
                                            </span>
                                        </div>
                                        <div className="field col-6">
                                            <div>
                                                <Button severity="success" label="Creer l'accés" className="mr-2" type="submit" />
                                                {/* <Button severity="danger" label="Delete" icon="pi pi-trash" onClick={confirmDeleteSelected} disabled={!selectedProducts || !selectedProducts.length} /> */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                            ,
                        </Dialog>

                        <Dialog visible={codifDialog} style={{ width: '1000px' }} header="Création automatique d'accés pour les établissements" modal className="p-fluid" onHide={hideDialog4}>
                            <div style={{ color: 'red' }}>
                                <span><b>Mention utile 1 : </b>Veuillez charger exclusivement un fichier Excel.</span>
                                <br />
                                <span><b>Mention utile 2 : </b>Le fichier devra contenir obligatoirement ces colonnes dans l&apos;ordre suivant : </span>
                                <br />
                                <span>- Colonne 1 : Adresse email existante et utilisable de l&apos;établissement ;</span>
                                <br />
                                <span>- Colonne 2 : Code du nom de l&apos;établissement ;</span>
                                <br />
                                <span>- Colonne 3 : Numéro de téléphone de l&apos;établissement.</span>
                                <br />
                                <span><b>Mention utile 3 : </b>Deux établissements ne peuvent en aucun cas partager le même code ni la même adresse email.</span>
                            </div>
                            <div className="col-md-6">
                                <FileUpload mode="basic" accept=".xls, .xlsx" customUpload name="xls" chooseLabel="Charger le fichier excel" onSelect={handleFileChange} className="mr-2 mt-5" />
                                {errorMessage && <div style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</div>}

                                <Button label="Enregistrer les données du fichier pour la création des accés" icon="pi pi-upload" className="p-button-success mt-2" onClick={handleUpload} />
                            </div>
                        </Dialog>

                        <Dialog 
                            visible={productDialog2} 
                            style={{ width: '65%', maxHeight: '95vh' }} 
                            header="Panneau d'édition d'un accés" 
                            modal 
                            className="p-fluid" onHide={hideDialog2}>
                            <form onSubmit={formik2.handleSubmit} className="p-0">
                                <div className="p-0">
                                    <div className="formgrid grid">
                                        <div className="field col-4">
                                            <label htmlFor="quantity"><span className="text-red-600">*</span> Login</label>

                                            <InputText
                                                disabled={isAdmin}
                                                placeholder="Fournir un login"
                                                autoComplete='off'
                                                id="login"
                                                name="login"
                                                value={formik2.values.login}
                                                onChange={(e) => formik2.setFieldValue('login', e.target.value)}
                                                onBlur={formik2.handleBlur}
                                                className={`p-inputtext-sm w-full ${formik2.touched.login && formik2.errors.login ? 'p-invalid' : ''}`}
                                            />
                                            {formik2.touched.login && typeof formik2.errors.login === 'string' && <small className="p-error">{formik2.errors.login}</small>}
                                        </div>
                                    </div>
                                    <div className="formgrid grid">
                                        <div className="field col-8">
                                            <label htmlFor="price"><span className="text-red-600">*</span> Prénom (s)</label>
                                            <InputText
                                                placeholder="Saisir le prénom (s)"
                                                autoCapitalize='on'
                                                autoComplete='off'
                                                id="firstname"
                                                name="firstname"
                                                value={formik2.values.firstname}
                                                onChange={(e) => formik2.setFieldValue('firstname', e.target.value)}
                                                onBlur={formik2.handleBlur}
                                                className={`p-inputtext-sm w-full ${formik2.touched.firstname && formik2.errors.firstname ? 'p-invalid' : ''}`}
                                            />
                                            {formik2.touched.firstname && typeof formik2.errors.firstname === 'string' && <small className="p-error">{formik2.errors.firstname}</small>}
                                        </div>

                                        <div className="field col-4">
                                            <label htmlFor="quantity"><span className="text-red-600">*</span> Nom</label>
                                            <InputText
                                                placeholder="Saisir le nom"
                                                autoCapitalize='on'
                                                autoComplete='off'
                                                id="lastname"
                                                name="lastname"
                                                value={formik2.values.lastname}
                                                onChange={(e) => formik2.setFieldValue('lastname', e.target.value)}
                                                onBlur={formik2.handleBlur}
                                                className={`p-inputtext-sm w-full ${formik2.touched.lastname && formik2.errors.lastname ? 'p-invalid' : ''}`}
                                            />
                                            {formik2.touched.lastname && typeof formik2.errors.lastname === 'string' && <small className="p-error">{formik2.errors.lastname}</small>}
                                        </div>
                                    </div>
                                    <div className="formgrid grid">
                                        
                                        <div className="field col-8">
                                            <label htmlFor="email"><span className="text-red-600">*</span> Email</label>
                                            <InputText
                                                placeholder="Email"
                                                autoComplete='off'
                                                id="email"
                                                name="email"
                                                value={formik2.values.email}
                                                onChange={formik2.handleChange}
                                                onBlur={formik2.handleBlur}
                                                className={`p-inputtext-sm w-full ${formik2.touched.email && formik2.errors.email ? 'p-invalid' : ''}`}
                                            />
                                            {formik2.touched.email && typeof formik2.errors.email === 'string' && <small className="p-error">{formik2.errors.email}</small>}
                                        </div>
                                        <div className="field col-4">
                                            <label htmlFor="quantity">Téléphone (Portable)</label>
                                             <InputText
                                                autoComplete='off'
                                                id="phone"
                                                name="phone"
                                                value={formik2.values.phone}
                                                onChange={formik2.handleChange}
                                                onBlur={formik2.handleBlur}
                                                className={`p-inputtext-sm w-full ${formik2.touched.phone && formik2.errors.phone ? 'p-invalid' : ''}`}
                                            />
                                            {/* {formik2.touched.phone && typeof formik2.errors.phone === 'string' && <small className="p-error">{formik2.errors.phone}</small>} */}
                                        </div>
                                    </div>
                                    <div className="formgrid grid">

                                        {formik2.values.profil === 'AGENT_DE_SAISIE' && (
                                            <div className="field col-8">
                                                <label htmlFor="email"><span className="text-red-600">*</span> Précisez l&apos;établissement</label>
                                                <Dropdown
                                                    showClear
                                                    id="etablissement"
                                                    name="etablissement"
                                                    value={formik2.values.etablissement}
                                                    onChange={(e) => formik2.setFieldValue('etablissement', e.value)}
                                                    options={etabs}
                                                    optionLabel="name" // adapter si ton objet contient un champ "libelle"
                                                    placeholder="Sélectionner l'etablissement"
                                                    filter
                                                    virtualScrollerOptions={{ itemSize: 30 }}
                                                    className={`p-inputtext-sm w-full ${formik2.touched.etablissement && formik2.errors.etablissement ? 'p-invalid' : ''}`}
                                                />
                                                {formik2.touched.etablissement && typeof formik2.errors.etablissement === 'string' && <small className="p-error">{formik2.errors.email}</small>}
                                            </div>
                                        )}

                                        <div className="field col-4">
                                            <label htmlFor="quantity"><span className="text-red-600">*</span> Choisissez un profil</label>
                                            <Dropdown
                                                disabled={isAdmin}
                                                id="profil"
                                                name="profil"
                                                value={formik2.values.profil}
                                                onChange={(e) => formik2.setFieldValue('profil', e.value)}
                                                options={profilsOptions}
                                                // optionLabel="code" // adapter si ton objet contient un champ "libelle"
                                                placeholder="Sélectionner le profil"
                                                className={`p-inputtext-sm w-full ${formik2.touched.profil && formik2.errors.profil ? 'p-invalid' : ''}`}
                                            />
                                            {formik2.touched.profil && typeof formik2.errors.profil === 'string' && <small className="p-error">{formik2.errors.email}</small>}
                                        </div>
                                    </div>
                                    <div className="formgrid grid">
                                        <div className="field col-8"></div>
                                        <div className="field col-4">
                                            <div>
                                                <Button severity="success" label="Modifier les infos de l'accés" className="mr-2" type="submit" />
                                                {/* <Button severity="danger" label="Delete" icon="pi pi-trash" onClick={confirmDeleteSelected} disabled={!selectedProducts || !selectedProducts.length} /> */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                            ,
                        </Dialog>

                        <Dialog visible={exporting} onHide={() => {}} modal closable={false} header="Préparation du fichier">
                            <div className="flex flex-column align-items-center justify-content-center">
                                <ProgressSpinner style={{ width: '50px', height: '50px' }} />
                                <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{exportStep}</p>
                                <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>
                                    Veuillez patienter... ⏱ {seconds} seconde{seconds > 1 ? 's' : ''}
                                </p>
                            </div>
                        </Dialog>

                        <Dialog visible={deleteProductDialog} style={{ width: '550px' }} header="Réinitialisation du mot de passe" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
                            <form onSubmit={formik.handleSubmit} className="p-0">
                                <div className="flex align-items-center justify-content-center">
                                    <i className="pi pi-exclamation-circle mr-3" style={{ fontSize: '2rem', color: 'orange' }} />
                                    <span>
                                        Êtes-vous sûr(e) de vouloir réinitialiser le mot de passe du compte <br /><b>{formik.values.login}</b> ?<br />
                                    </span>
                                </div>
                            </form>
                        </Dialog>

                        <Dialog visible={supprimerDialog} style={{ width: '550px' }} header="Suppression d'un compte" modal footer={deleteProductDialogFooter_} onHide={hideDeleteProductDialog_}>
                            <form onSubmit={formik.handleSubmit}>
                                <div className="flex align-items-center justify-content-center">
                                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem', color: 'red' }} />
                                    <span>
                                        Êtes-vous sûr(e) de vouloir supprimer le compte rattaché à l&apos;email <br /><b>{formik.values.email}</b> ?<br />
                                    </span>
                                </div>
                            </form>
                        </Dialog>

                        <Dialog visible={desactiveAccessDialog} style={{ width: '550px' }} header="Gestion de l'activité d'un compte" modal footer={deleteProductDialogFooter__} onHide={hideDeleteProductDialog__}>
                            <form onSubmit={formik.handleSubmit}>
                                <div className="flex align-items-center justify-content-center">
                                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem', color:'red' }} />
                                    <span>
                                        Êtes-vous sûr de vouloir modifier le statut du compte rattaché à l&apos;email <br /><b>{formik.values.email}</b> ?<br />
                                    </span>
                                </div>
                            </form>
                        </Dialog>

                        <Dialog 
                            visible={getResultDialog} 
                            style={{ width: '600px' }} 
                            header="Création de comptes pour les Agents de Saisie" 
                            modal 
                            onHide={hideBatchCreatedDialog}
                        >
                            <div className="flex flex-column align-items-center">
                                {loading && (
                                    <div className="flex flex-column justify-content-center align-items-center" style={{ height: '100px' }}>
                                        <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="6" />
                                        <span>Les comptes sont en cours de création...</span>
                                    </div>
                                )}

                                {!loading && resultImport && (
                                    <div className="flex flex-column align-items-center">
                                        <span>
                                            <b style={{ color: "green" }}>
                                                {resultImport}
                                            </b>
                                        </span>
                                        <Button 
                                            label="OK" 
                                            icon="pi pi-times" 
                                            text 
                                            onClick={hideBatchCreatedDialog} 
                                            className="mt-3"
                                        />
                                        
                                    </div>
                                )}
                            </div>
                        </Dialog>


                        <Dialog
                                        header="Chiffrage des tirages"
                                        visible={dialogVisible}
                                        style={{ width: '520px' }}
                                        footer={dialogFooter}
                                        onHide={() => setDialogVisible(false)}
                                    >
                                        <div className="p-fluid">
                        

                                            <div className="field grid">
                                                <label className="col-4 mb-0">Liste des Matières</label>
                                                <div className="col-5">
                                                    <Dropdown
                                                        filter
                                                        value={regle}
                                                        optionLabel="code"
                                                        optionValue="code"
                                                        options={regles}
                                                        onChange={(e) =>
                                                            setRegle(e.value)
                                                        }
                                                        placeholder="Sélectionner"
                                                    />

                                                    
                                                </div>
                                            </div>

                                            <div className="field grid">
                                                <label className="col-4 mb-0">Groupe</label>
                                                <div className="col-5">
                                                    <Dropdown
                                                        value={groupe}
                                                        optionLabel="label"
                                                        optionValue="value"
                                                        options={typeOptions}
                                                        onChange={(e) =>
                                                            setGroupe(e.value)
                                                        }
                                                        placeholder="Sélectionner"
                                                    />

                                                    
                                                </div>
                                            </div>

                                          
                                        </div>
                        </Dialog>


                         <Dialog
                                        header="Export des etiquettes"
                                        visible={dialogVisible_}
                                        style={{ width: '520px' }}
                                        footer={dialogFooter_}
                                        onHide={() => setDialogVisible_(false)}
                                    >
                                        <div className="p-fluid">
                        

                                            <div className="field grid">
                                                <label className="col-4 mb-0">Liste des Matières</label>
                                                <div className="col-5">
                                                    <Dropdown
                                                        filter
                                                        value={regle}
                                                        optionLabel="code"
                                                        optionValue="code"
                                                        options={regles}
                                                        onChange={(e) =>
                                                            setRegle(e.value)
                                                        }
                                                        placeholder="Sélectionner"
                                                    />

                                                    
                                                </div>
                                            </div>

                                            <div className="field grid">
                                                <label className="col-4 mb-0">Groupe</label>
                                                <div className="col-5">
                                                    <Dropdown
                                                        value={groupe}
                                                        optionLabel="label"
                                                        optionValue="value"
                                                        options={typeOptions}
                                                        onChange={(e) =>
                                                            setGroupe(e.value)
                                                        }
                                                        placeholder="Sélectionner"
                                                    />

                                                    
                                                </div>
                                            </div>

                                          
                                        </div>
                        </Dialog>

                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default CalendarDemo;
