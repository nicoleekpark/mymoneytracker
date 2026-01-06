import type { Transaction } from './transaction';
import type { TransactionRow } from './transaction.types';

export function rowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    occurredAt: new Date(row.occurred_at),
    type: row.type,
    money: {
      amount: row.amount_cents / 100,
      currency: row.currency,
    },
    memo: row.note ?? undefined,
  }
}

export function transactionToRow(
  tx: Transaction,
  opts: { accountId: string; categoryId?: string | null }
): TransactionRow {
  return {
    id: tx.id,
    occurred_at: tx.occurredAt.toISOString(),
    type: tx.type,
    amount_cents: Math.round(tx.money.amount * 100),
    currency: tx.money.currency,
    account_id: opts.accountId,
    category_id: opts.categoryId ?? null,
    merchant: null,
    note: tx.memo ?? null,
  }
}