import { useEffect, useState } from 'react'
import { getYearlyProjection, type YearlyProjection } from '@/core/services/transaction'

const DEFAULT_DATA: YearlyProjection = {
  projectedIncome: 0,
  projectedExpense: 0,
  projectedSavings: 0,
  projectedSavingsRate: 0,
  monthsElapsed: 0,
  currentIncome: 0,
  currentExpense: 0,
  avgMonthlyIncome: 0,
  avgMonthlyExpense: 0,
  vsLastYear: null,
}

export function useYearlyProjection(year: number) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<YearlyProjection>(DEFAULT_DATA)

  useEffect(() => {
    let alive = true

    async function run() {
      setLoading(true)
      setError(null)

      try {
        const now = new Date()
        const currentYear = now.getFullYear()
        const isCurrentYear = year === currentYear

        // Only show projections for current year
        if (!isCurrentYear) {
          if (!alive) return
          setData(DEFAULT_DATA)
          setLoading(false)
          return
        }

        const projection = await getYearlyProjection(year, now)

        if (!alive) return
        setData(projection)
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
    return () => {
      alive = false
    }
  }, [year])

  return { loading, error, data }
}
