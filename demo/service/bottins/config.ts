// Config déclarative des 29 séries de relevés de notes (bottins).
// Chaque entrée décrit la forme du formulaire de saisie et du tableau pour
// une série donnée, afin qu'une seule page générique (/bottins/[serie])
// puisse servir toutes les séries.

export interface Matiere {
    code: string;
    label: string;
}

export interface GroupeMatieres {
    /** Nom du champ envoyé au backend dans le SaisieRequest (ex: notesPremierGroupe). */
    champ: string;
    titre: string;
    matieres: Matiere[];
}

export interface SerieConfig {
    /** Identifiant utilisé dans l'URL /bottins/[serie] et pour retrouver la config. */
    key: string;
    label: string;
    /** Chemin relatif à la baseURL axios (".../ob/api/v1/"), ex: "/releves-a1". */
    basePath: string;
    hasSession: boolean;
    hasAnnee: boolean;
    hasMention: boolean;
    hasEpreuvesOralesControle: boolean;
    hasEpreuvesFacultatives: boolean;
    educationPhysique: 'none' | 'simple';
    groupes: GroupeMatieres[];
}

const g1g2 = (premier: Matiere[], deuxieme: Matiere[] = []): GroupeMatieres[] => [
    { champ: 'notesPremierGroupe', titre: '1er groupe d’épreuves', matieres: premier },
    { champ: 'notesDeuxiemeGroupe', titre: '2ème groupe d’épreuves', matieres: deuxieme }
];

const ecritesOrales = (ecrites: Matiere[], orales: Matiere[]): GroupeMatieres[] => [
    { champ: 'notesEcrites', titre: 'Épreuves écrites', matieres: ecrites },
    { champ: 'notesOrales', titre: 'Épreuves orales', matieres: orales }
];

// ---------------------------------------------------------------------
// Séries "1er groupe / 2ème groupe" (23 modules)
// ---------------------------------------------------------------------

const SERIES_GROUPE: SerieConfig[] = [
    {
        key: 'a1',
        label: 'A1',
        basePath: '/releves-a1',
        hasSession: true,
        hasAnnee: true,
        hasMention: true,
        hasEpreuvesOralesControle: true,
        hasEpreuvesFacultatives: true,
        educationPhysique: 'simple',
        groupes: g1g2(
            [
                { code: 'FR_ECRIT', label: 'Français (écrit)' },
                { code: 'FR_ORAL', label: 'Français (oral)' },
                { code: 'PHILO', label: 'Philosophie (écrit)' },
                { code: 'LAT_GREC1', label: 'Latin ou Grec (écrit)' },
                { code: 'HIST_GEO', label: 'Histoire et Géographie (oral)' },
                { code: 'LV', label: 'Langue Vivante (oral)' }
            ],
            [
                { code: 'LAT_GREC2', label: 'Grec ou Latin' },
                { code: 'MATH', label: 'Mathématiques' }
            ]
        )
    },
    {
        key: 'a2',
        label: 'A2',
        basePath: '/releves-a2',
        hasSession: true,
        hasAnnee: true,
        hasMention: true,
        hasEpreuvesOralesControle: true,
        hasEpreuvesFacultatives: true,
        educationPhysique: 'simple',
        groupes: g1g2(
            [
                { code: 'FR_ECRIT', label: 'Français (écrit)' },
                { code: 'FR_ORAL', label: 'Français (oral)' },
                { code: 'PHILO', label: 'Philosophie (écrit)' },
                { code: 'LAT_GREC1', label: 'Latin ou Grec (écrit)' },
                { code: 'HIST_GEO', label: 'Histoire et Géographie (oral)' },
                { code: 'LV', label: 'Langue Vivante (oral)' }
            ],
            [
                { code: 'LAT_GREC2', label: 'Grec ou Latin' },
                { code: 'MATH', label: 'Mathématiques' }
            ]
        )
    },
    {
        key: 'a3',
        label: 'A3',
        basePath: '/releves-a3',
        hasSession: true,
        hasAnnee: true,
        hasMention: true,
        hasEpreuvesOralesControle: true,
        hasEpreuvesFacultatives: true,
        educationPhysique: 'simple',
        groupes: g1g2([
            { code: 'FR_ECRIT', label: 'Français (écrit)' },
            { code: 'FR_ORAL', label: 'Français (oral)' },
            { code: 'PHILO', label: 'Philosophie' },
            { code: 'HIST_GEO', label: 'Histoire et Géographie' },
            { code: 'LV1_ECRIT', label: 'Langue Vivante I (écrit)' },
            { code: 'MATH', label: 'Mathématiques' },
            { code: 'LV2_ECRIT', label: 'Langue Vivante II (écrit)' },
            { code: 'LV1_ORAL', label: 'Langue Vivante I (oral)' }
        ])
    },
    {
        key: 'a4',
        label: 'A4',
        basePath: '/releves-a4',
        hasSession: true,
        hasAnnee: true,
        hasMention: true,
        hasEpreuvesOralesControle: true,
        hasEpreuvesFacultatives: true,
        educationPhysique: 'simple',
        groupes: g1g2(
            [
                { code: 'FR_ECRIT', label: 'Français (écrit)' },
                { code: 'FR_ORAL', label: 'Français (oral)' },
                { code: 'PHILO', label: 'Philosophie' },
                { code: 'LV1_ECRIT', label: 'Langue Vivante I (écrit)' },
                { code: 'HIST_GEO', label: 'Histoire et Géographie' },
                { code: 'MATH', label: 'Mathématiques' }
            ],
            [{ code: 'LANGUE_VIVANTE', label: 'Langue Vivante (2ème groupe)' }]
        )
    },
    {
        key: 'b',
        label: 'B',
        basePath: '/releves-b',
        hasSession: true,
        hasAnnee: true,
        hasMention: true,
        hasEpreuvesOralesControle: true,
        hasEpreuvesFacultatives: true,
        educationPhysique: 'simple',
        groupes: g1g2([
            { code: 'FR_ECRIT', label: 'Français (écrit)' },
            { code: 'FR_ORAL', label: 'Français (oral)' },
            { code: 'PHILO', label: 'Philosophie' },
            { code: 'HIST_GEO', label: 'Histoire et Géographie' },
            { code: 'SC_ECO_SOC', label: 'Sciences Economiques et Sociales' },
            { code: 'MATH', label: 'Mathématiques' },
            { code: 'LV1', label: 'Langue Vivante I' },
            { code: 'LV2', label: 'Langue Vivante II' }
        ])
    },
    {
        key: 'd',
        label: 'D',
        basePath: '/releves-d',
        hasSession: true,
        hasAnnee: true,
        hasMention: true,
        hasEpreuvesOralesControle: true,
        hasEpreuvesFacultatives: true,
        educationPhysique: 'simple',
        groupes: g1g2([
            { code: 'FR_ECRIT', label: 'Français (écrit)' },
            { code: 'FR_ORAL', label: 'Français (oral)' },
            { code: 'PHILO', label: 'Philosophie' },
            { code: 'MATH', label: 'Mathématiques' },
            { code: 'SC_PHYS', label: 'Sciences Physiques' },
            { code: 'SC_NAT', label: 'Sciences Naturelles' },
            { code: 'HIST_GEO', label: 'Histoire et Géographie' },
            { code: 'LV', label: 'Langue Vivante' }
        ])
    },
    {
        key: 'e',
        label: 'E',
        basePath: '/releves-e',
        hasSession: true,
        hasAnnee: true,
        hasMention: true,
        hasEpreuvesOralesControle: true,
        hasEpreuvesFacultatives: true,
        educationPhysique: 'simple',
        groupes: g1g2([
            { code: 'FR_ECRIT', label: 'Français (écrit)' },
            { code: 'FR_ORAL', label: 'Français (oral)' },
            { code: 'PHILO', label: 'Philosophie' },
            { code: 'MATH', label: 'Mathématiques' },
            { code: 'SC_PHYS', label: 'Sciences Physiques' },
            { code: 'CONS_MECA', label: 'Construction Mécanique' },
            { code: 'AN_FAB_TAUT', label: 'Analyse de Fabrication / Technologie Automatisée' },
            { code: 'TECH_PRATIQUE', label: 'Technique Pratique' },
            { code: 'LV', label: 'Langue Vivante' }
        ])
    },
    {
        key: 'f1',
        label: 'F1',
        basePath: '/releves-f1',
        hasSession: true,
        hasAnnee: true,
        hasMention: true,
        hasEpreuvesOralesControle: true,
        hasEpreuvesFacultatives: true,
        educationPhysique: 'simple',
        groupes: g1g2([
            { code: 'FR_ECRIT', label: 'Français (écrit)' },
            { code: 'FR_ORAL', label: 'Français (oral)' },
            { code: 'MATH', label: 'Mathématiques' },
            { code: 'MECANIQUE', label: 'Mécanique' },
            { code: 'CONST_MECA', label: 'Construction Mécanique' },
            { code: 'ANALYSE_FAB', label: 'Analyse de Fabrication' },
            { code: 'ELEC_METAL', label: 'Electricité - Métallurgie' },
            { code: 'TECHNO_AUTOM', label: 'Technologie Automatisée' },
            { code: 'ANGLAIS', label: 'Anglais' },
            { code: 'EPR_PRATIQUE', label: 'Epreuve Pratique' }
        ])
    },
    {
        key: 'f7',
        label: 'F7',
        basePath: '/releves-f7',
        hasSession: true,
        hasAnnee: true,
        hasMention: true,
        hasEpreuvesOralesControle: true,
        hasEpreuvesFacultatives: true,
        educationPhysique: 'simple',
        groupes: g1g2([
            { code: 'FR_ECRIT', label: 'Français (écrit)' },
            { code: 'FR_ORAL', label: 'Français (oral)' },
            { code: 'MATH', label: 'Mathématiques' },
            { code: 'BIOLOGIE', label: 'Biologie' },
            { code: 'BIOCHIMIE', label: 'Biochimie' },
            { code: 'MICROBIO', label: 'Microbiologie et Immunologie' },
            { code: 'PHYSIOLOGIE', label: 'Physiologie' },
            { code: 'LV', label: 'Langue Vivante' },
            { code: 'TP_BIOLOGIE', label: 'Travaux Pratiques de Biologie' },
            { code: 'TP_BIOCHIMIE', label: 'Travaux Pratiques de Biochimie' }
        ])
    },
    {
        key: 'g',
        label: 'G',
        basePath: '/releves-g',
        hasSession: true,
        hasAnnee: true,
        hasMention: true,
        hasEpreuvesOralesControle: true,
        hasEpreuvesFacultatives: true,
        educationPhysique: 'simple',
        groupes: g1g2([
            { code: 'TECH_EXPR', label: 'Techniques d’Expression et de Communication' },
            { code: 'ANGLAIS', label: 'Anglais' },
            { code: 'PHILO', label: 'Philosophie' },
            { code: 'MATH', label: 'Mathématiques' },
            { code: 'ECONOMIE_GEN', label: 'Economie Générale' },
            { code: 'ETUDE_CAS', label: 'Etude de cas' },
            { code: 'CONN_MONDE', label: 'Connaissance du monde' },
            { code: 'CORRESPONDANCE', label: 'Correspondance Commerciale' },
            { code: 'TRAITEMENT_INFO', label: 'Traitement Informatique des Gestions' }
        ])
    },
    {
        key: 'g1',
        label: 'G1',
        basePath: '/releves-g1',
        hasSession: true,
        hasAnnee: true,
        hasMention: true,
        hasEpreuvesOralesControle: true,
        hasEpreuvesFacultatives: true,
        educationPhysique: 'simple',
        groupes: g1g2([
            { code: 'FR_ECRIT', label: 'Français (écrit)' },
            { code: 'FR_ORAL', label: 'Français (oral)' },
            { code: 'PHILO', label: 'Philosophie' },
            { code: 'ECONOMIE', label: 'Economie' },
            { code: 'LV1', label: 'Langue Vivante I' },
            { code: 'ETUDE_CAS', label: 'Etude de cas' },
            { code: 'CONN_MONDE', label: 'Connaissance du monde' },
            { code: 'ORGAN_ADMIN', label: 'Organisation Administrative' },
            { code: 'LV2', label: 'Langue Vivante II' }
        ])
    },
    {
        key: 'g2',
        label: 'G2',
        basePath: '/releves-g2',
        hasSession: true,
        hasAnnee: true,
        hasMention: true,
        hasEpreuvesOralesControle: true,
        hasEpreuvesFacultatives: true,
        educationPhysique: 'simple',
        groupes: g1g2([
            { code: 'FR_ECRIT', label: 'Français (écrit)' },
            { code: 'FR_ORAL', label: 'Français (oral)' },
            { code: 'PHILO', label: 'Philosophie' },
            { code: 'MATH', label: 'Mathématiques' },
            { code: 'ECONOMIE', label: 'Economie' },
            { code: 'ETUDE_CAS', label: 'Etude de cas' },
            { code: 'CONN_MONDE', label: 'Connaissance du monde' },
            { code: 'CORRESPON_DACTYLO', label: 'Correspondance Dactylographiée' },
            { code: 'LV1', label: 'Langue Vivante I' },
            { code: 'LV2', label: 'Langue Vivante II' }
        ])
    },
    {
        key: 'lprime1',
        label: "L'1",
        basePath: '/releves-lprime1',
        hasSession: true,
        hasAnnee: true,
        hasMention: true,
        hasEpreuvesOralesControle: true,
        hasEpreuvesFacultatives: true,
        educationPhysique: 'simple',
        groupes: g1g2([
            { code: 'FRANCAIS', label: 'Français' },
            { code: 'PHILO', label: 'Philosophie' },
            { code: 'HIST_GEO', label: 'Histoire et Géographie' },
            { code: 'LV1_ECRIT', label: 'Langue Vivante I (écrit)' },
            { code: 'MATH', label: 'Mathématiques' },
            { code: 'LV2', label: 'Langue Vivante II' },
            { code: 'LV1_ORAL', label: 'Langue Vivante I (oral)' }
        ])
    },
    {
        key: 'l1a',
        label: 'L1A',
        basePath: '/releves-l1a',
        hasSession: true,
        hasAnnee: true,
        hasMention: true,
        hasEpreuvesOralesControle: true,
        hasEpreuvesFacultatives: true,
        educationPhysique: 'simple',
        groupes: g1g2([
            { code: 'FRANCAIS', label: 'Français' },
            { code: 'PHILO', label: 'Philosophie' },
            { code: 'HIST_GEO', label: 'Histoire et Géographie' },
            { code: 'LV1', label: 'Langue Vivante I' },
            { code: 'MATH', label: 'Mathématiques' },
            { code: 'GREC', label: 'Grec' },
            { code: 'LATIN_ARABE', label: 'Latin ou Arabe Classique' }
        ])
    },
    {
        key: 'l1b',
        label: 'L1B',
        basePath: '/releves-l1b',
        hasSession: true,
        hasAnnee: true,
        hasMention: true,
        hasEpreuvesOralesControle: true,
        hasEpreuvesFacultatives: true,
        educationPhysique: 'simple',
        groupes: g1g2([
            { code: 'FRANCAIS', label: 'Français' },
            { code: 'PHILO', label: 'Philosophie' },
            { code: 'HIST_GEO', label: 'Histoire et Géographie' },
            { code: 'LV1', label: 'Langue Vivante I' },
            { code: 'MATH', label: 'Mathématiques' },
            { code: 'LV2', label: 'Langue Vivante II' },
            { code: 'LATIN_ARABE', label: 'Latin ou Arabe Classique' }
        ])
    },
    {
        key: 'l2',
        label: 'L2',
        basePath: '/releves-l2',
        hasSession: true,
        hasAnnee: true,
        hasMention: true,
        hasEpreuvesOralesControle: true,
        hasEpreuvesFacultatives: true,
        educationPhysique: 'simple',
        groupes: g1g2([
            { code: 'FRANCAIS', label: 'Français' },
            { code: 'PHILO', label: 'Philosophie' },
            { code: 'HIST_GEO', label: 'Histoire et Géographie' },
            { code: 'MATH', label: 'Mathématiques' },
            { code: 'LV1', label: 'Langue Vivante I' },
            { code: 'LV2_OU_ECO', label: 'Langue Vivante II ou Economie' },
            { code: 'SC_NATURE', label: 'Sciences de la Nature' }
        ])
    },
    {
        key: 's1',
        label: 'S1',
        basePath: '/releves-s1',
        hasSession: true,
        hasAnnee: true,
        hasMention: true,
        hasEpreuvesOralesControle: true,
        hasEpreuvesFacultatives: true,
        educationPhysique: 'simple',
        groupes: g1g2([
            { code: 'FRANCAIS', label: 'Français' },
            { code: 'PHILO', label: 'Philosophie' },
            { code: 'MATH', label: 'Mathématiques' },
            { code: 'SC_PHYS', label: 'Sciences Physiques' },
            { code: 'HIST_GEO', label: 'Histoire et Géographie' },
            { code: 'SC_NAT', label: 'Sciences Naturelles' },
            { code: 'ANGLAIS', label: 'Anglais' }
        ])
    },
    {
        key: 's2',
        label: 'S2',
        basePath: '/releves-s2',
        hasSession: true,
        hasAnnee: true,
        hasMention: true,
        hasEpreuvesOralesControle: true,
        hasEpreuvesFacultatives: true,
        educationPhysique: 'simple',
        groupes: g1g2([
            { code: 'FRANCAIS', label: 'Français' },
            { code: 'PHILO', label: 'Philosophie' },
            { code: 'MATH', label: 'Mathématiques' },
            { code: 'SC_PHYS', label: 'Sciences Physiques' },
            { code: 'SC_NAT', label: 'Sciences Naturelles' },
            { code: 'HIST_GEO', label: 'Histoire et Géographie' },
            { code: 'ANGLAIS', label: 'Anglais' }
        ])
    },
    {
        key: 's3',
        label: 'S3',
        basePath: '/releves-s3',
        hasSession: true,
        hasAnnee: true,
        hasMention: true,
        hasEpreuvesOralesControle: true,
        hasEpreuvesFacultatives: true,
        educationPhysique: 'simple',
        groupes: g1g2([
            { code: 'FRANCAIS', label: 'Français' },
            { code: 'PHILO', label: 'Philosophie' },
            { code: 'MATH', label: 'Mathématiques' },
            { code: 'SC_PHYS', label: 'Sciences Physiques' },
            { code: 'CONST_MECA', label: 'Construction Mécanique' },
            { code: 'ANAL_FAB_AUTO', label: 'Analyse de Fabrication / Technologie Automatisée' },
            { code: 'ANGLAIS', label: 'Anglais' },
            { code: 'EPR_PRATIQUE', label: "Epreuve Pratique d'Atelier" }
        ])
    },
    {
        key: 's4',
        label: 'S4',
        basePath: '/releves-s4',
        hasSession: true,
        hasAnnee: true,
        hasMention: true,
        hasEpreuvesOralesControle: true,
        hasEpreuvesFacultatives: true,
        educationPhysique: 'simple',
        groupes: g1g2([
            { code: 'PHILO', label: 'Philosophie' },
            { code: 'MATH', label: 'Mathématiques' },
            { code: 'SC_PHYS', label: 'Sciences Physiques' },
            { code: 'SVT', label: 'Sciences de la Vie et de la Terre' },
            { code: 'FRANCAIS', label: 'Français' },
            { code: 'HIST_GEO', label: 'Histoire et Géographie' },
            { code: 'ANGLAIS', label: 'Anglais' },
            { code: 'ECOLOGIE', label: 'Ecologie / Environnement' },
            { code: 'ZOOTECHNIQUE', label: 'Zootechnique' },
            { code: 'PHYTOTECHNIQUE', label: 'Phytotechnique' }
        ])
    },
    {
        key: 's5',
        label: 'S5',
        basePath: '/releves-s5',
        hasSession: true,
        hasAnnee: true,
        hasMention: true,
        hasEpreuvesOralesControle: true,
        hasEpreuvesFacultatives: true,
        educationPhysique: 'simple',
        groupes: g1g2([
            { code: 'PHILO', label: 'Philosophie' },
            { code: 'MATH', label: 'Mathématiques' },
            { code: 'SC_PHYS', label: 'Sciences Physiques' },
            { code: 'SVT', label: 'Sciences de la Vie et de la Terre' },
            { code: 'FRANCAIS', label: 'Français' },
            { code: 'HIST_GEO', label: 'Histoire et Géographie' },
            { code: 'ANGLAIS', label: 'Anglais' },
            { code: 'TECH_TRANSF', label: 'Techniques de Transformation et de Conservation' },
            { code: 'MICROBIOLOGIE', label: 'Microbiologie' },
            { code: 'BIOCHIMIE', label: 'Biochimie' }
        ])
    },
    {
        key: 't1',
        label: 'T1',
        basePath: '/releves-t1',
        hasSession: true,
        hasAnnee: true,
        hasMention: true,
        hasEpreuvesOralesControle: true,
        hasEpreuvesFacultatives: true,
        educationPhysique: 'simple',
        groupes: g1g2([
            { code: 'TECH_EXPR', label: "Technique d'Expression et de Communication" },
            { code: 'MATH', label: 'Mathématiques' },
            { code: 'MECANIQUE', label: 'Mécanique' },
            { code: 'CONST_MECA', label: 'Construction Mécanique' },
            { code: 'ANAL_FAB_OUTIL', label: 'Analyse de Fabrication / Outillage' },
            { code: 'ELECTRICITE', label: 'Electricité' },
            { code: 'METALLURGIE', label: 'Métallurgie' },
            { code: 'SC_PHYS', label: 'Sciences Physiques' },
            { code: 'ANGLAIS', label: 'Anglais' },
            { code: 'TECHNO_AUTOM', label: 'Technologie et Automatisme' },
            { code: 'EPR_PRATIQUE', label: "Epreuve Pratique d'Atelier" }
        ])
    },
    {
        key: 't2',
        label: 'T2',
        basePath: '/releves-t2',
        hasSession: true,
        hasAnnee: true,
        hasMention: true,
        hasEpreuvesOralesControle: true,
        hasEpreuvesFacultatives: true,
        educationPhysique: 'simple',
        groupes: g1g2([
            { code: 'TECH_EXPR', label: "Technique d'Expression et de Communication" },
            { code: 'MATH', label: 'Mathématiques' },
            { code: 'ELECTROTECH', label: 'Electrotechnique / Electronique' },
            { code: 'CONST_ELECTROMECA', label: 'Construction Electromécanique' },
            { code: 'SCHEMA_AUTOM', label: 'Schéma - Automatisme - Informatique' },
            { code: 'ANALYSE_SYST', label: 'Analyse des Systèmes Electriques' },
            { code: 'SC_PHYS', label: 'Sciences Physiques' },
            { code: 'ANGLAIS', label: 'Anglais' },
            { code: 'CONST_ELEC', label: 'Construction Electrique' },
            { code: 'ESSAIS_MESURES', label: 'Essais et Mesures' }
        ])
    }
];

// ---------------------------------------------------------------------
// Séries "2ème partie" (6 modules) — pas d'année, pas de mention,
// pas d'épreuve de contrôle ni de facultatives, décision à 2 issues.
// ---------------------------------------------------------------------

const SERIES_DEUXIEME_PARTIE: SerieConfig[] = [
    {
        key: 'a1-2eme-partie',
        label: 'A1 — 2ème partie',
        basePath: '/releves-a1-2eme-partie',
        hasSession: false,
        hasAnnee: false,
        hasMention: false,
        hasEpreuvesOralesControle: false,
        hasEpreuvesFacultatives: false,
        educationPhysique: 'none',
        groupes: ecritesOrales(
            [
                { code: 'PHILO', label: 'Philosophie' },
                { code: 'LAT_AR', label: 'Latin - Arabe' },
                { code: 'GREC', label: 'Grec' },
                { code: 'LV', label: 'Langue Vivante' }
            ],
            [
                { code: 'LAT_GR_AR_ORAL', label: 'Latin - Grec ou Arabe' },
                { code: 'HIST_GEO', label: 'Histoire et Géographie' },
                { code: 'MATH', label: 'Mathématiques' }
            ]
        )
    },
    {
        key: 'a2-2eme-partie',
        label: 'A2 — 2ème partie',
        basePath: '/releves-a2-2eme-partie',
        hasSession: false,
        hasAnnee: false,
        hasMention: false,
        hasEpreuvesOralesControle: false,
        hasEpreuvesFacultatives: false,
        educationPhysique: 'none',
        groupes: ecritesOrales(
            [
                { code: 'PHILO', label: 'Philosophie' },
                { code: 'LV1_ECRIT', label: 'Langue Vivante 1 (écrit)' },
                { code: 'HIST_GEO', label: 'Histoire et Géographie' },
                { code: 'LAT_AR', label: 'Latin - Arabe' }
            ],
            [
                { code: 'LV1_ORAL', label: 'Langue Vivante 1 (oral)' },
                { code: 'LV2_ORAL', label: 'Langue Vivante 2 (oral)' },
                { code: 'MATH', label: 'Mathématiques' }
            ]
        )
    },
    {
        key: 'a3-2eme-partie',
        label: 'A3 — 2ème partie',
        basePath: '/releves-a3-2eme-partie',
        hasSession: false,
        hasAnnee: false,
        hasMention: false,
        hasEpreuvesOralesControle: false,
        hasEpreuvesFacultatives: false,
        educationPhysique: 'none',
        groupes: ecritesOrales(
            [
                { code: 'PHILO', label: 'Philosophie' },
                { code: 'LV1_ECRIT', label: 'Langue Vivante I (écrit)' },
                { code: 'HIST_GEO', label: 'Histoire et Géographie' },
                { code: 'LV2', label: 'Langue Vivante II' }
            ],
            [
                { code: 'LV1_ORAL', label: 'Langue Vivante I (oral)' },
                { code: 'MATH', label: 'Mathématiques' }
            ]
        )
    },
    {
        key: 'c-2eme-partie',
        label: 'C — 2ème partie',
        basePath: '/releves-c-2eme-partie',
        hasSession: false,
        hasAnnee: false,
        hasMention: false,
        hasEpreuvesOralesControle: false,
        hasEpreuvesFacultatives: false,
        educationPhysique: 'none',
        groupes: ecritesOrales(
            [
                { code: 'FRANCAIS', label: 'Français' },
                { code: 'MATH', label: 'Mathématiques' },
                { code: 'SC_PHYS', label: 'Sciences Physiques' },
                { code: 'SC_NAT', label: 'Sciences Naturelles' }
            ],
            [
                { code: 'LV1', label: 'Langue Vivante I' },
                { code: 'HIST_GEO', label: 'Histoire et Géographie' },
                { code: 'MATH_ORAL', label: 'Mathématiques (oral)' }
            ]
        )
    },
    {
        key: 'd-2eme-partie',
        label: 'D — 2ème partie',
        basePath: '/releves-d-2eme-partie',
        hasSession: false,
        hasAnnee: false,
        hasMention: false,
        hasEpreuvesOralesControle: false,
        hasEpreuvesFacultatives: false,
        educationPhysique: 'simple',
        groupes: ecritesOrales(
            [
                { code: 'PHILO', label: 'Philosophie' },
                { code: 'MATH', label: 'Mathématiques' },
                { code: 'SC_PHYS', label: 'Sciences Physiques' },
                { code: 'SC_NAT', label: 'Sciences Naturelles' }
            ],
            [
                { code: 'LV1', label: 'Langue Vivante I' },
                { code: 'HIST_GEO', label: 'Histoire et Géographie' },
                { code: 'SC_PHYS_NAT_ORAL', label: 'Sciences Physiques / Naturelles (oral)' }
            ]
        )
    },
    {
        key: 'f1-2eme-partie',
        label: 'F1 — 2ème partie',
        basePath: '/releves-f1-2eme-partie',
        hasSession: false,
        hasAnnee: false,
        hasMention: false,
        hasEpreuvesOralesControle: false,
        hasEpreuvesFacultatives: false,
        educationPhysique: 'none',
        groupes: ecritesOrales(
            [
                { code: 'MATHS', label: 'Mathématiques' },
                { code: 'ELECTRICITE_METAL', label: 'Electricité - Métallurgie' },
                { code: 'MECANIQUE', label: 'Mécanique' },
                { code: 'ETUDE_PROJET', label: 'Etude ou Projet' },
                { code: 'ANALYSE_FAB_OUTIL', label: "Analyse de Fabrication / Etude d'outillage" }
            ],
            [
                { code: 'AUTOMATISME', label: 'Automatisme' },
                { code: 'TECHNOLOGIE', label: 'Technologie' },
                { code: 'LV', label: 'Langue Vivante' },
                { code: 'EPREUVE_ATELIER', label: "Epreuve d'atelier" }
            ]
        )
    }
];

export const SERIES_CONFIG: SerieConfig[] = [...SERIES_GROUPE, ...SERIES_DEUXIEME_PARTIE];

export function getSerieConfig(key: string): SerieConfig | undefined {
    return SERIES_CONFIG.find((s) => s.key === key);
}
