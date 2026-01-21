import type { UUID } from '@/domain/common/uuid'
import { categoryRepository } from '@/infrastructure/repositories'
import type { CategoryRef } from './category.types'

export async function getCategoryDbId(ref?: CategoryRef): Promise<UUID | null> {
  return categoryRepository.resolveCategoryId(ref)
}

export async function getCategoryRefByDbId(id: UUID): Promise<CategoryRef> {
  return categoryRepository.resolveCategoryRefFromDbId(id)
}
