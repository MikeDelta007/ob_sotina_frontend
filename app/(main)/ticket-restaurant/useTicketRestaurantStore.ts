// store/useTicketRestaurantStore.ts
import { create } from 'zustand'
import axiosInstance from '@/app/api/axiosInstance'
import type { AgentDivision, TicketRestaurant } from './types'

interface CreerPayload {
  dates: string[]
  agentIds: string[]
}

interface TicketRestaurantStore {
  mesAgents: AgentDivision[]
  agentsErreur: boolean
  mesTickets: TicketRestaurant[]
  aValider: TicketRestaurant[]
  toutes: TicketRestaurant[]
  loading: boolean
  error: string | null
  actionLoadingId: string | null

  fetchMesAgents:  () => Promise<void>
  fetchMesTickets: () => Promise<void>
  fetchAValider:   () => Promise<void>
  fetchToutes:     () => Promise<void>
  creer:            (payload: CreerPayload) => Promise<void>
  valider:          (id: string) => Promise<void>
  rejeter:          (id: string, motif: string) => Promise<void>
  clearError:       () => void
}

export const useTicketRestaurantStore = create<TicketRestaurantStore>((set, get) => ({
  mesAgents: [],
  agentsErreur: false,
  mesTickets: [],
  aValider: [],
  toutes: [],
  loading: false,
  error: null,
  actionLoadingId: null,

  fetchMesAgents: async () => {
    try {
      const { data } = await axiosInstance.get('personnel/tous-agents')
      set({ mesAgents: data, agentsErreur: false })
    } catch { set({ mesAgents: [], agentsErreur: true }) }
  },

  fetchMesTickets: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await axiosInstance.get('ticket-restaurant/mine')
      set({ mesTickets: data })
    } catch { set({ error: 'Erreur chargement de vos demandes' }) }
    finally { set({ loading: false }) }
  },

  fetchAValider: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await axiosInstance.get('ticket-restaurant/a-valider')
      set({ aValider: data })
    } catch { set({ error: 'Erreur chargement des demandes à valider' }) }
    finally { set({ loading: false }) }
  },

  fetchToutes: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await axiosInstance.get('ticket-restaurant/toutes')
      set({ toutes: data })
    } catch { set({ error: 'Erreur chargement des demandes' }) }
    finally { set({ loading: false }) }
  },

  creer: async (payload) => {
    set({ loading: true, error: null })
    try {
      await axiosInstance.post('ticket-restaurant', payload)
      await get().fetchMesTickets()
    } catch (e: any) {
      set({ error: e.response?.data?.errorMessage ?? e.response?.data?.message ?? 'Erreur lors de la création' })
      throw e
    } finally { set({ loading: false }) }
  },

  valider: async (id) => {
    set({ actionLoadingId: id, error: null })
    try {
      await axiosInstance.put(`ticket-restaurant/${id}/valider`)
      await get().fetchAValider()
    } catch (e: any) {
      set({ error: e.response?.data?.errorMessage ?? e.response?.data?.message ?? 'Erreur lors de la validation' })
      throw e
    } finally { set({ actionLoadingId: null }) }
  },

  rejeter: async (id, motif) => {
    set({ actionLoadingId: id, error: null })
    try {
      await axiosInstance.put(`ticket-restaurant/${id}/rejeter`, { motif })
      await get().fetchAValider()
    } catch (e: any) {
      set({ error: e.response?.data?.errorMessage ?? e.response?.data?.message ?? 'Erreur lors du rejet' })
      throw e
    } finally { set({ actionLoadingId: null }) }
  },

  clearError: () => set({ error: null }),
}))
