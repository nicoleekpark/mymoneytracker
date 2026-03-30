// ═══════════════════════════════════════════════════════════════════════════
// APPLICATION SERVICE: Transaction Aggregations
// Monthly, yearly, and all-time summary calculations.
// ═══════════════════════════════════════════════════════════════════════════

import { FIXED_CATEGORY_KEYS } from '@/shared/config/categories.config'
import type { UUID } from '@/core/domain/common/uuid'
import type { CategoryRef } from '@/core/domain/category'
import { centsToDollars } from '@/core/domain/common/money'
import { currentMonthYYYYMM } from '@/core/domain/transaction'
import { transactionRepository } from '@/infrastructure/repositories'

// ─────────────────────────────────────────────────────────────────────────────
// Monthly Aggregation Types
// ─────────────────────────────────────────────────────────────────────────────

export type MonthlyExpenseTotalDollar = Readonly<{
  month: string
  totalDollar: number
}>

export type MonthlySummaryDollar = Readonly<{
  month: string // YYYY-MM
  expenseTotalDollar: number
  incomeTotalDollar: number
  netCashFlowDollar: number // income - expense
}>

export type DailyExpenseTotalDollar = Readonly<{
  day: string // YYYY-MM-DD
  totalDollar: number
}>

export type MonthlyExpenseByCategoryDollar = Readonly<{
  categoryId: UUID | null
  categoryName: string | null
  category?: CategoryRef
  totalDollar: number
}>

export type MonthlyIncomeByCategoryDollar = Readonly<{
  categoryId: UUID | null
  category?: CategoryRef
  totalDollar: number
}>

export type DailyFlowDollar = Readonly<{
  day: string
  incomeDollar: number
  expenseDollar: number
  variableExpenseDollar: number // Excludes fixed costs (housing, subscriptions)
  txCount: number
}>

// ─────────────────────────────────────────────────────────────────────────────
// Monthly Aggregations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get expense total for current month (in dollars)
 */
export async function getThisMonthExpenseTotalDollar(now = new Date()): Promise<number> {
  const month = currentMonthYYYYMM(now)
  const totalCents = transactionRepository.getExpenseTotalForMonth(month)
  return centsToDollars(totalCents)
}

/**
 * Get expense totals by month (up to limitMonths)
 */
export async function getMonthlyExpenseTotalsDollar(limitMonths = 24): Promise<MonthlyExpenseTotalDollar[]> {
  const totals = transactionRepository.listMonthlyExpenseTotals(limitMonths)
  return totals.map((t) => ({
    month: t.month,
    totalDollar: centsToDollars(t.totalCents)
  }))
}

/**
 * Get complete monthly summary (income, expense, net)
 */
export async function getMonthlySummaryDollar(monthYYYYMM: string): Promise<MonthlySummaryDollar> {
  const expenseCents = transactionRepository.getExpenseTotalForMonth(monthYYYYMM)
  const incomeCents = transactionRepository.getIncomeTotalForMonth(monthYYYYMM)

  const expense = centsToDollars(expenseCents)
  const income = centsToDollars(incomeCents)

  return {
    month: monthYYYYMM,
    expenseTotalDollar: expense,
    incomeTotalDollar: income,
    netCashFlowDollar: income - expense,
  }
}

/**
 * Get daily expense breakdown for a month
 */
export async function getDailyExpenseTotalsDollarForMonth(monthYYYYMM: string): Promise<DailyExpenseTotalDollar[]> {
  const rows = transactionRepository.listDailyExpenseTotalsForMonth(monthYYYYMM)
  return rows.map((r) => ({
    day: r.day,
    totalDollar: centsToDollars(r.totalCents)
  }))
}

/**
 * Get expense breakdown by category for a month
 */
export async function getMonthlyExpenseByCategoryDollar(monthYYYYMM: string): Promise<MonthlyExpenseByCategoryDollar[]> {
  const rows = transactionRepository.listMonthlyExpenseByCategory(monthYYYYMM)
  return rows.map((r) => ({
    categoryId: r.categoryId,
    categoryName: r.categoryName,
    totalDollar: centsToDollars(r.totalCents)
  }))
}

/**
 * Get income breakdown by category for a month
 */
export async function getMonthlyIncomeByCategoryDollar(monthYYYYMM: string): Promise<MonthlyIncomeByCategoryDollar[]> {
  const rows = transactionRepository.listMonthlyIncomeByCategory(monthYYYYMM)
  return rows.map((r) => ({
    categoryId: r.categoryId,
    totalDollar: centsToDollars(r.totalCents)
  }))
}

/**
 * Get daily income/expense flow with variable expense breakdown
 */
export async function getDailyFlowDollarForMonth(monthYYYYMM: string): Promise<DailyFlowDollar[]> {
  const rows = transactionRepository.listDailyFlowTotalsWithCountForMonth(monthYYYYMM)
  const variableRows = transactionRepository.listDailyVariableExpenseForMonth(monthYYYYMM, FIXED_CATEGORY_KEYS)

  // Build variable expense lookup
  const variableByDay = new Map<string, number>()
  for (const r of variableRows) {
    variableByDay.set(r.day, centsToDollars(r.totalCents))
  }

  // Aggregate by day
  const byDay = new Map<string, { income: number; expense: number; variable: number; count: number }>()
  for (const r of rows) {
    const cur = byDay.get(r.day) ?? { income: 0, expense: 0, variable: 0, count: 0 }
    const val = centsToDollars(r.totalCents)

    if (r.type === 'income') cur.income = val
    if (r.type === 'expense') {
      cur.expense = val
      cur.variable = variableByDay.get(r.day) ?? 0
    }

    cur.count += r.txCount
    byDay.set(r.day, cur)
  }

  return Array.from(byDay.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, v]) => ({
      day,
      incomeDollar: v.income,
      expenseDollar: v.expense,
      variableExpenseDollar: v.variable,
      txCount: v.count
    }))
}

// ─────────────────────────────────────────────────────────────────────────────
// Yearly Aggregation Types
// ─────────────────────────────────────────────────────────────────────────────

export type MonthlyFlowDollar = Readonly<{
  month: string // YYYY-MM
  incomeDollar: number
  expenseDollar: number
}>

export type YearlyExpenseByCategoryDollar = Readonly<{
  categoryId: UUID | null
  totalDollar: number
}>

export type YearlyIncomeByCategoryDollar = Readonly<{
  categoryId: UUID | null
  totalDollar: number
}>

export type YearlyFlowDollar = Readonly<{
  year: number
  incomeDollar: number
  expenseDollar: number
}>

// ─────────────────────────────────────────────────────────────────────────────
// Yearly Aggregations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get monthly income/expense totals for a year
 */
export async function getMonthlyFlowDollarForYear(year: number): Promise<MonthlyFlowDollar[]> {
  const rows = transactionRepository.listMonthlyFlowTotalsForYear(year)

  const byMonth = new Map<string, { income: number; expense: number }>()
  for (const r of rows) {
    const cur = byMonth.get(r.month) ?? { income: 0, expense: 0 }
    const val = centsToDollars(r.totalCents)

    if (r.type === 'income') cur.income = val
    if (r.type === 'expense') cur.expense = val

    byMonth.set(r.month, cur)
  }

  return Array.from(byMonth.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, v]) => ({
      month,
      incomeDollar: v.income,
      expenseDollar: v.expense
    }))
}

/**
 * Get expense breakdown by category for a year
 */
export async function getYearlyExpenseByCategoryDollar(year: number): Promise<YearlyExpenseByCategoryDollar[]> {
  const rows = transactionRepository.listYearlyExpenseByCategory(year)
  return rows.map((r) => ({
    categoryId: r.categoryId,
    totalDollar: centsToDollars(r.totalCents)
  }))
}

/**
 * Get income breakdown by category for a year
 */
export async function getYearlyIncomeByCategoryDollar(year: number): Promise<YearlyIncomeByCategoryDollar[]> {
  const rows = transactionRepository.listYearlyIncomeByCategory(year)
  return rows.map((r) => ({
    categoryId: r.categoryId,
    totalDollar: centsToDollars(r.totalCents)
  }))
}

/**
 * Get yearly income/expense totals for all years
 */
export async function getYearlyFlowTotalsDollar(): Promise<YearlyFlowDollar[]> {
  const rows = transactionRepository.listYearlyFlowTotals()

  const byYear = new Map<number, { income: number; expense: number }>()
  for (const r of rows) {
    const cur = byYear.get(r.year) ?? { income: 0, expense: 0 }
    const val = centsToDollars(r.totalCents)

    if (r.type === 'income') cur.income = val
    if (r.type === 'expense') cur.expense = val

    byYear.set(r.year, cur)
  }

  return Array.from(byYear.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([year, v]) => ({
      year,
      incomeDollar: v.income,
      expenseDollar: v.expense
    }))
}

// ─────────────────────────────────────────────────────────────────────────────
// All-Time Aggregation Types
// ─────────────────────────────────────────────────────────────────────────────

export type AllTimeSummaryDollar = Readonly<{
  expenseTotalDollar: number
  incomeTotalDollar: number
  netCashFlowDollar: number
}>

export type AllTimeExpenseByCategoryDollar = Readonly<{
  categoryId: UUID | null
  totalDollar: number
}>

export type AllTimeIncomeByCategoryDollar = Readonly<{
  categoryId: UUID | null
  totalDollar: number
}>

// ─────────────────────────────────────────────────────────────────────────────
// All-Time Aggregations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all-time income/expense summary
 */
export async function getAllTimeSummaryDollar(): Promise<AllTimeSummaryDollar> {
  const expenseCents = transactionRepository.getAllTimeExpenseTotal()
  const incomeCents = transactionRepository.getAllTimeIncomeTotal()

  const expense = centsToDollars(expenseCents)
  const income = centsToDollars(incomeCents)

  return {
    expenseTotalDollar: expense,
    incomeTotalDollar: income,
    netCashFlowDollar: income - expense,
  }
}

/**
 * Get all-time expense breakdown by category
 */
export async function getAllTimeExpenseByCategoryDollar(): Promise<AllTimeExpenseByCategoryDollar[]> {
  const rows = transactionRepository.listAllTimeExpenseByCategory()
  return rows.map((r) => ({
    categoryId: r.categoryId,
    totalDollar: centsToDollars(r.totalCents)
  }))
}

/**
 * Get all-time income breakdown by category
 */
export async function getAllTimeIncomeByCategoryDollar(): Promise<AllTimeIncomeByCategoryDollar[]> {
  const rows = transactionRepository.listAllTimeIncomeByCategory()
  return rows.map((r) => ({
    categoryId: r.categoryId,
    totalDollar: centsToDollars(r.totalCents)
  }))
}

/**
 * Get date of first transaction ever recorded
 */
export async function getFirstTransactionDate(): Promise<Date | null> {
  const dateStr = transactionRepository.getFirstTransactionDate()
  if (!dateStr) return null
  return new Date(dateStr)
}

/**
 * Get count of distinct months with transactions
 */
export async function getDistinctMonthCount(): Promise<number> {
  return transactionRepository.countDistinctMonths()
}

// ─────────────────────────────────────────────────────────────────────────────
// Account Activity Types
// ─────────────────────────────────────────────────────────────────────────────

export type AccountActivityDollar = Readonly<{
  accountId: UUID
  expenseDollar: number
  incomeDollar: number
  transferOutDollar: number
  transferInDollar: number
  transactionCount: number
}>

// ─────────────────────────────────────────────────────────────────────────────
// Account Activity Aggregations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get account activity for a specific month
 */
export function getAccountActivityForMonth(monthYYYYMM: string): AccountActivityDollar[] {
  const rows = transactionRepository.listAccountActivityForMonth(monthYYYYMM)
  return rows.map((r) => ({
    accountId: r.accountId,
    expenseDollar: centsToDollars(r.expenseCents),
    incomeDollar: centsToDollars(r.incomeCents),
    transferOutDollar: centsToDollars(r.transferOutCents),
    transferInDollar: centsToDollars(r.transferInCents),
    transactionCount: r.transactionCount,
  }))
}

/**
 * Get account activity for a specific year
 */
export function getAccountActivityForYear(year: number): AccountActivityDollar[] {
  const rows = transactionRepository.listAccountActivityForYear(year)
  return rows.map((r) => ({
    accountId: r.accountId,
    expenseDollar: centsToDollars(r.expenseCents),
    incomeDollar: centsToDollars(r.incomeCents),
    transferOutDollar: centsToDollars(r.transferOutCents),
    transferInDollar: centsToDollars(r.transferInCents),
    transactionCount: r.transactionCount,
  }))
}

/**
 * Get account activity all time
 */
export function getAccountActivityAllTime(): AccountActivityDollar[] {
  const rows = transactionRepository.listAccountActivityAllTime()
  return rows.map((r) => ({
    accountId: r.accountId,
    expenseDollar: centsToDollars(r.expenseCents),
    incomeDollar: centsToDollars(r.incomeCents),
    transferOutDollar: centsToDollars(r.transferOutCents),
    transferInDollar: centsToDollars(r.transferInCents),
    transactionCount: r.transactionCount,
  }))
}

/**
 * Get account balance before a specific date (in dollars)
 */
export function getAccountBalanceBeforeDate(accountId: UUID, dateYYYYMMDD: string): number {
  const balanceCents = transactionRepository.getAccountBalanceBeforeDate(accountId, dateYYYYMMDD)
  return centsToDollars(balanceCents)
}

/**
 * Get account balance at end of month (in dollars)
 */
export function getAccountBalanceAtEndOfMonth(accountId: UUID, monthYYYYMM: string): number {
  const balanceCents = transactionRepository.getAccountBalanceAtEndOfMonth(accountId, monthYYYYMM)
  return centsToDollars(balanceCents)
}
