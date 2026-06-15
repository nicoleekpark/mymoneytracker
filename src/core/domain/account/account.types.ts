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

// ─── Account Category ───────────────────────────────────────────────────────
// High-level grouping for accounts

/**
 * High-level account category for grouping and net worth calculation.
 *
 * - spending: Day-to-day transaction accounts (checking, savings, cash)
 * - investment: Investment & retirement accounts (401k, IRA, HSA, brokerage)
 * - liability: Money you owe (credit cards, loans, mortgages)
 */
export type AccountCategory = 'spending' | 'investment' | 'liability'

// ─── Account Kind ───────────────────────────────────────────────────────────
// More specific categorization for grouping and display

/**
 * The specific type of account.
 * Used for grouping in the Accounts tab and determining behavior.
 *
 * Spending (day-to-day):
 * - cash: Physical cash, wallets
 * - checking: Bank checking accounts
 * - savings: Bank savings accounts, money market
 *
 * Investment & Retirement:
 * - hsa: Health Savings Account
 * - 401k: 401(k) retirement account
 * - ira: Traditional IRA
 * - roth_ira: Roth IRA
 * - 403b: 403(b) retirement account
 * - brokerage: Taxable brokerage account
 * - investment: Generic investment account (legacy)
 *
 * Liabilities:
 * - credit_card: Credit cards
 * - loan: Personal loans, car loans, student loans
 * - mortgage: Home mortgage
 *
 * Other:
 * - other: Custom account type (use customKindName for display)
 */
export type AccountKind =
  // Spending
  | 'cash'
  | 'checking'
  | 'savings'
  // Investment & Retirement
  | 'hsa'
  | '401k'
  | 'ira'
  | 'roth_ira'
  | '403b'
  | 'brokerage'
  | 'investment'  // legacy/generic
  // Liabilities
  | 'credit_card'
  | 'loan'
  | 'mortgage'
  // Custom
  | 'other'

// ─── Account Entity ─────────────────────────────────────────────────────────

/**
 * An account where money is held or owed.
 *
 * @example
 * ```typescript
 * const cash: Account = {
 *   id: '550e8400-e29b-41d4-a716-446655440000',
 *   key: 'acct:cash_wallet',
 *   name: 'Cash',
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

  /**
   * High-level category for grouping and net worth display.
   * - spending: Shows in Accounts, contributes to "Accessible" in Assets
   * - investment: Shows in Accounts, contributes to "Investments" in Assets
   * - liability: Shows in Accounts, contributes to "Liabilities" in Assets
   */
  category: AccountCategory

  /**
   * Custom kind name when kind is 'other'.
   * Used for display (e.g., "SEP IRA", "529 Plan").
   */
  customKindName?: string

  /** Currency code (e.g., "USD"). Optional, defaults to app currency. */
  currency?: string

  /** Display order within its group. Lower = higher in list. */
  sortOrder?: number

  /** System accounts can't be deleted (e.g., default "Cash" account) */
  isSystem?: boolean

  /** Archived accounts are hidden but preserved for historical data */
  isArchived?: boolean

  /** Bank or issuer name (e.g., "Chase", "American Express") */
  bankName?: string

  /** Last 4 digits of account number (e.g., "1234") */
  lastFourDigits?: string

  /** When the account was created (ISO 8601 string). Undefined for legacy accounts. */
  createdAt?: string

  /** When the account was archived (ISO 8601 string), null if not archived */
  archivedAt?: string | null
}
