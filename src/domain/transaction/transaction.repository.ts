import type { UUID } from '@/domain/common/uuid'
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

/**
 * TransactionRepository interface - defines data access contract for transactions.
 * Implementations handle persistence details (SQLite, etc.)
 */
export interface TransactionRepository {
  // CRUD
  insert(tx: Transaction): void
  list(limit?: number): Transaction[]
  delete(id: UUID): void

  // Aggregations (return cents)
  getExpenseTotalForMonth(monthYYYYMM: string): number
  getIncomeTotalForMonth(monthYYYYMM: string): number
  listMonthlyExpenseTotals(limitMonths?: number): MonthlyExpenseTotal[]
  listDailyExpenseTotalsForMonth(monthYYYYMM: string): DailyExpenseTotal[]
  listMonthlyExpenseByCategory(monthYYYYMM: string): MonthlyExpenseByCategory[]
  listTransfersForMonth(monthYYYYMM: string, limit?: number): Transaction[]
  listDailyFlowTotalsForMonth(monthYYYYMM: string): DailyFlowTotal[]
  listDailyFlowTotalsWithCountForMonth(monthYYYYMM: string): DailyFlowTotalWithCount[]
}
