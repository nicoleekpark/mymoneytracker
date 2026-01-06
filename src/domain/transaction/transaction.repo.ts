import { exec, queryAll } from '@/lib/db/sqlite'
import type { TransactionRow } from './transaction.types'

export function insertTransactionRow(row: TransactionRow) {
  exec(
    `INSERT INTO transactions (
      id, occurred_at, type, amount, currency, memo
    ) VALUES (?, ?, ?, ?, ?, ?);`,
    [
      row.id,
      row.occurred_at, 
      row.type, 
      row.amount, 
      row.currency, 
      row.memo
    ]
  )
}

export function listTransactionRows(limit = 200): TransactionRow[] {
  return queryAll<TransactionRow>(
    `
    SELECT id, occurred_at, type, amount, currency, memo
    FROM transactions
    ORDER BY occurred_at DESC, id DESC
    LIMIT ?;
    `,
    [limit]
  )
}

export function deleteTransactionRow(id: string): void {
  exec(`DELETE FROM transactions WHERE id = ?`, [id])
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
      AND substr(occurred_at, 1, 7) = ?;
    `,
    [monthYYYYMM]
  )

  const total = rows[0]?.total
  return total == null ? 0 : Number(total)
}
