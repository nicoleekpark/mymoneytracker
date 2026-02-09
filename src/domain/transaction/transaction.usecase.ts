import type { CategoryIndex } from '@/config/categories.index'
import { uuid } from '@/shared/utils/uuid'

import type { UUID } from '@/domain/common/uuid'

import type { CategoryRef } from '@/domain/category'
import { centsToDollars } from '@/domain/common/money'
import { transactionRepository } from '@/infrastructure/repositories'
import { createTransaction } from './transaction.model'
import type { AddTransactionInput, Transaction, TransactionType } from './transaction.types'

function currentMonthYYYYMM(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]+/g, '')
    .slice(0, 24)
}

function buildTxKey(args: {
  occurredAt: Date
  type: TransactionType
  item?: string
  merchant?: string
}): string {
  const ts = args.occurredAt.toISOString() // includes milliseconds + Z
  const item = slugify(args.item || 'item')
  const merch = args.merchant ? slugify(args.merchant) : 'na'
  const suffix = uuid().replace(/-/g, '').slice(0, 8) // random-ish, short
  // example: tx:2026-01-14T22:10:12.123Z:expense:coffee:blue_bottle:a1b2c3d4
  return `tx:${ts}:${args.type}:${item}:${merch}:${suffix}`
}

// TODO: receipt image
export async function addTransaction(
  categoryIndex: CategoryIndex,
  input: AddTransactionInput
): Promise<Transaction> {
  const occurredAt = input.occurredAt ?? new Date()

  const txKey =
    (input.key && input.key.trim().length > 0)
      ? input.key.trim()
      : buildTxKey({
          occurredAt,
          type: input.type,
          item: input.item,
          merchant: input.merchant
        })

  const base = {
    id: uuid(),
    key: txKey,
    occurredAt,
    type: input.type,
    item: input.item,
    money: { amount: input.amount, currency: 'USD' },
    merchant: input.merchant?.trim(),
    note: input.note?.trim(),
    category: input.category,
  }

  const tx: Transaction =
    input.type === 'transfer'
      ? createTransaction(categoryIndex, {
          ...base,
          type: 'transfer',
          fromAccountId: input.fromAccountId,
          toAccountId: input.toAccountId,
        })
      : createTransaction(categoryIndex, {
          ...base,
          type: input.type,
          accountId: input.accountId,
        })
        
  transactionRepository.insert(tx)
  return tx
}

export async function getTransactions(limit = 200): Promise<Transaction[]> {
  return transactionRepository.list(limit)
}

export async function getTransactionsForDate(dateYYYYMMDD: string, limit = 50): Promise<Transaction[]> {
  return transactionRepository.listForDate(dateYYYYMMDD, limit)
}

export async function removeTransaction(id: UUID): Promise<void> {
  transactionRepository.delete(id)
}

export async function getThisMonthExpenseTotalDollar(now = new Date()): Promise<number> {
  const month = currentMonthYYYYMM(now)
  const totalCents = transactionRepository.getExpenseTotalForMonth(month)

  return centsToDollars(totalCents)
}

export type MonthlyExpenseTotalDollar = Readonly<{
  month: string
  totalDollar: number
}>

export async function getMonthlyExpenseTotalsDollar(limitMonths = 24): Promise<MonthlyExpenseTotalDollar[]> {
  const totals = transactionRepository.listMonthlyExpenseTotals(limitMonths)
  return totals.map((t) => ({
    month: t.month,
    totalDollar: centsToDollars(t.totalCents)
  }))
}

export type MonthlySummaryDollar = Readonly<{
  month: string // YYYY-MM
  expenseTotalDollar: number
  incomeTotalDollar: number
  netCashFlowDollar: number // income - expense
}>

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

export type DailyExpenseTotalDollar = Readonly<{
  day: string // YYYY-MM-DD
  totalDollar: number
}>

export async function getDailyExpenseTotalsDollarForMonth(monthYYYYMM: string): Promise<DailyExpenseTotalDollar[]> {
  const rows = transactionRepository.listDailyExpenseTotalsForMonth(monthYYYYMM)
  return rows.map((r) => ({
    day: r.day,
    totalDollar: centsToDollars(r.totalCents)
  }))
}

export type MonthlyExpenseByCategoryDollar = Readonly<{
  categoryId: UUID | null
  category?: CategoryRef
  totalDollar: number
}>

export async function getMonthlyExpenseByCategoryDollar(monthYYYYMM: string): Promise<MonthlyExpenseByCategoryDollar[]> {
  const rows = transactionRepository.listMonthlyExpenseByCategory(monthYYYYMM)
  return rows.map((r) => ({
    categoryId: r.categoryId,
    totalDollar: centsToDollars(r.totalCents)
  }))
}

export type MonthlyIncomeByCategoryDollar = Readonly<{
  categoryId: UUID | null
  category?: CategoryRef
  totalDollar: number
}>

export async function getMonthlyIncomeByCategoryDollar(monthYYYYMM: string): Promise<MonthlyIncomeByCategoryDollar[]> {
  const rows = transactionRepository.listMonthlyIncomeByCategory(monthYYYYMM)
  return rows.map((r) => ({
    categoryId: r.categoryId,
    totalDollar: centsToDollars(r.totalCents)
  }))
}

export async function getTransfersForMonth(monthYYYYMM: string, limit = 500): Promise<Transaction[]> {
  return transactionRepository.listTransfersForMonth(monthYYYYMM, limit)
}

export type DailyFlowDollar = Readonly<{
  day: string
  incomeDollar: number
  expenseDollar: number
  txCount: number // income+expense 합산 건수
}>

export async function getDailyFlowDollarForMonth(monthYYYYMM: string): Promise<DailyFlowDollar[]> {
  const rows = transactionRepository.listDailyFlowTotalsWithCountForMonth(monthYYYYMM)

  const byDay = new Map<string, { income: number; expense: number; count: number }>()
  for (const r of rows) {
    const cur = byDay.get(r.day) ?? { income: 0, expense: 0, count: 0 }
    const val = centsToDollars(r.totalCents)

    if (r.type === 'income') cur.income = val
    if (r.type === 'expense') cur.expense = val

    cur.count += r.txCount
    byDay.set(r.day, cur)
  }

  return Array.from(byDay.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, v]) => ({
      day,
      incomeDollar: v.income,
      expenseDollar: v.expense,
      txCount: v.count
    }))
}

// ─────────────────────────────────────────────────────────────────────────────
// Yearly aggregations
// ─────────────────────────────────────────────────────────────────────────────

export type MonthlyFlowDollar = Readonly<{
  month: string // YYYY-MM
  incomeDollar: number
  expenseDollar: number
}>

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

export type YearlyExpenseByCategoryDollar = Readonly<{
  categoryId: UUID | null
  totalDollar: number
}>

export async function getYearlyExpenseByCategoryDollar(year: number): Promise<YearlyExpenseByCategoryDollar[]> {
  const rows = transactionRepository.listYearlyExpenseByCategory(year)
  return rows.map((r) => ({
    categoryId: r.categoryId,
    totalDollar: centsToDollars(r.totalCents)
  }))
}

export type YearlyIncomeByCategoryDollar = Readonly<{
  categoryId: UUID | null
  totalDollar: number
}>

export async function getYearlyIncomeByCategoryDollar(year: number): Promise<YearlyIncomeByCategoryDollar[]> {
  const rows = transactionRepository.listYearlyIncomeByCategory(year)
  return rows.map((r) => ({
    categoryId: r.categoryId,
    totalDollar: centsToDollars(r.totalCents)
  }))
}

// ─────────────────────────────────────────────────────────────────────────────
// All-time aggregations
// ─────────────────────────────────────────────────────────────────────────────

export type AllTimeSummaryDollar = Readonly<{
  expenseTotalDollar: number
  incomeTotalDollar: number
  netCashFlowDollar: number
}>

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

export type AllTimeExpenseByCategoryDollar = Readonly<{
  categoryId: UUID | null
  totalDollar: number
}>

export async function getAllTimeExpenseByCategoryDollar(): Promise<AllTimeExpenseByCategoryDollar[]> {
  const rows = transactionRepository.listAllTimeExpenseByCategory()
  return rows.map((r) => ({
    categoryId: r.categoryId,
    totalDollar: centsToDollars(r.totalCents)
  }))
}

export type AllTimeIncomeByCategoryDollar = Readonly<{
  categoryId: UUID | null
  totalDollar: number
}>

export async function getAllTimeIncomeByCategoryDollar(): Promise<AllTimeIncomeByCategoryDollar[]> {
  const rows = transactionRepository.listAllTimeIncomeByCategory()
  return rows.map((r) => ({
    categoryId: r.categoryId,
    totalDollar: centsToDollars(r.totalCents)
  }))
}

export async function getFirstTransactionDate(): Promise<Date | null> {
  const dateStr = transactionRepository.getFirstTransactionDate()
  if (!dateStr) return null
  return new Date(dateStr)
}

export async function getDistinctMonthCount(): Promise<number> {
  return transactionRepository.countDistinctMonths()
}

// ─────────────────────────────────────────────────────────────────────────────
// Personal Bests
// ─────────────────────────────────────────────────────────────────────────────

export type PersonalBests = Readonly<{
  bestSavingsMonth: { month: string; netDollar: number } | null
  bestSavingsYear: { year: number; netDollar: number } | null
  peakExpenseMonth: { month: string; expenseDollar: number } | null
  peakExpenseYear: { year: number; expenseDollar: number } | null
  // New metrics
  worstMonth: { month: string; netDollar: number } | null
  positiveStreak: number // longest consecutive positive-net months
  currentStreak: { months: number; isPositive: boolean } // ongoing streak
}>

export async function getPersonalBests(): Promise<PersonalBests> {
  const monthlyFlows = transactionRepository.listMonthlyNetTotals()
  const yearlyFlows = transactionRepository.listYearlyFlowTotals()

  // Calculate monthly net and expense
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

  // Find best savings month and worst month
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

  // Calculate streaks (positive net months)
  // Sort months chronologically
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

  // Current streak is the ongoing one at the end
  const currentStreak = {
    months: lastWasPositive ? currentPositiveStreak : currentNegativeStreak,
    isPositive: lastWasPositive
  }

  // Calculate yearly net and expense
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

  // Find best year (exclude current year - it's incomplete)
  const currentYear = new Date().getFullYear()
  let bestYear: { year: number; netDollar: number } | null = null
  for (const [year, net] of yearlyNet.entries()) {
    if (year < currentYear && (!bestYear || net > bestYear.netDollar)) {
      bestYear = { year, netDollar: net }
    }
  }

  // Find peak expense year (exclude current year)
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

export type YearlyFlowDollar = Readonly<{
  year: number
  incomeDollar: number
  expenseDollar: number
}>

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
// Cumulative Net (for All-time chart)
// ─────────────────────────────────────────────────────────────────────────────

export type CumulativeNetData = Readonly<{
  month: string // YYYY-MM
  netDollar: number // monthly net
  cumulativeDollar: number // running total
}>

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

  // Sort by month and calculate cumulative
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

// ─────────────────────────────────────────────────────────────────────────────
// Projections
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

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export async function getMonthlyProjection(now = new Date()): Promise<MonthlyProjection> {
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // 1-indexed
  const monthYYYYMM = `${year}-${String(month).padStart(2, '0')}`

  const daysElapsed = now.getDate()
  const daysInMonth = getDaysInMonth(year, month)

  const totals = transactionRepository.getMonthTotals(monthYYYYMM)
  const currentExpense = centsToDollars(totals.expenseCents)
  const currentIncome = centsToDollars(totals.incomeCents)

  // Avoid division by zero
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

function getMonthsElapsed(now: Date): number {
  const completedMonths = now.getMonth() // 0-indexed (Jan = 0)
  const currentDay = now.getDate()
  const daysInMonth = getDaysInMonth(now.getFullYear(), now.getMonth() + 1)
  return completedMonths + (currentDay / daysInMonth)
}

export async function getYearlyProjection(year: number, now = new Date()): Promise<YearlyProjection> {
  const currentYear = now.getFullYear()
  const isCurrentYear = year === currentYear

  // Get YTD or full year totals
  const totals = transactionRepository.getYearTotals(year)
  const currentIncome = centsToDollars(totals.incomeCents)
  const currentExpense = centsToDollars(totals.expenseCents)

  // Calculate months elapsed
  const monthsElapsed = isCurrentYear ? getMonthsElapsed(now) : 12

  // Avoid division by zero (early January)
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

  const avgMonthlyIncome = currentIncome / monthsElapsed
  const avgMonthlyExpense = currentExpense / monthsElapsed

  const projectedIncome = Math.round(avgMonthlyIncome * 12)
  const projectedExpense = Math.round(avgMonthlyExpense * 12)
  const projectedSavings = projectedIncome - projectedExpense

  const projectedSavingsRate = projectedIncome > 0
    ? Math.round((projectedSavings / projectedIncome) * 100)
    : 0

  // Get last year comparison
  let vsLastYear: YearlyProjection['vsLastYear'] = null
  const lastYear = year - 1
  const lastYearTotals = transactionRepository.getYearTotals(lastYear)
  const lastYearIncome = centsToDollars(lastYearTotals.incomeCents)
  const lastYearExpense = centsToDollars(lastYearTotals.expenseCents)
  const lastYearSavings = lastYearIncome - lastYearExpense

  // Only show comparison if last year has data
  if (lastYearIncome > 0 || lastYearExpense > 0) {
    const delta = projectedSavings - lastYearSavings
    const incomeChangePercent = lastYearIncome > 0
      ? Math.round(((projectedIncome - lastYearIncome) / lastYearIncome) * 1000) / 10
      : 0
    const expenseChangePercent = lastYearExpense > 0
      ? Math.round(((projectedExpense - lastYearExpense) / lastYearExpense) * 1000) / 10
      : 0
    vsLastYear = {
      lastYearSavings,
      lastYearIncome,
      lastYearExpense,
      delta: Math.abs(delta),
      isMoreSaved: delta >= 0,
      incomeChangePercent,
      expenseChangePercent,
    }
  }

  return {
    projectedIncome,
    projectedExpense,
    projectedSavings,
    projectedSavingsRate,
    monthsElapsed: Math.round(monthsElapsed * 10) / 10, // 1 decimal
    currentIncome,
    currentExpense,
    avgMonthlyIncome: Math.round(avgMonthlyIncome),
    avgMonthlyExpense: Math.round(avgMonthlyExpense),
    vsLastYear,
  }
}
