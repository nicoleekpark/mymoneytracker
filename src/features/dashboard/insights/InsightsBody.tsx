import FontAwesome from '@expo/vector-icons/FontAwesome'
import React, { useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { InfoSheet, SectionHeader } from '@/shared/components'
import { fontSize, fontWeight, displaySize, letterSpacing } from '@/shared/theme/tokens/typography'
import { spacing } from '@/shared/theme/tokens/spacing'
import { radius } from '@/shared/theme/tokens/radius'
import { SECTION_GAP } from '@/shared/theme/tokens/viewStyles'
import { MODAL_SNAP_COMPACT } from '@/shared/theme/tokens/modal'
import { formatUsdInt } from '@/shared/format/currency'

import { NetSparkline, CategoryDeltaBar, DailyOutflowBars } from './components'
import { useInsightsData } from './hooks'
import type { InsightsColors, InsightsDuration } from './insights.types'
import { DURATION_OPTIONS } from './insights.types'

type Props = {
  monthYYYYMM: string
  colors: InsightsColors
}

/**
 * Info sheet for "Typical" explanation
 */
function TypicalInfoSheet({
  visible,
  onClose,
  colors
}: {
  visible: boolean
  onClose: () => void
  colors: InsightsColors
}) {
  return (
    <InfoSheet
      visible={visible}
      onClose={onClose}
      title="What is 'Typical'?"
      colors={{
        surface: colors.surface,
        text: colors.text,
        textSecondary: colors.textSecondary,
        surfaceAlt: colors.surfaceAlt
      }}
      snapPoints={MODAL_SNAP_COMPACT}
    >
      <View style={{ marginBottom: spacing.md }}>
        <Text style={{ fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm }}>
          Definition
        </Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 19 }}>
          Your typical month is the median of your last 6-12 months of net cash flow.
        </Text>
      </View>
      <View style={{ marginBottom: spacing.md }}>
        <Text style={{ fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm }}>
          Why median?
        </Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 19 }}>
          More stable than average - one big expense won't skew it.
        </Text>
      </View>
      <View>
        <Text style={{ fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm }}>
          How to use it
        </Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 19 }}>
          Compare this month against typical to spot unusual patterns.
        </Text>
      </View>
    </InfoSheet>
  )
}

export function InsightsBody({ monthYYYYMM, colors }: Props) {
  const [duration, setDuration] = useState<InsightsDuration>(6)
  const [showDurationPicker, setShowDurationPicker] = useState(false)
  const { loading, error, data } = useInsightsData(monthYYYYMM, duration)
  const [showTypicalInfo, setShowTypicalInfo] = useState(false)

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: spacing['3xl'] }}>
        <ActivityIndicator size="large" color={colors.primary} />
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

  const { summary, insights, categoryComparison, netTrend, dailyOutflow, medianNet, availableMonths, durationLabel } = data

  // Extract key values from summary
  const vsTypical = summary.baselineNetCents !== null
    ? (summary.netCents - summary.baselineNetCents) / 100
    : null
  const netDollar = summary.netCents / 100

  // Check if we have any transactions at all this month
  const hasAnyData = data.hasEnoughData || netDollar !== 0

  // Only show completely empty state if there's literally no data
  if (!hasAnyData && availableMonths === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing['3xl'] }}>
        <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text, textAlign: 'center', marginBottom: spacing.sm }}>
          No transactions yet
        </Text>
        <Text style={{ fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 }}>
          Add some transactions to see insights about your spending patterns.
        </Text>
      </View>
    )
  }

  // Find specific insights for section content
  const volatilityInsight = insights.find(i => i.id === 'volatility')
  const opportunityInsight = insights.find(i => i.id === 'opportunities')

  // Primary driver - find the category with biggest absolute delta vs average
  // Only show if we have at least 2 months of data for comparison
  const hasEnoughDataForComparison = availableMonths >= 2
  const primaryDriver = categoryComparison.length > 0 && hasEnoughDataForComparison
    ? categoryComparison.reduce((max, cat) => {
        const delta = Math.abs(cat.thisMonth - cat.avgAmount)
        const maxDelta = Math.abs(max.thisMonth - max.avgAmount)
        return delta > maxDelta ? cat : max
      }, categoryComparison[0])
    : null
  // Values are already in dollars, no need to divide by 100
  const primaryDriverDelta = primaryDriver
    ? (primaryDriver.thisMonth - primaryDriver.avgAmount)
    : 0
  // Don't show if delta is effectively zero (less than $1)
  const showPrimaryDriver = primaryDriver && Math.abs(primaryDriverDelta) >= 1

  // Format vs typical value - always with sign
  const formatVsTypical = (val: number | null): string => {
    if (val === null) return formatUsdInt(netDollar)
    const abs = Math.abs(val)
    const prefix = val >= 0 ? '+' : '-'
    if (abs >= 1000) {
      return `${prefix}$${(abs / 1000).toFixed(1)}k`
    }
    return `${prefix}$${Math.round(abs)}`
  }

  // Format delta for subtitle
  const formatDeltaCompact = (val: number): string => {
    const abs = Math.abs(val)
    if (abs >= 1000) {
      return `$${(abs / 1000).toFixed(1)}k`
    }
    return `$${Math.round(abs)}`
  }

  // Format delta with sign
  const formatDeltaWithSign = (val: number): string => {
    const abs = Math.abs(val)
    const prefix = val >= 0 ? '+' : '-'
    if (abs >= 1000) {
      return `${prefix}$${(abs / 1000).toFixed(1)}k`
    }
    return `${prefix}$${Math.round(abs)}`
  }

  // Data quality info
  const isLimitedData = availableMonths < 6

  return (
    <View style={{ flex: 1 }}>
      {/* Info Sheets */}
      <TypicalInfoSheet
        visible={showTypicalInfo}
        onClose={() => setShowTypicalInfo(false)}
        colors={colors}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing['3xl'] }}
        showsVerticalScrollIndicator={false}
      >
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* Hero Section - NEUTRAL like Assets, colored delta in subtitle only */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <View style={{ marginBottom: SECTION_GAP }}>
          {/* Hero: vs Typical - centered */}
          <Pressable
            onPress={() => setShowTypicalInfo(true)}
            style={{ alignItems: 'center', paddingVertical: spacing.xl }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm }}>
              <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary, letterSpacing: letterSpacing.wider }}>
                vs Typical
              </Text>
              <View
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: radius.full,
                  borderWidth: 1,
                  borderColor: colors.textSecondary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.6
                }}
              >
                <Text style={{ fontSize: 9, fontWeight: fontWeight.bold, color: colors.textSecondary }}>i</Text>
              </View>
            </View>

            {/* Primary value - NEUTRAL */}
            <Text
              style={{
                fontSize: displaySize.xl,
                fontWeight: fontWeight.heavy,
                color: colors.text,
                letterSpacing: -1
              }}
            >
              {formatVsTypical(vsTypical)}
            </Text>

            {/* Secondary text with colored delta indicator */}
            <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.sm }}>
              {vsTypical !== null ? (
                <>
                  <Text style={{ fontWeight: fontWeight.semibold, color: vsTypical >= 0 ? colors.success : colors.danger }}>
                    {vsTypical >= 0 ? '↑' : '↓'} {formatDeltaCompact(vsTypical)}
                  </Text>
                  {' '}{vsTypical >= 0 ? 'above' : 'below'} typical
                </>
              ) : (
                'Not enough history yet'
              )}
            </Text>
          </Pressable>

          {/* Stats Row: This Month Net | Typical - NEUTRAL values */}
          <View style={{ flexDirection: 'row' }}>
            {/* This Month */}
            <View style={{ flex: 1, padding: spacing.lg, alignItems: 'center' }}>
              <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary, letterSpacing: letterSpacing.wider, marginBottom: spacing.xs }}>
                This month
              </Text>
              <Text style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, fontVariant: ['tabular-nums'] }}>
                {formatUsdInt(netDollar)}
              </Text>
            </View>

            {/* Subtle middle divider */}
            <View style={{ width: 1, backgroundColor: colors.border, marginVertical: spacing.sm, opacity: 0.5 }} />

            {/* Typical */}
            <View style={{ flex: 1, padding: spacing.lg, alignItems: 'center' }}>
              <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary, letterSpacing: letterSpacing.wider, marginBottom: spacing.xs }}>
                Typical
              </Text>
              <Text style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, fontVariant: ['tabular-nums'] }}>
                {medianNet !== null ? formatUsdInt(medianNet) : '—'}
              </Text>
            </View>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* Section: Primary Driver */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <View style={{ marginBottom: SECTION_GAP }}>
          <SectionHeader
            title="Primary driver"
            description={showPrimaryDriver ? `Which category changed the most vs ${durationLabel}` : 'Which category changed the most'}
            colors={colors}
          />
          {showPrimaryDriver ? (
            <>
              <Text style={{ fontSize: fontSize.md, color: colors.text, marginBottom: spacing.md }}>
                <Text style={{ fontWeight: fontWeight.semibold }}>{primaryDriver!.name}</Text>
                {' '}
                {primaryDriverDelta >= 0 ? 'up' : 'down'}
                {' '}
                <Text style={{ fontWeight: fontWeight.semibold }}>
                  {formatDeltaWithSign(primaryDriverDelta)}
                </Text>
                {' '}vs {durationLabel}
              </Text>
              <CategoryDeltaBar data={categoryComparison} colors={colors} />
            </>
          ) : (
            <View style={{
              backgroundColor: colors.surfaceAlt,
              borderRadius: radius.lg,
              padding: spacing.lg,
              alignItems: 'center'
            }}>
              <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center' }}>
                {availableMonths < 2
                  ? 'Need 2+ months to compare categories'
                  : 'No significant category changes this month'}
              </Text>
            </View>
          )}
        </View>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* Section: Net Trend */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <View style={{ marginBottom: SECTION_GAP }}>
          <SectionHeader
            title="Net trend"
            description="Long-term pattern and current position"
            colors={colors}
          />
          {netTrend.length > 1 && medianNet !== null ? (
            <NetSparkline
              data={netTrend}
              baseline={medianNet}
              colors={colors}
            />
          ) : (
            <View style={{
              backgroundColor: colors.surfaceAlt,
              borderRadius: radius.lg,
              padding: spacing.lg,
              alignItems: 'center'
            }}>
              <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center' }}>
                Need 2+ months to show trend
              </Text>
            </View>
          )}
        </View>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* Section: Spending Pattern */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <View style={{ marginBottom: SECTION_GAP }}>
          <SectionHeader
            title="Spending pattern"
            description={volatilityInsight?.body ?? 'Daily outflow distribution'}
            colors={colors}
          />
          {dailyOutflow.length > 0 ? (
            <DailyOutflowBars data={dailyOutflow} monthYYYYMM={monthYYYYMM} colors={colors} />
          ) : (
            <View style={{
              backgroundColor: colors.surfaceAlt,
              borderRadius: radius.lg,
              padding: spacing.lg,
              alignItems: 'center'
            }}>
              <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center' }}>
                No spending data this month yet
              </Text>
            </View>
          )}
        </View>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* Section: Opportunity */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <View style={{ marginBottom: SECTION_GAP }}>
          <SectionHeader
            title="Opportunity"
            description="Suggested target for next month"
            colors={colors}
          />
          {opportunityInsight ? (
            <>
              <Text style={{ fontSize: fontSize.md, color: colors.text, lineHeight: 22 }}>
                {opportunityInsight.body}
              </Text>
              {opportunityInsight.sub && (
                <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs }}>
                  {opportunityInsight.sub}
                </Text>
              )}
            </>
          ) : (
            <View style={{
              backgroundColor: colors.surfaceAlt,
              borderRadius: radius.lg,
              padding: spacing.lg,
              alignItems: 'center'
            }}>
              <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center' }}>
                {availableMonths < 3
                  ? 'Need 3+ months to suggest targets'
                  : 'On track - no action needed'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* Sticky Footer: Duration Selector */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <View style={{
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>
            Based on
          </Text>
          <View style={{ position: 'relative' }}>
            <Pressable
              onPress={() => setShowDurationPicker(!showDurationPicker)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.xs,
                paddingVertical: spacing.xs,
                paddingHorizontal: spacing.sm,
                backgroundColor: colors.surfaceAlt,
                borderRadius: radius.md
              }}
            >
              <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text }}>
                {DURATION_OPTIONS.find(o => o.value === duration)?.label ?? '6 months'}
              </Text>
              <FontAwesome
                name={showDurationPicker ? 'chevron-up' : 'chevron-down'}
                size={10}
                color={colors.textSecondary}
              />
            </Pressable>

            {/* Dropdown Menu */}
            {showDurationPicker && (
              <View style={{
                position: 'absolute',
                bottom: '100%',
                right: 0,
                marginBottom: spacing.xs,
                backgroundColor: colors.surface,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: colors.border,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 5,
                minWidth: 120
              }}>
                {DURATION_OPTIONS.map((option, index) => {
                  // Disable options that require more months than available
                  const requiredMonths = option.value === 'all' ? 2 : option.value
                  const isDisabled = availableMonths < requiredMonths
                  const isSelected = duration === option.value

                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => {
                        if (!isDisabled) {
                          setDuration(option.value)
                          setShowDurationPicker(false)
                        }
                      }}
                      style={{
                        paddingVertical: spacing.sm,
                        paddingHorizontal: spacing.md,
                        borderBottomWidth: index < DURATION_OPTIONS.length - 1 ? 1 : 0,
                        borderBottomColor: colors.border,
                        backgroundColor: isSelected ? colors.surfaceAlt : 'transparent',
                        opacity: isDisabled ? 0.4 : 1
                      }}
                    >
                      <Text style={{
                        fontSize: fontSize.sm,
                        fontWeight: isSelected ? fontWeight.semibold : fontWeight.medium,
                        color: isSelected ? colors.primary : colors.text
                      }}>
                        {option.label}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            )}
          </View>
        </View>

        {/* Warning for limited data */}
        {isLimitedData && (
          <Text style={{ fontSize: fontSize.xs, color: colors.warning, marginTop: spacing.xs, textAlign: 'right' }}>
            More data = better insights
          </Text>
        )}
      </View>
    </View>
  )
}
