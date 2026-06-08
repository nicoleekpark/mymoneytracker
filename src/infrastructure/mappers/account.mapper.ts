import type { UUID } from '@/core/domain/common/uuid'
import type { Account } from '@/core/domain/account/account.types'
import { parseAccountNature, parseAccountKind } from '@/core/domain/account/account.schema'

/**
 * Database row representation of an account.
 * Uses snake_case to match SQLite column names.
 */
export type AccountRow = Readonly<{
  id: UUID
  key: string
  name: string
  nature: string
  kind: string
  currency?: string
  sort_order?: number
  is_system?: number
  is_archived?: number
  bank_name?: string | null
  last_four_digits?: string | null
}>

/**
 * Convert a database row to a domain Account object.
 * Uses Zod schemas for runtime validation of enum values.
 */
export function rowToAccount(row: AccountRow): Account {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    nature: parseAccountNature(row.nature),
    kind: parseAccountKind(row.kind),
    currency: row.currency,
    sortOrder: row.sort_order,
    isSystem: row.is_system === 1,
    isArchived: row.is_archived === 1,
    bankName: row.bank_name ?? undefined,
    lastFourDigits: row.last_four_digits ?? undefined,
  }
}

/**
 * Convert a domain Account to database row format.
 */
export function accountToRow(account: Account): Omit<AccountRow, 'id'> & { id?: UUID } {
  return {
    id: account.id,
    key: account.key,
    name: account.name,
    nature: account.nature,
    kind: account.kind,
    currency: account.currency ?? 'USD',
    sort_order: account.sortOrder ?? 0,
    is_system: account.isSystem ? 1 : 0,
    is_archived: account.isArchived ? 1 : 0,
    bank_name: account.bankName ?? null,
    last_four_digits: account.lastFourDigits ?? null,
  }
}
