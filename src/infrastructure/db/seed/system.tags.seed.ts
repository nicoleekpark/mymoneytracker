import { exec, queryFirst, withTransaction } from '../sqlite'
import { uuid } from '@/shared/utils/uuid'
import { SYSTEM_TAGS } from '@/config'
import type { SeedReport } from './seed.report'

type TagRow = {
  id: string
  name: string
  is_system: number
}

function getByName(name: string): TagRow | null {
  return queryFirst<TagRow>(
    `SELECT id, name, is_system FROM tags WHERE name = ? LIMIT 1;`,
    [name]
  )
}

/**
 * Upsert a system tag
 * - System tags: insert or update
 * - User tags with same name: throw error (collision)
 */
function upsertSystemTag(args: {
  key: string
  name: string
  category: string
  color?: string
  now: string
}) {
  const existing = getByName(args.name)

  if (existing && existing.is_system === 0) {
    throw new Error(`Seed conflict: tags.name="${args.name}" collides with user data`)
  }

  exec(
    `
    INSERT INTO tags (id, name, category, color, is_system, created_at, updated_at)
    VALUES (?, ?, ?, ?, 1, ?, ?)
    ON CONFLICT(name) DO UPDATE SET
      category   = excluded.category,
      color      = excluded.color,
      updated_at = excluded.updated_at
    WHERE tags.is_system = 1;
    `,
    [
      uuid(),
      args.name,
      args.category,
      args.color ?? null,
      args.now,
      args.now
    ]
  )

  if (!existing) return { inserted: true, updated: false }
  return { inserted: false, updated: true }
}

/**
 * Sync system tags from config to database
 * Called during app startup via runSystemSeeds()
 */
export function seedSystemTags(report: SeedReport): void {
  const now = new Date().toISOString()

  withTransaction(() => {
    for (const tag of SYSTEM_TAGS) {
      const res = upsertSystemTag({
        key: tag.key,
        name: tag.name,
        category: tag.category,
        color: tag.color,
        now
      })

      if (res.inserted) report.tags.inserted++
      if (res.updated) report.tags.updated++
    }
  })
}
