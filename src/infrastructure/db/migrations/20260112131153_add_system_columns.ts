import { exec, queryAll } from '../sqlite'
import type { Migration } from './types'

function hasColumn(table: string, column: string): boolean {
  const rows = queryAll<{ name: string }>(`PRAGMA table_info(${table});`)
  return rows.some(r => r.name === column)
}

export const m20260112131153_add_system_columns: Migration = {
  id: 20260112131153,
  name: 'add_system_columns',
  up: () => {
    // -------------------------
    // accounts
    // -------------------------
    if (!hasColumn('accounts', 'is_system')) {
      exec(`ALTER TABLE accounts ADD COLUMN is_system INTEGER NOT NULL DEFAULT 0;`)
    }

    if (!hasColumn('accounts', 'sort_order')) {
      exec(`ALTER TABLE accounts ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;`)
    }

    exec(`CREATE INDEX IF NOT EXISTS idx_accounts_is_system ON accounts(is_system);`)

    // -------------------------
    // categories
    // -------------------------
    if (!hasColumn('categories', 'is_system')) {
      exec(`ALTER TABLE categories ADD COLUMN is_system INTEGER NOT NULL DEFAULT 0;`)
    }

    exec(`CREATE INDEX IF NOT EXISTS idx_categories_is_system ON categories(is_system);`)

    // Safety backfill (older rows should be treated as user-defined unless you explicitly mark them later)
    exec(`UPDATE accounts SET is_system = 0 WHERE is_system IS NULL;`)
    exec(`UPDATE categories SET is_system = 0 WHERE is_system IS NULL;`)
  }
}
