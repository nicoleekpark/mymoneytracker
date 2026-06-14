/**
 * useRunwayData
 *
 * Calculates runway (months of expenses) based on accessible assets
 * and average monthly expenses from transaction data.
 *
 * Runway = Accessible Assets / Average Monthly Expenses
 */
import { useEffect, useState } from 'react'
import {
  getAllTimeSummaryDollar,
  getDistinctMonthCount,
} from '@/core/services/transaction'
import { useDataRefreshStore } from '@/shared/store'

export type RunwayData = {
  runwayMonths: number | null // null if insufficient data
  avgMonthlyExpense: number
  monthCount: number // number of months with data
  hasEnoughData: boolean // true if >= 3 months of data
  loading: boolean
  error: string | null
}

const MIN_MONTHS_FOR_RUNWAY = 3

/**
 * Calculate runway based on accessible assets and average monthly expenses
 */
export function useRunwayData(accessibleAssets: number): RunwayData {
  const [data, setData] = useState<RunwayData>({
    runwayMonths: null,
    avgMonthlyExpense: 0,
    monthCount: 0,
    hasEnoughData: false,
    loading: true,
    error: null,
  })

  const transactionVersion = useDataRefreshStore((s) => s.transactionVersion)

  useEffect(() => {
    let alive = true

    async function run() {
      setData(prev => ({ ...prev, loading: true, error: null }))

      try {
        const [summary, monthCount] = await Promise.all([
          getAllTimeSummaryDollar(),
          getDistinctMonthCount(),
        ])

        if (!alive) return

        const hasEnoughData = monthCount >= MIN_MONTHS_FOR_RUNWAY

        // Calculate average monthly expenses (only if enough data)
        const avgMonthlyExpense = hasEnoughData && monthCount > 0
          ? summary.expenseTotalDollar / monthCount
          : 0

        // Calculate runway in months (only if enough data and expense > 0)
        const runwayMonths = hasEnoughData && avgMonthlyExpense > 0
          ? accessibleAssets / avgMonthlyExpense
          : null

        setData({
          runwayMonths,
          avgMonthlyExpense,
          monthCount,
          hasEnoughData,
          loading: false,
          error: null,
        })
      } catch (e) {
        if (!alive) return
        setData({
          runwayMonths: null,
          avgMonthlyExpense: 0,
          monthCount: 0,
          hasEnoughData: false,
          loading: false,
          error: e instanceof Error ? e.message : 'Failed to load runway data',
        })
      }
    }

    run()

    return () => {
      alive = false
    }
  }, [accessibleAssets, transactionVersion])

  return data
}
