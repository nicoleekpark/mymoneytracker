import { useEffect, useState } from 'react'

import type { CategoryRef } from '@/domain/category'
import type { UUID } from '@/domain/common/uuid'
import {
  getAllTimeSummaryDollar,
  getAllTimeExpenseByCategoryDollar,
  getAllTimeIncomeByCategoryDollar,
  getYearlyFlowTotalsDollar,
  getFirstTransactionDate,
  getDistinctMonthCount,
  getPersonalBests,
  getCumulativeNetData,
  type YearlyFlowDollar,
  type PersonalBests,
  type CumulativeNetData
} from '@/domain/transaction/transaction.usecase'
import { categoryRepository } from '@/infrastructure/repositories'

export type CategoryBreakdown = Readonly<{
  categoryId: UUID | null
  categoryRef?: CategoryRef
  totalDollar: number
}>

export type AllTimeData = Readonly<{
  // Summary
  totalIncome: number
  totalExpense: number
  netAmount: number
  savingsRate: number // percentage (0-100)
  avgMonthlySaved: number

  // By Category
  expenseByCategory: CategoryBreakdown[]
  incomeByCategory: CategoryBreakdown[]

  // Yearly breakdown (for trend chart)
  yearlyData: YearlyFlowDollar[]

  // Cumulative net (for line chart)
  cumulativeData: CumulativeNetData[]

  // Date range
  firstYear: number | null
  lastYear: number | null
  firstTransactionDate: Date | null
  monthsTracked: number

  // Personal bests
  personalBests: PersonalBests
}>

const DEFAULT_DATA: AllTimeData = {
  totalIncome: 0,
  totalExpense: 0,
  netAmount: 0,
  savingsRate: 0,
  avgMonthlySaved: 0,
  expenseByCategory: [],
  incomeByCategory: [],
  yearlyData: [],
  cumulativeData: [],
  firstYear: null,
  lastYear: null,
  firstTransactionDate: null,
  monthsTracked: 0,
  personalBests: { bestSavingsMonth: null, bestSavingsYear: null, peakExpenseMonth: null, peakExpenseYear: null, worstMonth: null, positiveStreak: 0, currentStreak: { months: 0, isPositive: true } }
}

export function useAllTimeData() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<AllTimeData>(DEFAULT_DATA)

  useEffect(() => {
    let alive = true

    async function run() {
      setLoading(true)
      setError(null)

      try {
        const [summary, expenseByCat, incomeByCat, yearlyFlow, firstDate, monthCount, personalBests, cumulativeData] = await Promise.all([
          getAllTimeSummaryDollar(),
          getAllTimeExpenseByCategoryDollar(),
          getAllTimeIncomeByCategoryDollar(),
          getYearlyFlowTotalsDollar(),
          getFirstTransactionDate(),
          getDistinctMonthCount(),
          getPersonalBests(),
          getCumulativeNetData()
        ])

        if (!alive) return

        // Transform expense category data
        const expenseByCategory: CategoryBreakdown[] = expenseByCat.map(r => ({
          categoryId: r.categoryId,
          categoryRef: r.categoryId
            ? categoryRepository.resolveCategoryRefFromDbId(r.categoryId)
            : undefined,
          totalDollar: r.totalDollar
        }))

        // Transform income category data
        const incomeByCategory: CategoryBreakdown[] = incomeByCat.map(r => ({
          categoryId: r.categoryId,
          categoryRef: r.categoryId
            ? categoryRepository.resolveCategoryRefFromDbId(r.categoryId)
            : undefined,
          totalDollar: r.totalDollar
        }))

        // Get year range
        const years = yearlyFlow.map(y => y.year)
        const firstYear = years.length > 0 ? Math.min(...years) : null
        const lastYear = years.length > 0 ? Math.max(...years) : null

        // Calculate savings rate (income > 0 only)
        const savingsRate = summary.incomeTotalDollar > 0
          ? (summary.netCashFlowDollar / summary.incomeTotalDollar) * 100
          : 0

        // Calculate average monthly saved
        const avgMonthlySaved = monthCount > 0
          ? summary.netCashFlowDollar / monthCount
          : 0

        setData({
          totalIncome: summary.incomeTotalDollar,
          totalExpense: summary.expenseTotalDollar,
          netAmount: summary.netCashFlowDollar,
          savingsRate: Math.max(0, savingsRate), // clamp negative to 0 for display
          avgMonthlySaved,
          expenseByCategory,
          incomeByCategory,
          yearlyData: yearlyFlow,
          cumulativeData,
          firstYear,
          lastYear,
          firstTransactionDate: firstDate,
          monthsTracked: monthCount,
          personalBests
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
  }, [])

  return { loading, error, data }
}
