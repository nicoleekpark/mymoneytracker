import type { UUID } from '@/domain/common/uuid'
import type { Account, AccountKind, AccountNature } from '@/domain/account/account.types'

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
}>

/**
 * Convert a database row to a domain Account object.
 */
export function rowToAccount(row: AccountRow): Account {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    nature: row.nature as AccountNature,
    kind: row.kind as AccountKind,
  }
}
