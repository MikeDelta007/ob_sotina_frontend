// types/ticketRestaurant.ts

export type StatutTR = 'EN_ATTENTE' | 'VALIDEE' | 'REJETEE'

export const MONTANT_PAR_JOUR = 1500

export interface TicketRestaurant {
  id: string
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

export const toIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// Semaines affichées (lundi à vendredi), complètes même à cheval sur deux mois. Seuls les jours
// restants de la semaine en cours sont sélectionnables (le week-end : la semaine suivante) ; les
// jours passés et toutes les semaines à venir sont grisés.
export interface JourTicket {
  iso: string
  actif: boolean
}
export interface SemaineTicket {
  lundi: string       // ISO du lundi
  fin: string         // ISO du vendredi
  jours: JourTicket[] // 5 cases lun→ven
}

export const semainesAffichees = (nb: number): SemaineTicket[] => {
  const aujourdhui = new Date()
  aujourdhui.setHours(0, 0, 0, 0)
  const premier = new Date(aujourdhui)
  if (premier.getDay() === 6) premier.setDate(premier.getDate() + 2)
  else if (premier.getDay() === 0) premier.setDate(premier.getDate() + 1)
  const lundi = new Date(premier)
  lundi.setDate(lundi.getDate() - ((lundi.getDay() + 6) % 7))
  const vendredi = new Date(lundi)
  vendredi.setDate(lundi.getDate() + 4)

  const semaines: SemaineTicket[] = []
  for (let s = 0; s < nb; s++) {
    const jours: JourTicket[] = []
    for (let j = 0; j < 5; j++) {
      const d = new Date(lundi)
      d.setDate(lundi.getDate() + s * 7 + j)
      jours.push({ iso: toIso(d), actif: d >= premier && d <= vendredi })
    }
    const lun = new Date(lundi); lun.setDate(lundi.getDate() + s * 7)
    const ven = new Date(lun); ven.setDate(lun.getDate() + 4)
    semaines.push({ lundi: toIso(lun), fin: toIso(ven), jours })
  }
  return semaines
}
