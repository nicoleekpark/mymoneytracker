import { getDailyFlowDollarForMonth } from '@/core/services/transaction'
import { useDataRefreshStore } from '@/shared/store'
import { useEffect, useState } from 'react'

export type DailyFlow = Readonly<{
  day: string
  incomeDollar: number
  expenseDollar: number
  variableExpenseDollar: number
  txCount: number
}>

export function useMonthlyDailyFlow(monthYYYYMM: string) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [daily, setDaily] = useState<DailyFlow[]>([])

  // Subscribe to transaction changes to auto-refresh
  const transactionVersion = useDataRefreshStore((s) => s.transactionVersion)

  useEffect(() => {
    let alive = true

    async function run() {
      setLoading(true)
      setError(null)
      try {
        const rows = await getDailyFlowDollarForMonth(monthYYYYMM)
        if (!alive) return
        setDaily(Array.isArray(rows) ? rows : [])
      } catch (e) {
        if (!alive) return
        setError(e instanceof Error ? e.message : 'Unknown error')
        setDaily([])
      } finally {
        if (!alive) return
        setLoading(false)
      }
    }

    run()
    return () => {
      alive = false
    }
  }, [monthYYYYMM, transactionVersion])

  return { loading, error, daily }
}
