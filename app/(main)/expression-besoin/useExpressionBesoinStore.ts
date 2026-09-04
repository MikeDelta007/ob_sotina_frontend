// store/useExpressionBesoinStore.ts
import { create } from 'zustand'
import axiosInstance from '@/app/api/axiosInstance'
import type { ExpressionBesoin } from './types'

interface Motif { id: string; libelle: string; actif: boolean }

interface LignePayload {
  motifId: string
  motifLibelle?: string
  quantite: number
  prixUnitaire: number
}

interface CreerPayload {
  lignes: LignePayload[]
  aFacturePreformat: boolean
  pdfFactureProforma?: File | null
}

interface ExpressionBesoinStore {
  motifs: Motif[]
  mesExpressions: ExpressionBesoin[]
  aValider: ExpressionBesoin[]
  validees: ExpressionBesoin[]
  aTraiter: ExpressionBesoin[]
  traitees: ExpressionBesoin[]
  loading: boolean
  error: string | null
  actionLoadingId: string | null

  fetchMotifs:          () => Promise<void>
  fetchMesExpressions:  () => Promise<void>
  fetchAValider:        () => Promise<void>
  fetchValidees:        () => Promise<void>
  fetchATraiter:        () => Promise<void>
  fetchTraitees:        () => Promise<void>
  creer:                 (payload: CreerPayload) => Promise<void>
  modifier:               (id: string, payload: CreerPayload) => Promise<void>
  valider:                (id: string, quantitesAccordees?: (number | null)[]) => Promise<void>
  rejeter:                (id: string, motif: string) => Promise<void>
  traiter:                (id: string, montantReel: number, beneficiaire: string) => Promise<void>
  clearError:             () => void
}

const buildForm = (payload: CreerPayload) => {
  const form = new FormData()
  const data = new Blob([JSON.stringify({
    lignes: payload.lignes,
    aFacturePreformat: payload.aFacturePreformat,
  })], { type: 'application/json' })
  form.append('data', data)
  if (payload.pdfFactureProforma) form.append('pdfFactureProforma', payload.pdfFactureProforma)
  return form
}

export const useExpressionBesoinStore = create<ExpressionBesoinStore>((set, get) => ({
  motifs: [],
  mesExpressions: [],
  aValider: [],
  validees: [],
  aTraiter: [],
  traitees: [],
  loading: false,
  error: null,
  actionLoadingId: null,

  fetchMotifs: async () => {
    try {
      const { data } = await axiosInstance.get('caisse-avance/motifs')
      set({ motifs: data })
    } catch { set({ error: 'Erreur chargement des motifs' }) }
  },

  fetchMesExpressions: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await axiosInstance.get('expression-besoin/mine')
      set({ mesExpressions: data })
    } catch { set({ error: 'Erreur chargement de vos expressions de besoin' }) }
    finally { set({ loading: false }) }
  },

  fetchAValider: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await axiosInstance.get('expression-besoin/a-valider')
      set({ aValider: data })
    } catch { set({ error: 'Erreur chargement des expressions à valider' }) }
    finally { set({ loading: false }) }
  },

  fetchValidees: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await axiosInstance.get('expression-besoin/validees')
      set({ validees: data })
    } catch { set({ error: 'Erreur chargement des expressions validées' }) }
    finally { set({ loading: false }) }
  },

  fetchATraiter: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await axiosInstance.get('expression-besoin/a-traiter')
      set({ aTraiter: data })
    } catch { set({ error: 'Erreur chargement des expressions à traiter' }) }
    finally { set({ loading: false }) }
  },

  fetchTraitees: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await axiosInstance.get('expression-besoin/traitees')
      set({ traitees: data })
    } catch { set({ error: 'Erreur chargement des expressions traitées' }) }
    finally { set({ loading: false }) }
  },

  creer: async (payload) => {
    set({ loading: true, error: null })
    try {
      await axiosInstance.post('expression-besoin', buildForm(payload),
        { headers: { 'Content-Type': 'multipart/form-data' } })
      await get().fetchMesExpressions()
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur lors de la création' })
      throw e
    } finally { set({ loading: false }) }
  },

  modifier: async (id, payload) => {
    set({ loading: true, error: null })
    try {
      await axiosInstance.put(`expression-besoin/${id}`, buildForm(payload),
        { headers: { 'Content-Type': 'multipart/form-data' } })
      await get().fetchMesExpressions()
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur lors de la modification' })
      throw e
    } finally { set({ loading: false }) }
  },

  valider: async (id, quantitesAccordees) => {
    set({ actionLoadingId: id, error: null })
    try {
      await axiosInstance.put(`expression-besoin/${id}/valider`, { quantitesAccordees })
      await get().fetchAValider()
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur lors de la validation' })
      throw e
    } finally { set({ actionLoadingId: null }) }
  },

  rejeter: async (id, motif) => {
    set({ actionLoadingId: id, error: null })
    try {
      await axiosInstance.put(`expression-besoin/${id}/rejeter`, { motif })
      await get().fetchAValider()
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur lors du rejet' })
      throw e
    } finally { set({ actionLoadingId: null }) }
  },

  traiter: async (id, montantReel, beneficiaire) => {
    set({ actionLoadingId: id, error: null })
    try {
      await axiosInstance.put(`expression-besoin/${id}/traiter`, { montantReel, beneficiaire })
      await get().fetchATraiter()
    } catch (e: any) {
      set({ error: e.response?.data?.message ?? 'Erreur lors du traitement' })
      throw e
    } finally { set({ actionLoadingId: null }) }
  },

  clearError: () => set({ error: null }),
}))
