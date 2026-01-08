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
        item TEXT NOT NULL DEFAULT 'Not added',
        amount_cents INTEGER NOT NULL,
        currency TEXT NOT NULL DEFAULT 'USD',
        account_id TEXT NOT NULL,            -- accounts.id UUID FK
        category_id TEXT,                    -- categories.id UUID FK (selected node)
        merchant TEXT,
        note TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_occurred_at ON transactions(occurred_at);
      CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    `)
  },
}


// transactions
// ----------------------------------------------------------------------------------------------------------
// id (UUID) | occurred_at | item        | amount_cents | account_id        | category_id
// ----------------------------------------------------------------------------------------------------------
// t001…     | 2026-01-01  | January HOA | 140000       | a1f3…-1111-aaaa   | s102…-bbbb
// t002…     | 2026-01-02  | Chipotle    | 1585         | a1f3…-1111-aaaa   | s201…-cccc
// t003…     | 2026-01-03  | Rent        | 420000       | b2c4…-2222-bbbb  | c100…-aaaa
// t004…     | 2026-01-04  | Dog Vet     | 9500         | a1f3…-1111-aaaa  | s301…-eeee
// t005…     | 2026-01-05  | Bonus       | 500000       | c3d5…-3333-cccc  | c400…-dddd
