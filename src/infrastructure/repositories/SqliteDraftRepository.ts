import type { DataSource } from '../db/DataSource'
import { rowToDraft, draftToRow, type DraftTransaction, type DraftRow } from '../mappers/draft.mapper'

/**
 * SQLite implementation of DraftRepository.
 */
export class SqliteDraftRepository {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * List all drafts, newest first.
   */
  list(): DraftTransaction[] {
    const rows = this.dataSource.queryAll<DraftRow>(
      `SELECT * FROM transaction_drafts ORDER BY created_at DESC;`
    )
    return rows.map(rowToDraft)
  }

  /**
   * Get a single draft by ID.
   */
  getById(id: string): DraftTransaction | null {
    const row = this.dataSource.queryFirst<DraftRow>(
      `SELECT * FROM transaction_drafts WHERE id = ? LIMIT 1;`,
      [id]
    )
    return row ? rowToDraft(row) : null
  }

  /**
   * Insert a new draft.
   */
  insert(draft: DraftTransaction): void {
    const row = draftToRow(draft)
    this.dataSource.exec(
      `
      INSERT INTO transaction_drafts (
        id, type, item, amount_cents, currency, merchant, note,
        category_type, category_key, subcategory_key, account_key,
        occurred_at, receipt_uri, created_at, starred
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `,
      [
        row.id,
        row.type,
        row.item,
        row.amount_cents,
        row.currency,
        row.merchant,
        row.note,
        row.category_type,
        row.category_key,
        row.subcategory_key,
        row.account_key,
        row.occurred_at,
        row.receipt_uri,
        row.created_at,
        row.starred,
      ]
    )
  }

  /**
   * Update an existing draft.
   */
  update(draft: DraftTransaction): void {
    const row = draftToRow(draft)
    this.dataSource.exec(
      `
      UPDATE transaction_drafts SET
        type = ?,
        item = ?,
        amount_cents = ?,
        currency = ?,
        merchant = ?,
        note = ?,
        category_type = ?,
        category_key = ?,
        subcategory_key = ?,
        account_key = ?,
        occurred_at = ?,
        receipt_uri = ?,
        starred = ?,
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      WHERE id = ?;
      `,
      [
        row.type,
        row.item,
        row.amount_cents,
        row.currency,
        row.merchant,
        row.note,
        row.category_type,
        row.category_key,
        row.subcategory_key,
        row.account_key,
        row.occurred_at,
        row.receipt_uri,
        row.starred,
        row.id,
      ]
    )
  }

  /**
   * Delete a draft by ID.
   */
  delete(id: string): void {
    this.dataSource.exec(`DELETE FROM transaction_drafts WHERE id = ?;`, [id])
  }

  /**
   * Toggle starred status for a draft.
   */
  toggleStar(id: string): boolean {
    this.dataSource.exec(
      `UPDATE transaction_drafts SET starred = NOT starred, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?;`,
      [id]
    )
    const row = this.dataSource.queryFirst<{ starred: number }>(
      `SELECT starred FROM transaction_drafts WHERE id = ?;`,
      [id]
    )
    return row?.starred === 1
  }

  /**
   * Clear all drafts.
   */
  clearAll(): number {
    const countRow = this.dataSource.queryFirst<{ count: number }>(
      `SELECT COUNT(*) as count FROM transaction_drafts;`
    )
    const count = countRow?.count ?? 0
    this.dataSource.exec(`DELETE FROM transaction_drafts;`)
    return count
  }

  /**
   * Clear only seeded/fixture drafts (those with 'dev:' prefix).
   */
  clearFixtures(): number {
    const countRow = this.dataSource.queryFirst<{ count: number }>(
      `SELECT COUNT(*) as count FROM transaction_drafts WHERE id LIKE 'dev:%';`
    )
    const count = countRow?.count ?? 0
    this.dataSource.exec(`DELETE FROM transaction_drafts WHERE id LIKE 'dev:%';`)
    return count
  }
}
