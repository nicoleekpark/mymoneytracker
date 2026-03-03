import { exec } from '../sqlite'
import type { Migration } from './types'

export const m20260227100000_add_is_estimated_to_transactions: Migration = {
  id: 20260227100000,
  name: 'add_is_estimated_to_transactions',
  up: () => {
    exec(`
      ALTER TABLE transactions
      ADD COLUMN is_estimated INTEGER NOT NULL DEFAULT 0
      CHECK (is_estimated IN (0, 1))
    `)
  },
}
