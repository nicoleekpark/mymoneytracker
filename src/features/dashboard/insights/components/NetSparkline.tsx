import React, { useCallback, useMemo, useRef, useState } from 'react'
import { LayoutChangeEvent, PanResponder, Text, View } from 'react-native'
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

const CHART_HEIGHT = 88
const CHART_AREA_HEIGHT = 64
const AXIS_Y = 76
const LABEL_FONT_SIZE = 10
const PADDING_TOP = 12
const PADDING_HORIZONTAL = 8 // Prevent line from being cut at edges

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

  // Calculate usable width (with padding for line stroke)
  const usableWidth = chartWidth - PADDING_HORIZONTAL * 2

  // Calculate points for SVG
  const { points, linePath, areaPath, baselineY, zeroY } = useMemo(() => {
    if (sortedData.length < 2) {
      return { points: [], linePath: '', areaPath: '', baselineY: AXIS_Y, zeroY: AXIS_Y }
    }

    const values = sortedData.map(d => d.net)
    const minVal = Math.min(...values, baseline, 0) // Include 0 in range for proper zero line
    const maxVal = Math.max(...values, baseline, 0)
    const range = maxVal - minVal || 1

    const mapY = (val: number) => {
      const normalized = (val - minVal) / range
      return AXIS_Y - PADDING_TOP - normalized * (CHART_AREA_HEIGHT - PADDING_TOP)
    }

    // Add horizontal padding to prevent line from being cut at edges
    const pts = sortedData.map((d, i) => ({
      x: PADDING_HORIZONTAL + (i / (sortedData.length - 1)) * usableWidth,
      y: mapY(d.net)
    }))

    const line = generateSmoothPath(pts)
    const area = line + ` L${chartWidth - PADDING_HORIZONTAL},${AXIS_Y} L${PADDING_HORIZONTAL},${AXIS_Y} Z`
    const blY = mapY(baseline)
    const zy = mapY(0) // Calculate where y=0 is on the chart

    return { points: pts, linePath: line, areaPath: area, baselineY: blY, zeroY: zy }
  }, [sortedData, baseline, chartWidth, usableWidth])

  // Find closest point to X coordinate
  const findClosestPoint = useCallback((x: number) => {
    if (points.length === 0) return null

    let closestIdx = 0
    let closestDist = Math.abs(points[0].x - x)

    for (let i = 1; i < points.length; i++) {
      const dist = Math.abs(points[i].x - x)
      if (dist < closestDist) {
        closestDist = dist
        closestIdx = i
      }
    }

    return closestIdx
  }, [points])

  // PanResponder for drag interaction
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const x = evt.nativeEvent.locationX
      const idx = findClosestPoint(x)
      if (idx !== null) setSelectedIndex(idx)
    },
    onPanResponderMove: (evt) => {
      const x = evt.nativeEvent.locationX
      const idx = findClosestPoint(x)
      if (idx !== null) setSelectedIndex(idx)
    },
    onPanResponderRelease: () => {
      // Keep selection visible after release
    },
  }), [findClosestPoint])

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

      {/* Chart with drag support */}
      <View {...panResponder.panHandlers}>
        <Svg width={chartWidth} height={CHART_HEIGHT} viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}>
          {/* Zero reference line */}
          <Line
            x1={PADDING_HORIZONTAL}
            y1={zeroY}
            x2={chartWidth - PADDING_HORIZONTAL}
            y2={zeroY}
            stroke={colors.textSecondary}
            strokeWidth={1}
            opacity={0.3}
          />

          {/* Baseline reference line */}
          <Line
            x1={PADDING_HORIZONTAL}
            y1={baselineY}
            x2={chartWidth - PADDING_HORIZONTAL}
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
            x1={PADDING_HORIZONTAL}
            y1={AXIS_Y}
            x2={chartWidth - PADDING_HORIZONTAL}
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
                y2={zeroY}
                stroke={selectedData && selectedData.net >= 0 ? colors.success : colors.danger}
                strokeWidth={2}
                opacity={0.6}
              />
              <Circle
                cx={selectedPoint.x}
                cy={selectedPoint.y}
                r={6}
                fill={selectedData && selectedData.net >= 0 ? colors.success : colors.danger}
                stroke={colors.surface}
                strokeWidth={2}
              />
            </>
          )}
        </Svg>

        {/* X-axis labels */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2, paddingHorizontal: PADDING_HORIZONTAL }}>
          <Text style={{ fontSize: LABEL_FONT_SIZE, color: colors.textSecondary, opacity: 0.7 }}>
            12 mo ago
          </Text>
          <Text style={{ fontSize: LABEL_FONT_SIZE, color: colors.textSecondary, opacity: 0.7 }}>
            now
          </Text>
        </View>
      </View>
    </View>
  )
}
