import React from 'react'
import { View, Text } from 'react-native'
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg'

import type { InsightsColors } from '../insights.types'

type DataPoint = {
  month: string // YYYY-MM
  net: number
}

type Props = {
  data: DataPoint[]
  baseline?: number
  colors: InsightsColors
}

/**
 * Mini sparkline showing 6-month net trend
 * - Shows month/year labels
 * - Shows baseline as dashed line with label
 * - Current month highlighted with value
 */
export function NetSparkline({ data, baseline, colors }: Props) {
  if (data.length < 2) return null

  const width = 280
  const height = 70
  const paddingX = 8
  const paddingY = 16

  // Calculate bounds
  const values = data.map(d => d.net)
  const allValues = baseline !== undefined ? [...values, baseline] : values
  const minVal = Math.min(...allValues)
  const maxVal = Math.max(...allValues)
  const range = maxVal - minVal || 1

  // Scale functions
  const scaleX = (i: number) => paddingX + (i / (data.length - 1)) * (width - paddingX * 2)
  const scaleY = (val: number) => paddingY + (1 - (val - minVal) / range) * (height - paddingY * 2)

  // Build path
  const points = data.map((d, i) => ({ x: scaleX(i), y: scaleY(d.net) }))
  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')

  // Current month point (last)
  const currentPoint = points[points.length - 1]
  const currentNet = data[data.length - 1].net
  const currentColor = currentNet >= 0 ? colors.success : colors.danger

  // Baseline Y position
  const baselineY = baseline !== undefined ? scaleY(baseline) : null

  // Format current net for display
  const formatNet = (val: number) => {
    const absVal = Math.abs(val)
    if (absVal >= 1000) {
      return `${val >= 0 ? '+' : '-'}$${(absVal / 1000).toFixed(1)}k`
    }
    return `${val >= 0 ? '+' : '-'}$${absVal}`
  }

  return (
    <View style={{ alignItems: 'center' }}>
      {/* Current value display */}
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: currentColor }}>
          {formatNet(currentNet)}
        </Text>
        <Text style={{ fontSize: 11, color: colors.textMuted, marginLeft: 4 }}>
          this month
        </Text>
      </View>

      <Svg width={width} height={height}>
        {/* Baseline dashed line */}
        {baselineY !== null && (
          <>
            <Line
              x1={paddingX}
              y1={baselineY}
              x2={width - paddingX}
              y2={baselineY}
              stroke={colors.textMuted}
              strokeWidth={1}
              strokeDasharray="4,4"
              opacity={0.4}
            />
            <SvgText
              x={width - paddingX}
              y={baselineY - 4}
              fontSize={9}
              fill={colors.textMuted}
              textAnchor="end"
              opacity={0.6}
            >
              avg
            </SvgText>
          </>
        )}

        {/* Trend line */}
        <Path
          d={pathD}
          stroke={colors.textMuted}
          strokeWidth={2}
          fill="none"
          opacity={0.6}
        />

        {/* Current month dot */}
        <Circle
          cx={currentPoint.x}
          cy={currentPoint.y}
          r={5}
          fill={currentColor}
        />
      </Svg>

      {/* Labels with year */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: width - paddingX * 2, marginTop: 4 }}>
        <Text style={{ fontSize: 10, color: colors.textMuted }}>
          {formatMonthLabel(data[0].month)}
        </Text>
        <Text style={{ fontSize: 10, color: colors.textMuted }}>
          {formatMonthLabel(data[data.length - 1].month)}
        </Text>
      </View>
    </View>
  )
}

function formatMonthLabel(yyyymm: string): string {
  const [y, m] = yyyymm.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthName = months[parseInt(m, 10) - 1] || ''
  const yearShort = y.slice(2) // '2024' -> '24'
  return `${monthName} '${yearShort}`
}
