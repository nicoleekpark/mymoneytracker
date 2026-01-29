import type { Transaction } from './transaction.types'

/**
 * Type guard for expense transactions
 */
export function isExpense(tx: Transaction): boolean {
  return tx.type === 'expense'
}

/**
 * Type guard for income transactions
 */
export function isIncome(tx: Transaction): boolean {
  return tx.type === 'income'
}

/**
 * Type guard for transfer transactions
 */
export function isTransfer(tx: Transaction): boolean {
  return tx.type === 'transfer'
}

/**
 * Safely extract date from transaction.
 * Handles both Date objects and ISO string from DB.
 */
export function safeDate(tx: Transaction): Date {
  const d = tx.occurredAt instanceof Date
    ? tx.occurredAt
    : new Date(tx.occurredAt as unknown as string)
  return Number.isNaN(d.getTime()) ? new Date(0) : d
}

/**
 * Get the transaction amount (always positive)
 */
export function transactionAmount(tx: Transaction): number {
  return tx.money.amount
}
