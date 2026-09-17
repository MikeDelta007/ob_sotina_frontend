import { create } from 'zustand'
import axiosInstance from '@/app/api/axiosInstance'
import type { Division, Fonction, Voiture, Chauffeur, ProprietaireVoiture, TypePersonnel } from './types'

interface VoitureData {
  immatriculation: string
  marque?: string
  actif?: boolean
  proprietaireType: ProprietaireVoiture
  proprietaireAgentId?: string | null
  proprietairePersonnelId?: string | null
}

interface PersonnelData {
  firstname: string
  lastname: string
  phone?: string
  email?: string
  matricule?: string
  civilite?: string | null
  division?: Division | null
  fonction?: Fonction | null
  typePersonnel?: TypePersonnel | null
  actif?: boolean
}

interface PersonnelStore {
  divisions: Division[]
  allDivisions: Division[]
  fonctions: Fonction[]
  allFonctions: Fonction[]
  allVoitures: Voiture[]
  allChauffeurs: Chauffeur[]
  loading: boolean
  error: string | null

  fetchDivisions: () => Promise<void>
  fetchAllDivisions: () => Promise<void>
  createDivision: (libelle: string, chefServiceId?: string | null) => Promise<void>
  updateDivision: (id: string, data: { libelle: string; chefServiceId?: string | null; actif: boolean }) => Promise<void>
  deleteDivision: (id: string) => Promise<void>

  fetchFonctions: () => Promise<void>
  fetchAllFonctions: () => Promise<void>
  createFonction: (libelle: string) => Promise<void>
  updateFonction: (id: string, data: { libelle: string; actif: boolean }) => Promise<void>
  deleteFonction: (id: string) => Promise<void>

  fetchAllVoitures: () => Promise<void>
  createVoiture: (data: VoitureData) => Promise<void>
  updateVoiture: (id: string, data: VoitureData & { actif: boolean }) => Promise<void>
  deleteVoiture: (id: string) => Promise<void>

  fetchAllChauffeurs: () => Promise<void>
  createChauffeur: (data: PersonnelData) => Promise<void>
  updateChauffeur: (id: string, data: PersonnelData & { actif: boolean }) => Promise<void>
  deleteChauffeur: (id: string) => Promise<void>
  importPersonnels: (file: File) => Promise<string>

  clearError: () => void
}

export const usePersonnelStore = create<PersonnelStore>((set, get) => ({
  divisions: [],
  allDivisions: [],
  fonctions: [],
  allFonctions: [],
  allVoitures: [],
  allChauffeurs: [],
  loading: false,
  error: null,

  fetchDivisions: async () => {
    try {
      const { data } = await axiosInstance.get('personnel/divisions')
      set({ divisions: data })
    } catch { set({ error: 'Erreur chargement des divisions' }) }
  },

  fetchAllDivisions: async () => {
    try {
      const { data } = await axiosInstance.get('personnel/divisions/all')
      set({ allDivisions: data })
    } catch { set({ error: 'Erreur chargement des divisions' }) }
  },

  createDivision: async (libelle, chefServiceId) => {
    set({ loading: true, error: null })
    try {
      await axiosInstance.post('personnel/divisions', { libelle, chefServiceId })
      await Promise.all([get().fetchDivisions(), get().fetchAllDivisions()])
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur création de la division' })
      throw e
    } finally { set({ loading: false }) }
  },

  updateDivision: async (id, data) => {
    set({ loading: true, error: null })
    try {
      await axiosInstance.put(`personnel/divisions/${id}`, data)
      await Promise.all([get().fetchDivisions(), get().fetchAllDivisions()])
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur modification de la division' })
      throw e
    } finally { set({ loading: false }) }
  },

  deleteDivision: async (id) => {
    set({ loading: true, error: null })
    try {
      await axiosInstance.delete(`personnel/divisions/${id}`)
      await Promise.all([get().fetchDivisions(), get().fetchAllDivisions()])
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur désactivation de la division' })
      throw e
    } finally { set({ loading: false }) }
  },

  fetchFonctions: async () => {
    try {
      const { data } = await axiosInstance.get('personnel/fonctions')
      set({ fonctions: data })
    } catch { set({ error: 'Erreur chargement des fonctions' }) }
  },

  fetchAllFonctions: async () => {
    try {
      const { data } = await axiosInstance.get('personnel/fonctions/all')
      set({ allFonctions: data })
    } catch { set({ error: 'Erreur chargement des fonctions' }) }
  },

  createFonction: async (libelle) => {
    set({ loading: true, error: null })
    try {
      await axiosInstance.post('personnel/fonctions', { libelle })
      await Promise.all([get().fetchFonctions(), get().fetchAllFonctions()])
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur création de la fonction' })
      throw e
    } finally { set({ loading: false }) }
  },

  updateFonction: async (id, data) => {
    set({ loading: true, error: null })
    try {
      await axiosInstance.put(`personnel/fonctions/${id}`, data)
      await Promise.all([get().fetchFonctions(), get().fetchAllFonctions()])
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur modification de la fonction' })
      throw e
    } finally { set({ loading: false }) }
  },

  deleteFonction: async (id) => {
    set({ loading: true, error: null })
    try {
      await axiosInstance.delete(`personnel/fonctions/${id}`)
      await Promise.all([get().fetchFonctions(), get().fetchAllFonctions()])
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur désactivation de la fonction' })
      throw e
    } finally { set({ loading: false }) }
  },

  fetchAllVoitures: async () => {
    try {
      const { data } = await axiosInstance.get('personnel/voitures/all')
      set({ allVoitures: data })
    } catch { set({ error: 'Erreur chargement des véhicules' }) }
  },

  createVoiture: async (data) => {
    set({ loading: true, error: null })
    try {
      await axiosInstance.post('personnel/voitures', data)
      await get().fetchAllVoitures()
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur création du véhicule' })
      throw e
    } finally { set({ loading: false }) }
  },

  updateVoiture: async (id, data) => {
    set({ loading: true, error: null })
    try {
      await axiosInstance.put(`personnel/voitures/${id}`, data)
      await get().fetchAllVoitures()
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur modification du véhicule' })
      throw e
    } finally { set({ loading: false }) }
  },

  deleteVoiture: async (id) => {
    set({ loading: true, error: null })
    try {
      await axiosInstance.delete(`personnel/voitures/${id}`)
      await get().fetchAllVoitures()
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur désactivation du véhicule' })
      throw e
    } finally { set({ loading: false }) }
  },

  fetchAllChauffeurs: async () => {
    try {
      const { data } = await axiosInstance.get('personnel/personnels/all')
      set({ allChauffeurs: data })
    } catch { set({ error: 'Erreur chargement des chauffeurs' }) }
  },

  createChauffeur: async (data) => {
    set({ loading: true, error: null })
    try {
      await axiosInstance.post('personnel/personnels', data)
      await get().fetchAllChauffeurs()
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur création du chauffeur' })
      throw e
    } finally { set({ loading: false }) }
  },

  updateChauffeur: async (id, data) => {
    set({ loading: true, error: null })
    try {
      await axiosInstance.put(`personnel/personnels/${id}`, data)
      await get().fetchAllChauffeurs()
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur modification du chauffeur' })
      throw e
    } finally { set({ loading: false }) }
  },

  deleteChauffeur: async (id) => {
    set({ loading: true, error: null })
    try {
      await axiosInstance.delete(`personnel/personnels/${id}`)
      await get().fetchAllChauffeurs()
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur désactivation du chauffeur' })
      throw e
    } finally { set({ loading: false }) }
  },

  importPersonnels: async (file) => {
    set({ loading: true, error: null })
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await axiosInstance.post('personnel/personnels/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      await get().fetchAllChauffeurs()
      return data as string
    } catch (e: any) {
      const msg = e.response?.data ?? "Erreur lors de l'import du fichier"
      set({ error: typeof msg === 'string' ? msg : "Erreur lors de l'import du fichier" })
      throw e
    } finally { set({ loading: false }) }
  },

  clearError: () => set({ error: null }),
}))
