import { UUID } from '@/domain/transaction/transaction'
import { getCategoryIdByKey, getSubCategoryIdByKeyAndParent } from '@/lib/db/categories'
import { queryFirst } from '@/lib/db/sqlite'
import type { CategoryRef } from './category.ref'
import type { CategoryType } from './category.type'

type CategoryRow = {
  id: string
  type: CategoryType
  parent_id: string | null
}

export function resolveCategoryId(ref?: CategoryRef): UUID | null {
  if (!ref) return null

  // subcategory를 선택했으면 subcategory row id를 FK로 저장
  if (ref.subCategoryId) {
    return getSubCategoryIdByKeyAndParent(ref.subCategoryId, ref.categoryId)
  }

  // category만 선택했으면 category row id를 FK로 저장
  return getCategoryIdByKey(ref.categoryId)
}

export function resolveCategoryRefFromDbId(categoryDbId: string): CategoryRef {
  const leaf = queryFirst<CategoryRow>(
    `SELECT id, type, parent_id FROM categories WHERE id = ? LIMIT 1;`,
    [categoryDbId]
  )
  if (!leaf) throw new Error(`Category not found for id=${categoryDbId}`)

  // leaf가 parent를 가지면 leaf=subcategory, parent=category
  if (leaf.parent_id) {
    const parent = queryFirst<CategoryRow>(
      `SELECT id, type, parent_id FROM categories WHERE id = ? LIMIT 1;`,
      [leaf.parent_id]
    )
    if (!parent) throw new Error(`Category parent not found for id=${leaf.parent_id}`)

    return {
      type: parent.type,
      categoryId: parent.id,
      subCategoryId: leaf.id,
    }
  }

  // leaf 자체가 category
  return {
    type: leaf.type,
    categoryId: leaf.id,
  }
}
