import { sqliteDataSource } from '../db'
import { SqliteAccountRepository } from './SqliteAccountRepository'
import { SqliteCategoryRepository } from './SqliteCategoryRepository'
import { SqliteDraftRepository } from './SqliteDraftRepository'
import { SqliteSuggestionsRepository } from './SqliteSuggestionsRepository'
import { SqliteTransactionRepository } from './SqliteTransactionRepository'

// Re-export repository classes for testing or custom instantiation
export { SqliteAccountRepository } from './SqliteAccountRepository'
export { SqliteCategoryRepository } from './SqliteCategoryRepository'
export { SqliteDraftRepository } from './SqliteDraftRepository'
export { SqliteSuggestionsRepository } from './SqliteSuggestionsRepository'
export { SqliteTransactionRepository } from './SqliteTransactionRepository'

/**
 * Singleton repository instances wired to the default SQLite data source.
 * Import these for normal application use.
 */
export const categoryRepository = new SqliteCategoryRepository(sqliteDataSource)
export const accountRepository = new SqliteAccountRepository(sqliteDataSource)
export const draftRepository = new SqliteDraftRepository(sqliteDataSource)
export const suggestionsRepository = new SqliteSuggestionsRepository(sqliteDataSource)
export const transactionRepository = new SqliteTransactionRepository(
  sqliteDataSource,
  categoryRepository
)
