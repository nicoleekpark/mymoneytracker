import React, { useMemo } from 'react'
import { Pressable, Text, View } from 'react-native'

import { AccordionCard } from '@/shared/components'
import type { CalendarColors } from '../calendar'
import { MonthlyCategoryDonut } from './MonthlyCategoryDonut'
import { buildCategorySlices, formatUsdInt, type CategorySlice } from './category.utils'
import { useMonthlyCategorySpending } from './useMonthlyCategorySpending'

type AccordionColors = {
  text: string
  textSecondary: string
  surface: string
  surfaceAlt: string
  border: string
}

type SectionProps = Readonly<{
  monthYYYYMM: string
  colors: CalendarColors
  onPressCategory?: (colorKey: string) => void
}>

type ContentProps = Readonly<{
  monthYYYYMM: string
  colors: CalendarColors
  accordionColors: AccordionColors
  onPressCategory?: (colorKey: string) => void
}>

/**
 * Standalone card version (legacy)
 */
export function MonthlyCategorySection(props: SectionProps) {
  const { monthYYYYMM, colors } = props
  const { loading, error, totalSpentDollar, rows } = useMonthlyCategorySpending(monthYYYYMM)
  const slices = useMemo(() => buildSlices(totalSpentDollar, rows, colors.border), [totalSpentDollar, rows, colors.border])
  const hasData = slices.length > 0

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 16,
        gap: 16
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text, letterSpacing: 0.2 }}>
          Spending by Category
        </Text>
        {hasData && (
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.danger }}>
            {formatUsdInt(totalSpentDollar)}
          </Text>
        )}
      </View>

      {loading && <Text style={{ color: colors.text, opacity: 0.7 }}>Loading...</Text>}
      {error && <Text style={{ color: colors.danger }}>{error}</Text>}

      {hasData ? (
        <>
          <MonthlyCategoryDonut
            totalSpentDollar={totalSpentDollar}
            slices={slices}
            colors={{ text: colors.text, mutedText: colors.textMuted, track: colors.surfaceAlt }}
          />
          <CategoryList slices={slices} colors={colors} onPress={props.onPressCategory} />
        </>
      ) : !loading && !error ? (
        <Text style={{ color: colors.text, opacity: 0.7, textAlign: 'center' }}>No spending yet</Text>
      ) : null}
    </View>
  )
}

/**
 * Accordion version for progressive disclosure
 */
export function MonthlyCategoryContent(props: ContentProps) {
  const { monthYYYYMM, colors, accordionColors } = props
  const { loading, error, totalSpentDollar, rows } = useMonthlyCategorySpending(monthYYYYMM)
  const slices = useMemo(() => buildSlices(totalSpentDollar, rows, colors.border), [totalSpentDollar, rows, colors.border])
  const hasData = slices.length > 0
  const topCategory = slices[0]

  return (
    <AccordionCard
      title="Spending by Category"
      colors={accordionColors}
      defaultExpanded={false}
      headerRight={
        hasData ? (
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.danger, marginLeft: 'auto' }}>
            {formatUsdInt(totalSpentDollar)}
          </Text>
        ) : null
      }
      summary={
        hasData ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 2, backgroundColor: colors.surfaceAlt, borderRadius: 10, padding: 10 }}>
              <Text style={{ fontSize: 9, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', marginBottom: 4 }}>
                Top Category
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: topCategory?.color }} />
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>
                  {topCategory?.label}
                </Text>
                <Text style={{ fontSize: 11, color: colors.textMuted }}>
                  {Math.round((topCategory?.percent || 0) * 100)}%
                </Text>
              </View>
            </View>
            <View style={{ flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: 10, padding: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 9, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', marginBottom: 4 }}>
                Categories
              </Text>
              <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>
                {slices.length}
              </Text>
            </View>
          </View>
        ) : (
          <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: 10, padding: 10 }}>
            <Text style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center' }}>
              {loading ? 'Loading...' : 'No spending yet'}
            </Text>
          </View>
        )
      }
    >
      {loading && <Text style={{ color: colors.text, opacity: 0.7 }}>Loading...</Text>}
      {error && <Text style={{ color: colors.danger }}>{error}</Text>}

      {hasData && (
        <View style={{ gap: 16 }}>
          <MonthlyCategoryDonut
            totalSpentDollar={totalSpentDollar}
            slices={slices}
            colors={{ text: colors.text, mutedText: colors.textMuted, track: colors.surfaceAlt }}
          />
          <CategoryList slices={slices} colors={colors} onPress={props.onPressCategory} />
        </View>
      )}
    </AccordionCard>
  )
}

// Helper to build slices
function buildSlices(
  totalSpentDollar: number,
  rows: ReadonlyArray<{ categoryId: string | null; categoryRef?: any; totalDollar: number }>,
  borderColor: string
) {
  return buildCategorySlices({
    totalSpentDollar,
    rows: rows.map((r) => ({
      categoryId: r.categoryId ?? null,
      categoryRef: r.categoryRef,
      totalDollar: r.totalDollar
    })),
    topN: 5,
    colors: {
      palette: ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F', '#EDC948', '#B07AA1', '#FF9DA7', '#9C755F', '#BAB0AC'],
      others: borderColor
    }
  })
}

// Category list component
function CategoryList({ slices, colors, onPress }: { slices: CategorySlice[]; colors: CalendarColors; onPress?: (key: string) => void }) {
  return (
    <View>
      {slices.map((s, idx) => (
        <View
          key={s.reactKey}
          style={idx < slices.length - 1 ? { borderBottomWidth: 1, borderBottomColor: colors.border } : undefined}
        >
          <Pressable
            onPress={() => onPress?.(s.colorKey)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 }}
          >
            <View style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: s.color }} />
            <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: colors.text }} numberOfLines={1}>
              {s.label}
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text }}>
              {formatUsdInt(s.totalDollar)}
            </Text>
            <Text style={{ width: 40, textAlign: 'right', fontSize: 11, fontWeight: '600', color: colors.textMuted }}>
              {Math.round(s.percent * 100)}%
            </Text>
          </Pressable>
        </View>
      ))}
    </View>
  )
}
