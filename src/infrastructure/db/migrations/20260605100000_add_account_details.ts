import { execMany } from '../sqlite'
import type { Migration } from './types'

export const m20260605100000_add_account_details: Migration = {
  id: 20260605100000,
  name: 'add_account_details',
  up: () => {
    execMany(`
      ALTER TABLE accounts ADD COLUMN bank_name TEXT;
      ALTER TABLE accounts ADD COLUMN last_four_digits TEXT;
    `)
  },
}
