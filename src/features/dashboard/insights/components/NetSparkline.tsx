import React, { useCallback, useMemo, useRef, useState } from 'react'
import { LayoutChangeEvent, Pressable, Text, View } from 'react-native'
import Svg, { Path, Line, Circle } from 'react-native-svg'

import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import { spacing } from '@/shared/theme/tokens/spacing'

import type { InsightsColors } from '../insights.types'

type DataPoint = {
  month: string // YYYY-MM
  net: number
}

type Props = {
  data: DataPoint[]
  baseline: number
  colors: InsightsColors
}

const CHART_HEIGHT = 80
const CHART_AREA_HEIGHT = 64
const AXIS_Y = 68
const LABEL_FONT_SIZE = 10
const PADDING_TOP = 8

function formatNet(val: number): string {
  const absVal = Math.abs(val)
  if (absVal >= 1000) {
    const k = absVal / 1000
    const kStr = k >= 10 ? Math.round(k).toString() : k.toFixed(1)
    return `${val >= 0 ? '+' : '-'}$${kStr}k`
  }
  return `${val >= 0 ? '+' : '-'}$${Math.round(absVal)}`
}

function formatFullMonth(yyyymm: string): string {
  const [year, month] = yyyymm.split('-')
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return `${monthNames[parseInt(month, 10) - 1]} ${year}`
}

/**
 * Generate smooth bezier curve path from points
 */
function generateSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return ''
  if (points.length === 2) {
    return `M${points[0].x},${points[0].y} L${points[1].x},${points[1].y}`
  }

  let path = `M${points[0].x},${points[0].y}`

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]

    const tension = 0.3
    const cp1x = p1.x + (p2.x - p0.x) * tension
    const cp1y = p1.y + (p2.y - p0.y) * tension
    const cp2x = p2.x - (p3.x - p1.x) * tension
    const cp2y = p2.y - (p3.y - p1.y) * tension

    path += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`
  }

  return path
}

/**
 * Last 12 months net sparkline with header
 *
 * Layout:
 * ┌───────────────────────────────────────────────────────┐
 * │ November 2025                                    avg  │
 * │  +$8.6k                                       +$9.0k  │
 * └───────────────────────────────────────────────────────┘
 * ┌───────────────────────────────────────────────────────┐
 * │  [graph with area fill]                               │
 * │  12 mo                                          now   │
 * └───────────────────────────────────────────────────────┘
 */
export function NetSparkline({ data, baseline, colors }: Props) {
  const [chartWidth, setChartWidth] = useState(320)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const containerRef = useRef<View>(null)

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    setChartWidth(e.nativeEvent.layout.width)
  }, [])

  // Sort data chronologically
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => a.month.localeCompare(b.month))
  }, [data])

  // Calculate points for SVG
  const { points, linePath, areaPath, baselineY } = useMemo(() => {
    if (sortedData.length < 2) {
      return { points: [], linePath: '', areaPath: '', baselineY: AXIS_Y }
    }

    const values = sortedData.map(d => d.net)
    const minVal = Math.min(...values, baseline)
    const maxVal = Math.max(...values, baseline)
    const range = maxVal - minVal || 1

    const mapY = (val: number) => {
      const normalized = (val - minVal) / range
      return AXIS_Y - PADDING_TOP - normalized * (CHART_AREA_HEIGHT - PADDING_TOP)
    }

    const pts = sortedData.map((d, i) => ({
      x: (i / (sortedData.length - 1)) * chartWidth,
      y: mapY(d.net)
    }))

    const line = generateSmoothPath(pts)
    const area = line + ` L${chartWidth},${AXIS_Y} L0,${AXIS_Y} Z`
    const blY = mapY(baseline)

    return { points: pts, linePath: line, areaPath: area, baselineY: blY }
  }, [sortedData, baseline, chartWidth])

  // Handle tap to select closest point
  const handlePress = useCallback((event: { nativeEvent: { locationX: number } }) => {
    if (points.length === 0) return

    const tapX = event.nativeEvent.locationX
    let closestIdx = 0
    let closestDist = Math.abs(points[0].x - tapX)

    for (let i = 1; i < points.length; i++) {
      const dist = Math.abs(points[i].x - tapX)
      if (dist < closestDist) {
        closestDist = dist
        closestIdx = i
      }
    }

    setSelectedIndex(prev => prev === closestIdx ? null : closestIdx)
  }, [points])

  if (sortedData.length < 2) return null

  const selectedData = selectedIndex !== null ? sortedData[selectedIndex] : null
  const selectedPoint = selectedIndex !== null ? points[selectedIndex] : null

  // Header content - show selected month or latest month
  const latestData = sortedData[sortedData.length - 1]
  const displayData = selectedData ?? latestData
  const headerLeft = {
    label: formatFullMonth(displayData.month),
    value: formatNet(displayData.net),
    color: displayData.net >= 0 ? colors.success : colors.danger
  }

  return (
    <View ref={containerRef} onLayout={handleLayout}>
      {/* Header row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm }}>
        <View>
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: 2 }}>
            {headerLeft.label}
          </Text>
          <Text style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: headerLeft.color }}>
            {headerLeft.value}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: 2 }}>
            typical
          </Text>
          <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text }}>
            {formatNet(baseline)}
          </Text>
        </View>
      </View>

      {/* Chart */}
      <Pressable onPress={handlePress}>
        <Svg width={chartWidth} height={CHART_HEIGHT} viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}>
          {/* Baseline reference line */}
          <Line
            x1={0}
            y1={baselineY}
            x2={chartWidth}
            y2={baselineY}
            stroke={colors.text}
            strokeWidth={1}
            opacity={0.2}
            strokeDasharray="4,4"
          />

          {/* Main line - neutral */}
          <Path
            d={linePath}
            stroke={colors.textSecondary}
            strokeWidth={2.5}
            fill="none"
            opacity={0.8}
          />

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

          {/* Selected point indicator */}
          {selectedPoint && (
            <>
              <Line
                x1={selectedPoint.x}
                y1={selectedPoint.y}
                x2={selectedPoint.x}
                y2={AXIS_Y}
                stroke={colors.textSecondary}
                strokeWidth={1}
                opacity={0.5}
              />
              <Circle
                cx={selectedPoint.x}
                cy={selectedPoint.y}
                r={5}
                fill={selectedData && selectedData.net >= 0 ? colors.success : colors.danger}
                stroke={colors.surface}
                strokeWidth={2}
              />
            </>
          )}
        </Svg>

        {/* X-axis labels */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
          <Text style={{ fontSize: LABEL_FONT_SIZE, color: colors.textSecondary, opacity: 0.7 }}>
            12 mo ago
          </Text>
          <Text style={{ fontSize: LABEL_FONT_SIZE, color: colors.textSecondary, opacity: 0.7 }}>
            now
          </Text>
        </View>
      </Pressable>
    </View>
  )
}
