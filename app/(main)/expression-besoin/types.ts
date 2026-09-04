// types/expressionBesoin.ts

export type StatutEB = 'EN_ATTENTE' | 'VALIDEE' | 'REJETEE' | 'TRAITEE'

export const SEUIL_VALIDATION_DIRECTEUR = 20_000

export interface LigneExpressionBesoin {
  motifId: string
  motifLibelle?: string
  // Optionnelle : certaines désignations ne sont pas quantitatives (ex. un forfait)
  quantite?: number
  prixUnitaire: number
  montant: number
  // Renseignées indépendamment par chaque validateur lors de la validation, uniquement si
  // quantite existe — la comptabilité traite celle du Directeur quand les deux sont requises.
  quantiteAccordeeCsa?: number
  quantiteAccordeeDirecteur?: number
}

export interface ExpressionBesoin {
  id: string
  // Optionnel : les expressions créées avant l'ajout des lignes multiples n'en ont pas
  lignes?: LigneExpressionBesoin[]
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

// Désignation combinée affichée dans les tableaux (ex. "Papier A4 (x2), Stylos (x10)")
// Défensif : les expressions créées avant l'ajout des lignes multiples n'ont pas ce champ.
export const designationLignes = (lignes?: LigneExpressionBesoin[]) =>
  (lignes ?? []).map(l => l.quantite ? `${l.motifLibelle ?? '—'} (x${l.quantite})` : (l.motifLibelle ?? '—')).join(', ') || '—'
