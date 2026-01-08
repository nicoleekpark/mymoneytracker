import type { TransactionType } from './transaction'

export type TransactionRow = Readonly<{
  id: string
  occurred_at: string
  type: TransactionType
  amount_cents: number
  currency: string
  account_id: string
  category_id: string | null
  merchant: string | null
  note: string | null
  item: string
}>
