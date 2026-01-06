import { execMany } from '@/lib/db/sqlite'
import type { Migration } from './types'

export const m20260106123806_create_transactions: Migration = {
  id: 20260106123806,
  name: 'create_transactions',
  up: () => {
    execMany(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY NOT NULL,
        occurred_at TEXT NOT NULL,
        type TEXT NOT NULL,
        amount_cents INTEGER NOT NULL,
        currency TEXT NOT NULL DEFAULT 'USD',
        account_id TEXT NOT NULL,
        category_id TEXT,
        merchant TEXT,
        note TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_occurred_at
      ON transactions(occurred_at);

      CREATE INDEX IF NOT EXISTS idx_transactions_account_id
      ON transactions(account_id);

      CREATE INDEX IF NOT EXISTS idx_transactions_category_id
      ON transactions(category_id);

      CREATE INDEX IF NOT EXISTS idx_transactions_type
      ON transactions(type);
    `)
  },
}
