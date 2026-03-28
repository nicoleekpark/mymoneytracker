import React, { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import { radius } from '@/shared/theme/tokens/radius'

import type { InsightsColors } from '../insights.types'

type WeekdayData = {
  day: number // 0 = Sun, 1 = Mon, ..., 6 = Sat
  avgSpend: number
}

type Props = {
  data: WeekdayData[]
  colors: InsightsColors
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

/**
 * Mini heatmap showing spending intensity by day of week
 * - Very light colors
 * - Tap to show average amount
 */
export function WeekdayHeatHint({ data, colors }: Props) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  if (data.length === 0) return null

  const maxSpend = Math.max(...data.map(d => d.avgSpend), 1)

  // Get spend for each day (0-6)
  const spendByDay = new Map(data.map(d => [d.day, d.avgSpend]))

  // Format amount
  const formatAmount = (val: number) => {
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`
    return `$${Math.round(val)}`
  }

  const selectedSpend = selectedDay !== null ? (spendByDay.get(selectedDay) || 0) : null

  return (
    <View style={{ alignItems: 'center' }}>
      {/* Selected day display */}
      <View style={{ height: 20, marginBottom: 8, justifyContent: 'center' }}>
        {selectedDay !== null && selectedSpend !== null ? (
          <Text style={{ fontSize: fontSize.xs, color: colors.text, fontWeight: fontWeight.semibold }}>
            {DAY_LABELS[selectedDay]}: {formatAmount(selectedSpend)} avg
          </Text>
        ) : (
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>
            Tap a day to see average
          </Text>
        )}
      </View>

      <View style={{ flexDirection: 'row', gap: 6 }}>
        {DAY_SHORT.map((label, dayIndex) => {
          const spend = spendByDay.get(dayIndex) || 0
          const intensity = spend / maxSpend
          // Use light opacity (0.15 to 0.6)
          const opacity = 0.15 + intensity * 0.45
          const isSelected = selectedDay === dayIndex

          return (
            <Pressable
              key={dayIndex}
              onPress={() => setSelectedDay(selectedDay === dayIndex ? null : dayIndex)}
              style={{ alignItems: 'center', gap: 4 }}
            >
              <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: fontWeight.medium }}>
                {label}
              </Text>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: radius.sm,
                  backgroundColor: colors.danger,
                  opacity,
                  borderWidth: isSelected ? 2 : 0,
                  borderColor: colors.text
                }}
              />
            </Pressable>
          )
        })}
      </View>

      {/* Subtle legend */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ width: 8, height: 8, borderRadius: radius.xs, backgroundColor: colors.danger, opacity: 0.15 }} />
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Low</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ width: 8, height: 8, borderRadius: radius.xs, backgroundColor: colors.danger, opacity: 0.6 }} />
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>High</Text>
        </View>
      </View>
    </View>
  )
}
