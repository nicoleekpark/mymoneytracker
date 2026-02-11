import React, { useEffect, useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { displaySize, fontSize } from '@/theme/tokens/typography'
import { radius } from '@/theme/tokens/radius'
import { useHoHTheme } from '@/providers'

import type { CategoryRef } from '@/domain/category'
import { CATEGORIES } from '@/config/categories.config'
import { FEATURE_FLAGS } from '@/config'
import { formatUsdInt } from '@/shared/format/currency'
import { getYearlyProjection, type YearlyProjection } from '@/domain/transaction/transaction.usecase'

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

// Accent colors now come from theme (see theme.accent)

// Top N categories to show
const TOP_N_CATEGORIES = 5

/**
 * Section header with accent line - matching Monthly style
 */
function SectionHeader({
  title,
  accentColor,
  rightText,
  rightColor,
  colors
}: {
  title: string
  accentColor: string
  rightText?: string
  rightColor?: string
  colors: YearlyColors
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <View style={{ width: 3, height: 20, borderRadius: radius.xs, backgroundColor: accentColor }} />
      <Text style={{ fontSize: fontSize['2xl'], fontWeight: '700', color: colors.text }}>
        {title}
      </Text>
      {rightText && (
        <Text style={{ marginLeft: 'auto', fontSize: fontSize.md, fontWeight: '700', color: rightColor || colors.text }}>
          {rightText}
        </Text>
      )}
    </View>
  )
}

export function YearlyBody({ year, colors }: Props) {
  const { loading, error, data } = useYearlyData(year)
  const { data: heroData } = useYearlyHeroData(year)
  const theme = useHoHTheme()

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

  // Projection data (only for current year)
  const [projection, setProjection] = useState<YearlyProjection | null>(null)

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  // Fetch projection for current year
  useEffect(() => {
    if (year !== currentYear) {
      setProjection(null)
      return
    }

    let alive = true
    async function fetchProjection() {
      try {
        const proj = await getYearlyProjection(year)
        if (alive && proj.monthsElapsed > 0) {
          setProjection(proj)
        }
      } catch {
        // Ignore errors
      }
    }
    fetchProjection()
    return () => { alive = false }
  }, [year, currentYear])
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
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            {/* Title line */}
            <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, marginBottom: 4 }}>
              Net
            </Text>

            {/* Primary: Net amount */}
            <Text
              style={{
                fontSize: displaySize.xl,
                fontWeight: '800',
                color: heroData.netDollar >= 0 ? colors.success : colors.danger
              }}
            >
              {heroData.netDollar >= 0 ? '+' : ''}{formatUsdInt(heroData.netDollar)}
            </Text>

            {/* Comparison with last year */}
            {heroData.hasLastYearData && heroData.netChangeDollar !== null && (
              <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, marginTop: 8 }}>
                {heroData.netChangeDollar >= 0 ? 'Ahead of' : 'Behind'} last year by {formatUsdInt(Math.abs(heroData.netChangeDollar))}
              </Text>
            )}

            {/* Supporting: Average monthly net */}
            {heroData.monthsElapsed > 0 && (
              <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: 12, opacity: 0.8 }}>
                Average monthly net: {heroData.avgMonthlyNetDollar >= 0 ? '+' : ''}{formatUsdInt(heroData.avgMonthlyNetDollar)}
              </Text>
            )}

            {/* Nudge */}
            {heroData.netDollar > 0 && heroData.isCurrentYear && (
              <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: 8, opacity: 0.6, fontStyle: 'italic' }}>
                Stay on track, small wins add up
              </Text>
            )}
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
                  Net
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

        {/* 2x2 Stats Grid */}
        <View style={{ gap: 12 }}>
          {/* Row 1: Income / Expense */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.lg,
                padding: 16,
                alignItems: 'center'
              }}
            >
              <Text
                style={{
                  fontSize: fontSize.xs,
                  fontWeight: '600',
                  color: colors.text,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: 4
                }}
              >
                Total Income
              </Text>
              <Text style={{ fontSize: fontSize.xl, fontWeight: '800', color: colors.success }}>
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
                padding: 16,
                alignItems: 'center'
              }}
            >
              <Text
                style={{
                  fontSize: fontSize.xs,
                  fontWeight: '600',
                  color: colors.text,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: 4
                }}
              >
                Total Expense
              </Text>
              <Text style={{ fontSize: fontSize.xl, fontWeight: '800', color: colors.danger }}>
                {formatUsdInt(totalExpense)}
              </Text>
            </View>
          </View>

          {/* Row 2: Total Net / Avg Net per Month */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.lg,
                padding: 16,
                alignItems: 'center'
              }}
            >
              <Text
                style={{
                  fontSize: fontSize.xs,
                  fontWeight: '600',
                  color: colors.text,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: 4
                }}
              >
                Total Net
              </Text>
              <Text style={{ fontSize: fontSize.xl, fontWeight: '800', color: savings >= 0 ? colors.success : colors.danger }}>
                {formatUsdInt(savings)}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.lg,
                padding: 16,
                alignItems: 'center'
              }}
            >
              <Text
                style={{
                  fontSize: fontSize.xs,
                  fontWeight: '600',
                  color: colors.text,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: 4
                }}
              >
                Avg Net / Month
              </Text>
              <Text style={{ fontSize: fontSize.xl, fontWeight: '800', color: (data.monthlyAverageIncome - data.monthlyAverageExpense) >= 0 ? colors.success : colors.danger }}>
                {formatUsdInt(data.monthlyAverageIncome - data.monthlyAverageExpense)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Section 2: Projection (current year only) */}
      {projection && isCurrentYear && (
        <View style={{ marginBottom: SECTION_GAP }}>
          {/* Month indicator */}
          <Text style={{ fontSize: fontSize.xs, fontWeight: '500', color: colors.textMuted, textAlign: 'right', marginBottom: 4 }}>
            Month {Math.round(projection.monthsElapsed)} of 12
          </Text>

          {/* Hero projection - same style as Section 1 */}
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            {projection.projectedIncome > 0 ? (
              projection.projectedSavings > 0 ? (
                // Positive projection
                <>
                  <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, marginBottom: 4 }}>
                    At this rate, you'll save
                  </Text>
                  <Text style={{ fontSize: displaySize.lg, fontWeight: '800', color: colors.success }}>
                    {formatUsdInt(projection.projectedSavings)}
                  </Text>
                  <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 }}>
                    by year-end
                  </Text>
                  <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, marginTop: 8 }}>
                    That's <Text style={{ fontSize: fontSize.lg, fontWeight: '700', color: colors.success }}>{projection.projectedSavingsRate}%</Text> of income
                  </Text>
                </>
              ) : projection.projectedSavings < 0 ? (
                // Negative projection (spending exceeds income)
                <>
                  <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, marginBottom: 4 }}>
                    At this rate, spending will exceed income by
                  </Text>
                  <Text style={{ fontSize: displaySize.lg, fontWeight: '800', color: colors.danger }}>
                    {formatUsdInt(Math.abs(projection.projectedSavings))}
                  </Text>
                  <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 }}>
                    by year-end
                  </Text>
                </>
              ) : (
                // Break even projection
                <>
                  <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, marginBottom: 4 }}>
                    At this rate, you'll break even
                  </Text>
                  <Text style={{ fontSize: displaySize.md, fontWeight: '700', color: colors.textMuted, marginTop: 8 }}>
                    {formatUsdInt(0)}
                  </Text>
                  <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, marginTop: 4 }}>
                    by year-end
                  </Text>
                </>
              )
            ) : (
              // No income projection
              <>
                <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, marginBottom: 4 }}>
                  Year-end projection
                </Text>
                <Text style={{ fontSize: displaySize.sm, fontWeight: '700', color: colors.textMuted, marginTop: 8 }}>
                  No income yet
                </Text>
              </>
            )}
          </View>

          {/* Projected Income / Expense row - outline style with YoY badges */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.lg,
                padding: 16,
                alignItems: 'center'
              }}
            >
              <Text
                style={{
                  fontSize: fontSize.xs,
                  fontWeight: '600',
                  color: colors.text,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: 4
                }}
              >
                Income
              </Text>
              <Text style={{ fontSize: fontSize.xl, fontWeight: '800', color: colors.success }}>
                {formatUsdInt(projection.projectedIncome)}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.lg,
                padding: 16,
                alignItems: 'center'
              }}
            >
              <Text
                style={{
                  fontSize: fontSize.xs,
                  fontWeight: '600',
                  color: colors.text,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: 4
                }}
              >
                Expense
              </Text>
              <Text style={{ fontSize: fontSize.xl, fontWeight: '800', color: colors.danger }}>
                {formatUsdInt(projection.projectedExpense)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Section 3: Monthly Cashflow */}
      <View style={{ marginBottom: SECTION_GAP }}>
        <SectionHeader
          title="Monthly cashflow"
          accentColor={theme.accent.blue}
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
          accentColor={theme.accent.amber}
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
                      {/* Subcategory header showing % is of parent */}
                      <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginBottom: 2 }}>
                        % of {catMeta.name}
                      </Text>
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
            accentColor={theme.accent.green}
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
                        {/* Subcategory header showing % is of parent */}
                        <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginBottom: 2 }}>
                          % of {catMeta.name}
                        </Text>
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
