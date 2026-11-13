import { create } from 'zustand'
import axiosInstance from '@/app/api/axiosInstance'
import type { Axe, AxeImportResult, Etablissement } from './types'

interface LigneRequest {
  etablissementId: string
  centreSecondaire: boolean
  relais?: string
}

interface AxePayload {
  numero: number
  itineraire: string
  etablissements: LigneRequest[]
}

interface AxeStore {
  axes: Axe[]
  etablissements: Etablissement[]
  loading: boolean
  error: string | null
  actionLoadingId: string | null
  importing: boolean
  importResult: AxeImportResult | null
  estChefHygieneSecurite: boolean
  estChefHSCharge: boolean

  fetchAxes: () => Promise<void>
  fetchEtablissements: () => Promise<void>
  fetchEstChefHygieneSecurite: () => Promise<void>
  creer: (payload: AxePayload) => Promise<void>
  modifier: (id: string, payload: AxePayload) => Promise<void>
  supprimer: (id: string) => Promise<void>
  importerExcel: (fichier: File) => Promise<void>
  clearError: () => void
  clearImportResult: () => void
}

export const useAxeStore = create<AxeStore>((set, get) => ({
  axes: [],
  etablissements: [],
  loading: false,
  error: null,
  actionLoadingId: null,
  importing: false,
  importResult: null,
  estChefHygieneSecurite: false,
  estChefHSCharge: false,

  fetchEstChefHygieneSecurite: async () => {
    try {
      const { data } = await axiosInstance.get('axes/suis-chef-hygiene-securite')
      set({ estChefHygieneSecurite: !!data })
    } catch { set({ estChefHygieneSecurite: false }) }
    finally { set({ estChefHSCharge: true }) }
  },

  fetchAxes: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await axiosInstance.get('axes/all')
      set({ axes: data })
    } catch { set({ error: 'Erreur chargement des axes' }) }
    finally { set({ loading: false }) }
  },

  fetchEtablissements: async () => {
    try {
      const { data } = await axiosInstance.get('parametrage/etablissements')
      set({ etablissements: data })
    } catch { set({ etablissements: [] }) }
  },

  creer: async (payload) => {
    set({ loading: true, error: null })
    try {
      await axiosInstance.post('axes', payload)
      await get().fetchAxes()
    } catch (e: any) {
      set({ error: e.response?.data?.errorMessage ?? e.response?.data?.message ?? "Erreur lors de la création de l'axe" })
      throw e
    } finally { set({ loading: false }) }
  },

  modifier: async (id, payload) => {
    set({ loading: true, error: null })
    try {
      await axiosInstance.put(`axes/${id}`, payload)
      await get().fetchAxes()
    } catch (e: any) {
      set({ error: e.response?.data?.errorMessage ?? e.response?.data?.message ?? "Erreur lors de la modification de l'axe" })
      throw e
    } finally { set({ loading: false }) }
  },

  supprimer: async (id) => {
    set({ actionLoadingId: id, error: null })
    try {
      await axiosInstance.delete(`axes/${id}`)
      await get().fetchAxes()
    } catch (e: any) {
      set({ error: e.response?.data?.errorMessage ?? e.response?.data?.message ?? "Erreur lors de la suppression de l'axe" })
      throw e
    } finally { set({ actionLoadingId: null }) }
  },

  importerExcel: async (fichier) => {
    set({ importing: true, error: null, importResult: null })
    try {
      const form = new FormData()
      form.append('fichier', fichier)
      const { data } = await axiosInstance.post('axes/import', form,
        { headers: { 'Content-Type': 'multipart/form-data' } })
      set({ importResult: data })
      await get().fetchAxes()
    } catch (e: any) {
      set({ error: e.response?.data?.errorMessage ?? e.response?.data?.message ?? "Erreur lors de l'import du fichier" })
      throw e
    } finally { set({ importing: false }) }
  },

  clearError: () => set({ error: null }),
  clearImportResult: () => set({ importResult: null }),
}))
