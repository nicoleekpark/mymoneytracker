// ═══════════════════════════════════════════════════════════════════════════
// APPLICATION SERVICE: Transaction CRUD
// Core create, read, update, delete operations for transactions.
// ═══════════════════════════════════════════════════════════════════════════

import type { CategoryIndex } from '@/shared/config/categories.index'
import { uuid } from '@/shared/utils/uuid'
import { toLocalDateString } from '@/shared/utils/date'
import type { UUID } from '@/core/domain/common/uuid'
import type { AddTransactionInput, Transaction } from '@/core/domain/transaction'
import { createTransaction, buildTxKey } from '@/core/domain/transaction'
import { checkBudgetAlert } from '@/core/services/notification'
import { transactionRepository } from '@/infrastructure/repositories'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** Max length limits for user input strings (prevents DB bloat and display issues) */
const INPUT_LIMITS = {
  MERCHANT: 100,
  NOTE: 500,
  ITEM: 200,
} as const

/**
 * Sanitize and truncate user input string.
 * Trims whitespace and enforces max length.
 */
function sanitizeInput(value: string | undefined, maxLength: number): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  if (trimmed.length === 0) return undefined
  return trimmed.slice(0, maxLength)
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type TransactionPage = Readonly<{
  items: Transaction[]
  hasMore: boolean
  oldestDate: string | null
}>

// ─────────────────────────────────────────────────────────────────────────────
// Create Operations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Add a new transaction to the database
 */
export async function addTransaction(
  categoryIndex: CategoryIndex,
  input: AddTransactionInput
): Promise<Transaction> {
  const occurredAt = input.occurredAt ?? new Date()

  // Use provided key or generate one from transaction metadata
  const txKey =
    (input.key && input.key.trim().length > 0)
      ? input.key.trim()
      : buildTxKey({
          occurredAt,
          type: input.type,
          item: input.item,
          merchant: input.merchant
        })

  const base = {
    id: uuid(),
    key: txKey,
    occurredAt,
    type: input.type,
    item: sanitizeInput(input.item, INPUT_LIMITS.ITEM) ?? input.item,
    money: { amount: input.amount, currency: 'USD' },
    merchant: sanitizeInput(input.merchant, INPUT_LIMITS.MERCHANT),
    note: sanitizeInput(input.note, INPUT_LIMITS.NOTE),
    category: input.category,
    tags: input.tags,
    isEstimated: input.isEstimated,
  }

  // Create domain model with proper type discrimination
  const tx: Transaction =
    input.type === 'transfer'
      ? createTransaction(categoryIndex, {
          ...base,
          type: 'transfer',
          fromAccountId: input.fromAccountId,
          toAccountId: input.toAccountId,
        })
      : createTransaction(categoryIndex, {
          ...base,
          type: input.type,
          accountId: input.accountId,
          parentTransactionId: input.parentTransactionId,
        })

  // Insert transaction + tags atomically
  transactionRepository.insertWithTags(tx, input.tags)

  // Check budget alert after expense transactions
  if (tx.type === 'expense') {
    checkBudgetAlert()
  }

  return tx
}

// ─────────────────────────────────────────────────────────────────────────────
// Read Operations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get recent transactions (default: 200)
 */
export async function getTransactions(limit = 200): Promise<Transaction[]> {
  return transactionRepository.list(limit)
}

/**
 * Get transactions within a date range with pagination.
 * Default: 1 year from today.
 */
export async function getTransactionsInRange(
  fromDate?: Date,
  toDate?: Date,
  limit = 500
): Promise<TransactionPage> {
  const now = new Date()
  const to = toDate ?? now
  const from = fromDate ?? new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())

  const fromStr = toLocalDateString(from)
  const toStr = toLocalDateString(to)

  return transactionRepository.listInDateRange(fromStr, toStr, limit)
}

/**
 * Get all transactions for a specific date (YYYY-MM-DD)
 */
export async function getTransactionsForDate(dateYYYYMMDD: string, limit = 50): Promise<Transaction[]> {
  return transactionRepository.listForDate(dateYYYYMMDD, limit)
}

/**
 * Get a single transaction by ID
 */
export async function getTransactionById(id: UUID): Promise<Transaction | null> {
  return transactionRepository.getById(id)
}

/**
 * Get all transfers for a specific month (YYYY-MM)
 */
export async function getTransfersForMonth(monthYYYYMM: string, limit = 500): Promise<Transaction[]> {
  return transactionRepository.listTransfersForMonth(monthYYYYMM, limit)
}

// ─────────────────────────────────────────────────────────────────────────────
// Update Operations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Update an existing transaction
 */
export async function updateTransaction(
  categoryIndex: CategoryIndex,
  id: UUID,
  input: AddTransactionInput
): Promise<Transaction> {
  const occurredAt = input.occurredAt ?? new Date()

  const existingTx = transactionRepository.getById(id)
  if (!existingTx) {
    throw new Error(`Transaction not found: ${id}`)
  }

  const base = {
    id,
    key: existingTx.key, // Preserve original key
    occurredAt,
    type: input.type,
    item: sanitizeInput(input.item, INPUT_LIMITS.ITEM) ?? input.item,
    money: { amount: input.amount, currency: 'USD' },
    merchant: sanitizeInput(input.merchant, INPUT_LIMITS.MERCHANT),
    note: sanitizeInput(input.note, INPUT_LIMITS.NOTE),
    category: input.category,
    tags: input.tags,
    isEstimated: input.isEstimated,
  }

  const tx: Transaction =
    input.type === 'transfer'
      ? createTransaction(categoryIndex, {
          ...base,
          type: 'transfer',
          fromAccountId: input.fromAccountId,
          toAccountId: input.toAccountId,
        })
      : createTransaction(categoryIndex, {
          ...base,
          type: input.type,
          accountId: input.accountId,
          parentTransactionId: input.parentTransactionId,
        })

  // Update transaction + tags atomically
  transactionRepository.updateWithTags(tx, input.tags)

  // Check budget alert after expense transactions
  if (tx.type === 'expense') {
    checkBudgetAlert()
  }

  return tx
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete Operations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Permanently delete a transaction
 */
export async function removeTransaction(id: UUID): Promise<void> {
  transactionRepository.delete(id)
}

/**
 * Restore a previously deleted transaction.
 * Re-inserts the full transaction object (including its original ID).
 */
export async function restoreTransaction(tx: Transaction): Promise<void> {
  // Restore transaction + tags atomically
  transactionRepository.insertWithTags(tx, tx.tags)
}

// ─────────────────────────────────────────────────────────────────────────────
// Balance Adjustment Operations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Adjust an account's balance by creating a balance adjustment transaction.
 *
 * Used when:
 * - User manually edits the balance on Account Detail screen
 * - Investment account market value changes
 *
 * First balance adjustment for an account is marked as "Opening Balance".
 * Subsequent adjustments are "Balance Correction".
 *
 * @param categoryIndex - Category index for transaction creation
 * @param accountId - The account to adjust
 * @param adjustmentAmount - The amount to adjust by (positive = increase, negative = decrease)
 * @returns The created adjustment transaction
 */
export async function adjustAccountBalance(
  categoryIndex: CategoryIndex,
  accountId: UUID,
  adjustmentAmount: number
): Promise<Transaction> {
  if (adjustmentAmount === 0) {
    throw new Error('Adjustment amount cannot be zero')
  }

  const occurredAt = new Date()

  // Check if this is the first balance entry for this account
  const hasExistingOpeningBalance = transactionRepository.hasOpeningBalanceForAccount(accountId)
  const isOpeningBalance = !hasExistingOpeningBalance

  // Determine transaction type based on adjustment direction
  // For assets: positive adjustment = income (balance increase), negative = expense (balance decrease)
  // For liabilities: we track debt as positive amounts, so adjustments work the same way
  const type = adjustmentAmount > 0 ? 'income' : 'expense'
  const absAmount = Math.abs(adjustmentAmount)

  const item = isOpeningBalance ? 'Opening Balance' : 'Balance Adjustment'
  const note = isOpeningBalance ? 'Initial balance' : 'Manual balance update'
  // Use different category key and subcategory for expense vs income adjustments
  const categoryKey = type === 'income' ? 'adjustments' : 'expense_adjustments'
  const subCategoryKey = type === 'income'
    ? (isOpeningBalance ? 'opening_balance' : 'balance_correction')
    : (isOpeningBalance ? 'expense_opening_balance' : 'expense_balance_correction')

  const txKey = buildTxKey({
    occurredAt,
    type,
    item,
    merchant: undefined,
  })

  const tx = createTransaction(categoryIndex, {
    id: uuid(),
    key: txKey,
    occurredAt,
    type,
    item,
    money: { amount: absAmount, currency: 'USD' },
    accountId,
    category: { type, categoryKey, subCategoryKey },
    note,
    isOpeningBalance,
  })

  transactionRepository.insertWithTags(tx, [])

  return tx
}
