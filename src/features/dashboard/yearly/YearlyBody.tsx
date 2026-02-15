import React, { useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { displaySize, fontSize, fontWeight } from '@/theme/tokens/typography'
import { radius } from '@/theme/tokens/radius'
import { spacing } from '@/theme/tokens/spacing'

import type { CategoryRef } from '@/domain/category'
import { CATEGORIES } from '@/config/categories.config'
import { FEATURE_FLAGS } from '@/config'
import { formatUsdInt } from '@/shared/format/currency'

import { MonthlyCashflowChart } from './components'
import { useYearlyHeroData } from './hooks'

/**
 * Get category display info (name, color) from categoryRef
 */
function getCategoryMeta(categoryRef?: CategoryRef) {
  if (!categoryRef) {
    return { name: 'Uncategorized', color: '#888', subCategories: [] }
  }

  const cat = CATEGORIES.find(c => c.key === categoryRef.categoryKey)
  if (!cat) {
    return { name: categoryRef.categoryKey, color: '#888', subCategories: [] }
  }

  return { name: cat.name, color: cat.color, subCategories: cat.subCategories }
}

/**
 * Get subcategory display name from parent's subCategories array
 */
function getSubcategoryName(subCategories: typeof CATEGORIES[0]['subCategories'], subKey: string): string {
  const sub = subCategories?.find(s => s.key === subKey)
  return sub?.name ?? subKey
}

import { useYearlyData } from './hooks'

export type YearlyColors = Readonly<{
  text: string
  textMuted: string
  border: string
  surface: string
  surfaceAlt: string
  primary: string
  success: string
  danger: string
  warning: string
}>

type Props = {
  year: number
  colors: YearlyColors
}

// Section gap for combined style (matching Monthly)
const SECTION_GAP = 40


// Top N categories to show
const TOP_N_CATEGORIES = 5

/**
 * Section header with accent line - matching Monthly style
 */
function SectionHeader({
  title,
  rightText,
  rightColor,
  colors
}: {
  title: string
  rightText?: string
  rightColor?: string
  colors: YearlyColors
}) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      {/* Subtle divider above */}
      <View style={{ height: 1, backgroundColor: colors.border, marginBottom: spacing.lg, opacity: 0.5 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.textMuted }}>
          {title}
        </Text>
        {rightText && (
          <Text style={{ marginLeft: 'auto', fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: rightColor || colors.text }}>
            {rightText}
          </Text>
        )}
      </View>
    </View>
  )
}

export function YearlyBody({ year, colors }: Props) {
  const { loading, error, data } = useYearlyData(year)
  const { data: heroData } = useYearlyHeroData(year)

  // Feature flag for hero variant
  const useOptionAHero = FEATURE_FLAGS.heroVariant === 'optionA'

  // Auto-expand the largest expense category with subcategories (Option B)
  const defaultExpenseExpanded = useMemo(() => {
    const firstWithSubs = data.expenseByCategory.find(cat => cat.subcategories && cat.subcategories.length > 0)
    if (firstWithSubs?.categoryRef?.categoryKey) {
      return new Set([firstWithSubs.categoryRef.categoryKey])
    }
    return new Set<string>()
  }, [data.expenseByCategory])

  // Auto-expand the largest income category with subcategories
  const defaultIncomeExpanded = useMemo(() => {
    const firstWithSubs = data.incomeByCategory.find(cat => cat.subcategories && cat.subcategories.length > 0)
    if (firstWithSubs?.categoryRef?.categoryKey) {
      return new Set([firstWithSubs.categoryRef.categoryKey])
    }
    return new Set<string>()
  }, [data.incomeByCategory])

  const [expandedExpenseCategories, setExpandedExpenseCategories] = useState<Set<string>>(new Set())
  const [expandedIncomeCategories, setExpandedIncomeCategories] = useState<Set<string>>(new Set())
  const [showAllExpense, setShowAllExpense] = useState(false)
  const [showAllIncome, setShowAllIncome] = useState(false)

  // Sync with default when data changes
  const [hasExpenseInitialized, setHasExpenseInitialized] = useState(false)
  if (!hasExpenseInitialized && defaultExpenseExpanded.size > 0) {
    setExpandedExpenseCategories(defaultExpenseExpanded)
    setHasExpenseInitialized(true)
  }

  const [hasIncomeInitialized, setHasIncomeInitialized] = useState(false)
  if (!hasIncomeInitialized && defaultIncomeExpanded.size > 0) {
    setExpandedIncomeCategories(defaultIncomeExpanded)
    setHasIncomeInitialized(true)
  }

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const isPastYear = year < currentYear
  const isCurrentYear = year === currentYear

  // Calculate totals
  const totalIncome = data.totalIncome
  const totalExpense = data.totalExpense
  const savings = totalIncome - totalExpense
  const savingsRate = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0

  // Expense categories - sorted, with optional limit
  const allExpenseCategories = useMemo(() => {
    return data.expenseByCategory.sort((a, b) => b.totalDollar - a.totalDollar)
  }, [data.expenseByCategory])
  const displayExpenseCategories = showAllExpense
    ? allExpenseCategories
    : allExpenseCategories.slice(0, TOP_N_CATEGORIES)
  const hasMoreExpense = allExpenseCategories.length > TOP_N_CATEGORIES

  // Income categories - sorted, with optional limit
  const allIncomeCategories = useMemo(() => {
    return data.incomeByCategory.sort((a, b) => b.totalDollar - a.totalDollar)
  }, [data.incomeByCategory])
  const displayIncomeCategories = showAllIncome
    ? allIncomeCategories
    : allIncomeCategories.slice(0, TOP_N_CATEGORIES)
  const hasMoreIncome = allIncomeCategories.length > TOP_N_CATEGORIES

  // Calculate max for category bars (use first item since sorted desc)
  const maxExpenseAmount = allExpenseCategories.length > 0 ? allExpenseCategories[0].totalDollar : 0
  const maxIncomeAmount = allIncomeCategories.length > 0 ? allIncomeCategories[0].totalDollar : 0

  // Toggle category expansion for expenses
  const toggleExpenseCategory = (categoryKey: string) => {
    setExpandedExpenseCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryKey)) {
        next.delete(categoryKey)
      } else {
        next.add(categoryKey)
      }
      return next
    })
  }

  // Toggle category expansion for income
  const toggleIncomeCategory = (categoryKey: string) => {
    setExpandedIncomeCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryKey)) {
        next.delete(categoryKey)
      } else {
        next.add(categoryKey)
      }
      return next
    })
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 }}>
        <Text style={{ color: colors.text, opacity: 0.7 }}>Loading...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 }}>
        <Text style={{ color: colors.danger }}>{error}</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Section 1: Hero - Year Overview */}
      <View style={{ marginBottom: SECTION_GAP }}>
        {/* Option A Hero: Net Outcome */}
        {useOptionAHero ? (
          <View style={{ marginBottom: spacing.lg }}>
            {/* Title line - left aligned, matches section header style */}
            <Text style={{ fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.textMuted, marginBottom: spacing.sm }}>
              Net (Income - Expense)
            </Text>

            {/* Hero number + sub-hero: center aligned */}
            <View style={{ alignItems: 'center' }}>
              {/* Primary: Net amount - neutral color like Assets */}
              <Text
                style={{
                  fontSize: displaySize.xl,
                  fontWeight: '800',
                  color: colors.text
                }}
              >
                {heroData.netDollar >= 0 ? '+' : ''}{formatUsdInt(heroData.netDollar)}
              </Text>

              {/* Comparison with last year - muted semantic color */}
              {heroData.hasLastYearData && heroData.netChangeDollar !== null && (
                <Text
                  style={{
                    fontSize: fontSize.sm,
                    color: heroData.netChangeDollar >= 0 ? colors.success : colors.danger,
                    opacity: 0.7,
                    marginTop: spacing.sm
                  }}
                >
                  {heroData.netChangeDollar >= 0 ? '↑' : '↓'} {formatUsdInt(Math.abs(heroData.netChangeDollar))} vs {year - 1}
                </Text>
              )}
            </View>
          </View>
        ) : (
          /* Current Hero: $ Saved (absolute first, % as supporting) */
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            {totalIncome > 0 ? (
              savings > 0 ? (
                // Positive savings - dollar amount primary, % supporting
                <>
                  <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, marginBottom: 4 }}>
                    Saved
                  </Text>
                  <Text style={{ fontSize: displaySize.xl, fontWeight: '800', color: colors.success }}>
                    {formatUsdInt(savings)}
                  </Text>
                  <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, marginTop: 8 }}>
                    That's <Text style={{ fontWeight: '600', color: colors.success }}>{savingsRate}%</Text> of income
                  </Text>
                </>
              ) : savings < 0 ? (
                // Spending exceeds income
                <>
                  <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, marginBottom: 4 }}>
                    Spending exceeds income by
                  </Text>
                  <Text style={{ fontSize: displaySize.xl, fontWeight: '800', color: colors.danger }}>
                    {formatUsdInt(Math.abs(savings))}
                  </Text>
                  <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, marginTop: 8 }}>
                    That's <Text style={{ fontWeight: '600', color: colors.danger }}>{Math.abs(savingsRate)}%</Text> of income
                  </Text>
                </>
              ) : (
                // Broke even
                <>
                  <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, marginBottom: 4 }}>
                    Breaking even
                  </Text>
                  <Text style={{ fontSize: displaySize.md, fontWeight: '700', color: colors.textMuted, marginTop: 8 }}>
                    {formatUsdInt(0)}
                  </Text>
                  <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, marginTop: 4 }}>
                    net
                  </Text>
                </>
              )
            ) : (
              // No income
              <>
                <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, marginBottom: 4 }}>
                  Net (Income - Expense)
                </Text>
                <Text style={{ fontSize: displaySize.sm, fontWeight: '700', color: colors.textMuted, marginTop: 8 }}>
                  No income recorded
                </Text>
                {savings < 0 && (
                  <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, marginTop: 8 }}>
                    <Text style={{ fontSize: fontSize.lg, fontWeight: '700', color: colors.danger }}>{formatUsdInt(Math.abs(savings))}</Text> spent
                  </Text>
                )}
              </>
            )}
          </View>
        )}

        {/* Stats Row: Income / Expense only */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.lg,
              padding: 12,
              alignItems: 'center'
            }}
          >
            <Text
              style={{
                fontSize: fontSize.xs,
                fontWeight: '600',
                color: colors.textMuted,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 4
              }}
            >
              Income
            </Text>
            <Text style={{ fontSize: fontSize.lg, fontWeight: '700', color: colors.text }}>
              {formatUsdInt(totalIncome)}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.lg,
              padding: 12,
              alignItems: 'center'
            }}
          >
            <Text
              style={{
                fontSize: fontSize.xs,
                fontWeight: '600',
                color: colors.textMuted,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 4
              }}
            >
              Expense
            </Text>
            <Text style={{ fontSize: fontSize.lg, fontWeight: '700', color: colors.text }}>
              {formatUsdInt(totalExpense)}
            </Text>
          </View>
        </View>
      </View>

      {/* Section 2: Monthly Cashflow */}
      <View style={{ marginBottom: SECTION_GAP }}>
        <SectionHeader
          title="Monthly cashflow"
          colors={colors}
        />

        <MonthlyCashflowChart
          monthlyData={data.monthlyData}
          currentMonth={currentMonth}
          isCurrentYear={isCurrentYear}
          isPastYear={isPastYear}
          colors={{
            text: colors.text,
            textMuted: colors.textMuted,
            surface: colors.surface,
            surfaceAlt: colors.surfaceAlt,
            success: colors.success,
            danger: colors.danger,
            primary: colors.primary,
            warning: colors.warning
          }}
        />
      </View>

      {/* Section 3: Top Categories */}
      <View style={{ marginBottom: SECTION_GAP }}>
        <SectionHeader
          title="Where it went"
          rightText={totalExpense > 0 ? formatUsdInt(totalExpense) : undefined}
          rightColor={colors.danger}
          colors={colors}
        />

        {displayExpenseCategories.length > 0 ? (
          <>
          <View style={{ gap: 12 }}>
            {displayExpenseCategories.map((cat, idx) => {
              const percent = totalExpense > 0 ? (cat.totalDollar / totalExpense) * 100 : 0
              const barWidth = maxExpenseAmount > 0 ? (cat.totalDollar / maxExpenseAmount) * 100 : 0
              const categoryKey = cat.categoryRef?.categoryKey ?? 'uncategorized'
              const catMeta = getCategoryMeta(cat.categoryRef)
              const hasSubcategories = cat.subcategories && cat.subcategories.length > 0
              const isExpanded = expandedExpenseCategories.has(categoryKey)

              return (
                <View key={idx} style={{ gap: 6 }}>
                  {/* Top row: name + amount + percent (clickable if has subcategories) */}
                  <Pressable
                    onPress={() => hasSubcategories && toggleExpenseCategory(categoryKey)}
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
                    <Text style={{ width: 44, textAlign: 'right', fontSize: fontSize.xs, fontWeight: '600', color: colors.textMuted }}>
                      {Math.round(percent)}%
                    </Text>
                  </Pressable>

                  {/* Bar - neutral color */}
                  <View
                    style={{
                      height: 6,
                      backgroundColor: colors.surfaceAlt,
                      borderRadius: radius.xs,
                      marginLeft: 18,
                      overflow: 'hidden'
                    }}
                  >
                    <View
                      style={{
                        height: '100%',
                        width: `${barWidth}%`,
                        backgroundColor: colors.textMuted,
                        borderRadius: radius.xs
                      }}
                    />
                  </View>

                  {/* Subcategories (accordion) */}
                  {isExpanded && hasSubcategories && (
                    <View style={{ marginLeft: 28, marginTop: 4, gap: 8 }}>
                      {/* Subcategory header showing % is of parent */}
                      <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginBottom: 2 }}>
                        % of {catMeta.name}
                      </Text>
                      {cat.subcategories.map((sub, subIdx) => {
                        const subPercent = cat.totalDollar > 0 ? (sub.totalDollar / cat.totalDollar) * 100 : 0
                        const subBarWidth = cat.subcategories[0].totalDollar > 0
                          ? (sub.totalDollar / cat.subcategories[0].totalDollar) * 100
                          : 0

                        return (
                          <View key={subIdx} style={{ gap: 4 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <View style={{ width: 6, height: 6, borderRadius: radius.full, backgroundColor: colors.textMuted, opacity: 0.6 }} />
                              <Text style={{ flex: 1, fontSize: fontSize.xs, color: colors.text, opacity: 0.8 }} numberOfLines={1}>
                                {getSubcategoryName(catMeta.subCategories, sub.subCategoryKey)}
                              </Text>
                              <Text style={{ fontSize: fontSize.xs, fontWeight: '600', color: colors.text, opacity: 0.8 }}>
                                {formatUsdInt(sub.totalDollar)}
                              </Text>
                              <Text style={{ width: 44, textAlign: 'right', fontSize: fontSize.xs, color: colors.textMuted }}>
                                {Math.round(subPercent)}%
                              </Text>
                            </View>
                            {/* Subcategory bar - neutral */}
                            <View
                              style={{
                                height: 5,
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
          {hasMoreExpense && (
            <Pressable
              onPress={() => setShowAllExpense(!showAllExpense)}
              style={{ marginTop: 16, paddingVertical: 8, alignItems: 'center' }}
            >
              <Text style={{ fontSize: fontSize.sm, fontWeight: '600', color: colors.primary }}>
                {showAllExpense ? 'Show less' : `Show all ${allExpenseCategories.length} categories`}
              </Text>
            </Pressable>
          )}
          </>
        ) : (
          <Text style={{ color: colors.textMuted, textAlign: 'center', paddingVertical: 20 }}>
            No spending yet
          </Text>
        )}
      </View>

      {/* Section 4: Income Categories */}
      {totalIncome > 0 && (
        <View style={{ marginBottom: SECTION_GAP }}>
          <SectionHeader
            title="Where it came from"
            rightText={formatUsdInt(totalIncome)}
            rightColor={colors.success}
            colors={colors}
          />

          {displayIncomeCategories.length > 0 ? (
            <>
            <View style={{ gap: 12 }}>
              {displayIncomeCategories.map((cat, idx) => {
                const percent = totalIncome > 0 ? (cat.totalDollar / totalIncome) * 100 : 0
                const barWidth = maxIncomeAmount > 0 ? (cat.totalDollar / maxIncomeAmount) * 100 : 0
                const categoryKey = cat.categoryRef?.categoryKey ?? 'uncategorized'
                const catMeta = getCategoryMeta(cat.categoryRef)
                const hasSubcategories = cat.subcategories && cat.subcategories.length > 0
                const isExpanded = expandedIncomeCategories.has(categoryKey)

                return (
                  <View key={idx} style={{ gap: 6 }}>
                    {/* Top row: name + amount + percent (clickable if has subcategories) */}
                    <Pressable
                      onPress={() => hasSubcategories && toggleIncomeCategory(categoryKey)}
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
                      <Text style={{ width: 44, textAlign: 'right', fontSize: fontSize.xs, fontWeight: '600', color: colors.textMuted }}>
                        {Math.round(percent)}%
                      </Text>
                    </Pressable>

                    {/* Bar - neutral color */}
                    <View
                      style={{
                        height: 6,
                        backgroundColor: colors.surfaceAlt,
                        borderRadius: radius.xs,
                        marginLeft: 18,
                        overflow: 'hidden'
                      }}
                    >
                      <View
                        style={{
                          height: '100%',
                          width: `${barWidth}%`,
                          backgroundColor: colors.textMuted,
                          borderRadius: radius.xs
                        }}
                      />
                    </View>

                    {/* Subcategories (accordion) */}
                    {isExpanded && hasSubcategories && (
                      <View style={{ marginLeft: 28, marginTop: 4, gap: 8 }}>
                        {/* Subcategory header showing % is of parent */}
                        <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginBottom: 2 }}>
                          % of {catMeta.name}
                        </Text>
                        {cat.subcategories.map((sub, subIdx) => {
                          const subPercent = cat.totalDollar > 0 ? (sub.totalDollar / cat.totalDollar) * 100 : 0
                          const subBarWidth = cat.subcategories[0].totalDollar > 0
                            ? (sub.totalDollar / cat.subcategories[0].totalDollar) * 100
                            : 0

                          return (
                            <View key={subIdx} style={{ gap: 4 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <View style={{ width: 6, height: 6, borderRadius: radius.full, backgroundColor: colors.textMuted, opacity: 0.6 }} />
                                <Text style={{ flex: 1, fontSize: fontSize.xs, color: colors.text, opacity: 0.8 }} numberOfLines={1}>
                                  {getSubcategoryName(catMeta.subCategories, sub.subCategoryKey)}
                                </Text>
                                <Text style={{ fontSize: fontSize.xs, fontWeight: '600', color: colors.text, opacity: 0.8 }}>
                                  {formatUsdInt(sub.totalDollar)}
                                </Text>
                                <Text style={{ width: 44, textAlign: 'right', fontSize: fontSize.xs, color: colors.textMuted }}>
                                  {Math.round(subPercent)}%
                                </Text>
                              </View>
                              {/* Subcategory bar - neutral */}
                              <View
                                style={{
                                  height: 5,
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
            {hasMoreIncome && (
              <Pressable
                onPress={() => setShowAllIncome(!showAllIncome)}
                style={{ marginTop: 16, paddingVertical: 8, alignItems: 'center' }}
              >
                <Text style={{ fontSize: fontSize.sm, fontWeight: '600', color: colors.primary }}>
                  {showAllIncome ? 'Show less' : `Show all ${allIncomeCategories.length} categories`}
                </Text>
              </Pressable>
            )}
            </>
          ) : (
            <Text style={{ color: colors.textMuted, textAlign: 'center', paddingVertical: 20 }}>
              No income yet
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  )
}
