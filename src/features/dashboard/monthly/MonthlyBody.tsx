import { Stack } from '@/shared/components'
import { formatUsdInt } from '@/shared/format/currency'
import { CARD_SHADOW } from '@/theme/tokens'
import { useRouter } from 'expo-router'
import React, { useMemo } from 'react'
import { Text, View } from 'react-native'

import { useBudgetSummary } from './budget'
import { MonthlyCalendar, type CalendarColors, type DailyFlow } from './calendar'
import { useMonthlyDailyFlow } from './calendar/useMonthlyDailyFlow'
import { MonthlyCategoryContent } from './category'
import { useMonthlyProjection } from './projection'
import { useMonthlySummary } from './useMonthlySummary'
import { getMonthNameShort } from '../types/dashboard.types'

function buildMonthTitle(monthYYYYMM: string) {
  const [y, m] = monthYYYYMM.split('-')
  const month = Number(m)
  return `${getMonthNameShort(month)} ${y}`
}

const TRANSACTIONS_ROUTE = '/transactions' as const

export function MonthlyBody(props: { monthYYYYMM: string; colors: CalendarColors }) {
  const { monthYYYYMM, colors } = props
  const router = useRouter()

  const { loading, error, daily } = useMonthlyDailyFlow(monthYYYYMM)
  const { data: budgetData } = useBudgetSummary(monthYYYYMM)
  const { data: projectionData } = useMonthlyProjection(monthYYYYMM)
  const { data: summaryData } = useMonthlySummary(monthYYYYMM)

  const title = useMemo(() => buildMonthTitle(monthYYYYMM), [monthYYYYMM])

  function onPressDay(ymd: string) {
    router.push({
      pathname: TRANSACTIONS_ROUTE,
      params: { focusDate: ymd }
    })
  }

  const accordionColors = {
    text: colors.text,
    textSecondary: colors.textMuted,
    surface: colors.surface,
    surfaceAlt: colors.surfaceAlt,
    border: colors.border
  }

  // Calculate totals from summary data (works for all months)
  const totalExpense = summaryData.expenseTotalDollar
  const totalIncome = summaryData.incomeTotalDollar
  const savings = summaryData.netCashFlowDollar
  const projectedSavings = projectionData.projectedSavings || savings

  // Savings rate calculation
  const savingsRate = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0

  // Budget calculations
  const budgetBarWidth = budgetData
    ? Math.min((budgetData.spentDollar / budgetData.budgetDollar) * 100, 100)
    : 0

  return (
    <Stack gap="lg" scroll>
      {/* Card 1: Overview - Hero savings rate */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 20,
          ...CARD_SHADOW
        }}
      >
        {/* Month header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text, letterSpacing: 0.2 }}>
            {title}
          </Text>
          {projectionData.daysElapsed > 0 && (
            <Text style={{ fontSize: 12, fontWeight: '500', color: colors.textMuted }}>
              Day {projectionData.daysElapsed} of {projectionData.daysInMonth}
            </Text>
          )}
        </View>

        {/* Hero savings rate */}
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <Text style={{ fontSize: 48, fontWeight: '800', color: savingsRate >= 0 ? colors.success : colors.danger }}>
            {savingsRate}%
          </Text>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
            savings rate
          </Text>
          <Text style={{ fontSize: 15, fontWeight: '700', color: savingsRate >= 0 ? colors.success : colors.danger, marginTop: 8 }}>
            {savings >= 0 ? '+' : ''}{formatUsdInt(savings)} saved
          </Text>
        </View>

        {/* Income / Expense row */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: colors.surfaceAlt,
              borderRadius: 12,
              padding: 16,
              alignItems: 'center'
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: '600',
                color: colors.textMuted,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 4
              }}
            >
              Income
            </Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.success }}>
              {formatUsdInt(totalIncome)}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: colors.surfaceAlt,
              borderRadius: 12,
              padding: 16,
              alignItems: 'center'
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: '600',
                color: colors.textMuted,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 4
              }}
            >
              Expense
            </Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.danger }}>
              {formatUsdInt(totalExpense)}
            </Text>
          </View>
        </View>
      </View>

      {/* Card 2: Budget + Projection */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 20,
          gap: 16,
          ...CARD_SHADOW
        }}
      >
        {/* Budget section */}
        {budgetData && (
          <View>
            <View
              style={{
                height: 10,
                backgroundColor: colors.surfaceAlt,
                borderRadius: 5,
                overflow: 'hidden'
              }}
            >
              <View
                style={{
                  height: '100%',
                  width: `${budgetBarWidth}%`,
                  backgroundColor: budgetData.remainingDollar >= 0 ? colors.success : colors.danger,
                  borderRadius: 5
                }}
              />
            </View>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}
            >
              <Text style={{ fontSize: 12, color: colors.textMuted }}>
                Budget: {formatUsdInt(budgetData.spentDollar)} / {formatUsdInt(budgetData.budgetDollar)}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: budgetData.remainingDollar >= 0 ? colors.success : colors.danger
                }}
              >
                {formatUsdInt(Math.abs(budgetData.remainingDollar))}{' '}
                {budgetData.remainingDollar >= 0 ? 'left' : 'over'}
              </Text>
            </View>
          </View>
        )}

        {/* Divider */}
        {budgetData && projectionData.daysElapsed > 0 && (
          <View style={{ height: 1, backgroundColor: colors.border, opacity: 0.5 }} />
        )}

        {/* Projection section */}
        {projectionData.daysElapsed > 0 && (
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: colors.textMuted }}>Projected month-end</Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '700',
                  color: projectedSavings >= 0 ? colors.success : colors.danger
                }}
              >
                {projectedSavings >= 0 ? '+' : ''}
                {formatUsdInt(projectedSavings)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: colors.textMuted }}>Projected savings rate</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>
                {projectionData.projectedSavingsRate}%
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Card 3: Daily Cash Flow - Seamless expandable calendar */}
      <DailyCashFlowCard
        monthYYYYMM={monthYYYYMM}
        daily={daily}
        colors={colors}
        loading={loading}
        error={error}
        onPressDay={onPressDay}
      />

      {/* Card 4: Spending by Category - Accordion */}
      <MonthlyCategoryContent monthYYYYMM={monthYYYYMM} colors={colors} accordionColors={accordionColors} />
    </Stack>
  )
}

/**
 * Daily Cash Flow calendar card
 * Always shows amounts - tap a day to see transaction details
 */
function DailyCashFlowCard({
  monthYYYYMM,
  daily,
  colors,
  loading,
  error,
  onPressDay
}: {
  monthYYYYMM: string
  daily: DailyFlow[]
  colors: CalendarColors
  loading: boolean
  error: string | null
  onPressDay: (ymd: string) => void
}) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        gap: 14,
        ...CARD_SHADOW
      }}
    >
      {/* Header */}
      <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text, letterSpacing: 0.2 }}>
        Daily Cash Flow
      </Text>

      {/* Calendar content */}
      {loading && <Text style={{ color: colors.text, opacity: 0.7 }}>Loading...</Text>}
      {error && <Text style={{ color: colors.danger }}>{error}</Text>}

      {!loading && !error && (
        <MonthlyCalendar
          monthYYYYMM={monthYYYYMM}
          daily={daily}
          colors={colors}
          onPressDay={onPressDay}
        />
      )}
    </View>
  )
}
