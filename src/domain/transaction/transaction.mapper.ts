import { centsToDollars, dollarsToCents } from '@/domain/common/money';
import { resolveCategoryId, resolveCategoryRefFromDbId } from '../category/category.resolve';
import type { Transaction } from './transaction';
import type { TransactionRow } from './transaction.types';

export function rowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    occurredAt: new Date(row.occurred_at),
    type: row.type,
    money: {
      amount: centsToDollars(row.amount_cents),
      currency: row.currency,
    },
    accountId: row.account_id,
    category: row.category_id ? resolveCategoryRefFromDbId(row.category_id) : undefined,
    merchant: row.merchant ?? undefined,
    note: row.note ?? undefined,
    item: row.item,
  }
}

export function transactionToRow(tx: Transaction): TransactionRow {
  return {
    id: tx.id,
    occurred_at: tx.occurredAt.toISOString(),
    type: tx.type,
    amount_cents: dollarsToCents(tx.money.amount),
    currency: tx.money.currency,
    account_id: tx.accountId,
    category_id: tx.category ? resolveCategoryId(tx.category) : null,
    merchant: null,
    note: tx.note ?? null,
    item: tx.item,
  }
}