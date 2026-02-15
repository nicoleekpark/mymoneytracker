import { execMany } from '../sqlite'
import type { Migration } from './types'

export const m20260211100200_rename_owner_id_to_member_id: Migration = {
  id: 20260211100200,
  name: 'rename_owner_id_to_member_id',
  up: () => {
    execMany(`
      -- Rename owner_id column to member_id in asset_items
      ALTER TABLE asset_items RENAME COLUMN owner_id TO member_id;

      -- Recreate index with new column name
      DROP INDEX IF EXISTS idx_asset_items_owner;
      CREATE INDEX IF NOT EXISTS idx_asset_items_member
      ON asset_items(member_id);
    `)
  },
}
