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
  }
}
