// Rôles ayant tous accès aux pages self-service du module personnel (Mon profil, Absences, Missions)
export const TOUS_ROLES = [
  'ADMIN', 'PLANIFICATION', 'PEDAGOGIE', 'CHEF_SERVICE', 'CSA', 'DIRECTEUR', 'CHEF_COMPTABLE', 'AGENT_COMPTABLE', 'AGENT'
]

export interface Division {
  id: string
  libelle: string
  chefServiceId?: string | null
  actif: boolean
}

export interface Fonction {
  id: string
  libelle: string
  actif: boolean
}

export type ProprietaireVoiture = 'OFFICE' | 'AGENT' | 'EXTERNE'

export interface Voiture {
  id: string
  immatriculation: string
  marque?: string
  capacite: number
  actif: boolean
  proprietaireType: ProprietaireVoiture
  proprietaireAgentId?: string | null
  proprietaireAgentNom?: string | null
  proprietairePersonnelId?: string | null
  proprietairePersonnelNom?: string | null
}

export type TypePersonnel = 'PERMANENT' | 'PERSONNEL_SECURITE' | 'PERSONNEL_APPUI' | 'EXTERNE'

// Banque référentiel (liste chargée depuis /api/v1/banques/all), utilisée pour préremplir le
// code banque d'un RIB : sélectionner une banque renseigne automatiquement son code_bank.
export interface Banque {
  id: string
  name: string
  codeBanque: string
  NomComplet?: string
}

// Fiche Personnel autonome, sans compte utilisateur (ex : chauffeur, personnel externe importé
// par Excel). Un "chauffeur" n'est pas un type à part : c'est un Personnel dont la fonction est
// "Chauffeur".
export interface Chauffeur {
  id: string
  firstname: string
  lastname: string
  phone?: string
  email?: string
  matricule?: string
  civilite?: string
  division?: Division | null
  fonction?: Fonction | null
  typePersonnel?: TypePersonnel | null
  soldeConges?: number | null
  bank?: string
  code_bank?: string
  code_agc?: string
  num_compte?: string
  key_rib?: string
  actif: boolean
}

export const estChauffeur = (p: Chauffeur) => (p.fonction?.libelle ?? '').trim().toLowerCase() === 'chauffeur'

export const joursCongesParAn = (t: TypePersonnel) => ({
  PERMANENT: 30,
  PERSONNEL_SECURITE: 30,
  PERSONNEL_APPUI: 10,
  EXTERNE: 0,
}[t])

export const fmtTypePersonnel = (t: TypePersonnel) => ({
  PERMANENT: 'Permanent',
  PERSONNEL_SECURITE: 'Personnel de sécurité',
  PERSONNEL_APPUI: "Personnel d'appui",
  EXTERNE: 'Externe',
}[t])

export type StatutAbsence = 'EN_ATTENTE_CHEF' | 'EN_ATTENTE_CSA' | 'EN_ATTENTE_DIRECTEUR' | 'VALIDEE' | 'REJETEE'

// CONGE : absence planifiée, décompte le solde de congés annuel.
// AUTORISATION : permission ponctuelle (rdv, urgence...), ne décompte rien.
export type TypeAbsence = 'CONGE' | 'AUTORISATION'

export interface DemandeAbsence {
  id: string
  demandeurId: string
  demandeurNom: string
  divisionId?: string | null
  type: TypeAbsence
  nombreJours: number
  dateDebut: string
  dateFin: string
  motif: string
  statut: StatutAbsence

  validationChef: boolean
  rejetChef?: boolean
  validateurChef?: string
  validateurChefNom?: string
  motifRejetChef?: string
  dateTraitementChef?: string

  validationCsa: boolean
  rejetCsa?: boolean
  validateurCsa?: string
  validateurCsaNom?: string
  motifRejetCsa?: string
  dateTraitementCsa?: string

  validationDirecteur: boolean
  validateurDirecteur?: string
  validateurDirecteurNom?: string
  dateValidationDirecteur?: string

  motifRejet?: string
  rejetePar?: string
  rejeteParNom?: string
  dateRejet?: string

  creePar: string
  dateCreation: string
}

export const fmtStatutAbsence = (s: StatutAbsence) => ({
  EN_ATTENTE_CHEF: 'En attente du chef de service',
  EN_ATTENTE_CSA: 'En attente du CSA',
  EN_ATTENTE_DIRECTEUR: 'En attente du Directeur',
  VALIDEE: 'Validée',
  REJETEE: 'Rejetée',
}[s])

export interface LigneMission {
  agentId: string
  agentNom?: string
  disponibiliteVoiture: boolean
  voitureId: string
  voitureImmatriculation?: string
}

export interface OrdreMission {
  id: string
  regionIds: string[]
  regionNoms: string[]
  motif: string
  dateDebut: string
  dateFin: string
  lignes: LigneMission[]
  creeParId: string
  creeParNom: string
  dateCreation: string
  annule: boolean
  annuleParId?: string
  dateAnnulation?: string
}
