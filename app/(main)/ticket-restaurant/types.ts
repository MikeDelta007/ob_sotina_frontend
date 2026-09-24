// types/ticketRestaurant.ts

export type StatutTR = 'EN_ATTENTE' | 'VALIDEE' | 'REJETEE'

export const MONTANT_PAR_JOUR = 1500

export interface TicketRestaurant {
  id: string
  dateDebut: string
  dateFin: string

  lundi: boolean
  mardi: boolean
  mercredi: boolean
  jeudi: boolean
  vendredi: boolean

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

export const joursCoches = (t: Pick<TicketRestaurant, 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi'>) =>
  [t.lundi && 'Lundi', t.mardi && 'Mardi', t.mercredi && 'Mercredi', t.jeudi && 'Jeudi', t.vendredi && 'Vendredi']
    .filter(Boolean).join(', ') || '—'

// Nombre de jours ouvrés cochés effectivement compris dans [dateDebut, dateFin] — même calcul
// que le backend, utilisé pour prévisualiser le total avant l'enregistrement.
export const compterJours = (dateDebut: Date, dateFin: Date, jours: { lundi: boolean; mardi: boolean; mercredi: boolean; jeudi: boolean; vendredi: boolean }) => {
  let n = 0
  const d = new Date(dateDebut)
  d.setHours(0, 0, 0, 0)
  const fin = new Date(dateFin)
  fin.setHours(0, 0, 0, 0)
  while (d <= fin) {
    const jourSemaine = d.getDay() // 0=dimanche, 1=lundi, ..., 6=samedi
    if (
      (jourSemaine === 1 && jours.lundi) ||
      (jourSemaine === 2 && jours.mardi) ||
      (jourSemaine === 3 && jours.mercredi) ||
      (jourSemaine === 4 && jours.jeudi) ||
      (jourSemaine === 5 && jours.vendredi)
    ) n++
    d.setDate(d.getDate() + 1)
  }
  return n
}
