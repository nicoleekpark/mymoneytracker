import type { CategoryIndex } from '@/config/categories.index'
import type { Transaction, TransactionType } from '@/domain/transaction/transaction'
import { createTransaction } from '@/domain/transaction/transaction'
import { deleteTransactionRow, fetchExpenseTotalForMonth, fetchMonthlyExpenseTotals, fetchTransactions, insertTransactionRow } from '@/domain/transaction/transaction.repo'
import { uuid } from '@/utils/uuid'

export function addTransactionUsecase(
  categoryIndex: CategoryIndex,
  input: { amount: number; memo?: string; type?: TransactionType; occurredAt?: Date }
): Transaction {
  const tx: Transaction = createTransaction(categoryIndex, {
    id: uuid(),
    occurredAt: input.occurredAt ?? new Date(),
    type: input.type ?? 'expense',
    money: { amount: input.amount, currency: 'USD' },
    memo: input.memo,
  })

  insertTransactionRow({
    id: tx.id,
    occurred_at: tx.occurredAt.toISOString(),
    type: tx.type,
    amount: tx.money.amount,
    currency: tx.money.currency,
    memo: tx.memo ?? null,
  })

  return tx
}

export function listTransactionsUsecase(limit = 200): Transaction[] {
  return fetchTransactions(limit)
}

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
  return addTransactionUsecase(categoryIndex, input)
}

export async function listTransactions(limit = 200) {
  return listTransactionsUsecase(limit)
}

export async function deleteTransaction(id: string): Promise<void> {
  // TODO: add rules (e.g. prevent delete for locked months)
  deleteTransactionRow(id)
}

export async function getThisMonthExpenseTotal(now = new Date()): Promise<number> {
  const month = currentMonthYYYYMM(now)
  return fetchExpenseTotalForMonth(month)
}

export async function listMonthlyExpenseTotals(limitMonths = 24): Promise<MonthlyTotal[]> {
  return fetchMonthlyExpenseTotals(limitMonths)
}