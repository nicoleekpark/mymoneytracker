import { execMany } from '../sqlite'
import type { Migration } from './types'

export const m20260211100300_add_member_id_to_transactions: Migration = {
  id: 20260211100300,
  name: 'add_member_id_to_transactions',
  up: () => {
    execMany(`
      -- Add member_id column to transactions (nullable = shared/household)
      ALTER TABLE transactions ADD COLUMN member_id TEXT REFERENCES family_members(id) ON DELETE SET NULL;

      -- Create index for member-based queries
      CREATE INDEX IF NOT EXISTS idx_transactions_member_id
      ON transactions(member_id);
    `)
  },
}
