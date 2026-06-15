import type { Account, AccountCategory, AccountKind, AccountNature } from './account.types'

/**
 * Get the default category for an account kind.
 * Used when creating new accounts to auto-assign category.
 */
export function getDefaultCategoryForKind(kind: AccountKind): AccountCategory {
  switch (kind) {
    // Spending accounts
    case 'cash':
    case 'checking':
    case 'savings':
      return 'spending'
    // Investment & Retirement accounts
    case 'hsa':
    case '401k':
    case 'ira':
    case 'roth_ira':
    case '403b':
    case 'brokerage':
    case 'investment':
      return 'investment'
    // Liabilities
    case 'credit_card':
    case 'loan':
    case 'mortgage':
      return 'liability'
    // Other - default to spending, but user can override
    case 'other':
      return 'spending'
    default:
      return 'spending'
  }
}

/**
 * Get display name for an account kind.
 * Used in UI to show user-friendly labels.
 */
export function getKindDisplayName(kind: AccountKind, customKindName?: string): string {
  if (kind === 'other' && customKindName) {
    return customKindName
  }
  switch (kind) {
    case 'cash': return 'Cash'
    case 'checking': return 'Checking'
    case 'savings': return 'Savings'
    case 'hsa': return 'HSA'
    case '401k': return '401(k)'
    case 'ira': return 'IRA'
    case 'roth_ira': return 'Roth IRA'
    case '403b': return '403(b)'
    case 'brokerage': return 'Brokerage'
    case 'investment': return 'Investment'
    case 'credit_card': return 'Credit Card'
    case 'loan': return 'Loan'
    case 'mortgage': return 'Mortgage'
    case 'other': return 'Other'
    default: return kind
  }
}

/**
 * Sorting rules
 * UI / UX 기준으로 "사람이 인식하는 순서"
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
    // Spending
    case 'checking':
      return 0
    case 'savings':
      return 1
    case 'cash':
      return 2
    // Investment & Retirement
    case 'hsa':
      return 10
    case '401k':
      return 11
    case 'ira':
      return 12
    case 'roth_ira':
      return 13
    case '403b':
      return 14
    case 'brokerage':
      return 15
    case 'investment':
      return 16
    // Liabilities
    case 'credit_card':
      return 20
    case 'loan':
      return 21
    case 'mortgage':
      return 22
    // Other
    case 'other':
      return 99
    default:
      return 99
  }
}

/**
 * Helpers (domain semantics)
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

export function isInvestmentAccount(account: Account): boolean {
  return account.category === 'investment'
}

export function isSpendingAccount(account: Account): boolean {
  return account.category === 'spending'
}

/**
 * Check if an account should be included in net worth calculation.
 * All accounts contribute to net worth (assets positively, liabilities negatively).
 */
export function countsTowardNetWorth(_account: Account): boolean {
  // All accounts count toward net worth
  return true
}

/**
 * Investment account kinds for filtering
 */
export const INVESTMENT_KINDS: AccountKind[] = [
  'hsa', '401k', 'ira', 'roth_ira', '403b', 'brokerage', 'investment'
]

/**
 * Spending account kinds for filtering
 */
export const SPENDING_KINDS: AccountKind[] = [
  'cash', 'checking', 'savings'
]

/**
 * Liability account kinds for filtering
 */
export const LIABILITY_KINDS: AccountKind[] = [
  'credit_card', 'loan', 'mortgage'
]
