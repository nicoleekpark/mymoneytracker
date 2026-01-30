import { useEffect, useState } from 'react'

import type { CategoryRef } from '@/domain/category'
import type { UUID } from '@/domain/common/uuid'
import {
  getMonthlyFlowDollarForYear,
  getYearlyExpenseByCategoryDollar,
  getYearlyIncomeByCategoryDollar,
  type MonthlyFlowDollar
} from '@/domain/transaction/transaction.usecase'
import { categoryRepository } from '@/infrastructure/repositories'

export type CategoryBreakdown = Readonly<{
  categoryId: UUID | null
  categoryRef?: CategoryRef
  totalDollar: number
}>

export type MonthData = Readonly<{
  month: string // YYYY-MM
  incomeDollar: number
  expenseDollar: number
  netDollar: number
}>

export type YearlyData = Readonly<{
  // Summary
  totalIncome: number
  totalExpense: number
  netAmount: number
  monthlyAverageIncome: number
  monthlyAverageExpense: number

  // By Category
  incomeByCategory: CategoryBreakdown[]
  expenseByCategory: CategoryBreakdown[]

  // Monthly breakdown (for sparklines)
  monthlyData: MonthData[] // 12 items max

  // Assets (placeholder - will be expanded)
  goalAmount: number
  currentNetAsset: number
  yearStartNetAsset: number
  totalAsset: number
  totalDebt: number
  liquidAsset: number
}>

const DEFAULT_DATA: YearlyData = {
  totalIncome: 0,
  totalExpense: 0,
  netAmount: 0,
  monthlyAverageIncome: 0,
  monthlyAverageExpense: 0,
  incomeByCategory: [],
  expenseByCategory: [],
  monthlyData: [],
  goalAmount: 200000,
  currentNetAsset: 0,
  yearStartNetAsset: 0,
  totalAsset: 0,
  totalDebt: 0,
  liquidAsset: 0
}

function buildMonthlyData(monthly: MonthlyFlowDollar[], year: number): MonthData[] {
  const result: MonthData[] = []

  for (let m = 1; m <= 12; m++) {
    const monthStr = `${year}-${String(m).padStart(2, '0')}`
    const found = monthly.find(d => d.month === monthStr)

    const income = found?.incomeDollar ?? 0
    const expense = found?.expenseDollar ?? 0

    result.push({
      month: monthStr,
      incomeDollar: income,
      expenseDollar: expense,
      netDollar: income - expense
    })
  }

  return result
}

export function useYearlyData(year: number) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<YearlyData>(DEFAULT_DATA)

  useEffect(() => {
    let alive = true

    async function run() {
      setLoading(true)
      setError(null)

      try {
        const [monthlyFlow, expenseByCat, incomeByCat] = await Promise.all([
          getMonthlyFlowDollarForYear(year),
          getYearlyExpenseByCategoryDollar(year),
          getYearlyIncomeByCategoryDollar(year)
        ])

        if (!alive) return

        // Calculate totals
        const totalIncome = monthlyFlow.reduce((sum, m) => sum + m.incomeDollar, 0)
        const totalExpense = monthlyFlow.reduce((sum, m) => sum + m.expenseDollar, 0)
        const netAmount = totalIncome - totalExpense

        // Current month for average calculation
        const now = new Date()
        const currentYear = now.getFullYear()
        const currentMonth = now.getMonth() + 1
        const monthsElapsed = year === currentYear ? currentMonth : 12

        const monthlyAverageIncome = monthsElapsed > 0 ? totalIncome / monthsElapsed : 0
        const monthlyAverageExpense = monthsElapsed > 0 ? totalExpense / monthsElapsed : 0

        // Transform category data
        const expenseByCategory: CategoryBreakdown[] = expenseByCat.map(r => ({
          categoryId: r.categoryId,
          categoryRef: r.categoryId
            ? categoryRepository.resolveCategoryRefFromDbId(r.categoryId)
            : undefined,
          totalDollar: r.totalDollar
        }))

        const incomeByCategory: CategoryBreakdown[] = incomeByCat.map(r => ({
          categoryId: r.categoryId,
          categoryRef: r.categoryId
            ? categoryRepository.resolveCategoryRefFromDbId(r.categoryId)
            : undefined,
          totalDollar: r.totalDollar
        }))

        // Build monthly data (12 months)
        const monthlyData = buildMonthlyData(monthlyFlow, year)

        setData({
          totalIncome,
          totalExpense,
          netAmount,
          monthlyAverageIncome,
          monthlyAverageExpense,
          incomeByCategory,
          expenseByCategory,
          monthlyData,
          // Placeholder values for assets (will be implemented later)
          goalAmount: 200000,
          currentNetAsset: netAmount, // simplified
          yearStartNetAsset: 0,
          totalAsset: totalIncome,
          totalDebt: 0,
          liquidAsset: netAmount
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
