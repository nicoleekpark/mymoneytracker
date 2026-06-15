/**
 * Dashboard Sections Store
 *
 * @persistence SQLITE - Persisted to app_settings table via settingsStorage.
 * @scope PERMANENT - Survives app restarts.
 *
 * Manages expanded/collapsed state for dashboard sections that require minimum data.
 */

import { create } from 'zustand'

// Lazy import to avoid circular dependency / test issues
// eslint-disable-next-line @typescript-eslint/no-var-requires
const getStorage = () => require('@/infrastructure/db/settingsStorage') as typeof import('@/infrastructure/db/settingsStorage')

type PersistedSectionState = {
  netWorthExpanded: boolean
  personalBestsExpanded: boolean
}

type DashboardSectionsState = PersistedSectionState & {
  // Hydration state
  _hydrated: boolean

  // Actions
  setNetWorthExpanded: (expanded: boolean) => void
  setPersonalBestsExpanded: (expanded: boolean) => void
  _hydrate: () => void
}

const DEFAULT_STATE: PersistedSectionState = {
  netWorthExpanded: false,
  personalBestsExpanded: false,
}

function persistState(state: PersistedSectionState): void {
  const { setStoredValue, STORAGE_KEYS } = getStorage()
  setStoredValue(STORAGE_KEYS.DASHBOARD_SECTIONS, state)
}

export const useDashboardSectionsStore = create<DashboardSectionsState>((set, get) => ({
  ...DEFAULT_STATE,
  _hydrated: false,

  setNetWorthExpanded: (expanded) => {
    set({ netWorthExpanded: expanded })
    const { netWorthExpanded, personalBestsExpanded } = get()
    persistState({ netWorthExpanded, personalBestsExpanded })
  },

  setPersonalBestsExpanded: (expanded) => {
    set({ personalBestsExpanded: expanded })
    const { netWorthExpanded, personalBestsExpanded } = get()
    persistState({ netWorthExpanded, personalBestsExpanded })
  },

  _hydrate: () => {
    if (get()._hydrated) return
    try {
      const { getStoredValue, STORAGE_KEYS } = getStorage()
      const stored = getStoredValue<PersistedSectionState>(STORAGE_KEYS.DASHBOARD_SECTIONS)
      if (stored) {
        set({ ...stored, _hydrated: true })
      } else {
        set({ _hydrated: true })
      }
    } catch {
      // Storage not available (tests, etc.)
      set({ _hydrated: true })
    }
  },
}))
