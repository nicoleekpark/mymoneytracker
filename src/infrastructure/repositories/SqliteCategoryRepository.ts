import type { UUID } from '@/domain/common/uuid'
import type { CategoryDbId, CategoryRef, CategoryType } from '@/domain/category/category.types'
import type { CategoryRepository } from '@/domain/category/category.repository'
import { normalizeSubKeyFromDbKey } from '@/domain/category/category.model'
import type { DataSource } from '../db/DataSource'

type CategoryRow = {
  id: UUID
  key: string
  type: CategoryType
  parent_id: UUID | null
}

/**
 * SQLite implementation of CategoryRepository.
 */
export class SqliteCategoryRepository implements CategoryRepository {
  constructor(private readonly dataSource: DataSource) {}

  private getCategoryRowById(id: UUID): CategoryRow {
    const row = this.dataSource.queryFirst<CategoryRow>(
      `SELECT id, key, type, parent_id FROM categories WHERE id = ? LIMIT 1;`,
      [id]
    )
    if (!row) throw new Error(`Category not found: ${id}`)
    return row
  }

  getIdByKey(categoryKey: string): UUID {
    const row = this.dataSource.queryFirst<{ id: UUID }>(
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

  getSubCategoryIdByKeyAndParent(subKey: string, parentKey: string): UUID {
    const composite = `${parentKey}.${subKey}`

    const row = this.dataSource.queryFirst<{ id: UUID }>(
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

  resolveCategoryId(ref?: CategoryRef): CategoryDbId | null {
    if (!ref) return null

    if (ref.subCategoryKey) {
      return this.getSubCategoryIdByKeyAndParent(ref.subCategoryKey, ref.categoryKey)
    }
    return this.getIdByKey(ref.categoryKey)
  }

  resolveCategoryRefFromDbId(categoryDbId: UUID): CategoryRef {
    const leaf = this.getCategoryRowById(categoryDbId)

    // If leaf has a parent, leaf is a subcategory
    if (leaf.parent_id) {
      const parent = this.getCategoryRowById(leaf.parent_id)

      return {
        type: parent.type,
        categoryKey: parent.key,
        subCategoryKey: normalizeSubKeyFromDbKey(leaf.key), // "food.eating_out" -> "eating_out"
      }
    }

    // Leaf itself is the category
    return {
      type: leaf.type,
      categoryKey: leaf.key,
    }
  }
}
