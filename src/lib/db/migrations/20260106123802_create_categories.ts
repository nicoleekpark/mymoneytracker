import { execMany } from '@/lib/db/sqlite'
import type { Migration } from './types'

export const m20260106123802_create_categories: Migration = {
  id: 20260106123802,
  name: 'create_categories',
  up: () => {
    execMany(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        parent_id TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_archived INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_categories_parent_id
      ON categories(parent_id);

      CREATE INDEX IF NOT EXISTS idx_categories_type
      ON categories(type);

      INSERT OR IGNORE INTO categories (id, name, type, parent_id, sort_order, is_archived, created_at, updated_at)
      VALUES ('cat_uncat', 'Uncategorized', 'expense', NULL, 0, 0, datetime('now'), datetime('now'));
    `)
  },
}
