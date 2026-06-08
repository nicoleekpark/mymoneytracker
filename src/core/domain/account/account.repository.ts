import type { UUID } from '@/core/domain/common/uuid'
import type { Account, AccountKind } from './account.types'

/**
 * Input for creating a new account.
 */
export type CreateAccountInput = {
  name: string
  kind: AccountKind
  bankName?: string
  lastFourDigits?: string
}

/**
 * AccountRepository interface - defines data access contract for accounts.
 * Implementations handle persistence details (SQLite, etc.)
 */
export interface AccountRepository {
  listActive(): Account[]
  getIdByKey(key: string): UUID
  getById(id: UUID): Account | null
  create(input: CreateAccountInput): Account
  getNextSortOrder(kind: AccountKind): number
}
