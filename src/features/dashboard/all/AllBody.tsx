import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { displaySize, fontSize, fontWeight, letterSpacing } from '@/shared/theme/tokens/typography'
import { CATEGORY_DOT_SIZE, SECTION_GAP } from '@/shared/theme/tokens/viewStyles'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  Text,
  UIManager,
  View,
} from 'react-native'

import { useFocusEffect } from '@react-navigation/native'

import { UNCATEGORIZED_KEY } from '@/core/domain/category'
import {
  CategoryIcon,
  EmptyState,
  InfoSheet,
  SectionHeader,
  TrackingSince,
} from '@/shared/components'
import { FEATURE_FLAGS } from '@/shared/config'
import { getCategoryMeta, getSubcategoryMeta } from '@/shared/format/category'
import { formatUsdInt } from '@/shared/format/currency'
import { formatYearMonth } from '@/shared/format/date'
import { useDashboardSectionsStore } from '@/shared/store'

import { CollapsibleSection, CumulativeNetChart, SectionPlaceholder } from './components'
import { useAllTimeData, type CategoryBreakdown } from './hooks'

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

export type AllColors = Readonly<{
  text: string
  textSecondary: string
  border: string
  surface: string
  surfaceAlt: string
  primary: string
  success: string
  danger: string
}>

type Props = {
  colors: AllColors
}

type AggregatedCategory = {
  categoryKey: string
  categoryRef?: CategoryBreakdown['categoryRef']
  amount: number
  subcategories: { name: string; icon: string; color: string; amount: number }[]
}

function aggregateCategories(categories: CategoryBreakdown[]): AggregatedCategory[] {
  const byParent = new Map<string, AggregatedCategory>()

  for (const cat of categories) {
    const parentKey = cat.categoryRef?.categoryKey ?? UNCATEGORIZED_KEY
    const subKey = cat.categoryRef?.subCategoryKey
    const existing = byParent.get(parentKey)

    // Build subcategory info if exists
    let subInfo: { name: string; icon: string; color: string; amount: number } | null = null
    if (subKey && cat.categoryRef?.categoryKey) {
      const subMeta = getSubcategoryMeta(cat.categoryRef.categoryKey, subKey)
      if (subMeta) {
        subInfo = { ...subMeta, amount: cat.totalDollar }
      }
    }

    if (existing) {
      existing.amount += cat.totalDollar
      if (subInfo) {
        existing.subcategories.push(subInfo)
      }
    } else {
      byParent.set(parentKey, {
        categoryKey: parentKey,
        categoryRef: cat.categoryRef
          ? { type: cat.categoryRef.type, categoryKey: cat.categoryRef.categoryKey }
          : undefined,
        amount: cat.totalDollar,
        subcategories: subInfo ? [subInfo] : [],
      })
    }
  }

  // Sort subcategories by amount and limit
  for (const cat of byParent.values()) {
    cat.subcategories.sort((a, b) => b.amount - a.amount)
    cat.subcategories = cat.subcategories.slice(0, 5)
  }

  return Array.from(byParent.values()).sort((a, b) => b.amount - a.amount)
}

function SavingsRateInfoSheet({
  visible,
  onClose,
  colors,
}: {
  visible: boolean
  onClose: () => void
  colors: AllColors
}) {
  return (
    <InfoSheet
      visible={visible}
      onClose={onClose}
      title="Savings Rate"
      colors={{
        surface: colors.surface,
        text: colors.text,
        textSecondary: colors.textSecondary,
        surfaceAlt: colors.surfaceAlt,
        primary: colors.primary,
      }}
    >
      {/* Description */}
      <Text
        style={{
          fontSize: fontSize.md,
          color: colors.textSecondary,
          lineHeight: 20,
          marginBottom: spacing.lg,
        }}
      >
        The percentage of income you kept after expenses.
      </Text>

      {/* Formula - Fraction style in one line */}
      <View
        style={{
          backgroundColor: colors.surfaceAlt,
          borderRadius: radius.lg,
          padding: spacing.lg,
          alignItems: 'center',
          marginBottom: spacing.lg,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <View style={{ alignItems: 'center' }}>
            <Text
              style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text }}
            >
              Income − Expense
            </Text>
            <View
              style={{
                width: 120,
                height: 1,
                backgroundColor: colors.text,
                marginVertical: spacing.xs,
              }}
            />
            <Text
              style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text }}
            >
              Income
            </Text>
          </View>
          <Text
            style={{ fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text }}
          >
            × 100
          </Text>
        </View>
      </View>

      {/* Benchmark */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.xl,
        }}
      >
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: radius.full,
            backgroundColor: colors.success,
          }}
        />
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>
          <Text style={{ fontWeight: fontWeight.bold, color: colors.text }}>20%+</Text> is a common
          healthy target
        </Text>
      </View>

      {/* Context */}
      <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, lineHeight: 18 }}>
        Based on the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Your ideal rate depends on
        your goals.
      </Text>
    </InfoSheet>
  )
}

export function AllBody({ colors }: Props) {
  const { loading, error, data } = useAllTimeData()

  // Feature flag for hero variant
  const useOptionAHero = FEATURE_FLAGS.heroVariant === 'optionA'

  const [expandedExpenseCategories, setExpandedExpenseCategories] = useState<Set<string>>(new Set())
  const [expandedIncomeCategories, setExpandedIncomeCategories] = useState<Set<string>>(new Set())
  const [showAllExpense, setShowAllExpense] = useState(false)
  const [showAllIncome, setShowAllIncome] = useState(false)
  const [showSavingsInfo, setShowSavingsInfo] = useState(false)

  // Close info sheet when navigating away to prevent stale state on return
  useFocusEffect(
    useCallback(() => {
      return () => {
        setShowSavingsInfo(false)
      }
    }, [])
  )

  // Collapsible section states from persisted store
  // Net worth growth: needs 2+ months of data
  // Personal bests: needs data to exist
  const hasNetWorthData = data.cumulativeData.length > 1
  const hasPersonalBestsData = Boolean(
    data.personalBests.bestSavingsMonth || data.personalBests.worstMonth
  )

  // Get persisted section states
  const {
    netWorthExpanded,
    personalBestsExpanded,
    setNetWorthExpanded,
    setPersonalBestsExpanded,
    _hydrate,
  } = useDashboardSectionsStore()

  // Hydrate store on mount
  useEffect(() => {
    _hydrate()
  }, [_hydrate])

  // Track if we've auto-expanded on first data availability
  const hasAutoExpandedNetWorthRef = useRef(false)
  const hasAutoExpandedPersonalBestsRef = useRef(false)

  // Auto-expand when data becomes available (one-time)
  useEffect(() => {
    if (hasNetWorthData && !hasAutoExpandedNetWorthRef.current && !netWorthExpanded) {
      hasAutoExpandedNetWorthRef.current = true
      setNetWorthExpanded(true)
    }
  }, [hasNetWorthData, netWorthExpanded, setNetWorthExpanded])

  useEffect(() => {
    if (
      hasPersonalBestsData &&
      !hasAutoExpandedPersonalBestsRef.current &&
      !personalBestsExpanded
    ) {
      hasAutoExpandedPersonalBestsRef.current = true
      setPersonalBestsExpanded(true)
    }
  }, [hasPersonalBestsData, personalBestsExpanded, setPersonalBestsExpanded])

  // Handlers for CollapsibleSection
  const handleNetWorthToggle = useCallback(() => {
    setNetWorthExpanded(!netWorthExpanded)
  }, [netWorthExpanded, setNetWorthExpanded])

  const handlePersonalBestsToggle = useCallback(() => {
    setPersonalBestsExpanded(!personalBestsExpanded)
  }, [personalBestsExpanded, setPersonalBestsExpanded])

  // No-op handlers for onUnlock (auto-expand is handled above)
  const handleNetWorthUnlock = useCallback(() => {}, [])
  const handlePersonalBestsUnlock = useCallback(() => {}, [])

  const TOP_N_CATEGORIES = 5

  // All categories sorted by amount
  const allExpenseCategories = useMemo(
    () => aggregateCategories(data.expenseByCategory),
    [data.expenseByCategory]
  )
  const allIncomeCategories = useMemo(
    () => aggregateCategories(data.incomeByCategory),
    [data.incomeByCategory]
  )

  // Display categories based on showAll state
  const displayExpenseCategories = showAllExpense
    ? allExpenseCategories
    : allExpenseCategories.slice(0, TOP_N_CATEGORIES)
  const displayIncomeCategories = showAllIncome
    ? allIncomeCategories
    : allIncomeCategories.slice(0, TOP_N_CATEGORIES)
  const hasMoreExpense = allExpenseCategories.length > TOP_N_CATEGORIES
  const hasMoreIncome = allIncomeCategories.length > TOP_N_CATEGORIES

  // Max amounts for category bars
  const maxExpenseAmount = allExpenseCategories.length > 0 ? allExpenseCategories[0].amount : 0
  const maxIncomeAmount = allIncomeCategories.length > 0 ? allIncomeCategories[0].amount : 0

  function toggleExpenseCategory(categoryKey: string) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpandedExpenseCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryKey)) {
        next.delete(categoryKey)
      } else {
        next.add(categoryKey)
      }
      return next
    })
  }

  function toggleIncomeCategory(categoryKey: string) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpandedIncomeCategories((prev) => {
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
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: spacing['3xl'],
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: spacing['3xl'],
        }}
      >
        <Text style={{ color: colors.danger }}>{error}</Text>
      </View>
    )
  }

  // Check if there's any data at all
  const hasAnyData = data.totalIncome > 0 || data.totalExpense > 0

  if (!hasAnyData) {
    return (
      <EmptyState
        title="No transactions yet"
        description="Add transactions to see your all-time summary."
        colors={colors}
      />
    )
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing['3xl'] }}
      showsVerticalScrollIndicator={false}
    >
      {/* Savings Rate Info Sheet */}
      <SavingsRateInfoSheet
        visible={showSavingsInfo}
        onClose={() => setShowSavingsInfo(false)}
        colors={colors}
      />

      {/* Section 1: All-Time Overview */}
      <View style={{
        marginBottom: SECTION_GAP,
        backgroundColor: colors.primary + '0F',
        borderRadius: 16,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: spacing.lg,
        marginHorizontal: -spacing.md,
      }}>
        {/* Tracking since subtitle */}
        <TrackingSince date={data.firstTransactionDate} color={colors.textSecondary} />

        {/* Hero */}
        {useOptionAHero ? (
          /* Option A Hero: Net Outcome */
          <View
            style={{ alignItems: 'center', paddingVertical: spacing.xl, marginBottom: spacing.sm }}
          >
            {/* Title line */}
            <Text
              style={{
                fontSize: fontSize.xs,
                fontWeight: fontWeight.medium,
                color: colors.textSecondary,
                letterSpacing: letterSpacing.wider,
                marginBottom: spacing.sm,
              }}
            >
              Net Cash Flow
            </Text>

            {/* Primary: Net amount - neutral color like Assets */}
            <Text
              style={{
                fontSize: displaySize.xl,
                fontWeight: fontWeight.heavy,
                color: colors.text,
                letterSpacing: -1,
              }}
            >
              {data.netAmount >= 0 ? '+' : '-'}
              {formatUsdInt(Math.abs(data.netAmount))}
            </Text>

            {/* Supporting: Current streak (only if positive streak) */}
            {data.personalBests.currentStreak.isPositive &&
              data.personalBests.currentStreak.months > 0 && (
                <Text
                  style={{
                    fontSize: fontSize.sm,
                    color: colors.textSecondary,
                    marginTop: spacing.sm,
                  }}
                >
                  {data.personalBests.currentStreak.months} positive-net{' '}
                  {data.personalBests.currentStreak.months === 1 ? 'month' : 'months'} in a row
                </Text>
              )}
          </View>
        ) : (
          /* Current Hero: % Saved */
          <View
            style={{ alignItems: 'center', paddingVertical: spacing.xl, marginBottom: spacing.sm }}
          >
            {data.totalIncome > 0 ? (
              data.netAmount > 0 ? (
                // Positive savings
                <>
                  <Pressable
                    onPress={() => setShowSavingsInfo(true)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.xs,
                      marginBottom: spacing.sm,
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Lifetime savings rate. Tap for more info"
                    accessibilityHint="Shows explanation of how savings rate is calculated"
                  >
                    <Text
                      style={{
                        fontSize: fontSize.xs,
                        fontWeight: fontWeight.medium,
                        color: colors.textSecondary,
                        letterSpacing: letterSpacing.wider,
                      }}
                    >
                      Lifetime savings rate
                    </Text>
                    <CategoryIcon name="info-circle" size={12} color={colors.textSecondary} />
                  </Pressable>
                  <Text
                    style={{
                      fontSize: displaySize.xl,
                      fontWeight: fontWeight.heavy,
                      color: colors.text,
                      letterSpacing: -1,
                    }}
                  >
                    {data.savingsRate.toFixed(0)}%
                  </Text>
                  <Text
                    style={{
                      fontSize: fontSize.sm,
                      color: colors.textSecondary,
                      marginTop: spacing.sm,
                    }}
                  >
                    That's{' '}
                    <Text style={{ fontWeight: fontWeight.semibold, color: colors.success }}>
                      {formatUsdInt(data.netAmount)}
                    </Text>{' '}
                    saved
                  </Text>
                  <Text
                    style={{
                      fontSize: fontSize.xs,
                      color: colors.textSecondary,
                      marginTop: spacing.xs,
                    }}
                  >
                    (+{formatUsdInt(data.avgMonthlySaved)}/mo on average)
                  </Text>
                </>
              ) : data.netAmount < 0 ? (
                // Negative (overspent)
                <>
                  <Pressable
                    onPress={() => setShowSavingsInfo(true)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.xs,
                      marginBottom: spacing.sm,
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Lifetime savings rate. Tap for more info"
                    accessibilityHint="Shows explanation of how savings rate is calculated"
                  >
                    <Text
                      style={{
                        fontSize: fontSize.xs,
                        fontWeight: fontWeight.medium,
                        color: colors.textSecondary,
                        letterSpacing: letterSpacing.wider,
                      }}
                    >
                      Lifetime savings rate
                    </Text>
                    <CategoryIcon name="info-circle" size={12} color={colors.textSecondary} />
                  </Pressable>
                  <Text
                    style={{
                      fontSize: displaySize.xl,
                      fontWeight: fontWeight.heavy,
                      color: colors.text,
                      letterSpacing: -1,
                    }}
                  >
                    {Math.abs(data.savingsRate).toFixed(0)}%
                  </Text>
                  <Text
                    style={{
                      fontSize: fontSize.sm,
                      color: colors.textSecondary,
                      marginTop: spacing.sm,
                    }}
                  >
                    That's{' '}
                    <Text style={{ fontWeight: fontWeight.semibold, color: colors.danger }}>
                      {formatUsdInt(Math.abs(data.netAmount))}
                    </Text>{' '}
                    overspent
                  </Text>
                  <Text
                    style={{
                      fontSize: fontSize.xs,
                      color: colors.textSecondary,
                      marginTop: spacing.xs,
                    }}
                  >
                    ({formatUsdInt(Math.abs(data.avgMonthlySaved))}/mo on average)
                  </Text>
                </>
              ) : (
                // Broke even
                <>
                  <Text
                    style={{
                      fontSize: fontSize.xs,
                      fontWeight: fontWeight.medium,
                      color: colors.textSecondary,
                      letterSpacing: letterSpacing.wider,
                      marginBottom: spacing.sm,
                    }}
                  >
                    Lifetime result
                  </Text>
                  <Text
                    style={{
                      fontSize: displaySize.md,
                      fontWeight: fontWeight.bold,
                      color: colors.textSecondary,
                    }}
                  >
                    {formatUsdInt(0)}
                  </Text>
                  <Text
                    style={{
                      fontSize: fontSize.sm,
                      color: colors.textSecondary,
                      marginTop: spacing.xs,
                    }}
                  >
                    broke even
                  </Text>
                </>
              )
            ) : (
              // No income
              <>
                <Text
                  style={{
                    fontSize: fontSize.xs,
                    fontWeight: fontWeight.medium,
                    color: colors.textSecondary,
                    letterSpacing: letterSpacing.wider,
                    marginBottom: spacing.sm,
                  }}
                >
                  Lifetime
                </Text>
                <Text
                  style={{
                    fontSize: displaySize.sm,
                    fontWeight: fontWeight.bold,
                    color: colors.textSecondary,
                  }}
                >
                  No income yet
                </Text>
                {data.totalExpense > 0 && (
                  <Text
                    style={{
                      fontSize: fontSize.sm,
                      color: colors.textSecondary,
                      marginTop: spacing.sm,
                    }}
                  >
                    <Text style={{ fontWeight: fontWeight.semibold, color: colors.danger }}>
                      {formatUsdInt(data.totalExpense)}
                    </Text>{' '}
                    spent
                  </Text>
                )}
              </>
            )}
          </View>
        )}

        {/* Income / Expense row - Accessible/Tied up style */}
        <View style={{ flexDirection: 'row' }}>
          {/* Income */}
          <View style={{ flex: 1, padding: spacing.lg, alignItems: 'center' }}>
            <Text
              style={{
                fontSize: fontSize.xs,
                fontWeight: fontWeight.medium,
                color: colors.textSecondary,
                letterSpacing: letterSpacing.wider,
                marginBottom: spacing.xs,
              }}
            >
              Income
            </Text>
            <Text
              style={{
                fontSize: fontSize.xl,
                fontWeight: fontWeight.bold,
                color: colors.success,
                fontVariant: ['tabular-nums'],
              }}
            >
              {formatUsdInt(data.totalIncome)}
            </Text>
          </View>

          {/* Subtle middle divider */}
          <View
            style={{
              width: 1,
              backgroundColor: colors.border,
              marginVertical: spacing.sm,
              opacity: 0.5,
            }}
          />

          {/* Expense */}
          <View style={{ flex: 1, padding: spacing.lg, alignItems: 'center' }}>
            <Text
              style={{
                fontSize: fontSize.xs,
                fontWeight: fontWeight.medium,
                color: colors.textSecondary,
                letterSpacing: letterSpacing.wider,
                marginBottom: spacing.xs,
              }}
            >
              Expense
            </Text>
            <Text
              style={{
                fontSize: fontSize.xl,
                fontWeight: fontWeight.bold,
                color: colors.danger,
                fontVariant: ['tabular-nums'],
              }}
            >
              {formatUsdInt(data.totalExpense)}
            </Text>
          </View>
        </View>
      </View>

      {/* Section 2: Personal Bests (Collapsible) */}
      <CollapsibleSection
        title="Personal bests"
        hint="2+ mo"
        hasData={hasPersonalBestsData}
        isExpanded={personalBestsExpanded}
        onToggle={handlePersonalBestsToggle}
        onUnlock={handlePersonalBestsUnlock}
        colors={colors}
        placeholder={
          <SectionPlaceholder
            message="Track 2+ months to see your records"
            subMessage="Most inflow, lowest spending, and streaks"
            colors={colors}
          />
        }
      >
        {/* 2x2 Grid with subtle dividers */}
        <View>
          {/* Row 1: Best Month / Worst Month */}
          <View style={{ flexDirection: 'row' }}>
            {/* Best Month */}
            {data.personalBests.bestSavingsMonth && (
              <View style={{ flex: 1, padding: spacing.lg, alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: fontSize.xs,
                    fontWeight: fontWeight.medium,
                    color: colors.textSecondary,
                    letterSpacing: letterSpacing.wider,
                    marginBottom: spacing.xs,
                  }}
                >
                  Best net
                </Text>
                <Text
                  style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text }}
                >
                  {formatUsdInt(data.personalBests.bestSavingsMonth.netDollar)}
                </Text>
                <Text
                  style={{
                    fontSize: fontSize.xs,
                    color: colors.textSecondary,
                    marginTop: spacing.xs,
                  }}
                >
                  {formatYearMonth(data.personalBests.bestSavingsMonth.month)}
                </Text>
              </View>
            )}

            {/* Subtle middle divider */}
            <View
              style={{
                width: 1,
                backgroundColor: colors.border,
                marginVertical: spacing.sm,
                opacity: 0.5,
              }}
            />

            {/* Lowest Month */}
            {data.personalBests.worstMonth && (
              <View style={{ flex: 1, padding: spacing.lg, alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: fontSize.xs,
                    fontWeight: fontWeight.medium,
                    color: colors.textSecondary,
                    letterSpacing: letterSpacing.wider,
                    marginBottom: spacing.xs,
                  }}
                >
                  Lowest net
                </Text>
                <Text
                  style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text }}
                >
                  {formatUsdInt(data.personalBests.worstMonth.netDollar)}
                </Text>
                <Text
                  style={{
                    fontSize: fontSize.xs,
                    color: colors.textSecondary,
                    marginTop: spacing.xs,
                  }}
                >
                  {formatYearMonth(data.personalBests.worstMonth.month)}
                </Text>
              </View>
            )}
          </View>

          {/* Horizontal divider between rows */}
          <View
            style={{
              height: 1,
              backgroundColor: colors.border,
              marginHorizontal: spacing.lg,
              opacity: 0.5,
            }}
          />

          {/* Row 2: Best Streak / Current Streak */}
          <View style={{ flexDirection: 'row' }}>
            {/* Best Streak */}
            <View style={{ flex: 1, padding: spacing.lg, alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: fontSize.xs,
                  fontWeight: fontWeight.medium,
                  color: colors.textSecondary,
                  letterSpacing: letterSpacing.wider,
                  marginBottom: spacing.xs,
                }}
              >
                Best streak
              </Text>
              <Text
                style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text }}
              >
                {data.personalBests.positiveStreak} mo
              </Text>
              <Text
                style={{
                  fontSize: fontSize.xs,
                  color: colors.textSecondary,
                  marginTop: spacing.xs,
                }}
              >
                positive months
              </Text>
            </View>

            {/* Subtle middle divider */}
            <View
              style={{
                width: 1,
                backgroundColor: colors.border,
                marginVertical: spacing.sm,
                opacity: 0.5,
              }}
            />

            {/* Current Streak */}
            <View style={{ flex: 1, padding: spacing.lg, alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: fontSize.xs,
                  fontWeight: fontWeight.medium,
                  color: colors.textSecondary,
                  letterSpacing: letterSpacing.wider,
                  marginBottom: spacing.xs,
                }}
              >
                Current streak
              </Text>
              <Text
                style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text }}
              >
                {data.personalBests.currentStreak.months} mo
              </Text>
              <Text
                style={{
                  fontSize: fontSize.xs,
                  color: colors.textSecondary,
                  marginTop: spacing.xs,
                }}
              >
                {data.personalBests.currentStreak.isPositive ? 'in profit' : 'in loss'}
              </Text>
            </View>
          </View>
        </View>
      </CollapsibleSection>

      {/* Cumulative Savings Chart (Collapsible) */}
      <CollapsibleSection
        title="Net worth growth"
        hint="2+ mo"
        hasData={hasNetWorthData}
        isExpanded={netWorthExpanded}
        onToggle={handleNetWorthToggle}
        onUnlock={handleNetWorthUnlock}
        colors={colors}
        placeholder={
          <SectionPlaceholder
            message="Track 2+ months to see your trend"
            subMessage="Cumulative net over time"
            colors={colors}
          />
        }
      >
        <CumulativeNetChart
          data={data.cumulativeData}
          colors={{
            text: colors.text,
            textSecondary: colors.textSecondary,
            surface: colors.surface,
            surfaceAlt: colors.surfaceAlt,
            success: colors.success,
            danger: colors.danger,
          }}
        />
      </CollapsibleSection>

      {/* Where it went (Expense) */}
      {displayExpenseCategories.length > 0 && (
        <View style={{ marginBottom: SECTION_GAP }}>
          <SectionHeader
            title="Where it went"
            rightText={formatUsdInt(data.totalExpense)}
            rightColor={colors.danger}
            colors={colors}
          />
          <View style={{ gap: spacing.md }}>
            {displayExpenseCategories.map((cat) => {
              const percent = data.totalExpense > 0 ? (cat.amount / data.totalExpense) * 100 : 0
              const barWidth = maxExpenseAmount > 0 ? (cat.amount / maxExpenseAmount) * 100 : 0
              const categoryKey = cat.categoryKey
              const catMeta = getCategoryMeta(cat.categoryRef)
              const hasSubcategories = cat.subcategories.length > 0
              const isExpanded = expandedExpenseCategories.has(categoryKey)

              return (
                <View key={categoryKey} style={{ gap: spacing.sm }}>
                  {/* Top row: dot + name + amount + percent */}
                  <Pressable
                    onPress={() => hasSubcategories && toggleExpenseCategory(categoryKey)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
                    disabled={!hasSubcategories}
                    accessibilityRole={hasSubcategories ? 'button' : 'text'}
                    accessibilityLabel={`${catMeta.name}, ${formatUsdInt(cat.amount)}, ${Math.round(percent)} percent${hasSubcategories ? '. Tap to expand subcategories' : ''}`}
                    accessibilityState={{ expanded: isExpanded }}
                  >
                    <View
                      style={{
                        width: CATEGORY_DOT_SIZE,
                        height: CATEGORY_DOT_SIZE,
                        borderRadius: radius.full,
                        backgroundColor: catMeta.color,
                      }}
                    />
                    <Text
                      style={{
                        flex: 1,
                        fontSize: fontSize.sm,
                        fontWeight: fontWeight.semibold,
                        color: colors.text,
                      }}
                      numberOfLines={1}
                    >
                      {catMeta.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: fontSize.md,
                        fontWeight: fontWeight.bold,
                        color: colors.text,
                      }}
                    >
                      {formatUsdInt(cat.amount)}
                    </Text>
                    <Text
                      style={{
                        width: 44,
                        textAlign: 'right',
                        fontSize: fontSize.xs,
                        fontWeight: fontWeight.semibold,
                        color: colors.textSecondary,
                      }}
                    >
                      {Math.round(percent)}%
                    </Text>
                    {/* Chevron indicator - fixed width container for alignment */}
                    <View style={{ width: 20, alignItems: 'center' }}>
                      {hasSubcategories && (
                        <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>
                          {isExpanded ? '▼' : '▶'}
                        </Text>
                      )}
                    </View>
                  </Pressable>

                  {/* Bar - neutral color */}
                  <View
                    style={{
                      height: spacing.sm,
                      backgroundColor: colors.surfaceAlt,
                      borderRadius: radius.sm,
                      marginLeft: spacing.lg,
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        height: '100%',
                        width: `${barWidth}%`,
                        backgroundColor: colors.textSecondary,
                        borderRadius: radius.sm,
                      }}
                    />
                  </View>

                  {/* Subcategories (accordion) */}
                  {isExpanded && hasSubcategories && (
                    <View
                      style={{
                        marginLeft: spacing.xl + spacing.xs,
                        marginTop: spacing.xs,
                        gap: spacing.sm,
                      }}
                    >
                      {/* Subcategory header showing % is of parent */}
                      <Text
                        style={{
                          fontSize: fontSize.xs,
                          color: colors.textSecondary,
                          marginBottom: spacing.xs,
                        }}
                      >
                        % of {catMeta.name}
                      </Text>
                      {cat.subcategories.map((sub, subIdx) => {
                        const subPercent = cat.amount > 0 ? (sub.amount / cat.amount) * 100 : 0
                        const subBarWidth =
                          cat.subcategories[0].amount > 0
                            ? (sub.amount / cat.subcategories[0].amount) * 100
                            : 0
                        return (
                          <View key={`${sub.name}-${subIdx}`} style={{ gap: spacing.xs }}>
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: spacing.sm,
                              }}
                            >
                              <View
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: radius.full,
                                  backgroundColor: colors.textSecondary,
                                  opacity: 0.6,
                                }}
                              />
                              <Text
                                style={{
                                  flex: 1,
                                  fontSize: fontSize.xs,
                                  color: colors.text,
                                  opacity: 0.8,
                                }}
                                numberOfLines={1}
                              >
                                {sub.name}
                              </Text>
                              <Text
                                style={{
                                  fontSize: fontSize.xs,
                                  fontWeight: fontWeight.semibold,
                                  color: colors.text,
                                  opacity: 0.8,
                                }}
                              >
                                {formatUsdInt(sub.amount)}
                              </Text>
                              <Text
                                style={{
                                  width: 44,
                                  textAlign: 'right',
                                  fontSize: fontSize.xs,
                                  color: colors.textSecondary,
                                }}
                              >
                                {Math.round(subPercent)}%
                              </Text>
                              {/* Spacer for alignment with parent rows */}
                              <View style={{ width: 20 }} />
                            </View>
                            <View
                              style={{
                                height: spacing.xs,
                                backgroundColor: colors.surfaceAlt,
                                borderRadius: radius.xs,
                                marginLeft: spacing.md,
                                overflow: 'hidden',
                              }}
                            >
                              <View
                                style={{
                                  height: '100%',
                                  width: `${subBarWidth}%`,
                                  backgroundColor: colors.textSecondary,
                                  opacity: 0.5,
                                  borderRadius: radius.xs,
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

          {/* Show all button */}
          {hasMoreExpense && (
            <Pressable
              onPress={() => setShowAllExpense(!showAllExpense)}
              style={{ marginTop: spacing.lg, paddingVertical: spacing.sm, alignItems: 'center' }}
              accessibilityRole="button"
              accessibilityLabel={
                showAllExpense
                  ? 'Show fewer expense categories'
                  : `Show all ${allExpenseCategories.length} expense categories`
              }
            >
              <Text
                style={{
                  fontSize: fontSize.sm,
                  fontWeight: fontWeight.semibold,
                  color: colors.textSecondary,
                }}
              >
                {showAllExpense
                  ? 'Show less'
                  : `Show all ${allExpenseCategories.length} categories`}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Where it came from (Income) - Second */}
      {displayIncomeCategories.length > 0 && (
        <View style={{ marginBottom: SECTION_GAP }}>
          <SectionHeader
            title="Where it came from"
            rightText={formatUsdInt(data.totalIncome)}
            rightColor={colors.success}
            colors={colors}
          />
          <View style={{ gap: spacing.md }}>
            {displayIncomeCategories.map((cat) => {
              const percent = data.totalIncome > 0 ? (cat.amount / data.totalIncome) * 100 : 0
              const barWidth = maxIncomeAmount > 0 ? (cat.amount / maxIncomeAmount) * 100 : 0
              const categoryKey = cat.categoryKey
              const catMeta = getCategoryMeta(cat.categoryRef)
              const hasSubcategories = cat.subcategories.length > 0
              const isExpanded = expandedIncomeCategories.has(categoryKey)

              return (
                <View key={categoryKey} style={{ gap: spacing.sm }}>
                  {/* Top row: dot + name + amount + percent */}
                  <Pressable
                    onPress={() => hasSubcategories && toggleIncomeCategory(categoryKey)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
                    disabled={!hasSubcategories}
                    accessibilityRole={hasSubcategories ? 'button' : 'text'}
                    accessibilityLabel={`${catMeta.name}, ${formatUsdInt(cat.amount)}, ${Math.round(percent)} percent${hasSubcategories ? '. Tap to expand subcategories' : ''}`}
                    accessibilityState={{ expanded: isExpanded }}
                  >
                    <View
                      style={{
                        width: CATEGORY_DOT_SIZE,
                        height: CATEGORY_DOT_SIZE,
                        borderRadius: radius.full,
                        backgroundColor: catMeta.color,
                      }}
                    />
                    <Text
                      style={{
                        flex: 1,
                        fontSize: fontSize.sm,
                        fontWeight: fontWeight.semibold,
                        color: colors.text,
                      }}
                      numberOfLines={1}
                    >
                      {catMeta.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: fontSize.md,
                        fontWeight: fontWeight.bold,
                        color: colors.text,
                      }}
                    >
                      {formatUsdInt(cat.amount)}
                    </Text>
                    <Text
                      style={{
                        width: 44,
                        textAlign: 'right',
                        fontSize: fontSize.xs,
                        fontWeight: fontWeight.semibold,
                        color: colors.textSecondary,
                      }}
                    >
                      {Math.round(percent)}%
                    </Text>
                    {/* Chevron indicator - fixed width container for alignment */}
                    <View style={{ width: 20, alignItems: 'center' }}>
                      {hasSubcategories && (
                        <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>
                          {isExpanded ? '▼' : '▶'}
                        </Text>
                      )}
                    </View>
                  </Pressable>

                  {/* Bar - neutral color */}
                  <View
                    style={{
                      height: spacing.sm,
                      backgroundColor: colors.surfaceAlt,
                      borderRadius: radius.sm,
                      marginLeft: spacing.lg,
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        height: '100%',
                        width: `${barWidth}%`,
                        backgroundColor: colors.textSecondary,
                        borderRadius: radius.sm,
                      }}
                    />
                  </View>

                  {/* Subcategories (accordion) */}
                  {isExpanded && hasSubcategories && (
                    <View
                      style={{
                        marginLeft: spacing.xl + spacing.xs,
                        marginTop: spacing.xs,
                        gap: spacing.sm,
                      }}
                    >
                      {/* Subcategory header showing % is of parent */}
                      <Text
                        style={{
                          fontSize: fontSize.xs,
                          color: colors.textSecondary,
                          marginBottom: spacing.xs,
                        }}
                      >
                        % of {catMeta.name}
                      </Text>
                      {cat.subcategories.map((sub, subIdx) => {
                        const subPercent = cat.amount > 0 ? (sub.amount / cat.amount) * 100 : 0
                        const subBarWidth =
                          cat.subcategories[0].amount > 0
                            ? (sub.amount / cat.subcategories[0].amount) * 100
                            : 0
                        return (
                          <View key={`${sub.name}-${subIdx}`} style={{ gap: spacing.xs }}>
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: spacing.sm,
                              }}
                            >
                              <View
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: radius.full,
                                  backgroundColor: colors.textSecondary,
                                  opacity: 0.6,
                                }}
                              />
                              <Text
                                style={{
                                  flex: 1,
                                  fontSize: fontSize.xs,
                                  color: colors.text,
                                  opacity: 0.8,
                                }}
                                numberOfLines={1}
                              >
                                {sub.name}
                              </Text>
                              <Text
                                style={{
                                  fontSize: fontSize.xs,
                                  fontWeight: fontWeight.semibold,
                                  color: colors.text,
                                  opacity: 0.8,
                                }}
                              >
                                {formatUsdInt(sub.amount)}
                              </Text>
                              <Text
                                style={{
                                  width: 44,
                                  textAlign: 'right',
                                  fontSize: fontSize.xs,
                                  color: colors.textSecondary,
                                }}
                              >
                                {Math.round(subPercent)}%
                              </Text>
                              {/* Spacer for alignment with parent rows */}
                              <View style={{ width: 20 }} />
                            </View>
                            <View
                              style={{
                                height: spacing.xs,
                                backgroundColor: colors.surfaceAlt,
                                borderRadius: radius.xs,
                                marginLeft: spacing.md,
                                overflow: 'hidden',
                              }}
                            >
                              <View
                                style={{
                                  height: '100%',
                                  width: `${subBarWidth}%`,
                                  backgroundColor: colors.textSecondary,
                                  opacity: 0.5,
                                  borderRadius: radius.xs,
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

          {/* Show all button */}
          {hasMoreIncome && (
            <Pressable
              onPress={() => setShowAllIncome(!showAllIncome)}
              style={{ marginTop: spacing.lg, paddingVertical: spacing.sm, alignItems: 'center' }}
              accessibilityRole="button"
              accessibilityLabel={
                showAllIncome
                  ? 'Show fewer income categories'
                  : `Show all ${allIncomeCategories.length} income categories`
              }
            >
              <Text
                style={{
                  fontSize: fontSize.sm,
                  fontWeight: fontWeight.semibold,
                  color: colors.textSecondary,
                }}
              >
                {showAllIncome ? 'Show less' : `Show all ${allIncomeCategories.length} categories`}
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </ScrollView>
  )
}
