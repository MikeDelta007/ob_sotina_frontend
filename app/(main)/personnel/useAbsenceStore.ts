import { create } from 'zustand'
import axiosInstance from '@/app/api/axiosInstance'
import type { DemandeAbsence, TypeAbsence } from './types'

interface CreerAbsencePayload {
  type: TypeAbsence
  dateDebut: string
  dateFin: string
  motif: string
}

interface AbsenceStore {
  mesDemandes: DemandeAbsence[]
  aValider: DemandeAbsence[]
  demandesDeMesAgents: DemandeAbsence[]
  demandesTraitees: DemandeAbsence[]
  loading: boolean
  error: string | null
  actionLoadingId: string | null

  fetchMesDemandes: (type: TypeAbsence) => Promise<void>
  fetchAValider: (type: TypeAbsence) => Promise<void>
  fetchDemandesDeMesAgents: (type: TypeAbsence) => Promise<void>
  fetchDemandesTraitees: (type: TypeAbsence) => Promise<void>
  creer: (payload: CreerAbsencePayload) => Promise<void>
  valider: (id: string, type: TypeAbsence) => Promise<void>
  rejeter: (id: string, motif: string, type: TypeAbsence) => Promise<void>
  clearError: () => void
}

export const useAbsenceStore = create<AbsenceStore>((set, get) => ({
  mesDemandes: [],
  aValider: [],
  demandesDeMesAgents: [],
  demandesTraitees: [],
  loading: false,
  error: null,
  actionLoadingId: null,

  fetchMesDemandes: async (type) => {
    set({ loading: true, error: null })
    try {
      const { data } = await axiosInstance.get('demande-absence/mine', { params: { type } })
      set({ mesDemandes: data })
    } catch { set({ error: "Erreur chargement de vos demandes d'absence" }) }
    finally { set({ loading: false }) }
  },

  fetchAValider: async (type) => {
    set({ loading: true, error: null })
    try {
      const { data } = await axiosInstance.get('demande-absence/a-valider', { params: { type } })
      set({ aValider: data })
    } catch { set({ error: 'Erreur chargement des demandes à valider' }) }
    finally { set({ loading: false }) }
  },

  fetchDemandesDeMesAgents: async (type) => {
    set({ loading: true, error: null })
    try {
      const { data } = await axiosInstance.get('demande-absence/mes-agents', { params: { type } })
      set({ demandesDeMesAgents: data })
    } catch { set({ error: 'Erreur chargement des demandes de vos agents' }) }
    finally { set({ loading: false }) }
  },

  fetchDemandesTraitees: async (type) => {
    set({ loading: true, error: null })
    try {
      const { data } = await axiosInstance.get('demande-absence/traitees', { params: { type } })
      set({ demandesTraitees: data })
    } catch { set({ error: 'Erreur chargement des demandes déjà traitées' }) }
    finally { set({ loading: false }) }
  },

  creer: async (payload) => {
    set({ loading: true, error: null })
    try {
      await axiosInstance.post('demande-absence', payload)
      await get().fetchMesDemandes(payload.type)
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur lors de la création de la demande' })
      throw e
    } finally { set({ loading: false }) }
  },

  valider: async (id, type) => {
    set({ actionLoadingId: id, error: null })
    try {
      await axiosInstance.put(`demande-absence/${id}/valider`)
      await Promise.all([get().fetchAValider(type), get().fetchDemandesDeMesAgents(type), get().fetchDemandesTraitees(type)])
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur lors de la validation' })
      throw e
    } finally { set({ actionLoadingId: null }) }
  },

  rejeter: async (id, motif, type) => {
    set({ actionLoadingId: id, error: null })
    try {
      await axiosInstance.put(`demande-absence/${id}/rejeter`, { motif })
      await Promise.all([get().fetchAValider(type), get().fetchDemandesDeMesAgents(type), get().fetchDemandesTraitees(type)])
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur lors du rejet' })
      throw e
    } finally { set({ actionLoadingId: null }) }
  },

  clearError: () => set({ error: null }),
}))
