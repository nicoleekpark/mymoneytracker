import {
  exec as sqliteExec,
  queryAll as sqliteQueryAll,
  queryFirst as sqliteQueryFirst,
  withTransaction as sqliteWithTransaction
} from './sqlite'

import type { DataSource } from './DataSource'

/**
 * SQLite implementation of DataSource interface.
 * Wraps expo-sqlite operations from infrastructure/db/sqlite.ts.
 */
class SqliteDataSourceImpl implements DataSource {
  exec(sql: string, args: unknown[] = []): void {
    sqliteExec(sql, args)
  }

  queryAll<T>(sql: string, args: unknown[] = []): T[] {
    return sqliteQueryAll<T>(sql, args)
  }

  queryFirst<T>(sql: string, args: unknown[] = []): T | null {
    return sqliteQueryFirst<T>(sql, args)
  }

  withTransaction<T>(fn: () => T): T {
    return sqliteWithTransaction(fn)
  }
}

/**
 * Singleton instance of the SQLite data source.
 * Use this throughout the application for database operations.
 */
export const sqliteDataSource: DataSource = new SqliteDataSourceImpl()
