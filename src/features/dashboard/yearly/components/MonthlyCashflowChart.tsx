import React, { useCallback, useMemo, useRef, useState } from 'react'
import { LayoutChangeEvent, PanResponder, Pressable, Text, View } from 'react-native'
import Svg, { Path, Circle, Line } from 'react-native-svg'

import { formatUsdInt } from '@/shared/format/currency'
import { fontSize } from '@/theme/tokens/typography'
import { radius } from '@/theme/tokens/radius'
import { spacing } from '@/theme/tokens/spacing'

import type { MonthData } from '../hooks/useYearlyData'
import { MONTH_NAMES_SHORT } from '../../types/dashboard.types'

export type MonthlyCashflowColors = Readonly<{
  text: string
  textSecondary: string
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
  onMonthPress?: (month: number) => void // 1-12, called when user taps to navigate
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

  // Determine if any month is selected for opacity logic
  const hasSelection = selectedIndex !== null

  return (
    <View style={{ height: CHART_HEIGHT + 24, position: 'relative' }}>

      {/* Net line layer (SVG) - BEHIND bars */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 24 }}>
        <Svg width={width} height={CHART_HEIGHT}>
          {/* Net trend line - subtle, behind bars */}
          <Path
            d={netLinePath}
            fill="none"
            stroke={colors.text}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.6}
          />
        </Svg>
      </View>

      {/* Zero baseline */}
      <View
        style={{
          position: 'absolute',
          top: halfHeight - 0.5,
          left: 0,
          right: 0,
          height: 1,
          backgroundColor: colors.text,
          opacity: 0.15
        }}
      />

      {/* Bars layer - on top of net line */}
      <View style={{ flexDirection: 'row', height: CHART_HEIGHT }}>
        {data.map((month, idx) => {
          const isFuture = !isPastYear && isCurrentYear && idx >= currentMonth
          const isSelected = selectedIndex === idx

          const incomeHeight = (month.incomeDollar / maxAmount) * halfHeight * 0.9
          const expenseHeight = (month.expenseDollar / maxAmount) * halfHeight * 0.9

          // Opacity: selected = 1, others dimmed when selection exists
          const barOpacity = isFuture ? 0.25 : isSelected ? 1 : hasSelection ? 0.4 : 0.85

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
              {/* Income bar */}
              <View
                style={{
                  position: 'absolute',
                  bottom: halfHeight,
                  width: BAR_WIDTH,
                  height: Math.max(2, incomeHeight),
                  backgroundColor: isFuture ? colors.surfaceAlt : colors.success,
                  borderTopLeftRadius: radius.xs,
                  borderTopRightRadius: radius.xs,
                  opacity: barOpacity
                }}
              />

              {/* Expense bar */}
              <View
                style={{
                  position: 'absolute',
                  top: halfHeight,
                  width: BAR_WIDTH,
                  height: Math.max(2, expenseHeight),
                  backgroundColor: isFuture ? colors.surfaceAlt : colors.danger,
                  borderBottomLeftRadius: radius.xs,
                  borderBottomRightRadius: radius.xs,
                  opacity: barOpacity
                }}
              />

            </View>
          )
        })}
      </View>

      {/* Selected point marker (SVG overlay) */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 24, pointerEvents: 'none' }}>
        <Svg width={width} height={CHART_HEIGHT}>
          {/* Point marker - only on selected */}
          {netPoints.map((p) => {
            const isSelected = selectedIndex === p.index
            if (!isSelected) return null
            return (
              <Circle
                key={p.index}
                cx={p.x}
                cy={p.y}
                r={4}
                fill={colors.text}
                opacity={0.8}
              />
            )
          })}

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
              stroke={colors.textSecondary}
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
                  fontSize: fontSize.xs,
                  fontWeight: isSelected ? '800' : '600',
                  color: isSelected ? colors.text : colors.textSecondary,
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
                    borderRadius: radius.full,
                    backgroundColor: colors.text,
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
  colors,
  onMonthPress
}: Props) {
  const [chartWidth, setChartWidth] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isLocked, setIsLocked] = useState(false) // Toggle lock state
  const isDraggingRef = useRef(false)
  const startXRef = useRef<number | null>(null)
  const prevLockedIndexRef = useRef<number | null>(null) // Track previous locked index for tap comparison

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

  // Pan responder for drag and tap interaction
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: evt => {
          startXRef.current = evt.nativeEvent.locationX
          isDraggingRef.current = false
          // Store current locked index before updating
          prevLockedIndexRef.current = isLocked ? selectedIndex : null
          const x = evt.nativeEvent.locationX
          const newIdx = getMonthFromX(x)
          setSelectedIndex(newIdx)
        },
        onPanResponderMove: evt => {
          const x = evt.nativeEvent.locationX
          // Check if this is a drag (moved more than 10px)
          if (startXRef.current !== null && Math.abs(x - startXRef.current) > 10) {
            isDraggingRef.current = true
            setIsLocked(false) // Unlock when dragging
          }
          const newIdx = getMonthFromX(x)
          setSelectedIndex(prev => (prev !== newIdx ? newIdx : prev))
        },
        onPanResponderRelease: evt => {
          const x = evt.nativeEvent.locationX
          const wasDragging = isDraggingRef.current
          isDraggingRef.current = false
          startXRef.current = null

          if (!wasDragging) {
            // This was a tap
            const tappedIdx = getMonthFromX(x)
            // Only close if tapping the SAME month that was previously locked
            if (prevLockedIndexRef.current === tappedIdx) {
              // Tapped same month - close detail
              setIsLocked(false)
              setSelectedIndex(null)
            } else {
              // Tapped different month (or wasn't locked) - show this month
              setIsLocked(true)
              setSelectedIndex(tappedIdx)
            }
          } else {
            // Was dragging - clear selection unless locked
            if (!isLocked) {
              setSelectedIndex(null)
            }
          }
          prevLockedIndexRef.current = null
        },
        onPanResponderTerminate: () => {
          isDraggingRef.current = false
          startXRef.current = null
          if (!isLocked) {
            setSelectedIndex(null)
          }
        }
      }),
    [getMonthFromX, isLocked, selectedIndex]
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

      {/* Selected month details - single row, no border */}
      {selectedData ? (
        <View style={{ marginTop: spacing.md, marginHorizontal: CHART_PADDING_H }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>
              In <Text style={{ fontWeight: '600', color: colors.success }}>{formatUsdInt(selectedData.incomeDollar)}</Text>
            </Text>
            <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>
              Out <Text style={{ fontWeight: '600', color: colors.danger }}>{formatUsdInt(selectedData.expenseDollar)}</Text>
            </Text>
            <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>
              Net <Text style={{ fontWeight: '600', color: colors.text }}>{selectedData.netDollar >= 0 ? '+' : ''}{formatUsdInt(selectedData.netDollar)}</Text>
            </Text>
          </View>
          {/* Navigate to month link */}
          {onMonthPress && selectedIndex !== null && (
            <Pressable
              onPress={() => onMonthPress(selectedIndex + 1)}
              style={({ pressed }) => ({
                alignSelf: 'center',
                marginTop: spacing.sm,
                opacity: pressed ? 0.5 : 1
              })}
              hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}
            >
              <Text style={{ fontSize: fontSize.sm, fontWeight: '600', color: colors.primary }}>
                View {MONTH_NAMES_SHORT[selectedIndex]} details ›
              </Text>
            </Pressable>
          )}
        </View>
      ) : (
        /* Hint when not selected */
        <Text
          style={{
            fontSize: fontSize.xs,
            color: colors.textSecondary,
            textAlign: 'center',
            marginTop: spacing.md
          }}
        >
          Tap a month to inspect
        </Text>
      )}

      {/* Legend */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: spacing.lg,
          marginTop: 12
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: radius.xs,
              backgroundColor: colors.success
            }}
          />
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Income</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: radius.xs,
              backgroundColor: colors.danger
            }}
          />
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Expense</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: radius.full,
              backgroundColor: colors.text,
              opacity: 0.9
            }}
          />
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Net</Text>
        </View>
      </View>
    </View>
  )
}
