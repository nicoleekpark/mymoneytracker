import React, { useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { displaySize, fontSize, fontWeight, letterSpacing } from '@/shared/theme/tokens/typography'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { CATEGORY_DOT_SIZE, SECTION_GAP, UNCATEGORIZED_COLOR } from '@/shared/theme/tokens/viewStyles'

import { UNCATEGORIZED_KEY, type CategoryRef } from '@/core/domain/category'
import { CATEGORIES } from '@/shared/config/categories.config'
import { FEATURE_FLAGS } from '@/shared/config'
import { SectionHeader } from '@/shared/components'
import { formatUsdInt } from '@/shared/format/currency'

import { MonthlyCashflowChart } from './components'
import { useYearlyHeroData, useYearlyData } from './hooks'

/**
 * Get category display info (name, color) from categoryRef.
 * Returns subCategories array for subcategory name lookup.
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

export type YearlyColors = Readonly<{
  text: string
  textSecondary: string
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
  onMonthPress?: (month: number) => void // 1-12, navigate to monthly view
}

// Top N categories to show
const TOP_N_CATEGORIES = 5

export function YearlyBody({ year, colors, onMonthPress }: Props) {
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
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: spacing['3xl'] }}>
        <Text style={{ color: colors.text, opacity: 0.7 }}>Loading...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: spacing['3xl'] }}>
        <Text style={{ color: colors.danger }}>{error}</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing['3xl'] }}
      showsVerticalScrollIndicator={false}
    >
      {/* Section 1: Hero - Year Overview */}
      <View style={{ marginBottom: SECTION_GAP }}>
        {/* Option A Hero: Net Outcome */}
        {useOptionAHero ? (
          <View style={{ alignItems: 'center', paddingVertical: spacing.xl, marginBottom: spacing.sm }}>
            {/* Title line */}
            <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary, letterSpacing: letterSpacing.wider, marginBottom: spacing.sm }}>
              Net Cash Flow
            </Text>

            {/* Primary: Net amount - neutral color like Assets */}
            <Text
              style={{
                fontSize: displaySize.xl,
                fontWeight: fontWeight.heavy,
                color: colors.text,
                letterSpacing: -1
              }}
            >
              {heroData.netDollar >= 0 ? '+' : ''}{formatUsdInt(heroData.netDollar)}
            </Text>

            {/* Comparison with last year - only delta colored */}
            {heroData.hasLastYearData && heroData.netChangeDollar !== null && (
              <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.sm }}>
                <Text style={{ color: heroData.netChangeDollar >= 0 ? colors.success : colors.danger }}>
                  {heroData.netChangeDollar >= 0 ? '↑' : '↓'} {formatUsdInt(Math.abs(heroData.netChangeDollar))}
                </Text>
                {' '}vs {year - 1}
              </Text>
            )}
          </View>
        ) : (
          /* Current Hero: $ Saved (absolute first, % as supporting) */
          <View style={{ alignItems: 'center', paddingVertical: spacing.xl, marginBottom: spacing.sm }}>
            {totalIncome > 0 ? (
              savings > 0 ? (
                // Positive savings - dollar amount primary, % supporting
                <>
                  <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary, letterSpacing: letterSpacing.wider, marginBottom: spacing.sm }}>
                    Saved
                  </Text>
                  <Text style={{ fontSize: displaySize.xl, fontWeight: fontWeight.heavy, color: colors.success, letterSpacing: -1 }}>
                    {formatUsdInt(savings)}
                  </Text>
                  <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.sm }}>
                    That's <Text style={{ fontWeight: fontWeight.semibold, color: colors.success }}>{savingsRate}%</Text> of income
                  </Text>
                  {/* YoY comparison */}
                  {heroData.hasLastYearData && heroData.netChangeDollar !== null && (
                    <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs }}>
                      <Text style={{ color: heroData.netChangeDollar >= 0 ? colors.success : colors.danger }}>
                        {heroData.netChangeDollar >= 0 ? '↑' : '↓'} {formatUsdInt(Math.abs(heroData.netChangeDollar))}
                      </Text>
                      {' '}vs {year - 1}{heroData.isCurrentYear ? ' YTD' : ''}
                    </Text>
                  )}
                </>
              ) : savings < 0 ? (
                // Spending exceeds income
                <>
                  <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary, letterSpacing: letterSpacing.wider, marginBottom: spacing.sm }}>
                    Spending exceeds income by
                  </Text>
                  <Text style={{ fontSize: displaySize.xl, fontWeight: fontWeight.heavy, color: colors.danger, letterSpacing: -1 }}>
                    {formatUsdInt(Math.abs(savings))}
                  </Text>
                  <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.sm }}>
                    That's <Text style={{ fontWeight: fontWeight.semibold, color: colors.danger }}>{Math.abs(savingsRate)}%</Text> of income
                  </Text>
                  {/* YoY comparison */}
                  {heroData.hasLastYearData && heroData.netChangeDollar !== null && (
                    <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs }}>
                      <Text style={{ color: heroData.netChangeDollar >= 0 ? colors.success : colors.danger }}>
                        {heroData.netChangeDollar >= 0 ? '↑' : '↓'} {formatUsdInt(Math.abs(heroData.netChangeDollar))}
                      </Text>
                      {' '}vs {year - 1}{heroData.isCurrentYear ? ' YTD' : ''}
                    </Text>
                  )}
                </>
              ) : (
                // Broke even
                <>
                  <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary, letterSpacing: letterSpacing.wider, marginBottom: spacing.sm }}>
                    Breaking even
                  </Text>
                  <Text style={{ fontSize: displaySize.md, fontWeight: fontWeight.bold, color: colors.textSecondary }}>
                    {formatUsdInt(0)}
                  </Text>
                  <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs }}>
                    net
                  </Text>
                  {/* YoY comparison */}
                  {heroData.hasLastYearData && heroData.netChangeDollar !== null && (
                    <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs }}>
                      <Text style={{ color: heroData.netChangeDollar >= 0 ? colors.success : colors.danger }}>
                        {heroData.netChangeDollar >= 0 ? '↑' : '↓'} {formatUsdInt(Math.abs(heroData.netChangeDollar))}
                      </Text>
                      {' '}vs {year - 1}{heroData.isCurrentYear ? ' YTD' : ''}
                    </Text>
                  )}
                </>
              )
            ) : (
              // No income
              <>
                <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary, letterSpacing: letterSpacing.wider, marginBottom: spacing.sm }}>
                  Net Cash Flow
                </Text>
                <Text style={{ fontSize: displaySize.sm, fontWeight: fontWeight.bold, color: colors.textSecondary }}>
                  No income recorded
                </Text>
                {savings < 0 && (
                  <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.sm }}>
                    <Text style={{ fontWeight: fontWeight.semibold, color: colors.danger }}>{formatUsdInt(Math.abs(savings))}</Text> spent
                  </Text>
                )}
              </>
            )}
          </View>
        )}

        {/* Stats Row: Income / Expense - Accessible/Tied up style with semantic colors */}
        <View style={{ flexDirection: 'row' }}>
          {/* Income */}
          <View style={{ flex: 1, padding: spacing.lg, alignItems: 'center' }}>
            <Text
              style={{
                fontSize: fontSize.xs,
                fontWeight: fontWeight.medium,
                color: colors.textSecondary,
                letterSpacing: letterSpacing.wider,
                marginBottom: spacing.xs
              }}
            >
              Income
            </Text>
            <Text style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.success, fontVariant: ['tabular-nums'] }}>
              {formatUsdInt(totalIncome)}
            </Text>
          </View>

          {/* Subtle middle divider */}
          <View style={{ width: 1, backgroundColor: colors.border, marginVertical: spacing.sm, opacity: 0.5 }} />

          {/* Expense */}
          <View style={{ flex: 1, padding: spacing.lg, alignItems: 'center' }}>
            <Text
              style={{
                fontSize: fontSize.xs,
                fontWeight: fontWeight.medium,
                color: colors.textSecondary,
                letterSpacing: letterSpacing.wider,
                marginBottom: spacing.xs
              }}
            >
              Expense
            </Text>
            <Text style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.danger, fontVariant: ['tabular-nums'] }}>
              {formatUsdInt(totalExpense)}
            </Text>
          </View>
        </View>
      </View>

      {/* Section 2: Year Cashflow */}
      <View style={{ marginBottom: SECTION_GAP }}>
        <SectionHeader
          title="Year cashflow"
          colors={colors}
        />

        <MonthlyCashflowChart
          monthlyData={data.monthlyData}
          currentMonth={currentMonth}
          isCurrentYear={isCurrentYear}
          isPastYear={isPastYear}
          colors={{
            text: colors.text,
            textSecondary: colors.textSecondary,
            surface: colors.surface,
            surfaceAlt: colors.surfaceAlt,
            success: colors.success,
            danger: colors.danger,
            primary: colors.primary,
            warning: colors.warning
          }}
          onMonthPress={onMonthPress}
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
          <View style={{ gap: spacing.md }}>
            {displayExpenseCategories.map((cat, idx) => {
              const percent = totalExpense > 0 ? (cat.totalDollar / totalExpense) * 100 : 0
              const barWidth = maxExpenseAmount > 0 ? (cat.totalDollar / maxExpenseAmount) * 100 : 0
              const categoryKey = cat.categoryRef?.categoryKey ?? UNCATEGORIZED_KEY
              const catMeta = getCategoryMeta(cat.categoryRef)
              const hasSubcategories = cat.subcategories && cat.subcategories.length > 0
              const isExpanded = expandedExpenseCategories.has(categoryKey)

              return (
                <View key={idx} style={{ gap: spacing.sm }}>
                  {/* Top row: name + amount + percent (clickable if has subcategories) */}
                  <Pressable
                    onPress={() => hasSubcategories && toggleExpenseCategory(categoryKey)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
                    disabled={!hasSubcategories}
                  >
                    <View style={{ width: CATEGORY_DOT_SIZE, height: CATEGORY_DOT_SIZE, borderRadius: radius.full, backgroundColor: catMeta.color }} />
                    <Text style={{ flex: 1, fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text }} numberOfLines={1}>
                      {catMeta.name}
                    </Text>
                    <Text style={{ fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text }}>
                      {formatUsdInt(cat.totalDollar)}
                    </Text>
                    <Text style={{ width: 44, textAlign: 'right', fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.textSecondary }}>
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
                        backgroundColor: colors.textSecondary,
                        borderRadius: radius.sm
                      }}
                    />
                  </View>

                  {/* Subcategories (accordion) */}
                  {isExpanded && hasSubcategories && (
                    <View style={{ marginLeft: spacing.xl + spacing.xs, marginTop: spacing.xs, gap: spacing.sm }}>
                      {/* Subcategory header showing % is of parent */}
                      <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: spacing.xs }}>
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
                              <View style={{ width: 6, height: 6, borderRadius: radius.full, backgroundColor: colors.textSecondary, opacity: 0.6 }} />
                              <Text style={{ flex: 1, fontSize: fontSize.xs, color: colors.text, opacity: 0.8 }} numberOfLines={1}>
                                {getSubcategoryName(catMeta.subCategories, sub.subCategoryKey)}
                              </Text>
                              <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.text, opacity: 0.8 }}>
                                {formatUsdInt(sub.totalDollar)}
                              </Text>
                              <Text style={{ width: 44, textAlign: 'right', fontSize: fontSize.xs, color: colors.textSecondary }}>
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
                                  backgroundColor: colors.textSecondary,
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
              style={{ marginTop: spacing.lg, paddingVertical: spacing.sm, alignItems: 'center' }}
            >
              <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textSecondary }}>
                {showAllExpense ? 'Show less' : `Show all ${allExpenseCategories.length} categories`}
              </Text>
            </Pressable>
          )}
          </>
        ) : (
          <Text style={{ color: colors.textSecondary, textAlign: 'center', paddingVertical: spacing.xl }}>
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
            <View style={{ gap: spacing.md }}>
              {displayIncomeCategories.map((cat, idx) => {
                const percent = totalIncome > 0 ? (cat.totalDollar / totalIncome) * 100 : 0
                const barWidth = maxIncomeAmount > 0 ? (cat.totalDollar / maxIncomeAmount) * 100 : 0
                const categoryKey = cat.categoryRef?.categoryKey ?? UNCATEGORIZED_KEY
                const catMeta = getCategoryMeta(cat.categoryRef)
                const hasSubcategories = cat.subcategories && cat.subcategories.length > 0
                const isExpanded = expandedIncomeCategories.has(categoryKey)

                return (
                  <View key={idx} style={{ gap: spacing.sm }}>
                    {/* Top row: name + amount + percent (clickable if has subcategories) */}
                    <Pressable
                      onPress={() => hasSubcategories && toggleIncomeCategory(categoryKey)}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
                      disabled={!hasSubcategories}
                    >
                      <View style={{ width: CATEGORY_DOT_SIZE, height: CATEGORY_DOT_SIZE, borderRadius: radius.full, backgroundColor: catMeta.color }} />
                      <Text style={{ flex: 1, fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text }} numberOfLines={1}>
                        {catMeta.name}
                      </Text>
                      <Text style={{ fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text }}>
                        {formatUsdInt(cat.totalDollar)}
                      </Text>
                      <Text style={{ width: 44, textAlign: 'right', fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.textSecondary }}>
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
                          backgroundColor: colors.textSecondary,
                          borderRadius: radius.sm
                        }}
                      />
                    </View>

                    {/* Subcategories (accordion) */}
                    {isExpanded && hasSubcategories && (
                      <View style={{ marginLeft: spacing.xl + spacing.xs, marginTop: spacing.xs, gap: spacing.sm }}>
                        {/* Subcategory header showing % is of parent */}
                        <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: spacing.xs }}>
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
                                <View style={{ width: 6, height: 6, borderRadius: radius.full, backgroundColor: colors.textSecondary, opacity: 0.6 }} />
                                <Text style={{ flex: 1, fontSize: fontSize.xs, color: colors.text, opacity: 0.8 }} numberOfLines={1}>
                                  {getSubcategoryName(catMeta.subCategories, sub.subCategoryKey)}
                                </Text>
                                <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.text, opacity: 0.8 }}>
                                  {formatUsdInt(sub.totalDollar)}
                                </Text>
                                <Text style={{ width: 44, textAlign: 'right', fontSize: fontSize.xs, color: colors.textSecondary }}>
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
                                    backgroundColor: colors.textSecondary,
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
                style={{ marginTop: spacing.lg, paddingVertical: spacing.sm, alignItems: 'center' }}
              >
                <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textSecondary }}>
                  {showAllIncome ? 'Show less' : `Show all ${allIncomeCategories.length} categories`}
                </Text>
              </Pressable>
            )}
            </>
          ) : (
            <Text style={{ color: colors.textSecondary, textAlign: 'center', paddingVertical: spacing.xl }}>
              No income yet
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  )
}
