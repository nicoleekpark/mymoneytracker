import { useDataRefreshStore } from '@/shared/store/data-refresh.store'

describe('data-refresh.store', () => {
  beforeEach(() => {
    // Reset store to initial state
    useDataRefreshStore.setState({
      transactionVersion: 0,
      assetVersion: 0,
      accountVersion: 0,
    })
  })

  describe('initial state', () => {
    it('starts with transactionVersion = 0', () => {
      expect(useDataRefreshStore.getState().transactionVersion).toBe(0)
    })

    it('starts with assetVersion = 0', () => {
      expect(useDataRefreshStore.getState().assetVersion).toBe(0)
    })

    it('starts with accountVersion = 0', () => {
      expect(useDataRefreshStore.getState().accountVersion).toBe(0)
    })
  })

  describe('invalidateTransactions', () => {
    it('increments transactionVersion', () => {
      useDataRefreshStore.getState().invalidateTransactions()

      expect(useDataRefreshStore.getState().transactionVersion).toBe(1)
    })

    it('increments transactionVersion multiple times', () => {
      useDataRefreshStore.getState().invalidateTransactions()
      useDataRefreshStore.getState().invalidateTransactions()
      useDataRefreshStore.getState().invalidateTransactions()

      expect(useDataRefreshStore.getState().transactionVersion).toBe(3)
    })

    it('does not affect assetVersion', () => {
      useDataRefreshStore.getState().invalidateTransactions()

      expect(useDataRefreshStore.getState().assetVersion).toBe(0)
    })
  })

  describe('invalidateAssets', () => {
    it('increments assetVersion', () => {
      useDataRefreshStore.getState().invalidateAssets()

      expect(useDataRefreshStore.getState().assetVersion).toBe(1)
    })

    it('increments assetVersion multiple times', () => {
      useDataRefreshStore.getState().invalidateAssets()
      useDataRefreshStore.getState().invalidateAssets()

      expect(useDataRefreshStore.getState().assetVersion).toBe(2)
    })

    it('does not affect transactionVersion', () => {
      useDataRefreshStore.getState().invalidateAssets()

      expect(useDataRefreshStore.getState().transactionVersion).toBe(0)
    })
  })

  describe('invalidateAccounts', () => {
    it('increments accountVersion', () => {
      useDataRefreshStore.getState().invalidateAccounts()

      expect(useDataRefreshStore.getState().accountVersion).toBe(1)
    })

    it('increments accountVersion multiple times', () => {
      useDataRefreshStore.getState().invalidateAccounts()
      useDataRefreshStore.getState().invalidateAccounts()

      expect(useDataRefreshStore.getState().accountVersion).toBe(2)
    })

    it('does not affect transactionVersion or assetVersion', () => {
      useDataRefreshStore.getState().invalidateAccounts()

      expect(useDataRefreshStore.getState().transactionVersion).toBe(0)
      expect(useDataRefreshStore.getState().assetVersion).toBe(0)
    })
  })

  describe('independent versioning', () => {
    it('versions are independent', () => {
      useDataRefreshStore.getState().invalidateTransactions()
      useDataRefreshStore.getState().invalidateTransactions()
      useDataRefreshStore.getState().invalidateAssets()
      useDataRefreshStore.getState().invalidateAccounts()

      expect(useDataRefreshStore.getState().transactionVersion).toBe(2)
      expect(useDataRefreshStore.getState().assetVersion).toBe(1)
      expect(useDataRefreshStore.getState().accountVersion).toBe(1)
    })
  })

  describe('account detail sync pattern', () => {
    /**
     * This test documents the pattern used for AccountDetailScreen sync:
     * 1. Subscribe to transactionVersion
     * 2. When account is updated, call invalidateTransactions()
     * 3. Components watching transactionVersion will re-render
     */
    it('invalidateTransactions can be used for account updates', () => {
      // Simulate account update pattern
      const initialVersion = useDataRefreshStore.getState().transactionVersion

      // After updateAccount(), we call invalidateTransactions()
      useDataRefreshStore.getState().invalidateTransactions()

      // Components subscribed to transactionVersion will see the change
      expect(useDataRefreshStore.getState().transactionVersion).toBe(initialVersion + 1)
    })
  })
})
