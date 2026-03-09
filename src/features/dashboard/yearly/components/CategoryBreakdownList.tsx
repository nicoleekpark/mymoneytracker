import React, { useState } from 'react'
import { LayoutAnimation, Platform, Pressable, Text, UIManager, View } from 'react-native'

import type { CategoryRef } from '@/domain/category'
import { CATEGORIES } from '@/config/categories.config'
import { CategoryIcon } from '@/shared/components'
import { formatUsdInt } from '@/shared/format/currency'
import { fontSize, fontWeight, letterSpacing } from '@/theme/tokens/typography'
import { radius } from '@/theme/tokens/radius'
import { spacing } from '@/theme/tokens/spacing'
import { UNCATEGORIZED_COLOR } from '@/theme/tokens/viewStyles'

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

export type CategoryListColors = Readonly<{
  text: string
  textSecondary: string
  border: string
  surface: string
  surfaceAlt: string
  primary: string
  success: string
  danger: string
}>

export type SubcategoryData = Readonly<{
  name: string
  icon: string
  color: string
  total: number
}>

export type CategoryItemData = Readonly<{
  categoryRef?: CategoryRef
  total: number
  average: number
  subcategories?: SubcategoryData[]
}>

type Props = {
  title: string
  type: 'income' | 'expense'
  categories: CategoryItemData[]
  totalAmount: number
  colors: CategoryListColors
  maxItems?: number
}

function getCategoryMeta(categoryRef?: CategoryRef) {
  if (!categoryRef) {
    return { name: 'Other', icon: 'cube', color: UNCATEGORIZED_COLOR }
  }

  const cat = CATEGORIES.find(c => c.key === categoryRef.categoryKey)
  if (!cat) {
    return { name: categoryRef.categoryKey, icon: 'cube', color: UNCATEGORIZED_COLOR }
  }

  return { name: cat.name, icon: cat.icon, color: cat.color }
}

function CategoryRow({
  item,
  index,
  totalAmount,
  isExpanded,
  onPress,
  colors
}: {
  item: CategoryItemData
  index: number
  totalAmount: number
  isExpanded: boolean
  onPress: () => void
  colors: CategoryListColors
}) {
  const meta = getCategoryMeta(item.categoryRef)
  const percentage = totalAmount > 0 ? (item.total / totalAmount) * 100 : 0
  const isTop = index === 0
  const hasSubcategories = item.subcategories && item.subcategories.length > 0

  return (
    <Pressable onPress={onPress}>
      <View style={{ paddingVertical: 12 }}>
        {/* Main row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {/* Icon */}
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: radius.md,
              backgroundColor: `${meta.color}20`,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CategoryIcon name={meta.icon} size={16} color={meta.color} />
          </View>

          {/* Name + hint */}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {isTop && <Text style={{ fontSize: fontSize.xs }}>👑</Text>}
              <Text style={{ fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text }}>
                {meta.name}
              </Text>
            </View>
            {hasSubcategories && !isExpanded && (
              <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 }}>
                tap for details
              </Text>
            )}
          </View>

          {/* Amount + percentage */}
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.heavy, color: colors.text }}>
              {formatUsdInt(item.total)}
            </Text>
            <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.textSecondary }}>
              {percentage.toFixed(0)}%
            </Text>
          </View>
        </View>

        {/* Expanded: Subcategories */}
        {isExpanded && hasSubcategories && (
          <View
            style={{
              marginTop: spacing.md,
              marginLeft: 42,
              backgroundColor: colors.surfaceAlt,
              borderRadius: radius.md,
              padding: spacing.md,
              gap: 10
            }}
          >
            {/* Subcategory rows */}
            {item.subcategories!.map((sub, idx) => {
              const subPct = item.total > 0 ? (sub.total / item.total) * 100 : 0
              return (
                <View
                  key={`${sub.name}-${idx}`}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
                >
                  <CategoryIcon name={sub.icon} size={12} color={sub.color} />
                  <Text style={{ flex: 1, fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.text }}>
                    {sub.name}
                  </Text>
                  <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.text }}>
                    {formatUsdInt(sub.total)}
                  </Text>
                  <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.textSecondary, width: 32, textAlign: 'right' }}>
                    {subPct.toFixed(0)}%
                  </Text>
                </View>
              )
            })}

            {/* Average */}
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: colors.border,
                paddingTop: spacing.sm,
                marginTop: 4
              }}
            >
              <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>
                Avg: {formatUsdInt(item.average)}/mo
              </Text>
            </View>
          </View>
        )}

        {/* Expanded but no subcategories: just show average */}
        {isExpanded && !hasSubcategories && (
          <View style={{ marginTop: spacing.sm, marginLeft: 42 }}>
            <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>
              Avg: {formatUsdInt(item.average)}/mo
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  )
}

export function CategoryBreakdownList({
  title,
  type,
  categories,
  totalAmount,
  colors,
  maxItems = 6
}: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const displayCategories = categories.slice(0, maxItems)

  function handlePress(index: number) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpandedIndex(prev => (prev === index ? null : index))
  }

  if (categories.length === 0) {
    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.xl,
          padding: spacing.xl,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: 'center'
        }}
      >
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>
          No {type} data
        </Text>
      </View>
    )
  }

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.heavy, color: colors.text, letterSpacing: letterSpacing.wide }}>
          {title}
        </Text>
        <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: type === 'income' ? colors.success : colors.danger }}>
          {formatUsdInt(totalAmount)}
        </Text>
      </View>

      {/* Category rows */}
      <View>
        {displayCategories.map((cat, idx) => (
          <View
            key={cat.categoryRef?.categoryKey ?? `cat-${idx}`}
            style={idx < displayCategories.length - 1 ? { borderBottomWidth: 1, borderBottomColor: colors.border } : undefined}
          >
            <CategoryRow
              item={cat}
              index={idx}
              totalAmount={totalAmount}
              isExpanded={expandedIndex === idx}
              onPress={() => handlePress(idx)}
              colors={colors}
            />
          </View>
        ))}
      </View>

      {/* "See all" if more items */}
      {categories.length > maxItems && (
        <Pressable
          style={{
            paddingTop: spacing.md,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            alignItems: 'center'
          }}
        >
          <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.primary }}>
            See all {categories.length} categories →
          </Text>
        </Pressable>
      )}
    </View>
  )
}
