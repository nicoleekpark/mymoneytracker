import type { UUID } from '@/domain/common/uuid'
import { resolveCategoryId, resolveCategoryRefFromDbId } from './category.repo'
import type { CategoryRef } from './category.types'

export async function getCategoryDbId(ref?: CategoryRef): Promise<UUID | null> {
  return resolveCategoryId(ref)
}

export async function getCategoryRefByDbId(id: UUID): Promise<CategoryRef> {
  return resolveCategoryRefFromDbId(id)
}
