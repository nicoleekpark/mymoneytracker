import React, { useEffect, useMemo, useState } from 'react'
import { LayoutAnimation, Modal, Platform, Pressable, Text, UIManager, View } from 'react-native'

import { CATEGORIES } from '@/config/categories.config'
import { CategoryIcon, Stack } from '@/shared/components'
import { formatUsdInt } from '@/shared/format/currency'

import { getYearlyProjection, type YearlyProjection } from '@/domain/transaction/transaction.usecase'
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

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatMonthYear(monthStr: string): string {
  // monthStr is YYYY-MM format
  const [year, month] = monthStr.split('-')
  const monthIndex = parseInt(month, 10) - 1
  return `${MONTH_NAMES[monthIndex]} ${year}`
}

function formatTrackingSince(date: Date | null): string {
  if (!date) return 'No data yet'
  const month = MONTH_NAMES[date.getMonth()]
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

function CategoryRow({
  item,
  index,
  totalAmount,
  totalIncome,
  isExpanded,
  onPress,
  colors
}: {
  item: AggregatedCategory
  index: number
  totalAmount: number
  totalIncome: number
  isExpanded: boolean
  onPress: () => void
  colors: AllColors
}) {
  const meta = getCategoryMeta(item.categoryRef)
  const percentage = totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0
  const incomePercentage = totalIncome > 0 ? (item.amount / totalIncome) * 100 : 0
  const isTop = index === 0
  const hasSubcategories = item.subcategories.length > 0

  return (
    <Pressable onPress={onPress}>
      <View style={{ paddingVertical: 10 }}>
        {/* Main row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              backgroundColor: `${meta.color}20`,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CategoryIcon name={meta.icon} size={14} color={meta.color} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {isTop && <Text style={{ fontSize: 11 }}>👑</Text>}
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>
                {meta.name}
              </Text>
            </View>
            {hasSubcategories && !isExpanded && (
              <Text style={{ fontSize: 9, color: colors.textSecondary, marginTop: 1 }}>
                tap for details
              </Text>
            )}
          </View>
          <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text }}>
            {formatUsdInt(item.amount)}
          </Text>
          <Text style={{ width: 36, textAlign: 'right', fontSize: 11, fontWeight: '600', color: colors.textSecondary }}>
            {percentage.toFixed(0)}%
          </Text>
        </View>

        {/* Expanded content */}
        {isExpanded && (
          <View
            style={{
              marginTop: 10,
              marginLeft: 38,
              backgroundColor: colors.surfaceAlt,
              borderRadius: 10,
              padding: 12,
              gap: 10
            }}
          >
            {/* Subcategories */}
            {hasSubcategories && (
              <View style={{ gap: 8 }}>
                {item.subcategories.map((sub, idx) => {
                  const subPct = item.amount > 0 ? (sub.amount / item.amount) * 100 : 0
                  return (
                    <View
                      key={`${sub.name}-${idx}`}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
                    >
                      <CategoryIcon name={sub.icon} size={12} color={sub.color} />
                      <Text style={{ flex: 1, fontSize: 12, fontWeight: '600', color: colors.text }}>
                        {sub.name}
                      </Text>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>
                        {formatUsdInt(sub.amount)}
                      </Text>
                      <Text style={{ fontSize: 10, fontWeight: '600', color: colors.textSecondary, width: 32, textAlign: 'right' }}>
                        {subPct.toFixed(0)}%
                      </Text>
                    </View>
                  )
                })}
              </View>
            )}

            {/* Insights */}
            <View
              style={{
                borderTopWidth: hasSubcategories ? 1 : 0,
                borderTopColor: colors.border,
                paddingTop: hasSubcategories ? 8 : 0,
                gap: 4
              }}
            >
              <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                Takes <Text style={{ fontWeight: '700', color: colors.text }}>{incomePercentage.toFixed(1)}%</Text> of total income
              </Text>
            </View>
          </View>
        )}
      </View>
    </Pressable>
  )
}

function YearlyTrendBar({
  year,
  net,
  maxNet,
  isBest,
  isYTD,
  colors
}: {
  year: number
  net: number
  maxNet: number
  isBest: boolean
  isYTD: boolean
  colors: AllColors
}) {
  const barWidth = maxNet > 0 ? Math.max(8, (Math.abs(net) / maxNet) * 100) : 0
  const isPositive = net >= 0

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Text style={{ width: 44, fontSize: 13, fontWeight: '700', color: colors.text }}>
        {year}
      </Text>
      <View style={{ flex: 1, height: 20, justifyContent: 'center' }}>
        <View
          style={{
            height: 14,
            width: `${barWidth}%`,
            backgroundColor: isPositive ? colors.success : colors.danger,
            borderRadius: 4,
            opacity: 0.8
          }}
        />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 90 }}>
        <Text style={{ fontSize: 11, color: isPositive ? colors.success : colors.danger }}>
          {isPositive ? '↑' : '↓'}
        </Text>
        <Text style={{ fontSize: 13, fontWeight: '800', color: isPositive ? colors.success : colors.danger }}>
          {formatCompactAmount(net)}
        </Text>
        {isBest && <Text style={{ fontSize: 10 }}>🏆</Text>}
        {isYTD && (
          <Text style={{ fontSize: 9, fontWeight: '600', color: colors.textSecondary }}>(YTD)</Text>
        )}
      </View>
    </View>
  )
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

          {/* Formula - Fraction style */}
          <View
            style={{
              backgroundColor: colors.surfaceAlt,
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              marginBottom: 16
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                Income − Expense
              </Text>
              <View
                style={{
                  width: 140,
                  height: 1,
                  backgroundColor: colors.text,
                  marginVertical: 6
                }}
              />
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                Income
              </Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginTop: 8 }}>
              × 100
            </Text>
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

  const currentYear = new Date().getFullYear()

  const [expandedExpenseIndex, setExpandedExpenseIndex] = useState<number | null>(null)
  const [expandedIncomeIndex, setExpandedIncomeIndex] = useState<number | null>(null)
  const [showSavingsInfo, setShowSavingsInfo] = useState(false)
  const [showProjectionInfo, setShowProjectionInfo] = useState(false)
  const [projection, setProjection] = useState<YearlyProjection | null>(null)

  // Fetch current year projection
  useEffect(() => {
    let alive = true
    async function fetchProjection() {
      try {
        const proj = await getYearlyProjection(currentYear)
        if (alive && proj.monthsElapsed > 0) {
          setProjection(proj)
        }
      } catch {
        // Ignore errors
      }
    }
    fetchProjection()
    return () => { alive = false }
  }, [currentYear])

  const topExpenseCategories = useMemo(
    () => aggregateCategories(data.expenseByCategory).slice(0, 6),
    [data.expenseByCategory]
  )

  const topIncomeCategories = useMemo(
    () => aggregateCategories(data.incomeByCategory).slice(0, 5),
    [data.incomeByCategory]
  )

  // Find best year and max net for scaling
  const yearlyStats = useMemo(() => {
    if (data.yearlyData.length === 0) return { bestYear: null, maxNet: 0 }
    let bestYear = data.yearlyData[0].year
    let bestNet = data.yearlyData[0].incomeDollar - data.yearlyData[0].expenseDollar
    let maxNet = Math.abs(bestNet)

    for (const y of data.yearlyData) {
      const net = y.incomeDollar - y.expenseDollar
      const absNet = Math.abs(net)
      if (absNet > maxNet) maxNet = absNet
      // Only consider completed years for "best" (not current year)
      if (y.year < currentYear && net > bestNet) {
        bestNet = net
        bestYear = y.year
      }
    }
    return { bestYear, maxNet }
  }, [data.yearlyData, currentYear])

  function handleExpensePress(index: number) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpandedExpenseIndex(prev => (prev === index ? null : index))
  }

  function handleIncomePress(index: number) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpandedIncomeIndex(prev => (prev === index ? null : index))
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
    <Stack gap="xl" scroll>
      {/* Savings Rate Info Modal */}
      <InfoTooltip
        visible={showSavingsInfo}
        onClose={() => setShowSavingsInfo(false)}
        colors={colors}
      />

      {/* All-Time Summary Card */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 20,
          gap: 16
        }}
      >
        {/* Header + Tracking since */}
        <View style={{ alignItems: 'center', gap: 2 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text, letterSpacing: 0.2 }}>
            All Time
          </Text>
          <Text style={{ fontSize: 11, fontWeight: '500', color: colors.textSecondary }}>
            {formatTrackingSince(data.firstTransactionDate)}
          </Text>
        </View>

        {/* Net amount with arrow */}
        <View style={{ alignItems: 'center', gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text
              style={{
                fontSize: 22,
                color: data.netAmount >= 0 ? colors.success : colors.danger
              }}
            >
              {data.netAmount >= 0 ? '↑' : '↓'}
            </Text>
            <Text
              style={{
                fontSize: 28,
                fontWeight: '900',
                color: data.netAmount >= 0 ? colors.success : colors.danger
              }}
            >
              {formatUsdInt(Math.abs(data.netAmount))}
            </Text>
          </View>
          <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textSecondary }}>
            net
          </Text>
        </View>

        {/* Income / Expense row */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 24 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary }}>
            <Text style={{ color: colors.success, fontWeight: '700' }}>{formatCompactAmount(data.totalIncome)}</Text>
            {' '}income
          </Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary }}>
            <Text style={{ color: colors.danger, fontWeight: '700' }}>{formatCompactAmount(data.totalExpense)}</Text>
            {' '}expense
          </Text>
        </View>

        {/* Savings rate + Avg monthly */}
        <View
          style={{
            backgroundColor: colors.surfaceAlt,
            borderRadius: 10,
            padding: 12,
            flexDirection: 'row',
            justifyContent: 'space-around'
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>
                {data.savingsRate.toFixed(0)}%
              </Text>
              <Pressable
                onPress={() => setShowSavingsInfo(true)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{ marginLeft: 2, marginTop: -2 }}
              >
                <View
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: colors.border,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Text style={{ fontSize: 9, fontWeight: '700', color: colors.textSecondary }}>i</Text>
                </View>
              </Pressable>
            </View>
            <Text style={{ fontSize: 10, fontWeight: '600', color: colors.textSecondary }}>
              savings rate
            </Text>
          </View>
          <View style={{ width: 1, backgroundColor: colors.border }} />
          <View style={{ alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Text style={{ fontSize: 13, color: data.avgMonthlySaved >= 0 ? colors.success : colors.danger }}>
                {data.avgMonthlySaved >= 0 ? '↑' : '↓'}
              </Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>
                {formatUsdInt(Math.abs(data.avgMonthlySaved))}
              </Text>
            </View>
            <Text style={{ fontSize: 10, fontWeight: '600', color: colors.textSecondary }}>
              avg/mo saved
            </Text>
          </View>
        </View>
      </View>

      {/* Highlights - Bento 4-tile layout */}
      {(data.personalBests.bestSavingsMonth || data.personalBests.peakExpenseMonth) && (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 16,
            gap: 12
          }}
        >
          {/* Header */}
          <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>
            Highlights
          </Text>

          {/* Bento Grid */}
          <View style={{ gap: 10 }}>
            {/* Row 1: Monthly */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {/* Best Savings Month */}
              {data.personalBests.bestSavingsMonth && (
                <View
                  style={{
                    flex: 1,
                    backgroundColor: colors.surfaceAlt,
                    borderRadius: 12,
                    padding: 12,
                    gap: 4
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Best Savings
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>
                    {formatMonthYear(data.personalBests.bestSavingsMonth.month)}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 }}>
                    <Text style={{ fontSize: 12, color: colors.success }}>↑</Text>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: colors.success }}>
                      {formatUsdInt(data.personalBests.bestSavingsMonth.netDollar)}
                    </Text>
                  </View>
                </View>
              )}

              {/* Most Spent Month */}
              {data.personalBests.peakExpenseMonth && (
                <View
                  style={{
                    flex: 1,
                    backgroundColor: colors.surfaceAlt,
                    borderRadius: 12,
                    padding: 12,
                    gap: 4
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Most Spent
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>
                    {formatMonthYear(data.personalBests.peakExpenseMonth.month)}
                  </Text>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 4 }}>
                    {formatUsdInt(data.personalBests.peakExpenseMonth.expenseDollar)}
                  </Text>
                </View>
              )}
            </View>

            {/* Row 2: Yearly */}
            {(data.personalBests.bestSavingsYear || data.personalBests.peakExpenseYear) && (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {/* Best Year */}
                {data.personalBests.bestSavingsYear && (
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: colors.surfaceAlt,
                      borderRadius: 12,
                      padding: 12,
                      gap: 4
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Best Year
                    </Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>
                      {data.personalBests.bestSavingsYear.year}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 }}>
                      <Text style={{ fontSize: 12, color: colors.success }}>↑</Text>
                      <Text style={{ fontSize: 16, fontWeight: '800', color: colors.success }}>
                        {formatUsdInt(data.personalBests.bestSavingsYear.netDollar)}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Spent Most Year */}
                {data.personalBests.peakExpenseYear && (
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: colors.surfaceAlt,
                      borderRadius: 12,
                      padding: 12,
                      gap: 4
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Spent Most
                    </Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>
                      {data.personalBests.peakExpenseYear.year}
                    </Text>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 4 }}>
                      {formatUsdInt(data.personalBests.peakExpenseYear.expenseDollar)}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      )}

      {/* Current Year Projection - Option C Simple style */}
      {projection && projection.monthsElapsed > 0 && (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 20,
            position: 'relative'
          }}
        >
          {/* Info Button */}
          <Pressable
            onPress={() => setShowProjectionInfo(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textSecondary }}>i</Text>
          </Pressable>

          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textSecondary, letterSpacing: 0.5 }}>
              {currentYear} FORECAST
            </Text>
            <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>
              Month {Math.round(projection.monthsElapsed)} of 12
            </Text>
          </View>

          {/* Main Savings Amount */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 36,
                fontWeight: '900',
                color: projection.projectedSavings >= 0 ? colors.success : colors.text,
              }}
            >
              {projection.projectedSavings >= 0 ? '+' : ''}{formatUsdInt(projection.projectedSavings)}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
              projected savings this year
            </Text>
          </View>

          {/* Detail Box with aligned numbers */}
          <View
            style={{
              backgroundColor: colors.surfaceAlt,
              borderRadius: 10,
              padding: 14,
            }}
          >
            {/* Income row */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>Income</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, fontVariant: ['tabular-nums'] }}>
                {'  '}${projection.projectedIncome.toLocaleString('en-US')}
              </Text>
            </View>

            {/* Expense row */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>Expense</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, fontVariant: ['tabular-nums'] }}>
                {'  '}${projection.projectedExpense.toLocaleString('en-US')}
              </Text>
            </View>

            {/* Divider */}
            <View style={{ borderTopWidth: 1, borderTopColor: colors.border, marginVertical: 6 }} />

            {/* Savings row */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>Savings</Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '700',
                  color: projection.projectedSavings >= 0 ? colors.success : colors.text,
                  fontVariant: ['tabular-nums']
                }}
              >
                {projection.projectedSavings >= 0 ? '+ ' : '- '}${Math.abs(projection.projectedSavings).toLocaleString('en-US')}
              </Text>
            </View>

            {/* vs Last Year row */}
            {projection.vsLastYear && (
              <>
                <View style={{ borderTopWidth: 1, borderTopColor: colors.border, marginVertical: 6 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 }}>
                  <Text style={{ fontSize: 13, color: colors.textSecondary }}>vs {currentYear - 1}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ color: projection.vsLastYear.isMoreSaved ? colors.success : colors.text }}>
                      {projection.vsLastYear.isMoreSaved ? '↑' : '↓'}
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, fontVariant: ['tabular-nums'] }}>
                      {projection.vsLastYear.isMoreSaved ? '+ ' : '- '}${projection.vsLastYear.delta.toLocaleString('en-US')}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                      {projection.vsLastYear.isMoreSaved ? 'more' : 'less'}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      )}

      {/* Projection Info Modal */}
      <Modal visible={showProjectionInfo} transparent animationType="fade" onRequestClose={() => setShowProjectionInfo(false)}>
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 32,
          }}
          onPress={() => setShowProjectionInfo(false)}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 24,
              width: '100%',
              maxWidth: 320,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 16 }}>
              How Projection Works
            </Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 8 }}>
              Formula: (year-to-date total / months elapsed) x 12
            </Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 8 }}>
              Your monthly averages are extrapolated to estimate year-end totals.
            </Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 8 }}>
              The more months of data, the more accurate the projection.
            </Text>
            <Pressable
              onPress={() => setShowProjectionInfo(false)}
              style={{
                marginTop: 16,
                backgroundColor: colors.text,
                borderRadius: 8,
                paddingVertical: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '700', color: colors.surface }}>Got it</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Yearly Trend with visual bars */}
      {data.yearlyData.length > 0 && (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 16,
            gap: 12
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>
            Yearly Trend
          </Text>
          <View style={{ gap: 8 }}>
            {data.yearlyData.map((y) => {
              const net = y.incomeDollar - y.expenseDollar
              return (
                <YearlyTrendBar
                  key={y.year}
                  year={y.year}
                  net={net}
                  maxNet={yearlyStats.maxNet}
                  isBest={y.year === yearlyStats.bestYear && y.year < currentYear}
                  isYTD={y.year === currentYear}
                  colors={colors}
                />
              )
            })}
          </View>
        </View>
      )}

      {/* Income by Source */}
      {topIncomeCategories.length > 0 && (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 16
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>
              Income by Source
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.success }}>
              {formatUsdInt(data.totalIncome)}
            </Text>
          </View>
          <View>
            {topIncomeCategories.map((cat, idx) => (
              <View
                key={cat.categoryKey}
                style={idx < topIncomeCategories.length - 1 ? { borderBottomWidth: 1, borderBottomColor: colors.border } : undefined}
              >
                <CategoryRow
                  item={cat}
                  index={idx}
                  totalAmount={data.totalIncome}
                  totalIncome={data.totalIncome}
                  isExpanded={expandedIncomeIndex === idx}
                  onPress={() => handleIncomePress(idx)}
                  colors={colors}
                />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Spending by Category */}
      {topExpenseCategories.length > 0 && (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 16
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>
              Spending by Category
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.danger }}>
              {formatUsdInt(data.totalExpense)}
            </Text>
          </View>
          <View>
            {topExpenseCategories.map((cat, idx) => (
              <View
                key={cat.categoryKey}
                style={idx < topExpenseCategories.length - 1 ? { borderBottomWidth: 1, borderBottomColor: colors.border } : undefined}
              >
                <CategoryRow
                  item={cat}
                  index={idx}
                  totalAmount={data.totalExpense}
                  totalIncome={data.totalIncome}
                  isExpanded={expandedExpenseIndex === idx}
                  onPress={() => handleExpensePress(idx)}
                  colors={colors}
                />
              </View>
            ))}
          </View>
        </View>
      )}
    </Stack>
  )
}
