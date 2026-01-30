import type { UUID } from '@/domain/common/uuid'
import type { Transaction } from '@/domain/transaction/transaction.types'
import type {
  DailyExpenseTotal,
  DailyFlowTotal,
  DailyFlowTotalWithCount,
  MonthlyExpenseByCategory,
  MonthlyExpenseTotal,
  MonthlyFlowTotal,
  TransactionRepository,
  YearlyExpenseByCategory,
  YearlyIncomeByCategory,
} from '@/domain/transaction/transaction.repository'
import type { CategoryRepository } from '@/domain/category/category.repository'
import type { DataSource } from '../db/DataSource'
import {
  rowToTransaction,
  transactionToRow,
  type TransactionRow,
} from '../mappers/transaction.mapper'

type MonthlyTotalRow = Readonly<{
  month: string
  total_cents: number
}>

type DailyExpenseTotalRow = Readonly<{
  day: string
  total_cents: number
}>

type CategoryMonthlyTotalRow = Readonly<{
  category_id: UUID | null
  total_cents: number
}>

type DailyFlowTotalRow = Readonly<{
  day: string
  type: 'income' | 'expense'
  total_cents: number
  tx_count: number
}>

/**
 * SQLite implementation of TransactionRepository.
 * Requires a CategoryRepository for category resolution.
 */
export class SqliteTransactionRepository implements TransactionRepository {
  constructor(
    private readonly dataSource: DataSource,
    private readonly categoryRepo: CategoryRepository
  ) {}

  insert(tx: Transaction): void {
    const row = transactionToRow(tx, (ref) => this.categoryRepo.resolveCategoryId(ref))
    const now = new Date().toISOString()

    this.dataSource.exec(
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
        row.from_account_id,
        row.to_account_id,
        row.category_id,
        row.merchant,
        row.note,
        now,
        now,
      ]
    )
  }

  list(limit = 200): Transaction[] {
    const rows = this.dataSource.queryAll<TransactionRow>(
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
    return rows.map((r) =>
      rowToTransaction(r, (id) => this.categoryRepo.resolveCategoryRefFromDbId(id))
    )
  }

  delete(id: UUID): void {
    this.dataSource.exec(`DELETE FROM transactions WHERE id = ?`, [id])
  }

  getExpenseTotalForMonth(monthYYYYMM: string): number {
    const rows = this.dataSource.queryAll<{ total_cents: number }>(
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

  getIncomeTotalForMonth(monthYYYYMM: string): number {
    const rows = this.dataSource.queryAll<{ total_cents: number }>(
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

  listMonthlyExpenseTotals(limitMonths = 24): MonthlyExpenseTotal[] {
    const rows = this.dataSource.queryAll<MonthlyTotalRow>(
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
      totalCents: Number(r.total_cents ?? 0),
    }))
  }

  listDailyExpenseTotalsForMonth(monthYYYYMM: string): DailyExpenseTotal[] {
    const rows = this.dataSource.queryAll<DailyExpenseTotalRow>(
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
      totalCents: Number(r.total_cents ?? 0),
    }))
  }

  listMonthlyExpenseByCategory(monthYYYYMM: string): MonthlyExpenseByCategory[] {
    const rows = this.dataSource.queryAll<CategoryMonthlyTotalRow>(
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
      totalCents: Number(r.total_cents ?? 0),
    }))
  }

  listTransfersForMonth(monthYYYYMM: string, limit = 500): Transaction[] {
    const rows = this.dataSource.queryAll<TransactionRow>(
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
    return rows.map((r) =>
      rowToTransaction(r, (id) => this.categoryRepo.resolveCategoryRefFromDbId(id))
    )
  }

  listDailyFlowTotalsForMonth(monthYYYYMM: string): DailyFlowTotal[] {
    const rows = this.dataSource.queryAll<{
      day: string
      type: 'income' | 'expense'
      total_cents: number
    }>(
      `
      SELECT
        substr(occurred_at, 1, 10) AS day,
        type,
        COALESCE(SUM(amount_cents), 0) AS total_cents
      FROM transactions
      WHERE (type = 'income' OR type = 'expense')
        AND substr(occurred_at, 1, 7) = ?
      GROUP BY day, type
      ORDER BY day ASC;
      `,
      [monthYYYYMM]
    )

    return rows.map((r) => ({
      day: r.day,
      type: r.type,
      totalCents: Number(r.total_cents ?? 0),
    }))
  }

  listDailyFlowTotalsWithCountForMonth(monthYYYYMM: string): DailyFlowTotalWithCount[] {
    const rows = this.dataSource.queryAll<DailyFlowTotalRow>(
      `
      SELECT
        substr(occurred_at, 1, 10) AS day,
        type,
        COALESCE(SUM(amount_cents), 0) AS total_cents,
        COUNT(*) AS tx_count
      FROM transactions
      WHERE (type = 'income' OR type = 'expense')
        AND substr(occurred_at, 1, 7) = ?
      GROUP BY day, type
      ORDER BY day ASC;
      `,
      [monthYYYYMM]
    )

    return rows.map((r) => ({
      day: r.day,
      type: r.type,
      totalCents: Number(r.total_cents ?? 0),
      txCount: Number(r.tx_count ?? 0),
    }))
  }

  listMonthlyFlowTotalsForYear(year: number): MonthlyFlowTotal[] {
    const yearPrefix = String(year)
    const rows = this.dataSource.queryAll<{
      month: string
      type: 'income' | 'expense'
      total_cents: number
    }>(
      `
      SELECT
        substr(occurred_at, 1, 7) AS month,
        type,
        COALESCE(SUM(amount_cents), 0) AS total_cents
      FROM transactions
      WHERE (type = 'income' OR type = 'expense')
        AND substr(occurred_at, 1, 4) = ?
      GROUP BY month, type
      ORDER BY month ASC;
      `,
      [yearPrefix]
    )

    return rows.map((r) => ({
      month: r.month,
      type: r.type,
      totalCents: Number(r.total_cents ?? 0),
    }))
  }

  listYearlyExpenseByCategory(year: number): YearlyExpenseByCategory[] {
    const yearPrefix = String(year)
    const rows = this.dataSource.queryAll<CategoryMonthlyTotalRow>(
      `
      SELECT
        category_id,
        COALESCE(SUM(amount_cents), 0) AS total_cents
      FROM transactions
      WHERE type = 'expense'
        AND substr(occurred_at, 1, 4) = ?
      GROUP BY category_id
      ORDER BY total_cents DESC;
      `,
      [yearPrefix]
    )

    return rows.map((r) => ({
      categoryId: r.category_id ?? null,
      totalCents: Number(r.total_cents ?? 0),
    }))
  }

  listYearlyIncomeByCategory(year: number): YearlyIncomeByCategory[] {
    const yearPrefix = String(year)
    const rows = this.dataSource.queryAll<CategoryMonthlyTotalRow>(
      `
      SELECT
        category_id,
        COALESCE(SUM(amount_cents), 0) AS total_cents
      FROM transactions
      WHERE type = 'income'
        AND substr(occurred_at, 1, 4) = ?
      GROUP BY category_id
      ORDER BY total_cents DESC;
      `,
      [yearPrefix]
    )

    return rows.map((r) => ({
      categoryId: r.category_id ?? null,
      totalCents: Number(r.total_cents ?? 0),
    }))
  }
}
