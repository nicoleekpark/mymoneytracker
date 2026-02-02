import { execMany } from '../sqlite'
import type { Migration } from './types'

/**
 * Notifications Table Migration
 *
 * Stores all notification types: system, user_action, message, reaction, group.
 * Uses denormalized sender/group fields (no FK) for simplicity and v2 migration flexibility.
 *
 * Design decisions:
 * - Single table for all notification types (Option A from schema review)
 * - Denormalized sender_name/sender_avatar (no users table yet)
 * - Denormalized group_name (no groups table yet)
 * - transaction_id FK for linking to transactions
 * - Indexed on created_at, read, type for common queries
 */
export const m20260131100000_create_notifications: Migration = {
  id: 20260131100000,
  name: 'create_notifications',
  up: () => {
    execMany(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY NOT NULL,

        -- Type: system, user_action, message, reaction, group
        type TEXT NOT NULL CHECK (type IN ('system', 'user_action', 'message', 'reaction', 'group')),

        -- Content
        title TEXT NOT NULL,
        message TEXT NOT NULL,

        -- Status
        read INTEGER NOT NULL DEFAULT 0 CHECK (read IN (0, 1)),

        -- Timestamps
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        read_at TEXT,

        -- Sender info (denormalized for v1, will FK to users in v2)
        sender_id TEXT,
        sender_name TEXT,
        sender_avatar TEXT,

        -- Group info (denormalized for v1, will FK to groups in v2)
        group_id TEXT,
        group_name TEXT,

        -- Transaction reference
        transaction_id TEXT,

        -- Reaction type (only for type='reaction')
        reaction_type TEXT CHECK (reaction_type IS NULL OR reaction_type IN ('like', 'love', 'question', 'exclamation', 'thanks')),

        -- System flag for seed data
        is_system INTEGER NOT NULL DEFAULT 0 CHECK (is_system IN (0, 1)),

        FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
      );

      -- Index for fetching notifications by recency
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at
        ON notifications(created_at DESC);

      -- Index for filtering by read status
      CREATE INDEX IF NOT EXISTS idx_notifications_read
        ON notifications(read);

      -- Index for filtering by type
      CREATE INDEX IF NOT EXISTS idx_notifications_type
        ON notifications(type);

      -- Index for system notifications (for seed management)
      CREATE INDEX IF NOT EXISTS idx_notifications_is_system
        ON notifications(is_system);

      -- Composite index for common query: unread by type
      CREATE INDEX IF NOT EXISTS idx_notifications_read_type
        ON notifications(read, type);
    `)
  },
}
