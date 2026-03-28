import { FEATURE_FLAGS } from '@/shared/config'
import { SectionHeader } from '@/shared/components'
import { formatUsdInt } from '@/shared/format/currency'
import { displaySize, fontSize, fontWeight, letterSpacing } from '@/shared/theme/tokens/typography'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { SECTION_GAP } from '@/shared/theme/tokens/viewStyles'
import { useRouter } from 'expo-router'
import React, { useMemo } from 'react'
import { ScrollView, Text, View } from 'react-native'

import { useBudgetSummary } from './budget'
import { MonthlyCalendar, type CalendarColors } from './calendar'
import { useMonthlyDailyFlow } from './calendar/useMonthlyDailyFlow'
import { MonthlyCategoryContent, MonthlyIncomeContent } from './category'
import { useMonthlyProjection } from './projection'
import { useMonthlySummary } from './useMonthlySummary'
import { useMonthlyHeroData } from './useMonthlyHeroData'
import { getMonthNameShort } from '../utils'

function buildMonthTitle(monthYYYYMM: string) {
  const [y, m] = monthYYYYMM.split('-')
  const month = Number(m)
  return `${getMonthNameShort(month)} ${y}`
}

const TRANSACTIONS_ROUTE = '/transactions' as const

export function MonthlyBody(props: { monthYYYYMM: string; colors: CalendarColors }) {
  const { monthYYYYMM, colors } = props
  const router = useRouter()

  const { error, daily } = useMonthlyDailyFlow(monthYYYYMM)
  const { data: budgetData } = useBudgetSummary(monthYYYYMM)
  const { data: projectionData } = useMonthlyProjection(monthYYYYMM)
  const { data: summaryData } = useMonthlySummary(monthYYYYMM)
  const { data: heroData } = useMonthlyHeroData(monthYYYYMM)

  const _title = useMemo(() => buildMonthTitle(monthYYYYMM), [monthYYYYMM])

  function onPressDay(ymd: string) {
    router.push({
      pathname: TRANSACTIONS_ROUTE,
      params: { focusDate: ymd }
    })
  }

  // Calculate totals from summary data (works for all months)
  const totalExpense = summaryData.expenseTotalDollar
  const totalIncome = summaryData.incomeTotalDollar
  const savings = summaryData.netCashFlowDollar

  // Savings rate calculation
  const savingsRate = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0


  // Budget calculations
  const budgetBarWidth = budgetData
    ? Math.min((budgetData.spentDollar / budgetData.budgetDollar) * 100, 100)
    : 0

  // Zero-spend days: days with income but no expense
  const zeroSpendDays = useMemo(() => {
    return daily.filter(d => d.incomeDollar > 0 && d.expenseDollar === 0).length
  }, [daily])


  // Feature flag for hero variant
  const useOptionAHero = FEATURE_FLAGS.heroVariant === 'optionA'

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing['3xl'] }}
      showsVerticalScrollIndicator={false}
    >
      {/* Section 1: Hero - Month Overview */}
      <View style={{ marginBottom: SECTION_GAP }}>
        {/* Option A Hero: Net Outcome */}
        {useOptionAHero ? (
          <>
            {/* Day indicator for current month */}
            {heroData.isCurrentMonth && heroData.daysElapsed > 0 && (
              <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary, textAlign: 'right', marginBottom: spacing.xs }}>
                Day {heroData.daysElapsed} of {heroData.daysInMonth}
              </Text>
            )}

            {/* Hero: Net outcome */}
            <View style={{ alignItems: 'center', paddingVertical: spacing.xl, marginBottom: spacing.sm }}>
              {/* Title line */}
              <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary, letterSpacing: letterSpacing.wider, marginBottom: spacing.sm }}>
                Net Cash Flow
              </Text>

              {/* Primary: Net amount - neutral color like Assets */}
              <Text
                style={{
                  fontSize: displaySize.xl,
                  fontWeight: fontWeight.heavy,
                  color: colors.text,
                  letterSpacing: -1
                }}
              >
                {heroData.netDollar >= 0 ? '+' : ''}{formatUsdInt(heroData.netDollar)}
              </Text>

              {/* Comparison with last month - only delta colored */}
              {heroData.hasLastMonthData && heroData.netChangeDollar !== null && (
                <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.sm }}>
                  <Text style={{ color: heroData.netChangeDollar >= 0 ? colors.success : colors.danger }}>
                    {heroData.netChangeDollar >= 0 ? '↑' : '↓'} {formatUsdInt(Math.abs(heroData.netChangeDollar))}
                  </Text>
                  {' '}vs {heroData.lastMonthName}
                </Text>
              )}

              {/* Supporting: Savings rate (only if positive income) */}
              {heroData.incomeDollar > 0 && (
                <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginTop: spacing.md, opacity: 0.8 }}>
                  {heroData.savingsRate >= 0 ? 'Saved' : 'Overspent'} {Math.abs(heroData.savingsRate)}% of income
                </Text>
              )}

              {/* Nudge */}
              {heroData.netDollar > 0 && heroData.isCurrentMonth && (
                <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginTop: spacing.sm, opacity: 0.6, fontStyle: 'italic' }}>
                  Keep this pace for the rest of the month
                </Text>
              )}
            </View>
          </>
        ) : (
          <>
            {/* Current Hero: % Saved */}
            {/* Day indicator (month title removed - duplicate with date picker) */}
            {projectionData.daysElapsed > 0 && (
              <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary, textAlign: 'right', marginBottom: spacing.xs }}>
                Day {projectionData.daysElapsed} of {projectionData.daysInMonth}
              </Text>
            )}

            {/* Hero: $ saved (absolute first, % as supporting) */}
            <View style={{ alignItems: 'center', paddingVertical: spacing.xl, marginBottom: spacing.sm }}>
              {totalIncome > 0 ? (
                savings > 0 ? (
                  // Positive savings - dollar amount primary, % supporting
                  <>
                    <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary, letterSpacing: letterSpacing.wider, marginBottom: spacing.sm }}>
                      Saved
                    </Text>
                    <Text style={{ fontSize: displaySize.xl, fontWeight: fontWeight.heavy, color: colors.success, letterSpacing: -1 }}>
                      {formatUsdInt(savings)}
                    </Text>
                    <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.sm }}>
                      That's <Text style={{ fontWeight: fontWeight.semibold, color: colors.success }}>{savingsRate}%</Text> of income
                    </Text>
                  </>
                ) : savings < 0 ? (
                  // Spending exceeds income
                  <>
                    <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary, letterSpacing: letterSpacing.wider, marginBottom: spacing.sm }}>
                      Spending exceeds income by
                    </Text>
                    <Text style={{ fontSize: displaySize.xl, fontWeight: fontWeight.heavy, color: colors.danger, letterSpacing: -1 }}>
                      {formatUsdInt(Math.abs(savings))}
                    </Text>
                    <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.sm }}>
                      That's <Text style={{ fontWeight: fontWeight.semibold, color: colors.danger }}>{Math.abs(savingsRate)}%</Text> of income
                    </Text>
                  </>
                ) : (
                  // Broke even (savings = 0)
                  <>
                    <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary, letterSpacing: letterSpacing.wider, marginBottom: spacing.sm }}>
                      Breaking even
                    </Text>
                    <Text style={{ fontSize: displaySize.md, fontWeight: fontWeight.bold, color: colors.textSecondary }}>
                      {formatUsdInt(0)}
                    </Text>
                    <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs }}>
                      net
                    </Text>
                  </>
                )
              ) : (
                // No income
                <>
                  <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary, letterSpacing: letterSpacing.wider, marginBottom: spacing.sm }}>
                    Net Cash Flow
                  </Text>
                  <Text style={{ fontSize: displaySize.sm, fontWeight: fontWeight.bold, color: colors.textSecondary }}>
                    No income recorded
                  </Text>
                  {savings < 0 && (
                    <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.sm }}>
                      <Text style={{ fontWeight: fontWeight.semibold, color: colors.danger }}>{formatUsdInt(Math.abs(savings))}</Text> spent
                    </Text>
                  )}
                </>
              )}
            </View>
          </>
        )}

        {/* Stats Row: Income / Expense - Accessible/Tied up style with semantic colors */}
        <View style={{ flexDirection: 'row' }}>
          {/* Income */}
          <View style={{ flex: 1, padding: spacing.lg, alignItems: 'center' }}>
            <Text
              style={{
                fontSize: fontSize.xs,
                fontWeight: fontWeight.medium,
                color: colors.textSecondary,
                letterSpacing: letterSpacing.wider,
                marginBottom: spacing.xs
              }}
            >
              Income
            </Text>
            <Text style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.success, fontVariant: ['tabular-nums'] }}>
              {formatUsdInt(totalIncome)}
            </Text>
          </View>

          {/* Subtle middle divider */}
          <View style={{ width: 1, backgroundColor: colors.border, marginVertical: spacing.sm, opacity: 0.5 }} />

          {/* Expense */}
          <View style={{ flex: 1, padding: spacing.lg, alignItems: 'center' }}>
            <Text
              style={{
                fontSize: fontSize.xs,
                fontWeight: fontWeight.medium,
                color: colors.textSecondary,
                letterSpacing: letterSpacing.wider,
                marginBottom: spacing.xs
              }}
            >
              Expense
            </Text>
            <Text style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.danger, fontVariant: ['tabular-nums'] }}>
              {formatUsdInt(totalExpense)}
            </Text>
          </View>
        </View>
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
          {/* Progress row: spent | bar | left */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            {/* Spent amount */}
            <View>
              <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text }}>
                {formatUsdInt(budgetData.spentDollar)}
              </Text>
              <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary, marginTop: spacing.xs }}>
                spent
              </Text>
            </View>
            {/* Progress bar */}
            <View
              style={{
                flex: 1,
                height: spacing.sm,
                backgroundColor: colors.surfaceAlt,
                borderRadius: radius.sm,
                overflow: 'hidden'
              }}
            >
              <View
                style={{
                  height: '100%',
                  width: `${budgetBarWidth}%`,
                  backgroundColor: colors.textSecondary,
                  borderRadius: radius.sm
                }}
              />
            </View>
            {/* Remaining amount */}
            <View style={{ alignItems: 'flex-end' }}>
              <Text
                style={{
                  fontSize: fontSize.lg,
                  fontWeight: fontWeight.bold,
                  color: budgetData.remainingDollar >= 0 ? colors.success : colors.danger
                }}
              >
                {formatUsdInt(Math.abs(budgetData.remainingDollar))}
              </Text>
              <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary, marginTop: spacing.xs }}>
                {budgetData.remainingDollar >= 0 ? 'available' : 'over'}
              </Text>
            </View>
          </View>
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
            {/* Summary stats above calendar with zero-spend indicator */}
            {zeroSpendDays > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: spacing.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  {/* Top-left corner triangle indicator for zero-spend */}
                  <View
                    style={{
                      width: 16,
                      height: 12,
                      backgroundColor: colors.textSecondary + '20',
                      borderRadius: radius.xs,
                      overflow: 'hidden'
                    }}
                  >
                    <View
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 0,
                        height: 0,
                        borderStyle: 'solid',
                        borderTopWidth: 8,
                        borderRightWidth: 8,
                        borderBottomWidth: 0,
                        borderLeftWidth: 0,
                        borderTopColor: colors.highlight,
                        borderRightColor: 'transparent',
                        borderBottomColor: 'transparent',
                        borderLeftColor: 'transparent'
                      }}
                    />
                  </View>
                  <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>
                    {zeroSpendDays} zero-spend
                  </Text>
                </View>
              </View>
            )}
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
