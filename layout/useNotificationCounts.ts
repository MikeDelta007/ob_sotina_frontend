import { useEffect } from 'react'
import { create } from 'zustand'
import axiosInstance from '@/app/api/axiosInstance'

export interface NotificationCounts {
  conges: number
  absences: number
  expressionBesoin: number
}

interface NotificationCountsStore {
  counts: NotificationCounts
  fetchCounts: () => Promise<void>
}

const useNotificationCountsStore = create<NotificationCountsStore>((set) => ({
  counts: { conges: 0, absences: 0, expressionBesoin: 0 },
  fetchCounts: async () => {
    try {
      const { data } = await axiosInstance.get('menu/notification-counts')
      set({ counts: data })
    } catch {
      // Un badge de notification ne doit jamais faire planter le menu : on garde le dernier
      // compte connu en cas d'erreur réseau passagère.
    }
  },
}))

// Permet à n'importe quel écran (validation d'absence/congé, expression de besoin...) de forcer
// un rafraîchissement immédiat des badges juste après une action, sans attendre le polling.
export const refreshNotificationCounts = () => useNotificationCountsStore.getState().fetchCounts()

const POLL_INTERVAL_MS = 30_000

// Compteurs "à valider" (congés, autorisations d'absence, expressions de besoin) affichés en
// badge dans le menu, façon notifications non lues — rafraîchis au montage puis périodiquement.
export function useNotificationCounts(enabled: boolean): NotificationCounts {
  const { counts, fetchCounts } = useNotificationCountsStore()

  useEffect(() => {
    if (!enabled) return
    fetchCounts()
    const interval = setInterval(fetchCounts, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [enabled])

  return counts
}
