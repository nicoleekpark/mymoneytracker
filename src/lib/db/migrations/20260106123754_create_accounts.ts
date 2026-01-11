import { execMany } from '@/lib/db/sqlite'
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

      CREATE INDEX IF NOT EXISTS idx_accounts_key ON accounts(key);
    `)
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

