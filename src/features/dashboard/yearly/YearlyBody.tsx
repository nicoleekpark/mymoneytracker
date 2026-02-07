import React, { useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'

import type { CategoryRef } from '@/domain/category'
import { CATEGORIES } from '@/config/categories.config'
import { formatUsdInt } from '@/shared/format/currency'

import { MonthlyCashflowChart } from './components'

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
}>

type Props = {
  year: number
  colors: YearlyColors
}

// Section gap for combined style (matching Monthly)
const SECTION_GAP = 40

// Accent line colors (matching Monthly)
const ACCENT_COLORS = {
  blue: '#60a5fa',
  red: '#f87171',
}

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
      <View style={{ width: 3, height: 20, borderRadius: 2, backgroundColor: accentColor }} />
      <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
        {title}
      </Text>
      {rightText && (
        <Text style={{ marginLeft: 'auto', fontSize: 14, fontWeight: '700', color: rightColor || colors.text }}>
          {rightText}
        </Text>
      )}
    </View>
  )
}

export function YearlyBody({ year, colors }: Props) {
  const { loading, error, data } = useYearlyData(year)

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

  // Top expense categories
  const topExpenseCategories = useMemo(() => {
    return data.expenseByCategory
      .sort((a, b) => b.totalDollar - a.totalDollar)
      .slice(0, TOP_N_CATEGORIES)
  }, [data.expenseByCategory])

  // Top income categories
  const topIncomeCategories = useMemo(() => {
    return data.incomeByCategory
      .sort((a, b) => b.totalDollar - a.totalDollar)
      .slice(0, TOP_N_CATEGORIES)
  }, [data.incomeByCategory])

  // Calculate max for category bars
  const maxExpenseAmount = topExpenseCategories.length > 0 ? topExpenseCategories[0].totalDollar : 0
  const maxIncomeAmount = topIncomeCategories.length > 0 ? topIncomeCategories[0].totalDollar : 0

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
        {/* Hero savings rate */}
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          {totalIncome > 0 ? (
            savings > 0 ? (
              // Positive savings
              <>
                <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 4 }}>
                  {isCurrentYear ? "You're saving" : 'You saved'}
                </Text>
                <Text style={{ fontSize: 52, fontWeight: '800', color: colors.success }}>
                  {savingsRate}%
                </Text>
                <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
                  of income
                </Text>
                <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 8 }}>
                  That's <Text style={{ fontSize: 16, fontWeight: '700', color: colors.success }}>{formatUsdInt(savings)}</Text>
                </Text>
              </>
            ) : savings < 0 ? (
              // Overspent
              <>
                <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 4 }}>
                  {isCurrentYear ? "You're overspending" : 'You overspent'}
                </Text>
                <Text style={{ fontSize: 52, fontWeight: '800', color: colors.danger }}>
                  {Math.abs(savingsRate)}%
                </Text>
                <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
                  of income
                </Text>
                <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 8 }}>
                  That's <Text style={{ fontSize: 16, fontWeight: '700', color: colors.danger }}>{formatUsdInt(Math.abs(savings))}</Text>
                </Text>
              </>
            ) : (
              // Broke even
              <>
                <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 4 }}>
                  {isCurrentYear ? "You're breaking even" : 'You broke even'}
                </Text>
                <Text style={{ fontSize: 32, fontWeight: '700', color: colors.textMuted, marginTop: 8 }}>
                  {formatUsdInt(0)}
                </Text>
                <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
                  saved
                </Text>
              </>
            )
          ) : (
            // No income
            <>
              <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 4 }}>
                Savings
              </Text>
              <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textMuted, marginTop: 8 }}>
                {isCurrentYear ? 'No income yet' : 'No income'}
              </Text>
              {savings < 0 && (
                <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 8 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.danger }}>{formatUsdInt(Math.abs(savings))}</Text> spent
                </Text>
              )}
            </>
          )}
        </View>

        {/* Income / Expense row */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              padding: 16,
              alignItems: 'center'
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: '600',
                color: colors.text,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 4
              }}
            >
              Income
            </Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.success }}>
              {formatUsdInt(totalIncome)}
            </Text>
            {/* YoY Badge */}
            {data.yoy.hasLastYearData && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 2,
                  marginTop: 6,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                  backgroundColor: data.yoy.incomeChangePercent >= 0
                    ? 'rgba(74, 222, 128, 0.15)'
                    : 'rgba(248, 113, 113, 0.15)'
                }}
              >
                <Text
                  style={{
                    fontSize: 9,
                    fontWeight: '600',
                    color: data.yoy.incomeChangePercent >= 0 ? '#4ade80' : '#f87171'
                  }}
                >
                  {data.yoy.incomeChangePercent >= 0 ? '▲' : '▼'} {Math.abs(data.yoy.incomeChangePercent)}% vs last year
                </Text>
              </View>
            )}
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              padding: 16,
              alignItems: 'center'
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: '600',
                color: colors.text,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 4
              }}
            >
              Expense
            </Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.danger }}>
              {formatUsdInt(totalExpense)}
            </Text>
            {/* YoY Badge - for expense, up is bad (red), down is good (green) */}
            {data.yoy.hasLastYearData && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 2,
                  marginTop: 6,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                  backgroundColor: data.yoy.expenseChangePercent <= 0
                    ? 'rgba(74, 222, 128, 0.15)'
                    : 'rgba(248, 113, 113, 0.15)'
                }}
              >
                <Text
                  style={{
                    fontSize: 9,
                    fontWeight: '600',
                    color: data.yoy.expenseChangePercent <= 0 ? '#4ade80' : '#f87171'
                  }}
                >
                  {data.yoy.expenseChangePercent >= 0 ? '▲' : '▼'} {Math.abs(data.yoy.expenseChangePercent)}% vs last year
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Section 2: Monthly Cashflow */}
      <View style={{ marginBottom: SECTION_GAP }}>
        <SectionHeader
          title="Monthly cashflow"
          accentColor={ACCENT_COLORS.blue}
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
            primary: colors.primary
          }}
        />
      </View>

      {/* Section 3: Top Categories */}
      <View style={{ marginBottom: SECTION_GAP }}>
        <SectionHeader
          title="Where it went"
          accentColor={ACCENT_COLORS.red}
          rightText={totalExpense > 0 ? formatUsdInt(totalExpense) : undefined}
          rightColor={colors.danger}
          colors={colors}
        />

        {topExpenseCategories.length > 0 ? (
          <View style={{ gap: 12 }}>
            {topExpenseCategories.map((cat, idx) => {
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
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: catMeta.color }} />
                    <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: colors.text }} numberOfLines={1}>
                      {catMeta.name}
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>
                      {formatUsdInt(cat.totalDollar)}
                    </Text>
                    <Text style={{ width: 38, textAlign: 'right', fontSize: 11, fontWeight: '600', color: colors.textMuted }}>
                      {Math.round(percent)}%
                    </Text>
                    {/* Chevron indicator */}
                    {hasSubcategories && (
                      <Text style={{ fontSize: 10, color: colors.textMuted, marginLeft: 4 }}>
                        {isExpanded ? '▼' : '▶'}
                      </Text>
                    )}
                  </Pressable>

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
                        backgroundColor: catMeta.color,
                        borderRadius: 4
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
                              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: subMeta.color }} />
                              <Text style={{ flex: 1, fontSize: 12, color: colors.text, opacity: 0.8 }} numberOfLines={1}>
                                {subMeta.name}
                              </Text>
                              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, opacity: 0.8 }}>
                                {formatUsdInt(sub.totalDollar)}
                              </Text>
                              <Text style={{ width: 38, textAlign: 'right', fontSize: 10, color: colors.textMuted }}>
                                {Math.round(subPercent)}%
                              </Text>
                            </View>
                            {/* Subcategory bar */}
                            <View
                              style={{
                                height: 4,
                                backgroundColor: colors.surfaceAlt,
                                borderRadius: 2,
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
                                  borderRadius: 2
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
            accentColor={ACCENT_COLORS.blue}
            rightText={formatUsdInt(totalIncome)}
            rightColor={colors.success}
            colors={colors}
          />

          {topIncomeCategories.length > 0 ? (
            <View style={{ gap: 12 }}>
              {topIncomeCategories.map((cat, idx) => {
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
                      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: catMeta.color }} />
                      <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: colors.text }} numberOfLines={1}>
                        {catMeta.name}
                      </Text>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>
                        {formatUsdInt(cat.totalDollar)}
                      </Text>
                      <Text style={{ width: 38, textAlign: 'right', fontSize: 11, fontWeight: '600', color: colors.textMuted }}>
                        {Math.round(percent)}%
                      </Text>
                      {/* Chevron indicator */}
                      {hasSubcategories && (
                        <Text style={{ fontSize: 10, color: colors.textMuted, marginLeft: 4 }}>
                          {isExpanded ? '▼' : '▶'}
                        </Text>
                      )}
                    </Pressable>

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
                          backgroundColor: catMeta.color,
                          borderRadius: 4
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
                                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: subMeta.color }} />
                                <Text style={{ flex: 1, fontSize: 12, color: colors.text, opacity: 0.8 }} numberOfLines={1}>
                                  {subMeta.name}
                                </Text>
                                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, opacity: 0.8 }}>
                                  {formatUsdInt(sub.totalDollar)}
                                </Text>
                                <Text style={{ width: 38, textAlign: 'right', fontSize: 10, color: colors.textMuted }}>
                                  {Math.round(subPercent)}%
                                </Text>
                              </View>
                              {/* Subcategory bar */}
                              <View
                                style={{
                                  height: 4,
                                  backgroundColor: colors.surfaceAlt,
                                  borderRadius: 2,
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
                                    borderRadius: 2
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
