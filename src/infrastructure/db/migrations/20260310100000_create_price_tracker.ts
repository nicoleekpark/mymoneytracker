import { execMany } from '../sqlite'
import type { Migration } from './types'

export const m20260310100000_create_price_tracker: Migration = {
  id: 20260310100000,
  name: 'create_price_tracker',
  up: () => {
    execMany(`
      -- Stores table: track prices at specific stores
      CREATE TABLE IF NOT EXISTS stores (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        merchant_alias TEXT,
        category TEXT NOT NULL DEFAULT 'general',
        icon TEXT,
        color TEXT,
        is_favorite INTEGER NOT NULL DEFAULT 0 CHECK (is_favorite IN (0, 1)),
        is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1)),
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
      );

      CREATE INDEX IF NOT EXISTS idx_stores_merchant_alias ON stores(merchant_alias);
      CREATE INDEX IF NOT EXISTS idx_stores_category ON stores(category);
      CREATE INDEX IF NOT EXISTS idx_stores_is_archived ON stores(is_archived);

      -- Tracked items table: items whose prices we track
      CREATE TABLE IF NOT EXISTS tracked_items (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        normalized_name TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'general',
        unit TEXT,
        icon TEXT,
        is_favorite INTEGER NOT NULL DEFAULT 0 CHECK (is_favorite IN (0, 1)),
        is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1)),
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
      );

      CREATE INDEX IF NOT EXISTS idx_tracked_items_normalized_name ON tracked_items(normalized_name);
      CREATE INDEX IF NOT EXISTS idx_tracked_items_category ON tracked_items(category);
      CREATE INDEX IF NOT EXISTS idx_tracked_items_is_archived ON tracked_items(is_archived);

      -- Price points table: recorded prices for items at stores
      CREATE TABLE IF NOT EXISTS price_points (
        id TEXT PRIMARY KEY NOT NULL,
        item_id TEXT NOT NULL,
        store_id TEXT NOT NULL,
        price_cents INTEGER NOT NULL CHECK (price_cents > 0),
        quantity REAL NOT NULL DEFAULT 1.0,
        occurred_at TEXT NOT NULL,
        transaction_id TEXT,
        note TEXT,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        FOREIGN KEY (item_id) REFERENCES tracked_items(id) ON DELETE CASCADE,
        FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE RESTRICT,
        FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_price_points_item_id ON price_points(item_id);
      CREATE INDEX IF NOT EXISTS idx_price_points_store_id ON price_points(store_id);
      CREATE INDEX IF NOT EXISTS idx_price_points_occurred_at ON price_points(occurred_at DESC);
      CREATE INDEX IF NOT EXISTS idx_price_points_transaction_id ON price_points(transaction_id);

      -- Transaction items table: itemized breakdown of transactions
      CREATE TABLE IF NOT EXISTS transaction_items (
        id TEXT PRIMARY KEY NOT NULL,
        transaction_id TEXT NOT NULL,
        item_id TEXT,
        name TEXT NOT NULL,
        price_cents INTEGER NOT NULL CHECK (price_cents > 0),
        quantity REAL NOT NULL DEFAULT 1.0,
        unit TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES tracked_items(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction_id ON transaction_items(transaction_id);
      CREATE INDEX IF NOT EXISTS idx_transaction_items_item_id ON transaction_items(item_id);
    `)
  },
}
