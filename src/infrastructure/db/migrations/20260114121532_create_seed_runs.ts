import { execMany } from '../sqlite'
import type { Migration } from './types'

export const m20260114121532_create_seed_runs: Migration = {
  id: 20260114121532,
  name: 'create_seed_runs',
  up: () => {
    execMany(`
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS seed_runs (
        id TEXT PRIMARY KEY NOT NULL,
        scope TEXT NOT NULL CHECK (scope IN ('dev_fixture')),
        name TEXT NOT NULL,                 -- e.g. "seed_accounts.json"
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
      );

      CREATE TABLE IF NOT EXISTS seed_run_items (
        run_id TEXT NOT NULL,
        table_name TEXT NOT NULL,
        row_key TEXT NOT NULL,              -- stable key you upsert with
        PRIMARY KEY (run_id, table_name, row_key),
        FOREIGN KEY (run_id) REFERENCES seed_runs(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_seed_run_items_table
      ON seed_run_items(table_name);
    `)
  },
}
