/**
 * Zero-Spend Days Store
 *
 * @persistence SQLITE - Persisted to app_settings table via settingsStorage.
 * @scope PERMANENT - Survives app restarts, user-marked zero-spend days.
 *
 * Manages user-marked zero-spend days (days with no spending intentionally marked by user).
 */

import { create } from 'zustand'

// Lazy import to avoid circular dependency / test issues
// eslint-disable-next-line @typescript-eslint/no-var-requires
const getStorage = () =>
  require('@/infrastructure/db/settingsStorage') as typeof import('@/infrastructure/db/settingsStorage')

type ZeroSpendState = {
  // Set of YMD strings (YYYY-MM-DD) marked as zero-spend
  days: Set<string>

  // Hydration state
  _hydrated: boolean

  // Actions
  toggleDay: (ymd: string, isZeroSpend: boolean) => void
  isZeroSpend: (ymd: string) => boolean
  _hydrate: () => void
}

function persistDays(days: Set<string>): void {
  const { setStoredValue, STORAGE_KEYS } = getStorage()
  // Convert Set to array for JSON serialization
  setStoredValue(STORAGE_KEYS.ZERO_SPEND_DAYS, Array.from(days))
}

export const useZeroSpendStore = create<ZeroSpendState>((set, get) => ({
  days: new Set(),
  _hydrated: false,

  toggleDay: (ymd, isZeroSpend) => {
    const { days } = get()
    const newDays = new Set(days)

    if (isZeroSpend) {
      newDays.add(ymd)
    } else {
      newDays.delete(ymd)
    }

    set({ days: newDays })
    persistDays(newDays)
  },

  isZeroSpend: (ymd) => {
    return get().days.has(ymd)
  },

  _hydrate: () => {
    if (get()._hydrated) return
    try {
      const { getStoredValue, STORAGE_KEYS } = getStorage()
      const stored = getStoredValue<string[]>(STORAGE_KEYS.ZERO_SPEND_DAYS)
      if (stored && Array.isArray(stored)) {
        set({ days: new Set(stored), _hydrated: true })
      } else {
        set({ _hydrated: true })
      }
    } catch {
      // Storage not available (tests, etc.)
      set({ _hydrated: true })
    }
  },
}))
