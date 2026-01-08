import type { CategoryIndex } from '@/config/categories.index'
import { uuid } from '@/utils/uuid'
import type { Transaction, TransactionType } from './transaction'
import { createTransaction } from './transaction'

import { CategoryRef } from '@/domain/category'
import { getAccountIdByKey } from '@/lib/db/account'
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
  total_cents: number
}

function currentMonthYYYYMM(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

// TODO: receipt image
export async function addTransaction(
  categoryIndex: CategoryIndex,
  input: {
    occurredAt?: Date,
    type: TransactionType;
    item: string;
    amount: number;
    accountId: string;
    category?: CategoryRef;
    merchant?: string;
    note?: string
  }
): Promise<Transaction> {

  // {"accountId": "adf",
  // "amount": 574,
  // "category":
  // {"categoryId": "food", "subCategoryId": "eating_out", "type": "expense"},
  // "item": "Coffee",
  // "note": undefined, "occurredAt": 2026-01-08T19:59:04.909Z,
  // "type": "expense"}
  const accountId =
    input.accountId && input.accountId.includes('-')
      ? input.accountId
      : getAccountIdByKey('cash')

  const tx: Transaction = createTransaction(categoryIndex, {
    id: uuid(),
    occurredAt: input.occurredAt ?? new Date(),
    type: input.type ?? 'expense',
    item: input.item,
    money: { amount: input.amount, currency: 'USD' },
    accountId,
    category: input.category,
    merchant: input.merchant ?? '',
    note: input.note
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
