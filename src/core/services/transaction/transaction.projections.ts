// ═══════════════════════════════════════════════════════════════════════════
// APPLICATION SERVICE: Transaction Projections
// Monthly and yearly projections based on current spending patterns.
// ═══════════════════════════════════════════════════════════════════════════

import { centsToDollars } from '@/core/domain/common/money'
import { getDaysInMonth, getYearProgressMonths } from '@/core/domain/transaction'
import { transactionRepository } from '@/infrastructure/repositories'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type MonthlyProjection = Readonly<{
  projectedExpense: number
  projectedIncome: number
  projectedSavings: number
  projectedSavingsRate: number // 0-100
  daysElapsed: number
  daysInMonth: number
  currentExpense: number
  currentIncome: number
}>

export type YearlyProjection = Readonly<{
  projectedIncome: number
  projectedExpense: number
  projectedSavings: number
  projectedSavingsRate: number // 0-100
  monthsElapsed: number // decimal (e.g., 1.5)
  currentIncome: number
  currentExpense: number
  avgMonthlyIncome: number
  avgMonthlyExpense: number
  vsLastYear: {
    lastYearSavings: number
    lastYearIncome: number
    lastYearExpense: number
    delta: number
    isMoreSaved: boolean
    incomeChangePercent: number // positive = increase
    expenseChangePercent: number // positive = increase
  } | null
}>

// ─────────────────────────────────────────────────────────────────────────────
// Monthly Projection
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Project month-end totals based on current daily averages
 */
export async function getMonthlyProjection(now = new Date()): Promise<MonthlyProjection> {
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const monthYYYYMM = `${year}-${String(month).padStart(2, '0')}`

  const daysElapsed = now.getDate()
  const daysInMonth = getDaysInMonth(year, month)

  const totals = transactionRepository.getMonthTotals(monthYYYYMM)
  const currentExpense = centsToDollars(totals.expenseCents)
  const currentIncome = centsToDollars(totals.incomeCents)

  // Handle beginning of month
  if (daysElapsed === 0) {
    return {
      projectedExpense: 0,
      projectedIncome: 0,
      projectedSavings: 0,
      projectedSavingsRate: 0,
      daysElapsed: 0,
      daysInMonth,
      currentExpense: 0,
      currentIncome: 0,
    }
  }

  // Calculate projections from daily averages
  const dailyAvgExpense = currentExpense / daysElapsed
  const dailyAvgIncome = currentIncome / daysElapsed

  const projectedExpense = Math.round(dailyAvgExpense * daysInMonth)
  const projectedIncome = Math.round(dailyAvgIncome * daysInMonth)
  const projectedSavings = projectedIncome - projectedExpense

  const projectedSavingsRate = projectedIncome > 0
    ? Math.round((projectedSavings / projectedIncome) * 100)
    : 0

  return {
    projectedExpense,
    projectedIncome,
    projectedSavings,
    projectedSavingsRate,
    daysElapsed,
    daysInMonth,
    currentExpense,
    currentIncome,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Yearly Projection
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Project year-end totals with year-over-year comparison
 */
export async function getYearlyProjection(year: number, now = new Date()): Promise<YearlyProjection> {
  const currentYear = now.getFullYear()
  const isCurrentYear = year === currentYear

  // Get YTD or full year totals
  const totals = transactionRepository.getYearTotals(year)
  const currentIncome = centsToDollars(totals.incomeCents)
  const currentExpense = centsToDollars(totals.expenseCents)

  // Calculate months elapsed for projection
  const monthsElapsed = isCurrentYear ? getYearProgressMonths(now) : 12

  // Handle early January (not enough data)
  if (monthsElapsed < 0.1) {
    return {
      projectedIncome: 0,
      projectedExpense: 0,
      projectedSavings: 0,
      projectedSavingsRate: 0,
      monthsElapsed: 0,
      currentIncome,
      currentExpense,
      avgMonthlyIncome: 0,
      avgMonthlyExpense: 0,
      vsLastYear: null,
    }
  }

  // Calculate monthly averages and projections
  const avgMonthlyIncome = currentIncome / monthsElapsed
  const avgMonthlyExpense = currentExpense / monthsElapsed

  const projectedIncome = Math.round(avgMonthlyIncome * 12)
  const projectedExpense = Math.round(avgMonthlyExpense * 12)
  const projectedSavings = projectedIncome - projectedExpense

  const projectedSavingsRate = projectedIncome > 0
    ? Math.round((projectedSavings / projectedIncome) * 100)
    : 0

  // Get last year comparison
  const vsLastYear = calculateYearOverYear(
    year,
    projectedIncome,
    projectedExpense,
    projectedSavings
  )

  return {
    projectedIncome,
    projectedExpense,
    projectedSavings,
    projectedSavingsRate,
    monthsElapsed: Math.round(monthsElapsed * 10) / 10,
    currentIncome,
    currentExpense,
    avgMonthlyIncome: Math.round(avgMonthlyIncome),
    avgMonthlyExpense: Math.round(avgMonthlyExpense),
    vsLastYear,
  }
}

/**
 * Calculate year-over-year comparison metrics
 */
function calculateYearOverYear(
  year: number,
  projectedIncome: number,
  projectedExpense: number,
  projectedSavings: number
): YearlyProjection['vsLastYear'] {
  const lastYear = year - 1
  const lastYearTotals = transactionRepository.getYearTotals(lastYear)
  const lastYearIncome = centsToDollars(lastYearTotals.incomeCents)
  const lastYearExpense = centsToDollars(lastYearTotals.expenseCents)
  const lastYearSavings = lastYearIncome - lastYearExpense

  // Only show comparison if last year has data
  if (lastYearIncome === 0 && lastYearExpense === 0) {
    return null
  }

  const delta = projectedSavings - lastYearSavings
  const incomeChangePercent = lastYearIncome > 0
    ? Math.round(((projectedIncome - lastYearIncome) / lastYearIncome) * 1000) / 10
    : 0
  const expenseChangePercent = lastYearExpense > 0
    ? Math.round(((projectedExpense - lastYearExpense) / lastYearExpense) * 1000) / 10
    : 0

  return {
    lastYearSavings,
    lastYearIncome,
    lastYearExpense,
    delta: Math.abs(delta),
    isMoreSaved: delta >= 0,
    incomeChangePercent,
    expenseChangePercent,
  }
}
