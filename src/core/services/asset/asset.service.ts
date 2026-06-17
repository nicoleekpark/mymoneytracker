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
import type { AccountKind } from '@/core/domain/account'
import { assetRepository, accountRepository, transactionRepository } from '@/infrastructure/repositories'

// ─── Investment Account Integration ──────────────────────────────────────────

/**
 * Map account kind to asset category
 */
function accountKindToAssetCategory(kind: AccountKind): AssetCategory | null {
  switch (kind) {
    // Cash & savings accounts → current_assets/cash_savings
    case 'checking':
    case 'savings':
    case 'cash':
      return 'cash_savings'
    // Retirement accounts → fixed_assets/retirement_funds
    case '401k':
    case 'ira':
    case 'roth_ira':
    case '403b':
      return 'retirement_funds'
    // Investment accounts → current_assets/investments
    case 'hsa':
    case 'brokerage':
    case 'investment':
      return 'investments'
    // Liability accounts → liabilities
    case 'credit_card':
      return 'credit_card'
    case 'loan':
    case 'mortgage':
      return 'loans'
    default:
      return null
  }
}

/**
 * Map asset category to asset field
 */
function assetCategoryToField(category: AssetCategory): AssetField {
  switch (category) {
    case 'retirement_funds':
    case 'real_estate':
      return 'fixed_assets'
    case 'credit_card':
    case 'loans':
    case 'other':
      return 'liabilities'
    default:
      return 'current_assets'
  }
}

/**
 * Check if an account should be shown in assets
 */
function isInvestmentAccountKind(kind: AccountKind): boolean {
  return accountKindToAssetCategory(kind) !== null
}

/**
 * Get accounts that should appear in the Assets tab as virtual AssetItems
 * Includes: spending accounts (checking, savings, cash), investment accounts (401k, IRA, etc.),
 * and liability accounts (credit card, loans)
 */
function getAccountsAsAssetItems(): AssetItem[] {
  const accounts = accountRepository.listActive()
  // Include spending (cash/savings), investment, and liability accounts
  const relevantAccounts = accounts.filter(a =>
    (a.category === 'spending' || a.category === 'investment' || a.category === 'liability') && !a.isArchived
  )

  return relevantAccounts.map((account, index) => {
    // For 'other' kind accounts, use the account's nature to determine asset vs liability
    // Assets with kind='other' go to 'investments', liabilities go to 'other' (which maps to liabilities field)
    let category: AssetCategory
    if (account.kind === 'other') {
      category = account.nature === 'liability' ? 'other' : 'investments'
    } else {
      category = accountKindToAssetCategory(account.kind) ?? 'other'
    }
    const field = assetCategoryToField(category)

    return {
      id: `acct:${account.id}` as string, // Prefix to distinguish from asset items
      field,
      category,
      name: account.name,
      memberId: null, // Joint by default, could be extended later
      isLiquidifiable: category === 'cash_savings' || category === 'investments', // Cash/savings and brokerage/HSA are liquidifiable
      sortOrder: 1000 + index, // Sort after regular assets
      isArchived: false,
    }
  })
}

/**
 * Get investment account balance for a month
 */
function getInvestmentAccountBalance(accountId: string, yearMonth: string): number {
  return transactionRepository.getAccountBalanceAtEndOfMonth(accountId, yearMonth)
}

/**
 * Get all account balances for a month (spending + investment + liability accounts)
 * Returns map of "acct:{accountId}" -> balance (in dollars)
 * Note: Liability balances are returned as positive values (debt owed)
 */
function getAccountBalancesForMonth(yearMonth: string): Map<string, number> {
  const accounts = accountRepository.listActive()
  const relevantAccounts = accounts.filter(a =>
    (a.category === 'spending' || a.category === 'investment' || a.category === 'liability') && !a.isArchived
  )

  const balances = new Map<string, number>()
  for (const account of relevantAccounts) {
    // getAccountBalanceAtEndOfMonth returns cents, convert to dollars
    const balanceCents = transactionRepository.getAccountBalanceAtEndOfMonth(account.id, yearMonth)
    if (balanceCents !== 0) {
      // For liabilities, the balance represents debt owed (stored as positive in asset system)
      // Transaction system stores liability balances as negative, so we flip the sign
      // Use nature for 'other' kind accounts, domain category for standard kinds
      const isLiability = account.kind === 'other'
        ? account.nature === 'liability'
        : account.category === 'liability'
      const dollars = isLiability
        ? Math.abs(balanceCents / 100)  // Debt as positive value
        : balanceCents / 100             // Assets as-is
      balances.set(`acct:${account.id}`, dollars)
    }
  }
  return balances
}

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
 *
 * Includes investment accounts converted to virtual asset items
 */
export function getAssetItems(memberId?: string | null): AssetItem[] {
  const items = assetRepository.getAssetItems(memberId)

  // Add investment accounts as virtual asset items
  // Investment accounts are always "joint" (memberId = null) for now
  if (memberId === undefined || memberId === null) {
    const investmentAccounts = getAccountsAsAssetItems()
    items.push(...investmentAccounts)
  }

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
 * Update an asset item's properties
 */
export function updateAssetItem(id: string, updates: { name?: string }): void {
  assetRepository.updateAssetItem(id, updates)
}

/**
 * Archive an asset item (soft delete)
 * Hides from list but preserves balance history
 */
export function archiveAssetItem(id: string): void {
  assetRepository.updateAssetItem(id, { isArchived: true })
}

/**
 * Delete an asset item (hard delete)
 * Removes the item and all associated balance history
 */
export function deleteAssetItem(id: string): void {
  assetRepository.deleteAssetItem(id)
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
 *
 * Includes investment account balances (prefixed with "acct:")
 */
export function getBalancesForMonth(yearMonth: string, memberId?: string | null): Map<string, number> {
  const balances = assetRepository.getBalancesForMonth(yearMonth, memberId)
  const map = new Map<string, number>()
  for (const balance of balances) {
    map.set(balance.assetItemId, balance.amount)
  }

  // Add investment account balances
  // Investment accounts are always "joint" for now
  if (memberId === undefined || memberId === null) {
    const investmentBalances = getAccountBalancesForMonth(yearMonth)
    for (const [key, amount] of investmentBalances) {
      map.set(key, amount)
    }
  }

  return map
}

/**
 * Get asset summary for a month
 * Includes investment account balances in the totals
 */
export function getSummary(yearMonth?: string, memberId?: string | null): AssetSummary {
  const month = yearMonth ?? getCurrentYearMonth()

  // Get base summary from repository (asset items only)
  const summary = assetRepository.getSummary(month, memberId)

  // Add account balances (investment + liability accounts)
  // These accounts are always "joint" for now
  if (memberId === undefined || memberId === null) {
    const accountItems = getAccountsAsAssetItems()
    const accountBalances = getAccountBalancesForMonth(month)

    for (const item of accountItems) {
      const balance = accountBalances.get(item.id) ?? 0
      if (balance === 0) continue

      // Add to field totals
      summary.byField[item.field] += balance

      // Add to category totals
      if (item.category in summary.byCategory) {
        summary.byCategory[item.category] += balance
      }

      // Handle assets vs liabilities
      if (item.field === 'liabilities') {
        // Liability accounts add to total liabilities
        summary.totalLiabilities += balance
      } else {
        // Investment accounts add to total assets
        summary.totalAssets += balance

        // Add to liquidifiable if applicable (investments but not retirement)
        if (item.isLiquidifiable) {
          summary.liquidifiableAmount += balance
        }
      }
    }

    // Recalculate net worth
    summary.netWorth = summary.totalAssets - summary.totalLiabilities
  }

  return summary
}

/**
 * Get net worth trend over N months
 * Includes investment account balances in the trend data
 */
export function getTrend(months: number = 12, memberId?: string | null): AssetTrendPoint[] {
  // Generate list of year-months to query
  const yearMonths: string[] = []
  const now = new Date()

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    yearMonths.push(ym)
  }

  // Get summary for each month using the service's getSummary (includes investment accounts)
  return yearMonths.map(ym => {
    const summary = getSummary(ym, memberId)
    return {
      yearMonth: ym,
      netWorth: summary.netWorth,
      totalAssets: summary.totalAssets,
      totalLiabilities: summary.totalLiabilities,
      liquidifiable: summary.liquidifiableAmount,
    }
  })
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

  // Parse start month with validation
  const parts = startYearMonth.split('-')
  const startMonthNum = parts.length >= 2 ? parseInt(parts[1], 10) : 1
  const validStartMonth = isNaN(startMonthNum) ? 1 : Math.max(1, Math.min(12, startMonthNum))

  // For past years, use 12 months; for current year, use months so far
  const monthsElapsed = isCurrentYear
    ? Math.max(0, currentMonth - validStartMonth + 1)
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
