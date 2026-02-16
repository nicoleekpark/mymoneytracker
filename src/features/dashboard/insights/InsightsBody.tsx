import React from 'react'
import { ScrollView, Text, View } from 'react-native'
import { fontSize } from '@/theme/tokens/typography'
import { radius } from '@/theme/tokens/radius'
import { useHoHTheme } from '@/providers'

import { InsightCard, InsightCarousel, NetSparkline, WeekdayHeatHint, CategoryDeltaBar } from './components'
import { useInsightsData } from './hooks'
import type { InsightsColors } from './insights.types'

type Props = {
  monthYYYYMM: string
  colors: InsightsColors
}

// Section gap matching Monthly/Yearly/All views
const SECTION_GAP = 40

// Accent colors now come from theme (see theme.accent)

/**
 * Section header with accent line - matching Monthly/Yearly/All style
 */
function SectionHeader({
  title,
  accentColor,
  colors
}: {
  title: string
  accentColor: string
  colors: InsightsColors
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <View style={{ width: 3, height: 20, borderRadius: radius.xs, backgroundColor: accentColor }} />
      <Text style={{ fontSize: fontSize['2xl'], fontWeight: '700', color: colors.text }}>
        {title}
      </Text>
    </View>
  )
}

// Helper to properly flatten children
function flattenChildren(children: React.ReactNode): React.ReactNode[] {
  const result: React.ReactNode[] = []
  React.Children.forEach(children, child => {
    if (Array.isArray(child)) {
      result.push(...child.filter(Boolean))
    } else if (child) {
      result.push(child)
    }
  })
  return result
}

/**
 * Section container with carousel
 */
function InsightSection({
  title,
  accentColor,
  children,
  colors
}: {
  title: string
  accentColor: string
  children: React.ReactNode
  colors: InsightsColors
}) {
  const childArray = flattenChildren(children)
  if (childArray.length === 0) return null

  return (
    <View style={{ marginBottom: SECTION_GAP }}>
      <SectionHeader title={title} accentColor={accentColor} colors={colors} />
      <InsightCarousel colors={colors}>
        {childArray}
      </InsightCarousel>
    </View>
  )
}

export function InsightsBody({ monthYYYYMM, colors }: Props) {
  const { loading, error, data } = useInsightsData(monthYYYYMM)
  const theme = useHoHTheme()

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

  const { thisMonth, patterns, watchouts, opportunities } = data

  // Check if we have any insights to show
  const hasThisMonthInsights = thisMonth.changeVsLastMonth || thisMonth.primaryDriver || thisMonth.categoryComparison.length > 0
  const hasPatternsInsights = patterns.netBaseline || patterns.volatilityCheck || patterns.positiveStreak || patterns.quietDays || patterns.netTrend.length > 1 || patterns.weekdayPattern.length > 0
  const hasWatchouts = watchouts.length > 0
  const hasOpportunities = opportunities.length > 0
  const hasAnyInsights = hasThisMonthInsights || hasPatternsInsights || hasWatchouts || hasOpportunities

  if (!hasAnyInsights) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        <Text style={{ fontSize: fontSize.lg, fontWeight: '600', color: colors.text, textAlign: 'center', marginBottom: 8 }}>
          Not enough data yet
        </Text>
        <Text style={{ fontSize: fontSize.md, color: colors.textMuted, textAlign: 'center', lineHeight: 20 }}>
          We'll surface insights once more transactions are available. Keep tracking and check back soon.
        </Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Section: This month */}
      {hasThisMonthInsights && (
        <InsightSection
          title="This month"
          accentColor={theme.accent.blue}
          colors={colors}
        >
          {[
            thisMonth.changeVsLastMonth && (
              <InsightCard key="change" card={thisMonth.changeVsLastMonth} colors={colors} />
            ),
            thisMonth.primaryDriver && (
              <InsightCard key="driver" card={thisMonth.primaryDriver} colors={colors} />
            ),
            thisMonth.categoryComparison.length > 0 && (
              <View key="delta" style={{ paddingVertical: 8 }}>
                <Text style={{ fontSize: fontSize.xs, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                  Top changes vs last month
                </Text>
                <CategoryDeltaBar data={thisMonth.categoryComparison} colors={colors} />
              </View>
            )
          ]}
        </InsightSection>
      )}

      {/* Section: Patterns */}
      {hasPatternsInsights && (
        <InsightSection
          title="Patterns"
          accentColor={theme.accent.purple}
          colors={colors}
        >
          {[
            patterns.netTrend.length > 1 && (
              <View key="sparkline" style={{ paddingVertical: 8 }}>
                <Text style={{ fontSize: fontSize.xs, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                  Monthly Net Cash Flow Trend
                </Text>
                <NetSparkline
                  data={patterns.netTrend}
                  baseline={patterns.medianNet ?? undefined}
                  colors={colors}
                />
              </View>
            ),
            patterns.netBaseline && (
              <InsightCard key="baseline" card={patterns.netBaseline} colors={colors} />
            ),
            patterns.volatilityCheck && (
              <InsightCard key="volatility" card={patterns.volatilityCheck} colors={colors} />
            ),
            patterns.weekdayPattern.length > 0 && patterns.weekdayPattern.some(d => d.avgSpend > 0) && (
              <View key="heatmap" style={{ paddingVertical: 8 }}>
                <Text style={{ fontSize: fontSize.xs, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                  Spending by day of week
                </Text>
                <WeekdayHeatHint data={patterns.weekdayPattern} colors={colors} />
              </View>
            ),
            patterns.positiveStreak && (
              <InsightCard key="streak" card={patterns.positiveStreak} colors={colors} />
            ),
            patterns.quietDays && (
              <InsightCard key="quiet" card={patterns.quietDays} colors={colors} />
            )
          ]}
        </InsightSection>
      )}

      {/* Section: Watchouts */}
      {hasWatchouts && (
        <InsightSection
          title="Watchouts"
          accentColor={theme.accent.amber}
          colors={colors}
        >
          {watchouts.map(card => (
            <InsightCard key={card.id} card={card} colors={colors} />
          ))}
        </InsightSection>
      )}

      {/* Section: Opportunities */}
      {hasOpportunities && (
        <InsightSection
          title="Opportunities"
          accentColor={theme.accent.green}
          colors={colors}
        >
          {opportunities.map(card => (
            <InsightCard key={card.id} card={card} colors={colors} />
          ))}
        </InsightSection>
      )}
    </ScrollView>
  )
}
