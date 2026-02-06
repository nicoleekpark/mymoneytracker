import { CARD_SHADOW } from '@/theme/tokens'
import React, { useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import type { CalendarColors } from '../calendar'
import { buildCategorySlices, formatUsdInt, type CategorySlice } from './category.utils'
import { useMonthlyCategorySpending } from './useMonthlyCategorySpending'

const TOP_N_COLLAPSED = 5

type ContentProps = Readonly<{
  monthYYYYMM: string
  colors: CalendarColors
  accordionColors?: any // kept for backward compatibility
  onPressCategory?: (colorKey: string) => void
  hideHeader?: boolean
}>

/**
 * Category spending with horizontal bars
 * Shows top 5 by default, expandable to show all
 */
export function MonthlyCategoryContent(props: ContentProps) {
  const { monthYYYYMM, colors, hideHeader } = props
  const { loading, error, totalSpentDollar, rows } = useMonthlyCategorySpending(monthYYYYMM)
  const [expanded, setExpanded] = useState(false)

  // Build all slices (no limit)
  const allSlices = useMemo(
    () => buildSlices(totalSpentDollar, rows, colors.border, undefined),
    [totalSpentDollar, rows, colors.border]
  )

  // Slices to display based on expanded state
  const displaySlices = expanded ? allSlices : allSlices.slice(0, TOP_N_COLLAPSED)
  const hasMore = allSlices.length > TOP_N_COLLAPSED
  const hasData = allSlices.length > 0
  const maxAmount = hasData ? allSlices[0].totalDollar : 0

  // When embedded (hideHeader), no card styling
  const containerStyle = hideHeader
    ? {}
    : {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        ...CARD_SHADOW
      }

  return (
    <View style={containerStyle}>
      {/* Header - only show if not hidden */}
      {!hideHeader && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text, letterSpacing: 0.2 }}>
            Spending by Category
          </Text>
          {hasData && (
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.danger }}>
              {formatUsdInt(totalSpentDollar)}
            </Text>
          )}
        </View>
      )}

      {/* Content */}
      {loading && <Text style={{ color: colors.text, opacity: 0.7 }}>Loading...</Text>}
      {error && <Text style={{ color: colors.danger }}>{error}</Text>}

      {hasData ? (
        <>
          <CategoryBarList
            slices={displaySlices}
            maxAmount={maxAmount}
            colors={colors}
            onPress={props.onPressCategory}
          />

          {/* Expand/Collapse button */}
          {hasMore && (
            <Pressable
              onPress={() => setExpanded(!expanded)}
              style={{ marginTop: 16, paddingVertical: 8, alignItems: 'center' }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.primary }}>
                {expanded ? 'Show less' : `Show all ${allSlices.length} categories`}
              </Text>
            </Pressable>
          )}
        </>
      ) : !loading && !error ? (
        <Text style={{ color: colors.textMuted, textAlign: 'center', paddingVertical: 20 }}>
          No spending yet
        </Text>
      ) : null}
    </View>
  )
}

// Legacy export for backward compatibility
export const MonthlyCategorySection = MonthlyCategoryContent

// Helper to build slices
function buildSlices(
  totalSpentDollar: number,
  rows: ReadonlyArray<{ categoryId: string | null; categoryRef?: any; totalDollar: number }>,
  borderColor: string,
  topN?: number
) {
  return buildCategorySlices({
    totalSpentDollar,
    rows: rows.map((r) => ({
      categoryId: r.categoryId ?? null,
      categoryRef: r.categoryRef,
      totalDollar: r.totalDollar
    })),
    topN,
    colors: {
      palette: ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F', '#EDC948', '#B07AA1', '#FF9DA7', '#9C755F', '#BAB0AC'],
      others: borderColor
    }
  })
}

// Category list with horizontal bars
function CategoryBarList({
  slices,
  maxAmount,
  colors,
  onPress
}: {
  slices: CategorySlice[]
  maxAmount: number
  colors: CalendarColors
  onPress?: (key: string) => void
}) {
  return (
    <View style={{ gap: 12 }}>
      {slices.map((s) => {
        const barWidth = maxAmount > 0 ? (s.totalDollar / maxAmount) * 100 : 0

        return (
          <Pressable
            key={s.reactKey}
            onPress={() => onPress?.(s.colorKey)}
            style={{ gap: 6 }}
          >
            {/* Top row: dot + name + amount + percent */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: s.color }} />
              <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: colors.text }} numberOfLines={1}>
                {s.label}
              </Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>
                {formatUsdInt(s.totalDollar)}
              </Text>
              <Text style={{ width: 38, textAlign: 'right', fontSize: 11, fontWeight: '600', color: colors.textMuted }}>
                {Math.round(s.percent * 100)}%
              </Text>
            </View>

            {/* Bar */}
            <View
              style={{
                height: 8,
                backgroundColor: colors.surfaceAlt,
                borderRadius: 4,
                marginLeft: 18,
                overflow: 'hidden'
              }}
            >
              <View
                style={{
                  height: '100%',
                  width: `${barWidth}%`,
                  backgroundColor: s.color,
                  borderRadius: 4
                }}
              />
            </View>
          </Pressable>
        )
      })}
    </View>
  )
}
