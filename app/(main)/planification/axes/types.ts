export interface AxeEtablissement {
  etablissementId: string
  etablissementNom?: string
  centreSecondaire: boolean
  relais?: string
}

export interface Axe {
  id: string
  numero: number
  itineraire: string
  actif: boolean
  etablissements: AxeEtablissement[]
  creePar?: string
  dateCreation?: string
  dateModification?: string
}

export interface Etablissement {
  id: string
  name: string
}

export interface AxeImportResult {
  axesImportes: number
  lignesImportees: number
  lignesIgnorees: number
  avertissements: string[]
}

export interface Agent {
  id: string
  firstname?: string
  lastname?: string
}

// Une mission affecte UN axe à une campagne, sur une période qui lui est propre, avec ses
// propres agents et son propre nombre de tickets.
export interface Mission {
  id: string
  axeId: string
  axeNumero?: number
  axeItineraire?: string
  dateDebut: string
  dateFin: string
  agentIds: string[]
  agentNoms?: string[]
  nombreTickets?: number
}

// Une campagne (ex. "Campagne de ramassage malles 2026") a sa propre période globale et
// regroupe des missions ajoutées séparément, une à une, une fois la campagne créée.
export interface Campagne {
  id: string
  nom: string
  dateDebut: string
  dateFin: string
  actif: boolean
  missions: Mission[]
  creePar?: string
  dateCreation?: string
  dateModification?: string
}
