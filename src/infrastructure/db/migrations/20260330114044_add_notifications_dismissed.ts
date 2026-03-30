import { execMany } from '../sqlite'
import type { Migration } from './types'

/**
 * Add proper 'dismissed' column to notifications table.
 *
 * Previously, dismissed state was stored using sender_avatar='1' as a hack.
 * This migration:
 * 1. Adds a proper dismissed column
 * 2. Migrates existing dismissed notifications (where sender_avatar='1')
 * 3. Clears the hack value from sender_avatar
 */
export const m20260330114044_add_notifications_dismissed: Migration = {
  id: 20260330114044,
  name: 'add_notifications_dismissed',
  up: () => {
    execMany(`
      -- Add dismissed column with default 0 (not dismissed)
      ALTER TABLE notifications ADD COLUMN dismissed INTEGER NOT NULL DEFAULT 0 CHECK (dismissed IN (0, 1));

      -- Migrate existing dismissed notifications (those with sender_avatar='1')
      UPDATE notifications SET dismissed = 1 WHERE sender_avatar = '1';

      -- Clear the hack value from sender_avatar
      UPDATE notifications SET sender_avatar = NULL WHERE sender_avatar = '1';

      -- Add index for filtering dismissed notifications
      CREATE INDEX IF NOT EXISTS idx_notifications_dismissed ON notifications(dismissed);
    `)
  },
}
