/**
 * Settings Store
 *
 * Manages app settings including notification preferences.
 * Phase 1: Budget alert threshold (in-memory, no persistence)
 */

import { create } from 'zustand'

type SettingsState = {
  // Budget alert settings
  budgetAlertEnabled: boolean
  budgetAlertThreshold: number // Percentage (0-100), default 80%
  monthlyBudget: number // In cents, 0 = not set

  // Actions
  setBudgetAlertEnabled: (enabled: boolean) => void
  setBudgetAlertThreshold: (threshold: number) => void
  setMonthlyBudget: (amountCents: number) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  budgetAlertEnabled: true,
  budgetAlertThreshold: 80,
  monthlyBudget: 0,

  setBudgetAlertEnabled: (enabled) => set({ budgetAlertEnabled: enabled }),
  setBudgetAlertThreshold: (threshold) => set({ budgetAlertThreshold: Math.max(0, Math.min(100, threshold)) }),
  setMonthlyBudget: (amountCents) => set({ monthlyBudget: Math.max(0, amountCents) }),
}))
