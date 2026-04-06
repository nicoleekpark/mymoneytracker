import { FEATURE_FLAGS } from '@/shared/config'
import { SectionHeader } from '@/shared/components'
import { formatUsdInt } from '@/shared/format/currency'
import { spacing } from '@/shared/theme/tokens/spacing'
import { SECTION_GAP } from '@/shared/theme/tokens/viewStyles'
import { useRouter } from 'expo-router'
import React, { useMemo } from 'react'
import { ScrollView, Text, View } from 'react-native'

import { DashboardHero, StatsRow } from '../shared'
import { BudgetProgressBar } from './components'
import { useBudgetSummary } from './budget'
import { MonthlyCalendar, ZeroSpendBadge, type CalendarColors } from './calendar'
import { useMonthlyDailyFlow } from './calendar/useMonthlyDailyFlow'
import { MonthlyCategoryContent, MonthlyIncomeContent } from './category'
import { useMonthlySummary } from './useMonthlySummary'
import { useMonthlyHeroData } from './useMonthlyHeroData'

const TRANSACTIONS_ROUTE = '/transactions' as const

export function MonthlyBody(props: { monthYYYYMM: string; colors: CalendarColors }) {
  const { monthYYYYMM, colors } = props
  const router = useRouter()

  const { error, daily } = useMonthlyDailyFlow(monthYYYYMM)
  const { data: budgetData } = useBudgetSummary(monthYYYYMM)
  const { data: summaryData } = useMonthlySummary(monthYYYYMM)
  const { data: heroData } = useMonthlyHeroData(monthYYYYMM)

  function onPressDay(ymd: string) {
    router.push({
      pathname: TRANSACTIONS_ROUTE,
      params: { focusDate: ymd }
    })
  }

  // Calculate totals from summary data
  const totalExpense = summaryData.expenseTotalDollar
  const totalIncome = summaryData.incomeTotalDollar

  // Zero-spend days: days with income but no expense
  const zeroSpendDays = useMemo(() => {
    return daily.filter(d => d.incomeDollar > 0 && d.expenseDollar === 0).length
  }, [daily])

  // Feature flag for hero variant
  const heroVariant = FEATURE_FLAGS.heroVariant === 'optionA' ? 'optionA' : 'optionB'

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
          nudgeText="Keep this pace for the rest of the month"
          showNudge={heroData.isCurrentMonth}
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
