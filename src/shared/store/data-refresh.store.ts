/**
 * Data Refresh Store
 *
 * @persistence NONE - In-memory only, resets on app restart.
 * @scope SESSION - Used to trigger data refetch across components.
 *
 * Simple refresh trigger for cross-component data invalidation.
 * When a transaction is added/updated/deleted, increment the counter
 * and any subscribing component will re-fetch data.
 */

import { create } from 'zustand'

type DataRefreshState = {
  /** Increment to trigger dashboard data refresh */
  transactionVersion: number
  /** Call after adding/updating/deleting a transaction */
  invalidateTransactions: () => void
}

export const useDataRefreshStore = create<DataRefreshState>((set) => ({
  transactionVersion: 0,

  invalidateTransactions: () => {
    set((state) => ({ transactionVersion: state.transactionVersion + 1 }))
  },
}))
