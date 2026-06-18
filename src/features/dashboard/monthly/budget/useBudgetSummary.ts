import { useEffect, useState } from 'react'

import { APP_CONFIG } from '@/shared/config/app.config'
import { getMonthlySummaryDollar, getDailyExpenseTotalsDollarForMonth } from '@/core/services/transaction'
import { useDataRefreshStore, useSettingsStore } from '@/shared/store'

export type BudgetData = Readonly<{
  budgetDollar: number
  spentDollar: number
  remainingDollar: number
  percentUsed: number
  isOverBudget: boolean
  /** YYYY-MM-DD when budget was first crossed, or null if not crossed */
  crossedOnDate: string | null
}>

/**
 * Hook to fetch budget data for a given month.
 * Returns budget amount, spent amount, and calculates when budget was crossed.
 */
export function useBudgetSummary(monthYYYYMM: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<BudgetData | null>(null)

  // Get user-configured budget (stored in cents), fall back to app default
  const monthlyBudgetCents = useSettingsStore((s) => s.monthlyBudget)
  const budgetDollar = monthlyBudgetCents > 0
    ? monthlyBudgetCents / 100
    : APP_CONFIG.budget.defaultMonthlyBudgetDollar

  // Subscribe to transaction and settings changes to auto-refresh
  const transactionVersion = useDataRefreshStore((s) => s.transactionVersion)
  const settingsVersion = useDataRefreshStore((s) => s.settingsVersion)

  useEffect(() => {
    let alive = true

    async function run() {
      setLoading(true)
      setError(null)

      try {
        // Fetch monthly summary and daily expenses in parallel
        const [summary, dailyExpenses] = await Promise.all([
          getMonthlySummaryDollar(monthYYYYMM),
          getDailyExpenseTotalsDollarForMonth(monthYYYYMM)
        ])

        if (!alive) return

        const spentDollar = summary.expenseTotalDollar
        const remainingDollar = budgetDollar - spentDollar
        const percentUsed = budgetDollar > 0 ? (spentDollar / budgetDollar) * 100 : 0
        const isOverBudget = spentDollar > budgetDollar

        // Find the date when budget was first crossed
        let crossedOnDate: string | null = null
        if (isOverBudget && dailyExpenses.length > 0) {
          // Sort by date ascending
          const sorted = [...dailyExpenses].sort((a, b) => a.day.localeCompare(b.day))
          let cumulative = 0
          for (const day of sorted) {
            cumulative += day.totalDollar
            if (cumulative > budgetDollar) {
              crossedOnDate = day.day
              break
            }
          }
        }

        setData({
          budgetDollar,
          spentDollar,
          remainingDollar,
          percentUsed,
          isOverBudget,
          crossedOnDate
        })
      } catch (e) {
        if (!alive) return
        setError(e instanceof Error ? e.message : 'Unknown error')
        setData(null)
      } finally {
        if (alive) setLoading(false)
      }
    }

    run()
    return () => {
      alive = false
    }
  }, [monthYYYYMM, budgetDollar, transactionVersion, settingsVersion])

  return { loading, error, data }
}
