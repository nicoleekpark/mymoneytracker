import { usePaymentChipsOrderStore, getOrderedAccounts } from '@/shared/store/paymentChipsOrder.store'

// Mock the lazy-loaded storage module
const mockGetStoredValue = jest.fn()
const mockSetStoredValue = jest.fn()

jest.mock('@/infrastructure/db/settingsStorage', () => ({
  getStoredValue: (...args: unknown[]) => mockGetStoredValue(...args),
  setStoredValue: (...args: unknown[]) => mockSetStoredValue(...args),
}))

describe('paymentChipsOrder.store', () => {
  const DEFAULT_STATE = {
    orderedKeys: null,
    _hydrated: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset store to default state
    usePaymentChipsOrderStore.setState({
      ...DEFAULT_STATE,
    })
  })

  describe('default values', () => {
    it('has null orderedKeys by default', () => {
      expect(usePaymentChipsOrderStore.getState().orderedKeys).toBeNull()
    })

    it('starts not hydrated', () => {
      expect(usePaymentChipsOrderStore.getState()._hydrated).toBe(false)
    })
  })

  describe('setOrder', () => {
    it('sets orderedKeys', () => {
      usePaymentChipsOrderStore.getState().setOrder(['checking', 'savings', 'credit'])

      expect(usePaymentChipsOrderStore.getState().orderedKeys).toEqual(['checking', 'savings', 'credit'])
    })

    it('persists to storage', () => {
      usePaymentChipsOrderStore.getState().setOrder(['checking', 'savings'])

      expect(mockSetStoredValue).toHaveBeenCalledWith(
        'payment_chips_order',
        { orderedKeys: ['checking', 'savings'] }
      )
    })
  })

  describe('moveChip', () => {
    it('reorders chips and persists', () => {
      const allKeys = ['checking', 'savings', 'credit']

      // Move 'savings' (index 1) to first position (index 0)
      usePaymentChipsOrderStore.getState().moveChip(1, 0, allKeys)

      expect(usePaymentChipsOrderStore.getState().orderedKeys).toEqual(['savings', 'checking', 'credit'])
      expect(mockSetStoredValue).toHaveBeenCalledWith(
        'payment_chips_order',
        { orderedKeys: ['savings', 'checking', 'credit'] }
      )
    })

    it('uses existing order when moving', () => {
      usePaymentChipsOrderStore.setState({ orderedKeys: ['credit', 'checking', 'savings'] })

      // Move 'savings' (index 2) to first position (index 0)
      usePaymentChipsOrderStore.getState().moveChip(2, 0, ['checking', 'savings', 'credit'])

      expect(usePaymentChipsOrderStore.getState().orderedKeys).toEqual(['savings', 'credit', 'checking'])
    })
  })

  describe('resetOrder', () => {
    it('resets orderedKeys to null', () => {
      usePaymentChipsOrderStore.setState({ orderedKeys: ['a', 'b', 'c'] })

      usePaymentChipsOrderStore.getState().resetOrder()

      expect(usePaymentChipsOrderStore.getState().orderedKeys).toBeNull()
    })

    it('persists null to storage', () => {
      usePaymentChipsOrderStore.getState().resetOrder()

      expect(mockSetStoredValue).toHaveBeenCalledWith(
        'payment_chips_order',
        { orderedKeys: null }
      )
    })
  })

  describe('_hydrate', () => {
    it('loads order from storage', () => {
      mockGetStoredValue.mockReturnValue({
        orderedKeys: ['savings', 'checking', 'credit'],
      })

      usePaymentChipsOrderStore.getState()._hydrate()

      expect(usePaymentChipsOrderStore.getState().orderedKeys).toEqual(['savings', 'checking', 'credit'])
    })

    it('sets _hydrated to true after loading', () => {
      mockGetStoredValue.mockReturnValue(null)

      usePaymentChipsOrderStore.getState()._hydrate()

      expect(usePaymentChipsOrderStore.getState()._hydrated).toBe(true)
    })

    it('does nothing if already hydrated', () => {
      usePaymentChipsOrderStore.setState({ _hydrated: true })
      mockGetStoredValue.mockReturnValue({
        orderedKeys: ['a', 'b', 'c'],
      })

      usePaymentChipsOrderStore.getState()._hydrate()

      // Should keep default values since hydration was skipped
      expect(usePaymentChipsOrderStore.getState().orderedKeys).toBeNull()
      expect(mockGetStoredValue).not.toHaveBeenCalled()
    })

    it('handles storage errors gracefully', () => {
      mockGetStoredValue.mockImplementation(() => {
        throw new Error('Storage error')
      })

      // Should not throw
      expect(() => usePaymentChipsOrderStore.getState()._hydrate()).not.toThrow()

      // Should set hydrated to true even on error
      expect(usePaymentChipsOrderStore.getState()._hydrated).toBe(true)
    })

    it('uses correct storage key', () => {
      mockGetStoredValue.mockReturnValue(null)

      usePaymentChipsOrderStore.getState()._hydrate()

      expect(mockGetStoredValue).toHaveBeenCalledWith('payment_chips_order')
    })
  })

  describe('getOrderedAccounts helper', () => {
    const accounts = [
      { key: 'checking', name: 'Checking' },
      { key: 'savings', name: 'Savings' },
      { key: 'credit', name: 'Credit Card' },
    ]

    it('returns accounts in original order when orderedKeys is null', () => {
      const result = getOrderedAccounts(accounts, null)

      expect(result).toEqual(accounts)
    })

    it('returns accounts in original order when orderedKeys is empty', () => {
      const result = getOrderedAccounts(accounts, [])

      expect(result).toEqual(accounts)
    })

    it('reorders accounts according to orderedKeys', () => {
      const result = getOrderedAccounts(accounts, ['credit', 'checking', 'savings'])

      expect(result.map(a => a.key)).toEqual(['credit', 'checking', 'savings'])
    })

    it('appends new accounts not in orderedKeys', () => {
      const result = getOrderedAccounts(accounts, ['savings', 'checking'])

      expect(result.map(a => a.key)).toEqual(['savings', 'checking', 'credit'])
    })

    it('ignores missing keys in orderedKeys', () => {
      const result = getOrderedAccounts(accounts, ['deleted', 'savings', 'checking'])

      expect(result.map(a => a.key)).toEqual(['savings', 'checking', 'credit'])
    })
  })

  describe('persistence survives app restart', () => {
    it('order set before hydration is persisted and restored', () => {
      // Simulate: user sets order
      usePaymentChipsOrderStore.getState().setOrder(['credit', 'savings', 'checking'])

      // Verify it was persisted
      expect(mockSetStoredValue).toHaveBeenCalledWith(
        'payment_chips_order',
        { orderedKeys: ['credit', 'savings', 'checking'] }
      )

      // Simulate: app restart (reset store state)
      usePaymentChipsOrderStore.setState({ orderedKeys: null, _hydrated: false })

      // Simulate: storage returns previously saved value
      mockGetStoredValue.mockReturnValue({
        orderedKeys: ['credit', 'savings', 'checking'],
      })

      // Simulate: hydration on app start
      usePaymentChipsOrderStore.getState()._hydrate()

      // Verify the order was restored
      expect(usePaymentChipsOrderStore.getState().orderedKeys).toEqual(['credit', 'savings', 'checking'])
    })
  })
})
