import { execMany } from '../sqlite'
import type { Migration } from './types'

export const m20260613100000_add_account_archived_at: Migration = {
  id: 20260613100000,
  name: 'add_account_archived_at',
  up: () => {
    execMany(`
      ALTER TABLE accounts ADD COLUMN archived_at TEXT;
    `)
  },
}
