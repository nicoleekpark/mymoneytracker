import React, { useMemo, useState } from 'react'
import { LayoutAnimation, Modal, Platform, Pressable, Text, UIManager, View } from 'react-native'

import { CATEGORIES } from '@/config/categories.config'
import { CategoryIcon, Stack } from '@/shared/components'
import { formatUsdInt } from '@/shared/format/currency'

import { useAllTimeData, type CategoryBreakdown } from './hooks'
import { CumulativeNetChart } from './components'
import { MONTH_NAMES_SHORT } from '../types/dashboard.types'

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

function formatMonthYear(monthStr: string): string {
  // monthStr is YYYY-MM format
  const [year, month] = monthStr.split('-')
  const monthIndex = parseInt(month, 10) - 1
  return `${MONTH_NAMES_SHORT[monthIndex]} ${year}`
}

function formatTrackingSince(date: Date | null): string {
  if (!date) return 'No data yet'
  const month = MONTH_NAMES_SHORT[date.getMonth()]
  const year = date.getFullYear()
  return `Tracking since ${month} ${year}`
}

function formatCompactAmount(amount: number): string {
  const abs = Math.abs(amount)
  if (abs >= 1000000) {
    const m = abs / 1000000
    return `$ ${m >= 10 ? Math.round(m) : m.toFixed(1)}M`
  }
  if (abs >= 1000) {
    const k = abs / 1000
    return `$ ${k >= 10 ? Math.round(k) : k.toFixed(1)}K`
  }
  return `$ ${Math.round(abs)}`
}

function getCategoryMeta(ref?: CategoryBreakdown['categoryRef']): { name: string; icon: string; color: string } {
  if (!ref) return { name: 'Other', icon: 'cube', color: '#888' }
  const cat = CATEGORIES.find(c => c.type === ref.type && c.key === ref.categoryKey)
  if (!cat) return { name: ref.categoryKey, icon: 'cube', color: '#888' }
  return { name: cat.name, icon: cat.icon, color: cat.color }
}

function getSubcategoryMeta(parentKey: string, subKey: string): { name: string; icon: string; color: string } | null {
  const parent = CATEGORIES.find(c => c.key === parentKey)
  if (!parent) return null
  const sub = parent.subCategories.find(s => s.key === subKey)
  if (!sub) return null
  return { name: sub.name, icon: sub.icon, color: sub.color }
}

// Section gap for combined style (matching Monthly/Yearly)
const SECTION_GAP = 40

// Accent line colors (matching Monthly/Yearly)
const ACCENT_COLORS = {
  green: '#4ade80',
  blue: '#60a5fa',
  red: '#f87171',
  purple: '#a78bfa',
}

/**
 * Section header with accent line - matching Monthly/Yearly style
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
  colors: AllColors
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

function aggregateCategories(categories: CategoryBreakdown[]): AggregatedCategory[] {
  const byParent = new Map<string, AggregatedCategory>()

  for (const cat of categories) {
    const parentKey = cat.categoryRef?.categoryKey ?? 'uncategorized'
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
        subcategories: subInfo ? [subInfo] : []
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

function InfoTooltip({
  visible,
  onClose,
  colors
}: {
  visible: boolean
  onClose: () => void
  colors: AllColors
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
        onPress={onClose}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 24,
            marginHorizontal: 32,
            maxWidth: 320,
            borderWidth: 1,
            borderColor: colors.border
          }}
        >
          {/* Header */}
          <Text style={{ fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: 12 }}>
            Savings Rate
          </Text>

          {/* Description */}
          <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 16 }}>
            The percentage of income you kept after expenses.
          </Text>

          {/* Formula - Fraction style in one line */}
          <View
            style={{
              backgroundColor: colors.surfaceAlt,
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              marginBottom: 16
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
                  Income − Expense
                </Text>
                <View
                  style={{
                    width: 120,
                    height: 1,
                    backgroundColor: colors.text,
                    marginVertical: 4
                  }}
                />
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
                  Income
                </Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                × 100
              </Text>
            </View>
          </View>

          {/* Benchmark */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginBottom: 20
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: colors.success
              }}
            />
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>
              <Text style={{ fontWeight: '700', color: colors.text }}>20%+</Text>
              {' '}is a common healthy target
            </Text>
          </View>

          {/* Context */}
          <Text style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 18 }}>
            Based on the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Your ideal rate depends on your goals.
          </Text>

          {/* Close button */}
          <Pressable
            onPress={onClose}
            style={{
              marginTop: 20,
              backgroundColor: colors.primary,
              borderRadius: 10,
              paddingVertical: 12,
              alignItems: 'center'
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Got it</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  )
}

export function AllBody({ colors }: Props) {
  const { loading, error, data } = useAllTimeData()

  const [expandedExpenseCategories, setExpandedExpenseCategories] = useState<Set<string>>(new Set())
  const [expandedIncomeCategories, setExpandedIncomeCategories] = useState<Set<string>>(new Set())
  const [showAllExpense, setShowAllExpense] = useState(false)
  const [showAllIncome, setShowAllIncome] = useState(false)
  const [showSavingsInfo, setShowSavingsInfo] = useState(false)

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

  function toggleIncomeCategory(categoryKey: string) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
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
    <Stack gap="xl" scroll contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
      {/* Savings Rate Info Modal */}
      <InfoTooltip
        visible={showSavingsInfo}
        onClose={() => setShowSavingsInfo(false)}
        colors={colors}
      />

      {/* Section 1: All-Time Overview */}
      <View style={{ marginBottom: SECTION_GAP }}>
        {/* Tracking since subtitle */}
        <Text style={{ fontSize: 12, fontWeight: '500', color: colors.textSecondary, textAlign: 'right', marginBottom: 4 }}>
          {formatTrackingSince(data.firstTransactionDate)}
        </Text>

        {/* Hero savings rate */}
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          {data.totalIncome > 0 ? (
            data.netAmount > 0 ? (
              // Positive savings
              <>
                <Pressable
                  onPress={() => setShowSavingsInfo(true)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}
                >
                  <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                    Lifetime savings rate
                  </Text>
                  <CategoryIcon name="info-circle" size={12} color={colors.textSecondary} />
                </Pressable>
                <Text style={{ fontSize: 52, fontWeight: '800', color: colors.success }}>
                  {data.savingsRate.toFixed(0)}%
                </Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 8 }}>
                  That's <Text style={{ fontSize: 16, fontWeight: '700', color: colors.success }}>{formatUsdInt(data.netAmount)}</Text> saved
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                  (+{formatUsdInt(data.avgMonthlySaved)}/mo on average)
                </Text>
              </>
            ) : data.netAmount < 0 ? (
              // Negative (overspent)
              <>
                <Pressable
                  onPress={() => setShowSavingsInfo(true)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}
                >
                  <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                    Lifetime savings rate
                  </Text>
                  <CategoryIcon name="info-circle" size={12} color={colors.textSecondary} />
                </Pressable>
                <Text style={{ fontSize: 52, fontWeight: '800', color: colors.danger }}>
                  {Math.abs(data.savingsRate).toFixed(0)}%
                </Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 8 }}>
                  That's <Text style={{ fontSize: 16, fontWeight: '700', color: colors.danger }}>{formatUsdInt(Math.abs(data.netAmount))}</Text> overspent
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                  ({formatUsdInt(Math.abs(data.avgMonthlySaved))}/mo on average)
                </Text>
              </>
            ) : (
              // Broke even
              <>
                <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>
                  Lifetime result
                </Text>
                <Text style={{ fontSize: 32, fontWeight: '700', color: colors.textSecondary, marginTop: 8 }}>
                  {formatUsdInt(0)}
                </Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
                  broke even
                </Text>
              </>
            )
          ) : (
            // No income
            <>
              <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>
                Lifetime
              </Text>
              <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textSecondary, marginTop: 8 }}>
                No income yet
              </Text>
              {data.totalExpense > 0 && (
                <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 8 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.danger }}>{formatUsdInt(data.totalExpense)}</Text> spent
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
              {formatUsdInt(data.totalIncome)}
            </Text>
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
              {formatUsdInt(data.totalExpense)}
            </Text>
          </View>
        </View>

      </View>

      {/* Section 2: Personal Bests (2x2 Grid) */}
      {(data.personalBests.bestSavingsMonth || data.personalBests.worstMonth) && (
        <View style={{ marginBottom: SECTION_GAP }}>
          <SectionHeader
            title="Personal bests"
            accentColor={ACCENT_COLORS.purple}
            colors={colors}
          />

          {/* 2x2 Grid */}
          <View style={{ gap: 12 }}>
            {/* Row 1: Best Month / Worst Month */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {/* Best Month */}
              {data.personalBests.bestSavingsMonth && (
                <View
                  style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    padding: 14
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: `${colors.success}20`,
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <CategoryIcon name="star" size={11} color={colors.success} />
                    </View>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: colors.text, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Best Month
                    </Text>
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 2 }}>
                    {formatMonthYear(data.personalBests.bestSavingsMonth.month)}
                  </Text>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: colors.success }}>
                    {formatUsdInt(data.personalBests.bestSavingsMonth.netDollar)}
                  </Text>
                </View>
              )}

              {/* Worst Month */}
              {data.personalBests.worstMonth && (
                <View
                  style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    padding: 14
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: `${colors.danger}20`,
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <CategoryIcon name="fire" size={11} color={colors.danger} />
                    </View>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: colors.text, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Worst Month
                    </Text>
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 2 }}>
                    {formatMonthYear(data.personalBests.worstMonth.month)}
                  </Text>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: data.personalBests.worstMonth.netDollar >= 0 ? colors.success : colors.danger }}>
                    {formatUsdInt(data.personalBests.worstMonth.netDollar)}
                  </Text>
                </View>
              )}
            </View>

            {/* Row 2: Positive Streak / Current Streak */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {/* Positive Streak */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 14
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: `${colors.success}20`,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <CategoryIcon name="trophy" size={11} color={colors.success} />
                  </View>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: colors.text, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Best Streak
                  </Text>
                </View>
                <Text style={{ fontSize: 18, fontWeight: '800', color: colors.success }}>
                  {data.personalBests.positiveStreak} months
                </Text>
                <Text style={{ fontSize: 11, fontWeight: '500', color: colors.textSecondary, marginTop: 2 }}>
                  consecutive profit
                </Text>
              </View>

              {/* Current Streak */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 14
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: data.personalBests.currentStreak.isPositive ? `${colors.success}20` : `${colors.danger}20`,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <CategoryIcon name="line-chart" size={11} color={data.personalBests.currentStreak.isPositive ? colors.success : colors.danger} />
                  </View>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: colors.text, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Current Streak
                  </Text>
                </View>
                <Text style={{ fontSize: 18, fontWeight: '800', color: data.personalBests.currentStreak.isPositive ? colors.success : colors.danger }}>
                  {data.personalBests.currentStreak.months} months
                </Text>
                <Text style={{ fontSize: 11, fontWeight: '500', color: colors.textSecondary, marginTop: 2 }}>
                  {data.personalBests.currentStreak.isPositive ? 'in profit' : 'in loss'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Cumulative Net Chart */}
      {data.cumulativeData.length > 0 && (
        <View style={{ marginBottom: SECTION_GAP }}>
          <SectionHeader
            title="Cumulative net"
            accentColor={ACCENT_COLORS.blue}
            colors={colors}
          />
          <CumulativeNetChart
            data={data.cumulativeData}
            colors={{
              text: colors.text,
              textSecondary: colors.textSecondary,
              surface: colors.surface,
              surfaceAlt: colors.surfaceAlt,
              success: colors.success,
              danger: colors.danger
            }}
          />
        </View>
      )}

      {/* Where it went (Expense) */}
      {displayExpenseCategories.length > 0 && (
        <View style={{ marginBottom: SECTION_GAP }}>
          <SectionHeader
            title="Where it went"
            accentColor={ACCENT_COLORS.red}
            rightText={formatUsdInt(data.totalExpense)}
            rightColor={colors.danger}
            colors={colors}
          />
          <View style={{ gap: 12 }}>
            {displayExpenseCategories.map((cat) => {
              const percent = data.totalExpense > 0 ? (cat.amount / data.totalExpense) * 100 : 0
              const barWidth = maxExpenseAmount > 0 ? (cat.amount / maxExpenseAmount) * 100 : 0
              const categoryKey = cat.categoryKey
              const catMeta = getCategoryMeta(cat.categoryRef)
              const hasSubcategories = cat.subcategories.length > 0
              const isExpanded = expandedExpenseCategories.has(categoryKey)

              return (
                <View key={categoryKey} style={{ gap: 6 }}>
                  {/* Top row: dot + name + amount + percent */}
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
                      {formatUsdInt(cat.amount)}
                    </Text>
                    <Text style={{ width: 38, textAlign: 'right', fontSize: 11, fontWeight: '600', color: colors.textSecondary }}>
                      {Math.round(percent)}%
                    </Text>
                    {/* Chevron indicator - fixed width container for alignment */}
                    <View style={{ width: 20, alignItems: 'center' }}>
                      {hasSubcategories && (
                        <Text style={{ fontSize: 10, color: colors.textSecondary }}>
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
                        const subPercent = cat.amount > 0 ? (sub.amount / cat.amount) * 100 : 0
                        const subBarWidth = cat.subcategories[0].amount > 0
                          ? (sub.amount / cat.subcategories[0].amount) * 100
                          : 0
                        return (
                          <View key={`${sub.name}-${subIdx}`} style={{ gap: 4 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: sub.color }} />
                              <Text style={{ flex: 1, fontSize: 12, color: colors.text, opacity: 0.8 }} numberOfLines={1}>
                                {sub.name}
                              </Text>
                              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, opacity: 0.8 }}>
                                {formatUsdInt(sub.amount)}
                              </Text>
                              <Text style={{ width: 38, textAlign: 'right', fontSize: 10, color: colors.textSecondary }}>
                                {Math.round(subPercent)}%
                              </Text>
                              {/* Spacer for alignment with parent rows */}
                              <View style={{ width: 20 }} />
                            </View>
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
                                  backgroundColor: sub.color,
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

          {/* Show all button */}
          {hasMoreExpense && (
            <Pressable
              onPress={() => setShowAllExpense(!showAllExpense)}
              style={{ marginTop: 16, paddingVertical: 8, alignItems: 'center' }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.primary }}>
                {showAllExpense ? 'Show less' : `Show all ${allExpenseCategories.length} categories`}
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
            accentColor={ACCENT_COLORS.green}
            rightText={formatUsdInt(data.totalIncome)}
            rightColor={colors.success}
            colors={colors}
          />
          <View style={{ gap: 12 }}>
            {displayIncomeCategories.map((cat) => {
              const percent = data.totalIncome > 0 ? (cat.amount / data.totalIncome) * 100 : 0
              const barWidth = maxIncomeAmount > 0 ? (cat.amount / maxIncomeAmount) * 100 : 0
              const categoryKey = cat.categoryKey
              const catMeta = getCategoryMeta(cat.categoryRef)
              const hasSubcategories = cat.subcategories.length > 0
              const isExpanded = expandedIncomeCategories.has(categoryKey)

              return (
                <View key={categoryKey} style={{ gap: 6 }}>
                  {/* Top row: dot + name + amount + percent */}
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
                      {formatUsdInt(cat.amount)}
                    </Text>
                    <Text style={{ width: 38, textAlign: 'right', fontSize: 11, fontWeight: '600', color: colors.textSecondary }}>
                      {Math.round(percent)}%
                    </Text>
                    {/* Chevron indicator - fixed width container for alignment */}
                    <View style={{ width: 20, alignItems: 'center' }}>
                      {hasSubcategories && (
                        <Text style={{ fontSize: 10, color: colors.textSecondary }}>
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
                        const subPercent = cat.amount > 0 ? (sub.amount / cat.amount) * 100 : 0
                        const subBarWidth = cat.subcategories[0].amount > 0
                          ? (sub.amount / cat.subcategories[0].amount) * 100
                          : 0
                        return (
                          <View key={`${sub.name}-${subIdx}`} style={{ gap: 4 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: sub.color }} />
                              <Text style={{ flex: 1, fontSize: 12, color: colors.text, opacity: 0.8 }} numberOfLines={1}>
                                {sub.name}
                              </Text>
                              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, opacity: 0.8 }}>
                                {formatUsdInt(sub.amount)}
                              </Text>
                              <Text style={{ width: 38, textAlign: 'right', fontSize: 10, color: colors.textSecondary }}>
                                {Math.round(subPercent)}%
                              </Text>
                              {/* Spacer for alignment with parent rows */}
                              <View style={{ width: 20 }} />
                            </View>
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
                                  backgroundColor: sub.color,
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

          {/* Show all button */}
          {hasMoreIncome && (
            <Pressable
              onPress={() => setShowAllIncome(!showAllIncome)}
              style={{ marginTop: 16, paddingVertical: 8, alignItems: 'center' }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.primary }}>
                {showAllIncome ? 'Show less' : `Show all ${allIncomeCategories.length} categories`}
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </Stack>
  )
}
