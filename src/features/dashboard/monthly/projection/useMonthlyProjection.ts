import { useEffect, useState } from 'react'
import { getMonthlyProjection, type MonthlyProjection } from '@/core/services/transaction'

const DEFAULT_DATA: MonthlyProjection = {
  projectedExpense: 0,
  projectedIncome: 0,
  projectedSavings: 0,
  projectedSavingsRate: 0,
  daysElapsed: 0,
  daysInMonth: 0,
  currentExpense: 0,
  currentIncome: 0,
}

export function useMonthlyProjection(monthYYYYMM: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<MonthlyProjection>(DEFAULT_DATA)

  useEffect(() => {
    let alive = true

    async function run() {
      setLoading(true)
      setError(null)

      try {
        // Parse the month to create a date for that month
        const [yearStr, monthStr] = monthYYYYMM.split('-')
        const year = Number(yearStr)
        const month = Number(monthStr)

        // Check if this is the current month
        const now = new Date()
        const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month

        if (!isCurrentMonth) {
          // For past/future months, we don't show projections
          if (!alive) return
          setData(DEFAULT_DATA)
          setLoading(false)
          return
        }

        const projection = await getMonthlyProjection(now)

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
  }, [monthYYYYMM])

  return { loading, error, data }
}
