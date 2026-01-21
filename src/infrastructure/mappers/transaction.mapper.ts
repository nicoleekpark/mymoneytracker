import { centsToDollars, dollarsToCents } from '@/domain/common/money'
import type { UUID } from '@/domain/common/uuid'
import type { CategoryDbId, CategoryRef } from '@/domain/category/category.types'
import type { Transaction, TransactionType } from '@/domain/transaction/transaction.types'

/**
 * Database row representation of a transaction.
 * Uses snake_case to match SQLite column names.
 */
export type TransactionRow = Readonly<{
  id: UUID
  key: string
  occurred_at: string
  type: TransactionType
  item: string

  amount_cents: number
  currency: string

  account_id: UUID | null
  from_account_id: UUID | null
  to_account_id: UUID | null

  category_id: UUID | null
  merchant: string | null
  note: string | null
}>

/**
 * Category resolver function type.
 * Used to decouple the mapper from direct repo imports.
 */
export type CategoryRefResolver = (categoryDbId: UUID) => CategoryRef
export type CategoryIdResolver = (ref?: CategoryRef) => CategoryDbId | null

/**
 * Convert a database row to a domain Transaction object.
 */
export function rowToTransaction(
  row: TransactionRow,
  resolveCategoryRef: CategoryRefResolver
): Transaction {
  const base = {
    id: row.id,
    key: row.key,
    occurredAt: new Date(row.occurred_at),
    type: row.type,
    item: row.item,
    money: { amount: centsToDollars(row.amount_cents), currency: row.currency },
    category: row.category_id ? resolveCategoryRef(row.category_id) : undefined,
    merchant: row.merchant ?? undefined,
    note: row.note ?? undefined,
  } as const

  if (row.type === 'transfer') {
    return {
      ...base,
      type: 'transfer',
      fromAccountId: row.from_account_id as UUID,
      toAccountId: row.to_account_id as UUID,
    }
  }

  return {
    ...base,
    type: row.type,
    accountId: row.account_id as UUID,
  }
}

/**
 * Convert a domain Transaction object to a database row.
 */
export function transactionToRow(
  tx: Transaction,
  resolveCategoryId: CategoryIdResolver
): TransactionRow {
  const base = {
    id: tx.id,
    key: tx.key,
    occurred_at: tx.occurredAt.toISOString(),
    type: tx.type,
    item: tx.item,
    amount_cents: dollarsToCents(tx.money.amount),
    currency: tx.money.currency,
    category_id: resolveCategoryId(tx.category) ?? null,
    merchant: tx.merchant ?? null,
    note: tx.note ?? null,
  }

  if (tx.type === 'transfer') {
    return {
      ...base,
      account_id: null,
      from_account_id: tx.fromAccountId,
      to_account_id: tx.toAccountId,
    }
  }

  return {
    ...base,
    account_id: tx.accountId,
    from_account_id: null,
    to_account_id: null,
  }
}
