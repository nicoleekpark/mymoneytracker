import type { UUID } from '@/core/domain/common/uuid'
import type { Account } from '@/core/domain/account/account.types'
import { parseAccountNature, parseAccountKind, parseAccountCategory } from '@/core/domain/account/account.schema'
import { getDefaultCategoryForKind } from '@/core/domain/account/account.model'

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
  category?: string
  custom_kind_name?: string | null
  currency?: string
  sort_order?: number
  is_system?: number
  is_archived?: number
  bank_name?: string | null
  last_four_digits?: string | null
  created_at?: string | null
  archived_at?: string | null
}>

/**
 * Convert a database row to a domain Account object.
 * Uses Zod schemas for runtime validation of enum values.
 */
export function rowToAccount(row: AccountRow): Account {
  const kind = parseAccountKind(row.kind)
  // If category is missing (legacy data), derive from kind
  const category = row.category
    ? parseAccountCategory(row.category)
    : getDefaultCategoryForKind(kind)

  return {
    id: row.id,
    key: row.key,
    name: row.name,
    nature: parseAccountNature(row.nature),
    kind,
    category,
    customKindName: row.custom_kind_name ?? undefined,
    currency: row.currency,
    sortOrder: row.sort_order,
    isSystem: row.is_system === 1,
    isArchived: row.is_archived === 1,
    bankName: row.bank_name ?? undefined,
    lastFourDigits: row.last_four_digits ?? undefined,
    createdAt: row.created_at ?? undefined,
    archivedAt: row.archived_at ?? undefined,
  }
}

/**
 * Convert a domain Account to database row format.
 * Note: created_at is handled by database default, archived_at by archive operation
 */
export function accountToRow(account: Account): Omit<AccountRow, 'id' | 'created_at'> & { id?: UUID } {
  return {
    id: account.id,
    key: account.key,
    name: account.name,
    nature: account.nature,
    kind: account.kind,
    category: account.category,
    custom_kind_name: account.customKindName ?? null,
    currency: account.currency ?? 'USD',
    sort_order: account.sortOrder ?? 0,
    is_system: account.isSystem ? 1 : 0,
    is_archived: account.isArchived ? 1 : 0,
    bank_name: account.bankName ?? null,
    last_four_digits: account.lastFourDigits ?? null,
    archived_at: account.archivedAt ?? null,
  }
}
