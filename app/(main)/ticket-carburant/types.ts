export interface Ville {
  id: string
  name: string
}

export interface MotifCarburant {
  id: string
  libelle: string
  actif: boolean
}

export type StatutTC = 'EN_ATTENTE' | 'VALIDEE' | 'REJETEE'

export interface TicketCarburant {
  id: string
  numeroFiche?: string
  divisionLibelle?: string
  motifId: string
  motifLibelle: string
  date: string
  villeDepartId: string
  villeDepartNom: string
  villeArriveeId: string
  villeArriveeNom: string
  nombreTicketsDemande: number
  nombreTicketsAccorde?: number
  statut: StatutTC

  validationCsa: boolean
  validateurCsaNom?: string
  dateValidationCsa?: string
  rejetCsa: boolean
  motifRejetCsa?: string
  rejeteParCsaNom?: string
  dateRejetCsa?: string

  validationDirecteur: boolean
  validateurDirecteurNom?: string
  dateValidationDirecteur?: string

  motifRejet?: string
  rejeteParNom?: string
  dateRejet?: string

  creePar: string
  creeParNom?: string
  dateCreation: string
}

export const STATUT_LABEL: Record<StatutTC, string> = {
  EN_ATTENTE: 'En attente',
  VALIDEE: 'Validée',
  REJETEE: 'Rejetée',
}
