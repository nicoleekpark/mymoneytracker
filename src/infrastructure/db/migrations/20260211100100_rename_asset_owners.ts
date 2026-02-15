import { execMany } from '../sqlite'
import type { Migration } from './types'

export const m20260211100100_rename_asset_owners: Migration = {
  id: 20260211100100,
  name: 'rename_asset_owners_to_family_members',
  up: () => {
    execMany(`
      -- Rename asset_owners to family_members
      ALTER TABLE asset_owners RENAME TO family_members;

      -- Update foreign key reference in asset_items
      -- SQLite doesn't support renaming FK constraints, but the reference still works
      -- since we're just renaming the table
    `)
  },
}
