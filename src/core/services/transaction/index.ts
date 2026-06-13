// Application layer - Transaction services
// Orchestrates domain types + infrastructure repositories

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
  // Account Activity
  getAccountActivityForMonth,
  getAccountActivityForYear,
  getAccountActivityAllTime,
  getAccountBalanceBeforeDate,
  getAccountBalanceAtEndOfMonth,
  // Opening Balance
  getOpeningBalanceForAccount,
  hasTransactionsBeforeDate,
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
  // Account activity types
  AccountActivityDollar,
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
