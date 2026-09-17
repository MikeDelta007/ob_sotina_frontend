import { create } from 'zustand'
import axiosInstance from '@/app/api/axiosInstance'
import type { OrdreMission } from './types'

interface LigneMissionPayload {
  agentId: string
  disponibiliteVoiture: boolean
  voitureId?: string | null
}

interface OrdreMissionPayload {
  regionIds: string[]
  motif: string
  dateDebut: string
  dateFin: string
  lignes: LigneMissionPayload[]
}

interface MissionStore {
  mesMissions: OrdreMission[]
  toutes: OrdreMission[]
  loading: boolean
  error: string | null
  actionLoadingId: string | null

  fetchMesMissions: () => Promise<void>
  fetchToutes: () => Promise<void>
  creer: (payload: OrdreMissionPayload) => Promise<void>
  modifier: (id: string, payload: OrdreMissionPayload) => Promise<void>
  annuler: (id: string) => Promise<void>
  clearError: () => void
}

export const useMissionStore = create<MissionStore>((set, get) => ({
  mesMissions: [],
  toutes: [],
  loading: false,
  error: null,
  actionLoadingId: null,

  fetchMesMissions: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await axiosInstance.get('ordre-mission/mine')
      set({ mesMissions: data })
    } catch { set({ error: 'Erreur chargement de vos missions' }) }
    finally { set({ loading: false }) }
  },

  fetchToutes: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await axiosInstance.get('ordre-mission')
      set({ toutes: data })
    } catch { set({ error: 'Erreur chargement des missions' }) }
    finally { set({ loading: false }) }
  },

  creer: async (payload) => {
    set({ loading: true, error: null })
    try {
      await axiosInstance.post('ordre-mission', payload)
      await get().fetchToutes()
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? "Erreur lors de la création de l'ordre de mission" })
      throw e
    } finally { set({ loading: false }) }
  },

  modifier: async (id, payload) => {
    set({ actionLoadingId: id, error: null })
    try {
      await axiosInstance.put(`ordre-mission/${id}`, payload)
      await get().fetchToutes()
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur lors de la modification' })
      throw e
    } finally { set({ actionLoadingId: null }) }
  },

  annuler: async (id) => {
    set({ actionLoadingId: id, error: null })
    try {
      await axiosInstance.put(`ordre-mission/${id}/annuler`)
      await get().fetchToutes()
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? "Erreur lors de l'annulation" })
      throw e
    } finally { set({ actionLoadingId: null }) }
  },

  clearError: () => set({ error: null }),
}))
