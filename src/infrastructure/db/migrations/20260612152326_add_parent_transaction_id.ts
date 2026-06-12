import { exec } from '../sqlite'
import type { Migration } from './types'

export const m20260612152326_add_parent_transaction_id: Migration = {
  id: 20260612152326,
  name: 'add_parent_transaction_id',
  up: () => {
    // Add parent_transaction_id for linking related transactions (e.g., transfer fees)
    // ON DELETE CASCADE ensures child transactions are deleted when parent is deleted
    exec(`
      ALTER TABLE transactions ADD COLUMN parent_transaction_id TEXT
        REFERENCES transactions(id) ON DELETE CASCADE;
    `)
  },
}
