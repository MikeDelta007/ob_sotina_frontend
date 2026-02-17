'use client';

import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { Button } from 'primereact/button';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Rating } from 'primereact/rating';
import { PickList } from 'primereact/picklist';
import { ProductService } from '../../../../demo/service/ProductService';
import type { Demo } from '@/types';
import { CandidatureService } from '@/demo/service/CandidatureService';
import { Toast } from 'primereact/toast';
import { SujetCandidatsDTO } from '@/types/sujetToCandidats';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { UserContext } from '@/app/userContext';

const ListDemo = () => {
    const listValue = [
        { name: 'San Francisco', code: 'SF' },
        { name: 'London', code: 'LDN' },
        { name: 'Paris', code: 'PRS' },
        { name: 'Istanbul', code: 'IST' },
        { name: 'Berlin', code: 'BRL' },
        { name: 'Barcelona', code: 'BRC' },
        { name: 'Rome', code: 'RM' }
    ];

    const [candidats, setCandidatData] = useState([]);

    const { user } = useContext(UserContext);
    
    const [picklistSourceValue, setPicklistSourceValue] = useState([]);
    const [picklistTargetValue, setPicklistTargetValue] = useState([]);
    const toast = useRef(null);
    const [orderlistValue, setOrderlistValue] = useState(listValue);
    const [dataViewValue, setDataViewValue] = useState<Demo.Product[]>([]);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filteredValue, setFilteredValue] = useState<Demo.Product[] | null>(null);
    const [layout, setLayout] = useState<'grid' | 'list' | (string & Record<string, unknown>)>('grid');
    const [sortKey, setSortKey] = useState(null);
    const [sortOrder, setSortOrder] = useState<0 | 1 | -1 | null>(null);
    const [sortField, setSortField] = useState('');

    const [sujets, setSujetData] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [selectedSujet, setSelectedSujet] = useState(null);
    const [prog, setOneProg] = useState<{ edition?: number } | null>(null);
    const [reloadTrigger, setReloadTrigger] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    const sortOptions = [
        { label: 'Price High to Low', value: '!price' },
        { label: 'Price Low to High', value: 'price' }
    ];

    useEffect(() => {
            CandidatureService.getLastProg().then((response) => {
                //console.log("📦 Séries chargées :", data);
                setOneProg(response);
            });
    }, []);

    const loadCandidats = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!user?.acteur?.etablissement?.id || !prog?.edition) {
        setLoading(false);
        return;
    }

    try {
        const response = await CandidatureService.getCandidatsByEtablissement(
            user.acteur.etablissement.id,
            Number(prog.edition)
        );
        console.log("OK", response);
        setCandidatData(response);
    } catch (err) {
        console.error("❌ Erreur chargement candidats :", err);
        setError("Erreur lors du chargement");
    } finally {
        setLoading(false);
    }
}, [user?.acteur?.etablissement?.id, prog?.edition]);

    useEffect(() => {
        if (user?.acteur?.etablissement?.id && Number(prog?.edition)) {
            loadCandidats();
        }
    }, [reloadTrigger, user?.acteur?.etablissement?.id, prog?.edition, loadCandidats]);

    
    useEffect(() => {
        if (candidats && candidats.length > 0) 
            {
            console.log("En haut", candidats);
            setPicklistSourceValue(candidats);
            }
    }, [candidats]);

    useEffect(() => {
        ProductService.getProducts().then((data) => setDataViewValue(data));
        setGlobalFilterValue('');
    }, []);

    useEffect(() => {
        ProductService.getProducts().then((data) => setDataViewValue(data));
        setGlobalFilterValue('');
    }, []);

    useEffect(() => {
            if (user?.acteur?.etablissement?.id && Number(prog?.edition)) {
                CandidatureService.getSujetsByEtablissement(user?.acteur?.etablissement?.id, Number(prog?.edition)).then((response) => {
                setSujetData(response);
            });
        }
    }, [user, prog]);
    

    const onFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setGlobalFilterValue(value);
        if (value.length === 0) {
            setFilteredValue(null);
        } else {
            const filtered = dataViewValue?.filter((product) => {
                const productNameLowercase = product.name.toLowerCase();
                const searchValueLowercase = value.toLowerCase();
                return productNameLowercase.includes(searchValueLowercase);
            });

            setFilteredValue(filtered);
        }
    };

    
    const dataviewListItem = (data: Demo.Product) => {
        return (
            <div className="col-12">
                <div className="flex flex-column md:flex-row align-items-center p-3 w-full">
                    <img src={`/demo/images/product/${data.image}`} alt={data.name} className="my-4 md:my-0 w-9 md:w-10rem shadow-2 mr-5" />
                    <div className="flex-1 flex flex-column align-items-center text-center md:text-left">
                        <div className="font-bold text-2xl">{data.name}</div>
                        <div className="mb-2">{data.description}</div>
                        <Rating value={data.rating} readOnly cancel={false} className="mb-2"></Rating>
                        <div className="flex align-items-center">
                            <i className="pi pi-tag mr-2"></i>
                            <span className="font-semibold">{data.category}</span>
                        </div>
                    </div>
                    <div className="flex flex-row md:flex-column justify-content-between w-full md:w-auto align-items-center md:align-items-end mt-5 md:mt-0">
                        <span className="text-2xl font-semibold mb-2 align-self-center md:align-self-end">${data.price}</span>
                        <Button icon="pi pi-shopping-cart" label="Add to Cart" disabled={data.inventoryStatus === 'OUTOFSTOCK'} size="small" className="mb-2"></Button>
                        <span className={`product-badge status-${data.inventoryStatus?.toLowerCase()}`}>{data.inventoryStatus}</span>
                    </div>
                </div>
            </div>
        );
    };

    const dataviewGridItem = (data: Demo.Product) => {
        return (
            <div className="col-12 lg:col-4">
                <div className="card m-3 border-1 surface-border">
                    <div className="flex flex-wrap gap-2 align-items-center justify-content-between mb-2">
                        <div className="flex align-items-center">
                            <i className="pi pi-tag mr-2" />
                            <span className="font-semibold">{data.category}</span>
                        </div>
                        <span className={`product-badge status-${data.inventoryStatus?.toLowerCase()}`}>{data.inventoryStatus}</span>
                    </div>
                    <div className="flex flex-column align-items-center text-center mb-3">
                        <img src={`/demo/images/product/${data.image}`} alt={data.name} className="w-9 shadow-2 my-3 mx-0" />
                        <div className="text-2xl font-bold">{data.name}</div>
                        <div className="mb-3">{data.description}</div>
                        <Rating value={data.rating} readOnly cancel={false} />
                    </div>
                    <div className="flex align-items-center justify-content-between">
                        <span className="text-2xl font-semibold">${data.price}</span>
                        <Button icon="pi pi-shopping-cart" disabled={data.inventoryStatus === 'OUTOFSTOCK'} />
                    </div>
                </div>
            </div>
        );
    };

    const itemTemplate = (data: Demo.Product, layout: 'grid' | 'list' | (string & Record<string, unknown>)) => {
        if (!data) {
            return;
        }

        if (layout === 'list') {
            return dataviewListItem(data);
        } else if (layout === 'grid') {
            return dataviewGridItem(data);
        }
    };
    
    const formik = useFormik({
            initialValues: {
                subject: null,
            },

            validationSchema: Yup.object({
            subject : Yup.object().nullable().required('Champ obligatoire'),
        }),

        onSubmit: async (values, { setSubmitting, resetForm }) => {
        console.log("cliquer...")

        const candidatsIds = picklistTargetValue.map(c => c.id);
        console.log(candidatsIds);
       
        const sujetCandidats: SujetCandidatsDTO = {
            subject: values.subject,
            candidats: candidatsIds,
        };

        try 
            {
                if ((user?.acteur?.etablissement?.typeCandidat.name === "Régulier/Officiel" && candidatsIds.length >= 2 && candidatsIds.length <= 5) || (user?.acteur?.etablissement?.typeCandidat.name === "Individuel/Libre" && candidatsIds.length >= 1))
                {
                    console.log("PUT");
                    const response = await CandidatureService.asignSujetToCandidat(sujetCandidats);
                    console.log('Affectation effectuée avec succés', response);
                    setMessage('Affectation effectuée avec succés');
                    toast.current.show({ severity: 'success', summary: 'Office du Bac', detail: 'Affectation effectuée avec succés', life: 4000 });
                    await picklistSourceValue;
                    await picklistTargetValue;
                }
                else
                {
                    if (candidatsIds.length < 2 || candidatsIds.length > 5)
                    {
                        toast.current.show({ severity: 'warn', summary: 'Office du Bac', detail: 'Attention, un sujet de soutenance doit être attribué à au minimum 2 candidats et au maximum 5', life: 5000 });
                    }
                    if (user?.acteur?.etablissement?.typeCandidat.name === "Individuel/Libre" && candidatsIds.length < 1)
                    {
                        toast.current.show({ severity: 'warn', summary: 'Office du Bac', detail: 'Veuillez faire l\'attribution correctement', life: 5000 });
                    }
                }
            } 
        catch (error) 
            {
                console.error('Erreur d\'affectation', error);
                setMessage('Erreur lors de l\'affectation');
                toast.current.show({ severity: 'error', summary: 'Office du Bac', detail: 'Erreur lors de l\'affectation', life: 4000 });
                
            } 
        finally 
            {
                setSubmitting(false);
            }
            setSubmitted(false);
        }
        });

    useEffect(() => {
    const sujetSelectionne = formik.values.subject;

    if (sujetSelectionne) {
    CandidatureService.getCdtsBySujet(sujetSelectionne.wording)
        .then((targetCandidats) => {
            console.log("Sujet sélectionné :", sujetSelectionne);
            const candidatsCible = Array.isArray(targetCandidats) ? targetCandidats : [];
            setPicklistTargetValue(candidatsCible);
            const idsTarget = candidatsCible.map(c => c.id);
            const filteredSource = candidats.filter(c =>
                !idsTarget.includes(c.id) &&
                c.serie?.code === sujetSelectionne?.specialite?.serie?.code &&
                (!c.subject || c.subject.trim() === "")
            );

            setPicklistSourceValue(filteredSource);

            console.log("Source (non attribués) :", filteredSource);
            console.log("Target (déjà attribués) :", candidatsCible);
        })
        .catch((error) => {
            console.error("Erreur lors du chargement des candidats du sujet :", error);
            setPicklistTargetValue([]);
            setPicklistSourceValue([]);
        });
        } else {
            setPicklistTargetValue([]);
            setPicklistSourceValue([]);
        }

    }, [formik.values.subject, candidats]);


    return (
        <div className="formgrid grid">
            <Toast ref={toast} />
            <div className="field col-12">
            <div className="card">
                    
                    <h5 className="mb-1">Informations du sujet</h5>

                    <div className="flex flex-column md:flex-row md:items-center gap-3 ml-0">
                        <label htmlFor="sujet" className="font-medium">
                            Choix du sujet de soutenance
                        </label>
                        <Dropdown
                            showClear
                            id="sujet"
                            value={formik.values.subject}
                            options={sujets}
                            onChange={(e) => formik.setFieldValue('subject', e.value)}
                            optionLabel="wording"
                            placeholder="Liste des sujets de soutenance"
                            className="w-full md:w-30rem"
                        />
                    </div>
                </div>
            </div>


            <div className="col-12">
                <div className="card">
                    <h5>Table d&apos;attribution des sujets de soutenance aux candidats</h5>
                    <PickList
                        source={picklistSourceValue}
                        target={picklistTargetValue}
                        sourceHeader="Liste des candidats ayant droit au sujet selectionné"
                        targetHeader="Candidats qui ont opté pour le sujet"
                        dataKey="id" // ← clé unique du candidat
                        filter // ← Active la recherche
                        filterBy="dosNumber,firstname,lastname" // ← champs sur lesquels filtrer
                        itemTemplate={(item) => (
                            <div>{item.dosNumber} | {item.firstname} {item.lastname} | {new Date(item.date_birth).toLocaleDateString('fr-FR')} | {item.gender}</div>
                        )}
                        onChange={(e) => {
                            setPicklistSourceValue(e.source);
                            setPicklistTargetValue(e.target);
                        }}
                        sourceStyle={{ height: '150px' }}
                        targetStyle={{ height: '150px' }}
                    />

                </div>
                <div className="formgrid grid">
                    <div className="field col-12" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                        severity="success"
                        label="Valider l'affectation du sujet aux candidats"
                        className="mr-0"
                        onClick={() => formik.handleSubmit()} // déclenche manuellement onSubmit
                        />
                    </div>
                </div>
            </div>

            {/* <div className="col-12 xl:col-4">
                <div className="card">
                    <h5>OrderList</h5>
                    <OrderList value={orderlistValue} listStyle={{ height: '200px' }} className="p-orderlist-responsive" header="Cities" itemTemplate={(item) => <div>{item.name}</div>} onChange={(e) => setOrderlistValue(e.value)}></OrderList>
                </div>
            </div> */}
        </div>
    );
};

export default ListDemo;
function setSubmitted(arg0: boolean) {
    throw new Error('Function not implemented.');
}

