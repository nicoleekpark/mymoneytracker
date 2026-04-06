import React, { useMemo } from 'react'
import { Pressable, Text, View } from 'react-native'
import type { CategoryRef } from '@/core/domain/category'
import { UNCATEGORIZED_KEY } from '@/core/domain/category'
import { CATEGORIES } from '@/shared/config/categories.config'
import { formatUsdInt } from '@/shared/format/currency'
import type { StandardViewColors } from '@/shared/theme/tokens/viewStyles'
import { UNCATEGORIZED_COLOR } from '@/shared/theme/tokens/viewStyles'
import { createCategoryAccordionStyles } from './CategoryAccordion.styles'

type CategoryItem = {
  categoryRef?: CategoryRef
  totalDollar: number
  subcategories?: Array<{
    subCategoryKey: string
    totalDollar: number
  }>
}

type CategoryAccordionProps = {
  categories: CategoryItem[]
  totalAmount: number
  expandedKeys: Set<string>
  onToggle: (key: string) => void
  showAll: boolean
  onToggleShowAll: () => void
  topN?: number
  emptyText?: string
  colors: StandardViewColors
}

/**
 * Get category display info (name, color) from categoryRef.
 */
function getCategoryMeta(categoryRef?: CategoryRef) {
  if (!categoryRef) {
    return { name: 'Uncategorized', color: UNCATEGORIZED_COLOR, subCategories: [] }
  }

  const cat = CATEGORIES.find(c => c.key === categoryRef.categoryKey)
  if (!cat) {
    return { name: categoryRef.categoryKey, color: UNCATEGORIZED_COLOR, subCategories: [] }
  }

  return { name: cat.name, color: cat.color, subCategories: cat.subCategories }
}

/**
 * Get subcategory display name from parent's subCategories array.
 */
function getSubcategoryName(subCategories: typeof CATEGORIES[0]['subCategories'], subKey: string): string {
  const sub = subCategories?.find(s => s.key === subKey)
  return sub?.name ?? subKey
}

/**
 * Expandable category list with subcategories accordion.
 * Used in yearly dashboard for expense and income breakdowns.
 */
export function CategoryAccordion({
  categories,
  totalAmount,
  expandedKeys,
  onToggle,
  showAll,
  onToggleShowAll,
  topN = 5,
  emptyText = 'No data yet',
  colors,
}: CategoryAccordionProps) {
  const styles = useMemo(() => createCategoryAccordionStyles(), [])

  // Sort and optionally limit categories
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => b.totalDollar - a.totalDollar)
  }, [categories])

  const displayCategories = showAll
    ? sortedCategories
    : sortedCategories.slice(0, topN)

  const hasMore = sortedCategories.length > topN
  const maxAmount = sortedCategories.length > 0 ? sortedCategories[0].totalDollar : 0

  if (displayCategories.length === 0) {
    return (
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        {emptyText}
      </Text>
    )
  }

  return (
    <>
      <View style={styles.container}>
        {displayCategories.map((cat, idx) => {
          const percent = totalAmount > 0 ? (cat.totalDollar / totalAmount) * 100 : 0
          const barWidth = maxAmount > 0 ? (cat.totalDollar / maxAmount) * 100 : 0
          const categoryKey = cat.categoryRef?.categoryKey ?? UNCATEGORIZED_KEY
          const catMeta = getCategoryMeta(cat.categoryRef)
          const hasSubcategories = cat.subcategories && cat.subcategories.length > 0
          const isExpanded = expandedKeys.has(categoryKey)

          return (
            <View key={idx} style={styles.categoryRow}>
              {/* Category header row */}
              <Pressable
                onPress={() => hasSubcategories && onToggle(categoryKey)}
                style={styles.categoryHeader}
                disabled={!hasSubcategories}
                accessibilityRole={hasSubcategories ? 'button' : 'text'}
                accessibilityLabel={`${catMeta.name}, ${formatUsdInt(cat.totalDollar)}, ${Math.round(percent)} percent${hasSubcategories ? '. Tap to expand subcategories' : ''}`}
                accessibilityState={{ expanded: isExpanded }}
              >
                <View style={[styles.categoryDot, { backgroundColor: catMeta.color }]} />
                <Text style={[styles.categoryName, { color: colors.text }]} numberOfLines={1}>
                  {catMeta.name}
                </Text>
                <Text style={[styles.categoryAmount, { color: colors.text }]}>
                  {formatUsdInt(cat.totalDollar)}
                </Text>
                <Text style={[styles.categoryPercent, { color: colors.textSecondary }]}>
                  {Math.round(percent)}%
                </Text>
                <View style={styles.chevronContainer}>
                  {hasSubcategories && (
                    <Text style={[styles.chevron, { color: colors.textSecondary }]}>
                      {isExpanded ? '▼' : '▶'}
                    </Text>
                  )}
                </View>
              </Pressable>

              {/* Category bar */}
              <View style={[styles.barContainer, { backgroundColor: colors.surfaceAlt }]}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${barWidth}%`, backgroundColor: colors.textSecondary },
                  ]}
                />
              </View>

              {/* Subcategories accordion */}
              {isExpanded && hasSubcategories && (
                <View style={styles.subcategoryContainer}>
                  <Text style={[styles.subcategoryHeader, { color: colors.textSecondary }]}>
                    % of {catMeta.name}
                  </Text>
                  {cat.subcategories!.map((sub, subIdx) => {
                    const subPercent = cat.totalDollar > 0
                      ? (sub.totalDollar / cat.totalDollar) * 100
                      : 0
                    const subBarWidth = cat.subcategories![0].totalDollar > 0
                      ? (sub.totalDollar / cat.subcategories![0].totalDollar) * 100
                      : 0

                    return (
                      <View key={subIdx} style={styles.subcategoryRow}>
                        <View style={styles.subcategoryContent}>
                          <View style={[styles.subcategoryDot, { backgroundColor: colors.textSecondary }]} />
                          <Text style={[styles.subcategoryName, { color: colors.text }]} numberOfLines={1}>
                            {getSubcategoryName(catMeta.subCategories, sub.subCategoryKey)}
                          </Text>
                          <Text style={[styles.subcategoryAmount, { color: colors.text }]}>
                            {formatUsdInt(sub.totalDollar)}
                          </Text>
                          <Text style={[styles.subcategoryPercent, { color: colors.textSecondary }]}>
                            {Math.round(subPercent)}%
                          </Text>
                          <View style={styles.subcategorySpacer} />
                        </View>
                        <View style={[styles.subcategoryBarContainer, { backgroundColor: colors.surfaceAlt }]}>
                          <View
                            style={[
                              styles.subcategoryBarFill,
                              { width: `${subBarWidth}%`, backgroundColor: colors.textSecondary },
                            ]}
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

      {/* Show all/less toggle */}
      {hasMore && (
        <Pressable onPress={onToggleShowAll} style={styles.showAllButton}>
          <Text style={[styles.showAllText, { color: colors.textSecondary }]}>
            {showAll ? 'Show less' : `Show all ${sortedCategories.length} categories`}
          </Text>
        </Pressable>
      )}
    </>
  )
}
