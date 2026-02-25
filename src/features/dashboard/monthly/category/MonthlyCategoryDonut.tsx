import React, { useMemo } from 'react'
import { Text, View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'

import { fontSize, fontWeight } from '@/theme/tokens/typography'

import type { CategorySlice } from './category.utils'
import { formatUsdInt } from './category.utils'

export type DonutColors = Readonly<{
  text: string
  mutedText: string
  track: string
}>

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x))
}

export function MonthlyCategoryDonut(props: {
  size?: number
  thickness?: number
  totalSpentDollar: number
  slices: CategorySlice[]
  colors: DonutColors
}) {
  const size = props.size ?? 180
  const thickness = props.thickness ?? 16

  const r = (size - thickness) / 2
  const c = size / 2
  const circumference = 2 * Math.PI * r

  const normalized = useMemo(() => {
    const xs = (props.slices ?? []).filter((s) => s.percent > 0)
    // ✅ debug는 이렇게 (normalized 참조 금지)
    // console.log(xs.map((x) => x.reactKey))
    const sum = xs.reduce((a, s) => a + s.percent, 0)
    if (sum <= 0) return []
    return xs.map((s) => ({ ...s, percent: clamp01(s.percent / sum) }))
  }, [props.slices])

  // Start at 12 o'clock (calendar feel)
  const rotation = -90

  let offset = 0

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size}>
          {/* track */}
          <Circle cx={c} cy={c} r={r} stroke={props.colors.track} strokeWidth={thickness} fill="transparent" />

          {normalized.map((s) => {
            const dash = circumference * s.percent
            const gap = circumference - dash
            const dashArray = `${dash} ${gap}`

            const el = (
              <Circle
                key={s.reactKey} // ✅ unique key
                cx={c}
                cy={c}
                r={r}
                stroke={s.color}
                strokeWidth={thickness}
                fill="transparent"
                strokeDasharray={dashArray}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
                rotation={rotation}
                originX={c}
                originY={c}
              />
            )

            offset += dash
            return el
          })}
        </Svg>

        {/* center label */}
        <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }}>
          <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.heavy, color: props.colors.mutedText }}>Total Spent</Text>
          <Text style={{ fontSize: fontSize.xl, fontWeight: fontWeight.heavy, color: props.colors.text }}>
            {formatUsdInt(props.totalSpentDollar)}
          </Text>
        </View>
      </View>
    </View>
  )
}
