import type { UUID } from '@/core/domain/common/uuid'

export type CategoryType = 'expense' | 'income' | 'transfer'

export type CategoryRef = Readonly<{
  type: CategoryType // income, expense, transfer
  categoryKey: string // housing, food
  subCategoryKey?: string // rent, eating_out
}>

export type CategoryDbId = UUID