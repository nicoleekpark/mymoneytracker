import {
  getFieldSortOrder,
  getCategorySortOrder,
  getCategoryMeta,
  getCategoriesForField,
  isLiquidifiableCategory,
  isLiquidifiable,
  createEmptySummary,
  getLiquidityHealth,
  formatLiquidityMonths,
  ASSET_CATEGORIES,
  ASSET_FIELD_NAMES,
  LIQUIDITY_THRESHOLDS,
} from '@/core/domain/asset/asset.model'
import type { AssetItem } from '@/core/domain/asset/asset.types'

const mockCashSavingsItem: AssetItem = {
  id: 'item-1',
  field: 'current_assets',
  category: 'cash_savings',
  name: 'Emergency Fund',
  memberId: null,
  isLiquidifiable: true,
  sortOrder: 0,
  isArchived: false,
}

const mockKidsItem: AssetItem = {
  ...mockCashSavingsItem,
  id: 'item-2',
  category: 'kids',
  name: 'College Fund',
  isLiquidifiable: false,
}

const mockRealEstateItem: AssetItem = {
  ...mockCashSavingsItem,
  id: 'item-3',
  field: 'fixed_assets',
  category: 'real_estate',
  name: 'House',
  isLiquidifiable: false,
}

describe('asset.model', () => {
  describe('ASSET_CATEGORIES', () => {
    it('contains all expected categories', () => {
      expect(ASSET_CATEGORIES).toHaveLength(8)
      expect(ASSET_CATEGORIES.map(c => c.category)).toEqual([
        'real_estate', 'retirement_funds', 'cash_savings', 'investments',
        'kids', 'credit_card', 'loans', 'other'
      ])
    })
  })

  describe('ASSET_FIELD_NAMES', () => {
    it('contains display names for all fields', () => {
      expect(ASSET_FIELD_NAMES.fixed_assets).toBe('Fixed Assets')
      expect(ASSET_FIELD_NAMES.current_assets).toBe('Current Assets')
      expect(ASSET_FIELD_NAMES.liabilities).toBe('Liabilities')
    })
  })

  describe('getFieldSortOrder', () => {
    it('orders fields correctly', () => {
      expect(getFieldSortOrder('fixed_assets')).toBe(0)
      expect(getFieldSortOrder('current_assets')).toBe(1)
      expect(getFieldSortOrder('liabilities')).toBe(2)
    })

    it('returns high value for unknown field', () => {
      // @ts-expect-error testing invalid input
      expect(getFieldSortOrder('unknown')).toBe(9)
    })
  })

  describe('getCategorySortOrder', () => {
    it('returns index-based sort order', () => {
      expect(getCategorySortOrder('real_estate')).toBe(0)
      expect(getCategorySortOrder('retirement_funds')).toBe(1)
      expect(getCategorySortOrder('cash_savings')).toBe(2)
    })

    it('returns 99 for unknown category', () => {
      // @ts-expect-error testing invalid input
      expect(getCategorySortOrder('unknown')).toBe(99)
    })
  })

  describe('getCategoryMeta', () => {
    it('returns metadata for valid category', () => {
      const meta = getCategoryMeta('cash_savings')
      expect(meta).toBeDefined()
      expect(meta?.name).toBe('Cash & Savings')
      expect(meta?.field).toBe('current_assets')
      expect(meta?.isLiquidifiable).toBe(true)
    })

    it('returns undefined for invalid category', () => {
      // @ts-expect-error testing invalid input
      expect(getCategoryMeta('unknown')).toBeUndefined()
    })
  })

  describe('getCategoriesForField', () => {
    it('returns categories for fixed_assets', () => {
      const categories = getCategoriesForField('fixed_assets')
      expect(categories).toHaveLength(2)
      expect(categories.map(c => c.category)).toEqual(['real_estate', 'retirement_funds'])
    })

    it('returns categories for current_assets', () => {
      const categories = getCategoriesForField('current_assets')
      expect(categories).toHaveLength(3)
      expect(categories.map(c => c.category)).toEqual(['cash_savings', 'investments', 'kids'])
    })

    it('returns categories for liabilities', () => {
      const categories = getCategoriesForField('liabilities')
      expect(categories).toHaveLength(3)
      expect(categories.map(c => c.category)).toEqual(['credit_card', 'loans', 'other'])
    })
  })

  describe('isLiquidifiableCategory', () => {
    it('returns true for liquidifiable categories', () => {
      expect(isLiquidifiableCategory('cash_savings')).toBe(true)
      expect(isLiquidifiableCategory('investments')).toBe(true)
    })

    it('returns false for non-liquidifiable categories', () => {
      expect(isLiquidifiableCategory('real_estate')).toBe(false)
      expect(isLiquidifiableCategory('retirement_funds')).toBe(false)
      expect(isLiquidifiableCategory('kids')).toBe(false)
      expect(isLiquidifiableCategory('credit_card')).toBe(false)
    })
  })

  describe('isLiquidifiable', () => {
    it('returns true for liquidifiable items', () => {
      expect(isLiquidifiable(mockCashSavingsItem)).toBe(true)
    })

    it('returns false for kids category (even if in liquidifiable list)', () => {
      expect(isLiquidifiable(mockKidsItem)).toBe(false)
    })

    it('returns false for non-liquidifiable categories', () => {
      expect(isLiquidifiable(mockRealEstateItem)).toBe(false)
    })
  })

  describe('createEmptySummary', () => {
    it('returns zeroed summary', () => {
      const summary = createEmptySummary()
      expect(summary.totalAssets).toBe(0)
      expect(summary.totalLiabilities).toBe(0)
      expect(summary.netWorth).toBe(0)
      expect(summary.liquidifiableAmount).toBe(0)
    })

    it('has zeroed field totals', () => {
      const summary = createEmptySummary()
      expect(summary.byField.fixed_assets).toBe(0)
      expect(summary.byField.current_assets).toBe(0)
      expect(summary.byField.liabilities).toBe(0)
    })

    it('has zeroed category totals', () => {
      const summary = createEmptySummary()
      expect(Object.values(summary.byCategory).every(v => v === 0)).toBe(true)
    })
  })

  describe('LIQUIDITY_THRESHOLDS', () => {
    it('has expected thresholds', () => {
      expect(LIQUIDITY_THRESHOLDS.excellent).toBe(12)
      expect(LIQUIDITY_THRESHOLDS.good).toBe(6)
      expect(LIQUIDITY_THRESHOLDS.warning).toBe(3)
    })
  })

  describe('getLiquidityHealth', () => {
    it('returns excellent for 12+ months runway', () => {
      expect(getLiquidityHealth(12000, 1000)).toBe('excellent')
      expect(getLiquidityHealth(24000, 1000)).toBe('excellent')
    })

    it('returns good for 6-12 months runway', () => {
      expect(getLiquidityHealth(6000, 1000)).toBe('good')
      expect(getLiquidityHealth(11000, 1000)).toBe('good')
    })

    it('returns warning for 3-6 months runway', () => {
      expect(getLiquidityHealth(3000, 1000)).toBe('warning')
      expect(getLiquidityHealth(5000, 1000)).toBe('warning')
    })

    it('returns critical for < 3 months runway', () => {
      expect(getLiquidityHealth(2000, 1000)).toBe('critical')
      expect(getLiquidityHealth(0, 1000)).toBe('critical')
    })

    it('returns excellent when no expenses', () => {
      expect(getLiquidityHealth(1000, 0)).toBe('excellent')
      expect(getLiquidityHealth(1000, -100)).toBe('excellent')
    })
  })

  describe('formatLiquidityMonths', () => {
    it('formats 12+ months', () => {
      expect(formatLiquidityMonths(12000, 1000)).toBe('12+ mo')
      expect(formatLiquidityMonths(24000, 1000)).toBe('12+ mo')
    })

    it('formats 1-11 months', () => {
      expect(formatLiquidityMonths(6000, 1000)).toBe('6 mo')
      expect(formatLiquidityMonths(1500, 1000)).toBe('1 mo')
    })

    it('formats less than 1 month', () => {
      expect(formatLiquidityMonths(500, 1000)).toBe('< 1 mo')
      expect(formatLiquidityMonths(0, 1000)).toBe('< 1 mo')
    })

    it('returns infinity symbol when no expenses', () => {
      expect(formatLiquidityMonths(1000, 0)).toBe('∞')
      expect(formatLiquidityMonths(1000, -100)).toBe('∞')
    })
  })
})
