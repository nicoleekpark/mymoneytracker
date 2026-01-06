import type { CategoryIndex } from '@/config/categories.index'
import { uuid } from '@/utils/uuid'
import type { Transaction, TransactionType } from './transaction'
import { createTransaction } from './transaction'

import { rowToTransaction, transactionToRow } from './transaction.mapper'
import {
  deleteTransactionRow,
  fetchExpenseTotalForMonth,
  fetchMonthlyExpenseTotals,
  insertTransactionRow,
  listTransactionRows,
} from './transaction.repo'

export type MonthlyTotal = {
  month: string
  total: number
}

function currentMonthYYYYMM(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export async function addTransaction(
  categoryIndex: CategoryIndex,
  input: { amount: number; memo?: string; type?: TransactionType; occurredAt?: Date }
): Promise<Transaction> {
  const tx: Transaction = createTransaction(categoryIndex, {
    id: uuid(),
    occurredAt: input.occurredAt ?? new Date(),
    type: input.type ?? 'expense',
    money: { amount: input.amount, currency: 'USD' },
    memo: input.memo,
  })

  insertTransactionRow(transactionToRow(tx))
  return tx
}

export async function listTransactions(limit = 200): Promise<Transaction[]> {
  return listTransactionRows(limit).map(rowToTransaction)
}

export async function deleteTransaction(id: string): Promise<void> {
  deleteTransactionRow(id)
}

export async function getThisMonthExpenseTotal(now = new Date()): Promise<number> {
  const month = currentMonthYYYYMM(now)
  return fetchExpenseTotalForMonth(month)
}

export async function listMonthlyExpenseTotals(limitMonths = 24): Promise<MonthlyTotal[]> {
  return fetchMonthlyExpenseTotals(limitMonths)
}
