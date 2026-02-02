import type { DataSource } from '../db/DataSource'

export type SuggestionType = 'item' | 'merchant'

export type SuggestionEntry = {
  id: string
  type: SuggestionType
  value: string
  frequency: number
  lastUsed: string
}

type SuggestionRow = {
  id: string
  type: string
  value: string
  frequency: number
  last_used: string
}

function rowToEntry(row: SuggestionRow): SuggestionEntry {
  return {
    id: row.id,
    type: row.type as SuggestionType,
    value: row.value,
    frequency: row.frequency,
    lastUsed: row.last_used,
  }
}

/**
 * SQLite implementation for suggestions persistence.
 * Stores items and merchants with frequency/recency for smart ordering.
 */
export class SqliteSuggestionsRepository {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Get all suggestions of a type, sorted by frequency then recency.
   */
  listByType(type: SuggestionType): SuggestionEntry[] {
    const rows = this.dataSource.queryAll<SuggestionRow>(
      `SELECT * FROM suggestions WHERE type = ? ORDER BY frequency DESC, last_used DESC;`,
      [type]
    )
    return rows.map(rowToEntry)
  }

  /**
   * Get suggestions matching a query, sorted by prefix match, frequency, recency.
   */
  search(type: SuggestionType, query: string, limit = 5): SuggestionEntry[] {
    const normalizedQuery = query.trim().toLowerCase()
    if (normalizedQuery.length < 2) return []

    const rows = this.dataSource.queryAll<SuggestionRow>(
      `SELECT * FROM suggestions
       WHERE type = ? AND LOWER(value) LIKE ?
       ORDER BY
         CASE WHEN LOWER(value) LIKE ? THEN 0 ELSE 1 END,
         frequency DESC,
         last_used DESC
       LIMIT ?;`,
      [type, `%${normalizedQuery}%`, `${normalizedQuery}%`, limit]
    )
    return rows.map(rowToEntry)
  }

  /**
   * Record a suggestion usage. Inserts if new, increments frequency if exists.
   */
  record(type: SuggestionType, value: string): void {
    const normalized = value.trim()
    if (!normalized) return

    const now = new Date().toISOString()

    // Check if exists
    const existing = this.dataSource.queryFirst<{ id: string }>(
      `SELECT id FROM suggestions WHERE type = ? AND LOWER(value) = LOWER(?) LIMIT 1;`,
      [type, normalized]
    )

    if (existing) {
      // Update frequency and last_used
      this.dataSource.exec(
        `UPDATE suggestions
         SET frequency = frequency + 1, last_used = ?
         WHERE id = ?;`,
        [now, existing.id]
      )
    } else {
      // Insert new
      const id = crypto.randomUUID()
      this.dataSource.exec(
        `INSERT INTO suggestions (id, type, value, frequency, last_used)
         VALUES (?, ?, ?, 1, ?);`,
        [id, type, normalized, now]
      )
    }
  }

  /**
   * Get all items.
   */
  listItems(): SuggestionEntry[] {
    return this.listByType('item')
  }

  /**
   * Get all merchants.
   */
  listMerchants(): SuggestionEntry[] {
    return this.listByType('merchant')
  }

  /**
   * Search items.
   */
  searchItems(query: string, limit = 5): string[] {
    return this.search('item', query, limit).map((e) => e.value)
  }

  /**
   * Search merchants.
   */
  searchMerchants(query: string, limit = 5): string[] {
    return this.search('merchant', query, limit).map((e) => e.value)
  }

  /**
   * Record item usage.
   */
  recordItem(value: string): void {
    this.record('item', value)
  }

  /**
   * Record merchant usage.
   */
  recordMerchant(value: string): void {
    this.record('merchant', value)
  }

  /**
   * Clear all suggestions (for testing).
   */
  clearAll(): number {
    const countRow = this.dataSource.queryFirst<{ count: number }>(
      `SELECT COUNT(*) as count FROM suggestions;`
    )
    const count = countRow?.count ?? 0
    this.dataSource.exec(`DELETE FROM suggestions;`)
    return count
  }
}
