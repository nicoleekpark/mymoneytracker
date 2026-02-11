import React, { useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import type { CategoryRef } from '@/domain/category'
import { CATEGORIES } from '@/config/categories.config'
import { CARD_SHADOW } from '@/theme/tokens'
import { fontSize } from '@/theme/tokens/typography'
import { radius } from '@/theme/tokens/radius'

import type { CalendarColors } from '../calendar'
import { formatUsdInt } from './category.utils'
import { useMonthlyIncomeByCategory } from './useMonthlyIncomeByCategory'

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
  hideHeader?: boolean
}>

/**
 * Income by category with horizontal bars and expandable subcategories
 * Shows top 5 by default, expandable to show all
 */
export function MonthlyIncomeContent(props: ContentProps) {
  const { monthYYYYMM, colors, hideHeader } = props
  const { loading, error, totalIncomeDollar, rows } = useMonthlyIncomeByCategory(monthYYYYMM)
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
        padding: 20,
        ...CARD_SHADOW
      }

  return (
    <View style={containerStyle}>
      {/* Header - only show if not hidden */}
      {!hideHeader && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: fontSize.lg, fontWeight: '800', color: colors.text, letterSpacing: 0.2 }}>
            Income by Category
          </Text>
          {hasData && (
            <Text style={{ fontSize: fontSize.md, fontWeight: '700', color: colors.success }}>
              {formatUsdInt(totalIncomeDollar)}
            </Text>
          )}
        </View>
      )}

      {/* Content */}
      {loading && <Text style={{ color: colors.text, opacity: 0.7 }}>Loading...</Text>}
      {error && <Text style={{ color: colors.danger }}>{error}</Text>}

      {hasData ? (
        <>
          <View style={{ gap: 12 }}>
            {displayRows.map((cat, idx) => {
              const percent = totalIncomeDollar > 0 ? (cat.totalDollar / totalIncomeDollar) * 100 : 0
              const barWidth = maxAmount > 0 ? (cat.totalDollar / maxAmount) * 100 : 0
              const categoryKey = cat.categoryRef?.categoryKey ?? 'uncategorized'
              const catMeta = getCategoryMeta(cat.categoryRef)
              const hasSubcategories = cat.subcategories && cat.subcategories.length > 0
              const isExpanded = expandedCategories.has(categoryKey)

              return (
                <View key={idx} style={{ gap: 6 }}>
                  {/* Top row: name + amount + percent (clickable if has subcategories) */}
                  <Pressable
                    onPress={() => hasSubcategories && toggleCategory(categoryKey)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
                    disabled={!hasSubcategories}
                  >
                    <View style={{ width: 10, height: 10, borderRadius: radius.full, backgroundColor: catMeta.color }} />
                    <Text style={{ flex: 1, fontSize: fontSize.sm, fontWeight: '600', color: colors.text }} numberOfLines={1}>
                      {catMeta.name}
                    </Text>
                    <Text style={{ fontSize: fontSize.md, fontWeight: '700', color: colors.text }}>
                      {formatUsdInt(cat.totalDollar)}
                    </Text>
                    <Text style={{ width: 38, textAlign: 'right', fontSize: fontSize.xs, fontWeight: '600', color: colors.textMuted }}>
                      {Math.round(percent)}%
                    </Text>
                    {/* Chevron indicator - fixed width container for alignment */}
                    <View style={{ width: 20, alignItems: 'center' }}>
                      {hasSubcategories && (
                        <Text style={{ fontSize: fontSize.xs, color: colors.textMuted }}>
                          {isExpanded ? '▼' : '▶'}
                        </Text>
                      )}
                    </View>
                  </Pressable>

                  {/* Bar */}
                  <View
                    style={{
                      height: 8,
                      backgroundColor: colors.surfaceAlt,
                      borderRadius: radius.sm,
                      marginLeft: 18,
                      overflow: 'hidden'
                    }}
                  >
                    <View
                      style={{
                        height: '100%',
                        width: `${barWidth}%`,
                        backgroundColor: catMeta.color,
                        borderRadius: radius.sm
                      }}
                    />
                  </View>

                  {/* Subcategories (accordion) */}
                  {isExpanded && hasSubcategories && (
                    <View style={{ marginLeft: 28, marginTop: 4, gap: 8 }}>
                      {cat.subcategories.map((sub, subIdx) => {
                        const subPercent = cat.totalDollar > 0 ? (sub.totalDollar / cat.totalDollar) * 100 : 0
                        const subBarWidth = cat.subcategories[0].totalDollar > 0
                          ? (sub.totalDollar / cat.subcategories[0].totalDollar) * 100
                          : 0
                        const subMeta = getSubcategoryMeta(categoryKey, sub.subCategoryKey)

                        return (
                          <View key={subIdx} style={{ gap: 4 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <View style={{ width: 6, height: 6, borderRadius: radius.full, backgroundColor: subMeta.color }} />
                              <Text style={{ flex: 1, fontSize: fontSize.xs, color: colors.text, opacity: 0.8 }} numberOfLines={1}>
                                {subMeta.name}
                              </Text>
                              <Text style={{ fontSize: fontSize.xs, fontWeight: '600', color: colors.text, opacity: 0.8 }}>
                                {formatUsdInt(sub.totalDollar)}
                              </Text>
                              <Text style={{ width: 38, textAlign: 'right', fontSize: fontSize.xs, color: colors.textMuted }}>
                                {Math.round(subPercent)}%
                              </Text>
                              {/* Spacer for alignment with parent rows */}
                              <View style={{ width: 20 }} />
                            </View>
                            {/* Subcategory bar */}
                            <View
                              style={{
                                height: 4,
                                backgroundColor: colors.surfaceAlt,
                                borderRadius: radius.xs,
                                marginLeft: 12,
                                overflow: 'hidden'
                              }}
                            >
                              <View
                                style={{
                                  height: '100%',
                                  width: `${subBarWidth}%`,
                                  backgroundColor: subMeta.color,
                                  opacity: 0.7,
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
              style={{ marginTop: 16, paddingVertical: 8, alignItems: 'center' }}
            >
              <Text style={{ fontSize: fontSize.sm, fontWeight: '600', color: colors.primary }}>
                {showAll ? 'Show less' : `Show all ${rows.length} categories`}
              </Text>
            </Pressable>
          )}
        </>
      ) : !loading && !error ? (
        <Text style={{ color: colors.textMuted, textAlign: 'center', paddingVertical: 20 }}>
          No income yet
        </Text>
      ) : null}
    </View>
  )
}

// Legacy export for backward compatibility
export const MonthlyIncomeSection = MonthlyIncomeContent
