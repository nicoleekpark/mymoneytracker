import React, { useMemo } from 'react'
import { Pressable, Text, View } from 'react-native'
import { daysInMonth, firstWeekdayIndex, formatExpenseInt, formatIncomeInt, parseYYYYMM } from './monthly.utils'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const

export type DailyFlow = Readonly<{
  day: string // YYYY-MM-DD
  incomeDollar: number
  expenseDollar: number
}>

export type CalendarColors = Readonly<{
  text: string
  border: string
  surface: string
  surfaceAlt: string
  primary: string
  success: string
  danger: string
}>

export function MonthlySpendingCalendar(props: {
  monthYYYYMM: string
  daily: DailyFlow[]
  showIncome: boolean
  showExpense: boolean
  colors: CalendarColors
  onPressDay?: (ymd: string) => void
}) {
  const { monthYYYYMM, daily, showIncome, showExpense, colors, onPressDay } = props
  const { year, month } = parseYYYYMM(monthYYYYMM)

  const map = useMemo(() => {
    const m = new Map<string, { income: number; expense: number }>()
    for (const r of daily) m.set(r.day, { income: r.incomeDollar, expense: r.expenseDollar })
    return m
  }, [daily])

  const { first, dim } = useMemo(() => {
    return { first: firstWeekdayIndex(year, month), dim: daysInMonth(year, month) }
  }, [year, month])

  const todayYMD = useMemo(() => new Date().toISOString().slice(0, 10), [])

  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row' }}>
        {WEEKDAYS.map((w, i) => (
          <View key={`wd-${i}-${w}`} style={{ width: `${100 / 7}%`, paddingVertical: 6 }}>
            <Text style={{ textAlign: 'center', fontSize: 12, opacity: 0.75, color: colors.text }}>
              {w}
            </Text>
          </View>
        ))}
      </View>

      {/* Grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {/* Leading blanks */}
        {Array.from({ length: first }).map((_, i) => (
          <View
            key={`pad-${i}`}
            style={{
              width: `${100 / 7}%`,
              aspectRatio: 1,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface
            }}
          />
        ))}

        {/* Days */}
        {Array.from({ length: dim }).map((_, i) => {
          const dayNum = i + 1
          const dd = String(dayNum).padStart(2, '0')
          const ymd = `${monthYYYYMM}-${dd}`

          const v = map.get(ymd) ?? { income: 0, expense: 0 }
          const showIncLine = showIncome && v.income > 0
          const showExpLine = showExpense && v.expense > 0
          const hasAny = showIncLine || showExpLine

          const isToday = ymd === todayYMD

          return (
            <View key={ymd} style={{ width: `${100 / 7}%` }}>
              <Pressable
                onPress={() => onPressDay?.(ymd)}
                style={{
                  aspectRatio: 1,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: hasAny ? colors.surfaceAlt : colors.surface,
                  padding: 6
                }}
                accessibilityRole="button"
                accessibilityLabel={`Date ${ymd}`}
              >
                {/* header: today dot + day number on right */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ width: 16, height: 16, alignItems: 'center', justifyContent: 'center' }}>
                    {isToday ? (
                      <View
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: 7,
                          backgroundColor: colors.primary
                        }}
                      />
                    ) : null}
                  </View>

                  <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>{dayNum}</Text>
                </View>

                {/* body: like “events” lines */}
                <View style={{ flex: 1, justifyContent: 'flex-end', gap: 2 }}>
                  {showIncLine ? (
                    <Text style={{ fontSize: 10, color: colors.success }} numberOfLines={1}>
                      {formatIncomeInt(v.income)}
                    </Text>
                  ) : null}

                  {showExpLine ? (
                    <Text style={{ fontSize: 10, color: colors.danger }} numberOfLines={1}>
                      {formatExpenseInt(v.expense)}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            </View>
          )
        })}
      </View>
    </View>
  )
}
