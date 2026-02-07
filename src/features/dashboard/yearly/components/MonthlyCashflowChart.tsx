import React, { useCallback, useMemo, useRef, useState } from 'react'
import { LayoutChangeEvent, PanResponder, Text, View } from 'react-native'
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg'

import { formatUsdInt } from '@/shared/format/currency'

import type { MonthData } from '../hooks/useYearlyData'
import { MONTH_NAMES_SHORT } from '../../types/dashboard.types'

export type MonthlyCashflowColors = Readonly<{
  text: string
  textMuted: string
  surface: string
  surfaceAlt: string
  success: string
  danger: string
  primary: string
}>

type Props = {
  monthlyData: MonthData[]
  currentMonth: number // 1-12, for future month styling
  isCurrentYear: boolean
  isPastYear: boolean
  colors: MonthlyCashflowColors
}

const BAR_HEIGHT = 44
const SPARKLINE_HEIGHT = 32
const CHART_PADDING_H = 8

/**
 * Sparkline component showing net flow trend
 */
function Sparkline({
  data,
  width,
  height,
  currentMonth,
  isCurrentYear,
  colors,
  selectedIndex
}: {
  data: MonthData[]
  width: number
  height: number
  currentMonth: number
  isCurrentYear: boolean
  colors: MonthlyCashflowColors
  selectedIndex: number | null
}) {
  if (width <= 0 || data.length === 0) return null

  // Calculate min/max for scaling
  const netValues = data.map(d => d.netDollar)
  const minNet = Math.min(...netValues, 0)
  const maxNet = Math.max(...netValues, 0)
  const range = maxNet - minNet || 1

  // Padding for the sparkline
  const padY = 6
  const effectiveHeight = height - padY * 2
  const monthWidth = width / 12

  // Generate path points - center each point in its month column
  const points = data.map((d, i) => {
    const x = monthWidth * i + monthWidth / 2
    const y = padY + effectiveHeight - ((d.netDollar - minNet) / range) * effectiveHeight
    return { x, y, net: d.netDollar }
  })

  // Create SVG path
  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`)
    .join(' ')

  // Area path (for gradient fill)
  const areaPath = `${linePath} L${points[points.length - 1].x},${height} L${points[0].x},${height} Z`

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="sparkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={colors.primary} stopOpacity={0.25} />
          <Stop offset="100%" stopColor={colors.primary} stopOpacity={0} />
        </LinearGradient>
      </Defs>

      {/* Area fill */}
      <Path d={areaPath} fill="url(#sparkGradient)" />

      {/* Line */}
      <Path
        d={linePath}
        fill="none"
        stroke={colors.primary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Month dots - green for positive, red for negative */}
      {points.map((p, i) => {
        const isFuture = isCurrentYear && i >= currentMonth
        if (isFuture) return null
        return (
          <Circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={3}
            fill={p.net >= 0 ? colors.success : colors.danger}
          />
        )
      })}

      {/* Selected month indicator */}
      {selectedIndex !== null && points[selectedIndex] && (
        <>
          <Circle
            cx={points[selectedIndex].x}
            cy={points[selectedIndex].y}
            r={5}
            fill={points[selectedIndex].net >= 0 ? colors.primary : colors.danger}
          />
          <Circle
            cx={points[selectedIndex].x}
            cy={points[selectedIndex].y}
            r={3}
            fill={colors.surface}
          />
        </>
      )}
    </Svg>
  )
}

/**
 * Bar chart with paired income/expense bars
 */
function BarChart({
  data,
  width,
  currentMonth,
  isCurrentYear,
  isPastYear,
  colors,
  selectedIndex
}: {
  data: MonthData[]
  width: number
  currentMonth: number
  isCurrentYear: boolean
  isPastYear: boolean
  colors: MonthlyCashflowColors
  selectedIndex: number | null
}) {
  if (width <= 0) return null

  // Find max for scaling
  const maxAmount = Math.max(
    ...data.map(d => Math.max(d.incomeDollar, d.expenseDollar)),
    1
  )

  const monthWidth = width / 12
  const barWidth = 6
  const barGap = 2

  return (
    <View style={{ flexDirection: 'row', height: BAR_HEIGHT + 20 }}>
      {data.map((month, idx) => {
        const isFuture = !isPastYear && isCurrentYear && idx >= currentMonth
        const isSelected = selectedIndex === idx

        const incomeHeight = (month.incomeDollar / maxAmount) * BAR_HEIGHT
        const expenseHeight = (month.expenseDollar / maxAmount) * BAR_HEIGHT

        return (
          <View
            key={idx}
            style={{
              width: monthWidth,
              alignItems: 'center'
            }}
          >
            {/* Bars */}
            <View
              style={{
                height: BAR_HEIGHT,
                flexDirection: 'row',
                alignItems: 'flex-end',
                gap: barGap
              }}
            >
              <View
                style={{
                  width: barWidth,
                  height: Math.max(4, incomeHeight),
                  backgroundColor: isFuture ? colors.surfaceAlt : colors.success,
                  borderRadius: 3,
                  opacity: isFuture ? 0.4 : isSelected ? 1 : 0.85
                }}
              />
              <View
                style={{
                  width: barWidth,
                  height: Math.max(4, expenseHeight),
                  backgroundColor: isFuture ? colors.surfaceAlt : colors.danger,
                  borderRadius: 3,
                  opacity: isFuture ? 0.4 : isSelected ? 1 : 0.85
                }}
              />
            </View>

            {/* Month label */}
            <Text
              style={{
                fontSize: 9,
                fontWeight: isSelected ? '800' : '600',
                color: isSelected ? colors.text : colors.textMuted,
                marginTop: 6,
                opacity: isFuture ? 0.4 : 1
              }}
            >
              {MONTH_NAMES_SHORT[idx].toUpperCase()}
            </Text>

            {/* Selection dot */}
            {isSelected && (
              <View
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: colors.primary,
                  marginTop: 2
                }}
              />
            )}
          </View>
        )
      })}
    </View>
  )
}

/**
 * Monthly cashflow chart with sparkline and Robinhood-style drag interaction
 */
export function MonthlyCashflowChart({
  monthlyData,
  currentMonth,
  isCurrentYear,
  isPastYear,
  colors
}: Props) {
  const [chartWidth, setChartWidth] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const isDraggingRef = useRef(false)

  // Calculate month index from X position
  const getMonthFromX = useCallback(
    (x: number) => {
      if (chartWidth <= 0) return null
      // Adjust for padding - locationX is relative to the padded container
      const adjustedX = x - CHART_PADDING_H
      if (adjustedX < 0) return 0
      if (adjustedX >= chartWidth) return 11
      const monthWidth = chartWidth / 12
      const idx = Math.floor(adjustedX / monthWidth)
      return Math.max(0, Math.min(11, idx))
    },
    [chartWidth]
  )

  // Pan responder for drag interaction
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: evt => {
          isDraggingRef.current = true
          const x = evt.nativeEvent.locationX
          setSelectedIndex(getMonthFromX(x))
        },
        onPanResponderMove: evt => {
          if (!isDraggingRef.current) return
          const x = evt.nativeEvent.locationX
          const newIdx = getMonthFromX(x)
          setSelectedIndex(prev => (prev !== newIdx ? newIdx : prev))
        },
        onPanResponderRelease: () => {
          isDraggingRef.current = false
          setSelectedIndex(null)
        },
        onPanResponderTerminate: () => {
          isDraggingRef.current = false
          setSelectedIndex(null)
        }
      }),
    [getMonthFromX]
  )

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    setChartWidth(e.nativeEvent.layout.width - CHART_PADDING_H * 2)
  }, [])

  // Selected month data
  const selectedData = selectedIndex !== null ? monthlyData[selectedIndex] : null

  return (
    <View onLayout={handleLayout}>
      {/* Draggable area containing sparkline + bar chart */}
      <View
        {...panResponder.panHandlers}
        style={{ paddingHorizontal: CHART_PADDING_H }}
      >
        {/* Sparkline label */}
        <Text
          style={{
            fontSize: 9,
            fontWeight: '600',
            color: colors.primary,
            textAlign: 'right',
            marginBottom: 4,
            opacity: 0.8
          }}
        >
          NET TREND
        </Text>

        {/* Sparkline */}
        <View style={{ height: SPARKLINE_HEIGHT, marginBottom: 12 }}>
          <Sparkline
            data={monthlyData}
            width={chartWidth}
            height={SPARKLINE_HEIGHT}
            currentMonth={currentMonth}
            isCurrentYear={isCurrentYear}
            colors={colors}
            selectedIndex={selectedIndex}
          />
        </View>

        {/* Bar chart */}
        <BarChart
          data={monthlyData}
          width={chartWidth}
          currentMonth={currentMonth}
          isCurrentYear={isCurrentYear}
          isPastYear={isPastYear}
          colors={colors}
          selectedIndex={selectedIndex}
        />
      </View>

      {/* Selected month details (shows when dragging) */}
      {selectedData ? (
        <View
          style={{
            backgroundColor: colors.surfaceAlt,
            borderRadius: 10,
            padding: 12,
            marginTop: 12,
            marginHorizontal: CHART_PADDING_H
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '700',
                color: colors.text,
                width: 40
              }}
            >
              {MONTH_NAMES_SHORT[selectedIndex!].toUpperCase()}
            </Text>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-around'
              }}
            >
              <View style={{ alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: 9,
                    fontWeight: '600',
                    color: colors.textMuted,
                    marginBottom: 2
                  }}
                >
                  IN
                </Text>
                <Text
                  style={{ fontSize: 13, fontWeight: '700', color: colors.success }}
                >
                  {formatUsdInt(selectedData.incomeDollar)}
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: 9,
                    fontWeight: '600',
                    color: colors.textMuted,
                    marginBottom: 2
                  }}
                >
                  OUT
                </Text>
                <Text
                  style={{ fontSize: 13, fontWeight: '700', color: colors.danger }}
                >
                  {formatUsdInt(selectedData.expenseDollar)}
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: 9,
                    fontWeight: '600',
                    color: colors.textMuted,
                    marginBottom: 2
                  }}
                >
                  NET
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color:
                      selectedData.netDollar >= 0 ? colors.success : colors.danger
                  }}
                >
                  {selectedData.netDollar >= 0 ? '+' : ''}
                  {formatUsdInt(selectedData.netDollar)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      ) : (
        /* Hint when not dragging */
        <Text
          style={{
            fontSize: 11,
            color: colors.textMuted,
            textAlign: 'center',
            marginTop: 12
          }}
        >
          Press and drag to explore months
        </Text>
      )}

      {/* Legend */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 16,
          marginTop: 12
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              backgroundColor: colors.success
            }}
          />
          <Text style={{ fontSize: 10, color: colors.textMuted }}>Income</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              backgroundColor: colors.danger
            }}
          />
          <Text style={{ fontSize: 10, color: colors.textMuted }}>Expense</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              backgroundColor: colors.primary
            }}
          />
          <Text style={{ fontSize: 10, color: colors.textMuted }}>Net</Text>
        </View>
      </View>
    </View>
  )
}
