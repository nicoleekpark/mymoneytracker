import { useEffect, useState } from 'react'
import { getMonthlySummaryDollar, type MonthlySummaryDollar } from '@/domain/transaction/transaction.usecase'

const DEFAULT_DATA: MonthlySummaryDollar = {
  month: '',
  expenseTotalDollar: 0,
  incomeTotalDollar: 0,
  netCashFlowDollar: 0,
}

export function useMonthlySummary(monthYYYYMM: string) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<MonthlySummaryDollar>(DEFAULT_DATA)

  useEffect(() => {
    let alive = true

    async function run() {
      setLoading(true)
      setError(null)

      try {
        const summary = await getMonthlySummaryDollar(monthYYYYMM)

        if (!alive) return
        setData(summary)
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
