// types/expressionBesoin.ts

export type StatutEB = 'EN_ATTENTE' | 'VALIDEE' | 'REJETEE' | 'TRAITEE'

export const SEUIL_VALIDATION_DIRECTEUR = 20_000

export interface ExpressionBesoin {
  id: string
  motifId: string
  motifLibelle?: string
  montantInitial: number
  aFacturePreformat: boolean
  urlPdfFactureProforma?: string
  urlPdfDeclarationHonneur?: string
  statut: StatutEB

  validationCsa: boolean
  validateurCsa?: string
  dateValidationCsa?: string

  validationDirecteur: boolean
  validateurDirecteur?: string
  dateValidationDirecteur?: string

  motifRejet?: string
  rejetePar?: string
  dateRejet?: string

  montantReel?: number
  beneficiaire?: string
  traitePar?: string
  dateTraitement?: string

  utiliseePourMandatement: boolean
  mandatementId?: string

  creePar: string
  dateCreation: string
  dateModification?: string
}

export const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'

export const directeurRequis = (montantInitial: number) => montantInitial > SEUIL_VALIDATION_DIRECTEUR
