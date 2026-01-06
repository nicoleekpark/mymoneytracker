import type { TransactionType } from './transaction'

export type TransactionRow = Readonly<{
  id: string
  occurred_at: string // ISO string
  type: TransactionType
  amount: number
  currency: 'USD'
  memo: string | null

  // TODO expand columns
  // category_type: 'income' | 'expense' | 'transfer' | null
  // category_id: string | null
  // sub_category_id: string | null
}>
