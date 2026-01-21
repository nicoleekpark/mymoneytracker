import { sqliteDataSource } from '../db'
import { SqliteAccountRepository } from './SqliteAccountRepository'
import { SqliteCategoryRepository } from './SqliteCategoryRepository'
import { SqliteTransactionRepository } from './SqliteTransactionRepository'

// Re-export repository classes for testing or custom instantiation
export { SqliteAccountRepository } from './SqliteAccountRepository'
export { SqliteCategoryRepository } from './SqliteCategoryRepository'
export { SqliteTransactionRepository } from './SqliteTransactionRepository'

/**
 * Singleton repository instances wired to the default SQLite data source.
 * Import these for normal application use.
 */
export const categoryRepository = new SqliteCategoryRepository(sqliteDataSource)
export const accountRepository = new SqliteAccountRepository(sqliteDataSource)
export const transactionRepository = new SqliteTransactionRepository(
  sqliteDataSource,
  categoryRepository
)
