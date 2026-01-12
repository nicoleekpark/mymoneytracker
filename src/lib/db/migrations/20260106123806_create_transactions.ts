import { execMany } from '@/lib/db/sqlite'
import type { Migration } from './types'

export const m20260106123806_create_transactions: Migration = {
  id: 20260106123806,
  name: 'create_transactions',
  up: () => {
    execMany(`
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY NOT NULL,
        occurred_at TEXT NOT NULL,

        type TEXT NOT NULL CHECK (type IN ('expense','income','transfer')),
        item TEXT NOT NULL DEFAULT 'Not added',

        amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
        currency TEXT NOT NULL DEFAULT 'USD',

        account_id TEXT NOT NULL,
        category_id TEXT,

        merchant TEXT,
        note TEXT,

        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE RESTRICT,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_occurred_at_id
      ON transactions(occurred_at DESC, id DESC);

      CREATE INDEX IF NOT EXISTS idx_transactions_account_id
      ON transactions(account_id);

      CREATE INDEX IF NOT EXISTS idx_transactions_category_id
      ON transactions(category_id);

      CREATE INDEX IF NOT EXISTS idx_transactions_type
      ON transactions(type);
    `)
  },
}
