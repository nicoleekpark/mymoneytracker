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
  key: string
  name: string

  nature: 'asset' | 'liability'
  kind: AccountKind

  currency?: string
  sortOrder?: number

  isSystem?: boolean
  isArchived?: boolean
}
