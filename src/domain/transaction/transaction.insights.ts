/**
 * Transaction Insights
 *
 * Personal bests, streaks, and cumulative net calculations.
 * Used for the Insights dashboard tab.
 */
import { centsToDollars } from '@/domain/common/money'
import { transactionRepository } from '@/infrastructure/repositories'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type PersonalBests = Readonly<{
  bestSavingsMonth: { month: string; netDollar: number } | null
  bestSavingsYear: { year: number; netDollar: number } | null
  peakExpenseMonth: { month: string; expenseDollar: number } | null
  peakExpenseYear: { year: number; expenseDollar: number } | null
  worstMonth: { month: string; netDollar: number } | null
  positiveStreak: number // longest consecutive positive-net months
  currentStreak: { months: number; isPositive: boolean }
}>

export type CumulativeNetData = Readonly<{
  month: string // YYYY-MM
  netDollar: number // monthly net
  cumulativeDollar: number // running total
}>

// ─────────────────────────────────────────────────────────────────────────────
// Personal Bests
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate personal bests across all financial history
 */
export async function getPersonalBests(): Promise<PersonalBests> {
  const monthlyFlows = transactionRepository.listMonthlyNetTotals()
  const yearlyFlows = transactionRepository.listYearlyFlowTotals()

  // Aggregate monthly data
  const monthlyNet = new Map<string, number>()
  const monthlyExpense = new Map<string, number>()
  for (const flow of monthlyFlows) {
    const value = centsToDollars(flow.totalCents)
    if (flow.type === 'income') {
      const current = monthlyNet.get(flow.month) ?? 0
      monthlyNet.set(flow.month, current + value)
    } else {
      const currentNet = monthlyNet.get(flow.month) ?? 0
      monthlyNet.set(flow.month, currentNet - value)
      monthlyExpense.set(flow.month, value)
    }
  }

  // Find best/worst savings months
  let bestMonth: { month: string; netDollar: number } | null = null
  let worstMonth: { month: string; netDollar: number } | null = null
  for (const [month, net] of monthlyNet.entries()) {
    if (!bestMonth || net > bestMonth.netDollar) {
      bestMonth = { month, netDollar: net }
    }
    if (!worstMonth || net < worstMonth.netDollar) {
      worstMonth = { month, netDollar: net }
    }
  }

  // Find peak expense month
  let peakExpenseMonth: { month: string; expenseDollar: number } | null = null
  for (const [month, expense] of monthlyExpense.entries()) {
    if (!peakExpenseMonth || expense > peakExpenseMonth.expenseDollar) {
      peakExpenseMonth = { month, expenseDollar: expense }
    }
  }

  // Calculate positive-net streaks
  const { positiveStreak, currentStreak } = calculateStreaks(monthlyNet)

  // Aggregate yearly data
  const yearlyNet = new Map<number, number>()
  const yearlyExpense = new Map<number, number>()
  for (const flow of yearlyFlows) {
    const value = centsToDollars(flow.totalCents)
    if (flow.type === 'income') {
      const current = yearlyNet.get(flow.year) ?? 0
      yearlyNet.set(flow.year, current + value)
    } else {
      const currentNet = yearlyNet.get(flow.year) ?? 0
      yearlyNet.set(flow.year, currentNet - value)
      yearlyExpense.set(flow.year, value)
    }
  }

  // Find best year (exclude current year - incomplete data)
  const currentYear = new Date().getFullYear()
  let bestYear: { year: number; netDollar: number } | null = null
  for (const [year, net] of yearlyNet.entries()) {
    if (year < currentYear && (!bestYear || net > bestYear.netDollar)) {
      bestYear = { year, netDollar: net }
    }
  }

  // Find peak expense year (exclude current)
  let peakExpenseYear: { year: number; expenseDollar: number } | null = null
  for (const [year, expense] of yearlyExpense.entries()) {
    if (year < currentYear && (!peakExpenseYear || expense > peakExpenseYear.expenseDollar)) {
      peakExpenseYear = { year, expenseDollar: expense }
    }
  }

  return {
    bestSavingsMonth: bestMonth && bestMonth.netDollar > 0 ? bestMonth : null,
    bestSavingsYear: bestYear && bestYear.netDollar > 0 ? bestYear : null,
    peakExpenseMonth: peakExpenseMonth && peakExpenseMonth.expenseDollar > 0 ? peakExpenseMonth : null,
    peakExpenseYear: peakExpenseYear && peakExpenseYear.expenseDollar > 0 ? peakExpenseYear : null,
    worstMonth,
    positiveStreak,
    currentStreak
  }
}

/**
 * Calculate streak metrics from monthly net data
 */
function calculateStreaks(monthlyNet: Map<string, number>): {
  positiveStreak: number
  currentStreak: { months: number; isPositive: boolean }
} {
  const sortedMonths = Array.from(monthlyNet.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))

  let positiveStreak = 0
  let currentPositiveStreak = 0
  let currentNegativeStreak = 0
  let lastWasPositive = true

  for (const [_month, net] of sortedMonths) {
    if (net >= 0) {
      currentPositiveStreak++
      currentNegativeStreak = 0
      lastWasPositive = true
      if (currentPositiveStreak > positiveStreak) {
        positiveStreak = currentPositiveStreak
      }
    } else {
      currentNegativeStreak++
      currentPositiveStreak = 0
      lastWasPositive = false
    }
  }

  return {
    positiveStreak,
    currentStreak: {
      months: lastWasPositive ? currentPositiveStreak : currentNegativeStreak,
      isPositive: lastWasPositive
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Cumulative Net
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get cumulative net cashflow over time (for all-time chart)
 */
export async function getCumulativeNetData(): Promise<CumulativeNetData[]> {
  const monthlyFlows = transactionRepository.listMonthlyNetTotals()

  // Build monthly net by month
  const monthlyNet = new Map<string, number>()
  for (const flow of monthlyFlows) {
    const value = centsToDollars(flow.totalCents)
    const current = monthlyNet.get(flow.month) ?? 0
    if (flow.type === 'income') {
      monthlyNet.set(flow.month, current + value)
    } else {
      monthlyNet.set(flow.month, current - value)
    }
  }

  // Sort chronologically and calculate running total
  const sortedMonths = Array.from(monthlyNet.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))

  let cumulative = 0
  const result: CumulativeNetData[] = []

  for (const [month, net] of sortedMonths) {
    cumulative += net
    result.push({
      month,
      netDollar: net,
      cumulativeDollar: cumulative
    })
  }

  return result
}
