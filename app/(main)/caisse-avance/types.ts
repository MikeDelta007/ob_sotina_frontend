// types/caisseAvance.ts

export type ModePaiement    = 'ESPECES' | 'CHEQUE'
export type TypeMandatement = 'SIMPLE' | 'CUMULATIF'
export type TypePaiement    = 'TOTALITE' | 'AVANCE'

export interface Motif {
  id: string
  libelle: string
  actif: boolean
}

export interface CaisseAvance {
  id: string
  montant: number
  date: string
  description?: string
}

// Historique des approvisionnements (ajouts de fonds) de la caisse
export interface Approvisionnement {
  id: string
  montant: number
  soldeAvant: number
  soldeApres: number
  date: string
  description?: string
  creePar: string
  dateCreation: string
}

// Facture embedded dans Mandatement (miroir du Java)
export interface FactureEmbedded {
  numero: string
  date: string
  montant: number
  motifId: string
  motifLibelle?: string
  beneficiaire?: string
  expressionBesoinId?: string
  urlPiecesJustificatives?: string
}

// Entité principale retournée par l'API
export interface Mandatement {
  id: string
  type: TypeMandatement
  typePaiement: TypePaiement
  montantTotal: number
  montantAvance?: number
  montantReliquat?: number
  modePaiement: ModePaiement
  decaisse: boolean
  montantDecaisse?: number
  soldeAvant?: number
  soldeApres?: number
  reliquatPaye?: boolean
  dateReliquatPaye?: string
  modePaiementReliquat?: ModePaiement
  urlPiecesJustificativesReliquat?: string
  factures: FactureEmbedded[]
  description?: string
  beneficiaire?: string
  numeroCni?: string
  expressionBesoinId?: string
  creePar: string
  dateCreation: string
}

// Ligne locale pour le formulaire (avant envoi)
export interface LigneLocale {
  _localId: string
  montant: number
  motifId: string
  motifLibelle?: string
  beneficiaire?: string
  expressionBesoinId?: string
  piecesJustificatives?: File | null
}

export const SEUIL_ALERTE  = 100_000
export const SEUIL_CHEQUE  = 100_000

// Filtre période partagé (mandatements + approvisionnements, écran + Excel)
export type PeriodeType = 'TOUTES' | 'ANNEE' | 'MOIS' | 'SEMAINE'

export const MOIS_OPTIONS = [
  { label: 'Janvier', value: 1 }, { label: 'Février', value: 2 }, { label: 'Mars', value: 3 },
  { label: 'Avril', value: 4 }, { label: 'Mai', value: 5 }, { label: 'Juin', value: 6 },
  { label: 'Juillet', value: 7 }, { label: 'Août', value: 8 }, { label: 'Septembre', value: 9 },
  { label: 'Octobre', value: 10 }, { label: 'Novembre', value: 11 }, { label: 'Décembre', value: 12 },
]

// Numéro de semaine ISO-8601 (1-53)
export const getISOWeek = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

// soldeCaisse optionnel : si fourni et insuffisant pour couvrir le montant,
// on bascule sur CHEQUE même en dessous du seuil (reflète le comportement backend)
export const modeAuto = (montant: number, soldeCaisse?: number): ModePaiement => {
  if (montant > SEUIL_CHEQUE) return 'CHEQUE'
  if (soldeCaisse !== undefined && soldeCaisse < montant) return 'CHEQUE'
  return 'ESPECES'
}

export const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'

// Une ligne est valide si le montant/motif/expression de besoin sont renseignés
// et les pièces justificatives (PDF unique) fournies.
export const ligneEstValide = (l: LigneLocale): boolean =>
  !!l.montant && l.montant > 0 && !!l.motifId && !!l.expressionBesoinId && !!l.piecesJustificatives

export const newLigne = (): LigneLocale => ({
  _localId: Math.random().toString(36).slice(2),
  montant: 0, motifId: '', beneficiaire: '', expressionBesoinId: '',
  piecesJustificatives: null,
})
