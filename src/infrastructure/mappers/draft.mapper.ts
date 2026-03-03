import type { CategoryRef } from '@/domain/category/category.types'
import type { TransactionType } from '@/domain/transaction/transaction.types'

/**
 * Domain representation of a draft transaction.
 */
export type DraftTransaction = {
  id: string
  type: TransactionType
  item: string
  amountCents: number
  merchant?: string
  note?: string
  tags?: string[]
  categoryRef?: CategoryRef
  accountKey?: string
  occurredAt: string // ISO string
  receiptUri?: string
  createdAt: string // ISO string
  starred: boolean
}

/**
 * Database row representation of a draft.
 */
export type DraftRow = {
  id: string
  type: TransactionType
  item: string | null
  amount_cents: number | null
  currency: string | null
  merchant: string | null
  note: string | null
  tags: string | null // JSON array
  category_type: string | null
  category_key: string | null
  subcategory_key: string | null
  account_key: string | null
  occurred_at: string | null
  receipt_uri: string | null
  created_at: string
  updated_at: string
  starred: number
}

/**
 * Convert a database row to a domain DraftTransaction.
 */
export function rowToDraft(row: DraftRow): DraftTransaction {
  const categoryRef: CategoryRef | undefined =
    row.category_type && row.category_key
      ? {
          type: row.category_type as 'expense' | 'income',
          categoryKey: row.category_key,
          subCategoryKey: row.subcategory_key ?? undefined,
        }
      : undefined

  // Parse tags from JSON
  let tags: string[] | undefined
  if (row.tags) {
    try {
      const parsed = JSON.parse(row.tags)
      if (Array.isArray(parsed) && parsed.length > 0) {
        tags = parsed
      }
    } catch {
      // Invalid JSON, ignore
    }
  }

  return {
    id: row.id,
    type: row.type,
    item: row.item ?? '',
    amountCents: row.amount_cents ?? 0,
    merchant: row.merchant ?? undefined,
    note: row.note ?? undefined,
    tags,
    categoryRef,
    accountKey: row.account_key ?? undefined,
    occurredAt: row.occurred_at ?? new Date().toISOString(),
    receiptUri: row.receipt_uri ?? undefined,
    createdAt: row.created_at,
    starred: row.starred === 1,
  }
}

/**
 * Convert a domain DraftTransaction to a database row.
 */
export function draftToRow(draft: DraftTransaction): Omit<DraftRow, 'updated_at'> {
  return {
    id: draft.id,
    type: draft.type,
    item: draft.item || null,
    amount_cents: draft.amountCents || null,
    currency: 'USD',
    merchant: draft.merchant ?? null,
    note: draft.note ?? null,
    tags: draft.tags && draft.tags.length > 0 ? JSON.stringify(draft.tags) : '[]',
    category_type: draft.categoryRef?.type ?? null,
    category_key: draft.categoryRef?.categoryKey ?? null,
    subcategory_key: draft.categoryRef?.subCategoryKey ?? null,
    account_key: draft.accountKey ?? null,
    occurred_at: draft.occurredAt,
    receipt_uri: draft.receiptUri ?? null,
    created_at: draft.createdAt,
    starred: draft.starred ? 1 : 0,
  }
}
