import { exec, execMany } from '@/lib/db/sqlite'
import { uuid } from '@/utils/uuid'
import type { Migration } from './types'

export const m20260106123802_create_categories: Migration = {
  id: 20260106123802,
  name: 'create_categories',
  up: () => {
    execMany(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY NOT NULL,        -- UUID
        key TEXT NOT NULL UNIQUE,            -- stable key: housing, housing.property_tax
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        parent_id TEXT,
        icon TEXT,
        color TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_archived INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
      CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
      CREATE INDEX IF NOT EXISTS idx_categories_key ON categories(key);
    `)

    const now = new Date().toISOString()
    exec(
      `
      INSERT OR IGNORE INTO categories (id, key, name, type, parent_id, icon, color, sort_order, is_archived, created_at, updated_at)
      VALUES (?, 'uncategorized', 'Uncategorized', 'expense', NULL, NULL, NULL, 0, 0, ?, ?);
      `,
      [uuid(), now, now]
    )
  },
}

// categories
// --------------------------------------------------------------------------------------------------
// id (UUID)          | key        | name       | type     | parent_id | sort_order
// --------------------------------------------------------------------------------------------------
// c100…-aaaa         | housing    | Housing    | expense  | NULL      | 1
// c200…-bbbb         | food       | Food       | expense  | NULL      | 2
// c300…-cccc         | pets       | Pets       | expense  | NULL      | 3
// c400…-dddd         | income     | Income     | income   | NULL      | 1
// c500…-eeee         | uncategorized | Uncategorized | expense | NULL | 999

// categories
// --------------------------------------------------------------------------------------------------
// id (UUID)          | key                        | name           | type     | parent_id
// --------------------------------------------------------------------------------------------------
// s101…-aaaa         | housing.property_tax       | Property Tax   | expense  | c100…-aaaa
// s102…-bbbb         | housing.utilities          | Utilities      | expense  | c100…-aaaa
// s201…-cccc         | food.eating_out            | Eating Out    | expense  | c200…-bbbb
// s202…-dddd         | food.groceries             | Groceries     | expense  | c200…-bbbb
// s301…-eeee         | pets.vet                   | Vet           | expense  | c300…-cccc

