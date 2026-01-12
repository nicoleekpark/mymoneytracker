import type { CategoryIndex } from '@/config/categories.index'
import { assertValidCategoryRef } from '@/domain/category'
import type { Transaction } from './transaction.types'

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

  if (input.category) {
    assertValidCategoryRef(categoryIndex, input.category)
  }

  return input
}
