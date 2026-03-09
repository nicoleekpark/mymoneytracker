/**
 * Transaction Use Cases
 *
 * This file re-exports all transaction-related operations from their
 * specialized modules for backwards compatibility.
 *
 * Module Organization:
 * - transaction.crud.ts       → Create, read, update, delete operations
 * - transaction.aggregations.ts → Monthly, yearly, all-time summaries
 * - transaction.insights.ts   → Personal bests, streaks, cumulative data
 * - transaction.projections.ts → Month/year-end projections
 * - transaction.utils.ts      → Utility functions and type guards
 */

// ─────────────────────────────────────────────────────────────────────────────
// CRUD Operations
// ─────────────────────────────────────────────────────────────────────────────

export {
  addTransaction,
  getTransactionById,
  getTransactions,
  getTransactionsForDate,
  getTransactionsInRange,
  getTransfersForMonth,
  removeTransaction,
  restoreTransaction,
  updateTransaction,
} from './transaction.crud'

export type { TransactionPage } from './transaction.crud'

// ─────────────────────────────────────────────────────────────────────────────
// Aggregations (Monthly, Yearly, All-Time)
// ─────────────────────────────────────────────────────────────────────────────

export {
  // Monthly
  getDailyExpenseTotalsDollarForMonth,
  getDailyFlowDollarForMonth,
  getMonthlyExpenseByCategoryDollar,
  getMonthlyExpenseTotalsDollar,
  getMonthlyIncomeByCategoryDollar,
  getMonthlySummaryDollar,
  getThisMonthExpenseTotalDollar,
  // Yearly
  getMonthlyFlowDollarForYear,
  getYearlyExpenseByCategoryDollar,
  getYearlyFlowTotalsDollar,
  getYearlyIncomeByCategoryDollar,
  // All-Time
  getAllTimeExpenseByCategoryDollar,
  getAllTimeIncomeByCategoryDollar,
  getAllTimeSummaryDollar,
  getDistinctMonthCount,
  getFirstTransactionDate,
} from './transaction.aggregations'

export type {
  // Monthly types
  DailyExpenseTotalDollar,
  DailyFlowDollar,
  MonthlyExpenseByCategoryDollar,
  MonthlyExpenseTotalDollar,
  MonthlyIncomeByCategoryDollar,
  MonthlySummaryDollar,
  // Yearly types
  MonthlyFlowDollar,
  YearlyExpenseByCategoryDollar,
  YearlyFlowDollar,
  YearlyIncomeByCategoryDollar,
  // All-time types
  AllTimeExpenseByCategoryDollar,
  AllTimeIncomeByCategoryDollar,
  AllTimeSummaryDollar,
} from './transaction.aggregations'

// ─────────────────────────────────────────────────────────────────────────────
// Insights (Personal Bests, Streaks, Cumulative)
// ─────────────────────────────────────────────────────────────────────────────

export {
  getCumulativeNetData,
  getPersonalBests,
} from './transaction.insights'

export type {
  CumulativeNetData,
  PersonalBests,
} from './transaction.insights'

// ─────────────────────────────────────────────────────────────────────────────
// Projections
// ─────────────────────────────────────────────────────────────────────────────

export {
  getMonthlyProjection,
  getYearlyProjection,
} from './transaction.projections'

export type {
  MonthlyProjection,
  YearlyProjection,
} from './transaction.projections'
