import { useEffect, useState } from 'react'
import { getMonthlyFlowDollarForYear } from '@/core/services/transaction'

type YearlyHeroData = {
  // Current year data
  netDollar: number
  incomeDollar: number
  expenseDollar: number
  avgMonthlyNetDollar: number
  monthsElapsed: number

  // YoY Comparison
  lastYearNetDollar: number | null
  netChangeDollar: number | null
  hasLastYearData: boolean

  // Context
  isCurrentYear: boolean
  year: number
}

const DEFAULT_DATA: YearlyHeroData = {
  netDollar: 0,
  incomeDollar: 0,
  expenseDollar: 0,
  avgMonthlyNetDollar: 0,
  monthsElapsed: 0,
  lastYearNetDollar: null,
  netChangeDollar: null,
  hasLastYearData: false,
  isCurrentYear: true,
  year: new Date().getFullYear(),
}

export function useYearlyHeroData(year: number) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<YearlyHeroData>(DEFAULT_DATA)

  useEffect(() => {
    let alive = true

    async function run() {
      setLoading(true)
      setError(null)

      try {
        const lastYear = year - 1
        const now = new Date()
        const currentYear = now.getFullYear()
        const currentMonth = now.getMonth() + 1
        const isCurrentYear = year === currentYear

        // Fetch current and previous year data
        const [monthlyFlow, lastYearFlow] = await Promise.all([
          getMonthlyFlowDollarForYear(year),
          getMonthlyFlowDollarForYear(lastYear).catch(() => [])
        ])

        if (!alive) return

        // Calculate totals for current year
        const incomeDollar = monthlyFlow.reduce((sum, m) => sum + m.incomeDollar, 0)
        const expenseDollar = monthlyFlow.reduce((sum, m) => sum + m.expenseDollar, 0)
        const netDollar = incomeDollar - expenseDollar

        // Calculate months elapsed
        const monthsElapsed = isCurrentYear ? currentMonth : 12

        // Calculate average monthly net
        const avgMonthlyNetDollar = monthsElapsed > 0 ? netDollar / monthsElapsed : 0

        // Calculate YoY comparison (YTD vs YTD for current year)
        let lastYearNetDollar: number | null = null
        let netChangeDollar: number | null = null
        let hasLastYearData = false

        if (lastYearFlow.length > 0) {
          let lastYearIncome = 0
          let lastYearExpense = 0

          if (isCurrentYear) {
            // Compare YTD: only same months
            for (const flow of lastYearFlow) {
              const monthNum = parseInt(flow.month.split('-')[1], 10)
              if (monthNum <= currentMonth) {
                lastYearIncome += flow.incomeDollar
                lastYearExpense += flow.expenseDollar
              }
            }
          } else {
            // Compare full year
            lastYearIncome = lastYearFlow.reduce((sum, m) => sum + m.incomeDollar, 0)
            lastYearExpense = lastYearFlow.reduce((sum, m) => sum + m.expenseDollar, 0)
          }

          lastYearNetDollar = lastYearIncome - lastYearExpense
          hasLastYearData = lastYearIncome > 0 || lastYearExpense > 0

          if (hasLastYearData) {
            netChangeDollar = netDollar - lastYearNetDollar
          }
        }

        setData({
          netDollar,
          incomeDollar,
          expenseDollar,
          avgMonthlyNetDollar,
          monthsElapsed,
          lastYearNetDollar,
          netChangeDollar,
          hasLastYearData,
          isCurrentYear,
          year,
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
    return () => {
      alive = false
    }
  }, [year])

  return { loading, error, data }
}
