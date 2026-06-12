import { exec } from '../sqlite'
import type { Migration } from './types'

export const m20260612100000_rename_cash_wallet: Migration = {
  id: 20260612100000,
  name: 'rename_cash_wallet',
  up: () => {
    exec(`
      UPDATE accounts
      SET name = 'Cash'
      WHERE key = 'acct:cash_wallet' AND name = 'Cash Wallet';
    `)
  },
}
