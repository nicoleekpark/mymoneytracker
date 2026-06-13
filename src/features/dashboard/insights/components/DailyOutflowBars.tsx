import React, { useCallback, useMemo, useState } from 'react'
import { LayoutChangeEvent, Pressable, Text, View } from 'react-native'
import Svg, { Rect, Line } from 'react-native-svg'

import { fontSize, fontWeight, letterSpacing } from '@/shared/theme/tokens/typography'
import { spacing } from '@/shared/theme/tokens/spacing'

import type { InsightsColors, DailyOutflow } from '../insights.types'

type Props = {
  data: DailyOutflow[]
  colors: InsightsColors
}

const CHART_HEIGHT = 72
const AXIS_Y = 60
const BAR_RADIUS = 2
const MIN_BAR_HEIGHT = 4
const MAX_BAR_HEIGHT = 52
const BAR_GAP = 1
const DAYS_IN_MONTH = 31 // Show all possible days (1-31)

// Days in top 15% of spending are considered spikes
const SPIKE_PERCENTILE = 0.85

/**
 * Day-of-month spending pattern bar chart
 *
 * Shows average spending per day of month aggregated across selected duration.
 * Reveals patterns like: "You spend more on 1st (rent) and 15th (payday)"
 *
 * Layout:
 * ┌─────────────────────────────────────────────────────┐
 * │ █   ▁▂▁█▂▃▁▂█▂▁▃▁▂█▂▁▂▂▁▃▂▂▁▂▂▁▁▂▂▁               │
 * │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
 * │ 1                                              31  │
 * └─────────────────────────────────────────────────────┘
 *
 * - Shows all 31 days (aggregated across months)
 * - Bars show average spending for that day of month
 * - High-spend days (top 15%) highlighted
 */
function formatAmount(amount: number): string {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`
  }
  // Smart format: show cents only when non-zero
  return amount % 1 !== 0
    ? `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `$${Math.round(amount).toLocaleString('en-US')}`
}

export function DailyOutflowBars({ data, colors }: Props) {
  const [chartWidth, setChartWidth] = useState(320)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    setChartWidth(e.nativeEvent.layout.width)
  }, [])

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
  const totalGaps = (DAYS_IN_MONTH - 1) * BAR_GAP
  const barWidth = Math.max(4, (chartWidth - totalGaps) / DAYS_IN_MONTH)

  // Build bars for each day in month
  const bars = useMemo(() => {
    const result: { day: number; x: number; y: number; width: number; height: number; isSpike: boolean; hasData: boolean }[] = []

    for (let day = 1; day <= DAYS_IN_MONTH; day++) {
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
  }, [DAYS_IN_MONTH, barWidth, dayAmountMap, maxAmount, spikeThreshold])

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

  // Build accessibility summary
  const daysWithSpending = data.filter(d => d.amount > 0).length
  const spikeDays = data.filter(d => d.amount >= spikeThreshold).length

  return (
    <View onLayout={handleLayout}>
      {/* Header row: label + selected day amount */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
        <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary, letterSpacing: letterSpacing.wider }}>
          Avg by day of month
        </Text>
        {selectedDay !== null && selectedAmount != null && (
          <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.text }}>
            Day {selectedDay}: {formatAmount(selectedAmount)} avg
          </Text>
        )}
      </View>

      <Pressable
        onPress={handlePress}
        accessibilityRole="image"
        accessibilityLabel={`Average spending by day of month. ${daysWithSpending} days with data. ${spikeDays} high spending days. Tap to see daily averages.`}
      >
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
          {DAYS_IN_MONTH}
        </Text>
      </View>
    </View>
  )
}
