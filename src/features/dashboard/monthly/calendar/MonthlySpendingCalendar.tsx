import { formatCompactUsd } from '@/shared/format/currency'
import React, { useMemo } from 'react'
import { Pressable, Text, View } from 'react-native'

import { daysInMonth, firstWeekdayIndex, parseYYYYMM } from '../monthly.utils'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const

export type DailyFlow = Readonly<{
  day: string // YYYY-MM-DD
  incomeDollar: number
  expenseDollar: number
  txCount: number
}>

export type CalendarColors = Readonly<{
  text: string
  textMuted: string
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
  const { monthYYYYMM, daily, onPressDay, colors, showIncome, showExpense } = props
  const { year, month } = parseYYYYMM(monthYYYYMM)

  const map = useMemo(() => {
    const m = new Map<string, { income: number; expense: number; count: number }>()
    for (const r of daily) m.set(r.day, { income: r.incomeDollar, expense: r.expenseDollar, count: r.txCount })
    return m
  }, [daily])

  const { first, dim } = useMemo(() => {
    return { first: firstWeekdayIndex(year, month), dim: daysInMonth(year, month) }
  }, [year, month])

  const todayYMD = useMemo(() => new Date().toISOString().slice(0, 10), [])

  function hasAmount(n: number) {
    return Math.round(Math.abs(n)) > 0
  }

  // Google-calendar-ish sizing
  const CELL_H = 64
  const GRID_BORDER = colors.border
  const TEXT = colors.text

  return (
    <View style={{ gap: 8 }}>
      {/* Weekday header */}
      <View
        style={{
          flexDirection: 'row',
          borderTopWidth: 1,
          borderLeftWidth: 1,
          borderColor: GRID_BORDER,
          backgroundColor: colors.surface
        }}
      >
        {WEEKDAYS.map((w, i) => (
          <View
            key={`wd-${i}`}
            style={{
              width: `${100 / 7}%`,
              paddingVertical: 8,
              borderRightWidth: 1,
              borderBottomWidth: 1,
              borderColor: GRID_BORDER,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', opacity: 0.7, color: TEXT }}>{w}</Text>
          </View>
        ))}
      </View>

      {/* Grid */}
      <View style={{ borderLeftWidth: 1, borderColor: GRID_BORDER }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {/* leading blanks */}
          {Array.from({ length: first }).map((_, i) => (
            <View
              key={`pad-${i}`}
              style={{
                width: `${100 / 7}%`,
                height: CELL_H,
                borderRightWidth: 1,
                borderBottomWidth: 1,
                borderColor: GRID_BORDER,
                backgroundColor: colors.surface
              }}
            />
          ))}

          {Array.from({ length: dim }).map((_, i) => {
            const dayNum = i + 1
            const dd = String(dayNum).padStart(2, '0')
            const ymd = `${monthYYYYMM}-${dd}`

            const v = map.get(ymd) ?? { income: 0, expense: 0, count: 0 }
            const isToday = ymd === todayYMD

            // show only what user toggled
            const showExpenseAmt = showExpense && hasAmount(v.expense)
            const showIncomeAmt = showIncome && hasAmount(v.income)
            const hasAnyAmount = showExpenseAmt || showIncomeAmt

            return (
              <View
                key={ymd}
                style={{
                  width: `${100 / 7}%`,
                  height: CELL_H,
                  borderRightWidth: 1,
                  borderBottomWidth: 1,
                  borderColor: GRID_BORDER,
                  backgroundColor: colors.surface
                }}
              >
                <Pressable
                  onPress={() => onPressDay?.(ymd)}
                  style={{
                    flex: 1,
                    paddingHorizontal: 6,
                    paddingTop: 6,
                    paddingBottom: 6
                  }}
                >
                  {/* top row: day number + count */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 999,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isToday ? colors.primary : 'transparent'
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '800',
                          color: isToday ? '#fff' : TEXT
                        }}
                      >
                        {dayNum}
                      </Text>
                    </View>

                    {v.count > 0 ? (
                      <View
                        style={{
                          minWidth: 18,
                          height: 18,
                          paddingHorizontal: 6,
                          borderRadius: 999,
                          backgroundColor: colors.surfaceAlt,
                          borderWidth: 1,
                          borderColor: GRID_BORDER,
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '800', color: TEXT }}>{v.count}</Text>
                      </View>
                    ) : (
                      <View style={{ width: 18, height: 18 }} />
                    )}
                  </View>

                  {/* Compact stacked: income above, expense below, right-aligned */}
                  {hasAnyAmount ? (
                    <View
                      style={{
                        marginTop: 2,
                        alignItems: 'flex-end'
                      }}
                    >
                      {showIncomeAmt ? (
                        <Text
                          style={{ fontSize: 10, fontWeight: '800', color: colors.success }}
                          numberOfLines={1}
                        >
                          +{formatCompactUsd(v.income)}
                        </Text>
                      ) : null}
                      {showExpenseAmt ? (
                        <Text
                          style={{ fontSize: 10, fontWeight: '800', color: colors.danger }}
                          numberOfLines={1}
                        >
                          -{formatCompactUsd(v.expense)}
                        </Text>
                      ) : null}
                    </View>
                  ) : null}
                </Pressable>
              </View>
            )
          })}
        </View>
      </View>
    </View>
  )
}
