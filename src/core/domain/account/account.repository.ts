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
 * Input for updating an existing account.
 */
export type UpdateAccountInput = {
  name?: string
  bankName?: string | null
  lastFourDigits?: string | null
}

/**
 * AccountRepository interface - defines data access contract for accounts.
 * Implementations handle persistence details (SQLite, etc.)
 */
export interface AccountRepository {
  listActive(): Account[]
  listArchived(): Account[]
  getIdByKey(key: string): UUID
  getById(id: UUID): Account | null
  create(input: CreateAccountInput): Account
  update(id: UUID, input: UpdateAccountInput): Account
  archive(id: UUID): void
  restore(id: UUID): void
  delete(id: UUID): void
  getNextSortOrder(kind: AccountKind): number
}
