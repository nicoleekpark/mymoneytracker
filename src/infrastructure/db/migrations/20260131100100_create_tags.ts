import { execMany } from '../sqlite'
import type { Migration } from './types'

/**
 * Tags Table Migration
 *
 * Supports transaction tagging with premade and custom tags.
 * Uses many-to-many relationship via transaction_tags junction table.
 *
 * Tag categories:
 * - premade: subscription, emergency, unplanned, work
 * - occurrence: weekly, monthly, yearly, one-time
 * - custom: user-created tags
 *
 * Design decisions:
 * - Separate tags table (not JSON in transactions) for querying/filtering
 * - Junction table for many-to-many relationship
 * - color field for future UI customization
 * - is_system flag for seed-managed premade tags
 */
export const m20260131100100_create_tags: Migration = {
  id: 20260131100100,
  name: 'create_tags',
  up: () => {
    execMany(`
      CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY NOT NULL,

        -- Tag name (unique, case-insensitive matching recommended at app level)
        name TEXT NOT NULL UNIQUE,

        -- Category for grouping in UI
        category TEXT NOT NULL CHECK (category IN ('premade', 'occurrence', 'custom')),

        -- Optional color for UI (hex format: #RRGGBB)
        color TEXT,

        -- System flag for premade tags (protected from user deletion)
        is_system INTEGER NOT NULL DEFAULT 0 CHECK (is_system IN (0, 1)),

        -- Timestamps
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      );

      -- Junction table for transaction-tag relationships
      CREATE TABLE IF NOT EXISTS transaction_tags (
        transaction_id TEXT NOT NULL,
        tag_id TEXT NOT NULL,

        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

        PRIMARY KEY (transaction_id, tag_id),
        FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      );

      -- Index for finding all tags on a transaction
      CREATE INDEX IF NOT EXISTS idx_transaction_tags_transaction_id
        ON transaction_tags(transaction_id);

      -- Index for finding all transactions with a tag
      CREATE INDEX IF NOT EXISTS idx_transaction_tags_tag_id
        ON transaction_tags(tag_id);

      -- Index for filtering by category
      CREATE INDEX IF NOT EXISTS idx_tags_category
        ON tags(category);

      -- Index for system tags
      CREATE INDEX IF NOT EXISTS idx_tags_is_system
        ON tags(is_system);
    `)
  },
}
