import { execMany } from '../sqlite'
import type { Migration } from './types'

export const m20260211100000_create_assets: Migration = {
  id: 20260211100000,
  name: 'create_assets',
  up: () => {
    execMany(`
      PRAGMA foreign_keys = ON;

      -- Asset Owners (family members)
      CREATE TABLE IF NOT EXISTS asset_owners (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        nickname TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('parent', 'child')),
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),

        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
      );

      CREATE INDEX IF NOT EXISTS idx_asset_owners_active
      ON asset_owners(is_active);

      -- Asset Items (individual assets/liabilities)
      CREATE TABLE IF NOT EXISTS asset_items (
        id TEXT PRIMARY KEY NOT NULL,
        field TEXT NOT NULL CHECK (field IN ('fixed_assets', 'current_assets', 'liabilities')),
        category TEXT NOT NULL CHECK (category IN (
          'real_estate', 'retirement_funds', 'cash_savings',
          'investments', 'kids', 'credit_card', 'loans', 'other'
        )),
        name TEXT NOT NULL,
        owner_id TEXT,
        is_liquidifiable INTEGER NOT NULL DEFAULT 0 CHECK (is_liquidifiable IN (0, 1)),
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1)),

        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

        FOREIGN KEY (owner_id) REFERENCES asset_owners(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_asset_items_owner
      ON asset_items(owner_id);

      CREATE INDEX IF NOT EXISTS idx_asset_items_field_category
      ON asset_items(field, category, sort_order);

      CREATE INDEX IF NOT EXISTS idx_asset_items_active
      ON asset_items(is_archived);

      -- Asset Balances (monthly snapshots)
      CREATE TABLE IF NOT EXISTS asset_balances (
        id TEXT PRIMARY KEY NOT NULL,
        asset_item_id TEXT NOT NULL,
        year_month TEXT NOT NULL,
        amount REAL NOT NULL DEFAULT 0,

        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

        FOREIGN KEY (asset_item_id) REFERENCES asset_items(id) ON DELETE CASCADE,
        UNIQUE (asset_item_id, year_month)
      );

      CREATE INDEX IF NOT EXISTS idx_asset_balances_item
      ON asset_balances(asset_item_id);

      CREATE INDEX IF NOT EXISTS idx_asset_balances_month
      ON asset_balances(year_month);

      -- Asset Goals (annual targets)
      CREATE TABLE IF NOT EXISTS asset_goals (
        id TEXT PRIMARY KEY NOT NULL,
        year INTEGER NOT NULL UNIQUE,
        target_growth REAL NOT NULL,
        start_net_worth REAL NOT NULL,

        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_asset_goals_year
      ON asset_goals(year);
    `)
  },
}
