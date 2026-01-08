import type { CategoryIndex } from '@/config/categories.index'
import type { CategoryRef } from '@/domain/category'
import { assertValidCategoryRef } from '@/domain/category'

export type UUID = string
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

export function createTransaction(categoryIndex: CategoryIndex, input: Transaction): Transaction {
  if (!(input.occurredAt instanceof Date) || Number.isNaN(input.occurredAt.getTime())) {
    throw new Error('occurredAt must be a valid Date')
  }

  if (!Number.isFinite(input.money.amount) || input.money.amount <= 0) {
    throw new Error('Money amount must be > 0')
  }

  if (input.type === 'transfer') {
    if (!input.fromAccountId || !input.toAccountId) {
      throw new Error('transfer requires fromAccountId and toAccountId')
    }
    if (input.fromAccountId === input.toAccountId) {
      throw new Error('fromAccountId and toAccountId must differ')
    }
  }
  console.log('createTransaction input.category keys=', input.category && Object.keys(input.category as any), input.category)

  if (input.category) {
    assertValidCategoryRef(categoryIndex, input.category)
  }

  return input
}
