import React, { useCallback, useMemo, useState } from 'react'
import { LayoutChangeEvent, Pressable, Text, View } from 'react-native'
import Svg, { Path, Line, Circle, Text as SvgText } from 'react-native-svg'

import { formatUsdInt } from '@/shared/format/currency'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import type { CumulativeNetData } from '@/core/services/transaction'

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

type SelectedPoint = {
  month: string
  cumulative: number
  net: number
  index: number
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

const CHART_HEIGHT = 160
const CHART_AREA_HEIGHT = 140
const PADDING_TOP = 16
const PADDING_LEFT = 50
const PADDING_RIGHT = 32 // Extra padding for last label
const LABEL_AREA_HEIGHT = 20

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
      cutoffDate = new Date(currentYear, currentMonth - 2, 1)
      break
    case '3M':
      cutoffDate = new Date(currentYear, currentMonth - 4, 1)
      break
    case '6M':
      cutoffDate = new Date(currentYear, currentMonth - 7, 1)
      break
    case '1Y':
      cutoffDate = new Date(currentYear - 1, currentMonth - 1, 1)
      break
    case 'YTD':
      cutoffDate = new Date(currentYear, 0, 1)
      break
    default:
      return data
  }

  const cutoffStr = `${cutoffDate.getFullYear()}-${String(cutoffDate.getMonth() + 1).padStart(2, '0')}`
  return data.filter(d => d.month >= cutoffStr)
}

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

function formatLabelForPeriod(monthStr: string, period: PeriodKey, index: number, total: number): string {
  const [year, month] = monthStr.split('-')
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthIndex = parseInt(month, 10) - 1
  const monthName = monthNames[monthIndex]

  if (period === '1M' || period === '3M') {
    return monthName
  }

  if (period === '6M' || period === 'YTD') {
    if (total <= 6) return monthName
    if (index === 0 || index === total - 1 || index === Math.floor(total / 2)) {
      return monthName
    }
    return ''
  }

  if (period === '1Y') {
    if (total <= 6) return monthName
    if (index === 0 || index === total - 1 || index % 3 === 0) {
      return monthName
    }
    return ''
  }

  if (period === 'ALL') {
    // Show first, last, and middle point with "Mon 'YY" format
    if (index === 0 || index === total - 1) {
      return `${monthName} '${year.slice(2)}`
    }
    // For longer ranges, show a middle label
    if (total > 6 && index === Math.floor(total / 2)) {
      return `${monthName} '${year.slice(2)}`
    }
    return ''
  }

  return ''
}

export function CumulativeNetChart({ data, colors }: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>('ALL')
  const [selectedPoint, setSelectedPoint] = useState<SelectedPoint>(null)
  const [chartWidth, setChartWidth] = useState(320)

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    setChartWidth(e.nativeEvent.layout.width)
  }, [])

  const filteredData = useMemo(() => {
    return filterDataByPeriod(data, selectedPeriod)
  }, [data, selectedPeriod])

  const sampledData = useMemo(() => {
    if (filteredData.length === 0) return []

    let maxPoints: number
    switch (selectedPeriod) {
      case '1M': maxPoints = 2; break
      case '3M': maxPoints = 4; break
      case '6M': maxPoints = 7; break
      case 'YTD':
      case '1Y': maxPoints = 12; break
      case 'ALL':
      default: maxPoints = 24; break
    }

    const step = filteredData.length > maxPoints ? Math.ceil(filteredData.length / maxPoints) : 1
    return filteredData.filter((_, i) => i % step === 0 || i === filteredData.length - 1)
  }, [filteredData, selectedPeriod])

  const periodChange = useMemo(() => {
    if (filteredData.length < 2) return null
    const startValue = filteredData[0].cumulativeDollar - filteredData[0].netDollar
    const endValue = filteredData[filteredData.length - 1].cumulativeDollar
    return endValue - startValue
  }, [filteredData])

  const { points, linePath, areaPath, yAxisLabels } = useMemo(() => {
    if (sampledData.length < 2) {
      return { points: [], linePath: '', areaPath: '', yAxisLabels: [] }
    }

    const values = sampledData.map(d => d.cumulativeDollar)
    const minVal = Math.min(...values, 0)
    const maxVal = Math.max(...values)
    const range = maxVal - minVal || 1
    const paddedMax = maxVal + range * 0.1

    const drawWidth = chartWidth - PADDING_LEFT - PADDING_RIGHT
    const drawHeight = CHART_AREA_HEIGHT - PADDING_TOP - LABEL_AREA_HEIGHT

    const mapY = (val: number) => {
      const normalized = (val - minVal) / (paddedMax - minVal)
      return CHART_AREA_HEIGHT - LABEL_AREA_HEIGHT - normalized * drawHeight
    }

    const pts = sampledData.map((d, i) => ({
      x: PADDING_LEFT + (i / (sampledData.length - 1)) * drawWidth,
      y: mapY(d.cumulativeDollar),
      month: d.month,
      cumulative: d.cumulativeDollar,
      net: d.netDollar
    }))

    const line = generateSmoothPath(pts)
    const area = line + ` L${pts[pts.length - 1].x},${CHART_AREA_HEIGHT - LABEL_AREA_HEIGHT} L${PADDING_LEFT},${CHART_AREA_HEIGHT - LABEL_AREA_HEIGHT} Z`

    // Y-axis labels (4 sections)
    const yLabels = []
    for (let i = 0; i <= 4; i++) {
      const val = minVal + (paddedMax - minVal) * (i / 4)
      const y = mapY(val)
      yLabels.push({ value: val, y })
    }

    return { points: pts, linePath: line, areaPath: area, yAxisLabels: yLabels }
  }, [sampledData, chartWidth])

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

    const pt = points[closestIdx]
    setSelectedPoint(prev =>
      prev?.index === closestIdx ? null : {
        month: pt.month,
        cumulative: pt.cumulative,
        net: pt.net,
        index: closestIdx
      }
    )
  }, [points])

  const lastValue = filteredData.length > 0 ? filteredData[filteredData.length - 1].cumulativeDollar : 0
  const isPositive = lastValue >= 0
  const changeIsPositive = periodChange !== null ? periodChange >= 0 : true
  const lineColor = changeIsPositive ? colors.success : colors.danger

  if (data.length === 0) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 40 }}>
        <Text style={{ color: colors.textSecondary }}>No data yet</Text>
      </View>
    )
  }

  return (
    <View onLayout={handleLayout}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm, minHeight: 48 }}>
        {selectedPoint ? (
          <>
            <View>
              <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: 2 }}>
                {formatFullMonth(selectedPoint.month)}
              </Text>
              <Text style={{ fontSize: fontSize['2xl'], fontWeight: fontWeight.heavy, color: selectedPoint.cumulative >= 0 ? colors.success : colors.danger }}>
                {formatUsdInt(selectedPoint.cumulative)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: 2 }}>
                Month net
              </Text>
              <Text style={{ fontSize: fontSize.md, fontWeight: fontWeight.bold, color: selectedPoint.net >= 0 ? colors.success : colors.danger }}>
                {selectedPoint.net >= 0 ? '+' : '-'}{formatUsdInt(Math.abs(selectedPoint.net))}
              </Text>
            </View>
          </>
        ) : (
          <>
            <View>
              <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: 2 }}>
                Cumulative Savings
              </Text>
              <Text style={{ fontSize: fontSize['2xl'], fontWeight: fontWeight.heavy, color: isPositive ? colors.success : colors.danger }}>
                {formatUsdInt(lastValue)}
              </Text>
            </View>
            {periodChange !== null && selectedPeriod !== 'ALL' && (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: 2 }}>
                  {PERIODS.find(p => p.key === selectedPeriod)?.label ?? selectedPeriod}
                </Text>
                <Text style={{ fontSize: fontSize.md, fontWeight: fontWeight.bold, color: changeIsPositive ? colors.success : colors.danger }}>
                  {changeIsPositive ? '+' : ''}{formatUsdInt(periodChange)}
                </Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* Chart */}
      <Pressable onPress={handlePress}>
          <Svg width={chartWidth} height={CHART_HEIGHT} viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}>
            {/* Y-axis labels */}
            {yAxisLabels.map((label, i) => (
              <SvgText
                key={i}
                x={PADDING_LEFT - 8}
                y={label.y + 4}
                fill={colors.textSecondary}
                fontSize={10}
                fontWeight={fontWeight.medium}
                textAnchor="end"
              >
                {formatCompactAmount(label.value)}
              </SvgText>
            ))}

            {/* X-axis line */}
            <Line
              x1={PADDING_LEFT}
              y1={CHART_AREA_HEIGHT - LABEL_AREA_HEIGHT}
              x2={chartWidth - PADDING_RIGHT}
              y2={CHART_AREA_HEIGHT - LABEL_AREA_HEIGHT}
              stroke={colors.surfaceAlt}
              strokeWidth={1}
            />

            {/* Area fill */}
            {areaPath && (
              <Path
                d={areaPath}
                fill={lineColor}
                opacity={0.15}
              />
            )}

            {/* Line */}
            {linePath && (
              <Path
                d={linePath}
                stroke={lineColor}
                strokeWidth={2}
                fill="none"
              />
            )}

            {/* X-axis labels */}
            {points.map((pt, i) => {
              const label = formatLabelForPeriod(pt.month, selectedPeriod, i, points.length)
              if (!label) return null
              // Adjust text anchor: first label left-aligned, last label right-aligned, others centered
              const isFirst = i === 0
              const isLast = i === points.length - 1
              const textAnchor = isFirst ? 'start' : isLast ? 'end' : 'middle'
              return (
                <SvgText
                  key={i}
                  x={pt.x}
                  y={CHART_HEIGHT - 4}
                  fill={colors.textSecondary}
                  fontSize={10}
                  fontWeight={fontWeight.medium}
                  textAnchor={textAnchor}
                >
                  {label}
                </SvgText>
              )
            })}

            {/* Selected point */}
            {selectedPoint && points[selectedPoint.index] && (
              <>
                <Line
                  x1={points[selectedPoint.index].x}
                  y1={points[selectedPoint.index].y}
                  x2={points[selectedPoint.index].x}
                  y2={CHART_AREA_HEIGHT - LABEL_AREA_HEIGHT}
                  stroke={colors.textSecondary}
                  strokeWidth={1}
                  opacity={0.5}
                />
                <Circle
                  cx={points[selectedPoint.index].x}
                  cy={points[selectedPoint.index].y}
                  r={5}
                  fill={lineColor}
                  stroke={colors.surface}
                  strokeWidth={2}
                />
              </>
            )}
          </Svg>
      </Pressable>

      {/* Hint */}
      {!selectedPoint && (
        <Text
          style={{
            fontSize: fontSize.xs,
            color: colors.textSecondary,
            textAlign: 'center',
            marginTop: spacing.sm
          }}
        >
          Tap chart to explore months
        </Text>
      )}

      {/* Period selector */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: spacing.xs,
          marginTop: spacing.md
        }}
      >
        {PERIODS.map(({ key, label }) => {
          const isSelected = selectedPeriod === key
          return (
            <Pressable
              key={key}
              onPress={() => {
                setSelectedPeriod(key)
                setSelectedPoint(null)
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
                  fontWeight: isSelected ? fontWeight.bold : fontWeight.medium,
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
