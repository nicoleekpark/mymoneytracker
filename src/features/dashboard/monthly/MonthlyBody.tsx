import { Divider, Header, Stack } from '@/shared/components'
import { useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { BudgetSummaryCard, useBudgetSummary } from './budget'
import { MonthlySpendingCalendar, type CalendarColors } from './calendar'
import { useMonthlyDailyFlow } from './calendar/useMonthlyDailyFlow'
import { MonthlyCategorySection } from './category'
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

  return (
    <View style={{ flex: 1 }}>
      {/* Budget Summary Card - Sticky at top */}
      {budgetData && (
        <View style={{ paddingBottom: 16 }}>
          <BudgetSummaryCard data={budgetData} colors={colors} />
        </View>
      )}

      <Divider />

      {/* Scrollable content */}
      <Stack gap="xl" scroll style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 16 }}>
        {/* Daily Cash Flow */}
      <Stack gap="lg">
        <Header variant="section" align="center">Daily Cash Flow</Header>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Month label */}
          <Text
            style={{
              fontSize: 14,
              fontWeight: '700',
              color: colors.text
            }}
          >
            {title} {/* e.g. Jan 2026 */}
          </Text>

          {/* Toggles */}
          <View style={{ flexDirection: 'row', gap: 8 }}>{/* Keep inline - horizontal */}
            <Pressable
              onPress={toggleExpense}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: showExpense ? colors.danger : colors.border,
                backgroundColor: showExpense ? colors.surfaceAlt : colors.surface
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: showExpense }}
            >
              <Text
                style={{
                  color: showExpense ? colors.danger : colors.text,
                  fontSize: 12,
                  fontWeight: '800'
                }}
              >
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
                backgroundColor: showIncome ? colors.surfaceAlt : colors.surface
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: showIncome }}
            >
              <Text
                style={{
                  color: showIncome ? colors.success : colors.text,
                  fontSize: 12,
                  fontWeight: '800'
                }}
              >
                Income
              </Text>
            </Pressable>

          </View>
        </View>
      </Stack>

      {loading ? <Text style={{ color: colors.text, opacity: 0.7 }}>Loading</Text> : null}
      {error ? <Text style={{ color: colors.text, opacity: 0.7 }}>{error}</Text> : null}

      <MonthlySpendingCalendar
        monthYYYYMM={monthYYYYMM}
        daily={daily}
        showExpense={showExpense}
        showIncome={showIncome}
        colors={colors}
        onPressDay={onPressDay}
      />

      <Divider />

      {/* Monthly Spending by Category */}
      <MonthlyCategorySection
        monthYYYYMM={monthYYYYMM}
        colors={colors}
      />

      </Stack>
    </View>
  )
}
