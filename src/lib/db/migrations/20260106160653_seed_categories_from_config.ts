import { CATEGORIES } from '@/config/categories.config'
import { exec } from '@/lib/db/sqlite'
import { uuid } from '@/lib/platform/uuid'
import type { Migration } from './types'

export const m20260106160653_seed_categories_from_config: Migration = {
  id: 20260106160653,
  name: 'seed_categories_from_config',
  up: () => {
    const now = new Date().toISOString()
    const parentUuidByKey = new Map<string, string>()

    // 1) seed parents first
    let parentSort = 1
    for (const cat of CATEGORIES) {
      const id = uuid()
      parentUuidByKey.set(cat.id, id)

      exec(
        `
        INSERT OR IGNORE INTO categories
          (id, key, name, type, parent_id, icon, color, sort_order, is_archived, created_at, updated_at)
        VALUES (?, ?, ?, ?, NULL, ?, ?, ?, 0, ?, ?);
        `,
        [
          id,
          cat.id,
          cat.name,
          cat.type,
          cat.icon ?? null,
          String(cat.color ?? ''),
          parentSort++,
          now,
          now,
        ]
      )
    }

    // 2) seed subcategories as child rows (parent_id points to parent UUID)
    for (const cat of CATEGORIES) {
      const parentId = parentUuidByKey.get(cat.id)
      if (!parentId) continue

      let childSort = 1
      for (const sc of cat.subCategories ?? []) {
        exec(
          `
          INSERT OR IGNORE INTO categories
            (id, key, name, type, parent_id, icon, color, sort_order, is_archived, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?);
          `,
          [
            uuid(),
            `${cat.id}.${sc.id}`,   // stable composite key
            sc.name,
            cat.type,
            parentId,
            sc.icon ?? null,
            String(sc.color ?? ''),
            childSort++,
            now,
            now,
          ]
        )
      }
    }
  },
}
