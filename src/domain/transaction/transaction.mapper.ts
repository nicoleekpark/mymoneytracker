import type { Transaction } from './transaction'
import type { TransactionRow } from './transaction.types'

export function rowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    occurredAt: new Date(row.occurred_at),
    type: row.type,
    money: { amount: row.amount, currency: row.currency },
    memo: row.memo ?? undefined
    // TODO expand column/object
  }
}

export function transactionToRow(tx: Transaction): TransactionRow {
  return {
    id: tx.id,
    occurred_at: tx.occurredAt.toISOString(),
    type: tx.type,
    amount: tx.money.amount,
    currency: tx.money.currency,
    memo: tx.memo ?? null
    // TODO expand column/object
  }
}
