// Types partagés par toutes les séries de relevés de notes (bottins).
// Les dates sont des chaînes "yyyy-MM-dd" (format Jackson pour java.time.LocalDate).

export type TypeSession = 'NORMALE' | 'REMPLACEMENT';

export type Decision = 'ADMIS' | 'AUTORISE_SECOND_GROUPE' | 'AJOURNE' | 'DEUXIEME_SESSION';

export type Mention = 'AUCUNE' | 'PASSABLE' | 'ASSEZ_BIEN' | 'BIEN' | 'TRES_BIEN';

export type TypeFacultative = 'LANGUE' | 'DESSIN' | 'MUSIQUE' | 'COUTURE';

export const TYPES_FACULTATIVES: { value: TypeFacultative; label: string }[] = [
    { value: 'LANGUE', label: 'Langue' },
    { value: 'DESSIN', label: 'Dessin' },
    { value: 'MUSIQUE', label: 'Musique' },
    { value: 'COUTURE', label: 'Couture' }
];

/** Note telle que renvoyée par le backend dans le relevé complet. */
export interface NoteEpreuve {
    matiereCode: string;
    note: number | null;
    pointsObtenus: number | null;
}

export interface EpreuveOraleControleSaisie {
    matiereChoisie?: string;
    coefficient?: number;
    rappelPointsObtenus1erGroupe?: number;
    nouvelleNoteSur20?: number;
}

export interface EpreuveFacultativeSaisie {
    type: TypeFacultative;
    note?: number;
}

/** Identité complète du candidat, commune à toutes les séries. */
export interface CandidatComplet {
    nomPrenom?: string;
    dateNaissance?: string;
    lieuNaissance?: string;
    etablissement?: string;
    indicatif?: string;
    options?: string;
    numeroTable?: string;
    nationalite?: string;
    nombreDeFois?: string;
}

/** Ce qui est envoyé au backend pour créer/mettre à jour un relevé (forme générique). */
export interface ReleveSaisieRequest extends CandidatComplet {
    session?: TypeSession;
    juryNumero?: string;
    annee?: number;
    epreuvesOralesControle?: EpreuveOraleControleSaisie[];
    epreuvesFacultatives?: EpreuveFacultativeSaisie[];
    educationPhysique?: { note?: number };
    // Lieu de délibération : un seul champ, commun aux séries "2ème partie"
    // (décision unique) et aux séries 1er/2ème groupe (partagé entre les deux).
    lieuDeliberation?: string;
    // Séries "2ème partie" (décision unique) : une seule date de délibération.
    dateDeliberation?: string;
    // Séries 1er/2ème groupe (config.hasDoubleGroupe) : une date par groupe.
    dateDeliberationPremierGroupe?: string;
    dateDeliberationDeuxiemeGroupe?: string;
    presidentJury?: string;
    // Les clés des groupes de notes (ex: notesPremierGroupe / notesEcrites) sont
    // ajoutées dynamiquement selon la config de la série -> objet libre.
    [notesFieldName: string]: unknown;
}

/** Relevé complet tel que renvoyé par le backend (creer/mettreAJour/obtenir). */
export interface ReleveDetail {
    id: string;
    session?: TypeSession;
    juryNumero?: string;
    annee?: number;
    candidat?: CandidatComplet;
    epreuvesOralesControle?: (EpreuveOraleControleSaisie & { pointsObtenusEpreuveControle?: number; differenceEnPlus?: number })[];
    epreuvesFacultatives?: (EpreuveFacultativeSaisie & { pointsAuDessusMoyenne?: number })[];
    educationPhysique?: { note?: number; pointsPositifs?: number; pointsNegatifs?: number };
    // Lieu de délibération : un seul champ, commun aux séries "2ème partie"
    // (décision unique) et aux séries 1er/2ème groupe (partagé entre les deux).
    lieuDeliberation?: string;
    // Séries "2ème partie" (décision unique) : une seule date de délibération.
    dateDeliberation?: string;
    // Séries 1er/2ème groupe (config.hasDoubleGroupe) : une date par groupe.
    dateDeliberationPremierGroupe?: string;
    dateDeliberationDeuxiemeGroupe?: string;
    presidentJury?: string;
    createdAt?: string;
    // notesPremierGroupe / notesDeuxiemeGroupe / notesEcrites / notesOrales : List<NoteEpreuve>
    [notesFieldName: string]: unknown;
}

/** Vue allégée pour le tableau (liste paginée). */
export interface ReleveResume {
    id: string;
    numeroTable?: string;
    nomPrenom?: string;
    juryNumero?: string;
    annee?: number;
    totalDefinitif?: number;
    totalGeneral?: number;
    decision?: Decision;
    mention?: Mention;
    createdAt?: string;
}

/**
 * Un candidat trouvé lors d'une recherche dans les 29 séries de bottins, à
 * partir de n'importe quelle combinaison de critères (N° de table, année,
 * nom, prénom, date de naissance, lieu de naissance). La recherche peut
 * remonter plusieurs candidats (homonymes) : le backend renvoie une liste.
 */
export interface RechercheGlobaleResultat {
    serieKey: string;
    id: string;
    numeroTable?: string;
    nomPrenom?: string;
    dateNaissance?: string;
    lieuNaissance?: string;
    annee?: number;
}

/** Forme standard d'une page renvoyée par Spring Data (Page<T>). */
export interface PageSpring<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
}
