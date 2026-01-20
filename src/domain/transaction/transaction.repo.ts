// src/domain/transaction/transaction.repo.ts
import { centsToDollars, dollarsToCents } from '@/domain/common/money'
import type { UUID } from '@/domain/common/uuid'
import { exec, queryAll } from '@/lib/db/sqlite'

import { resolveCategoryId, resolveCategoryRefFromDbId } from '@/domain/category/category.repo'
import type { Transaction, TransactionType } from './transaction.types'


type TransactionRow = Readonly<{
  id: UUID
  key: string
  occurred_at: string
  type: TransactionType
  item: string

  amount_cents: number
  currency: string

  account_id: UUID | null
  from_account_id: UUID | null
  to_account_id: UUID | null

  category_id: UUID | null
  merchant: string | null
  note: string | null
}>

type MonthlyTotalRow = Readonly<{
  month: string
  total_cents: number
}>

export type MonthlyExpenseTotal = Readonly<{
  month: string
  totalCents: number
}>

function rowToTransaction(row: TransactionRow): Transaction {
  const base = {
    id: row.id,
    key: row.key,
    occurredAt: new Date(row.occurred_at),
    type: row.type,
    item: row.item,
    money: { amount: centsToDollars(row.amount_cents), currency: row.currency },
    category: row.category_id ? resolveCategoryRefFromDbId(row.category_id) : undefined,
    merchant: row.merchant ?? undefined,
    note: row.note ?? undefined,
  } as const

  if (row.type === 'transfer') {
    return {
      ...base,
      type: 'transfer',
      fromAccountId: row.from_account_id as UUID,
      toAccountId: row.to_account_id as UUID,
    }
  }

  return {
    ...base,
    type: row.type,
    accountId: row.account_id as UUID,
  }
}

function transactionToRow(tx: Transaction): TransactionRow {
  const base = {
    id: tx.id,
    key: tx.key,
    occurred_at: tx.occurredAt.toISOString(),
    type: tx.type,
    item: tx.item,
    amount_cents: dollarsToCents(tx.money.amount),
    currency: tx.money.currency,
    category_id: resolveCategoryId(tx.category) ?? null,
    merchant: tx.merchant ?? null,
    note: tx.note ?? null,
  }

  if (tx.type === 'transfer') {
    return {
      ...base,
      account_id: null,
      from_account_id: tx.fromAccountId,
      to_account_id: tx.toAccountId,
    }
  }

  return {
    ...base,
    account_id: tx.accountId,
    from_account_id: null,
    to_account_id: null,
  }
}

export function insertTransaction(tx: Transaction): void {
  const row = transactionToRow(tx)
  const now = new Date().toISOString()

  exec(
    `
    INSERT INTO transactions (
      id, key, occurred_at, type, item,
      amount_cents, currency,
      account_id, from_account_id, to_account_id,
      category_id, merchant, note,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      row.id,
      row.key,
      row.occurred_at,
      row.type,
      row.item,
      row.amount_cents,
      row.currency,
      row.account_id,
      row.category_id,
      row.merchant,
      row.note,
      row.from_account_id,
      row.to_account_id,
      now,
      now,
    ]
  )
}

export function listTransactions(limit = 200): Transaction[] {
  const rows = queryAll<TransactionRow>(
    `
    SELECT
      id, key, occurred_at, type, item, amount_cents, currency,
      account_id, category_id, merchant, note,
      from_account_id, to_account_id
    FROM transactions
    ORDER BY occurred_at DESC, id DESC
    LIMIT ?;
    `,
    [limit]
  )
  return rows.map(rowToTransaction)
}

export function deleteTransaction(id: UUID): void {
  exec(`DELETE FROM transactions WHERE id = ?`, [id])
}

export function getExpenseTotalForMonth(monthYYYYMM: string): number {
  const rows = queryAll<{ total_cents: number }>(
    `
    SELECT COALESCE(SUM(amount_cents), 0) AS total_cents
    FROM transactions
    WHERE type = 'expense'
      AND substr(occurred_at, 1, 7) = ?;
    `,
    [monthYYYYMM]
  )
  return Number(rows[0]?.total_cents ?? 0)
}

export function listMonthlyExpenseTotals(limitMonths = 24): MonthlyExpenseTotal[] {
  const rows = queryAll<MonthlyTotalRow>(
    `
    SELECT
      substr(occurred_at, 1, 7) AS month,
      COALESCE(SUM(amount_cents), 0) AS total_cents
    FROM transactions
    WHERE type = 'expense'
    GROUP BY month
    ORDER BY month DESC
    LIMIT ?;
    `,
    [limitMonths]
  )

  return rows.map((r) => ({
    month: r.month,
    totalCents: Number(r.total_cents ?? 0)
  }))
}

export function getIncomeTotalForMonth(monthYYYYMM: string): number {
  const rows = queryAll<{ total_cents: number }>(
  `
    SELECT COALESCE(SUM(amount_cents), 0) AS total_cents
    FROM transactions
    WHERE type = 'income'
      AND substr(occurred_at, 1, 7) = ?;
    `,
    [monthYYYYMM]
  )
  return Number(rows[0]?.total_cents ?? 0)
}

export type DailyTotalRow = Readonly<{
  day: string // YYYY-MM-DD
  total_cents: number
}>

export type DailyExpenseTotal = Readonly<{
  day: string
  totalCents: number
}>

export function listDailyExpenseTotalsForMonth(monthYYYYMM: string): DailyExpenseTotal[] {
  const rows = queryAll<DailyTotalRow>(
    `
    SELECT
      substr(occurred_at, 1, 10) AS day,
      COALESCE(SUM(amount_cents), 0) AS total_cents
    FROM transactions
    WHERE type = 'expense'
      AND substr(occurred_at, 1, 7) = ?
    GROUP BY day
    ORDER BY day ASC;
    `,
    [monthYYYYMM]
  )

  return rows.map((r) => ({
    day: r.day,
    totalCents: Number(r.total_cents ?? 0)
  }))
}

export type CategoryMonthlyTotalRow = Readonly<{
  category_id: UUID | null
  total_cents: number
}>

export type MonthlyExpenseByCategory = Readonly<{
  categoryId: UUID | null
  totalCents: number
}>

// expenses by category (expense only)
export function listMonthlyExpenseByCategory(monthYYYYMM: string): MonthlyExpenseByCategory[] {
  const rows = queryAll<CategoryMonthlyTotalRow>(
    `
    SELECT
      category_id,
      COALESCE(SUM(amount_cents), 0) AS total_cents
    FROM transactions
    WHERE type = 'expense'
      AND substr(occurred_at, 1, 7) = ?
    GROUP BY category_id
    ORDER BY total_cents DESC;
    `,
    [monthYYYYMM]
  )

  return rows.map((r) => ({
    categoryId: r.category_id ?? null,
    totalCents: Number(r.total_cents ?? 0)
  }))
}

// transfers list for month (transfer only)
export function listTransfersForMonth(monthYYYYMM: string, limit = 500): Transaction[] {
  const rows = queryAll<TransactionRow>(
    `
    SELECT
      id, key, occurred_at, type, item, amount_cents, currency,
      account_id, from_account_id, to_account_id,
      category_id, merchant, note
    FROM transactions
    WHERE type = 'transfer'
      AND substr(occurred_at, 1, 7) = ?
    ORDER BY occurred_at DESC, id DESC
    LIMIT ?;
    `,
    [monthYYYYMM, limit]
  )
  return rows.map(rowToTransaction)
}