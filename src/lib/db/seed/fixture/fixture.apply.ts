import { exec, queryFirst, withTransaction } from '@/lib/db/sqlite'
import { uuid } from '@/lib/platform/uuid'
import type { SeedReport } from '../seed.report'
import type {
  FixtureAccount,
  FixtureTransaction,
  SeedAccountsFile,
  SeedTransactionsFile
} from './fixture.types'

type AccountIdRow = { id: string }

function getAccountIdByKey(key: string): string {
  const row = queryFirst<AccountIdRow>(
    `SELECT id FROM accounts WHERE key = ? AND is_archived = 0 LIMIT 1;`,
    [key]
  )
  if (!row?.id) throw new Error(`Fixture error: account not found for key=${key}`)
  return row.id
}

type CategoryIdRow = { id: string }
function getCategoryIdByKeyOrNull(key?: string): string | null {
  if (!key) return null
  const row = queryFirst<CategoryIdRow>(
    `SELECT id FROM categories WHERE key = ? AND is_archived = 0 LIMIT 1;`,
    [key]
  )
  return row?.id ?? null
}

function upsertFixtureAccount(a: FixtureAccount, now: string) {
  exec(
    `
    INSERT INTO accounts (
      id, key, name, kind, nature, currency, sort_order,
      is_system, is_archived, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)
    ON CONFLICT(key) DO UPDATE SET
      name       = excluded.name,
      kind       = excluded.kind,
      nature     = excluded.nature,
      currency   = excluded.currency,
      sort_order = excluded.sort_order,
      updated_at = excluded.updated_at
    WHERE accounts.is_system = 0;
    `,
    [
      uuid(),
      a.key,
      a.name,
      a.kind,
      a.nature,
      a.currency ?? 'USD',
      a.sortOrder ?? 0,
      now,
      now
    ]
  )
}

function upsertFixtureTransaction(t: FixtureTransaction, now: string) {
  const currency = t.currency ?? 'USD'
  const categoryId = getCategoryIdByKeyOrNull(t.categoryKey)

  let accountId: string | null = null
  let fromId: string | null = null
  let toId: string | null = null

  if (t.type === 'expense' || t.type === 'income') {
    if (!t.accountKey) throw new Error(`Fixture error: ${t.key} missing accountKey`)
    accountId = getAccountIdByKey(t.accountKey)
  } else {
    if (!t.fromAccountKey || !t.toAccountKey) {
      throw new Error(`Fixture error: ${t.key} missing fromAccountKey/toAccountKey`)
    }
    fromId = getAccountIdByKey(t.fromAccountKey)
    toId = getAccountIdByKey(t.toAccountKey)
  }

  exec(
    `
    INSERT INTO transactions (
      id, key, occurred_at, type, item,
      amount_cents, currency,
      account_id, from_account_id, to_account_id,
      category_id, merchant, note,
      is_system, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?,
            ?, ?,
            ?, ?, ?,
            ?, ?, ?,
            0, ?, ?)
    ON CONFLICT(key) DO UPDATE SET
      occurred_at       = excluded.occurred_at,
      type              = excluded.type,
      item              = excluded.item,
      amount_cents      = excluded.amount_cents,
      currency          = excluded.currency,
      account_id        = excluded.account_id,
      from_account_id   = excluded.from_account_id,
      to_account_id     = excluded.to_account_id,
      category_id       = excluded.category_id,
      merchant          = excluded.merchant,
      note              = excluded.note,
      updated_at        = excluded.updated_at
    WHERE transactions.is_system = 0;
    `,
    [
      uuid(),
      t.key,
      t.occurredAt,
      t.type,
      t.item,
      t.amountCents,
      currency,
      accountId,
      fromId,
      toId,
      categoryId,
      t.merchant ?? null,
      t.note ?? null,
      now,
      now
    ]
  )
}

export function applyFixtureAccounts(file: SeedAccountsFile, report: SeedReport): void {
  const now = new Date().toISOString()

  withTransaction(() => {
    for (const a of file.accounts) {
      upsertFixtureAccount(a, now)
      report.accounts.updated++ // upsert라서 updated로 통일(원하면 inserted/updated 분리도 가능)
    }
  })
}

export function applyFixtureTransactions(file: SeedTransactionsFile, report: SeedReport): void {
  const now = new Date().toISOString()

  withTransaction(() => {
    for (const t of file.transactions) {
      upsertFixtureTransaction(t, now)
      report.transactions.updated++
    }
  })
}

export function deleteFixtureAccounts(file: SeedAccountsFile, report: SeedReport): void {
  withTransaction(() => {
    for (const a of file.accounts) {
      // accounts 지우기 전에 트랜잭션 FK 걸릴 수 있음 → 먼저 transactions delete 추천
      exec(`DELETE FROM accounts WHERE key = ? AND is_system = 0;`, [a.key])
      report.accounts.skipped++ // deleted 카운트를 따로 만들고 싶으면 SeedCounts 확장하면 됨
    }
  })
}

export function deleteFixtureTransactions(file: SeedTransactionsFile, report: SeedReport): void {
  withTransaction(() => {
    for (const t of file.transactions) {
      exec(`DELETE FROM transactions WHERE key = ? AND is_system = 0;`, [t.key])
      report.transactions.skipped++
    }
  })
}
