import { FEATURE_FLAGS } from '@/config'
import { formatUsdInt } from '@/shared/format/currency'
import { displaySize, fontSize } from '@/theme/tokens/typography'
import { radius } from '@/theme/tokens/radius'
import { useRouter } from 'expo-router'
import React, { useMemo } from 'react'
import { ScrollView, Text, View } from 'react-native'

import { useBudgetSummary } from './budget'
import { MonthlyCalendar, type CalendarColors, type DailyFlow } from './calendar'
import { useMonthlyDailyFlow } from './calendar/useMonthlyDailyFlow'
import { MonthlyCategoryContent, MonthlyIncomeContent } from './category'
import { useMonthlyProjection } from './projection'
import { useMonthlySummary } from './useMonthlySummary'
import { useMonthlyHeroData } from './useMonthlyHeroData'
import { getMonthNameShort } from '../types/dashboard.types'

function buildMonthTitle(monthYYYYMM: string) {
  const [y, m] = monthYYYYMM.split('-')
  const month = Number(m)
  return `${getMonthNameShort(month)} ${y}`
}

const TRANSACTIONS_ROUTE = '/transactions' as const

// Section gap for combined style
const SECTION_GAP = 40

// Accent line colors (neon palette)
const ACCENT_COLORS = {
  green: '#00ffa3',  // neon mint
  blue: '#00d4ff',   // neon cyan
  red: '#ff6b00',    // neon orange
}

/**
 * Section header with accent line - stronger styling
 */
function SectionHeader({
  title,
  accentColor,
  rightText,
  rightColor,
  colors
}: {
  title: string
  accentColor: string
  rightText?: string
  rightColor?: string
  colors: CalendarColors
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <View style={{ width: 3, height: 20, borderRadius: radius.xs, backgroundColor: accentColor }} />
      <Text style={{ fontSize: fontSize['2xl'], fontWeight: '700', color: colors.text }}>
        {title}
      </Text>
      {rightText && (
        <Text style={{ marginLeft: 'auto', fontSize: fontSize.md, fontWeight: '700', color: rightColor || colors.text }}>
          {rightText}
        </Text>
      )}
    </View>
  )
}

export function MonthlyBody(props: { monthYYYYMM: string; colors: CalendarColors }) {
  const { monthYYYYMM, colors } = props
  const router = useRouter()

  const { loading, error, daily } = useMonthlyDailyFlow(monthYYYYMM)
  const { data: budgetData } = useBudgetSummary(monthYYYYMM)
  const { data: projectionData } = useMonthlyProjection(monthYYYYMM)
  const { data: summaryData } = useMonthlySummary(monthYYYYMM)
  const { data: heroData } = useMonthlyHeroData(monthYYYYMM)

  const title = useMemo(() => buildMonthTitle(monthYYYYMM), [monthYYYYMM])

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

  // Low variable spend days: days with expense but variable expense < $20
  const lowSpendDays = useMemo(() => {
    return daily.filter(d => d.expenseDollar > 0 && d.variableExpenseDollar < 20).length
  }, [daily])

  // Feature flag for hero variant
  const useOptionAHero = FEATURE_FLAGS.heroVariant === 'optionA'

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Section 1: Hero - Month Overview */}
      <View style={{ marginBottom: SECTION_GAP }}>
        {/* Option A Hero: Net Outcome */}
        {useOptionAHero ? (
          <>
            {/* Day indicator for current month */}
            {heroData.isCurrentMonth && heroData.daysElapsed > 0 && (
              <Text style={{ fontSize: fontSize.xs, fontWeight: '500', color: colors.textMuted, textAlign: 'right', marginBottom: 4 }}>
                Day {heroData.daysElapsed} of {heroData.daysInMonth}
              </Text>
            )}

            {/* Hero: Net outcome */}
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              {/* Title line */}
              <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, marginBottom: 4 }}>
                Net
              </Text>

              {/* Primary: Net amount */}
              <Text
                style={{
                  fontSize: displaySize.xl,
                  fontWeight: '800',
                  color: heroData.netDollar >= 0 ? colors.success : colors.danger
                }}
              >
                {heroData.netDollar >= 0 ? '+' : ''}{formatUsdInt(heroData.netDollar)}
              </Text>

              {/* Comparison with last month */}
              {heroData.hasLastMonthData && heroData.netChangeDollar !== null && (
                <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, marginTop: 8 }}>
                  {heroData.netChangeDollar >= 0 ? 'Up' : 'Down'} {formatUsdInt(Math.abs(heroData.netChangeDollar))} vs {heroData.lastMonthName}
                </Text>
              )}

              {/* Supporting: Savings rate (only if positive income) */}
              {heroData.incomeDollar > 0 && (
                <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: 12, opacity: 0.8 }}>
                  {heroData.savingsRate >= 0 ? 'Saved' : 'Overspent'} {Math.abs(heroData.savingsRate)}% of income
                </Text>
              )}

              {/* Nudge */}
              {heroData.netDollar > 0 && heroData.isCurrentMonth && (
                <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: 8, opacity: 0.6, fontStyle: 'italic' }}>
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
              <Text style={{ fontSize: fontSize.xs, fontWeight: '500', color: colors.textMuted, textAlign: 'right', marginBottom: 4 }}>
                Day {projectionData.daysElapsed} of {projectionData.daysInMonth}
              </Text>
            )}

            {/* Hero: $ saved (absolute first, % as supporting) */}
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              {totalIncome > 0 ? (
                savings > 0 ? (
                  // Positive savings - dollar amount primary, % supporting
                  <>
                    <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, marginBottom: 4 }}>
                      Saved
                    </Text>
                    <Text style={{ fontSize: displaySize.xl, fontWeight: '800', color: colors.success }}>
                      {formatUsdInt(savings)}
                    </Text>
                    <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, marginTop: 8 }}>
                      That's <Text style={{ fontWeight: '600', color: colors.success }}>{savingsRate}%</Text> of income
                    </Text>
                  </>
                ) : savings < 0 ? (
                  // Spending exceeds income
                  <>
                    <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, marginBottom: 4 }}>
                      Spending exceeds income by
                    </Text>
                    <Text style={{ fontSize: displaySize.xl, fontWeight: '800', color: colors.danger }}>
                      {formatUsdInt(Math.abs(savings))}
                    </Text>
                    <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, marginTop: 8 }}>
                      That's <Text style={{ fontWeight: '600', color: colors.danger }}>{Math.abs(savingsRate)}%</Text> of income
                    </Text>
                  </>
                ) : (
                  // Broke even (savings = 0)
                  <>
                    <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, marginBottom: 4 }}>
                      Breaking even
                    </Text>
                    <Text style={{ fontSize: displaySize.md, fontWeight: '700', color: colors.textMuted, marginTop: 8 }}>
                      {formatUsdInt(0)}
                    </Text>
                    <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, marginTop: 4 }}>
                      net
                    </Text>
                  </>
                )
              ) : (
                // No income
                <>
                  <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, marginBottom: 4 }}>
                    Net
                  </Text>
                  <Text style={{ fontSize: displaySize.sm, fontWeight: '700', color: colors.textMuted, marginTop: 8 }}>
                    No income recorded
                  </Text>
                  {savings < 0 && (
                    <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, marginTop: 8 }}>
                      <Text style={{ fontSize: fontSize.lg, fontWeight: '700', color: colors.danger }}>{formatUsdInt(Math.abs(savings))}</Text> spent
                    </Text>
                  )}
                </>
              )}
            </View>
          </>
        )}

        {/* Income / Expense row */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View
            style={{
              flex: 1,                                               
              backgroundColor: 'transparent',                        
              borderWidth: 1,                                        
              borderColor: colors.border, // or colors.surfaceAlt    
              borderRadius: radius.lg,
              padding: 16,
              alignItems: 'center'
            }}
          >
            <Text
              style={{
                fontSize: fontSize.xs,
                fontWeight: '600',
                color: colors.text,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 4
              }}
            >
              Income
            </Text>
            <Text style={{ fontSize: fontSize.xl, fontWeight: '800', color: colors.success }}>
              {formatUsdInt(totalIncome)}
            </Text>
          </View>
          <View
            style={{
              flex: 1,                                             
              backgroundColor: 'transparent',                        
              borderWidth: 1,                                        
              borderColor: colors.border, // or colors.surfaceAlt    
              borderRadius: radius.lg,
              padding: 16,
              alignItems: 'center'
            }}
          >
            <Text
              style={{
                fontSize: fontSize.xs,
                fontWeight: '600',
                color: colors.text,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 4
              }}
            >
              Expense
            </Text>
            <Text style={{ fontSize: fontSize.xl, fontWeight: '800', color: colors.danger }}>
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
            accentColor={ACCENT_COLORS.green}
            rightText={formatUsdInt(budgetData.budgetDollar)}
            rightColor={colors.text}
            colors={colors}
          />
          {/* Progress row: spent | bar | left */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {/* Spent amount */}
            <View>
              <Text style={{ fontSize: fontSize.lg, fontWeight: '700', color: colors.text }}>
                {formatUsdInt(budgetData.spentDollar)}
              </Text>
              <Text style={{ fontSize: fontSize.xs, fontWeight: '500', color: colors.textMuted, marginTop: 2 }}>
                spent
              </Text>
            </View>
            {/* Progress bar */}
            <View
              style={{
                flex: 1,
                height: 8,
                backgroundColor: colors.surfaceAlt,
                borderRadius: radius.sm,
                overflow: 'hidden'
              }}
            >
              <View
                style={{
                  height: '100%',
                  width: `${budgetBarWidth}%`,
                  backgroundColor: budgetData.remainingDollar >= 0 ? colors.success : colors.danger,
                  borderRadius: radius.sm
                }}
              />
            </View>
            {/* Remaining amount */}
            <View style={{ alignItems: 'flex-end' }}>
              <Text
                style={{
                  fontSize: fontSize.lg,
                  fontWeight: '700',
                  color: budgetData.remainingDollar >= 0 ? colors.success : colors.danger
                }}
              >
                {formatUsdInt(Math.abs(budgetData.remainingDollar))}
              </Text>
              <Text style={{ fontSize: fontSize.xs, fontWeight: '500', color: colors.textMuted, marginTop: 2 }}>
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
          accentColor={ACCENT_COLORS.blue}
          colors={colors}
        />
        {error && <Text style={{ color: colors.danger }}>{error}</Text>}
        {!error && (
          <>
            {/* Summary stats above calendar with dot indicators */}
            {(zeroSpendDays > 0 || lowSpendDays > 0) && (
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginBottom: 8 }}>
                {lowSpendDays > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    {/* Single dot for low-spend */}
                    <View
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: radius.full,
                        backgroundColor: colors.highlight
                      }}
                    />
                    <Text style={{ fontSize: fontSize.xs, color: colors.textMuted }}>
                      {lowSpendDays} low-spend
                    </Text>
                  </View>
                )}
                {zeroSpendDays > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    {/* Concentric circles for zero-spend (more special) */}
                    <View
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: radius.full,
                        borderWidth: 1.5,
                        borderColor: colors.highlight,
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <View
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: radius.full,
                          backgroundColor: colors.highlight
                        }}
                      />
                    </View>
                    <Text style={{ fontSize: fontSize.xs, color: colors.textMuted }}>
                      {zeroSpendDays} zero-spend
                    </Text>
                  </View>
                )}
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
          accentColor={ACCENT_COLORS.red}
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
            accentColor={ACCENT_COLORS.green}
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
