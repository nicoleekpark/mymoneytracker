// only maps SQL rows
import type { Transaction, TransactionType } from '@/domain/transaction/transaction'
import { exec, queryAll } from '@/lib/db/sqlite'

// TODO: expand row
type TxRow = {
  id: string
  occurred_at: string
  type: TransactionType
  amount: number
  currency: 'USD'
  memo: string | null
}

function fromRow(r: TxRow): Transaction {
  return {
    id: r.id,
    occurredAt: new Date(r.occurred_at),
    type: r.type,
    money: { amount: r.amount, currency: r.currency },
    memo: r.memo ?? undefined,
  }
}

export function insertTransactionRow(row: TxRow) {
  exec(
    `INSERT INTO transactions (id, occurred_at, type, amount, currency, memo)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [row.id, row.occurred_at, row.type, row.amount, row.currency, row.memo]
  )
}

export function fetchTransactions(limit = 200): Transaction[] {
  const rows = queryAll<TxRow>(
    `SELECT id, occurred_at, type, amount, currency, memo
     FROM transactions
     ORDER BY occurred_at DESC, id DESC
     LIMIT ?`,
    [limit]
  )
  return rows.map(fromRow)
}

export function deleteTransactionRow(id: string): void {
  exec(
    `DELETE FROM transactions WHERE id = ?`,
    [id]
  )
}


export type MonthlyTotalRow = {
  month: string // 'YYYY-MM'
  total: number
}

export function fetchMonthlyExpenseTotals(limitMonths = 24): MonthlyTotalRow[] {
  // SQLite: substr(occurred_at, 1, 7) works with ISO strings like '2026-01-04T...'
  const rows = queryAll<MonthlyTotalRow>(
    `
    SELECT
      substr(occurred_at, 1, 7) AS month,
      SUM(amount) AS total
    FROM transactions
    WHERE type = 'expense'
    GROUP BY month
    ORDER BY month DESC
    LIMIT ?
    `,
    [limitMonths]
  )
  // SUM can return null if no rows, but with GROUP BY it should be numbers
  return rows.map((r) => ({ month: r.month, total: Number(r.total) }))
}

export function fetchExpenseTotalForMonth(monthYYYYMM: string): number {
  const rows = queryAll<{ total: number | null }>(
    `
    SELECT SUM(amount) AS total
    FROM transactions
    WHERE type = 'expense'
      AND substr(occurred_at, 1, 7) = ?
    `,
    [monthYYYYMM]
  )

  const total = rows[0]?.total
  return total == null ? 0 : Number(total)
}