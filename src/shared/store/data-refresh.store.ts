/**
 * Data Refresh Store
 *
 * @persistence NONE - In-memory only, resets on app restart.
 * @scope SESSION - Used to trigger data refetch across components.
 *
 * Simple refresh trigger for cross-component data invalidation.
 * When data is added/updated/deleted, increment the counter
 * and any subscribing component will re-fetch data.
 */

import { create } from 'zustand'

type DataRefreshState = {
  /** Increment to trigger transaction data refresh */
  transactionVersion: number
  /** Increment to trigger asset data refresh */
  assetVersion: number
  /** Call after adding/updating/deleting a transaction */
  invalidateTransactions: () => void
  /** Call after adding/updating/deleting an asset */
  invalidateAssets: () => void
}

export const useDataRefreshStore = create<DataRefreshState>((set) => ({
  transactionVersion: 0,
  assetVersion: 0,

  invalidateTransactions: () => {
    set((state) => ({ transactionVersion: state.transactionVersion + 1 }))
  },

  invalidateAssets: () => {
    set((state) => ({ assetVersion: state.assetVersion + 1 }))
  },
}))
