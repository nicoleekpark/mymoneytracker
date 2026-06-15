/**
 * Quick Chips Store
 *
 * @persistence SQLITE - Persisted to app_settings table via settingsStorage.
 * @scope PERMANENT - User's chip preferences survive app restarts.
 *
 * Stores user's preferred quick action chips for the Add Transaction screen.
 */

import { create } from 'zustand'

// Lazy import to avoid circular dependency / test issues
// eslint-disable-next-line @typescript-eslint/no-var-requires
const getStorage = () => require('@/infrastructure/db/settingsStorage') as typeof import('@/infrastructure/db/settingsStorage')

export type QuickChipConfig = {
  type: 'category' | 'payment' | 'special'
  key: string
  subCategoryKey?: string // For subcategory chips like "Food › Coffee"
}

// Special chip keys
export const SPECIAL_CHIP_KEYS = {
  REPEAT_LAST: 'repeat_last',
} as const

type PersistedChips = {
  expenseChips: QuickChipConfig[]
  incomeChips: QuickChipConfig[]
}

type QuickChipsState = PersistedChips & {
  // Hydration state
  _hydrated: boolean

  // Actions
  setExpenseChips: (chips: QuickChipConfig[]) => void
  setIncomeChips: (chips: QuickChipConfig[]) => void
  addChip: (type: 'expense' | 'income', chip: QuickChipConfig) => void
  removeChip: (type: 'expense' | 'income', chipKey: string, subCategoryKey?: string) => void
  moveChip: (type: 'expense' | 'income', fromIndex: number, toIndex: number) => void
  resetToDefaults: () => void
  _hydrate: () => void
}

// Default chips
const DEFAULT_EXPENSE_CHIPS: QuickChipConfig[] = [
  { type: 'category', key: 'food' },
  { type: 'category', key: 'transport' },
  { type: 'category', key: 'lifestyle' },
  { type: 'category', key: 'subscriptions' },
  { type: 'category', key: 'health' },
  { type: 'category', key: 'social' },
]

const DEFAULT_INCOME_CHIPS: QuickChipConfig[] = [
  { type: 'category', key: 'income' },
]

function persistChips(state: PersistedChips): void {
  try {
    const { setStoredValue, STORAGE_KEYS } = getStorage()
    setStoredValue(STORAGE_KEYS.QUICK_CHIPS, state)
  } catch {
    // Storage not available (tests, etc.)
  }
}

export const useQuickChipsStore = create<QuickChipsState>((set, get) => ({
  expenseChips: DEFAULT_EXPENSE_CHIPS,
  incomeChips: DEFAULT_INCOME_CHIPS,
  _hydrated: false,

  setExpenseChips: (chips) => {
    set({ expenseChips: chips })
    persistChips({ expenseChips: chips, incomeChips: get().incomeChips })
  },

  setIncomeChips: (chips) => {
    set({ incomeChips: chips })
    persistChips({ expenseChips: get().expenseChips, incomeChips: chips })
  },

  addChip: (type, chip) => {
    const key = type === 'expense' ? 'expenseChips' : 'incomeChips'
    const current = get()[key]
    // Don't add duplicates (check subcategory too)
    if (current.some(c => c.key === chip.key && c.type === chip.type && c.subCategoryKey === chip.subCategoryKey)) return
    const newChips = [...current, chip]
    set({ [key]: newChips })
    persistChips({ expenseChips: get().expenseChips, incomeChips: get().incomeChips })
  },

  removeChip: (type, chipKey, subCategoryKey) => {
    const key = type === 'expense' ? 'expenseChips' : 'incomeChips'
    const current = get()[key]
    const newChips = current.filter(c => !(c.key === chipKey && c.subCategoryKey === subCategoryKey))
    set({ [key]: newChips })
    persistChips({ expenseChips: get().expenseChips, incomeChips: get().incomeChips })
  },

  moveChip: (type, fromIndex, toIndex) => {
    const key = type === 'expense' ? 'expenseChips' : 'incomeChips'
    const current = [...get()[key]]
    const [item] = current.splice(fromIndex, 1)
    current.splice(toIndex, 0, item)
    set({ [key]: current })
    persistChips({ expenseChips: get().expenseChips, incomeChips: get().incomeChips })
  },

  resetToDefaults: () => {
    set({
      expenseChips: DEFAULT_EXPENSE_CHIPS,
      incomeChips: DEFAULT_INCOME_CHIPS,
    })
    persistChips({ expenseChips: DEFAULT_EXPENSE_CHIPS, incomeChips: DEFAULT_INCOME_CHIPS })
  },

  _hydrate: () => {
    if (get()._hydrated) return
    try {
      const { getStoredValue, STORAGE_KEYS } = getStorage()
      const stored = getStoredValue<PersistedChips>(STORAGE_KEYS.QUICK_CHIPS)
      if (stored) {
        set({
          expenseChips: stored.expenseChips ?? DEFAULT_EXPENSE_CHIPS,
          incomeChips: stored.incomeChips ?? DEFAULT_INCOME_CHIPS,
          _hydrated: true,
        })
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
