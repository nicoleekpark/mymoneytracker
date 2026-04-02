import { useEffect, useState } from 'react'

import { UNCATEGORIZED_KEY, type CategoryRef } from '@/core/domain/category'
import type { UUID } from '@/core/domain/common/uuid'
import {
  getMonthlyFlowDollarForYear,
  getYearlyExpenseByCategoryDollar,
  getYearlyIncomeByCategoryDollar,
  type MonthlyFlowDollar
} from '@/core/services/transaction'
import { getCategoryRefByDbId } from '@/core/services/category'

export type SubCategoryBreakdown = Readonly<{
  subCategoryKey: string
  totalDollar: number
}>

export type CategoryBreakdown = Readonly<{
  categoryId: UUID | null
  categoryRef?: CategoryRef
  totalDollar: number
  subcategories: SubCategoryBreakdown[]
}>

export type MonthData = Readonly<{
  month: string // YYYY-MM
  incomeDollar: number
  expenseDollar: number
  netDollar: number
}>

export type YoYComparison = Readonly<{
  lastYearIncome: number
  lastYearExpense: number
  incomeChangePercent: number // positive = increase
  expenseChangePercent: number // positive = increase
  hasLastYearData: boolean
}>

export type YearlyData = Readonly<{
  // Summary
  totalIncome: number
  totalExpense: number
  netAmount: number
  monthlyAverageIncome: number
  monthlyAverageExpense: number

  // YoY Comparison
  yoy: YoYComparison

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

const DEFAULT_YOY: YoYComparison = {
  lastYearIncome: 0,
  lastYearExpense: 0,
  incomeChangePercent: 0,
  expenseChangePercent: 0,
  hasLastYearData: false
}

const DEFAULT_DATA: YearlyData = {
  totalIncome: 0,
  totalExpense: 0,
  netAmount: 0,
  monthlyAverageIncome: 0,
  monthlyAverageExpense: 0,
  yoy: DEFAULT_YOY,
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

/**
 * Aggregate category data by parent categoryKey.
 * Combines subcategories under their parent category and tracks subcategory breakdown.
 */
function aggregateByParentCategory(
  rawData: Array<{ categoryId: UUID | null; totalDollar: number }>
): CategoryBreakdown[] {
  const byKey = new Map<
    string,
    {
      totalDollar: number
      categoryRef: CategoryRef
      subcategories: Map<string, number>
    }
  >()

  for (const row of rawData) {
    if (!row.categoryId) {
      // Handle uncategorized
      const existing = byKey.get('__uncategorized__')
      if (existing) {
        existing.totalDollar += row.totalDollar
      } else {
        byKey.set('__uncategorized__', {
          totalDollar: row.totalDollar,
          categoryRef: { type: 'expense', categoryKey: UNCATEGORIZED_KEY },
          subcategories: new Map()
        })
      }
      continue
    }

    const ref = getCategoryRefByDbId(row.categoryId)
    if (!ref) continue // Skip orphaned transactions with deleted categories

    const parentKey = ref.categoryKey
    const subKey = ref.subCategoryKey

    const existing = byKey.get(parentKey)
    if (existing) {
      existing.totalDollar += row.totalDollar
      // Track subcategory if present
      if (subKey) {
        const currentSubTotal = existing.subcategories.get(subKey) ?? 0
        existing.subcategories.set(subKey, currentSubTotal + row.totalDollar)
      }
    } else {
      const subcategories = new Map<string, number>()
      if (subKey) {
        subcategories.set(subKey, row.totalDollar)
      }
      byKey.set(parentKey, {
        totalDollar: row.totalDollar,
        categoryRef: { type: ref.type, categoryKey: ref.categoryKey },
        subcategories
      })
    }
  }

  return Array.from(byKey.entries())
    .map(([_key, data]) => ({
      categoryId: null,
      categoryRef: data.categoryRef,
      totalDollar: data.totalDollar,
      subcategories: Array.from(data.subcategories.entries())
        .map(([subCategoryKey, totalDollar]) => ({ subCategoryKey, totalDollar }))
        .sort((a, b) => b.totalDollar - a.totalDollar)
    }))
    .sort((a, b) => b.totalDollar - a.totalDollar)
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
        const lastYear = year - 1

        const [monthlyFlow, expenseByCat, incomeByCat, lastYearFlow] = await Promise.all([
          getMonthlyFlowDollarForYear(year),
          getYearlyExpenseByCategoryDollar(year),
          getYearlyIncomeByCategoryDollar(year),
          getMonthlyFlowDollarForYear(lastYear)
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

        // Calculate YoY comparison
        // For current year, compare same months only (YTD vs YTD)
        // For past years, compare full year vs full year
        let lastYearIncome = 0
        let lastYearExpense = 0

        if (year === currentYear) {
          // Compare YTD: only months 1 to currentMonth
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

        const hasLastYearData = lastYearIncome > 0 || lastYearExpense > 0
        const incomeChangePercent = lastYearIncome > 0
          ? Math.round(((totalIncome - lastYearIncome) / lastYearIncome) * 1000) / 10
          : 0
        const expenseChangePercent = lastYearExpense > 0
          ? Math.round(((totalExpense - lastYearExpense) / lastYearExpense) * 1000) / 10
          : 0

        const yoy: YoYComparison = {
          lastYearIncome,
          lastYearExpense,
          incomeChangePercent,
          expenseChangePercent,
          hasLastYearData
        }

        // Transform and aggregate category data by parent category
        const expenseByCategory = aggregateByParentCategory(expenseByCat)
        const incomeByCategory = aggregateByParentCategory(incomeByCat)

        // Build monthly data (12 months)
        const monthlyData = buildMonthlyData(monthlyFlow, year)

        setData({
          totalIncome,
          totalExpense,
          netAmount,
          monthlyAverageIncome,
          monthlyAverageExpense,
          yoy,
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
