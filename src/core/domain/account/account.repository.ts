import type { UUID } from '@/core/domain/common/uuid'
import type { Account } from './account.types'

/**
 * AccountRepository interface - defines data access contract for accounts.
 * Implementations handle persistence details (SQLite, etc.)
 */
export interface AccountRepository {
  listActive(): Account[]
  getIdByKey(key: string): UUID
}
