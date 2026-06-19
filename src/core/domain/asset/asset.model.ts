import type {
  AssetField,
  AssetCategory,
  AssetCategoryMeta,
  AssetItem,
  AssetSummary,
  FamilyMemberRole,
} from './asset.types'
import { LIQUIDIFIABLE_CATEGORIES } from './asset.types'

/**
 * Category metadata configuration
 */
export const ASSET_CATEGORIES: AssetCategoryMeta[] = [
  // Fixed Assets
  { field: 'fixed_assets', category: 'real_estate', name: 'Real Estate', icon: 'home', isLiquidifiable: false },
  { field: 'fixed_assets', category: 'retirement_funds', name: 'Retirement Funds', icon: 'university', isLiquidifiable: false },
  // Current Assets
  { field: 'current_assets', category: 'cash_savings', name: 'Cash & Savings', icon: 'money', isLiquidifiable: true },
  { field: 'current_assets', category: 'investments', name: 'Investments', icon: 'line-chart', isLiquidifiable: true },
  { field: 'current_assets', category: 'kids', name: 'Kids', icon: 'child', isLiquidifiable: false },
  { field: 'current_assets', category: 'other', name: 'Other', icon: 'ellipsis-h', isLiquidifiable: false },
  // Liabilities
  { field: 'liabilities', category: 'credit_card', name: 'Credit Cards', icon: 'credit-card', isLiquidifiable: false },
  { field: 'liabilities', category: 'loans', name: 'Loans', icon: 'bank', isLiquidifiable: false },
  { field: 'liabilities', category: 'other', name: 'Other', icon: 'ellipsis-h', isLiquidifiable: false },
]

/**
 * Field display names
 */
export const ASSET_FIELD_NAMES: Record<AssetField, string> = {
  fixed_assets: 'Fixed Assets',
  current_assets: 'Current Assets',
  liabilities: 'Liabilities',
}

/**
 * Field sort order
 */
export function getFieldSortOrder(field: AssetField): number {
  switch (field) {
    case 'fixed_assets': return 0
    case 'current_assets': return 1
    case 'liabilities': return 2
    default: return 9
  }
}

/**
 * Category sort order within a field
 */
export function getCategorySortOrder(category: AssetCategory): number {
  const meta = ASSET_CATEGORIES.find(c => c.category === category)
  return meta ? ASSET_CATEGORIES.indexOf(meta) : 99
}

/**
 * Get category metadata
 * If field is provided, matches both category and field (for 'other' which exists in multiple fields)
 */
export function getCategoryMeta(category: AssetCategory, field?: AssetField): AssetCategoryMeta | undefined {
  if (field) {
    return ASSET_CATEGORIES.find(c => c.category === category && c.field === field)
  }
  return ASSET_CATEGORIES.find(c => c.category === category)
}

/**
 * Get categories for a field
 */
export function getCategoriesForField(field: AssetField): AssetCategoryMeta[] {
  return ASSET_CATEGORIES.filter(c => c.field === field)
}

/**
 * Check if a category is liquidifiable
 */
export function isLiquidifiableCategory(category: AssetCategory): boolean {
  return LIQUIDIFIABLE_CATEGORIES.includes(category)
}

/**
 * Check if asset item is liquidifiable
 * Based on category, not kids accounts (earmarked)
 */
export function isLiquidifiable(item: AssetItem): boolean {
  // Kids accounts are excluded even if in liquidifiable category
  if (item.category === 'kids') return false
  return LIQUIDIFIABLE_CATEGORIES.includes(item.category)
}

/**
 * Calculate empty summary
 */
export function createEmptySummary(): AssetSummary {
  return {
    totalAssets: 0,
    totalLiabilities: 0,
    netWorth: 0,
    liquidifiableAmount: 0,
    byField: {
      fixed_assets: 0,
      current_assets: 0,
      liabilities: 0,
    },
    byCategory: {
      real_estate: 0,
      retirement_funds: 0,
      cash_savings: 0,
      investments: 0,
      kids: 0,
      credit_card: 0,
      loans: 0,
      other: 0,
    },
  }
}

/**
 * Liquidity health thresholds (in months of runway)
 * Based on monthly expense average
 */
export const LIQUIDITY_THRESHOLDS = {
  excellent: 12, // 12+ months = excellent
  good: 6,       // 6-12 months = good
  warning: 3,    // 3-6 months = warning
  // < 3 months = critical
} as const

/**
 * Get liquidity health status
 */
export function getLiquidityHealth(
  liquidifiable: number,
  monthlyExpenseAvg: number
): 'excellent' | 'good' | 'warning' | 'critical' {
  if (monthlyExpenseAvg <= 0) return 'excellent'

  const months = liquidifiable / monthlyExpenseAvg

  if (months >= LIQUIDITY_THRESHOLDS.excellent) return 'excellent'
  if (months >= LIQUIDITY_THRESHOLDS.good) return 'good'
  if (months >= LIQUIDITY_THRESHOLDS.warning) return 'warning'
  return 'critical'
}

/**
 * Format liquidity health for display
 */
export function formatLiquidityMonths(
  liquidifiable: number,
  monthlyExpenseAvg: number
): string {
  if (monthlyExpenseAvg <= 0) return '∞'

  const months = Math.floor(liquidifiable / monthlyExpenseAvg)

  if (months >= 12) return '12+ mo'
  if (months >= 1) return `${months} mo`
  return '< 1 mo'
}
