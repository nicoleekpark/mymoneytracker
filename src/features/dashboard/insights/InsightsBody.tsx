import FontAwesome from '@expo/vector-icons/FontAwesome'
import React, { useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { EmptyState, SectionHeader } from '@/shared/components'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import { spacing } from '@/shared/theme/tokens/spacing'
import { radius } from '@/shared/theme/tokens/radius'
import { SECTION_GAP } from '@/shared/theme/tokens/viewStyles'

import { NetSparkline, CategoryDeltaBar, DailyOutflowBars } from './components'
import { useInsightsData } from './hooks'
import type { InsightsColors, InsightsDuration } from './insights.types'
import { DURATION_OPTIONS } from './insights.types'

type Props = {
  monthYYYYMM: string
  colors: InsightsColors
}

export function InsightsBody({ monthYYYYMM, colors }: Props) {
  const [duration, setDuration] = useState<InsightsDuration>(6)
  const [showDurationPicker, setShowDurationPicker] = useState(false)
  const { loading, error, data } = useInsightsData(monthYYYYMM, duration)

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

  // Check if we have any transactions at all
  const hasAnyData = data.hasEnoughData || summary.netCents !== 0

  // Only show completely empty state if there's literally no data
  if (!hasAnyData && availableMonths === 0) {
    return (
      <EmptyState
        icon="line-chart"
        title="Not enough data for insights"
        description="Add more transactions to see spending patterns and trends."
        colors={colors}
      />
    )
  }

  // Find specific insights for section content
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

  // Smart format helper - show cents only when non-zero
  const smartFmt = (n: number): string => {
    return n % 1 !== 0
      ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : Math.round(n).toLocaleString('en-US')
  }

  // Format delta with sign
  const formatDeltaWithSign = (val: number): string => {
    const abs = Math.abs(val)
    const prefix = val >= 0 ? '+' : '-'
    if (abs >= 1000) {
      return `${prefix}$${(abs / 1000).toFixed(1)}k`
    }
    return `${prefix}$${smartFmt(abs)}`
  }

  // Data quality info
  const isLimitedData = availableMonths < 6

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing['3xl'] }}
        showsVerticalScrollIndicator={false}
      >
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* Section: Primary Driver (no hero - Overview has the net already) */}
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
        {/* Section: Spending Pattern - aggregated by day of month */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <View style={{ marginBottom: SECTION_GAP }}>
          <SectionHeader
            title="Spending by day"
            description={`Average spending per day of month (${durationLabel})`}
            colors={colors}
          />
          {dailyOutflow.length > 0 ? (
            <DailyOutflowBars data={dailyOutflow} colors={colors} />
          ) : (
            <View style={{
              backgroundColor: colors.surfaceAlt,
              borderRadius: radius.lg,
              padding: spacing.lg,
              alignItems: 'center'
            }}>
              <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center' }}>
                No spending data yet
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
