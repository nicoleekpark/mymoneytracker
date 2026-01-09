import { CategoryRef, CategoryType } from "@/domain/category"
import type { UUID } from "@/domain/common/uuid"
import { queryFirst } from "./sqlite"

type CategoryRow = {
  id: UUID
  key: string
  type: CategoryType
  parent_id: UUID | null
}

export function getSubCategoryIdByKeyAndParent(subKey: string, parentKey: string): string {
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

function normalizeSubKeyFromDbKey(dbKey: string): string {
  // DB가 "food.eating_out"로 저장돼있으면 "eating_out"로 정규화
  const parts = dbKey.split('.')
  return parts[parts.length - 1] || dbKey
}

export function resolveCategoryRefById(categoryId: UUID): CategoryRef {
  const leaf = queryFirst<CategoryRow>(
    `SELECT id, key, type, parent_id FROM categories WHERE id = ? LIMIT 1;`,
    [categoryId]
  )
  if (!leaf) throw new Error(`Category not found: ${categoryId}`)

  // leaf가 parent를 가지면 subcategory, 없으면 category
  if (leaf.parent_id) {
    const parent = queryFirst<CategoryRow>(
      `SELECT id, key, type, parent_id FROM categories WHERE id = ? LIMIT 1;`,
      [leaf.parent_id]
    )
    if (!parent) throw new Error(`Category parent not found: ${leaf.parent_id}`)

    return {
      type: parent.type,
      categoryId: parent.key, // ✅ key로 리턴
      subCategoryId: normalizeSubKeyFromDbKey(leaf.key) // ✅ "food.eating_out" -> "eating_out"
    }
  }

  return {
    type: leaf.type,
    categoryId: leaf.key // ✅ key로 리턴
  }
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