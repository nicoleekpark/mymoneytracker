import type { UUID } from '@/domain/common/uuid'
import { queryAll, queryFirst } from '@/lib/db/sqlite'
import type { Account, AccountKind, AccountNature } from './account.types'

export type AccountRow = {
  id: UUID
  key: string
  name: string
  nature: string
  kind: string
}

function rowToAccount(row: AccountRow): Account {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    nature: row.nature as AccountNature,
    kind: row.kind as AccountKind
  }
}

export function listActiveAccounts(): Account[] {
  const rows = queryAll<AccountRow>(
    `
    SELECT id, key, name, nature, kind
    FROM accounts
    WHERE is_archived = 0
    ORDER BY
      CASE nature
        WHEN 'asset' THEN 0
        WHEN 'liability' THEN 1
        ELSE 9
      END,
      CASE kind
        WHEN 'checking' THEN 0
        WHEN 'savings' THEN 1
        WHEN 'cash' THEN 2
        WHEN 'credit_card' THEN 3
        WHEN 'investment' THEN 4
        WHEN 'loan' THEN 5
        ELSE 9
      END,
      name ASC;
    `
  )

  return rows.map(rowToAccount)
}

export function getAccountIdByKey(key: string): UUID {
  const row = queryFirst<{ id: UUID }>(
    `
    SELECT id
    FROM accounts
    WHERE key = ?
      AND is_archived = 0
    LIMIT 1;
    `,
    [key]
  )
  if (!row?.id) throw new Error(`Account not found for key=${key}`)
  return row.id
}
