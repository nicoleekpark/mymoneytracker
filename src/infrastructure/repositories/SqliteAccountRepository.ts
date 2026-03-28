import type { UUID } from '@/core/domain/common/uuid'
import type { Account } from '@/core/domain/account/account.types'
import type { AccountRepository } from '@/core/domain/account/account.repository'
import type { DataSource } from '../db/DataSource'
import { rowToAccount, type AccountRow } from '../mappers/account.mapper'

/**
 * SQLite implementation of AccountRepository.
 */
export class SqliteAccountRepository implements AccountRepository {
  constructor(private readonly dataSource: DataSource) {}

  listActive(): Account[] {
    const rows = this.dataSource.queryAll<AccountRow>(
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

  getIdByKey(key: string): UUID {
    const row = this.dataSource.queryFirst<{ id: UUID }>(
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
}
