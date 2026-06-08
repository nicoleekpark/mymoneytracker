// ═══════════════════════════════════════════════════════════════════════════
// APPLICATION SERVICE: Account
// Business logic functions that orchestrate domain + infrastructure.
// ═══════════════════════════════════════════════════════════════════════════
//
// WHY APPLICATION LAYER?
// ----------------------
// This layer sits between features and domain/infrastructure:
//   features/ → application/ → domain/ (types) + infrastructure/ (repos)
//
// Services can import from:
//   ✅ @/domain/* (types, models, interfaces)
//   ✅ @/infrastructure/* (repository implementations)
//
// Domain layer stays pure (no infrastructure imports).
// ═══════════════════════════════════════════════════════════════════════════

// ─── Imports ────────────────────────────────────────────────────────────────

import type { UUID } from '@/core/domain/common/uuid'
import type { Account, AccountKind } from '@/core/domain/account'
import type { CreateAccountInput } from '@/core/domain/account/account.repository'
import { accountRepository, transactionRepository } from '@/infrastructure/repositories'
import { createTransaction, buildTxKey } from '@/core/domain/transaction'
import type { CategoryIndex } from '@/shared/config/categories.index'
import { uuid } from '@/shared/utils/uuid'

// ─── Types ──────────────────────────────────────────────────────────────────

export type AddAccountInput = {
  name: string
  kind: AccountKind
  bankName?: string
  lastFourDigits?: string
  initialBalance?: number  // Always positive; system determines if asset/liability
}

// ─── Use Cases ──────────────────────────────────────────────────────────────

/**
 * Get all active (non-archived) accounts.
 *
 * Used by: Dashboard Accounts tab, Transaction form account picker
 *
 * @returns Array of active Account objects, sorted by nature then kind
 *
 * @example
 * ```typescript
 * const accounts = getActiveAccounts()
 * // Returns: [{ id: '...', name: 'Chase Checking', kind: 'checking' }, ...]
 * ```
 */
export function getActiveAccounts(): Account[] {
  return accountRepository.listActive()
}

/**
 * Resolve an account's UUID from its system key.
 *
 * Used when: You have a key like "acct:cash_wallet" and need the UUID
 * for creating transactions or lookups.
 *
 * @param key - The system key (e.g., "acct:cash_wallet")
 * @returns The account's UUID
 * @throws Error if account not found for key
 *
 * @example
 * ```typescript
 * const cashAccountId = resolveAccountIdByKey('acct:cash_wallet')
 * // Returns: '550e8400-e29b-41d4-a716-446655440000'
 * ```
 */
export function resolveAccountIdByKey(key: string): UUID {
  return accountRepository.getIdByKey(key)
}

/**
 * Get an account by its UUID.
 */
export function getAccountById(id: UUID): Account | null {
  return accountRepository.getById(id)
}

/**
 * Create a new account with optional initial balance.
 *
 * If initialBalance is provided:
 * - For assets (cash, checking, savings, investment): Creates an "income" transaction
 * - For liabilities (credit_card, loan): Creates an "expense" transaction
 *
 * @param categoryIndex - Category index for transaction creation
 * @param input - Account creation input
 * @returns The created account
 */
export function createAccount(
  categoryIndex: CategoryIndex,
  input: AddAccountInput
): Account {
  // Create the account
  const createInput: CreateAccountInput = {
    name: input.name,
    kind: input.kind,
    bankName: input.bankName,
    lastFourDigits: input.lastFourDigits,
  }

  const account = accountRepository.create(createInput)

  // If initial balance is provided, create an opening balance transaction
  if (input.initialBalance && input.initialBalance > 0) {
    const isLiability = account.nature === 'liability'
    const txType = isLiability ? 'expense' : 'income'
    const occurredAt = new Date()

    const tx = createTransaction(categoryIndex, {
      id: uuid(),
      key: buildTxKey({
        occurredAt,
        type: txType,
        item: 'Opening Balance',
        merchant: undefined
      }),
      occurredAt,
      type: txType,
      item: 'Opening Balance',
      money: { amount: input.initialBalance, currency: 'USD' },
      accountId: account.id,
      category: { type: txType, categoryKey: 'adjustments', subCategoryKey: 'opening_balance' },
      note: `Initial balance for ${account.name}`,
    })

    transactionRepository.insertWithTags(tx, [])
  }

  return account
}
