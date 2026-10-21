import { create } from 'zustand'
import { saveAs } from 'file-saver'
import axiosInstance from '@/app/api/axiosInstance'
import type { MotifMission, MoyenTransport, OrdreMission } from './types'

interface LigneMissionPayload {
  agentId: string
  moyenTransport: MoyenTransport
  voitureId?: string | null
}

interface OrdreMissionPayload {
  villeIds: string[]
  motifId: string
  dateDebut: string
  dateFin: string
  lignes: LigneMissionPayload[]
}

interface MissionStore {
  mesMissions: OrdreMission[]
  toutes: OrdreMission[]
  motifs: MotifMission[]
  motifsAdmin: MotifMission[]
  loading: boolean
  error: string | null
  actionLoadingId: string | null

  fetchMesMissions: () => Promise<void>
  fetchToutes: () => Promise<void>
  creer: (payload: OrdreMissionPayload) => Promise<void>
  modifier: (id: string, payload: OrdreMissionPayload) => Promise<void>
  annuler: (id: string) => Promise<void>
  telechargerPdf: (id: string) => Promise<void>
  telechargerPdfGroupe: (ids: string[]) => Promise<void>
  telechargerPdfIntervalle: (dateDebut: string, dateFin: string) => Promise<void>
  clearError: () => void

  fetchMotifs: () => Promise<void>
  fetchMotifsAdmin: () => Promise<void>
  creerMotif: (libelle: string) => Promise<void>
  modifierMotif: (id: string, libelle: string, actif: boolean) => Promise<void>
  supprimerMotif: (id: string) => Promise<void>
}

export const useMissionStore = create<MissionStore>((set, get) => ({
  mesMissions: [],
  toutes: [],
  motifs: [],
  motifsAdmin: [],
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

  telechargerPdf: async (id) => {
    set({ actionLoadingId: id, error: null })
    try {
      const { data } = await axiosInstance.get(`ordre-mission/${id}/pdf`, { responseType: 'blob' })
      saveAs(data, `ordre_mission_${id}.pdf`)
    } catch {
      set({ error: 'Erreur lors du téléchargement du PDF' })
    } finally { set({ actionLoadingId: null }) }
  },

  telechargerPdfGroupe: async (ids) => {
    set({ loading: true, error: null })
    try {
      const { data } = await axiosInstance.post('ordre-mission/pdf-groupe', { ids }, { responseType: 'blob' })
      saveAs(data, 'ordres_mission_groupe.pdf')
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur lors du téléchargement du PDF groupé' })
      throw e
    } finally { set({ loading: false }) }
  },

  telechargerPdfIntervalle: async (dateDebut, dateFin) => {
    set({ loading: true, error: null })
    try {
      const { data } = await axiosInstance.post('ordre-mission/pdf-intervalle', { dateDebut, dateFin }, { responseType: 'blob' })
      saveAs(data, `ordres_mission_du_${dateDebut}_au_${dateFin}.pdf`)
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur lors du téléchargement du PDF (intervalle)' })
      throw e
    } finally { set({ loading: false }) }
  },

  clearError: () => set({ error: null }),

  fetchMotifs: async () => {
    try {
      const { data } = await axiosInstance.get('ordre-mission/motifs')
      set({ motifs: data })
    } catch { set({ motifs: [] }) }
  },

  fetchMotifsAdmin: async () => {
    try {
      const { data } = await axiosInstance.get('ordre-mission/motifs/all')
      set({ motifsAdmin: data })
    } catch { set({ error: 'Erreur chargement des motifs' }) }
  },

  creerMotif: async (libelle) => {
    try {
      await axiosInstance.post('ordre-mission/motifs', { libelle })
      await get().fetchMotifsAdmin()
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur lors de la création du motif' })
      throw e
    }
  },

  modifierMotif: async (id, libelle, actif) => {
    try {
      await axiosInstance.put(`ordre-mission/motifs/${id}`, { libelle, actif })
      await get().fetchMotifsAdmin()
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur lors de la modification du motif' })
      throw e
    }
  },

  supprimerMotif: async (id) => {
    try {
      await axiosInstance.delete(`ordre-mission/motifs/${id}`)
      await get().fetchMotifsAdmin()
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur lors de la désactivation du motif' })
      throw e
    }
  },
}))
