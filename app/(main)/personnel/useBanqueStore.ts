import { create } from 'zustand'
import axiosInstance from '@/app/api/axiosInstance'
import type { Banque } from './types'

interface BanqueData {
  name: string
  codeBanque: string
  NomComplet?: string
}

interface BanqueStore {
  banques: Banque[]
  loading: boolean
  error: string | null
  fetchBanques: () => Promise<void>
  reloadBanques: () => Promise<void>
  createBanque: (data: BanqueData) => Promise<void>
  updateBanque: (id: string, data: BanqueData) => Promise<void>
  deleteBanque: (id: string) => Promise<void>
  clearError: () => void
}

// Référentiel des banques (RIB), partagé par le formulaire personnel, le profil (préremplissage
// du code banque) et l'écran d'administration (CRUD complet).
export const useBanqueStore = create<BanqueStore>((set, get) => ({
  banques: [],
  loading: false,
  error: null,

  // Chargement paresseux : ne recharge pas si déjà en cache — utilisé par les formulaires qui
  // ont juste besoin de la liste pour préremplir le code banque.
  fetchBanques: async () => {
    if (get().banques.length > 0 || get().loading) return
    await get().reloadBanques()
  },

  // Rechargement forcé — utilisé par l'écran d'administration après chaque mutation.
  reloadBanques: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await axiosInstance.get('banques/all')
      set({ banques: data })
    } catch {
      set({ error: 'Erreur chargement des banques' })
    } finally {
      set({ loading: false })
    }
  },

  createBanque: async (data) => {
    set({ loading: true, error: null })
    try {
      await axiosInstance.post('banques/', data)
      await get().reloadBanques()
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur création de la banque' })
      throw e
    } finally { set({ loading: false }) }
  },

  updateBanque: async (id, data) => {
    set({ loading: true, error: null })
    try {
      await axiosInstance.put(`banques/${id}`, data)
      await get().reloadBanques()
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur modification de la banque' })
      throw e
    } finally { set({ loading: false }) }
  },

  deleteBanque: async (id) => {
    set({ loading: true, error: null })
    try {
      await axiosInstance.delete(`banques/${id}`)
      await get().reloadBanques()
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur suppression de la banque' })
      throw e
    } finally { set({ loading: false }) }
  },

  clearError: () => set({ error: null }),
}))
