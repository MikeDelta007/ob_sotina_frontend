export interface Candidat {
    dos_number: string;
    session: number;
    firstname: string;
    lastname: string;
    date_birth: string; // ou Date si tu préfères travailler avec des objets Date
    place_birth: string;
    gender: string;
    phone1: string;
    phone2: string;
    email: string;
    year_registry_num: string;
    registry_num: string;
    bac_do_count: string;
    year_bfem: string;
    origine_bfem: string;
    subject: string;
    handicap: boolean;
    type_handicap: string;
    eps: string;
    cdt_is_cgs: boolean;
    decision: number;
    options: any[]; // tu peux remplacer `any` par un type spécifique si tu connais la structure
    matiere1: any | null; // idem
    matiere2: any | null;
    matiere3: any | null;
    matiere4: any | null;
    etablissement: any | null;
    centreEtatCivil: any | null;
    typeCandidat: any | null;
    serie: any | null;
    nationality: any | null;
    countryBirth: any | null;
    concoursGeneral: any | null;
    eprFacListA: string;
    eprFacListB: string;
    codeCentre: string;
}
