import { Header, Stack } from '@/shared/components'
import React, { useMemo } from 'react'
import { Pressable, Text, View } from 'react-native'

import type { CalendarColors } from '../calendar'
import { MonthlyCategoryDonut } from './MonthlyCategoryDonut'
import { buildCategorySlices, formatUsdInt, type CategorySlice } from './category.utils'
import { useMonthlyCategorySpending } from './useMonthlyCategorySpending'

type SectionProps = Readonly<{
  monthYYYYMM: string
  colors: CalendarColors
  onPressCategory?: (colorKey: string) => void // future drilldown
}>

export function MonthlyCategorySection(props: SectionProps) {
  const { monthYYYYMM, colors } = props

  const { loading, error, totalSpentDollar, rows } = useMonthlyCategorySpending(monthYYYYMM)

  const slices = useMemo(() => {
    return buildCategorySlices({
      totalSpentDollar,
      rows: rows.map((r) => ({
        categoryId: r.categoryId ?? null,
        categoryRef: r.categoryRef,
        totalDollar: r.totalDollar
      })),
      topN: 5,
      colors: {
        palette: [
          '#4E79A7',
          '#F28E2B',
          '#E15759',
          '#76B7B2',
          '#59A14F',
          '#EDC948',
          '#B07AA1',
          '#FF9DA7',
          '#9C755F',
          '#BAB0AC'
        ],
        others: colors.border
      }
    })
  }, [totalSpentDollar, rows, colors.border])

  const hasData = slices.length > 0

  return (
    <Stack gap="xl">
      <Header variant="section" align="center">Monthly Spending by Category</Header>

      {loading ? <Text style={{ color: colors.text, opacity: 0.7 }}>Loading</Text> : null}
      {error ? <Text style={{ color: colors.text, opacity: 0.7 }}>{error}</Text> : null}

      {hasData ? (
        <>
          <MonthlyCategoryDonut
            totalSpentDollar={totalSpentDollar}
            slices={slices}
            colors={{
              text: colors.text,
              mutedText: colors.text,
              track: colors.surfaceAlt
            }}
          />

          <Stack gap="sm">
            {slices.map((s) => (
              <CategoryRow
                key={s.reactKey}
                slice={s}
                colors={colors}
                onPress={() => props.onPressCategory?.(s.colorKey)}
              />
            ))}
          </Stack>
        </>
      ) : !loading && !error ? (
        <Text style={{ color: colors.text, opacity: 0.7 }}>No spending yet</Text>
      ) : null}
    </Stack>
  )
}

function pct(p: number) {
  const v = Math.round(p * 100)
  return `${v}%`
}

function CategoryRow(props: {
  slice: CategorySlice
  colors: CalendarColors
  onPress?: () => void
}) {
  const { slice, colors, onPress } = props

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        backgroundColor: colors.surface
      }}
      accessibilityRole="button"
      accessibilityLabel={`${slice.label} ${formatUsdInt(slice.totalDollar)} ${pct(slice.percent)}`}
    >
      <View style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: slice.color }} />

      <Text style={{ flex: 1, fontSize: 13, fontWeight: '800', color: colors.text }} numberOfLines={1}>
        {slice.label}
      </Text>

      <Text style={{ width: 80, textAlign: 'right', fontSize: 13, fontWeight: '900', color: colors.text }}>
        {formatUsdInt(slice.totalDollar)}
      </Text>

      <Text style={{ width: 46, textAlign: 'right', fontSize: 12, fontWeight: '800', opacity: 0.7, color: colors.text }}>
        {pct(slice.percent)}
      </Text>
    </Pressable>
  )
}
