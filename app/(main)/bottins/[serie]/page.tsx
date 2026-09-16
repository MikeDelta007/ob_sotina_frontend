'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useFormik } from 'formik';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { RadioButton } from 'primereact/radiobutton';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import ProtectedRoute from '@/layout/ProtectedRoute';
import { getSerieConfig, SerieConfig } from '@/demo/service/bottins/config';
import { createReleveApi } from '@/demo/service/bottins/api';
import { ReleveDetail } from '@/demo/service/bottins/types';

const TYPES_ARTISTIQUES = ['DESSIN', 'MUSIQUE', 'COUTURE'] as const;
const LABEL_ARTISTIQUE: Record<(typeof TYPES_ARTISTIQUES)[number], string> = {
    DESSIN: 'Dessin',
    MUSIQUE: 'Musique',
    COUTURE: 'Couture'
};

type Prefill = { numeroTable?: string; annee?: number; nomPrenom?: string; dateNaissance?: string; lieuNaissance?: string };

function buildInitialValues(config: SerieConfig, detail?: ReleveDetail | null, prefill?: Prefill) {
    const notes: Record<string, Record<string, number | null>> = {};
    config.groupes.forEach((g) => {
        notes[g.champ] = {};
        g.matieres.forEach((m) => {
            const liste = (detail?.[g.champ] as any[]) ?? [];
            const found = liste.find((n) => n.matiereCode === m.code);
            notes[g.champ][m.code] = found?.note ?? null;
        });
    });

    // Le bloc "2ème groupe d'épreuves" + "Epreuve orale de contrôle" n'est pertinent
    // que si le candidat subit effectivement le 2ème groupe — activé via la case
    // "Second groupe", cochée par défaut si le relevé chargé a déjà des données là-dessus.
    const deuxiemeChamp = config.groupes[1]?.champ;
    const deuxiemeGroupeAdesNotes = deuxiemeChamp
        ? ((detail?.[deuxiemeChamp] as any[]) ?? []).some((n) => n?.note !== null && n?.note !== undefined)
        : false;
    const aDesControles = (detail?.epreuvesOralesControle ?? []).length > 0;
    const secondGroupe = config.hasDoubleGroupe ? deuxiemeGroupeAdesNotes || aDesControles : true;

    // "Langue" est une épreuve facultative indépendante ; Dessin/Musique/Couture
    // sont un choix unique (une seule épreuve artistique, une seule note).
    const langueFound = detail?.epreuvesFacultatives?.find((f) => f.type === 'LANGUE');
    const artistiqueFound = detail?.epreuvesFacultatives?.find((f) => f.type === 'DESSIN' || f.type === 'MUSIQUE' || f.type === 'COUTURE');
    const facultatives = {
        langue: { actif: !!langueFound, note: langueFound?.note ?? null },
        artistique: {
            type: (artistiqueFound?.type as 'DESSIN' | 'MUSIQUE' | 'COUTURE' | undefined) ?? null,
            note: artistiqueFound?.note ?? null
        }
    };

    return {
        session: detail?.session ?? 'NORMALE',
        juryNumero: detail?.juryNumero ?? '',
        annee: detail?.annee ?? prefill?.annee ?? null,
        nomPrenom: detail?.candidat?.nomPrenom ?? prefill?.nomPrenom ?? '',
        dateNaissance: detail?.candidat?.dateNaissance ?? prefill?.dateNaissance ?? '',
        lieuNaissance: detail?.candidat?.lieuNaissance ?? prefill?.lieuNaissance ?? '',
        etablissement: detail?.candidat?.etablissement ?? '',
        indicatif: detail?.candidat?.indicatif ?? '',
        options: detail?.candidat?.options ?? '',
        numeroTable: detail?.candidat?.numeroTable ?? prefill?.numeroTable ?? '',
        nationalite: detail?.candidat?.nationalite ?? '',
        nombreDeFois: detail?.candidat?.nombreDeFois ?? '',
        notes,
        educationPhysiqueNote: detail?.educationPhysique?.note ?? null,
        facultatives,
        controles: (detail?.epreuvesOralesControle ?? []).map((c) => ({ ...c })),
        secondGroupe,
        lieuDeliberation: detail?.lieuDeliberation ?? '',
        dateDeliberation: detail?.dateDeliberation ?? '',
        dateDeliberationPremierGroupe: detail?.dateDeliberationPremierGroupe ?? '',
        dateDeliberationDeuxiemeGroupe: detail?.dateDeliberationDeuxiemeGroupe ?? '',
        presidentJury: detail?.presidentJury ?? ''
    };
}

type FormValues = ReturnType<typeof buildInitialValues>;

function buildPayload(config: SerieConfig, values: FormValues) {
    const payload: Record<string, unknown> = {
        juryNumero: values.juryNumero || undefined,
        nomPrenom: values.nomPrenom || undefined,
        dateNaissance: values.dateNaissance || undefined,
        lieuNaissance: values.lieuNaissance || undefined,
        etablissement: values.etablissement || undefined,
        indicatif: values.indicatif || undefined,
        options: values.options || undefined,
        numeroTable: values.numeroTable || undefined,
        nationalite: values.nationalite || undefined,
        nombreDeFois: values.nombreDeFois || undefined,
        presidentJury: values.presidentJury || undefined
    };

    payload.lieuDeliberation = values.lieuDeliberation || undefined;
    if (config.hasDoubleGroupe) {
        payload.dateDeliberationPremierGroupe = values.dateDeliberationPremierGroupe || undefined;
        payload.dateDeliberationDeuxiemeGroupe = values.dateDeliberationDeuxiemeGroupe || undefined;
    } else {
        payload.dateDeliberation = values.dateDeliberation || undefined;
    }

    if (config.hasSession) payload.session = values.session || 'NORMALE';
    if (config.hasAnnee) payload.annee = values.annee ?? undefined;

    const deuxiemeChamp = config.groupes[1]?.champ;
    config.groupes.forEach((g, index) => {
        const estDeuxiemeGroupe = config.hasDoubleGroupe && index === 1 && g.champ === deuxiemeChamp;
        payload[g.champ] = estDeuxiemeGroupe && !values.secondGroupe ? {} : (values.notes[g.champ] ?? {});
    });

    if (config.educationPhysique === 'simple') {
        payload.educationPhysique = { note: values.educationPhysiqueNote ?? undefined };
    }

    if (config.hasEpreuvesFacultatives) {
        const epreuves: { type: string; note?: number }[] = [];
        if (values.facultatives.langue.actif) {
            epreuves.push({ type: 'LANGUE', note: values.facultatives.langue.note ?? undefined });
        }
        if (values.facultatives.artistique.type) {
            epreuves.push({ type: values.facultatives.artistique.type, note: values.facultatives.artistique.note ?? undefined });
        }
        payload.epreuvesFacultatives = epreuves;
    }

    if (config.hasEpreuvesOralesControle) {
        payload.epreuvesOralesControle = !config.hasDoubleGroupe || values.secondGroupe ? (values.controles || []).filter((c: any) => c.matiereChoisie) : [];
    }

    return payload;
}

// -----------------------------------------------------------------------
// Formulaire — remonté (via la prop `key` côté parent) à chaque changement
// de relevé édité, pour que les valeurs initiales du formulaire (issues du
// relevé chargé) soient toujours prises en compte au montage.
// -----------------------------------------------------------------------
function ReleveForm({
    config,
    detail,
    prefill,
    editingId,
    saving,
    idPourPdf,
    onSubmit,
    onCancel,
    onDownloadPdf
}: {
    config: SerieConfig;
    detail: ReleveDetail | null;
    prefill?: Prefill;
    editingId: string | null;
    saving: boolean;
    idPourPdf: string | null;
    onSubmit: (payload: Record<string, unknown>) => Promise<void>;
    onCancel: () => void;
    onDownloadPdf: (id: string, nomPrenom?: string) => void;
}) {
    const formik = useFormik<FormValues>({
        initialValues: buildInitialValues(config, detail, prefill),
        onSubmit: async (values) => {
            await onSubmit(buildPayload(config, values));
        }
    });

    function setNote(champ: string, code: string, value: number | null) {
        formik.setFieldValue('notes', { ...formik.values.notes, [champ]: { ...formik.values.notes[champ], [code]: value } });
    }

    function setLangue(patch: Partial<{ actif: boolean; note: number | null }>) {
        formik.setFieldValue('facultatives', {
            ...formik.values.facultatives,
            langue: { ...formik.values.facultatives.langue, ...patch }
        });
    }

    function setArtistique(patch: Partial<{ type: 'DESSIN' | 'MUSIQUE' | 'COUTURE' | null; note: number | null }>) {
        formik.setFieldValue('facultatives', {
            ...formik.values.facultatives,
            artistique: { ...formik.values.facultatives.artistique, ...patch }
        });
    }

    function ajouterControle() {
        formik.setFieldValue('controles', [...(formik.values.controles || []), {}]);
    }

    function retirerControle(index: number) {
        const copie = [...formik.values.controles];
        copie.splice(index, 1);
        formik.setFieldValue('controles', copie);
    }

    function setControle(index: number, patch: Record<string, unknown>) {
        const copie = [...formik.values.controles];
        copie[index] = { ...copie[index], ...patch };
        formik.setFieldValue('controles', copie);
    }

    const enEdition = editingId !== null;

    return (
        <div className="card">
            <form onSubmit={formik.handleSubmit} className="flex flex-column gap-3">
                {enEdition && (
                    <div className="flex align-items-center justify-content-between border-round bg-yellow-50 p-2 text-sm">
                        <span>Modification en cours{formik.values.nomPrenom ? ` — ${formik.values.nomPrenom}` : ''}</span>
                        <Button type="button" label="Annuler" link size="small" onClick={onCancel} />
                    </div>
                )}

                <h6 className="mb-1">Identité du candidat</h6>
                <div className="grid formgrid p-fluid">
                    <div className="col-12 lg:col-6">
                        <label className="text-sm">Nom et prénom</label>
                        <InputText name="nomPrenom" value={formik.values.nomPrenom} onChange={formik.handleChange} required />
                    </div>
                    <div className="col-6 md:col-4 lg:col-3">
                        <label className="text-sm">N° de table</label>
                        <InputText name="numeroTable" value={formik.values.numeroTable} onChange={formik.handleChange} />
                    </div>
                    {config.hasAnnee && (
                        <div className="col-6 md:col-4 lg:col-3">
                            <label className="text-sm">Année</label>
                            <InputNumber value={formik.values.annee} onValueChange={(e) => formik.setFieldValue('annee', e.value)} useGrouping={false} />
                        </div>
                    )}
                    <div className="col-6 md:col-4 lg:col-3">
                        <label className="text-sm">N° jury</label>
                        <InputText name="juryNumero" value={formik.values.juryNumero} onChange={formik.handleChange} />
                    </div>
                    {config.hasSession && (
                        <div className="col-6 md:col-4 lg:col-3">
                            <label className="text-sm">Session</label>
                            <Dropdown
                                value={formik.values.session}
                                onChange={(e) => formik.setFieldValue('session', e.value)}
                                options={[
                                    { label: 'Normale', value: 'NORMALE' },
                                    { label: 'Remplacement', value: 'REMPLACEMENT' }
                                ]}
                            />
                        </div>
                    )}
                    <div className="col-6 md:col-4 lg:col-3">
                        <label className="text-sm">Date de naissance</label>
                        <input type="date" className="p-inputtext p-component w-full" name="dateNaissance" value={formik.values.dateNaissance} onChange={formik.handleChange} />
                    </div>
                    <div className="col-6 md:col-4 lg:col-3">
                        <label className="text-sm">Lieu de naissance</label>
                        <InputText name="lieuNaissance" value={formik.values.lieuNaissance} onChange={formik.handleChange} />
                    </div>
                    <div className="col-6 md:col-4 lg:col-3">
                        <label className="text-sm">Etablissement</label>
                        <InputText name="etablissement" value={formik.values.etablissement} onChange={formik.handleChange} />
                    </div>
                    <div className="col-6 md:col-4 lg:col-3">
                        <label className="text-sm">Indicatif</label>
                        <InputText name="indicatif" value={formik.values.indicatif} onChange={formik.handleChange} />
                    </div>
                    <div className="col-6 md:col-4 lg:col-3">
                        <label className="text-sm">Options</label>
                        <InputText name="options" value={formik.values.options} onChange={formik.handleChange} />
                    </div>
                    <div className="col-6 md:col-4 lg:col-3">
                        <label className="text-sm">Nationalité (N)</label>
                        <InputText name="nationalite" value={formik.values.nationalite} onChange={formik.handleChange} />
                    </div>
                    <div className="col-6 md:col-4 lg:col-3">
                        <label className="text-sm">Nombre de fois (F)</label>
                        <InputText name="nombreDeFois" value={formik.values.nombreDeFois} onChange={formik.handleChange} />
                    </div>
                </div>

                {(config.hasDoubleGroupe ? config.groupes.slice(0, 1) : config.groupes)
                    .filter((g) => g.matieres.length > 0)
                    .map((g) => (
                        <div key={g.champ}>
                            <Divider />
                            <h6 className="mb-2">{g.titre}</h6>
                            <div className="grid formgrid p-fluid">
                                {g.matieres.map((m) => (
                                    <div className="col-6 md:col-4 lg:col-3" key={m.code}>
                                        <label className="text-sm">{m.label}</label>
                                        <InputNumber
                                            value={formik.values.notes[g.champ]?.[m.code] ?? null}
                                            onValueChange={(e) => setNote(g.champ, m.code, e.value ?? null)}
                                            min={0}
                                            max={20}
                                            useGrouping={false}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                {config.hasDoubleGroupe && (
                    <div>
                        <Divider />
                        <div className="flex align-items-center gap-2 mb-2">
                            <Checkbox inputId="secondGroupe" checked={formik.values.secondGroupe} onChange={(e) => formik.setFieldValue('secondGroupe', !!e.checked)} />
                            <label htmlFor="secondGroupe" className="font-bold">
                                Second groupe
                            </label>
                        </div>

                        {formik.values.secondGroupe && (
                            <div className="flex flex-column gap-3">
                                {config.groupes
                                    .slice(1)
                                    .filter((g) => g.matieres.length > 0)
                                    .map((g) => (
                                        <div key={g.champ}>
                                            <h6 className="mb-2">{g.titre}</h6>
                                            <div className="grid formgrid p-fluid">
                                                {g.matieres.map((m) => (
                                                    <div className="col-6 md:col-4 lg:col-3" key={m.code}>
                                                        <label className="text-sm">{m.label}</label>
                                                        <InputNumber
                                                            value={formik.values.notes[g.champ]?.[m.code] ?? null}
                                                            onValueChange={(e) => setNote(g.champ, m.code, e.value ?? null)}
                                                            min={0}
                                                            max={20}
                                                            useGrouping={false}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                {config.hasEpreuvesOralesControle && (
                                    <div>
                                        <div className="flex align-items-center justify-content-between mb-2">
                                            <h6 className="m-0">Epreuve orale de contrôle</h6>
                                            <Button type="button" icon="pi pi-plus" text size="small" onClick={ajouterControle} />
                                        </div>
                                        <div className="grid formgrid mb-1">
                                            <div className="col-12 sm:col-4 lg:col-3">
                                                <label className="text-sm font-bold">Matière choisie</label>
                                            </div>
                                            <div className="col-4 sm:col-2 lg:col-2">
                                                <label className="text-sm font-bold">Coef</label>
                                            </div>
                                            <div className="col-4 sm:col-2 lg:col-2">
                                                <label className="text-sm font-bold">Rappel des points obtenus</label>
                                            </div>
                                            <div className="col-3 sm:col-2 lg:col-2">
                                                <label className="text-sm font-bold">Note au 2nd groupe</label>
                                            </div>
                                            <div className="col-1" />
                                        </div>
                                        {(formik.values.controles || []).map((c: any, index: number) => (
                                            <div key={index} className="grid formgrid p-fluid mb-2 align-items-center">
                                                <div className="col-12 sm:col-4 lg:col-3">
                                                    <InputText placeholder="Matière" value={c.matiereChoisie ?? ''} onChange={(e) => setControle(index, { matiereChoisie: e.target.value })} />
                                                </div>
                                                <div className="col-4 sm:col-2 lg:col-2">
                                                    <InputNumber placeholder="Coef" value={c.coefficient ?? null} onValueChange={(e) => setControle(index, { coefficient: e.value })} useGrouping={false} />
                                                </div>
                                                <div className="col-4 sm:col-2 lg:col-2">
                                                    <InputNumber
                                                        placeholder="Rappel"
                                                        value={c.rappelPointsObtenus1erGroupe ?? null}
                                                        onValueChange={(e) => setControle(index, { rappelPointsObtenus1erGroupe: e.value })}
                                                        useGrouping={false}
                                                    />
                                                </div>
                                                <div className="col-3 sm:col-2 lg:col-2">
                                                    <InputNumber placeholder="Note" value={c.nouvelleNoteSur20 ?? null} onValueChange={(e) => setControle(index, { nouvelleNoteSur20: e.value })} min={0} max={20} useGrouping={false} />
                                                </div>
                                                <div className="col-1">
                                                    <Button type="button" icon="pi pi-trash" text severity="danger" onClick={() => retirerControle(index)} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {config.educationPhysique === 'simple' && (
                    <div>
                        <Divider />
                        <h6 className="mb-2">Education physique</h6>
                        <InputNumber
                            value={formik.values.educationPhysiqueNote}
                            onValueChange={(e) => formik.setFieldValue('educationPhysiqueNote', e.value ?? null)}
                            min={0}
                            max={20}
                            useGrouping={false}
                        />
                    </div>
                )}

                {config.hasEpreuvesFacultatives && (
                    <div>
                        <Divider />
                        <h6 className="mb-2">Epreuves facultatives</h6>

                        <div className="flex align-items-center gap-2 mb-3">
                            <Checkbox checked={formik.values.facultatives.langue.actif} onChange={(e) => setLangue({ actif: !!e.checked })} />
                            <span className="text-sm w-7rem">Langue</span>
                            <InputNumber
                                value={formik.values.facultatives.langue.note}
                                onValueChange={(e) => setLangue({ note: e.value ?? null })}
                                disabled={!formik.values.facultatives.langue.actif}
                                min={0}
                                max={20}
                                useGrouping={false}
                                className="w-6rem"
                            />
                        </div>

                        <p className="text-sm text-color-secondary mb-2">Epreuve artistique (choix unique — une seule note)</p>
                        <div className="flex flex-wrap align-items-center gap-4">
                            {TYPES_ARTISTIQUES.map((type) => (
                                <div key={type} className="flex align-items-center gap-2">
                                    <RadioButton inputId={`artistique-${type}`} checked={formik.values.facultatives.artistique.type === type} onChange={() => setArtistique({ type })} />
                                    <label htmlFor={`artistique-${type}`} className="text-sm">
                                        {LABEL_ARTISTIQUE[type]}
                                    </label>
                                </div>
                            ))}
                            <div className="flex align-items-center gap-2">
                                <RadioButton inputId="artistique-aucune" checked={formik.values.facultatives.artistique.type === null} onChange={() => setArtistique({ type: null, note: null })} />
                                <label htmlFor="artistique-aucune" className="text-sm">
                                    Aucune
                                </label>
                            </div>
                            {formik.values.facultatives.artistique.type && (
                                <div className="w-6rem">
                                    <label className="text-sm block mb-1">Note</label>
                                    <InputNumber value={formik.values.facultatives.artistique.note} onValueChange={(e) => setArtistique({ note: e.value ?? null })} min={0} max={20} useGrouping={false} />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <Divider />
                <h6 className="mb-2">Délibération</h6>
                {config.hasDoubleGroupe ? (
                    <div className="grid formgrid p-fluid">
                        <div className="col-6 md:col-4">
                            <label className="text-sm">Lieu de délibération</label>
                            <InputText name="lieuDeliberation" value={formik.values.lieuDeliberation} onChange={formik.handleChange} />
                        </div>
                        <div className="col-6 md:col-4">
                            <label className="text-sm">Date de délibération — 1er groupe</label>
                            <input
                                type="date"
                                className="p-inputtext p-component w-full"
                                name="dateDeliberationPremierGroupe"
                                value={formik.values.dateDeliberationPremierGroupe}
                                onChange={formik.handleChange}
                            />
                        </div>
                        {formik.values.secondGroupe && (
                            <div className="col-6 md:col-4">
                                <label className="text-sm">Date de délibération — 2ème groupe</label>
                                <input
                                    type="date"
                                    className="p-inputtext p-component w-full"
                                    name="dateDeliberationDeuxiemeGroupe"
                                    value={formik.values.dateDeliberationDeuxiemeGroupe}
                                    onChange={formik.handleChange}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                <div className="grid formgrid p-fluid">
                    <div className="col-6 md:col-4">
                        <label className="text-sm">Lieu de délibération</label>
                        <InputText name="lieuDeliberation" value={formik.values.lieuDeliberation} onChange={formik.handleChange} />
                    </div>
                    <div className="col-6 md:col-4">
                        <label className="text-sm">Date de délibération</label>
                        <input type="date" className="p-inputtext p-component w-full" name="dateDeliberation" value={formik.values.dateDeliberation} onChange={formik.handleChange} />
                    </div>
                </div>
                )}

                <div className="flex align-items-center gap-2 pt-3 mt-2" style={{ borderTop: '1px solid var(--surface-border)' }}>
                    <Button type="submit" label={enEdition ? 'Enregistrer les modifications' : 'Créer le relevé'} icon="pi pi-save" loading={saving} />
                    {idPourPdf && <Button type="button" label="Télécharger le PDF" icon="pi pi-file-pdf" outlined onClick={() => onDownloadPdf(idPourPdf, formik.values.nomPrenom)} />}
                </div>
            </form>
        </div>
    );
}

export default function SeriePage() {
    const params = useParams<{ serie: string }>();
    const serieKey = params.serie;
    const config = useMemo(() => getSerieConfig(serieKey), [serieKey]);
    const api = useMemo(() => (config ? createReleveApi(config.basePath) : null), [config]);
    const toast = useRef<Toast>(null);

    const searchParams = useSearchParams();
    const prefill = useMemo(() => {
        const numeroTable = searchParams.get('numeroTable') || undefined;
        const anneeStr = searchParams.get('annee');
        const annee = anneeStr ? Number(anneeStr) : undefined;
        const nom = searchParams.get('nom') || undefined;
        const prenom = searchParams.get('prenom') || undefined;
        const nomPrenom = [prenom, nom].filter(Boolean).join(' ') || undefined;
        const dateNaissance = searchParams.get('dateNaissance') || undefined;
        const lieuNaissance = searchParams.get('lieuNaissance') || undefined;
        return numeroTable || annee || nomPrenom || dateNaissance || lieuNaissance
            ? { numeroTable, annee, nomPrenom, dateNaissance, lieuNaissance }
            : undefined;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingDetail, setEditingDetail] = useState<ReleveDetail | null>(null);
    const [dernierId, setDernierId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    function nouveauReleve() {
        setEditingId(null);
        setEditingDetail(null);
        setDernierId(null);
    }

    async function modifierReleve(id: string) {
        if (!api) return;
        try {
            const detail = await api.obtenir(id);
            setEditingDetail(detail);
            setEditingId(id);
            setDernierId(null);
        } catch (e: any) {
            toast.current?.show({ severity: 'error', summary: 'Office du Bac', detail: e?.message ?? 'Relevé introuvable', life: 4000 });
        }
    }

    useEffect(() => {
        const editerId = searchParams.get('editerId');
        if (editerId) modifierReleve(editerId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [api]);

    async function telechargerPdf(id: string, nomPrenom?: string) {
        if (!api) return;
        try {
            await api.telechargerPdf(id, `releve-${config?.key}-${nomPrenom ?? id}.pdf`);
        } catch (e: any) {
            toast.current?.show({ severity: 'error', summary: 'Office du Bac', detail: e?.message ?? 'Échec du téléchargement', life: 4000 });
        }
    }

    async function handleFormSubmit(payload: Record<string, unknown>) {
        if (!api || !config) return;
        setSaving(true);
        try {
            const releve = editingId ? await api.mettreAJour(editingId, payload as any) : await api.creer(payload as any);
            setDernierId(releve.id);
            toast.current?.show({ severity: 'success', summary: 'Office du Bac', detail: editingId ? 'Relevé mis à jour' : 'Relevé créé', life: 3000 });
        } catch (e: any) {
            toast.current?.show({ severity: 'error', summary: 'Office du Bac', detail: e?.message ?? 'Erreur lors de l’enregistrement', life: 4000 });
        } finally {
            setSaving(false);
        }
    }

    if (!config || !api) {
        return (
            <div className="grid">
                <div className="col-12">
                    <div className="card">
                        <p>Série inconnue.</p>
                        <Link href="/bottins">Retour à la liste des séries</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <Toast ref={toast} />
            <div className="grid">
                <div className="col-12">
                    <div className="flex align-items-center justify-content-between mb-3">
                        <div>
                            <Link href="/bottins" className="text-sm text-color-secondary">
                                ← Toutes les séries
                            </Link>
                            <h4 className="m-0 mt-1">Bottin — Série {config.label}</h4>
                        </div>
                        <Button label="Nouveau relevé" icon="pi pi-plus" size="small" outlined onClick={nouveauReleve} />
                    </div>
                </div>

                <div className="col-12">
                    <ReleveForm
                        key={editingId ?? 'nouveau'}
                        config={config}
                        detail={editingId ? editingDetail : null}
                        prefill={prefill}
                        editingId={editingId}
                        saving={saving}
                        idPourPdf={editingId ?? dernierId}
                        onSubmit={handleFormSubmit}
                        onCancel={nouveauReleve}
                        onDownloadPdf={telechargerPdf}
                    />
                </div>
            </div>
        </ProtectedRoute>
    );
}
