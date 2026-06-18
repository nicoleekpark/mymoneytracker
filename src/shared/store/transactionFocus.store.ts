/**
 * Transaction Focus Store
 *
 * Manages the focusDate for transaction list auto-scroll.
 * Used to communicate scroll target between screens reliably.
 */

import { create } from 'zustand'

type TransactionFocusState = {
  focusDate: string | null
  focusId: number // Increments each time focusDate is set, to detect changes
  setFocusDate: (date: string) => void
  clearFocusDate: () => void
}

export const useTransactionFocusStore = create<TransactionFocusState>((set) => ({
  focusDate: null,
  focusId: 0,
  setFocusDate: (date) => set((state) => ({
    focusDate: date,
    focusId: state.focusId + 1
  })),
  clearFocusDate: () => set({ focusDate: null }),
}))
