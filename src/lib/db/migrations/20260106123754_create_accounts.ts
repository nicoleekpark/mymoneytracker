import { execMany } from '@/lib/db/sqlite'
import type { Migration } from './types'

export const m20260106123754_create_accounts: Migration = {
  id: 20260106123754,
  name: 'create_accounts',
  up: () => {
    execMany(`
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY NOT NULL,
        key TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        nature TEXT NOT NULL CHECK (nature IN ('asset','liability')),
        kind TEXT NOT NULL,
        currency TEXT NOT NULL DEFAULT 'USD',
        sort_order INTEGER NOT NULL DEFAULT 0,

        is_system INTEGER NOT NULL DEFAULT 0 CHECK (is_system IN (0,1)),
        is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0,1)),

        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
      );

      CREATE INDEX IF NOT EXISTS idx_accounts_active
      ON accounts(is_archived);

      CREATE INDEX IF NOT EXISTS idx_accounts_nature_kind_sort
      ON accounts(nature, kind, sort_order, name);

      CREATE INDEX IF NOT EXISTS idx_accounts_kind
      ON accounts(kind);
    `)
  },
}
