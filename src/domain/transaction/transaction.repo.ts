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
  amount_cents: number
  currency: string
  account_id: UUID
  category_id: UUID | null
  merchant: string | null
  note: string | null
  item: string
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
  return {
    id: row.id,
    key: row.key,
    occurredAt: new Date(row.occurred_at),
    type: row.type,
    item: row.item,
    money: { amount: centsToDollars(row.amount_cents), currency: row.currency },
    accountId: row.account_id,
    category: row.category_id ? resolveCategoryRefFromDbId(row.category_id) : undefined,
    merchant: row.merchant ?? undefined,
    note: row.note ?? undefined
  }
}

function transactionToRow(tx: Transaction): TransactionRow {
  return {
    id: tx.id,
    key: tx.key,
    occurred_at: tx.occurredAt.toISOString(),
    type: tx.type,
    item: tx.item,
    amount_cents: dollarsToCents(tx.money.amount),
    currency: tx.money.currency,
    account_id: tx.accountId,
    category_id: resolveCategoryId(tx.category) ?? null,
    merchant: tx.merchant ?? null,
    note: tx.note ?? null
  }
}

export function insertTransaction(tx: Transaction): void {
  const row = transactionToRow(tx)
  const now = new Date().toISOString()

  exec(
    `
    INSERT INTO transactions (
      id, key, occurred_at, type, item, amount_cents, currency,
      account_id, category_id, merchant, note, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
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
      now,
      now
    ]
  )
}


export function listTransactions(limit = 200): Transaction[] {
  const rows = queryAll<TransactionRow>(
    `
    SELECT
      id, key, occurred_at, type, item, amount_cents, currency, account_id, category_id, merchant, note
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

  return rows.map((r) => ({ month: r.month, totalCents: r.total_cents }))
}
