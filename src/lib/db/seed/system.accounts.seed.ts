import { exec, queryFirst, withTransaction } from '@/lib/db/sqlite'
import { uuid } from '@/lib/platform/uuid'
import type { SeedReport } from './seed.report'

type AccountRow = {
  id: string
  key: string
  is_system: number
}

function getByKey(key: string): AccountRow | null {
  return queryFirst<AccountRow>(
    `SELECT id, key, is_system FROM accounts WHERE key = ? LIMIT 1;`,
    [key]
  )
}

/**
 * System Accounts seed
 * - system rows: insert or update
 * - user rows: never overwrite (throw)
 *
 * Requires accounts schema to include:
 * - is_system INTEGER NOT NULL DEFAULT 0
 * - UNIQUE(key)
 */
function upsertSystemAccount(args: {
  key: string
  name: string
  type: string
  currency: string
  sortOrder: number
  now: string
}) {
  const existing = getByKey(args.key)

  if (existing && existing.is_system === 0) {
    throw new Error(`Seed conflict: accounts.key="${args.key}" collides with user data`)
  }

  exec(
    `
    INSERT INTO accounts (
      id, key, name, type, currency, sort_order,
      is_system, is_archived, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, 1, 0, ?, ?)
    ON CONFLICT(key) DO UPDATE SET
      name       = excluded.name,
      type       = excluded.type,
      currency   = excluded.currency,
      sort_order = excluded.sort_order,
      updated_at = excluded.updated_at
    WHERE accounts.is_system = 1;
    `,
    [uuid(), args.key, args.name, args.type, args.currency, args.sortOrder, args.now, args.now]
  )

  if (!existing) return { inserted: true, updated: false }
  return { inserted: false, updated: true }
}

export function seedSystemAccounts(report: SeedReport): void {
  const now = new Date().toISOString()

  const SYSTEM_ACCOUNTS = [
    { key: 'cash', name: 'Cash', type: 'cash', currency: 'USD' }
  ] as const

  withTransaction(() => {
    let sort = 1
    for (const a of SYSTEM_ACCOUNTS) {
      const res = upsertSystemAccount({
        key: a.key,
        name: a.name,
        type: a.type,
        currency: a.currency,
        sortOrder: sort++,
        now
      })

      if (res.inserted) report.accounts.inserted++
      if (res.updated) report.accounts.updated++
    }
  })
}