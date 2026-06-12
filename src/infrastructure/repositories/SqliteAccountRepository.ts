import type { UUID } from '@/core/domain/common/uuid'
import type { Account, AccountKind, AccountNature } from '@/core/domain/account/account.types'
import type { AccountRepository, CreateAccountInput, UpdateAccountInput } from '@/core/domain/account/account.repository'
import type { DataSource } from '../db/DataSource'
import { rowToAccount, type AccountRow } from '../mappers/account.mapper'
import { uuid } from '@/shared/utils/uuid'

/**
 * Determine account nature from kind.
 * Credit cards and loans are liabilities; everything else is an asset.
 */
function getNatureFromKind(kind: AccountKind): AccountNature {
  return kind === 'credit_card' || kind === 'loan' ? 'liability' : 'asset'
}

/**
 * Generate a unique key for an account based on its kind and name.
 */
function generateAccountKey(kind: AccountKind, name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
  return `acct:${kind}_${slug}_${Date.now()}`
}

/**
 * SQLite implementation of AccountRepository.
 */
export class SqliteAccountRepository implements AccountRepository {
  constructor(private readonly dataSource: DataSource) {}

  listActive(): Account[] {
    const rows = this.dataSource.queryAll<AccountRow>(
      `
      SELECT id, key, name, nature, kind, currency, sort_order, is_system, is_archived, bank_name, last_four_digits
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
        sort_order ASC,
        name ASC;
      `
    )

    return rows.map(rowToAccount)
  }

  listArchived(): Account[] {
    const rows = this.dataSource.queryAll<AccountRow>(
      `
      SELECT id, key, name, nature, kind, currency, sort_order, is_system, is_archived, bank_name, last_four_digits
      FROM accounts
      WHERE is_archived = 1
      ORDER BY name ASC;
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

  getById(id: UUID): Account | null {
    const row = this.dataSource.queryFirst<AccountRow>(
      `
      SELECT id, key, name, nature, kind, currency, sort_order, is_system, is_archived, bank_name, last_four_digits
      FROM accounts
      WHERE id = ?
      LIMIT 1;
      `,
      [id]
    )
    return row ? rowToAccount(row) : null
  }

  getNextSortOrder(kind: AccountKind): number {
    const row = this.dataSource.queryFirst<{ max_sort: number | null }>(
      `
      SELECT MAX(sort_order) as max_sort
      FROM accounts
      WHERE kind = ?
        AND is_archived = 0;
      `,
      [kind]
    )
    return (row?.max_sort ?? -1) + 1
  }

  create(input: CreateAccountInput): Account {
    const id = uuid()
    const key = generateAccountKey(input.kind, input.name)
    const nature = getNatureFromKind(input.kind)
    const sortOrder = this.getNextSortOrder(input.kind)

    this.dataSource.exec(
      `
      INSERT INTO accounts (id, key, name, nature, kind, currency, sort_order, is_system, is_archived, bank_name, last_four_digits)
      VALUES (?, ?, ?, ?, ?, 'USD', ?, 0, 0, ?, ?);
      `,
      [
        id,
        key,
        input.name,
        nature,
        input.kind,
        sortOrder,
        input.bankName ?? null,
        input.lastFourDigits ?? null
      ]
    )

    return {
      id,
      key,
      name: input.name,
      nature,
      kind: input.kind,
      currency: 'USD',
      sortOrder,
      isSystem: false,
      isArchived: false,
      bankName: input.bankName,
      lastFourDigits: input.lastFourDigits,
    }
  }

  update(id: UUID, input: UpdateAccountInput): Account {
    const existing = this.getById(id)
    if (!existing) throw new Error(`Account not found: ${id}`)
    if (existing.isSystem) throw new Error('Cannot update system account')

    const updates: string[] = []
    const values: (string | null)[] = []

    if (input.name !== undefined) {
      updates.push('name = ?')
      values.push(input.name)
    }
    if (input.bankName !== undefined) {
      updates.push('bank_name = ?')
      values.push(input.bankName)
    }
    if (input.lastFourDigits !== undefined) {
      updates.push('last_four_digits = ?')
      values.push(input.lastFourDigits)
    }

    if (updates.length === 0) return existing

    values.push(id)
    this.dataSource.exec(
      `UPDATE accounts SET ${updates.join(', ')} WHERE id = ?;`,
      values
    )

    return this.getById(id)!
  }

  archive(id: UUID): void {
    const existing = this.getById(id)
    if (!existing) throw new Error(`Account not found: ${id}`)

    this.dataSource.exec(
      `UPDATE accounts SET is_archived = 1 WHERE id = ?;`,
      [id]
    )
  }

  restore(id: UUID): void {
    const existing = this.getById(id)
    if (!existing) throw new Error(`Account not found: ${id}`)

    this.dataSource.exec(
      `UPDATE accounts SET is_archived = 0 WHERE id = ?;`,
      [id]
    )
  }

  delete(id: UUID): void {
    const existing = this.getById(id)
    if (!existing) throw new Error(`Account not found: ${id}`)

    this.dataSource.exec(
      `DELETE FROM accounts WHERE id = ?;`,
      [id]
    )
  }
}
