import { create } from 'zustand'
import axiosInstance from '@/app/api/axiosInstance'
import type { Division, Fonction } from './types'

interface PersonnelStore {
  divisions: Division[]
  allDivisions: Division[]
  fonctions: Fonction[]
  allFonctions: Fonction[]
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

  clearError: () => void
}

export const usePersonnelStore = create<PersonnelStore>((set, get) => ({
  divisions: [],
  allDivisions: [],
  fonctions: [],
  allFonctions: [],
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

  clearError: () => set({ error: null }),
}))
