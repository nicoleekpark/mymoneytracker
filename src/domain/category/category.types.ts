import type { UUID } from '@/domain/common/uuid'

export type CategoryType = 'expense' | 'income' | 'transfer'

export type CategoryRef = Readonly<{
  type: CategoryType // income, expense, transfer
  categoryKey: string // housing, food
  subCategoryKey?: string
}>

export type CategoryDbId = UUID