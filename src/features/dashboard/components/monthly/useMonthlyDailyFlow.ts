import { getDailyFlowDollarForMonth } from '@/domain/transaction/transaction.usecase'
import { useEffect, useState } from 'react'

export type DailyFlow = Readonly<{
  day: string
  incomeDollar: number
  expenseDollar: number
}>

export function useMonthlyDailyFlow(monthYYYYMM: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [daily, setDaily] = useState<DailyFlow[]>([])

  useEffect(() => {
    let alive = true

    async function run() {
      setLoading(true)
      setError(null)
      try {
        const rows = await getDailyFlowDollarForMonth(monthYYYYMM)
        if (!alive) return
        setDaily(rows)
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
  }, [monthYYYYMM])

  return { loading, error, daily }
}
