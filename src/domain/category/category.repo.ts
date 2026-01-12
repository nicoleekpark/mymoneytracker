import type { UUID } from '@/domain/common/uuid'
import { queryFirst } from '@/lib/db/sqlite'
import { normalizeSubKeyFromDbKey } from './category.model'
import type { CategoryDbId, CategoryRef, CategoryType } from './category.types'

type CategoryRow = {
  id: UUID
  key: string
  type: CategoryType
  parent_id: UUID | null
}

function getCategoryRowById(id: UUID): CategoryRow {
  const row = queryFirst<CategoryRow>(
    `SELECT id, key, type, parent_id FROM categories WHERE id = ? LIMIT 1;`,
    [id]
  )
  if (!row) throw new Error(`Category not found: ${id}`)
  return row
}

export function getCategoryIdByKey(categoryKey: string): UUID {
  const row = queryFirst<{ id: UUID }>(
    `
    SELECT id
    FROM categories
    WHERE key = ?
      AND parent_id IS NULL
    LIMIT 1;
    `,
    [categoryKey]
  )
  if (!row?.id) throw new Error(`Category not found for key=${categoryKey}`)
  return row.id
}

export function getSubCategoryIdByKeyAndParent(subKey: string, parentKey: string): UUID {
  const composite = `${parentKey}.${subKey}`

  const row = queryFirst<{ id: UUID }>(
    `
    SELECT c.id
    FROM categories c
    JOIN categories p ON p.id = c.parent_id
    WHERE (c.key = ? OR c.key = ?) AND p.key = ?
    LIMIT 1;
    `,
    [subKey, composite, parentKey]
  )
  if (!row?.id) throw new Error(`Subcategory not found for key=${subKey} parent=${parentKey}`)
  return row.id
}

// Domain(ref keys) -> DB(FK id)
export function resolveCategoryId(ref?: CategoryRef): CategoryDbId | null {
  if (!ref) return null

  if (ref.subCategoryKey) {
    return getSubCategoryIdByKeyAndParent(ref.subCategoryKey, ref.categoryKey)
  }
  return getCategoryIdByKey(ref.categoryKey)
}

// DB(FK leaf id) -> Domain(ref keys)
export function resolveCategoryRefFromDbId(categoryDbId: UUID): CategoryRef {
  const leaf = getCategoryRowById(categoryDbId)

  // leaf가 parent를 가지면 leaf=subcategory, parent=category
  if (leaf.parent_id) {
    const parent = getCategoryRowById(leaf.parent_id)

    return {
      type: parent.type,
      categoryKey: parent.key,
      subCategoryKey: normalizeSubKeyFromDbKey(leaf.key) // "food.eating_out" -> "eating_out"
    }
  }

  // leaf 자체가 category
  return {
    type: leaf.type,
    categoryKey: leaf.key
  }
}
