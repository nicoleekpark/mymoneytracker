import React, { useCallback, useMemo, useRef, useState } from 'react'
import { LayoutChangeEvent, PanResponder, Text, View } from 'react-native'
import Svg, { Path, Circle, Line } from 'react-native-svg'

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
  warning: string // For net line (orange)
}>

type Props = {
  monthlyData: MonthData[]
  currentMonth: number // 1-12, for future month styling
  isCurrentYear: boolean
  isPastYear: boolean
  colors: MonthlyCashflowColors
}

const CHART_HEIGHT = 120
const CHART_PADDING_H = 8
const BAR_WIDTH = 14

/**
 * Combo chart with income bars up, expense bars down, and net line overlay
 */
function ComboChart({
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

  // Find max for scaling (use same scale for both income and expense)
  const maxIncome = Math.max(...data.map(d => d.incomeDollar), 1)
  const maxExpense = Math.max(...data.map(d => d.expenseDollar), 1)
  const maxAmount = Math.max(maxIncome, maxExpense)

  // Height allocation: top half for income bars, bottom half for expense bars
  const halfHeight = CHART_HEIGHT / 2
  const monthWidth = width / 12

  // Calculate net line points - only for past/current months
  const lastValidMonth = isPastYear ? 12 : (isCurrentYear ? currentMonth : 12)
  const validData = data.slice(0, lastValidMonth)

  const netValues = validData.map(d => d.netDollar)
  const minNet = Math.min(...netValues, 0)
  const maxNet = Math.max(...netValues, 0)
  const netRange = maxNet - minNet || 1

  const netPoints = validData.map((d, i) => {
    const x = monthWidth * i + monthWidth / 2
    // Map net value to chart height: positive above center, negative below
    const normalizedNet = (d.netDollar - minNet) / netRange
    const y = CHART_HEIGHT - normalizedNet * CHART_HEIGHT * 0.85 - CHART_HEIGHT * 0.075
    return { x, y, net: d.netDollar, index: i }
  })

  // Create SVG path for net line
  const netLinePath = netPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`)
    .join(' ')

  return (
    <View style={{ height: CHART_HEIGHT + 24, position: 'relative' }}>
      {/* Bars layer */}
      <View style={{ flexDirection: 'row', height: CHART_HEIGHT }}>
        {data.map((month, idx) => {
          const isFuture = !isPastYear && isCurrentYear && idx >= currentMonth
          const isSelected = selectedIndex === idx

          const incomeHeight = (month.incomeDollar / maxAmount) * halfHeight * 0.9
          const expenseHeight = (month.expenseDollar / maxAmount) * halfHeight * 0.9

          return (
            <View
              key={idx}
              style={{
                width: monthWidth,
                height: CHART_HEIGHT,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* Income bar (grows upward from center) */}
              <View
                style={{
                  position: 'absolute',
                  bottom: halfHeight,
                  width: BAR_WIDTH,
                  height: Math.max(2, incomeHeight),
                  backgroundColor: isFuture ? colors.surfaceAlt : colors.success,
                  borderTopLeftRadius: 3,
                  borderTopRightRadius: 3,
                  opacity: isFuture ? 0.4 : isSelected ? 1 : 0.8
                }}
              />

              {/* Expense bar (grows downward from center) */}
              <View
                style={{
                  position: 'absolute',
                  top: halfHeight,
                  width: BAR_WIDTH,
                  height: Math.max(2, expenseHeight),
                  backgroundColor: isFuture ? colors.surfaceAlt : colors.danger,
                  borderBottomLeftRadius: 3,
                  borderBottomRightRadius: 3,
                  opacity: isFuture ? 0.4 : isSelected ? 1 : 0.8
                }}
              />
            </View>
          )
        })}
      </View>

      {/* Center line (zero line) */}
      <View
        style={{
          position: 'absolute',
          top: halfHeight,
          left: 0,
          right: 0,
          height: 1,
          backgroundColor: colors.surfaceAlt
        }}
      />

      {/* Net line overlay (SVG) */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 24 }}>
        <Svg width={width} height={CHART_HEIGHT}>
          {/* Net trend line */}
          <Path
            d={netLinePath}
            fill="none"
            stroke={colors.warning}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dots on the net line */}
          {netPoints.map((p) => (
            <Circle
              key={p.index}
              cx={p.x}
              cy={p.y}
              r={selectedIndex === p.index ? 5 : 3}
              fill={colors.warning}
              opacity={selectedIndex === p.index ? 1 : 0.8}
            />
          ))}

          {/* Selected dot highlight */}
          {selectedIndex !== null && (() => {
            const selectedPoint = netPoints.find(p => p.index === selectedIndex)
            return selectedPoint ? (
              <Circle
                cx={selectedPoint.x}
                cy={selectedPoint.y}
                r={3}
                fill={colors.surface}
              />
            ) : null
          })()}

          {/* Vertical guide line when selected */}
          {selectedIndex !== null && (
            <Line
              x1={monthWidth * selectedIndex + monthWidth / 2}
              y1={0}
              x2={monthWidth * selectedIndex + monthWidth / 2}
              y2={CHART_HEIGHT}
              stroke={colors.textMuted}
              strokeWidth={1}
              strokeDasharray="4,4"
              opacity={0.5}
            />
          )}
        </Svg>
      </View>

      {/* Month labels */}
      <View style={{ flexDirection: 'row', marginTop: 4 }}>
        {data.map((_, idx) => {
          const isFuture = !isPastYear && isCurrentYear && idx >= currentMonth
          const isSelected = selectedIndex === idx

          return (
            <View key={idx} style={{ width: monthWidth, alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: 9,
                  fontWeight: isSelected ? '800' : '600',
                  color: isSelected ? colors.text : colors.textMuted,
                  opacity: isFuture ? 0.4 : 1
                }}
              >
                {MONTH_NAMES_SHORT[idx].toUpperCase()}
              </Text>
              {isSelected && (
                <View
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: colors.warning,
                    marginTop: 2
                  }}
                />
              )}
            </View>
          )
        })}
      </View>
    </View>
  )
}

/**
 * Monthly cashflow chart with ygraph-style combo chart and drag interaction
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
      {/* Draggable area containing combo chart */}
      <View
        {...panResponder.panHandlers}
        style={{ paddingHorizontal: CHART_PADDING_H }}
      >
        {/* Combo chart */}
        <ComboChart
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
              borderRadius: 4,
              backgroundColor: colors.warning
            }}
          />
          <Text style={{ fontSize: 10, color: colors.textMuted }}>Net</Text>
        </View>
      </View>
    </View>
  )
}
