import { create } from 'zustand'
import axiosInstance from '@/app/api/axiosInstance'
import type { DemandeAbsence } from './types'

interface CreerAbsencePayload {
  dateDebut: string
  dateFin: string
  motif: string
}

interface AbsenceStore {
  mesDemandes: DemandeAbsence[]
  aValider: DemandeAbsence[]
  loading: boolean
  error: string | null
  actionLoadingId: string | null

  fetchMesDemandes: () => Promise<void>
  fetchAValider: () => Promise<void>
  creer: (payload: CreerAbsencePayload) => Promise<void>
  valider: (id: string) => Promise<void>
  rejeter: (id: string, motif: string) => Promise<void>
  clearError: () => void
}

export const useAbsenceStore = create<AbsenceStore>((set, get) => ({
  mesDemandes: [],
  aValider: [],
  loading: false,
  error: null,
  actionLoadingId: null,

  fetchMesDemandes: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await axiosInstance.get('demande-absence/mine')
      set({ mesDemandes: data })
    } catch { set({ error: "Erreur chargement de vos demandes d'absence" }) }
    finally { set({ loading: false }) }
  },

  fetchAValider: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await axiosInstance.get('demande-absence/a-valider')
      set({ aValider: data })
    } catch { set({ error: 'Erreur chargement des demandes à valider' }) }
    finally { set({ loading: false }) }
  },

  creer: async (payload) => {
    set({ loading: true, error: null })
    try {
      await axiosInstance.post('demande-absence', payload)
      await get().fetchMesDemandes()
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur lors de la création de la demande' })
      throw e
    } finally { set({ loading: false }) }
  },

  valider: async (id) => {
    set({ actionLoadingId: id, error: null })
    try {
      await axiosInstance.put(`demande-absence/${id}/valider`)
      await get().fetchAValider()
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur lors de la validation' })
      throw e
    } finally { set({ actionLoadingId: null }) }
  },

  rejeter: async (id, motif) => {
    set({ actionLoadingId: id, error: null })
    try {
      await axiosInstance.put(`demande-absence/${id}/rejeter`, { motif })
      await get().fetchAValider()
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur lors du rejet' })
      throw e
    } finally { set({ actionLoadingId: null }) }
  },

  clearError: () => set({ error: null }),
}))
