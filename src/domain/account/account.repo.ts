import type { UUID } from '@/domain/common/uuid'
import { queryAll, queryFirst } from '@/lib/db/sqlite'
import { normalizeAccountType } from './account.model'
import type { Account } from './account.types'

export type AccountRow = {
  id: UUID
  key: string
  name: string
  type: string
}

function rowToAccount(row: AccountRow): Account {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    type: normalizeAccountType(row.type)
  }
}

export function listActiveAccounts(): Account[] {
  const rows = queryAll<AccountRow>(
    `
    SELECT id, key, name, type
    FROM accounts
    WHERE is_archived = 0
    ORDER BY
      CASE type
        WHEN 'cash' THEN 0
        WHEN 'bank' THEN 1
        WHEN 'credit' THEN 2
        ELSE 9
      END,
      name ASC;
    `
  )

  return rows.map(rowToAccount)
}

export function getAccountIdByKey(key: string): UUID {
  const row = queryFirst<{ id: UUID }>(
    `SELECT id FROM accounts WHERE key = ? AND is_archived = 0 LIMIT 1;`,
    [key]
  )
  if (!row?.id) throw new Error(`Account not found for key=${key}`)
  return row.id
}
