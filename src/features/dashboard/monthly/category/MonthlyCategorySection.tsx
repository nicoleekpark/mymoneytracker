import React, { useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import type { CategoryRef } from '@/domain/category'
import { CATEGORIES } from '@/config/categories.config'
import { CARD_SHADOW } from '@/theme/tokens'
import { fontSize, fontWeight } from '@/theme/tokens/typography'
import { radius } from '@/theme/tokens/radius'
import { spacing } from '@/theme/tokens/spacing'

import type { CalendarColors } from '../calendar'
import { formatUsdInt } from './category.utils'
import { useMonthlyCategorySpending, type CategorySpendingRow } from './useMonthlyCategorySpending'

const TOP_N_COLLAPSED = 5

/**
 * Get category display info (name, color) from categoryRef
 */
function getCategoryMeta(categoryRef?: CategoryRef) {
  if (!categoryRef) {
    return { name: 'Uncategorized', color: '#888' }
  }

  const cat = CATEGORIES.find(c => c.key === categoryRef.categoryKey)
  if (!cat) {
    return { name: categoryRef.categoryKey, color: '#888' }
  }

  return { name: cat.name, color: cat.color }
}

/**
 * Get subcategory display info (name, color) from parent categoryKey and subCategoryKey
 */
function getSubcategoryMeta(categoryKey: string, subCategoryKey: string) {
  const cat = CATEGORIES.find(c => c.key === categoryKey)
  if (!cat?.subCategories) {
    return { name: subCategoryKey, color: '#666' }
  }

  const sub = cat.subCategories.find(s => s.key === subCategoryKey)
  if (!sub) {
    return { name: subCategoryKey, color: '#666' }
  }

  return { name: sub.name, color: sub.color }
}

type ContentProps = Readonly<{
  monthYYYYMM: string
  colors: CalendarColors
  accordionColors?: any // kept for backward compatibility
  onPressCategory?: (colorKey: string) => void
  hideHeader?: boolean
}>

/**
 * Category spending with horizontal bars and expandable subcategories
 * Shows top 5 by default, expandable to show all
 */
export function MonthlyCategoryContent(props: ContentProps) {
  const { monthYYYYMM, colors, hideHeader } = props
  const { loading, error, totalSpentDollar, rows } = useMonthlyCategorySpending(monthYYYYMM)
  const [showAll, setShowAll] = useState(false)

  // Auto-expand the largest category with subcategories
  const defaultExpanded = useMemo(() => {
    const firstWithSubs = rows.find(cat => cat.subcategories && cat.subcategories.length > 0)
    if (firstWithSubs?.categoryRef?.categoryKey) {
      return new Set([firstWithSubs.categoryRef.categoryKey])
    }
    return new Set<string>()
  }, [rows])

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // Sync with default when data changes
  const [hasInitialized, setHasInitialized] = useState(false)
  if (!hasInitialized && defaultExpanded.size > 0) {
    setExpandedCategories(defaultExpanded)
    setHasInitialized(true)
  }

  // Toggle category expansion
  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryKey)) {
        next.delete(categoryKey)
      } else {
        next.add(categoryKey)
      }
      return next
    })
  }

  // Categories to display based on showAll state
  const displayRows = showAll ? rows : rows.slice(0, TOP_N_COLLAPSED)
  const hasMore = rows.length > TOP_N_COLLAPSED
  const hasData = rows.length > 0
  const maxAmount = hasData ? rows[0].totalDollar : 0

  // When embedded (hideHeader), no card styling
  const containerStyle = hideHeader
    ? {}
    : {
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        padding: spacing.xl,
        ...CARD_SHADOW
      }

  return (
    <View style={containerStyle}>
      {/* Header - only show if not hidden */}
      {!hideHeader && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
          <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, letterSpacing: 0.2 }}>
            Spending by Category
          </Text>
          <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginLeft: spacing.xs }}>
            % of total
          </Text>
          {hasData && (
            <Text style={{ fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.danger }}>
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
          <View style={{ gap: spacing.md }}>
            {displayRows.map((cat, idx) => {
              const percent = totalSpentDollar > 0 ? (cat.totalDollar / totalSpentDollar) * 100 : 0
              const barWidth = maxAmount > 0 ? (cat.totalDollar / maxAmount) * 100 : 0
              const categoryKey = cat.categoryRef?.categoryKey ?? 'uncategorized'
              const catMeta = getCategoryMeta(cat.categoryRef)
              const hasSubcategories = cat.subcategories && cat.subcategories.length > 0
              const isExpanded = expandedCategories.has(categoryKey)

              return (
                <View key={idx} style={{ gap: spacing.sm }}>
                  {/* Top row: name + amount + percent (clickable if has subcategories) */}
                  <Pressable
                    onPress={() => hasSubcategories && toggleCategory(categoryKey)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
                    disabled={!hasSubcategories}
                  >
                    <View style={{ width: 10, height: 10, borderRadius: radius.full, backgroundColor: catMeta.color }} />
                    <Text style={{ flex: 1, fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text }} numberOfLines={1}>
                      {catMeta.name}
                    </Text>
                    <Text style={{ fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text }}>
                      {formatUsdInt(cat.totalDollar)}
                    </Text>
                    <Text style={{ width: 44, textAlign: 'right', fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.textMuted }}>
                      {Math.round(percent)}%
                    </Text>
                  </Pressable>

                  {/* Bar - neutral color */}
                  <View
                    style={{
                      height: spacing.sm,
                      backgroundColor: colors.surfaceAlt,
                      borderRadius: radius.sm,
                      marginLeft: spacing.lg,
                      overflow: 'hidden'
                    }}
                  >
                    <View
                      style={{
                        height: '100%',
                        width: `${barWidth}%`,
                        backgroundColor: colors.textMuted,
                        borderRadius: radius.sm
                      }}
                    />
                  </View>

                  {/* Subcategories (accordion) */}
                  {isExpanded && hasSubcategories && (
                    <View style={{ marginLeft: spacing.xl + spacing.xs, marginTop: spacing.xs, gap: spacing.sm }}>
                      {/* Subcategory header showing % is of parent */}
                      <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginBottom: spacing.xs }}>
                        % of {catMeta.name}
                      </Text>
                      {cat.subcategories.map((sub, subIdx) => {
                        const subPercent = cat.totalDollar > 0 ? (sub.totalDollar / cat.totalDollar) * 100 : 0
                        const subBarWidth = cat.subcategories[0].totalDollar > 0
                          ? (sub.totalDollar / cat.subcategories[0].totalDollar) * 100
                          : 0

                        return (
                          <View key={subIdx} style={{ gap: spacing.xs }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                              <View style={{ width: 6, height: 6, borderRadius: radius.full, backgroundColor: colors.textMuted, opacity: 0.6 }} />
                              <Text style={{ flex: 1, fontSize: fontSize.xs, color: colors.text, opacity: 0.8 }} numberOfLines={1}>
                                {getSubcategoryMeta(categoryKey, sub.subCategoryKey).name}
                              </Text>
                              <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.text, opacity: 0.8 }}>
                                {formatUsdInt(sub.totalDollar)}
                              </Text>
                              <Text style={{ width: 44, textAlign: 'right', fontSize: fontSize.xs, color: colors.textMuted }}>
                                {Math.round(subPercent)}%
                              </Text>
                            </View>
                            {/* Subcategory bar */}
                            <View
                              style={{
                                height: spacing.xs,
                                backgroundColor: colors.surfaceAlt,
                                borderRadius: radius.xs,
                                marginLeft: spacing.md,
                                overflow: 'hidden'
                              }}
                            >
                              <View
                                style={{
                                  height: '100%',
                                  width: `${subBarWidth}%`,
                                  backgroundColor: colors.textMuted,
                                  opacity: 0.5,
                                  borderRadius: radius.xs
                                }}
                              />
                            </View>
                          </View>
                        )
                      })}
                    </View>
                  )}
                </View>
              )
            })}
          </View>

          {/* Expand/Collapse button */}
          {hasMore && (
            <Pressable
              onPress={() => setShowAll(!showAll)}
              style={{ marginTop: spacing.lg, paddingVertical: spacing.sm, alignItems: 'center' }}
            >
              <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textMuted }}>
                {showAll ? 'Show less' : `Show all ${rows.length} categories`}
              </Text>
            </Pressable>
          )}
        </>
      ) : !loading && !error ? (
        <Text style={{ color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.xl }}>
          No spending yet
        </Text>
      ) : null}
    </View>
  )
}

// Legacy export for backward compatibility
export const MonthlyCategorySection = MonthlyCategoryContent
