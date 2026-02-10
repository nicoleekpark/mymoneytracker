import React from 'react'
import { View, Text } from 'react-native'

import type { InsightsColors } from '../insights.types'

type CategoryDelta = {
  name: string
  thisMonth: number
  lastMonth: number
}

type Props = {
  data: CategoryDelta[]
  colors: InsightsColors
}

/**
 * Simple delta bars showing this month vs last month for top categories
 * - Shows only top 3 categories with biggest changes
 * - Minimal, supportive visual
 */
export function CategoryDeltaBar({ data, colors }: Props) {
  if (data.length === 0) return null

  // Get max value for scaling
  const maxValue = Math.max(...data.flatMap(d => [d.thisMonth, d.lastMonth]), 1)

  return (
    <View style={{ gap: 12 }}>
      {data.slice(0, 3).map((cat, i) => {
        const thisWidth = (cat.thisMonth / maxValue) * 100
        const lastWidth = (cat.lastMonth / maxValue) * 100
        const change = cat.thisMonth - cat.lastMonth
        const changePercent = cat.lastMonth > 0
          ? Math.round((change / cat.lastMonth) * 100)
          : 0

        return (
          <View key={i} style={{ gap: 4 }}>
            {/* Category name and change */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>
                {cat.name}
              </Text>
              {changePercent !== 0 && (
                <Text style={{ fontSize: 11, color: colors.textMuted }}>
                  {changePercent > 0 ? '+' : ''}{changePercent}%
                </Text>
              )}
            </View>

            {/* Stacked bars */}
            <View style={{ gap: 3 }}>
              {/* This month */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 9, color: colors.textMuted, width: 50 }}>This mo</Text>
                <View style={{ flex: 1, height: 6, backgroundColor: colors.border, borderRadius: 3 }}>
                  <View
                    style={{
                      width: `${thisWidth}%`,
                      height: '100%',
                      backgroundColor: colors.primary,
                      borderRadius: 3,
                      opacity: 0.8
                    }}
                  />
                </View>
              </View>

              {/* Last month */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 9, color: colors.textMuted, width: 50 }}>Last mo</Text>
                <View style={{ flex: 1, height: 6, backgroundColor: colors.border, borderRadius: 3 }}>
                  <View
                    style={{
                      width: `${lastWidth}%`,
                      height: '100%',
                      backgroundColor: colors.textMuted,
                      borderRadius: 3,
                      opacity: 0.4
                    }}
                  />
                </View>
              </View>
            </View>
          </View>
        )
      })}
    </View>
  )
}
