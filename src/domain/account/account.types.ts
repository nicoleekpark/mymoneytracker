import type { UUID } from '@/domain/common/uuid'

export type AccountType = 'cash' | 'bank' | 'credit' | 'other'

export type Account = Readonly<{
  id: UUID
  key: string
  name: string
  type: AccountType
}>