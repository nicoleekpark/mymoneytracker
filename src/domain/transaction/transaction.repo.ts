import { exec, queryAll } from '@/lib/db/sqlite'
import type { TransactionRow } from './transaction.types'

export function insertTransactionRow(row: TransactionRow) {
  exec(
    `
    INSERT INTO transactions (
      id, occurred_at, type, amount_cents, currency, account_id, category_id, merchant, note, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
    [
      row.id,
      row.occurred_at,
      row.type,
      row.amount_cents,
      row.currency,
      row.account_id,
      row.category_id,
      row.merchant,
      row.note,
      new Date().toISOString(),
      new Date().toISOString(),
    ]
  )
}

export function listTransactionRows(limit = 200): TransactionRow[] {
  return queryAll<TransactionRow>(
    `
    SELECT
      id, occurred_at, type, amount_cents, currency, account_id, category_id, merchant, note
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
  month: string
  total_cents: number
}

export function fetchMonthlyExpenseTotals(limitMonths = 24): MonthlyTotalRow[] {
  return queryAll<MonthlyTotalRow>(
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
}

export function fetchExpenseTotalForMonth(monthYYYYMM: string): number {
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
