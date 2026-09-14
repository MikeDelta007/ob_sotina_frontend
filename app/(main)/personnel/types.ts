// Rôles ayant tous accès aux pages self-service du module personnel (Mon profil, Absences, Missions)
export const TOUS_ROLES = [
  'ADMIN', 'PLANIFICATION', 'PEDAGOGIE', 'CHEF_SERVICE', 'CSA', 'DIRECTEUR', 'CHEF_COMPTABLE', 'AGENT_COMPTABLE'
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

export type TypePersonnel = 'PERMANENT' | 'PERSONNEL_APPUI'

export const joursCongesParAn = (t: TypePersonnel) => (t === 'PERMANENT' ? 30 : 10)

export type StatutAbsence = 'EN_ATTENTE_CHEF' | 'EN_ATTENTE_CSA' | 'EN_ATTENTE_DIRECTEUR' | 'VALIDEE' | 'REJETEE'

export interface DemandeAbsence {
  id: string
  demandeurId: string
  demandeurNom: string
  divisionId?: string | null
  nombreJours: number
  dateDebut: string
  dateFin: string
  motif: string
  statut: StatutAbsence

  validationChef: boolean
  validateurChef?: string
  dateValidationChef?: string

  validationCsa: boolean
  validateurCsa?: string
  dateValidationCsa?: string

  validationDirecteur: boolean
  validateurDirecteur?: string
  dateValidationDirecteur?: string

  motifRejet?: string
  rejetePar?: string
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

export interface OrdreMission {
  id: string
  agentId: string
  agentNom: string
  destination: string
  motif: string
  dateDebut: string
  dateFin: string
  creeParId: string
  creeParNom: string
  dateCreation: string
  annule: boolean
  annuleParId?: string
  dateAnnulation?: string
}
