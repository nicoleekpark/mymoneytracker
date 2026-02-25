import React from 'react'
import { Text, View } from 'react-native'

import { fontSize, fontWeight } from '@/theme/tokens/typography'
import { spacing } from '@/theme/tokens/spacing'
import { radius } from '@/theme/tokens/radius'

import type { InsightsColors } from '../insights.types'

type CategoryDelta = {
  name: string
  thisMonth: number
  lastMonth: number
  color: string | null
}

type Props = {
  data: CategoryDelta[]
  colors: InsightsColors
}

function formatDelta(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1000) {
    return `${value >= 0 ? '+' : '-'}$${(abs / 1000).toFixed(1)}k`
  }
  return `${value >= 0 ? '+' : '-'}$${Math.round(abs)}`
}

/**
 * Horizontal progress bar chart showing top category deltas vs last month
 * Neutral styling - bars use category colors, delta text is neutral
 *
 * Layout:
 * ┌──────────────────────────────────────────┐
 * │ ● Food                            +$310  │
 * │ ████████████████████████████████████     │
 * │                                          │
 * │ ● Housing                         +$180  │
 * │ ████████████████████                     │
 * └──────────────────────────────────────────┘
 */
export function CategoryDeltaBar({ data, colors }: Props) {
  if (data.length === 0) return null

  // Take top 3 categories
  const topCategories = data.slice(0, 3)

  // Calculate deltas and find max for scaling
  const deltas = topCategories.map(cat => ({
    name: cat.name,
    delta: cat.thisMonth - cat.lastMonth,
    categoryColor: cat.color
  }))

  const maxDelta = Math.max(...deltas.map(d => Math.abs(d.delta)), 1)

  return (
    <View style={{ gap: spacing.md }}>
      {deltas.map((d, i) => {
        const widthPercent = (Math.abs(d.delta) / maxDelta) * 100

        // Use category color or fallback to neutral
        const barColor = d.categoryColor ?? colors.textMuted

        return (
          <View key={d.name + i}>
            {/* Row: dot + name + delta */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: spacing.xs
            }}>
              {/* Category dot */}
              <View style={{
                width: 10,
                height: 10,
                borderRadius: radius.full,
                backgroundColor: barColor,
                marginRight: spacing.sm
              }} />

              {/* Category name */}
              <Text style={{
                flex: 1,
                fontSize: fontSize.sm,
                fontWeight: fontWeight.semibold,
                color: colors.text
              }}>
                {d.name}
              </Text>

              {/* Delta amount - NEUTRAL */}
              <Text style={{
                fontSize: fontSize.sm,
                fontWeight: fontWeight.semibold,
                color: colors.text
              }}>
                {formatDelta(d.delta)}
              </Text>
            </View>

            {/* Progress bar track */}
            <View style={{
              height: 8,
              backgroundColor: colors.surfaceAlt,
              borderRadius: radius.sm,
              marginLeft: 18, // align with text after dot
              overflow: 'hidden'
            }}>
              {/* Progress bar fill */}
              <View style={{
                height: '100%',
                width: `${widthPercent}%`,
                backgroundColor: barColor,
                borderRadius: radius.sm,
                opacity: 0.5
              }} />
            </View>
          </View>
        )
      })}
    </View>
  )
}
