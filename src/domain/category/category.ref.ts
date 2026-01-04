import type { CategoryType } from './category.type'

export type CategoryRef = Readonly<{
  type: CategoryType
  categoryId: string
  subCategoryId?: string
}>
