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
import type { Account } from '@/core/domain/account'
import { accountRepository } from '@/infrastructure/repositories'

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
