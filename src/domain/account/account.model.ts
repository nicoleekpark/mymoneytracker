import type { AccountType } from './account.types'

export function normalizeAccountType(raw: string): AccountType {
  if (raw === 'cash' || raw === 'bank' || raw === 'credit') return raw
  return 'other'
}

export function accountTypeSortRank(type: AccountType): number {
  switch (type) {
    case 'cash':
      return 0
    case 'bank':
      return 1
    case 'credit':
      return 2
    default:
      return 9
  }
}
