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

export type SparklineColors = Readonly<{
  text: string
  textSecondary: string
  border: string
  surface: string
  surfaceAlt: string
  primary: string
  success: string
  danger: string
}>

export type SubcategoryRowData = Readonly<{
  name: string
  icon: string
  color: string
  total: number
  average: number
}>

type CategoryRowData = Readonly<{
  categoryRef?: CategoryRef
  monthlyAmounts: number[]
  total: number
  average: number
  subcategories?: SubcategoryRowData[]
}>

type Props = {
  categories: CategoryRowData[]
  totalExpense: number
  colors: SparklineColors
  onCategoryPress?: (categoryKey: string) => void
  onViewAllPress?: (categoryKey: string) => void
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

function SubcategoryRow({
  data,
  colors,
  maxAmount
}: {
  data: SubcategoryRowData
  colors: SparklineColors
  maxAmount: number
}) {
  const percentage = maxAmount > 0 ? (data.total / maxAmount) * 100 : 0

  return (
    <View style={{ gap: spacing.xs }}>
      {/* Name and amount row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <CategoryIcon name={data.icon} size={13} color={data.color} />
          <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.text }}>
            {data.name}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.text }}>
            {formatUsdInt(data.total)}
          </Text>
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>
            {formatUsdInt(data.average)}/mo
          </Text>
        </View>
      </View>
      {/* Mini bar */}
      <View
        style={{
          height: 4,
          backgroundColor: colors.surfaceAlt,
          borderRadius: radius.xs,
          overflow: 'hidden'
        }}
      >
        <View
          style={{
            width: `${Math.min(100, percentage)}%`,
            height: '100%',
            backgroundColor: data.color,
            borderRadius: radius.xs
          }}
        />
      </View>
    </View>
  )
}

function HorizontalBarRow({
  data,
  totalExpense,
  maxAmount,
  colors,
  isFirst,
  isExpanded,
  onPress,
  onViewAllPress
}: {
  data: CategoryRowData
  totalExpense: number
  maxAmount: number
  colors: SparklineColors
  isFirst: boolean
  isExpanded: boolean
  onPress?: () => void
  onViewAllPress?: () => void
}) {
  const { name, icon, color } = getCategoryMeta(data.categoryRef)
  const hasSubcategories = data.subcategories && data.subcategories.length > 0
  const barWidth = maxAmount > 0 ? (data.total / maxAmount) * 100 : 0
  const percentage = totalExpense > 0 ? (data.total / totalExpense) * 100 : 0

  // Find max subcategory amount for sub-bar scaling
  const maxSubAmount = data.subcategories
    ? Math.max(...data.subcategories.map(s => s.total), 1)
    : 1

  return (
    <View>
      <Pressable onPress={onPress}>
        <View style={{ gap: 6 }}>
          {/* Crown for #1 */}
          {isFirst && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: -2 }}>
              <Text style={{ fontSize: fontSize.md }}>👑</Text>
              <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.textSecondary }}>
                Top spending
              </Text>
            </View>
          )}

          {/* Category name row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text }}>
              {name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
              <Text style={{ fontSize: fontSize.md, fontWeight: fontWeight.heavy, color: colors.text }}>
                {formatUsdInt(data.total)}
              </Text>
              <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.textSecondary }}>
                {percentage.toFixed(0)}%
              </Text>
            </View>
          </View>

          {/* Horizontal bar with icon at end */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <View
              style={{
                flex: 1,
                height: 28,
                backgroundColor: colors.surfaceAlt,
                borderRadius: radius.xl,
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <View
                style={{
                  width: `${Math.max(barWidth, 8)}%`,
                  height: '100%',
                  backgroundColor: color,
                  borderRadius: radius.xl,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: 4
                }}
              >
                {/* Icon inside the bar at the end */}
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: radius.full,
                    backgroundColor: colors.surface,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <CategoryIcon name={icon} size={12} color={color} />
                </View>
              </View>
            </View>
          </View>

          {/* Tap hint */}
          {hasSubcategories && (
            <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 }}>
              {isExpanded ? 'tap to collapse' : 'tap to see breakdown'}
            </Text>
          )}
        </View>
      </Pressable>

      {/* Expanded subcategories */}
      {isExpanded && hasSubcategories && (
        <View
          style={{
            marginTop: 10,
            marginLeft: 12,
            paddingLeft: 12,
            borderLeftWidth: 2,
            borderLeftColor: color,
            gap: 10
          }}
        >
          {data.subcategories!.map((sub, idx) => (
            <SubcategoryRow
              key={`${sub.name}-${idx}`}
              data={sub}
              colors={colors}
              maxAmount={maxSubAmount}
            />
          ))}

          {/* View all link */}
          <Pressable
            onPress={onViewAllPress}
            style={{ paddingVertical: 8, alignItems: 'center' }}
          >
            <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.primary }}>
              View all {name} transactions →
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}

export function SparklineList({ categories, totalExpense, colors, onCategoryPress, onViewAllPress }: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  // Find max amount for bar scaling
  const maxAmount = categories.length > 0
    ? Math.max(...categories.map(c => c.total), 1)
    : 1

  function handlePress(index: number) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpandedIndex(prev => (prev === index ? null : index))

    const cat = categories[index]
    if (cat.categoryRef && onCategoryPress) {
      onCategoryPress(cat.categoryRef.categoryKey)
    }
  }

  function handleViewAll(index: number) {
    const cat = categories[index]
    if (cat.categoryRef && onViewAllPress) {
      onViewAllPress(cat.categoryRef.categoryKey)
    }
  }

  if (categories.length === 0) {
    return (
      <View
        style={{
          padding: spacing.xl,
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border
        }}
      >
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.md }}>
          No spending data for this year
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
        borderColor: colors.border,
        gap: spacing.lg
      }}
    >
      <Text
        style={{
          fontSize: fontSize.lg,
          fontWeight: fontWeight.heavy,
          color: colors.text,
          letterSpacing: letterSpacing.wide
        }}
      >
        Spending by Category
      </Text>

      {categories.map((cat, idx) => (
        <HorizontalBarRow
          key={`${idx}-${cat.categoryRef?.categoryKey ?? 'uncategorized'}`}
          data={cat}
          totalExpense={totalExpense}
          maxAmount={maxAmount}
          colors={colors}
          isFirst={idx === 0}
          isExpanded={expandedIndex === idx}
          onPress={() => handlePress(idx)}
          onViewAllPress={() => handleViewAll(idx)}
        />
      ))}
    </View>
  )
}
