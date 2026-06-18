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
  /** Increment to trigger account data refresh */
  accountVersion: number
  /** Increment to trigger settings-dependent data refresh (e.g., budget) */
  settingsVersion: number
  /** Call after adding/updating/deleting a transaction */
  invalidateTransactions: () => void
  /** Call after adding/updating/deleting an asset */
  invalidateAssets: () => void
  /** Call after adding/updating/deleting an account */
  invalidateAccounts: () => void
  /** Call after changing settings that affect data display */
  invalidateSettings: () => void
}

export const useDataRefreshStore = create<DataRefreshState>((set) => ({
  transactionVersion: 0,
  assetVersion: 0,
  accountVersion: 0,
  settingsVersion: 0,

  invalidateTransactions: () => {
    set((state) => ({ transactionVersion: state.transactionVersion + 1 }))
  },

  invalidateAssets: () => {
    set((state) => ({ assetVersion: state.assetVersion + 1 }))
  },

  invalidateAccounts: () => {
    set((state) => ({ accountVersion: state.accountVersion + 1 }))
  },

  invalidateSettings: () => {
    set((state) => ({ settingsVersion: state.settingsVersion + 1 }))
  },
}))
