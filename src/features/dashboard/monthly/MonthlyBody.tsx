import { AccordionCard, Stack } from '@/shared/components'
import { formatUsdInt } from '@/shared/format/currency'
import { useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { BudgetSummaryCard, useBudgetSummary } from './budget'
import { MonthlySpendingCalendar, type CalendarColors } from './calendar'
import { useMonthlyDailyFlow } from './calendar/useMonthlyDailyFlow'
import { MonthlyCategoryContent } from './category'
import { useMonthlyProjection } from './projection'
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

  // default: expense only ON, income OFF
  const [showExpense, setShowExpense] = useState(true)
  const [showIncome, setShowIncome] = useState(false)

  const { loading, error, daily } = useMonthlyDailyFlow(monthYYYYMM)
  const { data: budgetData } = useBudgetSummary(monthYYYYMM)
  const { data: projectionData } = useMonthlyProjection(monthYYYYMM)

  const title = useMemo(() => buildMonthTitle(monthYYYYMM), [monthYYYYMM])

  function onPressDay(ymd: string) {
    router.push({
      pathname: TRANSACTIONS_ROUTE,
      params: { focusDate: ymd }
    })
  }

  // guard: 최소 1개는 켜져있게 (둘 다 꺼지는 UX 방지)
  function toggleExpense() {
    setShowExpense((v) => {
      const next = !v
      if (!next && !showIncome) return true
      return next
    })
  }

  function toggleIncome() {
    setShowIncome((v) => {
      const next = !v
      if (!next && !showExpense) return true
      return next
    })
  }

  const accordionColors = {
    text: colors.text,
    textSecondary: colors.textMuted,
    surface: colors.surface,
    surfaceAlt: colors.surfaceAlt,
    border: colors.border,
  }

  // Calculate totals for summary
  const totalExpense = projectionData.currentExpense || 0
  const totalIncome = projectionData.currentIncome || 0
  const savings = totalIncome - totalExpense
  const projectedSavings = projectionData.projectedSavings || savings

  return (
    <Stack gap="xl" scroll>
      {/* Overview Card - Always visible summary */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 20,
          gap: 16,
        }}
      >
        {/* Header */}
        <View style={{ alignItems: 'center', gap: 2 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text, letterSpacing: 0.2 }}>
            {title}
          </Text>
          {projectionData.daysElapsed > 0 && (
            <Text style={{ fontSize: 11, fontWeight: '500', color: colors.textMuted }}>
              Day {projectionData.daysElapsed} of {projectionData.daysInMonth}
            </Text>
          )}
        </View>

        {/* Key metrics row */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: 10, padding: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 9, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              Income
            </Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.success }}>
              {formatUsdInt(totalIncome)}
            </Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: 10, padding: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 9, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              Expense
            </Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.danger }}>
              {formatUsdInt(totalExpense)}
            </Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: 10, padding: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 9, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              Savings
            </Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: savings >= 0 ? colors.success : colors.text }}>
              {savings >= 0 ? '+' : ''}{formatUsdInt(savings)}
            </Text>
          </View>
        </View>
      </View>

      {/* Budget Progress - Accordion */}
      {budgetData && (
        <AccordionCard
          title="Budget Progress"
          colors={accordionColors}
          defaultExpanded={false}
          summary={
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 2, backgroundColor: colors.surfaceAlt, borderRadius: 10, padding: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>
                    {Math.round((budgetData.spentDollar / budgetData.budgetDollar) * 100)}% used
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.success, fontWeight: '600' }}>
                    {formatUsdInt(budgetData.remainingDollar)} left
                  </Text>
                </View>
                <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' }}>
                  <View
                    style={{
                      height: '100%',
                      width: `${Math.min((budgetData.spentDollar / budgetData.budgetDollar) * 100, 100)}%`,
                      backgroundColor: budgetData.remainingDollar >= 0 ? colors.success : colors.danger,
                      borderRadius: 3,
                    }}
                  />
                </View>
              </View>
              <View style={{ flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: 10, padding: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 9, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', marginBottom: 4 }}>
                  Budget
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text }}>
                  {formatUsdInt(budgetData.budgetDollar)}
                </Text>
              </View>
            </View>
          }
        >
          <BudgetSummaryCard data={budgetData} colors={colors} embedded />
        </AccordionCard>
      )}

      {/* Projection - Accordion */}
      {projectionData.daysElapsed > 0 && (
        <AccordionCard
          title="Projection"
          colors={accordionColors}
          defaultExpanded={false}
          summary={
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: 10, padding: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 9, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', marginBottom: 4 }}>
                  Month-end Savings
                </Text>
                <Text style={{ fontSize: 18, fontWeight: '800', color: projectedSavings >= 0 ? colors.success : colors.text }}>
                  {projectedSavings >= 0 ? '+' : ''}{formatUsdInt(projectedSavings)}
                </Text>
              </View>
              <View style={{ flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: 10, padding: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 9, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', marginBottom: 4 }}>
                  Savings Rate
                </Text>
                <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>
                  {projectionData.projectedSavingsRate}%
                </Text>
              </View>
            </View>
          }
        >
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
              <Text style={{ fontSize: 13, color: colors.textMuted }}>Projected Expense</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                {formatUsdInt(projectionData.projectedExpense)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
              <Text style={{ fontSize: 13, color: colors.textMuted }}>Projected Income</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                {formatUsdInt(projectionData.projectedIncome)}
              </Text>
            </View>
            <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }}>
              <Text style={{ fontSize: 11, color: colors.textMuted, lineHeight: 16 }}>
                Based on daily average: {formatUsdInt(Math.round(totalExpense / projectionData.daysElapsed))}/day expense
              </Text>
            </View>
          </View>
        </AccordionCard>
      )}

      {/* Daily Cash Flow - Accordion */}
      <AccordionCard
        title="Daily Cash Flow"
        colors={accordionColors}
        defaultExpanded={false}
        summary={
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: 10, padding: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 9, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', marginBottom: 4 }}>
                Days with Activity
              </Text>
              <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>
                {daily.filter(d => d.txCount > 0).length} days
              </Text>
            </View>
            <View style={{ flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: 10, padding: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 9, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', marginBottom: 4 }}>
                Transactions
              </Text>
              <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>
                {daily.reduce((sum, d) => sum + d.txCount, 0)}
              </Text>
            </View>
          </View>
        }
      >
        <View style={{ gap: 12 }}>
          {/* Filter toggles */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.5 }}>
              {title.toUpperCase()}
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable
                onPress={toggleExpense}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: showExpense ? colors.danger : colors.border,
                  backgroundColor: showExpense ? colors.surface : 'transparent'
                }}
              >
                <Text style={{ color: showExpense ? colors.danger : colors.textMuted, fontSize: 11, fontWeight: '700' }}>
                  Expense
                </Text>
              </Pressable>
              <Pressable
                onPress={toggleIncome}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: showIncome ? colors.success : colors.border,
                  backgroundColor: showIncome ? colors.surface : 'transparent'
                }}
              >
                <Text style={{ color: showIncome ? colors.success : colors.textMuted, fontSize: 11, fontWeight: '700' }}>
                  Income
                </Text>
              </Pressable>
            </View>
          </View>

          {loading && <Text style={{ color: colors.text, opacity: 0.7 }}>Loading...</Text>}
          {error && <Text style={{ color: colors.danger }}>{error}</Text>}

          {!loading && !error && (
            <MonthlySpendingCalendar
              monthYYYYMM={monthYYYYMM}
              daily={daily}
              showExpense={showExpense}
              showIncome={showIncome}
              colors={colors}
              onPressDay={onPressDay}
            />
          )}
        </View>
      </AccordionCard>

      {/* Spending by Category - Accordion */}
      <MonthlyCategoryContent
        monthYYYYMM={monthYYYYMM}
        colors={colors}
        accordionColors={accordionColors}
      />
    </Stack>
  )
}
