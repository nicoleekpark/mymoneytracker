/**
 * Payment Frequency Store
 *
 * Tracks payment method usage frequency for auto-selecting the most-used method.
 */

import { create } from 'zustand'

type PaymentFrequencyState = {
  // Map of account key -> usage count
  usageCounts: Record<string, number>
  // List of recently used account keys (most recent first)
  recentKeys: string[]

  // Actions
  recordUsage: (accountKey: string) => void
  getMostUsed: () => string | null
  getFrequentKeys: (limit?: number) => string[]
  getRecentKeys: (limit?: number) => string[]
  reset: () => void
}

const MAX_RECENT = 10

export const usePaymentFrequencyStore = create<PaymentFrequencyState>((set, get) => ({
  usageCounts: {},
  recentKeys: [],

  recordUsage: (accountKey) => {
    const { usageCounts, recentKeys } = get()
    // Update frequency count
    const newCounts = {
      ...usageCounts,
      [accountKey]: (usageCounts[accountKey] || 0) + 1,
    }
    // Update recent list (most recent first, remove duplicates)
    const newRecent = [accountKey, ...recentKeys.filter(k => k !== accountKey)].slice(0, MAX_RECENT)
    set({
      usageCounts: newCounts,
      recentKeys: newRecent,
    })
  },

  getMostUsed: () => {
    const counts = get().usageCounts
    const entries = Object.entries(counts)
    if (entries.length === 0) return null

    // Sort by count descending and return the key with highest count
    entries.sort((a, b) => b[1] - a[1])
    return entries[0][0]
  },

  getFrequentKeys: (limit = 3) => {
    const counts = get().usageCounts
    const entries = Object.entries(counts)
    if (entries.length === 0) return []

    // Sort by count descending
    entries.sort((a, b) => b[1] - a[1])
    return entries.slice(0, limit).map(([key]) => key)
  },

  getRecentKeys: (limit = 3) => {
    return get().recentKeys.slice(0, limit)
  },

  reset: () => set({ usageCounts: {}, recentKeys: [] }),
}))
