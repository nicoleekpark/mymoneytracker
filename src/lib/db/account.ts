import type { UUID } from '@/domain/common/uuid'
import { queryAll, queryFirst } from '@/lib/db/sqlite'

export type AccountListItem = {
  id: UUID
  key: string
  name: string
  type: string
}

export function listActiveAccounts(): AccountListItem[] {
  return queryAll<AccountListItem>(
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
}

export function getAccountIdByKey(key: string): UUID {
  const row = queryFirst<AccountListItem>(
    `SELECT id FROM accounts WHERE key = ? AND is_archived = 0 LIMIT 1;`,
    [key]
  )
  if (!row?.id) throw new Error(`Account not found for key=${key}`)
  return row.id
}