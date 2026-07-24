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
  urlPdfFacture?: string
  urlPdfCheque?: string
  urlPdfCni?: string
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
  factures: FactureEmbedded[]
  creePar: string
  dateCreation: string
}

// Ligne locale pour le formulaire (avant envoi)
export interface LigneLocale {
  _localId: string
  montant: number
  motifId: string
  motifLibelle?: string
  pdfFacture?: File | null
  pdfCheque?: File | null
  pdfCni?: File | null
}

export const SEUIL_ALERTE  = 100_000
export const SEUIL_CHEQUE  = 100_000

// soldeCaisse optionnel : si fourni et insuffisant pour couvrir le montant,
// on bascule sur CHEQUE même en dessous du seuil (reflète le comportement backend)
export const modeAuto = (montant: number, soldeCaisse?: number): ModePaiement => {
  if (montant > SEUIL_CHEQUE) return 'CHEQUE'
  if (soldeCaisse !== undefined && soldeCaisse < montant) return 'CHEQUE'
  return 'ESPECES'
}

export const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'

// Une ligne est valide si le montant/motif sont renseignés, la facture PDF fournie,
// et — si le montant réellement décaissé maintenant (montantPourMode : le total en
// paiement TOTALITE, l'avance en paiement AVANCE) impose le chèque — le chèque et la
// CNI également fournis.
export const ligneEstValide = (l: LigneLocale, soldeCaisse: number, montantPourMode: number): boolean => {
  if (!l.montant || l.montant <= 0 || !l.motifId || !l.pdfFacture) return false
  if (modeAuto(montantPourMode, soldeCaisse) === 'CHEQUE') return !!l.pdfCheque && !!l.pdfCni
  return true
}

export const newLigne = (): LigneLocale => ({
  _localId: Math.random().toString(36).slice(2),
  montant: 0, motifId: '',
  pdfFacture: null, pdfCheque: null, pdfCni: null,
})
