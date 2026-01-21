/**
 * DataSource interface - abstracts database operations from domain layer.
 * This allows domain repositories to remain infrastructure-agnostic.
 */
export interface DataSource {
  /**
   * Execute a SQL statement (INSERT, UPDATE, DELETE, etc.)
   */
  exec(sql: string, args?: unknown[]): void

  /**
   * Query all rows matching the SQL statement.
   * Returns an empty array if no matches.
   */
  queryAll<T>(sql: string, args?: unknown[]): T[]

  /**
   * Query the first row matching the SQL statement.
   * Returns null if no match.
   */
  queryFirst<T>(sql: string, args?: unknown[]): T | null

  /**
   * Execute a function within a database transaction.
   * Rolls back on error, commits on success.
   */
  withTransaction<T>(fn: () => T): T
}
