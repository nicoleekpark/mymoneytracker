import { CATEGORIES } from '@/config/categories.config'
import { exec, queryFirst, withTransaction } from '../sqlite'
import { uuid } from '@/shared/utils/uuid'
import type { SeedReport } from './seed.report'

type CategoryRow = {
  id: string
  key: string
  is_system: number
}

function getByKey(key: string): CategoryRow | null {
  return queryFirst<CategoryRow>(
    `SELECT id, key, is_system FROM categories WHERE key = ? LIMIT 1;`,
    [key]
  )
}

/**
 * Conflict target must match UNIQUE constraint
 * Requires migration:
 *   UNIQUE(type, key)
 */
function upsertSystemCategory(args: {
  type: string
  key: string
  name: string
  parentId: string | null
  icon: string | null
  color: string | null
  sortOrder: number
  now: string
}) {
  const existing = getByKey(args.key)

  if (existing && existing.is_system === 0) {
    throw new Error(`Seed conflict: categories.key="${args.key}" collides with user data`)
  }

  exec(
    `
    INSERT INTO categories (
      id, type, key, name,
      parent_id, icon, color, sort_order,
      is_system, is_archived, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0, ?, ?)
    ON CONFLICT(type, key) DO UPDATE SET
      name       = excluded.name,
      parent_id  = excluded.parent_id,
      icon       = excluded.icon,
      color      = excluded.color,
      sort_order = excluded.sort_order,
      updated_at = excluded.updated_at
    WHERE categories.is_system = 1;
    `,
    [
      uuid(),
      args.type,
      args.key,
      args.name,
      args.parentId,
      args.icon,
      args.color,
      args.sortOrder,
      args.now,
      args.now
    ]
  )

  if (!existing) return { inserted: true, updated: false }
  return { inserted: false, updated: true }
}

export function syncSystemCategoriesFromConfig(report: SeedReport): void {
  const now = new Date().toISOString()

  withTransaction(() => {
    const parentIdByKey = new Map<string, string>()

    // 1) parents
    let parentSort = 1
    for (const cat of CATEGORIES) {
      const res = upsertSystemCategory({
        type: cat.type,
        key: cat.key,
        name: cat.name,
        parentId: null,
        icon: cat.icon ?? null,
        color: String(cat.color ?? ''),
        sortOrder: parentSort++,
        now
      })
      if (res.inserted) report.categories.inserted++
      if (res.updated) report.categories.updated++

      const row = getByKey(cat.key)
      if (row) parentIdByKey.set(cat.key, row.id)
    }

    // 2) children
    for (const cat of CATEGORIES) {
      const parentId = parentIdByKey.get(cat.key)
      if (!parentId) continue

      let childSort = 1
      for (const sub of cat.subCategories ?? []) {
        const res = upsertSystemCategory({
          type: cat.type,
          key: `${cat.key}.${sub.key}`,
          name: sub.name,
          parentId,
          icon: sub.icon ?? null,
          color: String(sub.color ?? ''),
          sortOrder: childSort++,
          now
        })
        if (res.inserted) report.categories.inserted++
        if (res.updated) report.categories.updated++
      }
    }
  })
}
