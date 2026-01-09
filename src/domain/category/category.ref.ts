import type { UUID } from '@/domain/common/uuid'
import type { CategoryType } from './category.type'

export type CategoryRef = Readonly<{
  type: CategoryType
  categoryId: UUID
  subCategoryId?: string
}>
