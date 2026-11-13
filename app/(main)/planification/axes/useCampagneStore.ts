import { create } from 'zustand'
import axiosInstance from '@/app/api/axiosInstance'
import type { Agent, Campagne } from './types'

interface CampagnePayload {
  nom: string
  dateDebut: string
  dateFin: string
}

interface MissionPayload {
  axeId: string
  dateDebut: string
  dateFin: string
  agentIds: string[]
  nombreTickets: number
}

interface CampagneStore {
  campagnes: Campagne[]
  campagnesEnCours: Campagne[]
  // Campagnes actives (non désactivées), quelle que soit leur date de fin — c'est exactement le
  // périmètre que le backend utilise pour détecter les chevauchements d'axe/agent, donc c'est sur
  // cette liste que les listes déroulantes filtrent les choix déjà pris sur la période demandée.
  campagnesActives: Campagne[]
  agents: Agent[]
  loading: boolean
  error: string | null
  actionLoadingId: string | null

  fetchCampagnes: () => Promise<void>
  fetchCampagnesEnCours: () => Promise<void>
  fetchCampagnesActives: () => Promise<void>
  fetchAgents: () => Promise<void>
  creer: (payload: CampagnePayload) => Promise<void>
  modifier: (id: string, payload: CampagnePayload) => Promise<void>
  supprimer: (id: string) => Promise<void>
  ajouterMissions: (campagneId: string, payloads: MissionPayload[]) => Promise<void>
  modifierMission: (campagneId: string, missionId: string, payload: MissionPayload) => Promise<void>
  supprimerMission: (campagneId: string, missionId: string) => Promise<void>
  clearError: () => void
}

export const useCampagneStore = create<CampagneStore>((set, get) => ({
  campagnes: [],
  campagnesEnCours: [],
  campagnesActives: [],
  agents: [],
  loading: false,
  error: null,
  actionLoadingId: null,

  fetchCampagnes: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await axiosInstance.get('campagnes/all')
      set({ campagnes: data })
    } catch { set({ error: 'Erreur chargement des campagnes' }) }
    finally { set({ loading: false }) }
  },

  fetchCampagnesEnCours: async () => {
    try {
      const { data } = await axiosInstance.get('campagnes/en-cours')
      set({ campagnesEnCours: data })
    } catch { set({ campagnesEnCours: [] }) }
  },

  fetchCampagnesActives: async () => {
    try {
      const { data } = await axiosInstance.get('campagnes')
      set({ campagnesActives: data })
    } catch { set({ campagnesActives: [] }) }
  },

  fetchAgents: async () => {
    try {
      const { data } = await axiosInstance.get('personnel/tous-agents')
      set({ agents: data })
    } catch { set({ agents: [] }) }
  },

  creer: async (payload) => {
    set({ loading: true, error: null })
    try {
      await axiosInstance.post('campagnes', payload)
      await Promise.all([get().fetchCampagnes(), get().fetchCampagnesEnCours(), get().fetchCampagnesActives()])
    } catch (e: any) {
      set({ error: e.response?.data?.errorMessage ?? e.response?.data?.message ?? "Erreur lors de la création de la campagne" })
      throw e
    } finally { set({ loading: false }) }
  },

  modifier: async (id, payload) => {
    set({ loading: true, error: null })
    try {
      await axiosInstance.put(`campagnes/${id}`, payload)
      await Promise.all([get().fetchCampagnes(), get().fetchCampagnesEnCours(), get().fetchCampagnesActives()])
    } catch (e: any) {
      set({ error: e.response?.data?.errorMessage ?? e.response?.data?.message ?? "Erreur lors de la modification de la campagne" })
      throw e
    } finally { set({ loading: false }) }
  },

  supprimer: async (id) => {
    set({ actionLoadingId: id, error: null })
    try {
      await axiosInstance.delete(`campagnes/${id}`)
      await Promise.all([get().fetchCampagnes(), get().fetchCampagnesEnCours(), get().fetchCampagnesActives()])
    } catch (e: any) {
      set({ error: e.response?.data?.errorMessage ?? e.response?.data?.message ?? "Erreur lors de la suppression de la campagne" })
      throw e
    } finally { set({ actionLoadingId: null }) }
  },

  ajouterMissions: async (campagneId, payloads) => {
    set({ loading: true, error: null })
    try {
      await axiosInstance.post(`campagnes/${campagneId}/missions`, payloads)
      await Promise.all([get().fetchCampagnes(), get().fetchCampagnesEnCours(), get().fetchCampagnesActives()])
    } catch (e: any) {
      set({ error: e.response?.data?.errorMessage ?? e.response?.data?.message ?? "Erreur lors de l'ajout des missions" })
      throw e
    } finally { set({ loading: false }) }
  },

  modifierMission: async (campagneId, missionId, payload) => {
    set({ loading: true, error: null })
    try {
      await axiosInstance.put(`campagnes/${campagneId}/missions/${missionId}`, payload)
      await Promise.all([get().fetchCampagnes(), get().fetchCampagnesEnCours(), get().fetchCampagnesActives()])
    } catch (e: any) {
      set({ error: e.response?.data?.errorMessage ?? e.response?.data?.message ?? "Erreur lors de la modification de la mission" })
      throw e
    } finally { set({ loading: false }) }
  },

  supprimerMission: async (campagneId, missionId) => {
    set({ actionLoadingId: missionId, error: null })
    try {
      await axiosInstance.delete(`campagnes/${campagneId}/missions/${missionId}`)
      await Promise.all([get().fetchCampagnes(), get().fetchCampagnesEnCours(), get().fetchCampagnesActives()])
    } catch (e: any) {
      set({ error: e.response?.data?.errorMessage ?? e.response?.data?.message ?? "Erreur lors de la suppression de la mission" })
      throw e
    } finally { set({ actionLoadingId: null }) }
  },

  clearError: () => set({ error: null }),
}))
