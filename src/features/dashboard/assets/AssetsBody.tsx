import { EmptyState, InfoSheet, SettingsLink, TrackingSince } from '@/shared/components'
import { formatUsdInt } from '@/shared/format/currency'
import { formatYearMonth } from '@/shared/format/date'
import { MODAL_SNAP_HALF } from '@/shared/theme/tokens/modal'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { displaySize, fontSize, fontWeight, letterSpacing } from '@/shared/theme/tokens/typography'
import { useFocusEffect } from '@react-navigation/native'
import { router } from 'expo-router'
import React, { useCallback, useMemo, useState } from 'react'
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  Text,
  UIManager,
  View,
} from 'react-native'
import { useAssetsData } from './hooks/useAssetsData'
import { useRunwayData } from './hooks/useRunwayData'

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

export type AssetsColors = Readonly<{
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

type Scope = 'month' | 'year' | 'all'
type Period = { year: number; month?: number }

type Props = {
  colors: AssetsColors
  scope: Scope
  period: Period
  selectedMemberIds: string[]
}

/**
 * Liquidity info bottom sheet
 */
function LiquidityInfoSheet({
  visible,
  onClose,
  colors,
}: {
  visible: boolean
  onClose: () => void
  colors: AssetsColors
}) {
  return (
    <InfoSheet
      visible={visible}
      onClose={onClose}
      title="Accessible Assets"
      colors={{
        surface: colors.surface,
        text: colors.text,
        textSecondary: colors.textSecondary,
        surfaceAlt: colors.surfaceAlt,
        primary: colors.primary,
      }}
      snapPoints={MODAL_SNAP_HALF}
    >
      <Text
        style={{
          fontSize: fontSize.md,
          color: colors.textSecondary,
          lineHeight: 22,
          marginBottom: spacing.xl,
        }}
      >
        Money you can access quickly without penalties or significant loss.
      </Text>

      <View style={{ marginBottom: spacing.xl }}>
        <Text
          style={{
            fontSize: fontSize.sm,
            fontWeight: fontWeight.semibold,
            color: colors.text,
            marginBottom: spacing.sm,
          }}
        >
          Included:
        </Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 22 }}>
          {'\u2022'} Cash & Checking{'\n'}
          {'\u2022'} Savings & HYSA{'\n'}
          {'\u2022'} Brokerage accounts{'\n'}
          {'\u2022'} Crypto
        </Text>
      </View>

      <View>
        <Text
          style={{
            fontSize: fontSize.sm,
            fontWeight: fontWeight.semibold,
            color: colors.text,
            marginBottom: spacing.sm,
          }}
        >
          Not included:
        </Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 22 }}>
          {'\u2022'} Retirement accounts{'\n'}
          {'\u2022'} Real estate{'\n'}
          {'\u2022'} CDs & locked deposits
        </Text>
      </View>
    </InfoSheet>
  )
}

/**
 * Runway info bottom sheet (All scope only)
 */
function RunwayInfoSheet({
  visible,
  onClose,
  colors,
  avgMonthlyExpense,
  hasEnoughData,
  monthCount,
}: {
  visible: boolean
  onClose: () => void
  colors: AssetsColors
  avgMonthlyExpense: number
  hasEnoughData: boolean
  monthCount: number
}) {
  return (
    <InfoSheet
      visible={visible}
      onClose={onClose}
      title="Runway"
      colors={{
        surface: colors.surface,
        text: colors.text,
        textSecondary: colors.textSecondary,
        surfaceAlt: colors.surfaceAlt,
        primary: colors.primary,
      }}
      snapPoints={MODAL_SNAP_HALF}
    >
      <Text
        style={{
          fontSize: fontSize.md,
          color: colors.textSecondary,
          lineHeight: 22,
          marginBottom: spacing.xl,
        }}
      >
        How many months your accessible assets can cover your expenses.
      </Text>

      <View style={{ marginBottom: spacing.xl }}>
        <Text
          style={{
            fontSize: fontSize.sm,
            fontWeight: fontWeight.semibold,
            color: colors.text,
            marginBottom: spacing.sm,
          }}
        >
          How it's calculated:
        </Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 22 }}>
          Runway = Accessible Assets ÷ Avg Monthly Expenses
        </Text>
        {hasEnoughData && avgMonthlyExpense > 0 && (
          <Text
            style={{
              fontSize: fontSize.sm,
              color: colors.textSecondary,
              lineHeight: 22,
              marginTop: spacing.sm,
            }}
          >
            Your avg monthly expense: {formatUsdInt(avgMonthlyExpense)}
          </Text>
        )}
        {!hasEnoughData && (
          <Text
            style={{
              fontSize: fontSize.sm,
              color: colors.warning,
              lineHeight: 22,
              marginTop: spacing.sm,
            }}
          >
            Need at least 3 months of expense data to calculate. Currently: {monthCount} month
            {monthCount !== 1 ? 's' : ''}.
          </Text>
        )}
      </View>

      <View style={{ marginBottom: spacing.xl }}>
        <Text
          style={{
            fontSize: fontSize.sm,
            fontWeight: fontWeight.semibold,
            color: colors.text,
            marginBottom: spacing.sm,
          }}
        >
          General guidelines:
        </Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 22 }}>
          {'\u2022'} 3-6 months: Basic emergency fund{'\n'}
          {'\u2022'} 6-12 months: Solid financial cushion{'\n'}
          {'\u2022'} 12+ months: Strong financial security
        </Text>
      </View>

      <View>
        <Text
          style={{
            fontSize: fontSize.sm,
            fontWeight: fontWeight.semibold,
            color: colors.text,
            marginBottom: spacing.sm,
          }}
        >
          Why it matters:
        </Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 22 }}>
          Runway shows how long you could maintain your lifestyle without income. It's a practical
          measure of financial resilience.
        </Text>
      </View>
    </InfoSheet>
  )
}

/**
 * Liabilities info bottom sheet (Monthly/Yearly scopes)
 */
function LiabilitiesInfoSheet({
  visible,
  onClose,
  colors,
}: {
  visible: boolean
  onClose: () => void
  colors: AssetsColors
}) {
  return (
    <InfoSheet
      visible={visible}
      onClose={onClose}
      title="Liabilities"
      colors={{
        surface: colors.surface,
        text: colors.text,
        textSecondary: colors.textSecondary,
        surfaceAlt: colors.surfaceAlt,
        primary: colors.primary,
      }}
      snapPoints={MODAL_SNAP_HALF}
    >
      <Text
        style={{
          fontSize: fontSize.md,
          color: colors.textSecondary,
          lineHeight: 22,
          marginBottom: spacing.xl,
        }}
      >
        Total amount you owe — debts that reduce your net worth.
      </Text>

      <View style={{ marginBottom: spacing.xl }}>
        <Text
          style={{
            fontSize: fontSize.sm,
            fontWeight: fontWeight.semibold,
            color: colors.text,
            marginBottom: spacing.sm,
          }}
        >
          Common liabilities:
        </Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 22 }}>
          {'\u2022'} Credit card balances{'\n'}
          {'\u2022'} Mortgage{'\n'}
          {'\u2022'} Auto loans{'\n'}
          {'\u2022'} Student loans{'\n'}
          {'\u2022'} Personal loans
        </Text>
      </View>

      <View>
        <Text
          style={{
            fontSize: fontSize.sm,
            fontWeight: fontWeight.semibold,
            color: colors.text,
            marginBottom: spacing.sm,
          }}
        >
          Why it matters:
        </Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 22 }}>
          Tracking debt paydown progress is motivating. Every dollar paid off increases your net
          worth.
        </Text>
      </View>
    </InfoSheet>
  )
}

/**
 * Wealth goal info bottom sheet
 */
function WealthGoalInfoSheet({
  visible,
  onClose,
  colors,
  startNetWorth,
  startYearMonth,
  targetNetWorth,
}: {
  visible: boolean
  onClose: () => void
  colors: AssetsColors
  startNetWorth: number
  startYearMonth: string
  targetNetWorth: number
}) {
  return (
    <InfoSheet
      visible={visible}
      onClose={onClose}
      title="Wealth goal"
      colors={{
        surface: colors.surface,
        text: colors.text,
        textSecondary: colors.textSecondary,
        surfaceAlt: colors.surfaceAlt,
        primary: colors.primary,
      }}
      snapPoints={MODAL_SNAP_HALF}
    >
      <Text
        style={{
          fontSize: fontSize.md,
          color: colors.textSecondary,
          lineHeight: 22,
          marginBottom: spacing.xl,
        }}
      >
        A wealth goal is a target net worth you want to reach by a specific date, usually year-end.
      </Text>

      <View style={{ marginBottom: spacing.xl }}>
        <Text
          style={{
            fontSize: fontSize.sm,
            fontWeight: fontWeight.semibold,
            color: colors.text,
            marginBottom: spacing.sm,
          }}
        >
          Starting point
        </Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 22 }}>
          Your net worth on {formatYearMonth(startYearMonth)}: {formatUsdInt(startNetWorth)}
        </Text>
      </View>

      <View>
        <Text
          style={{
            fontSize: fontSize.sm,
            fontWeight: fontWeight.semibold,
            color: colors.text,
            marginBottom: spacing.sm,
          }}
        >
          Target
        </Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 22 }}>
          Where you want to be by year-end: {formatUsdInt(targetNetWorth)}
        </Text>
      </View>
    </InfoSheet>
  )
}

/**
 * Small info indicator for tappable items
 */
function InfoIndicator({ color }: { color: string }) {
  return (
    <View
      style={{
        width: 14,
        height: 14,
        borderRadius: radius.full,
        borderWidth: 1,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.6,
      }}
    >
      <Text style={{ fontSize: 9, fontWeight: fontWeight.bold, color }}>i</Text>
    </View>
  )
}

export function AssetsBody({ colors, scope, period, selectedMemberIds }: Props) {
  const data = useAssetsData({ scope, period, selectedMemberIds })
  const runwayData = useRunwayData(data.summary.liquidifiableAmount)
  const [showLiquidityInfo, setShowLiquidityInfo] = useState(false)
  const [showRunwayInfo, setShowRunwayInfo] = useState(false)
  const [showLiabilitiesInfo, setShowLiabilitiesInfo] = useState(false)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [balanceSheetFilter, setBalanceSheetFilter] = useState<'all' | 'liquid'>('all')
  const [longTermCollapsed, setLongTermCollapsed] = useState(true) // Default collapsed in Accessible mode

  // Close info sheets when navigating away to prevent stale state on return
  useFocusEffect(
    useCallback(() => {
      return () => {
        setShowLiquidityInfo(false)
        setShowRunwayInfo(false)
        setShowLiabilitiesInfo(false)
        setShowGoalModal(false)
      }
    }, [])
  )

  // Calculate accessible and liabilities change % based on scope
  const { accessibleChangePercent, liabilitiesChangePercent, comparisonLabel } = useMemo(() => {
    const trend = data.trend
    if (trend.length < 2) {
      return { accessibleChangePercent: null, liabilitiesChangePercent: null, comparisonLabel: '' }
    }

    // Determine comparison point based on scope
    let compareIndex: number
    let label: string

    if (scope === 'all') {
      // Compare vs first data point
      compareIndex = 0
      const firstPoint = trend[0]
      if (firstPoint) {
        const [year, month] = firstPoint.yearMonth.split('-')
        const monthNames = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ]
        label = `vs ${monthNames[Number(month) - 1]} ${year}`
      } else {
        label = ''
      }
    } else if (scope === 'year') {
      // Compare vs Jan 1 of the selected year
      const janYearMonth = `${period.year}-01`
      compareIndex = trend.findIndex((t) => t.yearMonth === janYearMonth)
      if (compareIndex === -1) compareIndex = 0
      label = `vs Jan ${period.year}`
    } else {
      // Monthly: compare vs last month
      compareIndex = trend.length - 2
      label = 'vs last mo'
    }

    const comparePoint = trend[compareIndex]
    if (!comparePoint) {
      return { accessibleChangePercent: null, liabilitiesChangePercent: null, comparisonLabel: '' }
    }

    const currentAccessible = data.summary.liquidifiableAmount
    const compareAccessible = comparePoint.liquidifiable
    const accessibleChange =
      compareAccessible > 0
        ? Math.round(((currentAccessible - compareAccessible) / compareAccessible) * 1000) / 10
        : null

    const currentLiabilities = data.summary.totalLiabilities
    const compareLiabilities = comparePoint.totalLiabilities
    const liabilitiesChange =
      compareLiabilities > 0
        ? Math.round(((currentLiabilities - compareLiabilities) / compareLiabilities) * 1000) / 10
        : null

    return {
      accessibleChangePercent: accessibleChange,
      liabilitiesChangePercent: liabilitiesChange,
      comparisonLabel: label,
    }
  }, [
    data.trend,
    data.summary.liquidifiableAmount,
    data.summary.totalLiabilities,
    scope,
    period.year,
  ])

  const handleOpenSettings = useCallback(() => {
    router.push('/(modal)/asset-settings')
  }, [])

  function toggleCategory(categoryKey: string) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryKey)) {
        next.delete(categoryKey)
      } else {
        next.add(categoryKey)
      }
      return next
    })
  }

  // Calculate breakdown data - organized by field with items
  const breakdownByField = data.fieldGroups.map((group) => ({
    field: group.field,
    fieldName: group.fieldName,
    total: group.total,
    isLiability: group.field === 'liabilities',
    categories: group.categories
      .map((cat) => ({
        key: cat.category,
        label: cat.categoryName,
        value: Math.abs(cat.total),
        items: cat.items
          .filter((item) => item.balance !== 0)
          .map((item) => ({
            id: item.id,
            name: item.name,
            value: Math.abs(item.balance),
          }))
          .sort((a, b) => b.value - a.value),
      }))
      .sort((a, b) => b.value - a.value),
  }))

  // Empty state
  if (data.fieldGroups.length === 0 && data.summary.netWorth === 0) {
    return (
      <EmptyState
        icon="briefcase"
        title="No assets tracked yet"
        description="Add your first asset to start tracking your net worth."
        action={{
          label: '+ Add Asset',
          onPress: () => router.push('/(modal)/asset-settings/add'),
        }}
        colors={{
          text: colors.text,
          textSecondary: colors.textSecondary,
          primary: colors.primary,
          onPrimary: colors.surface,
        }}
      />
    )
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Bottom Sheets */}
      <LiquidityInfoSheet
        visible={showLiquidityInfo}
        onClose={() => setShowLiquidityInfo(false)}
        colors={colors}
      />
      <RunwayInfoSheet
        visible={showRunwayInfo}
        onClose={() => setShowRunwayInfo(false)}
        colors={colors}
        avgMonthlyExpense={runwayData.avgMonthlyExpense}
        hasEnoughData={runwayData.hasEnoughData}
        monthCount={runwayData.monthCount}
      />
      <LiabilitiesInfoSheet
        visible={showLiabilitiesInfo}
        onClose={() => setShowLiabilitiesInfo(false)}
        colors={colors}
      />
      <WealthGoalInfoSheet
        visible={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        colors={colors}
        startNetWorth={data.goalProgress.startNetWorth}
        startYearMonth={data.goalProgress.startYearMonth}
        targetNetWorth={data.goalProgress.startNetWorth + data.goalProgress.targetGrowth}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing['3xl'] }}
        showsVerticalScrollIndicator={false}
      >
        {/* Tracking since (All scope only) */}
        {scope === 'all' && (
          <TrackingSince date={data.firstTransactionDate} color={colors.textSecondary} />
        )}

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* Hero: Current Net Worth */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {(() => {
          const accessible = data.summary.liquidifiableAmount
          const liabilities = data.summary.totalLiabilities

          // Determine label based on scope
          // "Current Net Worth" only for 'all' scope (always current)
          // "Net Worth" for past months/years
          const netWorthLabel = scope === 'all' ? 'Current Net Worth' : 'Net Worth'

          return (
            <View style={{ paddingVertical: spacing.xl, marginBottom: spacing.sm }}>
              {/* Net Worth - centered */}
              <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
                <Text
                  style={{
                    fontSize: fontSize.xs,
                    fontWeight: fontWeight.medium,
                    color: colors.textSecondary,
                    letterSpacing: letterSpacing.wider,
                    marginBottom: spacing.sm,
                  }}
                >
                  {netWorthLabel}
                </Text>
                <Text
                  style={{
                    fontSize: displaySize.xl,
                    fontWeight: fontWeight.heavy,
                    color: colors.text,
                    letterSpacing: -1,
                  }}
                >
                  {formatUsdInt(data.summary.netWorth)}
                </Text>
                <Text
                  style={{
                    fontSize: fontSize.sm,
                    color: colors.textSecondary,
                    marginTop: spacing.sm,
                  }}
                >
                  <Text
                    style={{
                      fontWeight: fontWeight.semibold,
                      color: data.yearlySnapshot.growth >= 0 ? colors.success : colors.danger,
                    }}
                  >
                    {data.yearlySnapshot.growth >= 0 ? '+' : '-'}
                    {formatUsdInt(Math.abs(data.yearlySnapshot.growth))}
                  </Text>{' '}
                  since Jan {data.year}
                </Text>
              </View>

              {/* Accessible vs Liabilities - two columns with subtle middle divider */}
              <View style={{ flexDirection: 'row' }}>
                {/* Accessible */}
                <Pressable
                  onPress={() => setShowLiquidityInfo(true)}
                  style={{
                    flex: 1,
                    padding: spacing.lg,
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.xs,
                      marginBottom: spacing.xs,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: fontSize.xs,
                        fontWeight: fontWeight.medium,
                        color: colors.textSecondary,
                        letterSpacing: letterSpacing.wider,
                      }}
                    >
                      Accessible
                    </Text>
                    <InfoIndicator color={colors.textSecondary} />
                  </View>
                  <Text
                    style={{
                      fontSize: fontSize.xl,
                      fontWeight: fontWeight.bold,
                      color: colors.text,
                    }}
                  >
                    {formatUsdInt(accessible)}
                  </Text>
                  {accessibleChangePercent !== null && comparisonLabel ? (
                    <Text
                      style={{
                        fontSize: fontSize.xs,
                        color: accessibleChangePercent >= 0 ? colors.success : colors.danger,
                        marginTop: spacing.xs,
                      }}
                    >
                      {accessibleChangePercent >= 0 ? '↑' : '↓'} {Math.abs(accessibleChangePercent)}
                      % {comparisonLabel}
                    </Text>
                  ) : (
                    <Text
                      style={{
                        fontSize: fontSize.xs,
                        color: colors.textSecondary,
                        marginTop: spacing.xs,
                      }}
                    >
                      —
                    </Text>
                  )}
                </Pressable>

                {/* Subtle middle divider */}
                <View
                  style={{
                    width: 1,
                    backgroundColor: colors.border,
                    marginVertical: spacing.sm,
                    opacity: 0.5,
                  }}
                />

                {/* Liabilities */}
                <Pressable
                  onPress={() => setShowLiabilitiesInfo(true)}
                  style={{
                    flex: 1,
                    padding: spacing.lg,
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.xs,
                      marginBottom: spacing.xs,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: fontSize.xs,
                        fontWeight: fontWeight.medium,
                        color: colors.textSecondary,
                        letterSpacing: letterSpacing.wider,
                      }}
                    >
                      Liabilities
                    </Text>
                    <InfoIndicator color={colors.textSecondary} />
                  </View>
                  <Text
                    style={{
                      fontSize: fontSize.xl,
                      fontWeight: fontWeight.bold,
                      color: colors.text,
                    }}
                  >
                    {formatUsdInt(liabilities)}
                  </Text>
                  {liabilitiesChangePercent !== null && comparisonLabel ? (
                    <Text
                      style={{
                        fontSize: fontSize.xs,
                        // For liabilities, decrease is good (green), increase is bad (red)
                        color: liabilitiesChangePercent <= 0 ? colors.success : colors.danger,
                        marginTop: spacing.xs,
                      }}
                    >
                      {liabilitiesChangePercent <= 0 ? '↓' : '↑'}{' '}
                      {Math.abs(liabilitiesChangePercent)}% {comparisonLabel}
                    </Text>
                  ) : (
                    <Text
                      style={{
                        fontSize: fontSize.xs,
                        color: colors.textSecondary,
                        marginTop: spacing.xs,
                      }}
                    >
                      —
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          )
        })()}

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* Runway Section (All scope only) */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {scope === 'all' &&
          (() => {
            const runwayDisplay =
              runwayData.runwayMonths !== null
                ? runwayData.runwayMonths >= 12
                  ? `${(runwayData.runwayMonths / 12).toFixed(1)} years`
                  : `${runwayData.runwayMonths.toFixed(1)} months`
                : null

            return (
              <Pressable
                onPress={() => setShowRunwayInfo(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: colors.surfaceAlt,
                  borderRadius: radius.lg,
                  padding: spacing.lg,
                  marginBottom: spacing.lg,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <Text
                    style={{
                      fontSize: fontSize.md,
                      fontWeight: fontWeight.semibold,
                      color: colors.text,
                    }}
                  >
                    Runway
                  </Text>
                  <InfoIndicator color={colors.textSecondary} />
                </View>
                {runwayDisplay !== null ? (
                  <Text
                    style={{
                      fontSize: fontSize.lg,
                      fontWeight: fontWeight.bold,
                      color: colors.text,
                    }}
                  >
                    {runwayDisplay}
                  </Text>
                ) : (
                  <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>
                    Need more data
                  </Text>
                )}
              </Pressable>
            )
          })()}

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* Goal Section (after Liquidity - Safety before Ambition) */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {data.goalProgress.hasGoal &&
          (() => {
            const targetNetWorth = data.goalProgress.startNetWorth + data.goalProgress.targetGrowth
            const currentNetWorth = data.summary.netWorth
            const remaining = targetNetWorth - currentNetWorth
            const isAchieved = currentNetWorth >= targetNetWorth
            const progressPercent =
              targetNetWorth > 0
                ? Math.min(Math.round((currentNetWorth / targetNetWorth) * 100), 100)
                : 0

            return (
              <View style={{ marginBottom: spacing['2xl'] }}>
                {/* Divider above */}
                <View
                  style={{
                    height: 1,
                    backgroundColor: colors.border,
                    marginBottom: spacing.lg,
                    opacity: 0.5,
                  }}
                />

                {/* Header row: Title + info button + menu button */}
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}
                >
                  <Text
                    style={{
                      fontSize: fontSize.lg,
                      fontWeight: fontWeight.semibold,
                      color: colors.text,
                      flex: 1,
                    }}
                  >
                    Wealth goal
                  </Text>
                  <Pressable
                    onPress={() => setShowGoalModal(true)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    style={{ marginRight: spacing.md }}
                  >
                    <InfoIndicator color={colors.textSecondary} />
                  </Pressable>
                  {/* v2: Goal settings menu - hidden for v1 */}
                </View>

                {/* Progress text */}
                <Text
                  style={{
                    fontSize: fontSize.sm,
                    color: colors.textSecondary,
                    marginBottom: spacing.md,
                  }}
                >
                  {formatUsdInt(currentNetWorth)} of {formatUsdInt(targetNetWorth)}
                </Text>

                {/* Progress bar */}
                <View
                  style={{
                    height: spacing.sm,
                    backgroundColor: colors.surfaceAlt,
                    borderRadius: radius.sm,
                    overflow: 'hidden',
                    marginBottom: spacing.md,
                  }}
                >
                  <View
                    style={{
                      height: '100%',
                      width: `${progressPercent}%`,
                      backgroundColor: colors.primary,
                      borderRadius: radius.sm,
                    }}
                  />
                </View>

                {/* Bottom row: remaining + percentage */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: fontSize.sm, color: colors.text }}>
                    {isAchieved ? (
                      <>Goal reached! +{formatUsdInt(Math.abs(remaining))} above</>
                    ) : (
                      <>
                        <Text style={{ fontWeight: fontWeight.semibold }}>
                          {formatUsdInt(remaining)}
                        </Text>{' '}
                        to go
                      </>
                    )}
                  </Text>
                  <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>
                    {progressPercent}% complete
                  </Text>
                </View>
              </View>
            )
          })()}

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* Balance Sheet */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <View>
          {/* Divider above */}
          <View
            style={{
              height: 1,
              backgroundColor: colors.border,
              marginBottom: spacing.lg,
              opacity: 0.5,
            }}
          />

          {/* Header: title + toggle (same style as Wealth goal) */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}>
            <Text
              style={{
                fontSize: fontSize.lg,
                fontWeight: fontWeight.semibold,
                color: colors.text,
                flex: 1,
              }}
            >
              Balance sheet
            </Text>
            {/* All | Actionable toggle */}
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: colors.surfaceAlt,
                borderRadius: radius.full,
                padding: 2,
              }}
            >
              <Pressable
                onPress={() => setBalanceSheetFilter('all')}
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: radius.full,
                  backgroundColor: balanceSheetFilter === 'all' ? colors.text : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontSize: fontSize.xs,
                    fontWeight: fontWeight.semibold,
                    color: balanceSheetFilter === 'all' ? colors.surface : colors.textSecondary,
                  }}
                >
                  All
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setBalanceSheetFilter('liquid')}
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: radius.full,
                  backgroundColor: balanceSheetFilter === 'liquid' ? colors.text : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontSize: fontSize.xs,
                    fontWeight: fontWeight.semibold,
                    color: balanceSheetFilter === 'liquid' ? colors.surface : colors.textSecondary,
                  }}
                >
                  Accessible
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Mode description */}
          <Text
            style={{
              fontSize: fontSize.xs,
              color: colors.textSecondary,
              marginBottom: spacing.md,
              opacity: 0.8,
            }}
          >
            {balanceSheetFilter === 'all'
              ? 'Full picture: all assets and liabilities'
              : 'What you can actually use right now'}
          </Text>

          {/* Single column flat list */}
          {(() => {
            // Get all categories
            // Category keys from asset.model.ts:
            // Liquid: cash_savings, investments
            // Long-term: real_estate, retirement_funds, kids
            const liquidCategories = breakdownByField
              .filter((g) => g.field !== 'liabilities')
              .flatMap((g) => g.categories)
              .filter((c) => ['cash_savings', 'investments'].includes(c.key))
              .filter((c) => c.value > 0)

            const longTermCategories = breakdownByField
              .filter((g) => g.field !== 'liabilities')
              .flatMap((g) => g.categories)
              .filter((c) => ['retirement_funds', 'real_estate', 'kids'].includes(c.key))
              .filter((c) => c.value > 0)

            const liabilityGroup = breakdownByField.find((g) => g.field === 'liabilities')
            const liabilityCategories = (liabilityGroup?.categories ?? []).filter(
              (c) => c.value > 0
            )

            // Split liabilities: short-term (due now) vs long-term
            // Category keys: credit_card, loans, other (from asset.model.ts)
            const shortTermLiabilities = liabilityCategories.filter((c) =>
              ['credit_card'].includes(c.key)
            )
            const longTermLiabilities = liabilityCategories.filter((c) =>
              ['loans', 'other'].includes(c.key)
            )
            const shortTermLiabilitiesTotal = shortTermLiabilities.reduce(
              (sum, cat) => sum + cat.value,
              0
            )

            // Helper to render a category row - ALL AMOUNTS NEUTRAL (white)
            const renderCategoryRow = (cat: (typeof liquidCategories)[0], isMuted = false) => {
              const isExpanded = expandedCategories.has(cat.key)
              const hasItems = cat.items.length > 0

              return (
                <View key={cat.key}>
                  <Pressable
                    onPress={() => hasItems && toggleCategory(cat.key)}
                    disabled={!hasItems}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: spacing.sm,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        color: colors.textSecondary,
                        width: 16,
                        opacity: isMuted ? 0.4 : 1,
                      }}
                    >
                      {hasItems ? (isExpanded ? '▼' : '▶') : ''}
                    </Text>
                    <Text
                      style={{
                        fontSize: fontSize.sm,
                        fontWeight: fontWeight.semibold,
                        color: isMuted ? colors.textSecondary : colors.text,
                        flex: 1,
                        opacity: isMuted ? 0.6 : 1,
                      }}
                      numberOfLines={1}
                    >
                      {cat.label}
                    </Text>
                    <Text
                      style={{
                        fontSize: fontSize.sm,
                        fontWeight: fontWeight.semibold,
                        color: isMuted ? colors.textSecondary : colors.text, // NEUTRAL
                        width: 100,
                        textAlign: 'right',
                        fontVariant: ['tabular-nums'],
                        opacity: isMuted ? 0.6 : 1,
                      }}
                    >
                      {formatUsdInt(cat.value)}
                    </Text>
                  </Pressable>
                  {isExpanded && hasItems && (
                    <View
                      style={{
                        flexDirection: 'row',
                        marginLeft: spacing.lg,
                        marginBottom: spacing.xs,
                      }}
                    >
                      <View
                        style={{
                          width: 1,
                          backgroundColor: colors.border,
                          marginRight: spacing.md,
                          opacity: isMuted ? 0.3 : 0.5,
                        }}
                      />
                      <View style={{ flex: 1 }}>
                        {cat.items.map((item) => (
                          <View
                            key={item.id}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              paddingVertical: 3,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: fontSize.xs,
                                color: colors.textSecondary,
                                flex: 1,
                                opacity: isMuted ? 0.5 : 1,
                              }}
                              numberOfLines={1}
                            >
                              {item.name}
                            </Text>
                            <Text
                              style={{
                                fontSize: fontSize.xs,
                                color: colors.textSecondary, // NEUTRAL
                                width: 90,
                                textAlign: 'right',
                                fontVariant: ['tabular-nums'],
                                opacity: isMuted ? 0.4 : 0.7,
                              }}
                            >
                              {formatUsdInt(item.value)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )
            }

            // Calculate totals
            const displayedAssets =
              balanceSheetFilter === 'liquid'
                ? data.summary.liquidifiableAmount
                : data.summary.totalAssets
            // In Actionable mode, only subtract short-term liabilities (credit cards)
            // Long-term debt (loans, mortgage) isn't "due now" so doesn't reduce actionable capital
            const displayedLiabilities =
              balanceSheetFilter === 'liquid'
                ? shortTermLiabilitiesTotal
                : data.summary.totalLiabilities
            const displayedNet = displayedAssets - displayedLiabilities

            // Section header component
            const SectionHeader = ({
              title,
              total,
              isMuted = false,
            }: {
              title: string
              total: number
              isMuted?: boolean
            }) => (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: spacing.md,
                  paddingBottom: spacing.sm,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  opacity: isMuted ? 0.6 : 1,
                }}
              >
                <Text
                  style={{
                    fontSize: fontSize.sm,
                    fontWeight: fontWeight.semibold,
                    color: isMuted ? colors.textSecondary : colors.text,
                    flex: 1,
                  }}
                >
                  {title}
                </Text>
                <Text
                  style={{
                    fontSize: fontSize.sm,
                    fontWeight: fontWeight.semibold,
                    color: isMuted ? colors.textSecondary : colors.text,
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {formatUsdInt(total)}
                </Text>
              </View>
            )

            return (
              <>
                {/* ══════════════════════════════════════════════════════════════ */}
                {/* ALL MODE */}
                {/* ══════════════════════════════════════════════════════════════ */}
                {balanceSheetFilter === 'all' && (
                  <>
                    {/* Assets section */}
                    <SectionHeader title="Assets" total={data.summary.totalAssets} />
                    {liquidCategories.map((cat) => renderCategoryRow(cat))}
                    {longTermCategories.map((cat) => renderCategoryRow(cat))}

                    {/* Liabilities section */}
                    {liabilityCategories.length > 0 && (
                      <View style={{ marginTop: spacing.xl }}>
                        <SectionHeader title="Liabilities" total={data.summary.totalLiabilities} />
                        {liabilityCategories.map((cat) => renderCategoryRow(cat))}
                      </View>
                    )}

                    {/* Equation */}
                    <View
                      style={{
                        marginTop: spacing.xl,
                        paddingTop: spacing.lg,
                        borderTopWidth: 1,
                        borderTopColor: colors.border,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>
                          Assets − Liabilities
                        </Text>
                        <Text
                          style={{
                            fontSize: fontSize.lg,
                            fontWeight: fontWeight.bold,
                            color: colors.text,
                            fontVariant: ['tabular-nums'],
                          }}
                        >
                          {formatUsdInt(displayedNet)}
                        </Text>
                      </View>
                    </View>
                  </>
                )}

                {/* ══════════════════════════════════════════════════════════════ */}
                {/* ACTIONABLE MODE - Same pattern as All mode (equation at bottom) */}
                {/* ══════════════════════════════════════════════════════════════ */}
                {balanceSheetFilter === 'liquid' && (
                  <>
                    {/* Accessible assets */}
                    <SectionHeader
                      title="Accessible assets"
                      total={data.summary.liquidifiableAmount}
                    />
                    {liquidCategories.map((cat) => renderCategoryRow(cat))}

                    {/* Short-term liabilities (due now) - only these are subtracted */}
                    {shortTermLiabilities.length > 0 && (
                      <View style={{ marginTop: spacing.xl }}>
                        <SectionHeader
                          title="Liabilities due now"
                          total={shortTermLiabilitiesTotal}
                        />
                        {shortTermLiabilities.map((cat) => renderCategoryRow(cat))}
                      </View>
                    )}

                    {/* Equation - right after its components */}
                    <View
                      style={{
                        marginTop: spacing.xl,
                        paddingTop: spacing.lg,
                        borderTopWidth: 1,
                        borderTopColor: colors.border,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>
                          Accessible − Liabilities due now
                        </Text>
                        <Text
                          style={{
                            fontSize: fontSize.lg,
                            fontWeight: fontWeight.bold,
                            color: colors.text,
                            fontVariant: ['tabular-nums'],
                          }}
                        >
                          {formatUsdInt(displayedNet)}
                        </Text>
                      </View>
                    </View>

                    {/* Long-term section (supplementary, not part of calculation) */}
                    {(longTermCategories.length > 0 || longTermLiabilities.length > 0) && (
                      <View style={{ marginTop: spacing.xl, opacity: 0.6 }}>
                        {/* Thinner divider */}
                        <View
                          style={{
                            height: 1,
                            backgroundColor: colors.border,
                            marginBottom: spacing.md,
                            opacity: 0.4,
                          }}
                        />

                        {/* Collapsible header */}
                        <Pressable
                          onPress={() => setLongTermCollapsed(!longTermCollapsed)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: spacing.xs,
                          }}
                        >
                          <Text style={{ fontSize: 10, color: colors.textSecondary, width: 16 }}>
                            {longTermCollapsed ? '▶' : '▼'}
                          </Text>
                          <Text
                            style={{ fontSize: fontSize.sm, color: colors.textSecondary, flex: 1 }}
                          >
                            Long-term
                          </Text>
                          <Text
                            style={{
                              fontSize: fontSize.xs,
                              color: colors.textSecondary,
                              fontStyle: 'italic',
                            }}
                          >
                            Not included in calculation
                          </Text>
                        </Pressable>

                        {/* Expanded content */}
                        {!longTermCollapsed && (
                          <View style={{ marginTop: spacing.sm }}>
                            {/* Long-term assets */}
                            {longTermCategories.length > 0 && (
                              <View style={{ marginBottom: spacing.md }}>
                                <Text
                                  style={{
                                    fontSize: fontSize.xs,
                                    color: colors.textSecondary,
                                    marginBottom: spacing.sm,
                                    opacity: 0.7,
                                  }}
                                >
                                  Assets
                                </Text>
                                {longTermCategories.map((cat) => renderCategoryRow(cat, true))}
                              </View>
                            )}
                            {/* Long-term liabilities */}
                            {longTermLiabilities.length > 0 && (
                              <View>
                                <Text
                                  style={{
                                    fontSize: fontSize.xs,
                                    color: colors.textSecondary,
                                    marginBottom: spacing.sm,
                                    opacity: 0.7,
                                  }}
                                >
                                  Liabilities
                                </Text>
                                {longTermLiabilities.map((cat) => renderCategoryRow(cat, true))}
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    )}
                  </>
                )}
              </>
            )
          })()}
        </View>

        {/* Assets Settings button at bottom */}
        <SettingsLink label="Assets Settings" onPress={handleOpenSettings} color={colors.primary} />
      </ScrollView>
    </View>
  )
}
