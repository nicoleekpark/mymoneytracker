import type { UUID } from '@/core/domain/common/uuid'
import type { Transaction } from './transaction.types'

/**
 * Types for repository return values (internal, cents-based)
 */
export type MonthlyExpenseTotal = Readonly<{
  month: string
  totalCents: number
}>

export type DailyExpenseTotal = Readonly<{
  day: string // YYYY-MM-DD
  totalCents: number
}>

export type MonthlyExpenseByCategory = Readonly<{
  categoryId: UUID | null
  categoryName: string | null
  totalCents: number
}>

export type MonthlyIncomeByCategory = Readonly<{
  categoryId: UUID | null
  categoryName: string | null
  totalCents: number
}>

export type DailyFlowTotal = Readonly<{
  day: string // YYYY-MM-DD
  type: 'income' | 'expense'
  totalCents: number
}>

export type DailyFlowTotalWithCount = Readonly<{
  day: string
  type: 'income' | 'expense'
  totalCents: number
  txCount: number
}>

export type MonthlyFlowTotal = Readonly<{
  month: string // YYYY-MM
  type: 'income' | 'expense'
  totalCents: number
}>

export type YearlyExpenseByCategory = Readonly<{
  categoryId: UUID | null
  totalCents: number
}>

export type YearlyIncomeByCategory = Readonly<{
  categoryId: UUID | null
  totalCents: number
}>

export type AllTimeExpenseByCategory = Readonly<{
  categoryId: UUID | null
  totalCents: number
}>

export type AllTimeIncomeByCategory = Readonly<{
  categoryId: UUID | null
  totalCents: number
}>

export type YearlyFlowTotal = Readonly<{
  year: number
  type: 'income' | 'expense'
  totalCents: number
}>

export type YearTotals = Readonly<{
  incomeCents: number
  expenseCents: number
}>

export type AccountActivityTotals = Readonly<{
  accountId: UUID
  expenseCents: number
  incomeCents: number
  transferOutCents: number
  transferInCents: number
  transactionCount: number
}>

/**
 * TransactionRepository interface - defines data access contract for transactions.
 * Implementations handle persistence details (SQLite, etc.)
 */
export type TransactionPage = Readonly<{
  items: Transaction[]
  hasMore: boolean
  oldestDate: string | null // ISO date string of oldest item, used as cursor
}>

export interface TransactionRepository {
  // CRUD
  insert(tx: Transaction): void
  update(tx: Transaction): void
  getById(id: UUID): Transaction | null
  list(limit?: number): Transaction[]
  listForDate(dateYYYYMMDD: string, limit?: number): Transaction[]
  listInDateRange(fromDate: string, toDate: string, limit?: number): TransactionPage
  delete(id: UUID): void

  // Aggregations (return cents)
  getExpenseTotalForMonth(monthYYYYMM: string): number
  getIncomeTotalForMonth(monthYYYYMM: string): number
  listMonthlyExpenseTotals(limitMonths?: number): MonthlyExpenseTotal[]
  listDailyExpenseTotalsForMonth(monthYYYYMM: string): DailyExpenseTotal[]
  listMonthlyExpenseByCategory(monthYYYYMM: string): MonthlyExpenseByCategory[]
  listMonthlyIncomeByCategory(monthYYYYMM: string): MonthlyIncomeByCategory[]
  listTransfersForMonth(monthYYYYMM: string, limit?: number): Transaction[]
  listDailyFlowTotalsForMonth(monthYYYYMM: string): DailyFlowTotal[]
  listDailyFlowTotalsWithCountForMonth(monthYYYYMM: string): DailyFlowTotalWithCount[]
  listDailyVariableExpenseForMonth(monthYYYYMM: string, fixedCategoryKeys: string[]): DailyExpenseTotal[]

  // Yearly aggregations
  listMonthlyFlowTotalsForYear(year: number): MonthlyFlowTotal[]
  listYearlyExpenseByCategory(year: number): YearlyExpenseByCategory[]
  listYearlyIncomeByCategory(year: number): YearlyIncomeByCategory[]

  // All-time aggregations
  getAllTimeExpenseTotal(): number
  getAllTimeIncomeTotal(): number
  listAllTimeExpenseByCategory(): AllTimeExpenseByCategory[]
  listAllTimeIncomeByCategory(): AllTimeIncomeByCategory[]
  listYearlyFlowTotals(): YearlyFlowTotal[]
  getFirstTransactionDate(): string | null
  getFirstTransactionDateByAccount(): Map<string, string>
  countDistinctMonths(): number

  // Personal bests
  listMonthlyNetTotals(): MonthlyFlowTotal[]

  // Projections
  getYearTotals(year: number): YearTotals
  getMonthTotals(monthYYYYMM: string): YearTotals

  // Tags
  saveTags(transactionId: UUID, tagNames: string[]): void
  deleteTags(transactionId: UUID): void

  // Account activity aggregations
  listAccountActivityForMonth(monthYYYYMM: string): AccountActivityTotals[]
  listAccountActivityForYear(year: number): AccountActivityTotals[]
  listAccountActivityAllTime(): AccountActivityTotals[]

  // Account balance (running total from transactions)
  getAccountBalanceBeforeDate(accountId: UUID, dateYYYYMMDD: string): number
  getAccountBalanceAtEndOfMonth(accountId: UUID, monthYYYYMM: string): number

  // Account operations
  clearAccountId(accountId: UUID): number // Returns count of affected transactions
  hasTransactionsForAccount(accountId: UUID): boolean
  countTransactionsForAccount(accountId: UUID): number
  deleteTransactionsForAccount(accountId: UUID): number // Returns count of deleted transactions

  // Opening balance
  getOpeningBalanceForAccount(accountId: UUID): number // Returns cents
  hasTransactionsBeforeDate(accountId: UUID, dateYYYYMMDD: string): boolean
}
