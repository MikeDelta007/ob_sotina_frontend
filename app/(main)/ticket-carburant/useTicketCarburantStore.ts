import { create } from 'zustand'
import axiosInstance from '@/app/api/axiosInstance'
import type { MotifCarburant, TicketCarburant, Ville } from './types'

interface CreerPayload {
  motifId: string
  date: string
  villeDepartId: string
  villeArriveeId: string
  nombreTicketsDemande: number
}

interface TicketCarburantStore {
  villes: Ville[]
  villesErreur: boolean
  motifs: MotifCarburant[]
  motifsAdmin: MotifCarburant[]
  mesTickets: TicketCarburant[]
  aValider: TicketCarburant[]
  toutes: TicketCarburant[]
  loading: boolean
  error: string | null
  actionLoadingId: string | null

  fetchVilles:      () => Promise<void>
  fetchMotifs:      () => Promise<void>
  fetchMotifsAdmin: () => Promise<void>
  creerMotif:       (libelle: string) => Promise<void>
  modifierMotif:    (id: string, libelle: string, actif: boolean) => Promise<void>
  supprimerMotif:   (id: string) => Promise<void>
  fetchMesTickets:  () => Promise<void>
  fetchAValider:    () => Promise<void>
  fetchToutes:      () => Promise<void>
  creer:            (payload: CreerPayload) => Promise<void>
  valider:          (id: string, nombreTicketsAccorde?: number) => Promise<void>
  rejeter:          (id: string, motif: string) => Promise<void>
  clearError:       () => void
}

export const useTicketCarburantStore = create<TicketCarburantStore>((set, get) => ({
  villes: [],
  villesErreur: false,
  motifs: [],
  motifsAdmin: [],
  mesTickets: [],
  aValider: [],
  toutes: [],
  loading: false,
  error: null,
  actionLoadingId: null,

  fetchVilles: async () => {
    try {
      const { data } = await axiosInstance.get('parametrage/villes')
      set({ villes: data, villesErreur: false })
    } catch { set({ villes: [], villesErreur: true }) }
  },

  fetchMotifs: async () => {
    try {
      const { data } = await axiosInstance.get('ticket-carburant/motifs')
      set({ motifs: data })
    } catch { set({ motifs: [] }) }
  },

  fetchMotifsAdmin: async () => {
    try {
      const { data } = await axiosInstance.get('ticket-carburant/motifs/all')
      set({ motifsAdmin: data })
    } catch { set({ error: 'Erreur chargement des motifs' }) }
  },

  creerMotif: async (libelle) => {
    try {
      await axiosInstance.post('ticket-carburant/motifs', { libelle })
      await get().fetchMotifsAdmin()
    } catch (e: any) {
      set({ error: e.response?.data?.errorMessage ?? e.response?.data?.message ?? 'Erreur lors de la création du motif' })
      throw e
    }
  },

  modifierMotif: async (id, libelle, actif) => {
    try {
      await axiosInstance.put(`ticket-carburant/motifs/${id}`, { libelle, actif })
      await get().fetchMotifsAdmin()
    } catch (e: any) {
      set({ error: e.response?.data?.errorMessage ?? e.response?.data?.message ?? 'Erreur lors de la modification du motif' })
      throw e
    }
  },

  supprimerMotif: async (id) => {
    try {
      await axiosInstance.delete(`ticket-carburant/motifs/${id}`)
      await get().fetchMotifsAdmin()
    } catch (e: any) {
      set({ error: e.response?.data?.errorMessage ?? e.response?.data?.message ?? 'Erreur lors de la désactivation du motif' })
      throw e
    }
  },

  fetchMesTickets: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await axiosInstance.get('ticket-carburant/mine')
      set({ mesTickets: data })
    } catch { set({ error: 'Erreur chargement de vos demandes' }) }
    finally { set({ loading: false }) }
  },

  fetchAValider: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await axiosInstance.get('ticket-carburant/a-valider')
      set({ aValider: data })
    } catch { set({ error: 'Erreur chargement des demandes à valider' }) }
    finally { set({ loading: false }) }
  },

  fetchToutes: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await axiosInstance.get('ticket-carburant/toutes')
      set({ toutes: data })
    } catch { set({ error: 'Erreur chargement des demandes' }) }
    finally { set({ loading: false }) }
  },

  creer: async (payload) => {
    set({ loading: true, error: null })
    try {
      await axiosInstance.post('ticket-carburant', payload)
      await get().fetchMesTickets()
    } catch (e: any) {
      set({ error: e.response?.data?.errorMessage ?? e.response?.data?.message ?? 'Erreur lors de la création' })
      throw e
    } finally { set({ loading: false }) }
  },

  valider: async (id, nombreTicketsAccorde) => {
    set({ actionLoadingId: id, error: null })
    try {
      await axiosInstance.put(`ticket-carburant/${id}/valider`, { nombreTicketsAccorde })
      await get().fetchAValider()
    } catch (e: any) {
      set({ error: e.response?.data?.errorMessage ?? e.response?.data?.message ?? 'Erreur lors de la validation' })
      throw e
    } finally { set({ actionLoadingId: null }) }
  },

  rejeter: async (id, motif) => {
    set({ actionLoadingId: id, error: null })
    try {
      await axiosInstance.put(`ticket-carburant/${id}/rejeter`, { motif })
      await get().fetchAValider()
    } catch (e: any) {
      set({ error: e.response?.data?.errorMessage ?? e.response?.data?.message ?? 'Erreur lors du rejet' })
      throw e
    } finally { set({ actionLoadingId: null }) }
  },

  clearError: () => set({ error: null }),
}))
