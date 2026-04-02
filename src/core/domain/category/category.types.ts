import type { UUID } from '@/core/domain/common/uuid'

export type CategoryType = 'expense' | 'income' | 'transfer'

export type CategoryRef = Readonly<{
  type: CategoryType // income, expense, transfer
  categoryKey: string // housing, food
  subCategoryKey?: string // rent, eating_out
}>

export type CategoryDbId = UUID

/**
 * Category index type - maps category types to their keys and subcategory keys.
 * Used to validate CategoryRef at runtime.
 */
export type CategoryIndex = Readonly<
  Record<CategoryType, Readonly<Record<string, readonly string[]>>>
>