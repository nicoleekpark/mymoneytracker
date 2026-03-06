import React, { useCallback, useMemo, useState } from 'react'
import { LayoutChangeEvent, Pressable, Text, View } from 'react-native'
import Svg, { Rect, Line } from 'react-native-svg'

import { fontSize, fontWeight } from '@/theme/tokens/typography'
import { spacing } from '@/theme/tokens/spacing'

import type { InsightsColors, DailyOutflow } from '../insights.types'

type Props = {
  data: DailyOutflow[]
  monthYYYYMM: string // e.g., "2026-02"
  colors: InsightsColors
}

const CHART_HEIGHT = 72
const AXIS_Y = 60
const BAR_RADIUS = 2
const MIN_BAR_HEIGHT = 4
const MAX_BAR_HEIGHT = 52
const BAR_GAP = 1

// Days in top 15% of spending are considered spikes
const SPIKE_PERCENTILE = 0.85

/**
 * Daily outflow bar chart for volatility visualization
 *
 * Layout:
 * ┌─────────────────────────────────────────────────────┐
 * │ █   ▁▂▁█▂▃▁▂█▂▁▃▁▂█▂▁▂▂▁▃▂▂▁▂▂▁▁▂▂▁               │
 * │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
 * │ 1                                              28  │
 * └─────────────────────────────────────────────────────┘
 *
 * - Shows full month grid (28/30/31 slots)
 * - Bars positioned at actual day numbers
 * - Empty days have no bar (just empty slot)
 * - Spike days (top 15%) highlighted in warning/amber
 */
function formatAmount(amount: number): string {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`
  }
  return `$${Math.round(amount)}`
}

export function DailyOutflowBars({ data, monthYYYYMM, colors }: Props) {
  const [chartWidth, setChartWidth] = useState(320)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    setChartWidth(e.nativeEvent.layout.width)
  }, [])

  // Calculate days in month
  const daysInMonth = useMemo(() => {
    const [year, month] = monthYYYYMM.split('-').map(Number)
    return new Date(year, month, 0).getDate()
  }, [monthYYYYMM])

  // Build lookup map: day -> amount
  const dayAmountMap = useMemo(() => {
    const map = new Map<number, number>()
    for (const d of data) {
      map.set(d.day, d.amount)
    }
    return map
  }, [data])

  // Calculate spike threshold (top 15% of spending days with data)
  const spikeThreshold = useMemo(() => {
    if (data.length === 0) return 0
    const sorted = [...data].sort((a, b) => a.amount - b.amount)
    const idx = Math.floor(sorted.length * SPIKE_PERCENTILE)
    return sorted[idx]?.amount ?? 0
  }, [data])

  // Find max for scaling
  const maxAmount = useMemo(() => {
    return Math.max(...data.map(d => d.amount), 1)
  }, [data])

  // Calculate bar dimensions based on full month
  const totalGaps = (daysInMonth - 1) * BAR_GAP
  const barWidth = Math.max(4, (chartWidth - totalGaps) / daysInMonth)

  // Build bars for each day in month
  const bars = useMemo(() => {
    const result: { day: number; x: number; y: number; width: number; height: number; isSpike: boolean; hasData: boolean }[] = []

    for (let day = 1; day <= daysInMonth; day++) {
      const x = (day - 1) * (barWidth + BAR_GAP)
      const amount = dayAmountMap.get(day)
      const hasData = amount !== undefined && amount > 0

      if (hasData) {
        const heightRatio = amount / maxAmount
        const barHeight = MIN_BAR_HEIGHT + heightRatio * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT)
        const y = AXIS_Y - barHeight
        const isSpike = amount >= spikeThreshold

        result.push({ day, x, y, width: barWidth, height: barHeight, isSpike, hasData: true })
      } else {
        // Empty slot - no bar rendered
        result.push({ day, x, y: AXIS_Y, width: barWidth, height: 0, isSpike: false, hasData: false })
      }
    }

    return result
  }, [daysInMonth, barWidth, dayAmountMap, maxAmount, spikeThreshold])

  // Handle tap to select closest bar
  const handlePress = useCallback((event: { nativeEvent: { locationX: number } }) => {
    const tapX = event.nativeEvent.locationX
    let closestDay = 1
    let closestDist = Math.abs(bars[0]?.x + barWidth / 2 - tapX) ?? Infinity

    for (const bar of bars) {
      if (!bar.hasData) continue
      const barCenterX = bar.x + bar.width / 2
      const dist = Math.abs(barCenterX - tapX)
      if (dist < closestDist) {
        closestDist = dist
        closestDay = bar.day
      }
    }

    setSelectedDay(prev => prev === closestDay ? null : closestDay)
  }, [bars, barWidth])

  // Selected day info
  const selectedAmount = selectedDay !== null ? dayAmountMap.get(selectedDay) : null

  return (
    <View onLayout={handleLayout}>
      {/* Header row: label + selected day amount */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
        <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary, letterSpacing: 0.5 }}>
          Daily outflow
        </Text>
        {selectedDay !== null && selectedAmount !== undefined && (
          <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.text }}>
            Day {selectedDay}: {formatAmount(selectedAmount)}
          </Text>
        )}
      </View>

      <Pressable onPress={handlePress}>
        <Svg width={chartWidth} height={CHART_HEIGHT} viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}>
        {/* Axis line */}
        <Line
          x1={0}
          y1={AXIS_Y}
          x2={chartWidth}
          y2={AXIS_Y}
          stroke={colors.border}
          strokeWidth={1}
          opacity={0.5}
        />

        {/* Bars - only render for days with data */}
        {bars.filter(bar => bar.hasData).map((bar) => {
          const isSelected = bar.day === selectedDay
          return (
            <Rect
              key={bar.day}
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              rx={BAR_RADIUS}
              fill={isSelected ? colors.text : bar.isSpike ? colors.primary : colors.textSecondary}
              opacity={isSelected ? 1 : bar.isSpike ? 0.8 : 0.4}
            />
          )
        })}
      </Svg>
      </Pressable>

      {/* Day labels */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
        <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, opacity: 0.7 }}>
          1
        </Text>
        <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, opacity: 0.7 }}>
          {daysInMonth}
        </Text>
      </View>
    </View>
  )
}
