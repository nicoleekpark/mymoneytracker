// Domain layer - Transaction (pure types, models, interfaces)
// Use cases moved to @/application/transaction

export type {
  AddTransactionInput,
  Money,
  Transaction,
  TransactionType
} from './transaction.types'

export type {
  MonthlyExpenseTotal
} from './transaction.repository'

// Model - factory functions
export { createTransaction } from './transaction.model'

// Utils - pure functions
export {
  buildTxKey,
  currentMonthYYYYMM,
  getDaysInMonth,
  getYearProgressMonths,
  isExpense,
  isIncome,
  isTransfer,
  safeDate,
  slugify,
  transactionAmount
} from './transaction.utils'

// Zod schemas for runtime validation
export {
  TransactionTypeSchema,
  MoneySchema,
  parseTransactionType,
} from './transaction.schema'
