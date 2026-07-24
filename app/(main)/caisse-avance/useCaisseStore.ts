// store/useCaisseStore.ts
import { create } from 'zustand'
import axiosInstance from '@/app/api/axiosInstance'
import type { CaisseAvance, Motif, Mandatement, Approvisionnement } from './types'

interface CaisseStore {
  caisse: CaisseAvance | null
  motifs: Motif[]
  allMotifs: Motif[]
  mandatements: Mandatement[]
  approvisionnements: Approvisionnement[]
  loading: boolean
  error: string | null
  showApprovisionnementModal: boolean
  motifLoading: boolean
  reliquatLoadingId: string | null

  fetchCaisse:                  () => Promise<void>
  fetchMotifs:                   () => Promise<void>
  fetchAllMotifs:                 () => Promise<void>
  createMotif:                    (libelle: string) => Promise<void>
  updateMotif:                    (id: string, data: { libelle: string; actif: boolean }) => Promise<void>
  deleteMotif:                    (id: string) => Promise<void>
  fetchMandatements:             () => Promise<void>
  fetchApprovisionnements:       () => Promise<void>
  approvisionner:                (data: { montant: number; date: string; description?: string }) => Promise<void>
  payerReliquat:                  (id: string) => Promise<void>
  openApprovisionnementModal:    () => void
  closeApprovisionnementModal:   () => void
  clearError:                    () => void
}

export const useCaisseStore = create<CaisseStore>((set, get) => ({
  caisse: null,
  motifs: [],
  allMotifs: [],
  mandatements: [],
  approvisionnements: [],
  loading: false,
  error: null,
  showApprovisionnementModal: false,
  motifLoading: false,
  reliquatLoadingId: null,

  fetchCaisse: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await axiosInstance.get('caisse-avance/current')
      set({ caisse: data })
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Caisse non initialisée' })
    } finally { set({ loading: false }) }
  },

  fetchMotifs: async () => {
    try {
      const { data } = await axiosInstance.get('caisse-avance/motifs')
      set({ motifs: data })
    } catch { set({ error: 'Erreur chargement motifs' }) }
  },

  fetchAllMotifs: async () => {
    try {
      const { data } = await axiosInstance.get('caisse-avance/motifs/all')
      set({ allMotifs: data })
    } catch { set({ error: 'Erreur chargement motifs' }) }
  },

  createMotif: async (libelle) => {
    set({ motifLoading: true, error: null })
    try {
      await axiosInstance.post('caisse-avance/motifs', { libelle })
      await Promise.all([get().fetchMotifs(), get().fetchAllMotifs()])
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur création motif' })
      throw e
    } finally { set({ motifLoading: false }) }
  },

  updateMotif: async (id, data) => {
    set({ motifLoading: true, error: null })
    try {
      await axiosInstance.put(`caisse-avance/motifs/${id}`, data)
      await Promise.all([get().fetchMotifs(), get().fetchAllMotifs()])
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur modification motif' })
      throw e
    } finally { set({ motifLoading: false }) }
  },

  deleteMotif: async (id) => {
    set({ motifLoading: true, error: null })
    try {
      await axiosInstance.delete(`caisse-avance/motifs/${id}`)
      await Promise.all([get().fetchMotifs(), get().fetchAllMotifs()])
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur suppression motif' })
      throw e
    } finally { set({ motifLoading: false }) }
  },

  fetchMandatements: async () => {
    set({ loading: true })
    try {
      const { data } = await axiosInstance.get('mandatement')
      set({ mandatements: data })
    } catch { set({ error: 'Erreur chargement mandatements' }) }
    finally { set({ loading: false }) }
  },

  fetchApprovisionnements: async () => {
    try {
      const { data } = await axiosInstance.get('caisse-avance/approvisionnements')
      set({ approvisionnements: data })
    } catch { set({ error: 'Erreur chargement des approvisionnements' }) }
  },

  approvisionner: async (payload) => {
    set({ loading: true, error: null })
    try {
      await axiosInstance.post('caisse-avance/approvisionner', payload)
      await Promise.all([get().fetchCaisse(), get().fetchApprovisionnements()])
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur lors de l\'approvisionnement' })
      throw e
    } finally { set({ loading: false }) }
  },

  payerReliquat: async (id) => {
    set({ reliquatLoadingId: id, error: null })
    try {
      await axiosInstance.put(`mandatement/${id}/payer-reliquat`)
      await Promise.all([get().fetchCaisse(), get().fetchMandatements()])
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur lors du paiement du reliquat' })
      throw e
    } finally { set({ reliquatLoadingId: null }) }
  },

  openApprovisionnementModal:  () => set({ showApprovisionnementModal: true }),
  closeApprovisionnementModal: () => set({ showApprovisionnementModal: false }),

  clearError: () => set({ error: null }),
}))
