/**
 * Category repository - delegates to infrastructure layer.
 * This file is kept as a thin shim for backward compatibility.
 */
import { categoryRepository } from '@/infrastructure/repositories'
import type { UUID } from '@/domain/common/uuid'
import type { CategoryDbId, CategoryRef } from './category.types'

export function getCategoryIdByKey(categoryKey: string): UUID {
  return categoryRepository.getIdByKey(categoryKey)
}

export function getSubCategoryIdByKeyAndParent(subKey: string, parentKey: string): UUID {
  return categoryRepository.getSubCategoryIdByKeyAndParent(subKey, parentKey)
}

// Domain(ref keys) -> DB(FK id)
export function resolveCategoryId(ref?: CategoryRef): CategoryDbId | null {
  return categoryRepository.resolveCategoryId(ref)
}

// DB(FK leaf id) -> Domain(ref keys)
export function resolveCategoryRefFromDbId(categoryDbId: UUID): CategoryRef {
  return categoryRepository.resolveCategoryRefFromDbId(categoryDbId)
}
