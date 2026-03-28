/**
 * Quick Chips Store
 *
 * Stores user's preferred quick action chips for the Add Transaction screen.
 * TODO: Add SQLite persistence if needed.
 */

import { create } from 'zustand'

export type QuickChipConfig = {
  type: 'category' | 'payment' | 'special'
  key: string
  subCategoryKey?: string // For subcategory chips like "Food › Coffee"
}

// Special chip keys
export const SPECIAL_CHIP_KEYS = {
  REPEAT_LAST: 'repeat_last',
} as const

type QuickChipsState = {
  // Expense chips (category keys + payment keys)
  expenseChips: QuickChipConfig[]
  // Income chips
  incomeChips: QuickChipConfig[]

  // Actions
  setExpenseChips: (chips: QuickChipConfig[]) => void
  setIncomeChips: (chips: QuickChipConfig[]) => void
  addChip: (type: 'expense' | 'income', chip: QuickChipConfig) => void
  removeChip: (type: 'expense' | 'income', chipKey: string, subCategoryKey?: string) => void
  moveChip: (type: 'expense' | 'income', fromIndex: number, toIndex: number) => void
  resetToDefaults: () => void
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

export const useQuickChipsStore = create<QuickChipsState>((set, get) => ({
  expenseChips: DEFAULT_EXPENSE_CHIPS,
  incomeChips: DEFAULT_INCOME_CHIPS,

  setExpenseChips: (chips) => set({ expenseChips: chips }),
  setIncomeChips: (chips) => set({ incomeChips: chips }),

  addChip: (type, chip) => {
    const key = type === 'expense' ? 'expenseChips' : 'incomeChips'
    const current = get()[key]
    // Don't add duplicates (check subcategory too)
    if (current.some(c => c.key === chip.key && c.type === chip.type && c.subCategoryKey === chip.subCategoryKey)) return
    set({ [key]: [...current, chip] })
  },

  removeChip: (type, chipKey, subCategoryKey) => {
    const key = type === 'expense' ? 'expenseChips' : 'incomeChips'
    const current = get()[key]
    set({ [key]: current.filter(c => !(c.key === chipKey && c.subCategoryKey === subCategoryKey)) })
  },

  moveChip: (type, fromIndex, toIndex) => {
    const key = type === 'expense' ? 'expenseChips' : 'incomeChips'
    const current = [...get()[key]]
    const [item] = current.splice(fromIndex, 1)
    current.splice(toIndex, 0, item)
    set({ [key]: current })
  },

  resetToDefaults: () => set({
    expenseChips: DEFAULT_EXPENSE_CHIPS,
    incomeChips: DEFAULT_INCOME_CHIPS,
  }),
}))
