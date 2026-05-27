import { useSettingsStore } from '@/shared/store/settings.store'

// Mock the lazy-loaded storage module
const mockGetStoredValue = jest.fn()
const mockSetStoredValue = jest.fn()

jest.mock('@/infrastructure/db/settingsStorage', () => ({
  getStoredValue: (...args: unknown[]) => mockGetStoredValue(...args),
  setStoredValue: (...args: unknown[]) => mockSetStoredValue(...args),
  STORAGE_KEYS: {
    SETTINGS: 'app_settings',
  },
}))

describe('settings.store', () => {
  const DEFAULT_STATE = {
    budgetAlertEnabled: true,
    budgetAlertThreshold: 80,
    monthlyBudget: 0,
    _hydrated: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset store to default state
    useSettingsStore.setState({
      ...DEFAULT_STATE,
    })
  })

  describe('default values', () => {
    it('has correct default budgetAlertEnabled', () => {
      expect(useSettingsStore.getState().budgetAlertEnabled).toBe(true)
    })

    it('has correct default budgetAlertThreshold', () => {
      expect(useSettingsStore.getState().budgetAlertThreshold).toBe(80)
    })

    it('has correct default monthlyBudget', () => {
      expect(useSettingsStore.getState().monthlyBudget).toBe(0)
    })

    it('starts not hydrated', () => {
      expect(useSettingsStore.getState()._hydrated).toBe(false)
    })
  })

  describe('setBudgetAlertEnabled', () => {
    it('sets budgetAlertEnabled to true', () => {
      useSettingsStore.getState().setBudgetAlertEnabled(false)
      useSettingsStore.getState().setBudgetAlertEnabled(true)

      expect(useSettingsStore.getState().budgetAlertEnabled).toBe(true)
    })

    it('sets budgetAlertEnabled to false', () => {
      useSettingsStore.getState().setBudgetAlertEnabled(false)

      expect(useSettingsStore.getState().budgetAlertEnabled).toBe(false)
    })

    it('persists to storage', () => {
      useSettingsStore.getState().setBudgetAlertEnabled(false)

      expect(mockSetStoredValue).toHaveBeenCalledWith(
        'app_settings',
        expect.objectContaining({ budgetAlertEnabled: false })
      )
    })

    it('includes all settings in persisted value', () => {
      useSettingsStore.setState({ monthlyBudget: 500000, budgetAlertThreshold: 90 })

      useSettingsStore.getState().setBudgetAlertEnabled(false)

      expect(mockSetStoredValue).toHaveBeenCalledWith('app_settings', {
        budgetAlertEnabled: false,
        budgetAlertThreshold: 90,
        monthlyBudget: 500000,
      })
    })
  })

  describe('setBudgetAlertThreshold', () => {
    it('sets threshold to valid value', () => {
      useSettingsStore.getState().setBudgetAlertThreshold(50)

      expect(useSettingsStore.getState().budgetAlertThreshold).toBe(50)
    })

    it('clamps threshold to minimum 0', () => {
      useSettingsStore.getState().setBudgetAlertThreshold(-10)

      expect(useSettingsStore.getState().budgetAlertThreshold).toBe(0)
    })

    it('clamps threshold to maximum 100', () => {
      useSettingsStore.getState().setBudgetAlertThreshold(150)

      expect(useSettingsStore.getState().budgetAlertThreshold).toBe(100)
    })

    it('allows boundary value 0', () => {
      useSettingsStore.getState().setBudgetAlertThreshold(0)

      expect(useSettingsStore.getState().budgetAlertThreshold).toBe(0)
    })

    it('allows boundary value 100', () => {
      useSettingsStore.getState().setBudgetAlertThreshold(100)

      expect(useSettingsStore.getState().budgetAlertThreshold).toBe(100)
    })

    it('persists to storage', () => {
      useSettingsStore.getState().setBudgetAlertThreshold(75)

      expect(mockSetStoredValue).toHaveBeenCalledWith(
        'app_settings',
        expect.objectContaining({ budgetAlertThreshold: 75 })
      )
    })

    it('persists clamped value', () => {
      useSettingsStore.getState().setBudgetAlertThreshold(-50)

      expect(mockSetStoredValue).toHaveBeenCalledWith(
        'app_settings',
        expect.objectContaining({ budgetAlertThreshold: 0 })
      )
    })
  })

  describe('setMonthlyBudget', () => {
    it('sets monthly budget to valid value', () => {
      useSettingsStore.getState().setMonthlyBudget(500000) // $5000

      expect(useSettingsStore.getState().monthlyBudget).toBe(500000)
    })

    it('clamps negative values to 0', () => {
      useSettingsStore.getState().setMonthlyBudget(-100)

      expect(useSettingsStore.getState().monthlyBudget).toBe(0)
    })

    it('allows 0 value', () => {
      useSettingsStore.setState({ monthlyBudget: 500000 })

      useSettingsStore.getState().setMonthlyBudget(0)

      expect(useSettingsStore.getState().monthlyBudget).toBe(0)
    })

    it('allows large values', () => {
      useSettingsStore.getState().setMonthlyBudget(10000000) // $100,000

      expect(useSettingsStore.getState().monthlyBudget).toBe(10000000)
    })

    it('persists to storage', () => {
      useSettingsStore.getState().setMonthlyBudget(300000)

      expect(mockSetStoredValue).toHaveBeenCalledWith(
        'app_settings',
        expect.objectContaining({ monthlyBudget: 300000 })
      )
    })
  })

  describe('_hydrate', () => {
    it('loads settings from storage', () => {
      mockGetStoredValue.mockReturnValue({
        budgetAlertEnabled: false,
        budgetAlertThreshold: 50,
        monthlyBudget: 1000000,
      })

      useSettingsStore.getState()._hydrate()

      expect(useSettingsStore.getState().budgetAlertEnabled).toBe(false)
      expect(useSettingsStore.getState().budgetAlertThreshold).toBe(50)
      expect(useSettingsStore.getState().monthlyBudget).toBe(1000000)
    })

    it('sets _hydrated to true after loading', () => {
      mockGetStoredValue.mockReturnValue(null)

      useSettingsStore.getState()._hydrate()

      expect(useSettingsStore.getState()._hydrated).toBe(true)
    })

    it('does nothing if already hydrated', () => {
      useSettingsStore.setState({ _hydrated: true })
      mockGetStoredValue.mockReturnValue({
        budgetAlertEnabled: false,
        budgetAlertThreshold: 50,
        monthlyBudget: 1000000,
      })

      useSettingsStore.getState()._hydrate()

      // Should keep default values since hydration was skipped
      expect(useSettingsStore.getState().budgetAlertEnabled).toBe(true)
      expect(mockGetStoredValue).not.toHaveBeenCalled()
    })

    it('uses defaults when no stored value exists', () => {
      mockGetStoredValue.mockReturnValue(null)

      useSettingsStore.getState()._hydrate()

      expect(useSettingsStore.getState().budgetAlertEnabled).toBe(true)
      expect(useSettingsStore.getState().budgetAlertThreshold).toBe(80)
      expect(useSettingsStore.getState().monthlyBudget).toBe(0)
      expect(useSettingsStore.getState()._hydrated).toBe(true)
    })

    it('handles storage errors gracefully', () => {
      mockGetStoredValue.mockImplementation(() => {
        throw new Error('Storage error')
      })

      // Should not throw
      expect(() => useSettingsStore.getState()._hydrate()).not.toThrow()

      // Should set hydrated to true even on error
      expect(useSettingsStore.getState()._hydrated).toBe(true)
    })

    it('uses correct storage key', () => {
      mockGetStoredValue.mockReturnValue(null)

      useSettingsStore.getState()._hydrate()

      expect(mockGetStoredValue).toHaveBeenCalledWith('app_settings')
    })
  })

  describe('persistence integration', () => {
    it('persists all changes independently', () => {
      useSettingsStore.getState().setBudgetAlertEnabled(false)
      mockSetStoredValue.mockClear()

      useSettingsStore.getState().setBudgetAlertThreshold(60)
      mockSetStoredValue.mockClear()

      useSettingsStore.getState().setMonthlyBudget(800000)

      // Last call should include all current values
      expect(mockSetStoredValue).toHaveBeenCalledWith('app_settings', {
        budgetAlertEnabled: false,
        budgetAlertThreshold: 60,
        monthlyBudget: 800000,
      })
    })
  })
})
