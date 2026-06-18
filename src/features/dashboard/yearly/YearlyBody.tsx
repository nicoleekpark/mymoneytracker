import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { spacing } from '@/shared/theme/tokens/spacing'
import { SECTION_GAP } from '@/shared/theme/tokens/viewStyles'
import { FEATURE_FLAGS } from '@/shared/config'
import { EmptyState, SectionHeader } from '@/shared/components'
import { formatUsdInt } from '@/shared/format/currency'

import { CategoryAccordion, DashboardHero, StatsRow } from '../shared'
import { MonthlyCashflowChart } from './components'
import { useYearlyHeroData, useYearlyData } from './hooks'

export type YearlyColors = Readonly<{
  text: string
  textSecondary: string
  border: string
  surface: string
  surfaceAlt: string
  primary: string
  success: string
  danger: string
  warning: string
}>

type Props = {
  year: number
  colors: YearlyColors
  onMonthPress?: (month: number) => void
}

export function YearlyBody({ year, colors, onMonthPress }: Props) {
  const { loading, error, data } = useYearlyData(year)
  const { data: heroData } = useYearlyHeroData(year)

  // Feature flag for hero variant
  const heroVariant = FEATURE_FLAGS.heroVariant === 'optionA' ? 'optionA' : 'optionB'

  // Auto-expand the largest expense category with subcategories
  const defaultExpenseExpanded = useMemo(() => {
    const firstWithSubs = data.expenseByCategory.find(cat => cat.subcategories && cat.subcategories.length > 0)
    if (firstWithSubs?.categoryRef?.categoryKey) {
      return new Set([firstWithSubs.categoryRef.categoryKey])
    }
    return new Set<string>()
  }, [data.expenseByCategory])

  // Auto-expand the largest income category with subcategories
  const defaultIncomeExpanded = useMemo(() => {
    const firstWithSubs = data.incomeByCategory.find(cat => cat.subcategories && cat.subcategories.length > 0)
    if (firstWithSubs?.categoryRef?.categoryKey) {
      return new Set([firstWithSubs.categoryRef.categoryKey])
    }
    return new Set<string>()
  }, [data.incomeByCategory])

  const [expandedExpenseCategories, setExpandedExpenseCategories] = useState<Set<string>>(new Set())
  const [expandedIncomeCategories, setExpandedIncomeCategories] = useState<Set<string>>(new Set())
  const [showAllExpense, setShowAllExpense] = useState(false)
  const [showAllIncome, setShowAllIncome] = useState(false)

  // Sync expanded categories with default when data changes
  const expenseInitRef = useRef(false)
  const incomeInitRef = useRef(false)

  useEffect(() => {
    if (!expenseInitRef.current && defaultExpenseExpanded.size > 0) {
      setExpandedExpenseCategories(defaultExpenseExpanded)
      expenseInitRef.current = true
    }
  }, [defaultExpenseExpanded])

  useEffect(() => {
    if (!incomeInitRef.current && defaultIncomeExpanded.size > 0) {
      setExpandedIncomeCategories(defaultIncomeExpanded)
      incomeInitRef.current = true
    }
  }, [defaultIncomeExpanded])

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const isPastYear = year < currentYear
  const isCurrentYear = year === currentYear

  // Calculate totals
  const totalIncome = data.totalIncome
  const totalExpense = data.totalExpense
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0

  // Toggle handlers
  const toggleExpenseCategory = useCallback((categoryKey: string) => {
    setExpandedExpenseCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryKey)) {
        next.delete(categoryKey)
      } else {
        next.add(categoryKey)
      }
      return next
    })
  }, [])

  const toggleIncomeCategory = useCallback((categoryKey: string) => {
    setExpandedIncomeCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryKey)) {
        next.delete(categoryKey)
      } else {
        next.add(categoryKey)
      }
      return next
    })
  }, [])

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: spacing['3xl'] }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: spacing['3xl'] }}>
        <Text style={{ color: colors.danger }}>{error}</Text>
      </View>
    )
  }

  // Check if there's any data (income or expense)
  const hasData = totalIncome > 0 || totalExpense > 0

  // Show empty state if no data
  if (!hasData) {
    return (
      <EmptyState
        title="No transactions yet"
        description="Add transactions to start tracking this year."
        colors={colors}
      />
    )
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing['3xl'] }}
      showsVerticalScrollIndicator={false}
    >
      {/* Section 1: Hero - Year Overview */}
      <View style={{
        marginBottom: SECTION_GAP,
        backgroundColor: colors.primary + '0F',
        borderRadius: 16,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: spacing.lg,
        marginHorizontal: -spacing.md,
      }}>
        <DashboardHero
          netDollar={heroData.netDollar}
          incomeDollar={heroData.incomeDollar}
          savingsRate={savingsRate}
          variant={heroVariant}
          comparisonDollar={heroData.hasLastYearData ? heroData.netChangeDollar : null}
          comparisonLabel={heroData.hasLastYearData ? `vs ${year - 1}` : undefined}
          comparisonSuffix={heroData.isCurrentYear ? ' YTD' : ''}
          colors={colors}
        />

        <StatsRow
          incomeDollar={totalIncome}
          expenseDollar={totalExpense}
          colors={colors}
        />
      </View>

      {/* Section 2: Year Cashflow */}
      <View style={{ marginBottom: SECTION_GAP }}>
        <SectionHeader title="Year cashflow" colors={colors} />
        <MonthlyCashflowChart
          monthlyData={data.monthlyData}
          currentMonth={currentMonth}
          isCurrentYear={isCurrentYear}
          isPastYear={isPastYear}
          colors={{
            text: colors.text,
            textSecondary: colors.textSecondary,
            surface: colors.surface,
            surfaceAlt: colors.surfaceAlt,
            success: colors.success,
            danger: colors.danger,
            primary: colors.primary,
            warning: colors.warning,
          }}
          onMonthPress={onMonthPress}
        />
      </View>

      {/* Section 3: Top Categories */}
      <View style={{ marginBottom: SECTION_GAP }}>
        <SectionHeader
          title="Where it went"
          rightText={totalExpense > 0 ? formatUsdInt(totalExpense) : undefined}
          rightColor={colors.danger}
          colors={colors}
        />
        <CategoryAccordion
          categories={data.expenseByCategory}
          totalAmount={totalExpense}
          expandedKeys={expandedExpenseCategories}
          onToggle={toggleExpenseCategory}
          showAll={showAllExpense}
          onToggleShowAll={() => setShowAllExpense(!showAllExpense)}
          emptyText="No spending yet"
          colors={colors}
        />
      </View>

      {/* Section 4: Income Categories */}
      {totalIncome > 0 && (
        <View style={{ marginBottom: SECTION_GAP }}>
          <SectionHeader
            title="Where it came from"
            rightText={formatUsdInt(totalIncome)}
            rightColor={colors.success}
            colors={colors}
          />
          <CategoryAccordion
            categories={data.incomeByCategory}
            totalAmount={totalIncome}
            expandedKeys={expandedIncomeCategories}
            onToggle={toggleIncomeCategory}
            showAll={showAllIncome}
            onToggleShowAll={() => setShowAllIncome(!showAllIncome)}
            emptyText="No income yet"
            colors={colors}
          />
        </View>
      )}
    </ScrollView>
  )
}
