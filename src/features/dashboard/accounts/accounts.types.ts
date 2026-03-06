import type { Account, AccountKind } from '@/domain/account'

/**
 * Activity data for a single account within a period
 */
export type AccountActivity = Readonly<{
  account: Account
  // Balances (from asset snapshots) - null for "all time"
  startBalance: number | null
  endBalance: number
  // Transaction aggregates
  totalOut: number      // Spent (asset) / Charged (credit) / Withdrawn (investment)
  totalIn: number       // Earned (asset) / Paid (credit) / Deposited (investment)
  transferOut: number
  transferIn: number
  transactionCount: number
  hasActivity: boolean
}>

/**
 * Section keys - 3 main sections + Other
 */
export type SectionKey = 'cashAndSavings' | 'debt' | 'investments' | 'other'

/**
 * Group of accounts by section
 */
export type AccountGroup = {
  key: SectionKey
  label: string
  accounts: AccountActivity[]
  totalBalance: number  // Sum of all end balances in this section
}

/**
 * Summary data for strip cards (section-level aggregates)
 */
export type SectionSummary = Readonly<{
  key: SectionKey
  label: string
  startBalance: number | null  // null for "all time"
  endBalance: number
  delta: number | null         // null for "all time"
  isLiability: boolean         // true for debt section (affects delta coloring)
  hasAccounts: boolean         // true if there are accounts in this section
}>

/**
 * Colors for AccountsBody
 */
export type AccountsColors = Readonly<{
  text: string
  textSecondary: string
  border: string
  surface: string
  surfaceAlt: string
  primary: string
  success: string
  danger: string
}>

/**
 * Map AccountKind to section key
 */
export function getSectionKeyForKind(kind: AccountKind): SectionKey {
  switch (kind) {
    case 'cash':
    case 'checking':
    case 'savings':
      return 'cashAndSavings'
    case 'credit_card':
    case 'loan':
      return 'debt'
    case 'investment':
      return 'investments'
    default:
      return 'other'
  }
}

/**
 * Get display labels for out/in based on account nature
 */
export function getActivityLabels(account: Account): { outLabel: string; inLabel: string } {
  if (account.nature === 'liability') {
    if (account.kind === 'credit_card') {
      return { outLabel: 'Charged', inLabel: 'Paid' }
    }
    if (account.kind === 'loan') {
      return { outLabel: 'Borrowed', inLabel: 'Paid' }
    }
  }
  if (account.kind === 'investment') {
    return { outLabel: 'Withdrawn', inLabel: 'Deposited' }
  }
  // Default for cash/checking/savings
  return { outLabel: 'Spent', inLabel: 'Earned' }
}

/**
 * Section labels
 */
export const SECTION_LABELS: Record<SectionKey, string> = {
  cashAndSavings: 'Cash & Savings',
  debt: 'Debt',
  investments: 'Investments',
  other: 'Other',
}

/**
 * Section order for display
 */
export const SECTION_ORDER: SectionKey[] = [
  'cashAndSavings',
  'debt',
  'investments',
  'other',
]
