import type { Account, AccountKind, AccountNature } from './account.types'

export function normalizeAccountNature(raw: string): AccountNature {
  return raw === 'asset' || raw === 'liability' ? raw : 'asset'
}

export function normalizeAccountKind(raw: string): AccountKind {
  switch (raw) {
    case 'cash':
    case 'checking':
    case 'savings':
    case 'credit_card':
    case 'loan':
    case 'investment':
      return raw
    default:
      return 'other'
  }
}

/**
 * Sorting rules
 * UI / UX 기준으로 “사람이 인식하는 순서”
 */
export function accountNatureSortRank(nature: AccountNature): number {
  switch (nature) {
    case 'asset':
      return 0
    case 'liability':
      return 1
    default:
      return 9
  }
}

export function accountKindSortRank(kind: AccountKind): number {
  switch (kind) {
    case 'checking':
      return 0
    case 'savings':
      return 1
    case 'cash':
      return 2
    case 'credit_card':
      return 3
    case 'investment':
      return 4
    case 'loan':
      return 5
    default:
      return 9
  }
}

/**
 * Optional helpers (domain semantics)
 */
export function isAssetAccount(account: Account): boolean {
  return account.nature === 'asset'
}

export function isLiabilityAccount(account: Account): boolean {
  return account.nature === 'liability'
}

export function isCashAccount(account: Account): boolean {
  return account.kind === 'cash'
}

export function isCreditCard(account: Account): boolean {
  return account.kind === 'credit_card'
}
