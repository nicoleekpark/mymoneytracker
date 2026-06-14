/**
 * NetWorthHistoryScreen
 *
 * Shows net worth trend over time with:
 * - Range selector (6M, 1Y, All)
 * - Line chart visualization
 */

import { router } from 'expo-router'
import React, { useCallback, useMemo, useState } from 'react'
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Path, Circle, Line, Defs, LinearGradient, Stop } from 'react-native-svg'

import type { AssetTrendPoint } from '@/core/domain/asset'
import { getTrend, getYearsWithData } from '@/core/services/asset'
import { formatUsdInt } from '@/shared/format/currency'
import { Screen } from '@/shared/layout/Screen'
import { useHoHTheme } from '@/shared/providers'
import { modalStyles } from '@/shared/theme/tokens/modal'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

type RangeKey = '6m' | '1y' | 'all'

const RANGE_OPTIONS: { key: RangeKey; label: string; months: number }[] = [
  { key: '6m', label: '6M', months: 6 },
  { key: '1y', label: '1Y', months: 12 },
  { key: 'all', label: 'All', months: -1 }, // -1 = all available
]

const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatYearMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-')
  return `${MONTH_NAMES_SHORT[Number(month) - 1]} ${year}`
}

/**
 * Simple line chart using SVG
 */
function TrendChart({
  data,
  colors,
}: {
  data: AssetTrendPoint[]
  colors: {
    text: string
    textSecondary: string
    border: string
    success: string
    danger: string
    primary: string
  }
}) {
  if (data.length === 0) {
    return (
      <View style={styles.chartEmpty}>
        <Text style={[styles.chartEmptyText, { color: colors.textSecondary }]}>
          No data available
        </Text>
      </View>
    )
  }

  const chartWidth = 300
  const chartHeight = 120
  const paddingX = 10
  const paddingY = 10

  // Calculate bounds
  const values = data.map(d => d.netWorth)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const valueRange = maxValue - minValue || 1 // Avoid division by zero

  // Scale functions
  const scaleX = (index: number) => paddingX + (index / (data.length - 1 || 1)) * (chartWidth - 2 * paddingX)
  const scaleY = (value: number) => paddingY + (1 - (value - minValue) / valueRange) * (chartHeight - 2 * paddingY)

  // Build path
  const points = data.map((d, i) => ({ x: scaleX(i), y: scaleY(d.netWorth) }))
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')

  // Area path for gradient fill
  const areaPath = `${linePath} L${points[points.length - 1].x},${chartHeight} L${points[0].x},${chartHeight} Z`

  // Determine color based on trend
  const isPositive = data[data.length - 1].netWorth >= data[0].netWorth
  const trendColor = isPositive ? colors.success : colors.danger

  // Current point (last)
  const currentPoint = points[points.length - 1]

  return (
    <View style={styles.chartContainer}>
      <Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={trendColor} stopOpacity={0.3} />
            <Stop offset="100%" stopColor={trendColor} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        <Line x1={paddingX} y1={chartHeight / 3} x2={chartWidth - paddingX} y2={chartHeight / 3} stroke={colors.border} strokeWidth={0.5} opacity={0.5} />
        <Line x1={paddingX} y1={(chartHeight / 3) * 2} x2={chartWidth - paddingX} y2={(chartHeight / 3) * 2} stroke={colors.border} strokeWidth={0.5} opacity={0.5} />

        {/* Area fill */}
        <Path d={areaPath} fill="url(#areaGradient)" />

        {/* Line */}
        <Path d={linePath} fill="none" stroke={trendColor} strokeWidth={2} />

        {/* Current point */}
        <Circle cx={currentPoint.x} cy={currentPoint.y} r={4} fill={trendColor} />
      </Svg>

      {/* X-axis labels */}
      <View style={styles.chartLabels}>
        {data.length > 0 && (
          <>
            <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>
              {MONTH_NAMES_SHORT[Number(data[0].yearMonth.split('-')[1]) - 1]}
            </Text>
            {data.length > 2 && (
              <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>
                {MONTH_NAMES_SHORT[Number(data[Math.floor(data.length / 2)].yearMonth.split('-')[1]) - 1]}
              </Text>
            )}
            <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>
              {MONTH_NAMES_SHORT[Number(data[data.length - 1].yearMonth.split('-')[1]) - 1]}
            </Text>
          </>
        )}
      </View>
    </View>
  )
}

export default function NetWorthHistoryScreen() {
  const theme = useHoHTheme()
  const insets = useSafeAreaInsets()
  const { semantic } = theme

  const [range, setRange] = useState<RangeKey>('1y')

  // Get trend data based on range
  const trendData = useMemo(() => {
    const months = RANGE_OPTIONS.find(r => r.key === range)?.months ?? 12
    if (months === -1) {
      // Get all available years and calculate total months
      const years = getYearsWithData()
      const totalMonths = years.length * 12
      return getTrend(Math.max(totalMonths, 24))
    }
    return getTrend(months)
  }, [range])

  // Filter data to range
  const displayData = useMemo(() => {
    if (range === 'all') return trendData
    const months = RANGE_OPTIONS.find(r => r.key === range)?.months ?? 12
    return trendData.slice(-months)
  }, [trendData, range])

  // Calculate summary
  const summary = useMemo(() => {
    if (displayData.length === 0) return { current: 0, change: 0, isPositive: true }
    const current = displayData[displayData.length - 1].netWorth
    const start = displayData[0].netWorth
    const change = current - start
    return { current, change, isPositive: change >= 0 }
  }, [displayData])

  const handleClose = useCallback(() => {
    router.back()
  }, [])

  const handleRangeChange = useCallback((newRange: RangeKey) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setRange(newRange)
  }, [])

  return (
    <Screen
      edges={[]}
      padded={false}
      topPadding={false}
      style={{ flex: 1 }}
      contentStyle={{ flex: 1 }}
    >
      {/* Drag Handle */}
      <View style={modalStyles.dragHandleContainer}>
        <View style={[modalStyles.dragHandle, { backgroundColor: semantic.border }]} />
      </View>

      {/* Header */}
      <View style={[modalStyles.header, { justifyContent: 'space-between' }]}>
        <Pressable onPress={handleClose} hitSlop={12} style={modalStyles.cancelButton}>
          <Text style={[modalStyles.cancelText, { color: semantic.textSecondary }]}>Close</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: semantic.text }]}>Net Worth History</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Header Divider */}
      <View style={{ height: 1, backgroundColor: semantic.border }} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Range Pills */}
        <View style={styles.rangePills}>
          {RANGE_OPTIONS.map(option => (
            <Pressable
              key={option.key}
              onPress={() => handleRangeChange(option.key)}
              style={[
                styles.rangePill,
                { backgroundColor: range === option.key ? semantic.text : semantic.surfaceAlt },
              ]}
            >
              <Text style={[
                styles.rangePillText,
                { color: range === option.key ? semantic.surface : semantic.textSecondary },
              ]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Chart Card */}
        <View style={[styles.chartCard, { backgroundColor: semantic.surfaceAlt }]}>
          {/* Summary */}
          <View style={styles.chartSummary}>
            <View>
              <Text style={[styles.chartValue, { color: semantic.text }]}>
                {formatUsdInt(summary.current)}
              </Text>
              <Text style={[
                styles.chartChange,
                { color: summary.isPositive ? semantic.success : semantic.danger }
              ]}>
                {summary.isPositive ? '+' : ''}{formatUsdInt(summary.change)}
              </Text>
            </View>
            <Text style={[styles.chartRangeLabel, { color: semantic.textSecondary }]}>
              vs {formatYearMonth(displayData[0]?.yearMonth ?? '')}
            </Text>
          </View>

          {/* Chart */}
          <TrendChart
            data={displayData}
            colors={{
              text: semantic.text,
              textSecondary: semantic.textSecondary,
              border: semantic.border,
              success: semantic.success,
              danger: semantic.danger,
              primary: semantic.primary,
            }}
          />
        </View>
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    minWidth: 50,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  rangePills: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  rangePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  rangePillText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  chartCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  chartSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  chartValue: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    fontVariant: ['tabular-nums'],
  },
  chartChange: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.xs,
  },
  chartRangeLabel: {
    fontSize: fontSize.sm,
  },
  chartContainer: {
    height: 140,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  chartLabel: {
    fontSize: fontSize.xs,
  },
  chartEmpty: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartEmptyText: {
    fontSize: fontSize.sm,
  },
})
