import type { UUID } from '@/domain/common/uuid'

export type AccountNature = 'asset' | 'liability'

export type AccountKind =
  | 'cash'
  | 'checking'
  | 'savings'
  | 'credit_card'
  | 'loan'
  | 'investment'
  | 'other'

export type Account = {
  id: UUID
  key: string // ex. acct:cash_wallet
  name: string // ex. "Cash Wallet"

  nature: 'asset' | 'liability'
  kind: AccountKind

  currency?: string
  sortOrder?: number

  isSystem?: boolean
  isArchived?: boolean
}
