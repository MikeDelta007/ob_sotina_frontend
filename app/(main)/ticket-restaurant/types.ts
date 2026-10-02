// types/ticketRestaurant.ts

export type StatutTR = 'EN_ATTENTE' | 'VALIDEE' | 'REJETEE'

export const MONTANT_PAR_JOUR = 1500

export interface MotifTicketRestaurant {
  id: string
  libelle: string
  actif: boolean
  roles?: string[]
}

export interface TicketRestaurant {
  id: string
  motifId: string
  motifLibelle: string
  // Dates cochées (ISO yyyy-MM-dd) : elles seules définissent la demande
  dates: string[]
  dateDebut: string
  dateFin: string

  agentIds: string[]
  agentNoms: string[]

  nombreJours: number
  montantTotal: number

  statut: StatutTR

  validationDirecteur: boolean
  validateurDirecteur?: string
  validateurDirecteurNom?: string
  dateValidationDirecteur?: string

  motifRejet?: string
  rejetePar?: string
  rejeteParNom?: string
  dateRejet?: string

  expressionBesoinId?: string

  creePar: string
  creeParNom?: string
  dateCreation: string
}

export interface AgentDivision {
  id: string
  firstname: string
  lastname: string
}

export const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'

export const STATUT_LABEL: Record<StatutTR, string> = {
  EN_ATTENTE: 'En attente', VALIDEE: 'Validée', REJETEE: 'Rejetée',
}
export const STATUT_SEVERITE: Record<StatutTR, 'warning' | 'success' | 'danger'> = {
  EN_ATTENTE: 'warning', VALIDEE: 'success', REJETEE: 'danger',
}

const fmtDate = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('fr-FR')

// Dates cochées, formatées pour un tableau (ex. "28/09/2026, 29/09/2026")
export const datesCochees = (t: Pick<TicketRestaurant, 'dates'>) =>
  (t.dates ?? []).map(fmtDate).join(', ') || '—'

