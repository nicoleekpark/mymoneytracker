import { execMany } from '../sqlite'
import type { Migration } from './types'

/**
 * Suggestions Table Migration
 *
 * Stores historical transaction data for auto-suggestions (Apple Calendar pattern).
 * Tracks items and merchants with frequency and recency for smart ordering.
 *
 * Suggestion algorithm:
 * 1. Filter by query (LIKE '%query%')
 * 2. Prioritize prefix matches
 * 3. Sort by frequency DESC
 * 4. Then by last_used DESC
 *
 * Design decisions:
 * - Separate from transactions for performance (no full-table scan)
 * - Unique constraint on (type, value) prevents duplicates
 * - frequency counter for popularity ranking
 * - last_used timestamp for recency ranking
 */
export const m20260131100200_create_suggestions: Migration = {
  id: 20260131100200,
  name: 'create_suggestions',
  up: () => {
    execMany(`
      CREATE TABLE IF NOT EXISTS suggestions (
        id TEXT PRIMARY KEY NOT NULL,

        -- Type: item (transaction item) or merchant (who/where)
        type TEXT NOT NULL CHECK (type IN ('item', 'merchant')),

        -- The suggestion value (e.g., "Lunch", "Starbucks")
        value TEXT NOT NULL,

        -- Usage frequency (incremented each time used)
        frequency INTEGER NOT NULL DEFAULT 1,

        -- Last time this suggestion was used
        last_used TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

        -- Unique constraint prevents duplicate entries
        UNIQUE(type, value)
      );

      -- Index for type + value lookups (primary query pattern)
      CREATE INDEX IF NOT EXISTS idx_suggestions_type_value
        ON suggestions(type, value);

      -- Index for sorting by frequency
      CREATE INDEX IF NOT EXISTS idx_suggestions_frequency
        ON suggestions(frequency DESC);

      -- Index for sorting by recency
      CREATE INDEX IF NOT EXISTS idx_suggestions_last_used
        ON suggestions(last_used DESC);

      -- Composite index for the full query pattern
      CREATE INDEX IF NOT EXISTS idx_suggestions_type_frequency_last_used
        ON suggestions(type, frequency DESC, last_used DESC);
    `)
  },
}
