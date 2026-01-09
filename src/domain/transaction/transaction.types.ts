import { UUID } from '@/domain/common/uuid'
import type { TransactionType } from './transaction'

export type TransactionRow = Readonly<{
  id: UUID
  occurred_at: string
  type: TransactionType
  amount_cents: number
  currency: string
  account_id: UUID
  category_id: UUID | null
  merchant: string | null
  note: string | null
  item: string
}>
