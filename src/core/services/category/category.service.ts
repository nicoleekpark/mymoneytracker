// ═══════════════════════════════════════════════════════════════════════════
// APPLICATION SERVICE: Category
// Business logic functions that orchestrate domain + infrastructure.
// ═══════════════════════════════════════════════════════════════════════════

import type { UUID } from '@/core/domain/common/uuid'
import type { CategoryRef } from '@/core/domain/category'
import { categoryRepository } from '@/infrastructure/repositories'

export function getCategoryDbId(ref?: CategoryRef): UUID | null {
  return categoryRepository.resolveCategoryId(ref)
}

export function getCategoryRefByDbId(id: UUID): CategoryRef {
  return categoryRepository.resolveCategoryRefFromDbId(id)
}
