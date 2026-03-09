/**
 * Transaction CRUD Operations
 *
 * Core create, read, update, delete operations for transactions.
 * All operations use the repository pattern for data persistence.
 */
import type { CategoryIndex } from '@/config/categories.index'
import { uuid } from '@/shared/utils/uuid'
import type { UUID } from '@/domain/common/uuid'
import { transactionRepository } from '@/infrastructure/repositories'
import { createTransaction } from './transaction.model'
import type { AddTransactionInput, Transaction } from './transaction.types'
import { buildTxKey } from './transaction.utils'

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
    item: input.item,
    money: { amount: input.amount, currency: 'USD' },
    merchant: input.merchant?.trim(),
    note: input.note?.trim(),
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
        })

  transactionRepository.insert(tx)

  // Persist tags to junction table
  if (input.tags && input.tags.length > 0) {
    transactionRepository.saveTags(tx.id, input.tags)
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

  const fromStr = from.toISOString().slice(0, 10)
  const toStr = to.toISOString().slice(0, 10)

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
    item: input.item,
    money: { amount: input.amount, currency: 'USD' },
    merchant: input.merchant?.trim(),
    note: input.note?.trim(),
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
        })

  transactionRepository.update(tx)

  // Update tags
  if (input.tags && input.tags.length > 0) {
    transactionRepository.saveTags(tx.id, input.tags)
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
  transactionRepository.insert(tx)

  // Restore tags if present
  if (tx.tags && tx.tags.length > 0) {
    transactionRepository.saveTags(tx.id, tx.tags)
  }
}
