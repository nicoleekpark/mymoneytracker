import type { CategoryIndex } from '@/config/categories.index'
import { uuid } from '@/lib/platform/uuid'

import { resolveAccountIdByKey } from '@/domain/account'
import type { CategoryRef } from '@/domain/category'
import type { UUID } from '@/domain/common/uuid'

import { createTransaction } from './transaction.model'
import {
  deleteTransaction,
  getExpenseTotalForMonth,
  insertTransaction,
  listMonthlyExpenseTotals,
  listTransactions,
  type MonthlyExpenseTotal
} from './transaction.repo'
import type { Transaction, TransactionType } from './transaction.types'

function currentMonthYYYYMM(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

// TODO: receipt image
export async function addTransaction(
  categoryIndex: CategoryIndex,
  input: {
    occurredAt?: Date
    type: TransactionType
    item: string
    amount: number
    accountId: UUID
    category?: CategoryRef
    merchant?: string
    note?: string
  }
): Promise<Transaction> {
  const accountId =
    input.accountId && input.accountId.includes('-') ? input.accountId : await resolveAccountIdByKey('cash')

  const tx: Transaction = createTransaction(categoryIndex, {
    id: uuid(),
    occurredAt: input.occurredAt ?? new Date(),
    type: input.type ?? 'expense',
    item: input.item,
    money: { amount: input.amount, currency: 'USD' },
    accountId,
    category: input.category,
    merchant: input.merchant ?? undefined,
    note: input.note ?? undefined
  })

  insertTransaction(tx)
  return tx
}

export async function getTransactions(limit = 200): Promise<Transaction[]> {
  return listTransactions(limit)
}

export async function removeTransaction(id: UUID): Promise<void> {
  deleteTransaction(id)
}

export async function getThisMonthExpenseTotal(now = new Date()): Promise<number> {
  const month = currentMonthYYYYMM(now)
  return getExpenseTotalForMonth(month)
}

export async function getMonthlyExpenseTotals(limitMonths = 24): Promise<MonthlyExpenseTotal[]> {
  return listMonthlyExpenseTotals(limitMonths)
}