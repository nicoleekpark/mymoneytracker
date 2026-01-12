import type { CategoryRef } from '@/domain/category'
import type { UUID } from '@/domain/common/uuid'

export type TransactionType = 'income' | 'expense' | 'transfer'

export type Money = Readonly<{
  amount: number
  currency: string
}>

export type Transaction = Readonly<{
  id: UUID
  occurredAt: Date
  type: TransactionType

  item: string
  money: Money

  accountId: UUID

  category?: CategoryRef

  merchant?: string
  note?: string

  fromAccountId?: UUID
  toAccountId?: UUID
}>