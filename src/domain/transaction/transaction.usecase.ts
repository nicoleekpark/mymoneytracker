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

  // Find best savings month
  let bestMonth: { month: string; netDollar: number } | null = null
  for (const [month, net] of monthlyNet.entries()) {
    if (!bestMonth || net > bestMonth.netDollar) {
      bestMonth = { month, netDollar: net }
    }
  }

  // Find peak expense month
  let peakExpenseMonth: { month: string; expenseDollar: number } | null = null
  for (const [month, expense] of monthlyExpense.entries()) {
    if (!peakExpenseMonth || expense > peakExpenseMonth.expenseDollar) {
      peakExpenseMonth = { month, expenseDollar: expense }
    }
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
    peakExpenseYear: peakExpenseYear && peakExpenseYear.expenseDollar > 0 ? peakExpenseYear : null
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
