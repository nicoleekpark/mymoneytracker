import { useMemo } from 'react'
import { useDataRefreshStore } from '@/shared/store'
import { logError } from '@/shared/utils/logger'
import {
  createEmptySummary,
  type FamilyMember,
  type AssetSummary,
  type AssetTrendPoint,
  type AssetField,
  type AssetCategory,
  type AssetItem,
  ASSET_FIELD_NAMES,
  getCategoryMeta,
  isLiquidifiableCategory,
} from '@/core/domain/asset'
import {
  getFamilyMembers,
  getSummary,
  getTrend,
  getGoalProgress,
  getAssetProjection,
  getAssetItemsGrouped,
  getCurrentYearMonth,
  getGoal,
  getYearsWithData,
  getBalancesForMonth,
  type AssetProjection,
} from '@/core/services/asset'

export type AssetFieldGroup = {
  field: AssetField
  fieldName: string
  total: number
  categories: AssetCategoryGroup[]
}

export type AssetCategoryGroup = {
  category: AssetCategory
  categoryName: string
  icon: string
  total: number
  items: AssetItemWithBalance[]
}

export type AssetItemWithBalance = AssetItem & {
  balance: number
  trend?: number[] // Last 12 months
}

export type YearlySnapshot = {
  startNetWorth: number
  endNetWorth: number
  growth: number
  hasGoal: boolean
  targetGrowth: number
  achievedPercent: number
  achievedTarget: boolean
}

export type AssetsData = {
  members: FamilyMember[]
  selectedMemberIds: string[] // empty = all
  year: number
  isCurrentYear: boolean
  availableYears: number[] // Years with data
  summary: AssetSummary
  trend: AssetTrendPoint[]
  yearlySnapshot: YearlySnapshot // Snapshot view for the year
  goalProgress: {
    hasGoal: boolean
    targetGrowth: number
    currentGrowth: number
    progressPercent: number
    onTrack: boolean
    startNetWorth: number
    startYearMonth: string
    // For completed years
    isCompleted: boolean
    finalGrowth: number
    achievedTarget: boolean
  }
  projection: AssetProjection | null
  fieldGroups: AssetFieldGroup[]
  yearMonth: string
}

/**
 * Compute summary from filtered items and balances
 */
function computeSummaryFromItems(
  items: AssetItem[],
  balancesMap: Map<string, number>
): AssetSummary {
  const summary = createEmptySummary()

  for (const item of items) {
    const balance = balancesMap.get(item.id) ?? 0
    if (balance === 0) continue

    const field = item.field as keyof typeof summary.byField
    const category = item.category as keyof typeof summary.byCategory

    // Aggregate by field
    if (field in summary.byField) {
      summary.byField[field] += balance
    }

    // Aggregate by category
    if (category in summary.byCategory) {
      summary.byCategory[category] += balance
    }

    // Calculate totals
    if (field === 'liabilities') {
      summary.totalLiabilities += Math.abs(balance)
    } else {
      summary.totalAssets += balance
    }

    // Liquidifiable (exclude kids and retirement)
    if (item.isLiquidifiable && category !== 'kids' && category !== 'retirement_funds') {
      summary.liquidifiableAmount += balance
    }
  }

  summary.netWorth = summary.totalAssets - summary.totalLiabilities
  return summary
}

/**
 * Filter items to include only those belonging to selected members + joint assets
 */
function filterItemsByMembers(
  items: AssetItem[],
  selectedMemberIds: string[]
): AssetItem[] {
  if (selectedMemberIds.length === 0) {
    // All members
    return items
  }
  return items.filter(item =>
    item.memberId === null || // Joint assets
    selectedMemberIds.includes(item.memberId)
  )
}

export type UseAssetsDataParams = {
  year: number
  selectedMemberIds: string[]
}

export function useAssetsData({ year, selectedMemberIds }: UseAssetsDataParams) {
  const currentYear = new Date().getFullYear()
  const assetVersion = useDataRefreshStore((s) => s.assetVersion)

  const data = useMemo((): AssetsData => {
    try {
      const isCurrentYear = year === currentYear
      // For current year, use current month; for past years, use December
      const yearMonth = isCurrentYear
        ? getCurrentYearMonth()
        : `${year}-12`
      const members = getFamilyMembers()

      // Get available years with data
      const availableYears = getYearsWithData()

      // Determine if we're in multi-select mode
      // Treat selecting ALL individual members as equivalent to "All"
      const allMemberIds = new Set(members.map(m => m.id))
      const isEffectivelyAll = selectedMemberIds.length === 0 ||
        (members.length > 0 &&
         selectedMemberIds.length === members.length &&
         selectedMemberIds.every(id => allMemberIds.has(id)))

      const isAllSelected = isEffectivelyAll
      const isSingleMember = !isEffectivelyAll && selectedMemberIds.length === 1
      const isMultiMember = !isEffectivelyAll && selectedMemberIds.length > 1

      // For single-member or all, use existing optimized methods
      // For multi-member, we need to aggregate manually
      let summary: AssetSummary
      let trend: AssetTrendPoint[]
      let grouped: Map<AssetField, Map<AssetCategory, AssetItem[]>>
      let balancesMap: Map<string, number>

      if (isAllSelected || isSingleMember) {
        // Use existing optimized single-member/all methods
        const memberId = isAllSelected ? undefined : selectedMemberIds[0]
        summary = getSummary(yearMonth, memberId)
        trend = getTrend(12, memberId)
        grouped = getAssetItemsGrouped(memberId)
        balancesMap = getBalancesForMonth(yearMonth, memberId)
      } else {
        // Multi-member: aggregate data
        // Get all items and balances, then filter
        const allGrouped = getAssetItemsGrouped(undefined)
        const allBalances = getBalancesForMonth(yearMonth, undefined)

        // Flatten all items and filter by selected members
        const allItems: AssetItem[] = []
        for (const [, categoryMap] of allGrouped) {
          for (const [, items] of categoryMap) {
            allItems.push(...items)
          }
        }
        const filteredItems = filterItemsByMembers(allItems, selectedMemberIds)
        const filteredItemIds = new Set(filteredItems.map(i => i.id))

        // Filter balances to only include filtered items
        balancesMap = new Map()
        for (const [itemId, balance] of allBalances) {
          if (filteredItemIds.has(itemId)) {
            balancesMap.set(itemId, balance)
          }
        }

        // Compute summary from filtered items
        summary = computeSummaryFromItems(filteredItems, balancesMap)

        // Rebuild grouped structure with filtered items
        grouped = new Map()
        for (const item of filteredItems) {
          if (!grouped.has(item.field)) {
            grouped.set(item.field, new Map())
          }
          const fieldMap = grouped.get(item.field)!
          if (!fieldMap.has(item.category)) {
            fieldMap.set(item.category, [])
          }
          fieldMap.get(item.category)!.push(item)
        }

        // For trend, use household trend (most meaningful for combined view)
        trend = getTrend(12, undefined)
      }

      // Get goal and progress for selected year (always household-level)
      const goal = getGoal(year)
      const progress = getGoalProgress(year, undefined) // Goals are household-level

      // Get start of year summary
      const startYearMonth = goal?.startYearMonth ?? `${year}-01`
      let startSummary: AssetSummary
      let startNetWorth: number

      if (isAllSelected) {
        // For "All", use goal's startNetWorth if available
        startSummary = getSummary(startYearMonth, undefined)
        startNetWorth = goal?.startNetWorth ?? startSummary.netWorth
      } else if (isSingleMember) {
        // For single member, use that member's start
        startSummary = getSummary(startYearMonth, selectedMemberIds[0])
        startNetWorth = startSummary.netWorth
      } else {
        // For multi-member, compute aggregate start
        const allGroupedStart = getAssetItemsGrouped(undefined)
        const allBalancesStart = getBalancesForMonth(startYearMonth, undefined)
        const allItemsStart: AssetItem[] = []
        for (const [, categoryMap] of allGroupedStart) {
          for (const [, items] of categoryMap) {
            allItemsStart.push(...items)
          }
        }
        const filteredItemsStart = filterItemsByMembers(allItemsStart, selectedMemberIds)
        const filteredItemIdsStart = new Set(filteredItemsStart.map(i => i.id))
        const balancesMapStart = new Map<string, number>()
        for (const [itemId, balance] of allBalancesStart) {
          if (filteredItemIdsStart.has(itemId)) {
            balancesMapStart.set(itemId, balance)
          }
        }
        startSummary = computeSummaryFromItems(filteredItemsStart, balancesMapStart)
        startNetWorth = startSummary.netWorth
      }

      const endNetWorth = summary.netWorth
      const growth = endNetWorth - startNetWorth

      // Calculate goal completion for past years
      let isCompleted = false
      let finalGrowth = 0
      let achievedTarget = false

      if (!isCurrentYear && goal) {
        isCompleted = true
        // For past years, use household total for goal comparison
        const yearEndSummary = getSummary(`${year}-12`, undefined)
        finalGrowth = yearEndSummary.netWorth - goal.startNetWorth
        achievedTarget = finalGrowth >= goal.targetGrowth
      }

      // Build yearly snapshot
      const yearlySnapshot: YearlySnapshot = {
        startNetWorth,
        endNetWorth,
        growth,
        hasGoal: goal !== null,
        targetGrowth: goal?.targetGrowth ?? 0,
        achievedPercent: goal && goal.targetGrowth > 0
          ? Math.min(100, (growth / goal.targetGrowth) * 100)
          : 0,
        achievedTarget: goal ? growth >= goal.targetGrowth : false,
      }

      // Get projection (only meaningful for current year, household-level)
      let projection: AssetProjection | null = null
      if (isCurrentYear) {
        try {
          const proj = getAssetProjection(year, undefined)
          if (proj.monthsElapsed > 0) {
            projection = proj
          }
        } catch {
          // Ignore projection errors
        }
      }

      // Build field groups with balances
      const fieldGroups: AssetFieldGroup[] = []
      const fieldOrder: AssetField[] = ['fixed_assets', 'current_assets', 'liabilities']

      for (const field of fieldOrder) {
        const categoryMap = grouped.get(field)
        if (!categoryMap || categoryMap.size === 0) continue

        const categories: AssetCategoryGroup[] = []
        let fieldTotal = 0

        for (const [category, items] of categoryMap) {
          const meta = getCategoryMeta(category)
          if (!meta) continue

          const itemsWithBalance: AssetItemWithBalance[] = items.map(item => ({
            ...item,
            balance: balancesMap.get(item.id) ?? 0,
            trend: undefined,
          }))

          const categoryTotal = itemsWithBalance.reduce((sum, item) => sum + item.balance, 0)
          fieldTotal += categoryTotal

          categories.push({
            category,
            categoryName: meta.name,
            icon: meta.icon,
            total: categoryTotal,
            items: itemsWithBalance,
          })
        }

        // Use summary totals instead of calculated (more accurate)
        const summaryFieldTotal = summary.byField[field] || 0

        fieldGroups.push({
          field,
          fieldName: ASSET_FIELD_NAMES[field],
          total: field === 'liabilities' ? -Math.abs(summaryFieldTotal) : summaryFieldTotal,
          categories,
        })
      }

      return {
        members,
        selectedMemberIds,
        year: year,
        isCurrentYear,
        availableYears,
        summary,
        trend,
        yearlySnapshot,
        goalProgress: {
          hasGoal: progress.goal !== null,
          targetGrowth: progress.goal?.targetGrowth ?? 0,
          currentGrowth: isCompleted ? finalGrowth : progress.growthAmount,
          progressPercent: isCompleted
            ? (goal && goal.targetGrowth > 0 ? Math.min(100, (finalGrowth / goal.targetGrowth) * 100) : 0)
            : progress.progressPercent,
          onTrack: isCompleted ? achievedTarget : progress.onTrack,
          startNetWorth: startNetWorth,
          startYearMonth: progress.goal?.startYearMonth ?? `${year}-01`,
          isCompleted,
          finalGrowth,
          achievedTarget,
        },
        projection,
        fieldGroups,
        yearMonth,
      }
    } catch (e) {
      logError('AssetsData', e)
      throw e
    }
  }, [year, selectedMemberIds, currentYear, assetVersion])

  return data
}
