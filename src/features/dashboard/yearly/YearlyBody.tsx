import React, { useMemo } from 'react'
import { Text, View } from 'react-native'

import { CATEGORIES } from '@/config/categories.config'
import { Stack } from '@/shared/components'

import {
  CategoryBreakdownList,
  GoalProgressHeader,
  YearlyProjectionCard,
  type CategoryItemData
} from './components'
import { useYearlyData, useYearlyProjection, type CategoryBreakdown } from './hooks'

export type YearlyColors = Readonly<{
  text: string
  textSecondary: string
  border: string
  surface: string
  surfaceAlt: string
  primary: string
  success: string
  danger: string
}>

type Props = {
  year: number
  colors: YearlyColors
}

type SubcategoryData = {
  name: string
  icon: string
  color: string
  total: number
}

/**
 * Build category list data with subcategories aggregated by parent
 */
function buildCategoryListData(
  categories: CategoryBreakdown[],
  monthsElapsed: number
): CategoryItemData[] {
  const byParentCategory = new Map<string, {
    totalDollar: number
    categoryRef?: CategoryBreakdown['categoryRef']
    subcategories: SubcategoryData[]
  }>()

  for (const cat of categories) {
    const parentKey = cat.categoryRef?.categoryKey ?? 'uncategorized'
    const existing = byParentCategory.get(parentKey)

    // Get subcategory info
    const subKey = cat.categoryRef?.subCategoryKey
    let subMeta: SubcategoryData | null = null

    if (subKey && cat.categoryRef?.categoryKey) {
      const parentCat = CATEGORIES.find(c => c.key === cat.categoryRef?.categoryKey)
      const subCat = parentCat?.subCategories.find(s => s.key === subKey)
      if (subCat) {
        subMeta = {
          name: subCat.name,
          icon: subCat.icon,
          color: subCat.color,
          total: cat.totalDollar
        }
      }
    }

    if (existing) {
      existing.totalDollar += cat.totalDollar
      if (subMeta) {
        existing.subcategories.push(subMeta)
      }
    } else {
      byParentCategory.set(parentKey, {
        totalDollar: cat.totalDollar,
        categoryRef: cat.categoryRef
          ? { type: cat.categoryRef.type, categoryKey: cat.categoryRef.categoryKey }
          : undefined,
        subcategories: subMeta ? [subMeta] : []
      })
    }
  }

  const avgDivisor = Math.max(monthsElapsed, 1)

  return Array.from(byParentCategory.values())
    .sort((a, b) => b.totalDollar - a.totalDollar)
    .map(item => ({
      categoryRef: item.categoryRef,
      total: item.totalDollar,
      average: item.totalDollar / avgDivisor,
      subcategories: item.subcategories.sort((a, b) => b.total - a.total).slice(0, 5)
    }))
}

export function YearlyBody({ year, colors }: Props) {
  const { loading, error, data } = useYearlyData(year)
  const { data: projectionData } = useYearlyProjection(year)

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const isPastYear = year < currentYear
  const monthsElapsed = isPastYear ? 12 : currentMonth

  // Build unified category data for both income and expense
  const incomeCategories = useMemo(
    () => buildCategoryListData(data.incomeByCategory, monthsElapsed),
    [data.incomeByCategory, monthsElapsed]
  )

  const expenseCategories = useMemo(
    () => buildCategoryListData(data.expenseByCategory, monthsElapsed),
    [data.expenseByCategory, monthsElapsed]
  )

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 }}>
        <Text style={{ color: colors.text, opacity: 0.7 }}>Loading...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 }}>
        <Text style={{ color: colors.danger }}>{error}</Text>
      </View>
    )
  }

  return (
    <Stack gap="xl" scroll>
      {/* Year Overview with monthly bars */}
      <GoalProgressHeader
        year={year}
        totalIncome={data.totalIncome}
        totalExpense={data.totalExpense}
        monthlyData={data.monthlyData}
        colors={colors}
      />

      {/* Yearly Projection - Current year only */}
      {projectionData.monthsElapsed > 0 && (
        <YearlyProjectionCard
          year={year}
          data={projectionData}
          colors={colors}
        />
      )}

      {/* Income by Source */}
      <CategoryBreakdownList
        title="Income by Source"
        type="income"
        categories={incomeCategories}
        totalAmount={data.totalIncome}
        colors={colors}
      />

      {/* Spending by Category */}
      <CategoryBreakdownList
        title="Spending by Category"
        type="expense"
        categories={expenseCategories}
        totalAmount={data.totalExpense}
        colors={colors}
      />
    </Stack>
  )
}
