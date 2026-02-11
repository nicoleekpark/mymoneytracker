import React, { useCallback, useMemo, useState } from 'react'
import { LayoutChangeEvent, Pressable, Text, View } from 'react-native'
import { LineChart } from 'react-native-gifted-charts'

import { formatUsdInt } from '@/shared/format/currency'
import { fontSize } from '@/theme/tokens/typography'
import { radius } from '@/theme/tokens/radius'
import type { CumulativeNetData } from '@/domain/transaction/transaction.usecase'

type Colors = {
  text: string
  textSecondary: string
  surface: string
  surfaceAlt: string
  success: string
  danger: string
}

type Props = {
  data: CumulativeNetData[]
  colors: Colors
}

type ChartDataItem = {
  value: number
  label: string
  labelTextStyle: { color: string; fontSize: number }
  month: string // YYYY-MM for lookup
  netDollar: number // monthly net (not cumulative)
}

type SelectedPoint = {
  month: string
  cumulative: number
  net: number
} | null

type PeriodKey = '1M' | '3M' | '6M' | '1Y' | 'YTD' | 'ALL'

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: '1M', label: '1M' },
  { key: '3M', label: '3M' },
  { key: '6M', label: '6M' },
  { key: '1Y', label: '1Y' },
  { key: 'YTD', label: String(new Date().getFullYear()) },
  { key: 'ALL', label: 'ALL' }
]

function formatShortMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-')
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthIndex = parseInt(month, 10) - 1
  return `${monthNames[monthIndex]} '${year.slice(2)}`
}

function formatFullMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-')
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const monthIndex = parseInt(month, 10) - 1
  return `${monthNames[monthIndex]} ${year}`
}

function formatCompactAmount(amount: number): string {
  const abs = Math.abs(amount)
  if (abs >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  }
  if (abs >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`
  }
  return `$${Math.round(amount)}`
}

function filterDataByPeriod(data: CumulativeNetData[], period: PeriodKey): CumulativeNetData[] {
  if (data.length === 0) return []
  if (period === 'ALL') return data

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  let cutoffDate: Date

  switch (period) {
    case '1M':
      cutoffDate = new Date(currentYear, currentMonth - 2, 1) // 1 month back
      break
    case '3M':
      cutoffDate = new Date(currentYear, currentMonth - 4, 1) // 3 months back
      break
    case '6M':
      cutoffDate = new Date(currentYear, currentMonth - 7, 1) // 6 months back
      break
    case '1Y':
      cutoffDate = new Date(currentYear - 1, currentMonth - 1, 1) // 12 months back
      break
    case 'YTD':
      cutoffDate = new Date(currentYear, 0, 1) // Start of current year
      break
    default:
      return data
  }

  const cutoffStr = `${cutoffDate.getFullYear()}-${String(cutoffDate.getMonth() + 1).padStart(2, '0')}`

  return data.filter(d => d.month >= cutoffStr)
}

// Format label based on period and data length
function formatLabelForPeriod(monthStr: string, period: PeriodKey, index: number, total: number): string {
  const [year, month] = monthStr.split('-')
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthIndex = parseInt(month, 10) - 1
  const monthName = monthNames[monthIndex]

  // For short periods, show all labels
  if (period === '1M' || period === '3M') {
    return monthName
  }

  // For medium periods, show every other or first/last
  if (period === '6M' || period === 'YTD') {
    if (total <= 6) return monthName
    // Show first, middle, last
    if (index === 0 || index === total - 1 || index === Math.floor(total / 2)) {
      return monthName
    }
    return ''
  }

  // For 1Y, show quarters
  if (period === '1Y') {
    if (total <= 6) return monthName
    // Show every 3rd month or first/last
    if (index === 0 || index === total - 1 || index % 3 === 0) {
      return monthName
    }
    return ''
  }

  // For ALL, show years
  if (period === 'ALL') {
    // Show first of each year or first/last
    if (index === 0 || index === total - 1) {
      return `${monthName} '${year.slice(2)}`
    }
    // Check if this is January (first month of year)
    if (monthIndex === 0) {
      return `'${year.slice(2)}`
    }
    return ''
  }

  return ''
}

export function CumulativeNetChart({ data, colors }: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>('ALL')
  const [selectedPoint, setSelectedPoint] = useState<SelectedPoint>(null)
  const [chartWidth, setChartWidth] = useState(280)

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    // Account for y-axis label width (50) and padding
    const availableWidth = e.nativeEvent.layout.width - 60
    setChartWidth(Math.max(200, availableWidth))
  }, [])

  // Filter data based on selected period
  const filteredData = useMemo(() => {
    return filterDataByPeriod(data, selectedPeriod)
  }, [data, selectedPeriod])

  const chartData = useMemo((): ChartDataItem[] => {
    if (filteredData.length === 0) return []

    // Sample data based on period
    let maxPoints: number
    switch (selectedPeriod) {
      case '1M':
        maxPoints = 2 // Show both months
        break
      case '3M':
        maxPoints = 4
        break
      case '6M':
        maxPoints = 7
        break
      case 'YTD':
      case '1Y':
        maxPoints = 12
        break
      case 'ALL':
      default:
        maxPoints = 24
        break
    }

    const step = filteredData.length > maxPoints ? Math.ceil(filteredData.length / maxPoints) : 1
    const sampled = filteredData.filter((_, i) => i % step === 0 || i === filteredData.length - 1)

    return sampled.map((d, i) => ({
      value: d.cumulativeDollar,
      label: formatLabelForPeriod(d.month, selectedPeriod, i, sampled.length),
      labelTextStyle: { color: colors.textSecondary, fontSize: fontSize.xs },
      month: d.month,
      netDollar: d.netDollar
    }))
  }, [filteredData, selectedPeriod, colors.textSecondary])

  // Calculate change for selected period
  const periodChange = useMemo(() => {
    if (filteredData.length < 2) return null
    const startValue = filteredData[0].cumulativeDollar - filteredData[0].netDollar // value before first month
    const endValue = filteredData[filteredData.length - 1].cumulativeDollar
    const change = endValue - startValue
    return change
  }, [filteredData])

  const lastValue = filteredData.length > 0 ? filteredData[filteredData.length - 1].cumulativeDollar : 0
  const isPositive = lastValue >= 0
  const changeIsPositive = periodChange !== null ? periodChange >= 0 : true

  if (data.length === 0) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 40 }}>
        <Text style={{ color: colors.textSecondary }}>No data yet</Text>
      </View>
    )
  }

  // Calculate Y axis range
  const values = chartData.map(d => d.value)
  const minValue = Math.min(...values, 0)
  const maxValue = Math.max(...values)
  const range = maxValue - minValue
  const yAxisOffset = minValue < 0 ? Math.abs(minValue) : 0

  return (
    <View onLayout={handleLayout}>
      {/* Header: Total + Period change OR Selected point details */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, minHeight: 48 }}>
        {selectedPoint ? (
          /* Fixed position details when a point is selected */
          <>
            <View>
              <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: 2 }}>
                {formatFullMonth(selectedPoint.month)}
              </Text>
              <Text style={{ fontSize: fontSize['2xl'], fontWeight: '800', color: selectedPoint.cumulative >= 0 ? colors.success : colors.danger }}>
                {formatUsdInt(selectedPoint.cumulative)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: 2 }}>
                Month net
              </Text>
              <Text style={{ fontSize: fontSize.md, fontWeight: '700', color: selectedPoint.net >= 0 ? colors.success : colors.danger }}>
                {selectedPoint.net >= 0 ? '+' : ''}{formatUsdInt(selectedPoint.net)}
              </Text>
            </View>
          </>
        ) : (
          /* Default: Total + Period change */
          <>
            <View>
              <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: 2 }}>
                Cumulative Net
              </Text>
              <Text style={{ fontSize: fontSize['2xl'], fontWeight: '800', color: isPositive ? colors.success : colors.danger }}>
                {formatUsdInt(lastValue)}
              </Text>
            </View>
            {periodChange !== null && selectedPeriod !== 'ALL' && (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: 2 }}>
                  {PERIODS.find(p => p.key === selectedPeriod)?.label ?? selectedPeriod}
                </Text>
                <Text style={{ fontSize: fontSize.md, fontWeight: '700', color: changeIsPositive ? colors.success : colors.danger }}>
                  {changeIsPositive ? '+' : ''}{formatUsdInt(periodChange)}
                </Text>
              </View>
            )}
          </>
        )}
      </View>

      <LineChart
        data={chartData}
        width={chartWidth}
        height={160}
        color={changeIsPositive ? colors.success : colors.danger}
        thickness={2}
        hideDataPoints
        hideRules
        yAxisColor="transparent"
        xAxisColor={colors.surfaceAlt}
        yAxisTextStyle={{ color: colors.textSecondary, fontSize: fontSize.xs }}
        yAxisLabelWidth={50}
        formatYLabel={(val) => formatCompactAmount(Number(val))}
        noOfSections={4}
        maxValue={maxValue + range * 0.1}
        yAxisOffset={yAxisOffset}
        curved
        areaChart
        startFillColor={changeIsPositive ? colors.success : colors.danger}
        endFillColor={changeIsPositive ? `${colors.success}10` : `${colors.danger}10`}
        startOpacity={0.3}
        endOpacity={0.05}
        initialSpacing={16}
        endSpacing={24}
        adjustToWidth
        xAxisLabelTextStyle={{ fontSize: fontSize.xs }}
        pointerConfig={{
          pointerStripColor: colors.textSecondary,
          pointerStripWidth: 1,
          pointerColor: changeIsPositive ? colors.success : colors.danger,
          radius: 5,
          activatePointersOnLongPress: false,
          autoAdjustPointerLabelPosition: false,
          pointerLabelWidth: 0,
          pointerLabelHeight: 0,
          pointerVanishDelay: 0,
          persistPointer: true,
          pointerEvents: 'auto' as const,
          pointerLabelComponent: (items: ChartDataItem[]) => {
            const item = items[0]
            if (item) {
              // Update fixed position display
              const newPoint = {
                month: item.month,
                cumulative: item.value,
                net: item.netDollar
              }
              // Only update if different to avoid re-render loop
              if (!selectedPoint ||
                  selectedPoint.month !== newPoint.month ||
                  selectedPoint.cumulative !== newPoint.cumulative) {
                setTimeout(() => setSelectedPoint(newPoint), 0)
              }
            }
            return null // No floating label
          }
        }}
        onChartAreaPress={() => {
          // Clear selection when tapping empty area
          setSelectedPoint(null)
        }}
      />

      {/* Hint when not selected */}
      {!selectedPoint && (
        <Text
          style={{
            fontSize: fontSize.xs,
            color: colors.textSecondary,
            textAlign: 'center',
            marginTop: 8
          }}
        >
          Tap chart to explore months
        </Text>
      )}

      {/* Period selector tabs - Robinhood style */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 4,
          marginTop: 12
        }}
      >
        {PERIODS.map(({ key, label }) => {
          const isSelected = selectedPeriod === key
          return (
            <Pressable
              key={key}
              onPress={() => {
                setSelectedPeriod(key)
                setSelectedPoint(null) // Clear selection on period change
              }}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: radius.xl,
                backgroundColor: isSelected ? colors.surfaceAlt : 'transparent'
              }}
            >
              <Text
                style={{
                  fontSize: fontSize.xs,
                  fontWeight: isSelected ? '700' : '500',
                  color: isSelected ? colors.text : colors.textSecondary
                }}
              >
                {label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
