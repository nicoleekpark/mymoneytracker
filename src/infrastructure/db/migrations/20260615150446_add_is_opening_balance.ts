import { exec } from '../sqlite'
import type { Migration } from './types'

/**
 * Migration: Add is_opening_balance flag to transactions
 *
 * This adds an explicit flag to distinguish opening balance transactions
 * from regular balance adjustments. The first balance entry for an account
 * is recorded as opening balance; subsequent entries are adjustments.
 *
 * Benefits:
 * - More reliable query than text-matching item = 'Opening Balance'
 * - Enables proper balance carry-forward across periods
 * - Supports the account visibility model (show from first transaction date)
 */
export const m20260615150446_add_is_opening_balance: Migration = {
  id: 20260615150446,
  name: 'add_is_opening_balance',
  up: () => {
    // 1. Add the is_opening_balance column (defaults to 0 = false)
    exec(`
      ALTER TABLE transactions
      ADD COLUMN is_opening_balance INTEGER NOT NULL DEFAULT 0
      CHECK (is_opening_balance IN (0, 1));
    `)

    // 2. Mark existing "Opening Balance" transactions
    // These were created by account.service.ts createAccount() with item = 'Opening Balance'
    exec(`
      UPDATE transactions
      SET is_opening_balance = 1
      WHERE item = 'Opening Balance'
        AND type = 'income';
    `)
  },
}
