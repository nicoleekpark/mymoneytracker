/**
 * Settings Store
 *
 * @persistence SQLITE - Persisted to app_settings table via settingsStorage.
 * @scope PERMANENT - Survives app restarts, user preferences.
 *
 * Manages app settings including notification preferences and budget config.
 */

import { create } from 'zustand'
import { useDataRefreshStore } from './data-refresh.store'

// Lazy import to avoid circular dependency / test issues
// eslint-disable-next-line @typescript-eslint/no-var-requires
const getStorage = () => require('@/infrastructure/db/settingsStorage') as typeof import('@/infrastructure/db/settingsStorage')

type PersistedSettings = {
  budgetAlertEnabled: boolean
  budgetAlertThreshold: number
  monthlyBudget: number
}

type SettingsState = PersistedSettings & {
  // Hydration state
  _hydrated: boolean

  // Actions
  setBudgetAlertEnabled: (enabled: boolean) => void
  setBudgetAlertThreshold: (threshold: number) => void
  setMonthlyBudget: (amountCents: number) => void
  _hydrate: () => void
}

const DEFAULT_SETTINGS: PersistedSettings = {
  budgetAlertEnabled: true,
  budgetAlertThreshold: 80,
  monthlyBudget: 100000, // $1000 in cents
}

function persistSettings(state: PersistedSettings): void {
  const { setStoredValue, STORAGE_KEYS } = getStorage()
  setStoredValue(STORAGE_KEYS.SETTINGS, state)
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  _hydrated: false,

  setBudgetAlertEnabled: (enabled) => {
    set({ budgetAlertEnabled: enabled })
    const { budgetAlertEnabled, budgetAlertThreshold, monthlyBudget } = get()
    persistSettings({ budgetAlertEnabled, budgetAlertThreshold, monthlyBudget })
  },

  setBudgetAlertThreshold: (threshold) => {
    const clamped = Math.max(0, Math.min(100, threshold))
    set({ budgetAlertThreshold: clamped })
    const { budgetAlertEnabled, budgetAlertThreshold, monthlyBudget } = get()
    persistSettings({ budgetAlertEnabled, budgetAlertThreshold, monthlyBudget })
  },

  setMonthlyBudget: (amountCents) => {
    set({ monthlyBudget: Math.max(0, amountCents) })
    const { budgetAlertEnabled, budgetAlertThreshold, monthlyBudget } = get()
    persistSettings({ budgetAlertEnabled, budgetAlertThreshold, monthlyBudget })
    // Trigger refresh for components that depend on budget settings
    useDataRefreshStore.getState().invalidateSettings()
  },

  _hydrate: () => {
    if (get()._hydrated) return
    try {
      const { getStoredValue, STORAGE_KEYS } = getStorage()
      const stored = getStoredValue<PersistedSettings>(STORAGE_KEYS.SETTINGS)
      if (stored) {
        // Migrate users with no budget set (0) to the new default
        const migratedBudget = stored.monthlyBudget > 0
          ? stored.monthlyBudget
          : DEFAULT_SETTINGS.monthlyBudget
        set({ ...stored, monthlyBudget: migratedBudget, _hydrated: true })
      } else {
        set({ _hydrated: true })
      }
    } catch {
      // Storage not available (tests, etc.)
      set({ _hydrated: true })
    }
  },
}))

// Note: Hydration happens lazily - call _hydrate() after DB is initialized
// This is typically done in the app's root layout component
