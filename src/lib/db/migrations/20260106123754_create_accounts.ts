import { exec, execMany } from '@/lib/db/sqlite'
import { uuid } from '@/utils/uuid'
import type { Migration } from './types'

export const m20260106123754_create_accounts: Migration = {
  id: 20260106123754,
  name: 'create_accounts',
  up: () => {
    execMany(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY NOT NULL,  -- UUID
        key TEXT NOT NULL UNIQUE,      -- stable key e.g. cash
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        currency TEXT NOT NULL DEFAULT 'USD',
        is_archived INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_accounts_is_archived
      ON accounts(is_archived);

      INSERT OR IGNORE INTO accounts (id, name, type, currency, is_archived, created_at, updated_at)
      VALUES ('acct_cash', 'Cash', 'cash', 'USD', 0, datetime('now'), datetime('now'));


      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY NOT NULL,        -- UUID
        key TEXT NOT NULL UNIQUE,            -- stable key e.g. cash
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        currency TEXT NOT NULL DEFAULT 'USD',
        is_archived INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_accounts_is_archived ON accounts(is_archived);
      CREATE INDEX IF NOT EXISTS idx_accounts_key ON accounts(key);
    `)

    const now = new Date().toISOString()
    exec(
      `
      INSERT OR IGNORE INTO accounts (id, key, name, type, currency, is_archived, created_at, updated_at)
      VALUES (?, 'cash', 'Cash', 'cash', 'USD', 0, ?, ?);
      `,
      [uuid(), now, now]
    )

    exec(
      `
      INSERT OR IGNORE INTO accounts (id, key, name, type, currency, is_archived, created_at, updated_at)
      VALUES (?, 'credit_chase_sapphire_reserve', 'Chase Sapphire Reserve', 'credit', 'USD', 0, ?, ?);
      `,
      [uuid(), now, now]
    )

    exec(
      `
      INSERT OR IGNORE INTO accounts (id, key, name, type, currency, is_archived, created_at, updated_at)
      VALUES (?, 'checking_chase_preferred_checking', 'Chase Preferred Checking', 'bank', 'USD', 0, ?, ?);
      `,
      [uuid(), now, now]
    )

    exec(
      `
      INSERT OR IGNORE INTO accounts (id, key, name, type, currency, is_archived, created_at, updated_at)
      VALUES (?, 'credit_amex_delta_reserve', 'Amex Delta Reserve', 'credit', 'USD', 0, ?, ?);
      `,
      [uuid(), now, now]
    )

    exec(
      `
      INSERT OR IGNORE INTO accounts (id, key, name, type, currency, is_archived, created_at, updated_at)
      VALUES (?, 'joint_sofi_savings', 'Joint Sofi Savings', 'bank', 'USD', 0, ?, ?);
      `,
      [uuid(), now, now]
    )

    exec(
      `
      INSERT OR IGNORE INTO accounts (id, key, name, type, currency, is_archived, created_at, updated_at)
      VALUES (?, 'savings_apple', 'Apple Savings', 'bank', 'USD', 0, ?, ?);
      `,
      [uuid(), now, now]
    )
  },
}

// accounts
// -----------------------------------------------------------------------
// id (UUID)                             | key        | name      | type
// -----------------------------------------------------------------------
// a1f3…-1111-aaaa                      | cash       | Cash      | cash
// b2c4…-2222-bbbb                      | checking   | Chase     | bank
// c3d5…-3333-cccc                      | savings    | Savings   | bank
// d4e6…-4444-dddd                      | credit_amex| Amex Gold | credit
// e5f7…-5555-eeee                      | joint      | Joint     | bank

