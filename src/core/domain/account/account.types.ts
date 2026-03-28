// ═══════════════════════════════════════════════════════════════════════════
// DOMAIN TYPES: Account
// Pure type definitions for the Account domain entity.
// NO LOGIC, NO IMPORTS FROM INFRASTRUCTURE - types only.
// ═══════════════════════════════════════════════════════════════════════════
//
// WHAT IS AN ACCOUNT?
// -------------------
// An Account represents a place where money is held or owed:
// - Assets: Cash, Checking, Savings, Investments (money you HAVE)
// - Liabilities: Credit Cards, Loans (money you OWE)
//
// Each transaction in the app is linked to an account.
//
// ═══════════════════════════════════════════════════════════════════════════

import type { UUID } from '@/core/domain/common/uuid'

// ─── Account Nature ─────────────────────────────────────────────────────────
// Fundamental classification: do you HAVE this money or OWE it?

/** Whether an account represents money you have (asset) or owe (liability) */
export type AccountNature = 'asset' | 'liability'

// ─── Account Kind ───────────────────────────────────────────────────────────
// More specific categorization for grouping and display

/**
 * The specific type of account.
 * Used for grouping in the Accounts tab and determining behavior.
 *
 * Assets:
 * - cash: Physical cash, wallets
 * - checking: Bank checking accounts
 * - savings: Bank savings accounts, money market
 * - investment: Brokerage, 401k, IRA
 *
 * Liabilities:
 * - credit_card: Credit cards
 * - loan: Mortgages, car loans, student loans
 *
 * Other:
 * - other: Anything that doesn't fit above
 */
export type AccountKind =
  | 'cash'
  | 'checking'
  | 'savings'
  | 'credit_card'
  | 'loan'
  | 'investment'
  | 'other'

// ─── Account Entity ─────────────────────────────────────────────────────────

/**
 * An account where money is held or owed.
 *
 * @example
 * ```typescript
 * const cashWallet: Account = {
 *   id: '550e8400-e29b-41d4-a716-446655440000',
 *   key: 'acct:cash_wallet',
 *   name: 'Cash Wallet',
 *   nature: 'asset',
 *   kind: 'cash',
 * }
 * ```
 */
export type Account = {
  /** Unique identifier (UUID) */
  id: UUID

  /** System key for lookups (e.g., "acct:cash_wallet") */
  key: string

  /** Human-readable name (e.g., "Chase Checking") */
  name: string

  /** Asset (you have) or liability (you owe) */
  nature: AccountNature

  /** Specific type for grouping (cash, checking, credit_card, etc.) */
  kind: AccountKind

  /** Currency code (e.g., "USD"). Optional, defaults to app currency. */
  currency?: string

  /** Display order within its group. Lower = higher in list. */
  sortOrder?: number

  /** System accounts can't be deleted (e.g., default "Cash" account) */
  isSystem?: boolean

  /** Archived accounts are hidden but preserved for historical data */
  isArchived?: boolean
}
