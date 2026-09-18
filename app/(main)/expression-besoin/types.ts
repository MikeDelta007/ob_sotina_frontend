// types/expressionBesoin.ts

export type StatutEB = 'EN_ATTENTE' | 'VALIDEE' | 'REJETEE' | 'TRAITEE'

export const SEUIL_VALIDATION_DIRECTEUR = 20_000

export interface ExpressionBesoin {
  id: string

  // ── Motif unique ──
  motifId: string
  motifLibelle?: string
  // Optionnelle : certaines désignations ne sont pas quantitatives (ex. un forfait)
  quantite?: number
  prixUnitaire: number
  montantInitial: number
  // Renseignées indépendamment par chaque validateur lors de la validation, uniquement si
  // quantite existe — la comptabilité traite celle du Directeur quand les deux sont requises.
  quantiteAccordeeCsa?: number
  quantiteAccordeeDirecteur?: number
  // Copié depuis le motif au moment de la création (snapshot)
  requiertSatisfaction?: boolean

  aFacturePreformat: boolean
  urlPdfFactureProforma?: string
  urlPdfDeclarationHonneur?: string
  statut: StatutEB

  // ── Bénéficiaire déclaré à la création ──
  beneficiaireId?: string
  beneficiaireNom?: string
  beneficiaireMoiMeme?: boolean

  validationCsa: boolean
  validateurCsa?: string
  validateurCsaNom?: string
  dateValidationCsa?: string

  validationDirecteur: boolean
  validateurDirecteur?: string
  validateurDirecteurNom?: string
  dateValidationDirecteur?: string

  motifRejet?: string
  rejetePar?: string
  rejeteParNom?: string
  dateRejet?: string

  montantReel?: number
  traitePar?: string
  traiteParNom?: string
  dateTraitement?: string

  utiliseePourMandatement: boolean
  mandatementId?: string

  // Satisfaction du demandeur (si le motif l'exige), requise avant décaissement
  satisfactionConfirmee?: boolean
  dateSatisfaction?: string

  creePar: string
  creeParNom?: string
  dateCreation: string
  dateModification?: string
}

export interface AgentDivision {
  id: string
  firstname: string
  lastname: string
}

export const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'

export const directeurRequis = (montantInitial: number) => montantInitial > SEUIL_VALIDATION_DIRECTEUR

// Désignation affichée dans les tableaux (ex. "Papier A4 (x2)")
export const designationEb = (eb: ExpressionBesoin) =>
  eb.quantite ? `${eb.motifLibelle ?? '—'} (x${eb.quantite})` : (eb.motifLibelle ?? '—')

// Étape de la chaîne de validation : qui a validé/rejeté et quand, pour affichage de la
// traçabilité complète (agent bénéficiaire, chef créateur, CSA, Directeur).
export interface EtapeTrace {
  role: string
  nom?: string
  date?: string
  statut: 'valide' | 'rejete' | 'attente'
  motif?: string
}

export const tracesEb = (eb: ExpressionBesoin): EtapeTrace[] => {
  const etapes: EtapeTrace[] = [
    { role: 'Créateur', nom: eb.creeParNom ?? eb.creePar, date: eb.dateCreation, statut: 'valide' },
  ]

  if (eb.statut === 'REJETEE' && eb.rejeteParNom) {
    etapes.push({ role: 'Rejet', nom: eb.rejeteParNom, date: eb.dateRejet, statut: 'rejete', motif: eb.motifRejet })
    return etapes
  }

  etapes.push({
    role: 'CSA',
    nom: eb.validateurCsaNom,
    date: eb.dateValidationCsa,
    statut: eb.validationCsa ? 'valide' : 'attente',
  })

  if (directeurRequis(eb.montantInitial)) {
    etapes.push({
      role: 'Directeur',
      nom: eb.validateurDirecteurNom,
      date: eb.dateValidationDirecteur,
      statut: eb.validationDirecteur ? 'valide' : 'attente',
    })
  }

  if (eb.statut === 'TRAITEE' && eb.traiteParNom) {
    etapes.push({ role: 'Traitement', nom: eb.traiteParNom, date: eb.dateTraitement, statut: 'valide' })
  }

  return etapes
}
