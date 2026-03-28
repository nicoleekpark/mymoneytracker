// ═══════════════════════════════════════════════════════════════════════════
// DATA FETCHING HOOK: Monthly Hero Data
// Fetches summary data for the monthly dashboard "hero" section.
// Uses the async pattern: useEffect + alive flag + { loading, error, data }
// ═══════════════════════════════════════════════════════════════════════════
//
// WHAT THIS HOOK PROVIDES:
// ------------------------
// - Current month's income, expense, net, savings rate
// - Comparison with last month (if data exists)
// - Time context (days elapsed, is current month, etc.)
//
// DATA FLOW:
// ----------
// useMonthlyHeroData(monthYYYYMM)
//     ↓
// getMonthlySummaryDollar() [current + previous month in parallel]
//     ↓
// transactionRepository.getExpenseTotalForMonth()
//     ↓
// SQLite query
//     ↓
// Returns { loading, error, data }
//
// ═══════════════════════════════════════════════════════════════════════════

// ─── React ──────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'

// ─── Application ──────────────────────────────────────────────────────────────
import { getMonthlySummaryDollar } from '@/core/services/transaction'

// ─── Utils ──────────────────────────────────────────────────────────────────
import {
  getMonthNameFromYYYYMM,
  getPrevMonthYYYYMM,
  getDaysInMonthFromYYYYMM,
  getDaysElapsedInMonth,
  isCurrentMonthYYYYMM,
} from '../utils'

// ─── Types ──────────────────────────────────────────────────────────────────

type MonthlyHeroData = {
  // Current month data
  netDollar: number
  incomeDollar: number
  expenseDollar: number
  savingsRate: number          // Percentage (0-100): how much of income was saved

  // Comparison with last month
  lastMonthNetDollar: number | null
  netChangeDollar: number | null
  hasLastMonthData: boolean    // True if previous month has transactions

  // Time context
  isCurrentMonth: boolean      // Is this the current calendar month?
  daysElapsed: number          // Days passed in this month (1-31)
  daysInMonth: number          // Total days in this month (28-31)
  monthName: string            // "March", "April", etc.
  lastMonthName: string        // Previous month's name for comparison label
}

// ─── Default Data ───────────────────────────────────────────────────────────
// Returned while loading or on error

const DEFAULT_DATA: MonthlyHeroData = {
  netDollar: 0,
  incomeDollar: 0,
  expenseDollar: 0,
  savingsRate: 0,
  lastMonthNetDollar: null,
  netChangeDollar: null,
  hasLastMonthData: false,
  isCurrentMonth: true,
  daysElapsed: 0,
  daysInMonth: 30,
  monthName: '',
  lastMonthName: '',
}

// ─── Hook ───────────────────────────────────────────────────────────────────

/**
 * Fetches monthly hero section data with comparison to previous month.
 *
 * @param monthYYYYMM - Month in "YYYY-MM" format (e.g., "2024-03")
 * @returns { loading, error, data } - Standard async hook return
 *
 * @example
 * ```tsx
 * const { loading, error, data } = useMonthlyHeroData("2024-03")
 *
 * if (loading) return <Spinner />
 * return <HeroSection net={data.netDollar} change={data.netChangeDollar} />
 * ```
 */
export function useMonthlyHeroData(monthYYYYMM: string) {
  // ─── State ──────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<MonthlyHeroData>(DEFAULT_DATA)

  // ─── Effect: Fetch Data When Month Changes ──────────────────────────────────
  useEffect(() => {
    let alive = true  // Prevents state updates after unmount

    async function run() {
      setLoading(true)
      setError(null)

      try {
        const prevMonthYYYYMM = getPrevMonthYYYYMM(monthYYYYMM)

        // ─── Fetch current and previous month in parallel ───────────────────
        // Promise.all runs both requests concurrently for better performance
        // Previous month uses .catch(() => null) to gracefully handle no data
        const [currentSummary, prevSummary] = await Promise.all([
          getMonthlySummaryDollar(monthYYYYMM),
          getMonthlySummaryDollar(prevMonthYYYYMM).catch(() => null)
        ])

        if (!alive) return  // Component unmounted, abort

        // ─── Extract current month values ───────────────────────────────────
        const netDollar = currentSummary.netCashFlowDollar
        const incomeDollar = currentSummary.incomeTotalDollar
        const expenseDollar = currentSummary.expenseTotalDollar

        // Savings rate = (net / income) * 100
        // Only calculate if there's income to avoid division by zero
        const savingsRate = incomeDollar > 0
          ? Math.round((netDollar / incomeDollar) * 100)
          : 0

        // ─── Calculate comparison with last month ───────────────────────────
        const lastMonthNetDollar = prevSummary?.netCashFlowDollar ?? null

        // Has last month data if there were any transactions
        const prevIncome = prevSummary?.incomeTotalDollar ?? 0
        const prevExpense = prevSummary?.expenseTotalDollar ?? 0
        const hasLastMonthData = lastMonthNetDollar !== null && (prevIncome > 0 || prevExpense > 0)

        // Net change = this month's net - last month's net
        const netChangeDollar = hasLastMonthData
          ? netDollar - (lastMonthNetDollar ?? 0)
          : null

        // ─── Build result object ────────────────────────────────────────────
        setData({
          netDollar,
          incomeDollar,
          expenseDollar,
          savingsRate,
          lastMonthNetDollar,
          netChangeDollar,
          hasLastMonthData,
          isCurrentMonth: isCurrentMonthYYYYMM(monthYYYYMM),
          daysElapsed: getDaysElapsedInMonth(monthYYYYMM),
          daysInMonth: getDaysInMonthFromYYYYMM(monthYYYYMM),
          monthName: getMonthNameFromYYYYMM(monthYYYYMM),
          lastMonthName: getMonthNameFromYYYYMM(prevMonthYYYYMM),
        })
      } catch (e) {
        if (!alive) return
        setError(e instanceof Error ? e.message : 'Unknown error')
        setData(DEFAULT_DATA)
      } finally {
        if (!alive) return
        setLoading(false)
      }
    }

    run()

    // Cleanup: mark as unmounted to prevent state updates
    return () => {
      alive = false
    }
  }, [monthYYYYMM])  // Re-run when month changes

  return { loading, error, data }
}
