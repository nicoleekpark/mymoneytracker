/**
 * Draft Fixtures
 *
 * Applies/deletes mock drafts from seed_drafts.json
 * Used by DevToolsOverlay for testing draft flows.
 */

import { exec, queryFirst, withTransaction } from '../../sqlite'
import type { SeedReport } from '../seed.report'
import seedDrafts from '../data/seed_drafts.json'

type DraftFixture = {
  key: string
  type: 'expense' | 'income' | 'transfer'
  item: string | null
  amountCents: number | null
  merchant: string | null
  categoryType: string | null
  categoryKey: string | null
  subcategoryKey: string | null
  accountKey: string | null
  hoursAgo: number
  starred: boolean
  note: string | null
}

type DraftRow = {
  id: string
}

function getByKey(key: string): DraftRow | null {
  return queryFirst<DraftRow>(
    `SELECT id FROM transaction_drafts WHERE id = ? LIMIT 1;`,
    [key]
  )
}

/**
 * Apply draft fixtures from JSON
 */
export function applyFixtureDrafts(report: SeedReport): void {
  const now = Date.now()
  const drafts = seedDrafts.drafts as DraftFixture[]

  withTransaction(() => {
    for (const draft of drafts) {
      const existing = getByKey(draft.key)
      if (existing) {
        report.drafts = report.drafts ?? { inserted: 0, skipped: 0, deleted: 0 }
        report.drafts.skipped++
        continue
      }

      const occurredAt = new Date(now - draft.hoursAgo * 60 * 60 * 1000).toISOString()
      const createdAt = occurredAt

      exec(
        `
        INSERT INTO transaction_drafts (
          id, type, item, amount_cents, currency, merchant, note,
          category_type, category_key, subcategory_key, account_key,
          occurred_at, created_at, starred
        )
        VALUES (?, ?, ?, ?, 'USD', ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `,
        [
          draft.key,
          draft.type,
          draft.item,
          draft.amountCents,
          draft.merchant,
          draft.note,
          draft.categoryType,
          draft.categoryKey,
          draft.subcategoryKey,
          draft.accountKey,
          occurredAt,
          createdAt,
          draft.starred ? 1 : 0,
        ]
      )

      report.drafts = report.drafts ?? { inserted: 0, skipped: 0, deleted: 0 }
      report.drafts.inserted++
    }
  })
}

/**
 * Delete draft fixtures
 */
export function deleteFixtureDrafts(report: SeedReport): void {
  const drafts = seedDrafts.drafts as DraftFixture[]

  withTransaction(() => {
    for (const draft of drafts) {
      const existing = getByKey(draft.key)
      if (!existing) {
        report.drafts = report.drafts ?? { inserted: 0, skipped: 0, deleted: 0 }
        report.drafts.skipped++
        continue
      }

      exec(`DELETE FROM transaction_drafts WHERE id = ?;`, [draft.key])
      report.drafts = report.drafts ?? { inserted: 0, skipped: 0, deleted: 0 }
      report.drafts.deleted++
    }
  })
}

/**
 * Standalone: Seed drafts and return count
 */
export function seedDraftsStandalone(): number {
  const now = Date.now()
  const drafts = seedDrafts.drafts as DraftFixture[]
  let inserted = 0

  withTransaction(() => {
    for (const draft of drafts) {
      const existing = getByKey(draft.key)
      if (existing) continue

      const occurredAt = new Date(now - draft.hoursAgo * 60 * 60 * 1000).toISOString()
      const createdAt = occurredAt

      exec(
        `INSERT INTO transaction_drafts (
          id, type, item, amount_cents, currency, merchant, note,
          category_type, category_key, subcategory_key, account_key,
          occurred_at, created_at, starred
        )
        VALUES (?, ?, ?, ?, 'USD', ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          draft.key, draft.type, draft.item, draft.amountCents, draft.merchant, draft.note,
          draft.categoryType, draft.categoryKey, draft.subcategoryKey, draft.accountKey,
          occurredAt, createdAt, draft.starred ? 1 : 0,
        ]
      )
      inserted++
    }
  })

  return inserted
}

/**
 * Standalone: Clear fixture drafts and return count
 */
export function clearDraftsStandalone(): number {
  const countRow = queryFirst<{ count: number }>(
    `SELECT COUNT(*) as count FROM transaction_drafts WHERE id LIKE 'dev:%';`
  )
  const count = countRow?.count ?? 0
  exec(`DELETE FROM transaction_drafts WHERE id LIKE 'dev:%';`)
  return count
}

/**
 * Get draft statistics
 */
export function getDraftStats(): {
  total: number
  starred: number
  needsAmount: number
  needsCategory: number
} {
  const total = queryFirst<{ count: number }>(`SELECT COUNT(*) as count FROM transaction_drafts;`)
  const starred = queryFirst<{ count: number }>(`SELECT COUNT(*) as count FROM transaction_drafts WHERE starred = 1;`)
  const needsAmount = queryFirst<{ count: number }>(`SELECT COUNT(*) as count FROM transaction_drafts WHERE amount_cents IS NULL OR amount_cents = 0;`)
  const needsCategory = queryFirst<{ count: number }>(`SELECT COUNT(*) as count FROM transaction_drafts WHERE category_key IS NULL AND amount_cents > 0;`)

  return {
    total: total?.count ?? 0,
    starred: starred?.count ?? 0,
    needsAmount: needsAmount?.count ?? 0,
    needsCategory: needsCategory?.count ?? 0,
  }
}
