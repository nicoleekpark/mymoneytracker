import { FEATURE_FLAGS } from '@/shared/config'
import { EmptyState, SectionHeader } from '@/shared/components'
import { formatUsdInt } from '@/shared/format/currency'
import { useZeroSpendStore, useTransactionFocusStore } from '@/shared/store'
import { spacing } from '@/shared/theme/tokens/spacing'
import { SECTION_GAP } from '@/shared/theme/tokens/viewStyles'
import { useRouter } from 'expo-router'
import React, { useCallback, useEffect, useMemo } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'

import { DashboardHero, StatsRow } from '../shared'
import { BudgetProgressBar } from './components'
import { useBudgetSummary } from './budget'
import { MonthlyCalendar, ZeroSpendBadge, type CalendarColors } from './calendar'
import { useMonthlyDailyFlow } from './calendar/useMonthlyDailyFlow'
import { MonthlyCategoryContent, MonthlyIncomeContent } from './category'
import { useMonthlySummary } from './useMonthlySummary'
import { useMonthlyHeroData } from './useMonthlyHeroData'

const TRANSACTIONS_ROUTE = '/(tabs)/transactions' as const

export function MonthlyBody(props: { monthYYYYMM: string; colors: CalendarColors }) {
  const { monthYYYYMM, colors } = props
  const router = useRouter()
  const setFocusDate = useTransactionFocusStore((s) => s.setFocusDate)

  const { error, daily } = useMonthlyDailyFlow(monthYYYYMM)
  const { data: budgetData } = useBudgetSummary(monthYYYYMM)
  const { loading: loadingSummary, data: summaryData } = useMonthlySummary(monthYYYYMM)
  const { loading: loadingHero, data: heroData } = useMonthlyHeroData(monthYYYYMM)

  // Show loading state while fetching primary data
  const isLoading = loadingHero || loadingSummary

  function onPressDay(ymd: string) {
    // Set focusDate in store for reliable cross-screen communication
    setFocusDate(ymd)
    router.navigate(TRANSACTIONS_ROUTE)
  }

  // Calculate totals from summary data
  const totalExpense = summaryData.expenseTotalDollar
  const totalIncome = summaryData.incomeTotalDollar

  // Auto zero-spend days: days with income but no expense
  const autoZeroSpendCount = useMemo(() => {
    return daily.filter(d => d.incomeDollar > 0 && d.expenseDollar === 0).length
  }, [daily])

  // Manual zero-spend days (persisted in store)
  const { days: manualZeroSpendDays, toggleDay, _hydrate, _hydrated } = useZeroSpendStore()

  // Hydrate store on mount
  useEffect(() => {
    if (!_hydrated) {
      _hydrate()
    }
  }, [_hydrate, _hydrated])

  // Toggle zero-spend for a day
  const handleToggleZeroSpend = useCallback((ymd: string, isZeroSpend: boolean) => {
    toggleDay(ymd, isZeroSpend)
  }, [toggleDay])

  // Total zero-spend days (auto + manual, avoiding double-counting)
  const zeroSpendDays = useMemo(() => {
    // Days that are auto zero-spend
    const autoDays = new Set(
      daily.filter(d => d.incomeDollar > 0 && d.expenseDollar === 0).map(d => d.day)
    )
    // Manual days that aren't already auto
    let manualOnly = 0
    for (const ymd of manualZeroSpendDays) {
      if (!autoDays.has(ymd)) {
        manualOnly++
      }
    }
    return autoZeroSpendCount + manualOnly
  }, [daily, manualZeroSpendDays, autoZeroSpendCount])

  // Feature flag for hero variant
  const heroVariant = FEATURE_FLAGS.heroVariant === 'optionA' ? 'optionA' : 'optionB'

  // Show loading state while fetching primary data
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: spacing['3xl'] }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  // Check if there's any data (income or expense)
  const hasData = heroData.incomeDollar > 0 || heroData.expenseDollar > 0

  // Show empty state if no data
  if (!hasData) {
    return (
      <EmptyState
        title="No transactions yet"
        description="Add your first transaction to start tracking this month."
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
      {/* Section 1: Hero - Month Overview */}
      <View style={{ marginBottom: SECTION_GAP }}>
        <DashboardHero
          netDollar={heroData.netDollar}
          incomeDollar={heroData.incomeDollar}
          savingsRate={heroData.savingsRate}
          variant={heroVariant}
          dayOfPeriod={heroData.daysElapsed}
          totalDays={heroData.daysInMonth}
          showDayIndicator={heroData.isCurrentMonth}
          comparisonDollar={heroData.hasLastMonthData ? heroData.netChangeDollar : null}
          comparisonLabel={heroData.hasLastMonthData ? `vs ${heroData.lastMonthName}` : undefined}
          colors={colors}
        />

        <StatsRow
          incomeDollar={totalIncome}
          expenseDollar={totalExpense}
          colors={colors}
        />
      </View>

      {/* Section 2: Budget */}
      {budgetData && (
        <View style={{ marginBottom: SECTION_GAP }}>
          <SectionHeader
            title="Budget"
            rightText={formatUsdInt(budgetData.budgetDollar)}
            rightColor={colors.text}
            colors={colors}
          />
          <BudgetProgressBar
            spentDollar={budgetData.spentDollar}
            budgetDollar={budgetData.budgetDollar}
            remainingDollar={budgetData.remainingDollar}
            colors={colors}
          />
        </View>
      )}

      {/* Section 3: Daily Cash Flow */}
      <View style={{ marginBottom: SECTION_GAP }}>
        <SectionHeader
          title="Daily activity"
          colors={colors}
        />
        {error && <Text style={{ color: colors.danger }}>{error}</Text>}
        {!error && (
          <>
            <ZeroSpendBadge count={zeroSpendDays} colors={colors} />
            <MonthlyCalendar
              monthYYYYMM={monthYYYYMM}
              daily={daily}
              colors={colors}
              onPressDay={onPressDay}
              manualZeroSpendDays={manualZeroSpendDays}
              onToggleZeroSpend={handleToggleZeroSpend}
            />
          </>
        )}
      </View>

      {/* Section 4: Spending by Category */}
      <View style={{ marginBottom: SECTION_GAP }}>
        <SectionHeader
          title="Where it went"
          rightText={totalExpense > 0 ? formatUsdInt(totalExpense) : undefined}
          rightColor={colors.danger}
          colors={colors}
        />
        <MonthlyCategoryContent
          monthYYYYMM={monthYYYYMM}
          colors={colors}
          hideHeader
        />
      </View>

      {/* Section 5: Income by Category */}
      {totalIncome > 0 && (
        <View style={{ marginBottom: SECTION_GAP }}>
          <SectionHeader
            title="Where it came from"
            rightText={formatUsdInt(totalIncome)}
            rightColor={colors.success}
            colors={colors}
          />
          <MonthlyIncomeContent
            monthYYYYMM={monthYYYYMM}
            colors={colors}
            hideHeader
          />
        </View>
      )}
    </ScrollView>
  )
}
