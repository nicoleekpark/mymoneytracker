// ═══════════════════════════════════════════════════════════════════════════
// APPLICATION SERVICE: Asset
// Business logic functions that orchestrate domain + infrastructure.
// ═══════════════════════════════════════════════════════════════════════════

import type {
  FamilyMember,
  AssetItem,
  AssetGoal,
  AssetSummary,
  AssetTrendPoint,
  AssetField,
  AssetCategory,
} from '@/core/domain/asset'
import type { AssetProjection } from '@/core/domain/asset/asset.types'
import { getFieldSortOrder, getCategorySortOrder } from '@/core/domain/asset'
import { assetRepository } from '@/infrastructure/repositories'

/**
 * Get current year-month string
 */
export function getCurrentYearMonth(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * Get all family members, sorted by role (parents first) then sortOrder
 */
export function getFamilyMembers(): FamilyMember[] {
  const members = assetRepository.getFamilyMembers()
  return members.sort((a, b) => {
    // Parents before children
    if (a.role !== b.role) {
      return a.role === 'parent' ? -1 : 1
    }
    return a.sortOrder - b.sortOrder
  })
}

/**
 * Get family member by ID
 */
export function getFamilyMemberById(id: string): FamilyMember | null {
  return assetRepository.getFamilyMemberById(id)
}

/**
 * Create a new family member
 */
export function createFamilyMember(
  name: string,
  nickname: string,
  role: 'parent' | 'child'
): FamilyMember {
  const members = getFamilyMembers()
  const maxOrder = members.length > 0 ? Math.max(...members.map(o => o.sortOrder)) : 0

  return assetRepository.createFamilyMember({
    name,
    nickname,
    role,
    sortOrder: maxOrder + 1,
    isActive: true,
  })
}

/**
 * Get asset items, optionally filtered by family member
 * null memberId = joint assets only
 * undefined memberId = all assets
 */
export function getAssetItems(memberId?: string | null): AssetItem[] {
  const items = assetRepository.getAssetItems(memberId)

  return items.sort((a, b) => {
    // Sort by field first
    const fieldDiff = getFieldSortOrder(a.field) - getFieldSortOrder(b.field)
    if (fieldDiff !== 0) return fieldDiff

    // Then by category
    const catDiff = getCategorySortOrder(a.category) - getCategorySortOrder(b.category)
    if (catDiff !== 0) return catDiff

    // Then by sortOrder
    return a.sortOrder - b.sortOrder
  })
}

/**
 * Group asset items by field and category
 */
export function getAssetItemsGrouped(memberId?: string | null): Map<AssetField, Map<AssetCategory, AssetItem[]>> {
  const items = getAssetItems(memberId)
  const grouped = new Map<AssetField, Map<AssetCategory, AssetItem[]>>()

  for (const item of items) {
    if (!grouped.has(item.field)) {
      grouped.set(item.field, new Map())
    }
    const fieldMap = grouped.get(item.field)!

    if (!fieldMap.has(item.category)) {
      fieldMap.set(item.category, [])
    }
    fieldMap.get(item.category)!.push(item)
  }

  return grouped
}

/**
 * Create a new asset item
 */
export function createAssetItem(
  field: AssetField,
  category: AssetCategory,
  name: string,
  memberId: string | null
): AssetItem {
  const items = getAssetItems()
  const sameCategory = items.filter(i => i.category === category)
  const maxOrder = sameCategory.length > 0 ? Math.max(...sameCategory.map(i => i.sortOrder)) : 0

  return assetRepository.createAssetItem({
    field,
    category,
    name,
    memberId,
    isLiquidifiable: category === 'cash_savings' || category === 'investments',
    sortOrder: maxOrder + 1,
    isArchived: false,
  })
}

/**
 * Update asset balance for a month
 */
export function setBalance(assetItemId: string, yearMonth: string, amount: number): void {
  assetRepository.setBalance(assetItemId, yearMonth, amount)
}

/**
 * Get all balances for a specific month
 * Returns a map of assetItemId -> amount
 */
export function getBalancesForMonth(yearMonth: string, memberId?: string | null): Map<string, number> {
  const balances = assetRepository.getBalancesForMonth(yearMonth, memberId)
  const map = new Map<string, number>()
  for (const balance of balances) {
    map.set(balance.assetItemId, balance.amount)
  }
  return map
}

/**
 * Get asset summary for a month
 */
export function getSummary(yearMonth?: string, memberId?: string | null): AssetSummary {
  const month = yearMonth ?? getCurrentYearMonth()
  return assetRepository.getSummary(month, memberId)
}

/**
 * Get net worth trend over N months
 */
export function getTrend(months: number = 12, memberId?: string | null): AssetTrendPoint[] {
  return assetRepository.getTrend(months, memberId)
}

/**
 * Get goal for a year
 */
export function getGoal(year?: number): AssetGoal | null {
  const targetYear = year ?? new Date().getFullYear()
  return assetRepository.getGoalForYear(targetYear)
}

/**
 * Set annual growth goal
 */
export function setGoal(year: number, targetGrowth: number, startNetWorth: number, startYearMonth?: string): AssetGoal {
  return assetRepository.setGoal(year, targetGrowth, startNetWorth, startYearMonth)
}

/**
 * Calculate goal progress
 */
export function getGoalProgress(year?: number, memberId?: string | null): {
  goal: AssetGoal | null
  currentNetWorth: number
  growthAmount: number
  progressPercent: number
  onTrack: boolean
} {
  const targetYear = year ?? new Date().getFullYear()
  const goal = getGoal(targetYear)
  const summary = getSummary(getCurrentYearMonth(), memberId)
  const currentNetWorth = summary.netWorth

  if (!goal) {
    return {
      goal: null,
      currentNetWorth,
      growthAmount: 0,
      progressPercent: 0,
      onTrack: false,
    }
  }

  const growthAmount = currentNetWorth - goal.startNetWorth
  const progressPercent = goal.targetGrowth > 0
    ? Math.min(100, (growthAmount / goal.targetGrowth) * 100)
    : 0

  // On track if progress >= expected progress for this time of year
  const now = new Date()
  const monthsElapsed = now.getMonth() + 1
  const expectedProgress = (monthsElapsed / 12) * 100
  const onTrack = progressPercent >= expectedProgress

  return {
    goal,
    currentNetWorth,
    growthAmount,
    progressPercent,
    onTrack,
  }
}

// Re-export type for backwards compatibility
export type { AssetProjection } from '@/core/domain/asset/asset.types'

/**
 * Calculate projected net worth growth for the year
 * Projects year-end net worth based on average monthly growth
 */
export function getAssetProjection(year?: number, memberId?: string | null): AssetProjection {
  const targetYear = year ?? new Date().getFullYear()
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const isCurrentYear = targetYear === currentYear

  // Get goal if exists
  const goal = getGoal(targetYear)
  const startYearMonth = goal?.startYearMonth ?? `${targetYear}-01`

  // Calculate months elapsed from start
  const [startYear, startMonthStr] = startYearMonth.split('-').map(Number)
  const startMonthIndex = (startYear - targetYear) * 12 + startMonthStr
  const currentMonthIndex = isCurrentYear ? currentMonth : 12

  // For past years, use 12 months; for current year, use months so far
  const monthsElapsed = isCurrentYear
    ? Math.max(0, currentMonth - startMonthStr + 1)
    : 12
  const monthsRemaining = 12 - monthsElapsed

  // Get current summary
  const summary = getSummary(getCurrentYearMonth(), memberId)
  const currentNetWorth = summary.netWorth

  // Get start net worth - either from goal or from trend data
  let startNetWorth = goal?.startNetWorth ?? 0
  if (!goal) {
    // Try to get from trend data
    const trend = getTrend(monthsElapsed + 1, memberId)
    if (trend.length > 0) {
      startNetWorth = trend[0].netWorth
    }
  }

  const currentGrowth = currentNetWorth - startNetWorth
  const avgMonthlyGrowth = monthsElapsed > 0 ? currentGrowth / monthsElapsed : 0

  // Project year-end
  const projectedYearEndNetWorth = currentNetWorth + (avgMonthlyGrowth * monthsRemaining)
  const projectedYearEndGrowth = projectedYearEndNetWorth - startNetWorth

  // Compare to goal
  let vsGoal: AssetProjection['vsGoal'] = null
  if (goal && goal.targetGrowth > 0) {
    const projectedVsTarget = projectedYearEndGrowth - goal.targetGrowth
    const onTrackToMeetGoal = projectedYearEndGrowth >= goal.targetGrowth
    vsGoal = {
      targetGrowth: goal.targetGrowth,
      projectedVsTarget,
      onTrackToMeetGoal,
    }
  }

  // Compare to last year
  let vsLastYear: AssetProjection['vsLastYear'] = null
  const lastYearGoal = getGoal(targetYear - 1)
  if (lastYearGoal) {
    // Get last year's actual growth
    const lastYearSummary = getSummary(`${targetYear - 1}-12`, memberId)
    const lastYearGrowth = lastYearSummary.netWorth - lastYearGoal.startNetWorth

    if (lastYearGrowth !== 0 || projectedYearEndGrowth !== 0) {
      const delta = projectedYearEndGrowth - lastYearGrowth
      vsLastYear = {
        lastYearGrowth,
        delta: Math.abs(delta),
        isMoreGrowth: delta >= 0,
      }
    }
  }

  return {
    monthsElapsed,
    monthsRemaining,
    currentNetWorth,
    startNetWorth,
    currentGrowth,
    avgMonthlyGrowth,
    projectedYearEndNetWorth,
    projectedYearEndGrowth,
    vsGoal,
    vsLastYear,
  }
}

/**
 * Calculate suggested annual goal based on history
 * Uses average monthly savings rate from previous year
 */
export function suggestAnnualGoal(monthlyExpenseAvg: number, monthlySavingsAvg: number): {
  conservative: number
  moderate: number
  aggressive: number
  explanation: string
} {
  // Conservative: 10% savings rate
  // Moderate: 20% savings rate (industry standard)
  // Aggressive: 30% savings rate

  const totalIncome = monthlyExpenseAvg + monthlySavingsAvg
  const currentRate = totalIncome > 0 ? (monthlySavingsAvg / totalIncome) : 0

  const conservative = Math.round(totalIncome * 0.10 * 12)
  const moderate = Math.round(totalIncome * 0.20 * 12)
  const aggressive = Math.round(totalIncome * 0.30 * 12)

  const explanation = currentRate > 0
    ? `Based on your ${(currentRate * 100).toFixed(0)}% historical savings rate`
    : 'Based on the 50/30/20 budgeting rule'

  return {
    conservative,
    moderate,
    aggressive,
    explanation,
  }
}

/**
 * Get list of years that have asset data (balances or goals)
 * Always includes the current year
 */
export function getYearsWithData(): number[] {
  return assetRepository.getYearsWithData()
}
