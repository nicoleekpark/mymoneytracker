/**
 * Payment Chips Order Store
 *
 * @persistence SQLITE - Persisted to app_settings table via settingsStorage.
 * @scope PERMANENT - User's chip order survives app restarts.
 *
 * Stores the order of payment method chips for the Add Transaction screen.
 * Only stores the order (list of account keys), not the chips themselves.
 */

import { create } from 'zustand'

// Lazy import to avoid circular dependency / test issues
// eslint-disable-next-line @typescript-eslint/no-var-requires
const getStorage = () => require('@/infrastructure/db/settingsStorage') as typeof import('@/infrastructure/db/settingsStorage')

const STORAGE_KEY = 'payment_chips_order'

type PaymentChipsOrderState = {
  // Ordered list of account keys (null means use default order from accounts list)
  orderedKeys: string[] | null
  _hydrated: boolean

  // Actions
  setOrder: (keys: string[]) => void
  /** @deprecated Use moveChipInOrder instead */
  moveChip: (fromIndex: number, toIndex: number, allKeys: string[]) => void
  /** Move chip within the current ordered list (requires orderedKeys to be set) */
  moveChipInOrder: (fromIndex: number, toIndex: number) => void
  resetOrder: () => void
  _hydrate: () => void
}

function persistOrder(orderedKeys: string[] | null): void {
  try {
    const { setStoredValue } = getStorage()
    setStoredValue(STORAGE_KEY, { orderedKeys })
  } catch {
    // Storage not available (tests, etc.)
  }
}

export const usePaymentChipsOrderStore = create<PaymentChipsOrderState>((set, get) => ({
  orderedKeys: null,
  _hydrated: false,

  setOrder: (keys) => {
    set({ orderedKeys: keys })
    persistOrder(keys)
  },

  moveChip: (fromIndex, toIndex, allKeys) => {
    // If no custom order yet, use the provided allKeys as base
    const current = get().orderedKeys ?? [...allKeys]
    const newOrder = [...current]
    const [item] = newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, item)
    set({ orderedKeys: newOrder })
    persistOrder(newOrder)
  },

  moveChipInOrder: (fromIndex, toIndex) => {
    const current = get().orderedKeys
    if (!current) return // Can't move if no order set yet
    const newOrder = [...current]
    const [item] = newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, item)
    set({ orderedKeys: newOrder })
    persistOrder(newOrder)
  },

  resetOrder: () => {
    set({ orderedKeys: null })
    persistOrder(null)
  },

  _hydrate: () => {
    if (get()._hydrated) return
    try {
      const { getStoredValue } = getStorage()
      const stored = getStoredValue<{ orderedKeys: string[] | null }>(STORAGE_KEY)
      if (stored) {
        set({ orderedKeys: stored.orderedKeys, _hydrated: true })
      } else {
        set({ _hydrated: true })
      }
    } catch {
      set({ _hydrated: true })
    }
  },
}))

/**
 * Helper to get ordered accounts based on stored order
 */
export function getOrderedAccounts<T extends { key: string }>(
  accounts: T[],
  orderedKeys: string[] | null
): T[] {
  if (!orderedKeys || orderedKeys.length === 0) {
    return accounts
  }

  // Create a map for quick lookup
  const accountMap = new Map(accounts.map(a => [a.key, a]))

  // Build ordered list from stored order
  const ordered: T[] = []
  for (const key of orderedKeys) {
    const account = accountMap.get(key)
    if (account) {
      ordered.push(account)
      accountMap.delete(key)
    }
  }

  // Append any new accounts not in the stored order
  for (const account of accountMap.values()) {
    ordered.push(account)
  }

  return ordered
}
