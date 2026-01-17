import type { CategoryIndex } from '@/config/categories.index'
import { uuid } from '@/lib/platform/uuid'

import type { CategoryRef } from '@/domain/category'
import type { UUID } from '@/domain/common/uuid'

import { centsToDollars } from '@/domain/common/money'
import { createTransaction } from './transaction.model'
import {
  deleteTransaction,
  getExpenseTotalForMonth,
  insertTransaction,
  listMonthlyExpenseTotals,
  listTransactions
} from './transaction.repo'
import type { Transaction, TransactionType } from './transaction.types'

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
  input: {
    key?: string
    occurredAt?: Date
    type: TransactionType
    item: string
    amount: number
    accountId: UUID
    category?: CategoryRef
    merchant?: string
    note?: string
  }
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

  const tx: Transaction = createTransaction(categoryIndex, {
    id: uuid(),
    key: txKey,
    occurredAt,
    type: input.type ?? 'expense',
    item: input.item,
    money: { amount: input.amount, currency: 'USD' },
    accountId: input.accountId,
    category: input.category,
    merchant: input.merchant?.trim() || undefined,
    note: input.note?.trim() || undefined
  })

  insertTransaction(tx)
  return tx
}

export async function getTransactions(limit = 200): Promise<Transaction[]> {
  return listTransactions(limit)
}

export async function removeTransaction(id: UUID): Promise<void> {
  deleteTransaction(id)
}

export async function getThisMonthExpenseTotalDollar(now = new Date()): Promise<number> {
  const month = currentMonthYYYYMM(now)
  const totalCents = getExpenseTotalForMonth(month)

  return centsToDollars(totalCents)
}

export type MonthlyExpenseTotalDollar = Readonly<{
  month: string
  totalDollar: number
}>

export async function getMonthlyExpenseTotalsDollar(limitMonths = 24): Promise<MonthlyExpenseTotalDollar[]> {
  const totals = listMonthlyExpenseTotals(limitMonths)
  return totals.map((t) => ({
    month: t.month,
    totalDollar: centsToDollars(t.totalCents)
  }))
}