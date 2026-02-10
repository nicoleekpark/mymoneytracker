import { useEffect, useState } from 'react'
import { getMonthlySummaryDollar, type MonthlySummaryDollar } from '@/domain/transaction/transaction.usecase'

type MonthlyHeroData = {
  // Current month data
  netDollar: number
  incomeDollar: number
  expenseDollar: number
  savingsRate: number

  // Comparison with last month
  lastMonthNetDollar: number | null
  netChangeDollar: number | null
  hasLastMonthData: boolean

  // Time context
  isCurrentMonth: boolean
  daysElapsed: number
  daysInMonth: number
  monthName: string
  lastMonthName: string
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

function getMonthName(monthYYYYMM: string): string {
  const [, m] = monthYYYYMM.split('-')
  return MONTH_NAMES[Number(m) - 1] || ''
}

function getPrevMonth(monthYYYYMM: string): string {
  const [y, m] = monthYYYYMM.split('-').map(Number)
  if (m === 1) {
    return `${y - 1}-12`
  }
  return `${y}-${String(m - 1).padStart(2, '0')}`
}

function getDaysInMonth(monthYYYYMM: string): number {
  const [y, m] = monthYYYYMM.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

function getDaysElapsed(monthYYYYMM: string): number {
  const now = new Date()
  const currentYYYYMM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  if (monthYYYYMM !== currentYYYYMM) {
    // Past month - all days elapsed
    return getDaysInMonth(monthYYYYMM)
  }

  return now.getDate()
}

function isCurrentMonth(monthYYYYMM: string): boolean {
  const now = new Date()
  const currentYYYYMM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return monthYYYYMM === currentYYYYMM
}

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

export function useMonthlyHeroData(monthYYYYMM: string) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<MonthlyHeroData>(DEFAULT_DATA)

  useEffect(() => {
    let alive = true

    async function run() {
      setLoading(true)
      setError(null)

      try {
        const prevMonthYYYYMM = getPrevMonth(monthYYYYMM)

        // Fetch current and previous month in parallel
        const [currentSummary, prevSummary] = await Promise.all([
          getMonthlySummaryDollar(monthYYYYMM),
          getMonthlySummaryDollar(prevMonthYYYYMM).catch(() => null)
        ])

        if (!alive) return

        const netDollar = currentSummary.netCashFlowDollar
        const incomeDollar = currentSummary.incomeTotalDollar
        const expenseDollar = currentSummary.expenseTotalDollar
        const savingsRate = incomeDollar > 0
          ? Math.round((netDollar / incomeDollar) * 100)
          : 0

        const lastMonthNetDollar = prevSummary?.netCashFlowDollar ?? null
        const hasLastMonthData = lastMonthNetDollar !== null &&
          (prevSummary?.incomeTotalDollar ?? 0) > 0 || (prevSummary?.expenseTotalDollar ?? 0) > 0
        const netChangeDollar = hasLastMonthData
          ? netDollar - (lastMonthNetDollar ?? 0)
          : null

        setData({
          netDollar,
          incomeDollar,
          expenseDollar,
          savingsRate,
          lastMonthNetDollar,
          netChangeDollar,
          hasLastMonthData,
          isCurrentMonth: isCurrentMonth(monthYYYYMM),
          daysElapsed: getDaysElapsed(monthYYYYMM),
          daysInMonth: getDaysInMonth(monthYYYYMM),
          monthName: getMonthName(monthYYYYMM),
          lastMonthName: getMonthName(prevMonthYYYYMM),
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
  }, [monthYYYYMM])

  return { loading, error, data }
}
