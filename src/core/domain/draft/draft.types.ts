/**
 * Domain types for transaction drafts.
 * Drafts are incomplete transactions saved for later completion.
 */

import type { CategoryRef } from '@/core/domain/category/category.types'
import type { TransactionType } from '@/core/domain/transaction/transaction.types'

/**
 * A draft transaction - saved but not yet committed.
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
 * Input for creating a new draft.
 */
export type CreateDraftInput = {
  type: TransactionType
  item?: string
  amountCents?: number
  merchant?: string
  note?: string
  tags?: string[]
  categoryRef?: CategoryRef
  accountKey?: string
  occurredAt?: string
  receiptUri?: string
  starred?: boolean
}
