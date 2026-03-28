import React, { useCallback, useMemo, useState } from 'react'
import { LayoutChangeEvent, Text, View } from 'react-native'
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg'

import { fontWeight } from '@/shared/theme/tokens/typography'
import type { YearlyFlowDollar } from '@/core/services/transaction'

type Colors = {
  text: string
  textSecondary: string
  surface: string
  surfaceAlt: string
  success: string
  danger: string
}

type Props = {
  data: YearlyFlowDollar[]
  colors: Colors
}

const CHART_HEIGHT = 180
const PADDING_TOP = 32
const PADDING_BOTTOM = 24
const PADDING_LEFT = 50
const PADDING_RIGHT = 16
const BAR_RADIUS = 4
const MIN_BAR_HEIGHT = 8

function formatCompactAmount(amount: number): string {
  const abs = Math.abs(amount)
  if (abs >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  }
  if (abs >= 1000) {
    return `$${Math.round(amount / 1000)}K`
  }
  return `$${Math.round(amount)}`
}

export function YearlyNetChart({ data, colors }: Props) {
  const [chartWidth, setChartWidth] = useState(320)
  const currentYear = new Date().getFullYear()

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    setChartWidth(e.nativeEvent.layout.width)
  }, [])

  const { bars, yAxisLabels, axisY } = useMemo(() => {
    if (data.length === 0) {
      return { bars: [], yAxisLabels: [], axisY: CHART_HEIGHT - PADDING_BOTTOM }
    }

    const netValues = data.map(d => d.incomeDollar - d.expenseDollar)
    const maxAbs = Math.max(...netValues.map(Math.abs), 1)
    const paddedMax = maxAbs * 1.3

    const drawWidth = chartWidth - PADDING_LEFT - PADDING_RIGHT
    const drawHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM

    const barCount = data.length
    const barWidth = Math.min(40, (drawWidth - (barCount - 1) * 16) / barCount)
    const totalBarsWidth = barCount * barWidth + (barCount - 1) * 16
    const startX = PADDING_LEFT + (drawWidth - totalBarsWidth) / 2

    const baseline = CHART_HEIGHT - PADDING_BOTTOM

    const barData = data.map((d, i) => {
      const net = d.incomeDollar - d.expenseDollar
      const isPositive = net >= 0
      const isCurrentYear = d.year === currentYear

      const heightRatio = Math.abs(net) / paddedMax
      const barHeight = Math.max(MIN_BAR_HEIGHT, heightRatio * drawHeight)

      const x = startX + i * (barWidth + 16)
      const y = isPositive ? baseline - barHeight : baseline

      return {
        x,
        y,
        width: barWidth,
        height: barHeight,
        color: isPositive ? colors.success : colors.danger,
        net,
        year: d.year,
        isCurrentYear,
        labelY: isPositive ? y - 8 : y + barHeight + 14
      }
    })

    // Y-axis labels
    const yLabels = []
    for (let i = 0; i <= 4; i++) {
      const val = paddedMax * (i / 4)
      const y = baseline - (val / paddedMax) * drawHeight
      yLabels.push({ value: val, y })
    }

    return { bars: barData, yAxisLabels: yLabels, axisY: baseline }
  }, [data, chartWidth, colors, currentYear])

  if (data.length === 0) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 40 }}>
        <Text style={{ color: colors.textSecondary }}>No data yet</Text>
      </View>
    )
  }

  return (
    <View onLayout={handleLayout}>
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
          y1={axisY}
          x2={chartWidth - PADDING_RIGHT}
          y2={axisY}
          stroke={colors.surfaceAlt}
          strokeWidth={1}
        />

        {/* Bars */}
        {bars.map((bar, i) => (
          <React.Fragment key={i}>
            <Rect
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              rx={BAR_RADIUS}
              fill={bar.color}
            />
            {/* Value label above/below bar */}
            <SvgText
              x={bar.x + bar.width / 2}
              y={bar.net >= 0 ? bar.y - 4 : bar.y + bar.height + 12}
              fill={bar.color}
              fontSize={10}
              fontWeight={fontWeight.bold}
              textAnchor="middle"
            >
              {bar.net >= 0 ? '+' : ''}{formatCompactAmount(bar.net)}
            </SvgText>
            {/* YTD indicator */}
            {bar.isCurrentYear && (
              <SvgText
                x={bar.x + bar.width / 2}
                y={bar.net >= 0 ? bar.y - 16 : bar.y + bar.height + 24}
                fill={colors.textSecondary}
                fontSize={9}
                textAnchor="middle"
              >
                (YTD)
              </SvgText>
            )}
            {/* Year label */}
            <SvgText
              x={bar.x + bar.width / 2}
              y={CHART_HEIGHT - 6}
              fill={colors.textSecondary}
              fontSize={10}
              fontWeight={fontWeight.medium}
              textAnchor="middle"
            >
              {bar.year}
            </SvgText>
          </React.Fragment>
        ))}
      </Svg>
    </View>
  )
}
