// store/useMandatementStore.ts
import { create } from 'zustand'
import type { TypeMandatement, TypePaiement, LigneLocale } from './types'
import { newLigne } from './types'

interface MandatementStore {
  open:           boolean
  type:           TypeMandatement
  typePaiement:   TypePaiement
  // Simple : une seule ligne
  ligneSimple:    LigneLocale
  // Cumulatif : N lignes (chacune = un mandatement simple)
  lignes:         LigneLocale[]
  montantAvance:  number
  description:    string

  openModal:         (type?: TypeMandatement) => void
  closeModal:        () => void
  setType:           (t: TypeMandatement) => void
  setTypePaiement:   (t: TypePaiement) => void
  setDescription:    (v: string) => void
  // simple
  setLigneSimple:    (patch: Partial<LigneLocale>) => void
  // cumulatif
  addLigne:          () => void
  updateLigne:       (id: string, patch: Partial<LigneLocale>) => void
  removeLigne:       (id: string) => void
  setMontantAvance:  (v: number) => void
  getMontantTotal:   () => number
  getMontantReliquat:() => number
  reset:             () => void
}

export const useMandatementStore = create<MandatementStore>((set, get) => ({
  open:          false,
  type:          'SIMPLE',
  typePaiement:  'TOTALITE',
  ligneSimple:   newLigne(),
  lignes:        [newLigne()],
  montantAvance: 0,
  description:   '',

  openModal: (type = 'SIMPLE') => {
    get().reset()
    set({ open: true, type })
  },
  closeModal: () => set({ open: false }),
  setType:    (t) => set({ type: t }),
  setTypePaiement: (t) => set({ typePaiement: t }),
  setDescription: (v) => set({ description: v }),

  setLigneSimple: (patch) =>
    set(s => ({ ligneSimple: { ...s.ligneSimple, ...patch } })),

  addLigne: () =>
    set(s => ({ lignes: [...s.lignes, newLigne()] })),

  updateLigne: (id, patch) =>
    set(s => ({ lignes: s.lignes.map(l => l._localId === id ? { ...l, ...patch } : l) })),

  removeLigne: (id) =>
    set(s => ({ lignes: s.lignes.filter(l => l._localId !== id) })),

  setMontantAvance: (v) => set({ montantAvance: v }),

  getMontantTotal: () => {
    const { type, ligneSimple, lignes } = get()
    if (type === 'SIMPLE') return ligneSimple.montant ?? 0
    return lignes.reduce((acc, l) => acc + (l.montant ?? 0), 0)
  },

  getMontantReliquat: () => {
    const { typePaiement, montantAvance } = get()
    if (typePaiement !== 'AVANCE') return 0
    return Math.max(0, get().getMontantTotal() - montantAvance)
  },

  reset: () => set({
    type: 'SIMPLE', typePaiement: 'TOTALITE',
    ligneSimple: newLigne(), lignes: [newLigne()], montantAvance: 0, description: '',
  }),
}))
