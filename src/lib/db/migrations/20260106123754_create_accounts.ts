import { execMany } from '@/lib/db/sqlite'
import type { Migration } from './types'

export const m20260106123754_create_accounts: Migration = {
  id: 20260106123754,
  name: 'create_accounts',
  up: () => {
    execMany(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY NOT NULL,
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
    `)
  },
}
