import type { UUID } from '@/core/domain/common/uuid'

/**
 * Asset Field - Top level categorization
 * Maps to spreadsheet FIELD column
 */
export type AssetField = 'fixed_assets' | 'current_assets' | 'liabilities'

/**
 * Asset Category - Second level categorization
 * Maps to spreadsheet CATEGORY column
 */
export type AssetCategory =
  // Fixed Assets
  | 'real_estate'
  | 'retirement_funds'
  // Current Assets
  | 'cash_savings'
  | 'investments'
  | 'kids'
  // Liabilities
  | 'credit_card'
  | 'loans'
  | 'other'

/**
 * Member role in the family
 */
export type FamilyMemberRole = 'parent' | 'child'

/**
 * Family Member - Person who can own assets
 * Will be extended with auth/permissions in v2
 */
export type FamilyMember = {
  id: UUID
  name: string
  nickname: string
  role: FamilyMemberRole
  sortOrder: number
  isActive: boolean
}

/**
 * Asset Item - Individual asset or liability
 * Maps to spreadsheet ITEM column
 */
export type AssetItem = {
  id: UUID
  field: AssetField
  category: AssetCategory
  name: string
  memberId: UUID | null // null = joint/family ownership
  isLiquidifiable: boolean
  sortOrder: number
  isArchived: boolean
}

/**
 * Asset Balance - Monthly snapshot of an asset's value
 */
export type AssetBalance = {
  id: UUID
  assetItemId: UUID
  yearMonth: string // YYYY-MM format
  amount: number // positive for assets, negative for liabilities
}

/**
 * Asset Goal - Annual growth target
 */
export type AssetGoal = {
  id: UUID
  year: number
  targetGrowth: number // target amount to grow this year
  startNetWorth: number // net worth at start of goal period
  startYearMonth: string // YYYY-MM format, when goal period starts
}

/**
 * Liquidifiable Asset Definition (Industry Standard)
 * Assets convertible to cash within 7 days without significant value loss
 *
 * INCLUDED:
 * - Cash, Checking, Savings, HYSA, Money Market
 * - Brokerage accounts (stocks, ETFs, bonds)
 * - Cryptocurrency
 *
 * EXCLUDED:
 * - Real estate
 * - Retirement accounts (401k, IRA) - early withdrawal penalties
 * - Kids accounts (earmarked funds)
 * - Private equity, CDs with penalties
 */
export const LIQUIDIFIABLE_CATEGORIES: AssetCategory[] = [
  'cash_savings',
  'investments',
]

/**
 * Category metadata for display
 */
export type AssetCategoryMeta = {
  field: AssetField
  category: AssetCategory
  name: string
  icon: string
  isLiquidifiable: boolean
}

/**
 * Summary data for a single owner or aggregated view
 */
export type AssetSummary = {
  totalAssets: number
  totalLiabilities: number
  netWorth: number
  liquidifiableAmount: number
  byField: Record<AssetField, number>
  byCategory: Record<AssetCategory, number>
}

/**
 * Monthly trend data point
 */
export type AssetTrendPoint = {
  yearMonth: string
  netWorth: number
  totalAssets: number
  totalLiabilities: number
  liquidifiable: number
}

/**
 * Asset growth projection for year-end estimates
 */
export type AssetProjection = {
  monthsElapsed: number
  monthsRemaining: number
  currentNetWorth: number
  startNetWorth: number
  currentGrowth: number
  avgMonthlyGrowth: number
  projectedYearEndNetWorth: number
  projectedYearEndGrowth: number
  vsGoal: {
    targetGrowth: number
    projectedVsTarget: number // positive = ahead, negative = behind
    onTrackToMeetGoal: boolean
  } | null
  vsLastYear: {
    lastYearGrowth: number
    delta: number
    isMoreGrowth: boolean
  } | null
}
