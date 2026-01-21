import type { UUID } from '@/domain/common/uuid'
import type { CategoryDbId, CategoryRef } from './category.types'

/**
 * CategoryRepository interface - defines data access contract for categories.
 * Implementations handle persistence details (SQLite, etc.)
 */
export interface CategoryRepository {
  getIdByKey(categoryKey: string): UUID
  getSubCategoryIdByKeyAndParent(subKey: string, parentKey: string): UUID

  /**
   * Domain (ref keys) -> DB (FK id)
   */
  resolveCategoryId(ref?: CategoryRef): CategoryDbId | null

  /**
   * DB (FK leaf id) -> Domain (ref keys)
   */
  resolveCategoryRefFromDbId(categoryDbId: UUID): CategoryRef
}
