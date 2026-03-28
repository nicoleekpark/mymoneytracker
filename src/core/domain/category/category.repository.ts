import type { UUID } from '@/core/domain/common/uuid'
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

  /**
   * Batch resolve multiple category IDs to CategoryRefs.
   * Returns a Map for O(1) lookup. Used to avoid N+1 queries.
   */
  batchResolveCategoryRefs(categoryDbIds: UUID[]): Map<UUID, CategoryRef>
}
