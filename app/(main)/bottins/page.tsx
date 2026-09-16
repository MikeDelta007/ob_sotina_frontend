'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import ProtectedRoute from '@/layout/ProtectedRoute';
import { SERIES_CONFIG, getSerieConfig } from '@/demo/service/bottins/config';
import { createReleveApi, rechercherGlobal } from '@/demo/service/bottins/api';
import { RechercheGlobaleResultat } from '@/demo/service/bottins/types';

export default function BottinsPage() {
    const router = useRouter();
    const toast = useRef<Toast>(null);

    const seriesGroupe = useMemo(() => SERIES_CONFIG.filter((s) => !s.key.endsWith('-2eme-partie')), []);
    const seriesDeuxiemePartie = useMemo(() => SERIES_CONFIG.filter((s) => s.key.endsWith('-2eme-partie')), []);
    const optionsSeries = useMemo(
        () => [
            { label: 'Séries', items: seriesGroupe.map((s) => ({ label: s.label, value: s.key })) },
            { label: '2ème partie', items: seriesDeuxiemePartie.map((s) => ({ label: s.label, value: s.key })) }
        ],
        [seriesGroupe, seriesDeuxiemePartie]
    );

    const [numeroTable, setNumeroTable] = useState('');
    const [annee, setAnnee] = useState<number | null>(null);
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [dateNaissance, setDateNaissance] = useState('');
    const [lieuNaissance, setLieuNaissance] = useState('');

    const [recherche, setRecherche] = useState(false);
    const [resultats, setResultats] = useState<RechercheGlobaleResultat[] | null>(null);
    const [serieChoisie, setSerieChoisie] = useState<string | null>(null);
    const [telechargementId, setTelechargementId] = useState<string | null>(null);

    async function lancerRecherche() {
        const auMoinsUnCritere = numeroTable.trim() || annee || nom.trim() || prenom.trim() || dateNaissance || lieuNaissance.trim();
        if (!auMoinsUnCritere) {
            toast.current?.show({ severity: 'warn', summary: 'Office du Bac', detail: 'Veuillez renseigner au moins un critère de recherche', life: 3000 });
            return;
        }
        setRecherche(true);
        setResultats(null);
        setSerieChoisie(null);
        try {
            const res = await rechercherGlobal({
                numeroTable: numeroTable.trim(),
                annee,
                nom: nom.trim(),
                prenom: prenom.trim(),
                dateNaissance,
                lieuNaissance: lieuNaissance.trim()
            });
            setResultats(res);
        } catch (e: any) {
            toast.current?.show({ severity: 'error', summary: 'Office du Bac', detail: e?.message ?? 'Erreur lors de la recherche', life: 4000 });
        } finally {
            setRecherche(false);
        }
    }

    async function telechargerPdf(resultat: RechercheGlobaleResultat) {
        const config = getSerieConfig(resultat.serieKey);
        if (!config) return;
        setTelechargementId(resultat.id);
        try {
            await createReleveApi(config.basePath).telechargerPdf(resultat.id, resultat.nomPrenom);
        } catch (e: any) {
            toast.current?.show({ severity: 'error', summary: 'Office du Bac', detail: e?.message ?? 'Échec du téléchargement', life: 4000 });
        } finally {
            setTelechargementId(null);
        }
    }

    function modifierReleve(resultat: RechercheGlobaleResultat) {
        router.push(`/bottins/${resultat.serieKey}?editerId=${resultat.id}`);
    }

    function continuerAvecSerie() {
        if (!serieChoisie) return;
        const params = new URLSearchParams();
        if (numeroTable.trim()) params.set('numeroTable', numeroTable.trim());
        if (annee) params.set('annee', String(annee));
        if (nom.trim()) params.set('nom', nom.trim());
        if (prenom.trim()) params.set('prenom', prenom.trim());
        if (dateNaissance) params.set('dateNaissance', dateNaissance);
        if (lieuNaissance.trim()) params.set('lieuNaissance', lieuNaissance.trim());
        router.push(`/bottins/${serieChoisie}?${params.toString()}`);
    }

    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <Toast ref={toast} />
            <div className="grid">
                <div className="col-12">
                    <div className="card">
                        <h4 className="mt-0">Espace Bottins — Relevés de notes</h4>
                        <p className="text-color-secondary mb-4">
                            Recherchez un candidat par N° de table et/ou par identité pour retrouver son relevé, ou en créer un nouveau.
                        </p>

                        <div className="flex flex-wrap align-items-end gap-3 mb-3">
                            <div>
                                <label className="text-sm block mb-1">N° de table</label>
                                <InputText
                                    value={numeroTable}
                                    onChange={(e) => setNumeroTable(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && lancerRecherche()}
                                    placeholder="Ex: 001234"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="text-sm block mb-1">Année (optionnel)</label>
                                <InputNumber
                                    value={annee}
                                    onValueChange={(e) => setAnnee(e.value ?? null)}
                                    onKeyDown={(e) => e.key === 'Enter' && lancerRecherche()}
                                    useGrouping={false}
                                    placeholder="Année"
                                />
                            </div>
                            <div>
                                <label className="text-sm block mb-1">Prénom</label>
                                <InputText
                                    value={prenom}
                                    onChange={(e) => setPrenom(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && lancerRecherche()}
                                    placeholder="Prénom"
                                />
                            </div>
                            <div>
                                <label className="text-sm block mb-1">Nom</label>
                                <InputText
                                    value={nom}
                                    onChange={(e) => setNom(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && lancerRecherche()}
                                    placeholder="Nom"
                                />
                            </div>
                            <div>
                                <label className="text-sm block mb-1">Date de naissance</label>
                                <input
                                    type="date"
                                    className="p-inputtext p-component"
                                    value={dateNaissance}
                                    onChange={(e) => setDateNaissance(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && lancerRecherche()}
                                />
                            </div>
                            <div>
                                <label className="text-sm block mb-1">Lieu de naissance</label>
                                <InputText
                                    value={lieuNaissance}
                                    onChange={(e) => setLieuNaissance(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && lancerRecherche()}
                                    placeholder="Lieu de naissance"
                                />
                            </div>
                            <Button label="Rechercher" icon="pi pi-search" loading={recherche} onClick={lancerRecherche} />
                        </div>

                        {resultats && resultats.length > 0 && (
                            <div className="border-1 surface-border border-round p-3 surface-50">
                                <p className="mb-2">
                                    {resultats.length} relevé{resultats.length > 1 ? 's' : ''} trouvé{resultats.length > 1 ? 's' : ''}.
                                </p>
                                <DataTable value={resultats} dataKey="id" size="small" responsiveLayout="scroll">
                                    <Column field="nomPrenom" header="Nom et prénom" body={(r) => r.nomPrenom ?? '—'} />
                                    <Column field="numeroTable" header="N° de table" body={(r) => r.numeroTable ?? '—'} />
                                    <Column header="Série" body={(r) => getSerieConfig(r.serieKey)?.label ?? r.serieKey} />
                                    <Column field="annee" header="Année" body={(r) => r.annee ?? '—'} />
                                    <Column field="dateNaissance" header="Date de naissance" body={(r) => r.dateNaissance ?? '—'} />
                                    <Column field="lieuNaissance" header="Lieu de naissance" body={(r) => r.lieuNaissance ?? '—'} />
                                    <Column
                                        header="Actions"
                                        body={(r: RechercheGlobaleResultat) => (
                                            <div className="flex gap-2">
                                                <Button
                                                    icon="pi pi-file-pdf"
                                                    rounded
                                                    text
                                                    loading={telechargementId === r.id}
                                                    onClick={() => telechargerPdf(r)}
                                                    tooltip="Télécharger le PDF"
                                                />
                                                <Button icon="pi pi-pencil" rounded text onClick={() => modifierReleve(r)} tooltip="Modifier" />
                                            </div>
                                        )}
                                    />
                                </DataTable>
                            </div>
                        )}

                        {resultats && resultats.length === 0 && (
                            <div className="border-1 surface-border border-round p-3 surface-50">
                                <p className="mb-3">Aucun relevé trouvé pour ces critères. Sélectionnez la série du candidat pour créer son relevé :</p>
                                <div className="flex flex-wrap align-items-end gap-3">
                                    <div>
                                        <label className="text-sm block mb-1">Série</label>
                                        <Dropdown
                                            value={serieChoisie}
                                            options={optionsSeries}
                                            optionLabel="label"
                                            optionValue="value"
                                            optionGroupLabel="label"
                                            optionGroupChildren="items"
                                            onChange={(e) => setSerieChoisie(e.value)}
                                            placeholder="Choisir une série"
                                            style={{ minWidth: '16rem' }}
                                        />
                                    </div>
                                    <Button label="Continuer" icon="pi pi-arrow-right" disabled={!serieChoisie} onClick={continuerAvecSerie} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
