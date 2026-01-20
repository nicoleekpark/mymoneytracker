import React, { useMemo } from 'react'
import { Pressable, Text, View } from 'react-native'
import { clamp01, daysInMonth, firstWeekdayIndex, formatUsd, parseYYYYMM } from './monthly.utils'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const

export function MonthlySpendingCalendar(props: {
  monthYYYYMM: string
  daily: Array<{ day: string; totalDollar: number }>
  onPressDay?: (ymd: string) => void
  colors: {
    text: string
    border: string
    surface: string
    surfaceAlt: string
    primary: string
  }
}) {
  const { monthYYYYMM, daily, onPressDay, colors } = props
  const { year, month } = parseYYYYMM(monthYYYYMM)

  const map = useMemo(() => {
    const m = new Map<string, number>()
    for (const r of daily) m.set(r.day, r.totalDollar)
    return m
  }, [daily])

  const max = useMemo(() => {
    let mx = 0
    for (const v of map.values()) mx = Math.max(mx, v)
    return mx
  }, [map])

  const { first, dim } = useMemo(() => {
    return { first: firstWeekdayIndex(year, month), dim: daysInMonth(year, month) }
  }, [year, month])

  const todayYMD = useMemo(() => new Date().toISOString().slice(0, 10), [])

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>Spending by day</Text>
        <Text style={{ fontSize: 12, opacity: 0.75, color: colors.text }}>Tap a day</Text>
      </View>

      <View style={{ flexDirection: 'row' }}>
        {WEEKDAYS.map((w, i) => (
          <View key={`wd-${i}-${w}`} style={{ width: `${100 / 7}%`, paddingVertical: 6 }}>
            <Text style={{ textAlign: 'center', fontSize: 12, opacity: 0.75, color: colors.text }}>
              {w}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {Array.from({ length: first }).map((_, i) => (
          <View key={`pad-${i}`} style={{ width: `${100 / 7}%`, padding: 4 }}>
            <View style={{ height: 44 }} />
          </View>
        ))}

        {Array.from({ length: dim }).map((_, i) => {
          const dayNum = i + 1
          const dd = String(dayNum).padStart(2, '0')
          const ymd = `${monthYYYYMM}-${dd}`

          const value = map.get(ymd) ?? 0
          const intensity = max > 0 ? clamp01(value / max) : 0

          const bg =
            intensity > 0
              ? `rgba(255,140,0,${0.10 + intensity * 0.35})`
              : colors.surface

          const isToday = ymd === todayYMD

          return (
            <View key={ymd} style={{ width: `${100 / 7}%`, padding: 4 }}>
              <Pressable
                onPress={() => onPressDay?.(ymd)}
                style={{
                  height: 44,
                  borderRadius: 10,
                  padding: 6,
                  borderWidth: 1,
                  borderColor: isToday ? colors.primary : colors.border,
                  backgroundColor: bg,
                  justifyContent: 'space-between'
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.text }}>{dayNum}</Text>
                <Text style={{ fontSize: 10, opacity: 0.85, color: colors.text }} numberOfLines={1}>
                  {value > 0 ? formatUsd(value) : ''}
                </Text>
              </Pressable>
            </View>
          )
        })}
      </View>
    </View>
  )
}
