import { useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'

import { MonthlySpendingCalendar, type CalendarColors } from './calendar/MonthlySpendingCalendar'
import { useMonthlyDailyFlow } from './calendar/useMonthlyDailyFlow'
import { MonthlyCategorySection } from './category/MonthlyCategorySection'

function buildMonthTitle(monthYYYYMM: string) {
  const [y, m] = monthYYYYMM.split('-')
  const month = Number(m)
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${names[Math.max(0, Math.min(11, month - 1))]} ${y}`
}

const TRANSACTIONS_ROUTE = '/transactions'

export function MonthlyBody(props: { monthYYYYMM: string; colors: CalendarColors }) {
  const { monthYYYYMM, colors } = props
  const router = useRouter()

  // default: expense only ON, income OFF
  const [showExpense, setShowExpense] = useState(true)
  const [showIncome, setShowIncome] = useState(false)

  const { loading, error, daily } = useMonthlyDailyFlow(monthYYYYMM)

  const title = useMemo(() => buildMonthTitle(monthYYYYMM), [monthYYYYMM])

  function onPressDay(ymd: string) {
    router.push({
      pathname: TRANSACTIONS_ROUTE as any,
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
    <ScrollView contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
      <View style={{ gap: 20 }}>
        {/* Title – centered */}
        <View style={{ alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 17,
              fontWeight: '800',
              color: colors.text,
              letterSpacing: 0.2
            }}
          >
            Daily Cash Flow
          </Text>
        </View>

        {/* Sub row: month (left) + toggles (right) */}
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
          <View style={{ flexDirection: 'row', gap: 8 }}>
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
      </View>

      {loading ? <Text style={{ color: colors.text, opacity: 0.7 }}>Loading</Text> : null}
      {error ? <Text style={{ color: colors.text, opacity: 0.7 }}>{error}</Text> : null}
      <View style={{ height: 20 }} />
      <MonthlySpendingCalendar
        monthYYYYMM={monthYYYYMM}
        daily={daily}
        showExpense={showExpense}
        showIncome={showIncome}
        colors={colors}
        onPressDay={onPressDay}
      />

      <View style={{ height: 14 }} />
      <View style={{ height: 1, backgroundColor: colors.border, opacity: 0.6 }} />
      <View style={{ height: 14 }} />

      <MonthlyCategorySection
        monthYYYYMM={monthYYYYMM}
        colors={colors}
      />

    </ScrollView>
  )
}
