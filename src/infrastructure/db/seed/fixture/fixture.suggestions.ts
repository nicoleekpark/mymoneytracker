/**
 * Suggestion Fixtures
 *
 * Applies/deletes mock suggestions from seed_suggestions.json
 * Used by DevToolsOverlay for testing auto-suggest flows.
 */

import { exec, queryFirst, withTransaction } from '../../sqlite'
import { uuid } from '@/shared/utils/uuid'
import type { SeedReport } from '../seed.report'
import seedSuggestions from '../data/seed_suggestions.json'

type SuggestionEntry = {
  value: string
  frequency: number
}

type SuggestionRow = {
  id: string
}

function getByTypeAndValue(type: string, value: string): SuggestionRow | null {
  return queryFirst<SuggestionRow>(
    `SELECT id FROM suggestions WHERE type = ? AND value = ? LIMIT 1;`,
    [type, value]
  )
}

/**
 * Apply suggestion fixtures from JSON
 */
export function applyFixtureSuggestions(report: SeedReport): void {
  const now = new Date().toISOString()
  const { items, merchants } = seedSuggestions.suggestions as {
    items: SuggestionEntry[]
    merchants: SuggestionEntry[]
  }

  withTransaction(() => {
    // Seed items
    for (const item of items) {
      const existing = getByTypeAndValue('item', item.value)
      if (existing) {
        report.suggestions.skipped++
        continue
      }

      exec(
        `INSERT INTO suggestions (id, type, value, frequency, last_used) VALUES (?, ?, ?, ?, ?);`,
        [uuid(), 'item', item.value, item.frequency, now]
      )
      report.suggestions.inserted++
    }

    // Seed merchants
    for (const merchant of merchants) {
      const existing = getByTypeAndValue('merchant', merchant.value)
      if (existing) {
        report.suggestions.skipped++
        continue
      }

      exec(
        `INSERT INTO suggestions (id, type, value, frequency, last_used) VALUES (?, ?, ?, ?, ?);`,
        [uuid(), 'merchant', merchant.value, merchant.frequency, now]
      )
      report.suggestions.inserted++
    }
  })
}

/**
 * Delete all suggestions (both fixture and user-created)
 */
export function deleteAllSuggestions(report: SeedReport): void {
  const countRow = queryFirst<{ count: number }>(
    `SELECT COUNT(*) as count FROM suggestions;`
  )
  report.suggestions.deleted = countRow?.count ?? 0
  exec(`DELETE FROM suggestions;`)
}

/**
 * Get suggestion statistics
 */
export function getSuggestionStats(): {
  items: number
  merchants: number
  total: number
} {
  const items = queryFirst<{ count: number }>(
    `SELECT COUNT(*) as count FROM suggestions WHERE type = 'item';`
  )
  const merchants = queryFirst<{ count: number }>(
    `SELECT COUNT(*) as count FROM suggestions WHERE type = 'merchant';`
  )

  return {
    items: items?.count ?? 0,
    merchants: merchants?.count ?? 0,
    total: (items?.count ?? 0) + (merchants?.count ?? 0),
  }
}
