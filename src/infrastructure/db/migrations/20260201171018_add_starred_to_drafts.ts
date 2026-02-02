import { exec } from '../sqlite'
import type { Migration } from './types'

export const m20260201171018_add_starred_to_drafts: Migration = {
  id: 20260201171018,
  name: 'add_starred_to_drafts',
  up: () => {
    exec(`ALTER TABLE transaction_drafts ADD COLUMN starred INTEGER NOT NULL DEFAULT 0 CHECK (starred IN (0, 1));`)
  },
}
