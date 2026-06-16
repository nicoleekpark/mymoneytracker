import type { UUID } from '@/core/domain/common/uuid'
import { uuid } from '@/shared/utils/uuid'
import type { Transaction } from '@/core/domain/transaction/transaction.types'
import type {
  AccountActivityTotals,
  AllTimeExpenseByCategory,
  AllTimeIncomeByCategory,
  DailyExpenseTotal,
  DailyFlowTotal,
  DailyFlowTotalWithCount,
  MonthlyExpenseByCategory,
  MonthlyExpenseTotal,
  MonthlyFlowTotal,
  MonthlyIncomeByCategory,
  TransactionPage,
  TransactionRepository,
  YearlyExpenseByCategory,
  YearlyFlowTotal,
  YearlyIncomeByCategory,
  YearTotals,
} from '@/core/domain/transaction/transaction.repository'
import type { CategoryRepository } from '@/core/domain/category/category.repository'
import type { DataSource } from '../db/DataSource'
import {
  rowToTransaction,
  transactionToRow,
  type TransactionRow,
} from '../mappers/transaction.mapper'

// Internal row types and SQL fragments
import type {
  MonthlyTotalRow,
  DailyExpenseTotalRow,
  CategoryMonthlyTotalRow,
  DailyFlowTotalRow,
  TransactionRowWithTags,
} from './transaction'
import {
  SELECT_WITH_TAGS,
  INSERT_TRANSACTION,
  UPDATE_TRANSACTION,
} from './transaction'

/**
 * SQLite implementation of TransactionRepository.
 * Requires a CategoryRepository for category resolution.
 */
export class SqliteTransactionRepository implements TransactionRepository {
  constructor(
    private readonly dataSource: DataSource,
    private readonly categoryRepo: CategoryRepository
  ) {}

  /**
   * Convert rows with embedded tag_names to Transaction objects.
   * Uses batch category resolution to avoid N+1 queries.
   */
  private mapRowsToTransactions(rows: TransactionRowWithTags[]): Transaction[] {
    if (rows.length === 0) return []

    // Batch load all categories
    const categoryIds = [...new Set(rows.map((r) => r.category_id).filter((id): id is UUID => id !== null))]
    const categoryMap = this.categoryRepo.batchResolveCategoryRefs(categoryIds)

    // Map rows to transactions
    return rows.map((r) => {
      const tags = r.tag_names ? r.tag_names.split(',') : undefined
      const categoryResolver = (id: UUID) => categoryMap.get(id) ?? null
      return rowToTransaction(r, categoryResolver, tags)
    })
  }

  insert(tx: Transaction): void {
    const row = transactionToRow(tx, (ref) => this.categoryRepo.resolveCategoryId(ref))
    const now = new Date().toISOString()

    this.dataSource.exec(INSERT_TRANSACTION, [
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
      row.fee_cents,
      row.parent_transaction_id,
      row.category_id,
      row.merchant,
      row.note,
      row.is_estimated,
      row.is_opening_balance,
      now,
      now,
    ])
  }

  /**
   * Insert transaction with tags atomically.
   * Wraps insert + saveTags in a single transaction for data integrity.
   */
  insertWithTags(tx: Transaction, tags?: string[]): void {
    this.dataSource.withTransaction(() => {
      this.insert(tx)
      if (tags && tags.length > 0) {
        this.saveTags(tx.id, tags)
      }
    })
  }

  update(tx: Transaction): void {
    const row = transactionToRow(tx, (ref) => this.categoryRepo.resolveCategoryId(ref))
    const now = new Date().toISOString()

    this.dataSource.exec(UPDATE_TRANSACTION, [
      row.occurred_at,
      row.type,
      row.item,
      row.amount_cents,
      row.currency,
      row.account_id,
      row.from_account_id,
      row.to_account_id,
      row.fee_cents,
      row.parent_transaction_id,
      row.category_id,
      row.merchant,
      row.note,
      row.is_estimated,
      now,
      row.id,
    ])
  }

  /**
   * Update transaction with tags atomically.
   * Wraps update + deleteTags + saveTags in a single transaction for data integrity.
   */
  updateWithTags(tx: Transaction, tags?: string[]): void {
    this.dataSource.withTransaction(() => {
      this.update(tx)
      this.deleteTags(tx.id)
      if (tags && tags.length > 0) {
        this.saveTags(tx.id, tags)
      }
    })
  }

  getById(id: string): Transaction | null {
    const rows = this.dataSource.queryAll<TransactionRow>(
      `
      SELECT
        id, key, occurred_at, type, item, amount_cents, currency,
        account_id, category_id, merchant, note,
        from_account_id, to_account_id, member_id, is_estimated
      FROM transactions
      WHERE id = ?
      LIMIT 1;
      `,
      [id]
    )
    if (rows.length === 0) return null
    const tags = this.getTagsForTransaction(rows[0].id)
    return rowToTransaction(rows[0], (catId) => this.categoryRepo.resolveCategoryRefFromDbId(catId), tags)
  }

  list(limit = 200): Transaction[] {
    const rows = this.dataSource.queryAll<TransactionRowWithTags>(
      `
      ${SELECT_WITH_TAGS}
      GROUP BY t.id
      ORDER BY t.occurred_at DESC, t.id DESC
      LIMIT ?;
      `,
      [limit]
    )
    return this.mapRowsToTransactions(rows)
  }

  listForDate(dateYYYYMMDD: string, limit = 50): Transaction[] {
    const rows = this.dataSource.queryAll<TransactionRowWithTags>(
      `
      ${SELECT_WITH_TAGS}
      WHERE substr(t.occurred_at, 1, 10) = ?
        AND t.type IN ('income', 'expense')
      GROUP BY t.id
      ORDER BY t.amount_cents DESC
      LIMIT ?;
      `,
      [dateYYYYMMDD, limit]
    )
    return this.mapRowsToTransactions(rows)
  }

  listInDateRange(fromDate: string, toDate: string, limit = 500): TransactionPage {
    const rows = this.dataSource.queryAll<TransactionRowWithTags>(
      `
      ${SELECT_WITH_TAGS}
      WHERE t.occurred_at >= ?
        AND t.occurred_at <= ?
      GROUP BY t.id
      ORDER BY t.occurred_at DESC, t.id DESC
      LIMIT ?;
      `,
      [fromDate, toDate + 'T23:59:59.999Z', limit]
    )

    // Check if there are older transactions before the date range
    const olderCount = this.dataSource.queryAll<{ cnt: number }>(
      `SELECT COUNT(*) as cnt FROM transactions WHERE occurred_at < ?`,
      [fromDate]
    )
    const hasMore = (olderCount[0]?.cnt ?? 0) > 0

    const items = this.mapRowsToTransactions(rows)
    const oldestDate = items.length > 0 ? items[items.length - 1].occurredAt.toISOString() : null

    return { items, hasMore, oldestDate }
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
        AND (item IS NULL OR item NOT IN ('Opening Balance', 'Balance Adjustment'))
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
        AND (item IS NULL OR item NOT IN ('Opening Balance', 'Balance Adjustment'))
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
        t.category_id,
        c.name AS category_name,
        COALESCE(SUM(t.amount_cents), 0) AS total_cents
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.type = 'expense'
        AND (t.item IS NULL OR t.item NOT IN ('Opening Balance', 'Balance Adjustment'))
        AND substr(t.occurred_at, 1, 7) = ?
      GROUP BY t.category_id, c.name
      ORDER BY total_cents DESC;
      `,
      [monthYYYYMM]
    )

    return rows.map((r) => ({
      categoryId: r.category_id ?? null,
      categoryName: r.category_name ?? null,
      totalCents: Number(r.total_cents ?? 0),
    }))
  }

  listMonthlyIncomeByCategory(monthYYYYMM: string): MonthlyIncomeByCategory[] {
    const rows = this.dataSource.queryAll<CategoryMonthlyTotalRow>(
      `
      SELECT
        t.category_id,
        c.name AS category_name,
        COALESCE(SUM(t.amount_cents), 0) AS total_cents
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.type = 'income'
        AND (t.item IS NULL OR t.item NOT IN ('Opening Balance', 'Balance Adjustment'))
        AND substr(t.occurred_at, 1, 7) = ?
      GROUP BY t.category_id, c.name
      ORDER BY total_cents DESC;
      `,
      [monthYYYYMM]
    )

    return rows.map((r) => ({
      categoryId: r.category_id ?? null,
      categoryName: r.category_name ?? null,
      totalCents: Number(r.total_cents ?? 0),
    }))
  }

  listTransfersForMonth(monthYYYYMM: string, limit = 500): Transaction[] {
    const rows = this.dataSource.queryAll<TransactionRowWithTags>(
      `
      ${SELECT_WITH_TAGS}
      WHERE t.type = 'transfer'
        AND substr(t.occurred_at, 1, 7) = ?
      GROUP BY t.id
      ORDER BY t.occurred_at DESC, t.id DESC
      LIMIT ?;
      `,
      [monthYYYYMM, limit]
    )
    return this.mapRowsToTransactions(rows)
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
        AND (item IS NULL OR item NOT IN ('Opening Balance', 'Balance Adjustment'))
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
        AND (item IS NULL OR item NOT IN ('Opening Balance', 'Balance Adjustment'))
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

  listDailyVariableExpenseForMonth(monthYYYYMM: string, fixedCategoryKeys: string[]): DailyExpenseTotal[] {
    // If no fixed categories, return empty (shouldn't happen but be safe)
    if (fixedCategoryKeys.length === 0) {
      return this.listDailyExpenseTotalsForMonth(monthYYYYMM)
    }

    const placeholders = fixedCategoryKeys.map(() => '?').join(', ')
    const rows = this.dataSource.queryAll<{ day: string; total_cents: number }>(
      `
      SELECT
        substr(occurred_at, 1, 10) AS day,
        COALESCE(SUM(amount_cents), 0) AS total_cents
      FROM transactions
      WHERE type = 'expense'
        AND substr(occurred_at, 1, 7) = ?
        AND (category_id IS NULL OR category_id NOT IN (${placeholders}))
      GROUP BY day
      ORDER BY day ASC;
      `,
      [monthYYYYMM, ...fixedCategoryKeys]
    )

    return rows.map((r) => ({
      day: r.day,
      totalCents: Number(r.total_cents ?? 0),
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
        AND (item IS NULL OR item NOT IN ('Opening Balance', 'Balance Adjustment'))
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
        AND (item IS NULL OR item NOT IN ('Opening Balance', 'Balance Adjustment'))
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
        AND (item IS NULL OR item NOT IN ('Opening Balance', 'Balance Adjustment'))
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

  // All-time aggregations

  getAllTimeExpenseTotal(): number {
    const rows = this.dataSource.queryAll<{ total_cents: number }>(
      `
      SELECT COALESCE(SUM(amount_cents), 0) AS total_cents
      FROM transactions
      WHERE type = 'expense';
      `
    )
    return Number(rows[0]?.total_cents ?? 0)
  }

  getAllTimeIncomeTotal(): number {
    const rows = this.dataSource.queryAll<{ total_cents: number }>(
      `
      SELECT COALESCE(SUM(amount_cents), 0) AS total_cents
      FROM transactions
      WHERE type = 'income'
        AND (item IS NULL OR item NOT IN ('Opening Balance', 'Balance Adjustment'));
      `
    )
    return Number(rows[0]?.total_cents ?? 0)
  }

  listAllTimeExpenseByCategory(): AllTimeExpenseByCategory[] {
    const rows = this.dataSource.queryAll<CategoryMonthlyTotalRow>(
      `
      SELECT
        category_id,
        COALESCE(SUM(amount_cents), 0) AS total_cents
      FROM transactions
      WHERE type = 'expense'
        AND (item IS NULL OR item NOT IN ('Opening Balance', 'Balance Adjustment'))
      GROUP BY category_id
      ORDER BY total_cents DESC;
      `
    )

    return rows.map((r) => ({
      categoryId: r.category_id ?? null,
      totalCents: Number(r.total_cents ?? 0),
    }))
  }

  listYearlyFlowTotals(): YearlyFlowTotal[] {
    const rows = this.dataSource.queryAll<{
      year: string
      type: 'income' | 'expense'
      total_cents: number
    }>(
      `
      SELECT
        substr(occurred_at, 1, 4) AS year,
        type,
        COALESCE(SUM(amount_cents), 0) AS total_cents
      FROM transactions
      WHERE type IN ('income', 'expense')
        AND (item IS NULL OR item NOT IN ('Opening Balance', 'Balance Adjustment'))
      GROUP BY year, type
      ORDER BY year ASC;
      `
    )

    return rows.map((r) => ({
      year: Number(r.year),
      type: r.type,
      totalCents: Number(r.total_cents ?? 0),
    }))
  }

  listAllTimeIncomeByCategory(): AllTimeIncomeByCategory[] {
    const rows = this.dataSource.queryAll<CategoryMonthlyTotalRow>(
      `
      SELECT
        category_id,
        COALESCE(SUM(amount_cents), 0) AS total_cents
      FROM transactions
      WHERE type = 'income'
        AND (item IS NULL OR item NOT IN ('Opening Balance', 'Balance Adjustment'))
      GROUP BY category_id
      ORDER BY total_cents DESC;
      `
    )

    return rows.map((r) => ({
      categoryId: r.category_id ?? null,
      totalCents: Number(r.total_cents ?? 0),
    }))
  }

  getFirstTransactionDate(): string | null {
    const rows = this.dataSource.queryAll<{ first_date: string | null }>(
      `
      SELECT MIN(occurred_at) AS first_date
      FROM transactions
      WHERE type IN ('income', 'expense');
      `
    )
    return rows[0]?.first_date ?? null
  }

  /**
   * Get the earliest transaction date for each account.
   * Returns a Map of accountId -> firstTxnDate (YYYY-MM-DD format).
   * Used for account period visibility (show from min(createdAt, firstTxnDate)).
   */
  getFirstTransactionDateByAccount(): Map<string, string> {
    const rows = this.dataSource.queryAll<{ account_id: string; first_date: string }>(
      `
      WITH account_txns AS (
        -- Income/expense transactions (use account_id)
        SELECT account_id, occurred_at FROM transactions
        WHERE account_id IS NOT NULL

        UNION ALL

        -- Transfers from (use from_account_id)
        SELECT from_account_id AS account_id, occurred_at FROM transactions
        WHERE from_account_id IS NOT NULL

        UNION ALL

        -- Transfers to (use to_account_id)
        SELECT to_account_id AS account_id, occurred_at FROM transactions
        WHERE to_account_id IS NOT NULL
      )
      SELECT account_id, MIN(substr(occurred_at, 1, 10)) AS first_date
      FROM account_txns
      GROUP BY account_id;
      `
    )
    return new Map(rows.map(r => [r.account_id, r.first_date]))
  }

  countDistinctMonths(): number {
    const rows = this.dataSource.queryAll<{ month_count: number }>(
      `
      SELECT COUNT(DISTINCT substr(occurred_at, 1, 7)) AS month_count
      FROM transactions
      WHERE type IN ('income', 'expense');
      `
    )
    return Number(rows[0]?.month_count ?? 0)
  }

  listMonthlyNetTotals(): MonthlyFlowTotal[] {
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
      WHERE type IN ('income', 'expense')
        AND (item IS NULL OR item NOT IN ('Opening Balance', 'Balance Adjustment'))
      GROUP BY month, type
      ORDER BY month ASC;
      `
    )

    return rows.map((r) => ({
      month: r.month,
      type: r.type,
      totalCents: Number(r.total_cents ?? 0),
    }))
  }

  getYearTotals(year: number): YearTotals {
    const yearPrefix = String(year)
    const rows = this.dataSource.queryAll<{
      income_cents: number
      expense_cents: number
    }>(
      `
      SELECT
        COALESCE(SUM(CASE WHEN type = 'income' AND (item IS NULL OR item NOT IN ('Opening Balance', 'Balance Adjustment')) THEN amount_cents ELSE 0 END), 0) AS income_cents,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount_cents ELSE 0 END), 0) AS expense_cents
      FROM transactions
      WHERE substr(occurred_at, 1, 4) = ?;
      `,
      [yearPrefix]
    )
    return {
      incomeCents: Number(rows[0]?.income_cents ?? 0),
      expenseCents: Number(rows[0]?.expense_cents ?? 0),
    }
  }

  getMonthTotals(monthYYYYMM: string): YearTotals {
    const rows = this.dataSource.queryAll<{
      income_cents: number
      expense_cents: number
    }>(
      `
      SELECT
        COALESCE(SUM(CASE WHEN type = 'income' AND (item IS NULL OR item NOT IN ('Opening Balance', 'Balance Adjustment')) THEN amount_cents ELSE 0 END), 0) AS income_cents,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount_cents ELSE 0 END), 0) AS expense_cents
      FROM transactions
      WHERE substr(occurred_at, 1, 7) = ?;
      `,
      [monthYYYYMM]
    )
    return {
      incomeCents: Number(rows[0]?.income_cents ?? 0),
      expenseCents: Number(rows[0]?.expense_cents ?? 0),
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Tags
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Save tags for a transaction.
   * Creates tags in the tags table if they don't exist.
   * Must be called from within a transaction (insertWithTags or updateWithTags).
   */
  saveTags(transactionId: UUID, tagNames: string[]): void {
    if (!tagNames || tagNames.length === 0) return

    // Note: This method is always called from within a transaction
    // (insertWithTags or updateWithTags), so we don't wrap in another transaction
    for (const name of tagNames) {
      const trimmed = name.trim().toLowerCase()
      if (!trimmed) continue

      // Find or create tag
      let tagId = this.findTagIdByName(trimmed)
      if (!tagId) {
        tagId = this.createTag(trimmed)
      }

      // Insert into junction table (ignore if already exists)
      this.dataSource.exec(
        `INSERT OR IGNORE INTO transaction_tags (transaction_id, tag_id) VALUES (?, ?)`,
        [transactionId, tagId]
      )
    }
  }

  /**
   * Delete all tags for a transaction.
   * Used before re-saving tags to ensure clean state.
   */
  deleteTags(transactionId: UUID): void {
    this.dataSource.exec(
      `DELETE FROM transaction_tags WHERE transaction_id = ?`,
      [transactionId]
    )
  }

  /**
   * Get tag names for a transaction.
   */
  getTagsForTransaction(transactionId: UUID): string[] {
    const rows = this.dataSource.queryAll<{ name: string }>(
      `
      SELECT t.name
      FROM tags t
      JOIN transaction_tags tt ON t.id = tt.tag_id
      WHERE tt.transaction_id = ?
      ORDER BY t.name;
      `,
      [transactionId]
    )
    return rows.map((r) => r.name)
  }

  private findTagIdByName(name: string): string | null {
    const rows = this.dataSource.queryAll<{ id: string }>(
      `SELECT id FROM tags WHERE LOWER(name) = LOWER(?)`,
      [name]
    )
    return rows[0]?.id ?? null
  }

  private createTag(name: string): string {
    const id = uuid()
    const now = new Date().toISOString()
    this.dataSource.exec(
      `INSERT INTO tags (id, name, category, is_system, created_at, updated_at) VALUES (?, ?, 'custom', 0, ?, ?)`,
      [id, name, now, now]
    )
    return id
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Account Activity Aggregations
  // ─────────────────────────────────────────────────────────────────────────────

  listAccountActivityForMonth(monthYYYYMM: string): AccountActivityTotals[] {
    // Use UNION to combine income/expense and transfer transactions per account
    const rows = this.dataSource.queryAll<{
      account_id: string
      expense_cents: number
      income_cents: number
      transfer_out_cents: number
      transfer_in_cents: number
      tx_count: number
    }>(
      `
      WITH account_txs AS (
        -- Income/expense transactions (use account_id), exclude Opening Balance
        SELECT account_id, type, amount_cents, NULL as is_transfer_out, NULL as is_transfer_in
        FROM transactions
        WHERE account_id IS NOT NULL AND type IN ('income', 'expense')
          AND (item IS NULL OR item NOT IN ('Opening Balance', 'Balance Adjustment'))
          AND substr(occurred_at, 1, 7) = ?

        UNION ALL

        -- Transfers out (use from_account_id)
        SELECT from_account_id as account_id, type, amount_cents, 1 as is_transfer_out, NULL as is_transfer_in
        FROM transactions
        WHERE type = 'transfer' AND from_account_id IS NOT NULL
          AND substr(occurred_at, 1, 7) = ?

        UNION ALL

        -- Transfers in (use to_account_id)
        SELECT to_account_id as account_id, type, amount_cents, NULL as is_transfer_out, 1 as is_transfer_in
        FROM transactions
        WHERE type = 'transfer' AND to_account_id IS NOT NULL
          AND substr(occurred_at, 1, 7) = ?
      )
      SELECT
        account_id,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount_cents ELSE 0 END), 0) AS expense_cents,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount_cents ELSE 0 END), 0) AS income_cents,
        COALESCE(SUM(CASE WHEN is_transfer_out = 1 THEN amount_cents ELSE 0 END), 0) AS transfer_out_cents,
        COALESCE(SUM(CASE WHEN is_transfer_in = 1 THEN amount_cents ELSE 0 END), 0) AS transfer_in_cents,
        COUNT(*) AS tx_count
      FROM account_txs
      GROUP BY account_id;
      `,
      [monthYYYYMM, monthYYYYMM, monthYYYYMM]
    )

    return rows.map((r) => ({
      accountId: r.account_id,
      expenseCents: Number(r.expense_cents ?? 0),
      incomeCents: Number(r.income_cents ?? 0),
      transferOutCents: Number(r.transfer_out_cents ?? 0),
      transferInCents: Number(r.transfer_in_cents ?? 0),
      transactionCount: Number(r.tx_count ?? 0),
    }))
  }

  listAccountActivityForYear(year: number): AccountActivityTotals[] {
    const yearPrefix = String(year)
    const rows = this.dataSource.queryAll<{
      account_id: string
      expense_cents: number
      income_cents: number
      transfer_out_cents: number
      transfer_in_cents: number
      tx_count: number
    }>(
      `
      WITH account_txs AS (
        -- Income/expense transactions, exclude Opening Balance
        SELECT account_id, type, amount_cents, NULL as is_transfer_out, NULL as is_transfer_in
        FROM transactions
        WHERE account_id IS NOT NULL AND type IN ('income', 'expense')
          AND (item IS NULL OR item NOT IN ('Opening Balance', 'Balance Adjustment'))
          AND substr(occurred_at, 1, 4) = ?

        UNION ALL

        SELECT from_account_id as account_id, type, amount_cents, 1 as is_transfer_out, NULL as is_transfer_in
        FROM transactions
        WHERE type = 'transfer' AND from_account_id IS NOT NULL
          AND substr(occurred_at, 1, 4) = ?

        UNION ALL

        SELECT to_account_id as account_id, type, amount_cents, NULL as is_transfer_out, 1 as is_transfer_in
        FROM transactions
        WHERE type = 'transfer' AND to_account_id IS NOT NULL
          AND substr(occurred_at, 1, 4) = ?
      )
      SELECT
        account_id,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount_cents ELSE 0 END), 0) AS expense_cents,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount_cents ELSE 0 END), 0) AS income_cents,
        COALESCE(SUM(CASE WHEN is_transfer_out = 1 THEN amount_cents ELSE 0 END), 0) AS transfer_out_cents,
        COALESCE(SUM(CASE WHEN is_transfer_in = 1 THEN amount_cents ELSE 0 END), 0) AS transfer_in_cents,
        COUNT(*) AS tx_count
      FROM account_txs
      GROUP BY account_id;
      `,
      [yearPrefix, yearPrefix, yearPrefix]
    )

    return rows.map((r) => ({
      accountId: r.account_id,
      expenseCents: Number(r.expense_cents ?? 0),
      incomeCents: Number(r.income_cents ?? 0),
      transferOutCents: Number(r.transfer_out_cents ?? 0),
      transferInCents: Number(r.transfer_in_cents ?? 0),
      transactionCount: Number(r.tx_count ?? 0),
    }))
  }

  listAccountActivityAllTime(): AccountActivityTotals[] {
    const rows = this.dataSource.queryAll<{
      account_id: string
      expense_cents: number
      income_cents: number
      transfer_out_cents: number
      transfer_in_cents: number
      tx_count: number
    }>(
      `
      WITH account_txs AS (
        -- Income/expense transactions, exclude Opening Balance
        SELECT account_id, type, amount_cents, NULL as is_transfer_out, NULL as is_transfer_in
        FROM transactions
        WHERE account_id IS NOT NULL AND type IN ('income', 'expense')
          AND (item IS NULL OR item NOT IN ('Opening Balance', 'Balance Adjustment'))

        UNION ALL

        SELECT from_account_id as account_id, type, amount_cents, 1 as is_transfer_out, NULL as is_transfer_in
        FROM transactions
        WHERE type = 'transfer' AND from_account_id IS NOT NULL

        UNION ALL

        SELECT to_account_id as account_id, type, amount_cents, NULL as is_transfer_out, 1 as is_transfer_in
        FROM transactions
        WHERE type = 'transfer' AND to_account_id IS NOT NULL
      )
      SELECT
        account_id,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount_cents ELSE 0 END), 0) AS expense_cents,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount_cents ELSE 0 END), 0) AS income_cents,
        COALESCE(SUM(CASE WHEN is_transfer_out = 1 THEN amount_cents ELSE 0 END), 0) AS transfer_out_cents,
        COALESCE(SUM(CASE WHEN is_transfer_in = 1 THEN amount_cents ELSE 0 END), 0) AS transfer_in_cents,
        COUNT(*) AS tx_count
      FROM account_txs
      GROUP BY account_id;
      `
    )

    return rows.map((r) => ({
      accountId: r.account_id,
      expenseCents: Number(r.expense_cents ?? 0),
      incomeCents: Number(r.income_cents ?? 0),
      transferOutCents: Number(r.transfer_out_cents ?? 0),
      transferInCents: Number(r.transfer_in_cents ?? 0),
      transactionCount: Number(r.tx_count ?? 0),
    }))
  }

  /**
   * Calculate account balance from all transactions before a given date.
   * For assets: income - expenses + transfers_in - transfers_out
   * For liabilities: charges - payments (stored as expenses - income)
   * Returns cents.
   */
  getAccountBalanceBeforeDate(accountId: UUID, dateYYYYMMDD: string): number {
    const row = this.dataSource.queryFirst<{
      income_cents: number
      expense_cents: number
      transfer_in_cents: number
      transfer_out_cents: number
    }>(
      `
      SELECT
        COALESCE(SUM(CASE WHEN type = 'income' AND account_id = ? THEN amount_cents ELSE 0 END), 0) AS income_cents,
        COALESCE(SUM(CASE WHEN type = 'expense' AND account_id = ? THEN amount_cents ELSE 0 END), 0) AS expense_cents,
        COALESCE(SUM(CASE WHEN type = 'transfer' AND to_account_id = ? THEN amount_cents ELSE 0 END), 0) AS transfer_in_cents,
        COALESCE(SUM(CASE WHEN type = 'transfer' AND from_account_id = ? THEN amount_cents ELSE 0 END), 0) AS transfer_out_cents
      FROM transactions
      WHERE (account_id = ? OR from_account_id = ? OR to_account_id = ?)
        AND substr(occurred_at, 1, 10) < ?;
      `,
      [accountId, accountId, accountId, accountId, accountId, accountId, accountId, dateYYYYMMDD]
    )

    if (!row) return 0

    // Balance = income - expenses + transfers_in - transfers_out
    return (
      Number(row.income_cents ?? 0) -
      Number(row.expense_cents ?? 0) +
      Number(row.transfer_in_cents ?? 0) -
      Number(row.transfer_out_cents ?? 0)
    )
  }

  /**
   * Calculate account balance at the end of a month (inclusive).
   * Returns cents.
   */
  getAccountBalanceAtEndOfMonth(accountId: UUID, monthYYYYMM: string): number {
    // Get last day of the month
    const [year, month] = monthYYYYMM.split('-').map(Number)
    const lastDay = new Date(year, month, 0).getDate()
    const endDate = `${monthYYYYMM}-${String(lastDay).padStart(2, '0')}`

    const row = this.dataSource.queryFirst<{
      income_cents: number
      expense_cents: number
      transfer_in_cents: number
      transfer_out_cents: number
    }>(
      `
      SELECT
        COALESCE(SUM(CASE WHEN type = 'income' AND account_id = ? THEN amount_cents ELSE 0 END), 0) AS income_cents,
        COALESCE(SUM(CASE WHEN type = 'expense' AND account_id = ? THEN amount_cents ELSE 0 END), 0) AS expense_cents,
        COALESCE(SUM(CASE WHEN type = 'transfer' AND to_account_id = ? THEN amount_cents ELSE 0 END), 0) AS transfer_in_cents,
        COALESCE(SUM(CASE WHEN type = 'transfer' AND from_account_id = ? THEN amount_cents ELSE 0 END), 0) AS transfer_out_cents
      FROM transactions
      WHERE (account_id = ? OR from_account_id = ? OR to_account_id = ?)
        AND substr(occurred_at, 1, 10) <= ?;
      `,
      [accountId, accountId, accountId, accountId, accountId, accountId, accountId, endDate]
    )

    if (!row) return 0

    return (
      Number(row.income_cents ?? 0) -
      Number(row.expense_cents ?? 0) +
      Number(row.transfer_in_cents ?? 0) -
      Number(row.transfer_out_cents ?? 0)
    )
  }

  clearAccountId(accountId: UUID): number {
    // Set account_id to null for all transactions with this account
    // Also clear from_account_id and to_account_id for transfers
    this.dataSource.exec(
      `UPDATE transactions SET account_id = NULL WHERE account_id = ?;`,
      [accountId]
    )
    this.dataSource.exec(
      `UPDATE transactions SET from_account_id = NULL WHERE from_account_id = ?;`,
      [accountId]
    )
    this.dataSource.exec(
      `UPDATE transactions SET to_account_id = NULL WHERE to_account_id = ?;`,
      [accountId]
    )

    // Return count of affected transactions (approximate - counts any reference)
    const row = this.dataSource.queryFirst<{ count: number }>(
      `SELECT changes() as count;`
    )
    return row?.count ?? 0
  }

  hasTransactionsForAccount(accountId: UUID): boolean {
    const row = this.dataSource.queryFirst<{ count: number }>(
      `SELECT COUNT(*) as count FROM transactions
       WHERE account_id = ? OR from_account_id = ? OR to_account_id = ?
       LIMIT 1;`,
      [accountId, accountId, accountId]
    )
    return (row?.count ?? 0) > 0
  }

  countTransactionsForAccount(accountId: UUID): number {
    const row = this.dataSource.queryFirst<{ count: number }>(
      `SELECT COUNT(*) as count FROM transactions
       WHERE account_id = ? OR from_account_id = ? OR to_account_id = ?;`,
      [accountId, accountId, accountId]
    )
    return row?.count ?? 0
  }

  /**
   * Delete all transactions for an account (cascade delete).
   */
  deleteTransactionsForAccount(accountId: UUID): number {
    this.dataSource.exec(
      `DELETE FROM transactions
       WHERE account_id = ? OR from_account_id = ? OR to_account_id = ?;`,
      [accountId, accountId, accountId]
    )
    const row = this.dataSource.queryFirst<{ count: number }>(
      `SELECT changes() as count;`
    )
    return row?.count ?? 0
  }

  /**
   * Get the opening balance amount for an account (in cents).
   * Returns the amount of the first opening balance transaction, or 0 if none exists.
   * Uses is_opening_balance flag (preferred) or falls back to item text match.
   */
  getOpeningBalanceForAccount(accountId: UUID): number {
    // Try with is_opening_balance column first, fall back to text match if column doesn't exist
    try {
      const row = this.dataSource.queryFirst<{ amount_cents: number }>(
        `SELECT amount_cents
         FROM transactions
         WHERE account_id = ?
           AND (is_opening_balance = 1 OR item = 'Opening Balance')
         ORDER BY occurred_at ASC
         LIMIT 1;`,
        [accountId]
      )
      return row?.amount_cents ?? 0
    } catch {
      // Fallback: column doesn't exist yet, use text match only
      const row = this.dataSource.queryFirst<{ amount_cents: number }>(
        `SELECT amount_cents
         FROM transactions
         WHERE account_id = ?
           AND item = 'Opening Balance'
         ORDER BY occurred_at ASC
         LIMIT 1;`,
        [accountId]
      )
      return row?.amount_cents ?? 0
    }
  }

  /**
   * Check if an account already has an opening balance transaction.
   */
  hasOpeningBalanceForAccount(accountId: UUID): boolean {
    try {
      const row = this.dataSource.queryFirst<{ count: number }>(
        `SELECT COUNT(*) as count
         FROM transactions
         WHERE account_id = ?
           AND (is_opening_balance = 1 OR item = 'Opening Balance')
         LIMIT 1;`,
        [accountId]
      )
      return (row?.count ?? 0) > 0
    } catch {
      // Fallback: column doesn't exist yet, use text match only
      const row = this.dataSource.queryFirst<{ count: number }>(
        `SELECT COUNT(*) as count
         FROM transactions
         WHERE account_id = ?
           AND item = 'Opening Balance'
         LIMIT 1;`,
        [accountId]
      )
      return (row?.count ?? 0) > 0
    }
  }

  /**
   * Check if there are any transactions for an account before a given date.
   */
  hasTransactionsBeforeDate(accountId: UUID, dateYYYYMMDD: string): boolean {
    const row = this.dataSource.queryFirst<{ count: number }>(
      `SELECT COUNT(*) as count
       FROM transactions
       WHERE (account_id = ? OR from_account_id = ? OR to_account_id = ?)
         AND substr(occurred_at, 1, 10) < ?
       LIMIT 1;`,
      [accountId, accountId, accountId, dateYYYYMMDD]
    )
    return (row?.count ?? 0) > 0
  }
}
