import { exec } from '../sqlite'
import type { Migration } from './types'

export const m20260612140403_add_transfer_fee: Migration = {
  id: 20260612140403,
  name: 'add_transfer_fee',
  up: () => {
    exec(`
      ALTER TABLE transactions ADD COLUMN fee_cents INTEGER DEFAULT NULL;
    `)
  },
}
