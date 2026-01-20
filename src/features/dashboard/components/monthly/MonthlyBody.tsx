import { useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'

import { MonthlySpendingCalendar, type CalendarColors } from './MonthlySpendingCalendar'
import { useMonthlyDailyFlow } from './useMonthlyDailyFlow'

function buildMonthTitle(monthYYYYMM: string) {
  // e.g. 2026-01 -> Jan 2026
  const [y, m] = monthYYYYMM.split('-')
  const month = Number(m)
  const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${names[Math.max(0, Math.min(11, month - 1))]} ${y}`
}

const TRANSACTIONS_ROUTE = '/transactions' // 확실하지 않음: 너 프로젝트 route에 맞게 한 줄만 수정

export function MonthlyBody(props: {
  monthYYYYMM: string
  colors: CalendarColors
}) {
  const { monthYYYYMM, colors } = props
  const router = useRouter()

  const [showExpense, setShowExpense] = useState(true)
  const [showIncome, setShowIncome] = useState(false)

  const { loading, error, daily } = useMonthlyDailyFlow(monthYYYYMM)

  const title = useMemo(() => buildMonthTitle(monthYYYYMM), [monthYYYYMM])

  function onPressDay(ymd: string) {
    // Transactions 탭으로 이동 + focusDate 전달
    router.push({
      pathname: TRANSACTIONS_ROUTE as any,
      params: { focusDate: ymd }
    })
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ gap: 2 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>{title}</Text>
            <Text style={{ fontSize: 12, opacity: 0.75, color: colors.text }}>Daily totals</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={() => setShowExpense((v) => !v)}
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
              <Text style={{ color: showExpense ? colors.danger : colors.text, fontSize: 12, fontWeight: '800' }}>
                Expense
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setShowIncome((v) => !v)}
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
              <Text style={{ color: showIncome ? colors.success : colors.text, fontSize: 12, fontWeight: '800' }}>
                Income
              </Text>
            </Pressable>
          </View>
        </View>

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
      </View>
    </ScrollView>
  )
}
