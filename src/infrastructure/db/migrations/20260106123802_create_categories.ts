import { execMany } from '../sqlite'
import type { Migration } from './types'

export const m20260106123802_create_categories: Migration = {
  id: 20260106123802,
  name: 'create_categories',
  up: () => {
    execMany(`
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('expense','income','transfer')),

        key TEXT NOT NULL,
        name TEXT NOT NULL,

        parent_id TEXT,
        icon TEXT,
        color TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,

        is_system INTEGER NOT NULL DEFAULT 0 CHECK (is_system IN (0,1)),
        is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0,1)),

        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE RESTRICT
      );

      CREATE UNIQUE INDEX IF NOT EXISTS uq_categories_type_key
      ON categories(type, key);

      CREATE INDEX IF NOT EXISTS idx_categories_parent
      ON categories(parent_id);

      CREATE INDEX IF NOT EXISTS idx_categories_type_active
      ON categories(type, is_archived, sort_order);

      CREATE INDEX IF NOT EXISTS idx_categories_type_parent
      ON categories(type, parent_id, sort_order);
    `)
  },
}
