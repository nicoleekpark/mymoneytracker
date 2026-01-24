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
  item: string
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
