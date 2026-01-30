import React, { useMemo } from 'react'
import { ScrollView, Text, View } from 'react-native'

import { CATEGORIES } from '@/config/categories.config'

import {
  GoalProgressHeader,
  MoneyFlowRiver,
  SparklineList
} from './components'
import { useYearlyData, type CategoryBreakdown, type MonthData } from './hooks'

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

function getCategoryMeta(categoryKey?: string) {
  if (!categoryKey) {
    return { name: 'Uncategorized', icon: '📦', color: '#666' }
  }

  const cat = CATEGORIES.find(c => c.key === categoryKey)
  if (!cat) {
    return { name: categoryKey, icon: '📦', color: '#666' }
  }

  return { name: cat.name, icon: cat.icon, color: cat.color }
}

type SubcategoryData = {
  name: string
  icon: string
  color: string
  total: number
  average: number
}

function buildSparklineData(
  categories: CategoryBreakdown[],
  monthlyData: MonthData[]
) {
  // Aggregate by parent category (categoryKey) and collect subcategories
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
          total: cat.totalDollar,
          average: cat.totalDollar / 12
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

  // Convert to array and create monthly amounts for sparklines
  return Array.from(byParentCategory.values())
    .sort((a, b) => b.totalDollar - a.totalDollar)
    .map(item => {
      const monthlyAmounts = monthlyData.map(() => {
        return item.totalDollar / 12
      })

      // Sort subcategories by total and take top 5
      const topSubcategories = item.subcategories
        .sort((a, b) => b.total - a.total)
        .slice(0, 5)

      return {
        categoryRef: item.categoryRef,
        monthlyAmounts,
        total: item.totalDollar,
        average: item.totalDollar / 12,
        subcategories: topSubcategories
      }
    })
}


export function YearlyBody({ year, colors }: Props) {
  const { loading, error, data } = useYearlyData(year)

  const sparklineData = useMemo(
    () => buildSparklineData(data.expenseByCategory, data.monthlyData),
    [data.expenseByCategory, data.monthlyData]
  )

  const incomeFlows = useMemo(() => {
    // Aggregate by parent category
    const byParent = new Map<string, { amount: number; categoryRef?: CategoryBreakdown['categoryRef'] }>()
    for (const cat of data.incomeByCategory) {
      const key = cat.categoryRef?.categoryKey ?? 'uncategorized'
      const existing = byParent.get(key)
      if (existing) {
        existing.amount += cat.totalDollar
      } else {
        byParent.set(key, {
          amount: cat.totalDollar,
          categoryRef: cat.categoryRef
            ? { type: cat.categoryRef.type, categoryKey: cat.categoryRef.categoryKey }
            : undefined
        })
      }
    }
    return Array.from(byParent.values()).sort((a, b) => b.amount - a.amount)
  }, [data.incomeByCategory])

  const expenseFlows = useMemo(() => {
    // Aggregate by parent category
    const byParent = new Map<string, { amount: number; categoryRef?: CategoryBreakdown['categoryRef'] }>()
    for (const cat of data.expenseByCategory) {
      const key = cat.categoryRef?.categoryKey ?? 'uncategorized'
      const existing = byParent.get(key)
      if (existing) {
        existing.amount += cat.totalDollar
      } else {
        byParent.set(key, {
          amount: cat.totalDollar,
          categoryRef: cat.categoryRef
            ? { type: cat.categoryRef.type, categoryKey: cat.categoryRef.categoryKey }
            : undefined
        })
      }
    }
    return Array.from(byParent.values()).sort((a, b) => b.amount - a.amount)
  }, [data.expenseByCategory])

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
    <ScrollView
      contentContainerStyle={{ paddingBottom: 30, gap: 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Goal Progress Header */}
      <GoalProgressHeader
        year={year}
        goalAmount={data.goalAmount}
        currentNetAsset={data.currentNetAsset}
        yearStartNetAsset={data.yearStartNetAsset}
        totalAsset={data.totalAsset}
        totalDebt={data.totalDebt}
        liquidAsset={data.liquidAsset}
        totalIncome={data.totalIncome}
        totalExpense={data.totalExpense}
        monthlyData={data.monthlyData}
        colors={colors}
      />

      {/* Money Flow River (Sankey) */}
      <MoneyFlowRiver
        incomeByCategory={incomeFlows}
        expenseByCategory={expenseFlows}
        netAmount={data.netAmount}
        colors={colors}
      />

      {/* Spending by Category */}
      <SparklineList
        categories={sparklineData}
        totalExpense={data.totalExpense}
        colors={colors}
        onCategoryPress={(key) => {
          console.log('Category pressed:', key)
        }}
      />
    </ScrollView>
  )
}
