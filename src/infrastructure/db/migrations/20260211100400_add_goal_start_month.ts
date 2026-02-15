import { execMany } from '../sqlite'
import type { Migration } from './types'

/**
 * Add start_year_month to asset_goals for user-selectable goal start date.
 * This allows users to choose when their goal period begins (e.g., start of fiscal year).
 */
export const m20260211100400_add_goal_start_month: Migration = {
  id: 20260211100400,
  name: 'add_goal_start_month',
  up: () => {
    execMany(`
      -- Add start_year_month column (defaults to January of the goal year)
      ALTER TABLE asset_goals ADD COLUMN start_year_month TEXT;

      -- Update existing rows to default to January of their year
      UPDATE asset_goals SET start_year_month = year || '-01' WHERE start_year_month IS NULL;
    `)
  },
}
