import {
  getCurrentYearMonth,
  getFamilyMembers,
  getAssetItems,
  getAssetItemsGrouped,
  getSummary,
  getGoalProgress,
  suggestAnnualGoal,
} from '@/core/services/asset'
import type { FamilyMember, AssetItem, AssetSummary, AssetGoal, AssetField, AssetCategory } from '@/core/domain/asset'

// Mock the repository module
jest.mock('@/infrastructure/repositories', () => ({
  assetRepository: {
    getFamilyMembers: jest.fn(),
    getFamilyMemberById: jest.fn(),
    createFamilyMember: jest.fn(),
    getAssetItems: jest.fn(),
    createAssetItem: jest.fn(),
    setBalance: jest.fn(),
    getBalancesForMonth: jest.fn(),
    getSummary: jest.fn(),
    getTrend: jest.fn(),
    getGoalForYear: jest.fn(),
    setGoal: jest.fn(),
    getYearsWithData: jest.fn(),
  },
}))

import { assetRepository } from '@/infrastructure/repositories'

const mockGetFamilyMembers = assetRepository.getFamilyMembers as jest.MockedFunction<typeof assetRepository.getFamilyMembers>
const mockGetAssetItems = assetRepository.getAssetItems as jest.MockedFunction<typeof assetRepository.getAssetItems>
const mockGetSummary = assetRepository.getSummary as jest.MockedFunction<typeof assetRepository.getSummary>
const mockGetGoalForYear = assetRepository.getGoalForYear as jest.MockedFunction<typeof assetRepository.getGoalForYear>

describe('asset.service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCurrentYearMonth', () => {
    it('returns current year-month in YYYY-MM format', () => {
      const result = getCurrentYearMonth()

      const now = new Date()
      const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      expect(result).toBe(expected)
    })
  })

  describe('getFamilyMembers', () => {
    it('sorts parents before children', () => {
      const mockMembers: FamilyMember[] = [
        { id: '1', name: 'Child 1', nickname: 'C1', role: 'child', sortOrder: 1, isActive: true },
        { id: '2', name: 'Parent 1', nickname: 'P1', role: 'parent', sortOrder: 1, isActive: true },
        { id: '3', name: 'Child 2', nickname: 'C2', role: 'child', sortOrder: 2, isActive: true },
      ]
      mockGetFamilyMembers.mockReturnValue(mockMembers)

      const result = getFamilyMembers()

      expect(result[0].role).toBe('parent')
      expect(result[1].role).toBe('child')
      expect(result[2].role).toBe('child')
    })

    it('sorts by sortOrder within same role', () => {
      const mockMembers: FamilyMember[] = [
        { id: '1', name: 'Child B', nickname: 'CB', role: 'child', sortOrder: 2, isActive: true },
        { id: '2', name: 'Child A', nickname: 'CA', role: 'child', sortOrder: 1, isActive: true },
      ]
      mockGetFamilyMembers.mockReturnValue(mockMembers)

      const result = getFamilyMembers()

      expect(result[0].name).toBe('Child A')
      expect(result[1].name).toBe('Child B')
    })
  })

  describe('getAssetItems', () => {
    it('sorts by field then category then sortOrder', () => {
      // Use actual field values from asset.model.ts
      const mockItems: AssetItem[] = [
        { id: '1', field: 'liabilities', category: 'loans', name: 'Car Loan', memberId: null, isLiquidifiable: false, sortOrder: 1, isArchived: false },
        { id: '2', field: 'current_assets', category: 'investments', name: 'Stocks', memberId: null, isLiquidifiable: true, sortOrder: 1, isArchived: false },
        { id: '3', field: 'current_assets', category: 'cash_savings', name: 'Checking', memberId: null, isLiquidifiable: true, sortOrder: 1, isArchived: false },
        { id: '4', field: 'fixed_assets', category: 'real_estate', name: 'House', memberId: null, isLiquidifiable: false, sortOrder: 1, isArchived: false },
      ]
      mockGetAssetItems.mockReturnValue(mockItems)

      const result = getAssetItems()

      // Field sort order: fixed_assets(0) < current_assets(1) < liabilities(2)
      expect(result[0].field).toBe('fixed_assets')
      expect(result[1].field).toBe('current_assets')
      expect(result[2].field).toBe('current_assets')
      expect(result[3].field).toBe('liabilities')

      // Within current_assets: cash_savings before investments (based on ASSET_CATEGORIES order)
      expect(result[1].category).toBe('cash_savings')
      expect(result[2].category).toBe('investments')
    })
  })

  describe('getAssetItemsGrouped', () => {
    it('groups items by field and category', () => {
      const mockItems: AssetItem[] = [
        { id: '1', field: 'current_assets', category: 'cash_savings', name: 'Checking', memberId: null, isLiquidifiable: true, sortOrder: 1, isArchived: false },
        { id: '2', field: 'current_assets', category: 'cash_savings', name: 'Savings', memberId: null, isLiquidifiable: true, sortOrder: 2, isArchived: false },
        { id: '3', field: 'current_assets', category: 'investments', name: 'Stocks', memberId: null, isLiquidifiable: true, sortOrder: 1, isArchived: false },
      ]
      mockGetAssetItems.mockReturnValue(mockItems)

      const result = getAssetItemsGrouped()

      expect(result.has('current_assets')).toBe(true)
      const assetsMap = result.get('current_assets')!
      expect(assetsMap.has('cash_savings')).toBe(true)
      expect(assetsMap.has('investments')).toBe(true)
      expect(assetsMap.get('cash_savings')!.length).toBe(2)
      expect(assetsMap.get('investments')!.length).toBe(1)
    })
  })

  describe('getGoalProgress', () => {
    const createMockSummary = (netWorth: number): AssetSummary => ({
      totalAssets: netWorth + 50000,
      totalLiabilities: 50000,
      netWorth,
      liquidifiableAmount: 0,
      byField: { fixed_assets: 0, current_assets: netWorth, liabilities: 50000 },
      byCategory: { real_estate: 0, retirement_funds: 0, cash_savings: netWorth, investments: 0, kids: 0, credit_card: 0, loans: 50000, other: 0 },
    })

    it('returns zero progress when no goal exists', () => {
      mockGetGoalForYear.mockReturnValue(null)
      mockGetSummary.mockReturnValue(createMockSummary(50000))

      const result = getGoalProgress()

      expect(result.goal).toBeNull()
      expect(result.progressPercent).toBe(0)
      expect(result.onTrack).toBe(false)
    })

    it('calculates progress correctly when goal exists', () => {
      const mockGoal: AssetGoal = {
        id: '1',
        year: 2026,
        targetGrowth: 10000, // $100 goal
        startNetWorth: 50000,
        startYearMonth: '2026-01',
      }
      mockGetGoalForYear.mockReturnValue(mockGoal)
      mockGetSummary.mockReturnValue(createMockSummary(55000)) // $50 growth

      const result = getGoalProgress()

      expect(result.goal).toEqual(mockGoal)
      expect(result.growthAmount).toBe(5000) // 55000 - 50000
      expect(result.progressPercent).toBe(50) // 5000/10000 * 100
    })

    it('caps progress at 100%', () => {
      const mockGoal: AssetGoal = {
        id: '1',
        year: 2026,
        targetGrowth: 5000,
        startNetWorth: 50000,
        startYearMonth: '2026-01',
      }
      mockGetGoalForYear.mockReturnValue(mockGoal)
      mockGetSummary.mockReturnValue(createMockSummary(60000)) // $100 growth vs $50 goal

      const result = getGoalProgress()

      expect(result.progressPercent).toBe(100)
    })
  })

  describe('suggestAnnualGoal', () => {
    it('calculates conservative/moderate/aggressive goals', () => {
      // Function takes raw values and calculates based on total income
      // Monthly expense: 3000, Monthly savings: 1000
      // Total income: 4000/month
      const result = suggestAnnualGoal(3000, 1000)

      // Conservative: 10% of 4000 * 12 = 4800
      expect(result.conservative).toBe(4800)
      // Moderate: 20% of 4000 * 12 = 9600
      expect(result.moderate).toBe(9600)
      // Aggressive: 30% of 4000 * 12 = 14400
      expect(result.aggressive).toBe(14400)
    })

    it('handles zero income', () => {
      const result = suggestAnnualGoal(0, 0)

      expect(result.conservative).toBe(0)
      expect(result.moderate).toBe(0)
      expect(result.aggressive).toBe(0)
    })
  })
})
