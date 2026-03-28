// ═══════════════════════════════════════════════════════════════════════════
// APPLICATION SERVICE: Category
// Business logic functions that orchestrate domain + infrastructure.
// ═══════════════════════════════════════════════════════════════════════════

import type { UUID } from '@/core/domain/common/uuid'
import type { CategoryRef } from '@/core/domain/category'
import { categoryRepository } from '@/infrastructure/repositories'

export async function getCategoryDbId(ref?: CategoryRef): Promise<UUID | null> {
  return categoryRepository.resolveCategoryId(ref)
}

export async function getCategoryRefByDbId(id: UUID): Promise<CategoryRef> {
  return categoryRepository.resolveCategoryRefFromDbId(id)
}
