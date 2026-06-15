import { exec, execMany } from '../sqlite'
import type { Migration } from './types'

export const m20260614100000_add_account_category: Migration = {
  id: 20260614100000,
  name: 'add_account_category',
  up: () => {
    // Add new columns
    execMany(`
      ALTER TABLE accounts ADD COLUMN category TEXT NOT NULL DEFAULT 'spending';
      ALTER TABLE accounts ADD COLUMN custom_kind_name TEXT;
    `)

    // Update category based on existing kind values
    // Investment accounts
    exec(`
      UPDATE accounts
      SET category = 'investment'
      WHERE kind IN ('investment', 'hsa', '401k', 'ira', 'roth_ira', '403b', 'brokerage')
    `)

    // Liability accounts
    exec(`
      UPDATE accounts
      SET category = 'liability'
      WHERE kind IN ('credit_card', 'loan', 'mortgage')
    `)

    // Spending accounts (cash, checking, savings, other) keep the default 'spending'
  },
}
