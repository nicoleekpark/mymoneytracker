import React, { useMemo } from 'react'
import { ScrollView, Text, View } from 'react-native'
import type { DashboardStyles } from '../../dashboard.styles'
import { MonthlySpendingCalendar } from './MonthlySpendingCalendar'

type CalendarColors = Readonly<{
  text: string
  border: string
  surface: string
  surfaceAlt: string
  primary: string
}>

export function MonthlyBody(props: {
  styles: DashboardStyles
  monthYYYYMM: string
  colors: CalendarColors
}) {
  const { styles, monthYYYYMM, colors } = props

  const daily = useMemo(() => {
    // v1 mock
    const out: Array<{ day: string; totalDollar: number }> = []
    for (let d = 1; d <= 28; d++) {
      if (d % 5 === 0) {
        const dd = String(d).padStart(2, '0')
        out.push({ day: `${monthYYYYMM}-${dd}`, totalDollar: 10 + (d % 7) * 8 })
      }
    }
    return out
  }, [monthYYYYMM])

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
      <View style={{ gap: 16 }}>
        <Text style={{ fontSize: 12, opacity: 0.6, color: colors.text }}>Monthly view</Text>

        <MonthlySpendingCalendar
          monthYYYYMM={monthYYYYMM}
          daily={daily}
          colors={colors}
          onPressDay={(ymd) => console.log('pressed day', ymd)}
        />
      </View>
    </ScrollView>
  )
}
