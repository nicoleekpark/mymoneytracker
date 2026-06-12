/**
 * Transaction Mapper
 *
 * Converts between SQLite rows and domain Transaction objects.
 *
 * ## Coercion Conventions
 *
 * | DB Type | Domain Type | Conversion |
 * |---------|-------------|------------|
 * | `null` | `undefined` | DB null → domain undefined |
 * | `number` (0/1) | `boolean` | `row.is_estimated === 1` |
 * | `number` (cents) | `Money` | `centsToDollars(row.amount_cents)` |
 * | `string` (enum) | Typed enum | `parseTransactionType(row.type)` |
 * | `string` (ISO) | `string` | Pass through (dates stay as ISO strings) |
 *
 * ## Validation
 * - Enum fields use Zod parse functions for runtime validation
 * - Invalid enums fall back to safe defaults (see schema files)
 */

import { centsToDollars, dollarsToCents } from '@/core/domain/common/money'
import type { UUID } from '@/core/domain/common/uuid'
import type { CategoryDbId, CategoryRef } from '@/core/domain/category/category.types'
import type { Transaction, TransactionType } from '@/core/domain/transaction/transaction.types'
import { parseTransactionType } from '@/core/domain/transaction/transaction.schema'

/**
 * Database row representation of a transaction.
 * Uses snake_case to match SQLite column names.
 */
export type TransactionRow = Readonly<{
  id: UUID
  key: string
  occurred_at: string
  type: TransactionType
  item: string | null

  amount_cents: number
  currency: string

  account_id: UUID | null
  from_account_id: UUID | null
  to_account_id: UUID | null
  fee_cents: number | null // deprecated, kept for migration compatibility
  parent_transaction_id: UUID | null // links child transactions to parent

  category_id: UUID | null
  merchant: string | null
  note: string | null
  member_id: UUID | null
  is_estimated: number // 0 or 1
}>

/**
 * Category resolver function type.
 * Used to decouple the mapper from direct repo imports.
 */
export type CategoryRefResolver = (categoryDbId: UUID) => CategoryRef | null
export type CategoryIdResolver = (ref?: CategoryRef) => CategoryDbId | null

/**
 * Convert a database row to a domain Transaction object.
 */
export function rowToTransaction(
  row: TransactionRow,
  resolveCategoryRef: CategoryRefResolver,
  tags?: string[]
): Transaction {
  // Validate enum at runtime using Zod schema
  const validatedType = parseTransactionType(row.type)

  const base = {
    id: row.id,
    key: row.key,
    occurredAt: new Date(row.occurred_at),
    type: validatedType,
    item: row.item && row.item !== 'Not added' ? row.item : undefined,
    money: { amount: centsToDollars(row.amount_cents), currency: row.currency },
    category: row.category_id ? resolveCategoryRef(row.category_id) ?? undefined : undefined,
    merchant: row.merchant ?? undefined,
    note: row.note ?? undefined,
    memberId: row.member_id ?? undefined,
    isEstimated: row.is_estimated === 1 ? true : undefined,
    tags: tags && tags.length > 0 ? tags : undefined,
    parentTransactionId: row.parent_transaction_id ?? undefined,
  } as const

  if (validatedType === 'transfer') {
    return {
      ...base,
      type: 'transfer',
      fromAccountId: row.from_account_id as UUID,
      toAccountId: row.to_account_id as UUID,
    }
  }

  return {
    ...base,
    type: validatedType as 'income' | 'expense',
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
    item: tx.item ?? null,
    amount_cents: dollarsToCents(tx.money.amount),
    currency: tx.money.currency,
    category_id: resolveCategoryId(tx.category) ?? null,
    merchant: tx.merchant ?? null,
    note: tx.note ?? null,
    member_id: tx.memberId ?? null,
    is_estimated: tx.isEstimated ? 1 : 0,
    parent_transaction_id: tx.parentTransactionId ?? null,
  }

  if (tx.type === 'transfer') {
    return {
      ...base,
      account_id: null,
      from_account_id: tx.fromAccountId,
      to_account_id: tx.toAccountId,
      fee_cents: null,
    }
  }

  return {
    ...base,
    account_id: tx.accountId,
    from_account_id: null,
    to_account_id: null,
    fee_cents: null,
  }
}
