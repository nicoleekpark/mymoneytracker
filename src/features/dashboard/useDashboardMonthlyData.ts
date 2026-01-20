import { useEffect, useState } from 'react'

import {
  getDailyExpenseTotalsDollarForMonth,
  getMonthlyExpenseByCategoryDollar,
  getMonthlySummaryDollar,
  getTransfersForMonth,
} from '@/domain/transaction/transaction.usecase'

export type DashboardMonthlyData = Readonly<{
  month: string // YYYY-MM
  summary: {
    expenseTotalDollar: number
    incomeTotalDollar: number
    netCashFlowDollar: number
  }
  dailyExpenseTotals: Array<{ day: string; totalDollar: number }>
  expenseByCategory: Array<{ categoryId: string | null; totalDollar: number }>
  transfers: Array<unknown> // Transaction[]로 바꿔도 됨
}>

export function useDashboardMonthlyData(monthYYYYMM: string | null) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DashboardMonthlyData | null>(null)

  useEffect(() => {
    let alive = true

    async function run() {
      if (!monthYYYYMM) {
        setData(null)
        setError(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const [summary, daily, byCat, transfers] = await Promise.all([
          getMonthlySummaryDollar(monthYYYYMM),
          getDailyExpenseTotalsDollarForMonth(monthYYYYMM),
          getMonthlyExpenseByCategoryDollar(monthYYYYMM),
          getTransfersForMonth(monthYYYYMM, 500),
        ])

        if (!alive) return

        setData({
          month: monthYYYYMM,
          summary: {
            expenseTotalDollar: summary.expenseTotalDollar,
            incomeTotalDollar: summary.incomeTotalDollar,
            netCashFlowDollar: summary.netCashFlowDollar,
          },
          dailyExpenseTotals: daily,
          expenseByCategory: byCat.map((x) => ({
            categoryId: x.categoryId,
            totalDollar: x.totalDollar,
          })),
          transfers,
        })
      } catch (e) {
        if (!alive) return
        setError(e instanceof Error ? e.message : 'Unknown error')
        setData(null)
      } finally {
        if (!alive) return
        setLoading(false)
      }
    }

    run()

    return () => {
      alive = false
    }
  }, [monthYYYYMM])

  return { loading, error, data }
}
