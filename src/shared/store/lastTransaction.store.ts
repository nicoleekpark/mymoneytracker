/**
 * Last Transaction Store
 *
 * Stores the last saved transaction for "Repeat Last" functionality.
 */

import { create } from 'zustand'
import type { TransactionType } from '@/core/domain/transaction'

export type LastTransactionData = {
  type: TransactionType
  amountCents: number
  amountDisplay: string
  description?: string
  categoryKey?: string
  subCategoryKey?: string
  accountKey?: string
  savedAt: string // ISO date string
}

type LastTransactionState = {
  lastTransaction: LastTransactionData | null

  // Actions
  setLastTransaction: (data: LastTransactionData) => void
  clearLastTransaction: () => void
}

export const useLastTransactionStore = create<LastTransactionState>((set) => ({
  lastTransaction: null,

  setLastTransaction: (data) => set({ lastTransaction: data }),

  clearLastTransaction: () => set({ lastTransaction: null }),
}))
