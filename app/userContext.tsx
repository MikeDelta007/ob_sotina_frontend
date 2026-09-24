"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';

// Définition du type User (ajoute d'autres champs selon ton besoin)
export interface Departement {
  id: string;
  name: string;
}

export interface Region {
  id: string;
  name: string;
}

export interface InspectionAcademie {
  id: string;
  name: string;
  code: string;
  region: Region;
}

export interface Ville {
  id: string;
  name: string;
}

export interface TypeCandidat {
  id: string;
  name: string;
}

export interface TypeEnseignement {
  id: string;
  name: string;
}

export interface TypeEtablissement {
  id: string;
  name: string;
  code: string;
}

export interface CentreExamen {
  id: string;
  name: string;
}

export interface Etablissement {
  id: string;
  name: string;
  code: string;
  can_have_cdt: boolean;
  capacity: number;
  capacity_eps: number;
  ce_for_other: boolean;
  etab_have_cdt: boolean;
  etb_is_ce: boolean;
  etb_prov_actor: boolean;
  etb_was_ce: boolean;
  etb_with_actor: boolean;
  etb_with_other_actor: boolean;
  nb_of_jury: number;
  sigle: string | null;
  centreExamen?: CentreExamen;
  departement?: Departement;
  inspectionAcademie?: InspectionAcademie;
  typeCandidat?: TypeCandidat;
  typeEnseignement?: TypeEnseignement;
  typeEtablissement?: TypeEtablissement;
  ville?: Ville;
  jury?: any;
  structure?: any;
}

export interface Acteur {
  id: string;
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  matricule: string;
  civilite: string;  // Exemple: "Mr"
  indice_sal: string;
  grade: any;  // Remplace par une interface `Grade` si nécessaire
  anc: number;
  decision: boolean;
  matiere: any;  // Remplace si besoin
  bonus: number;
  pond_bonus: number;
  nb_of_me: number;
  last_ce: any;  // Remplace si besoin
  structure: any;
  etablissement: Etablissement | null;
  inspectionAcademie: InspectionAcademie | null;
  universite: any;
  classes: string;
  ce: any;
  place_of_activity: any;
  aca_of_prov: any;
  aca_place_of_activity: any;
  numb_jury: string;
  bank: string;
  code_bank: string;
  code_agc: string;
  num_compte: string;
  key_rib: string;
  key_rib_correct: boolean;
  duplicate: boolean;
  eligible: boolean;
}

export interface Profil {
  accept_candidate: boolean;
  add_PJ: boolean;
  add_SJ: boolean;
  add_candidate: boolean;
  add_date: boolean;
  add_examinator: boolean;
  add_user: boolean;
  delete_candidate: boolean;
  delete_date: boolean;
  grant_user: boolean;
  manage_settings: boolean;
  name: string | null;
  plan_Intrant: boolean;
  reject_candidate: boolean;
  revoke_user: boolean;
  share_date: boolean;
  update_PJ: boolean;
  update_SJ: boolean;
  update_candidate: boolean;
  update_date: boolean;
  update_examinator: boolean;
  update_password: boolean;
  view_candidate: boolean;
  view_plan: boolean;
}

export interface Division {
  id: string;
  libelle: string;
  chefServiceId?: string | null;
  actif: boolean;
}

export interface Fonction {
  id: string;
  libelle: string;
  actif: boolean;
}

export type TypePersonnel = 'PERMANENT' | 'PERSONNEL_SECURITE' | 'PERSONNEL_APPUI' | 'EXTERNE';

export type ProprietaireVoiture = 'OFFICE' | 'AGENT' | 'EXTERNE';

export interface Voiture {
  id: string;
  immatriculation: string;
  marque?: string;
  capacite: number;
  actif: boolean;
  proprietaireType: ProprietaireVoiture;
  proprietaireAgentId?: string | null;
  proprietaireAgentNom?: string | null;
  proprietairePersonnelId?: string | null;
  proprietairePersonnelNom?: string | null;
}

// Identité + informations personnel/RH, indépendamment de tout compte applicatif.
// Un User interne embarque son propre Personnel ; un chauffeur externe (sans compte) est un
// Personnel autonome (voir /personnel/personnels).
export interface Personnel {
  id: string;
  firstname: string;
  lastname: string;
  phone?: string;
  email?: string;
  bank?: string;
  matricule?: string;
  civilite?: string;
  division?: Division | null;
  fonction?: Fonction | null;
  code_bank?: string;
  voiture?: Voiture | null;
  code_agc?: string;
  num_compte?: string;
  key_rib?: string;
  typePersonnel?: TypePersonnel | null;
  soldeConges?: number | null;
  // Jours d'autorisation d'absence pris depuis le dernier congé validé, pas encore régularisés
  joursAutorisationCumules?: number | null;
  // Solde réellement disponible pour un nouveau congé (soldeConges - joursAutorisationCumules), calculé côté backend
  soldeDisponible?: number | null;
  actif?: boolean;
}

export interface User {
  id: string;
  login: string;
  state_account: boolean;
  sessionId : string;
  profil: Profil;
  acteur: Acteur; // Tu peux le typer plus tard si tu souhaites gérer les acteurs aussi proprement
  personnel: Personnel;
  // Rôles supplémentaires en plus du rôle principal (profil) : un même agent peut cumuler
  // plusieurs rôles (menus/pages de chacun).
  droitsSupplementaires?: string[];
}


// Type du contexte
interface UserContextType 
{
  user: User | null;
  setUser: (user: User | null) => void;
}

// Création du contexte avec type générique
export const UserContext = createContext<UserContextType | undefined>(undefined);

// Typage des props du Provider
interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Charger user depuis le sessionStorage au démarrage
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Mettre à jour le user et stocker dans sessionStorage
  const updateUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      sessionStorage.setItem('user', JSON.stringify(newUser));
    } else {
      sessionStorage.removeItem('user');
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser: updateUser }}>
      {children}
    </UserContext.Provider>
  );
};
