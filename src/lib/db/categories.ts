import { CategoryRef, CategoryType } from "@/domain/category"
import { queryFirst } from "./sqlite"

type CategoryRow = {
  id: string
  key: string
  type: CategoryType
  parent_id: string | null
}

export function getSubCategoryIdByKeyAndParent(subKey: string, parentKey: string): string {
  const composite = `${parentKey}.${subKey}`

  const row = queryFirst<{ id: string }>(
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

export function resolveCategoryRefById(categoryId: string): CategoryRef {
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
