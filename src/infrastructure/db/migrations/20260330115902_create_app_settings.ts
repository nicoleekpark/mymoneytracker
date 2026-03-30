import { execMany } from '../sqlite'
import type { Migration } from './types'

/**
 * App Settings Table
 *
 * Simple key-value store for persisting app settings and store state.
 * Used by Zustand stores (settings, tags, quickChips) for persistence.
 */
export const m20260330115902_create_app_settings: Migration = {
  id: 20260330115902,
  name: 'create_app_settings',
  up: () => {
    execMany(`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      );

      -- Index for faster key lookups (though PRIMARY KEY already indexed)
      CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(key);
    `)
  },
}
