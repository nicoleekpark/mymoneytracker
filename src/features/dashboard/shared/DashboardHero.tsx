import React, { useMemo } from 'react'
import { Text, View } from 'react-native'
import { formatUsdInt } from '@/shared/format/currency'
import type { BaseViewColors } from '@/shared/theme/tokens/viewStyles'
import { createDashboardHeroStyles } from './DashboardHero.styles'

type DashboardHeroColors = BaseViewColors & {
  success: string
  danger: string
}

type DashboardHeroProps = {
  /** Net dollar amount (income - expense) */
  netDollar: number
  /** Total income for savings rate calculation */
  incomeDollar: number
  /** Savings rate percentage (0-100 or negative for overspending) */
  savingsRate: number

  /** Whether to use Option A (Net Cash Flow neutral) or Option B (Saved/Overspent colored) */
  variant: 'optionA' | 'optionB'

  /** Day indicator (monthly only) */
  dayOfPeriod?: number
  totalDays?: number
  showDayIndicator?: boolean

  /** Comparison with previous period */
  comparisonDollar?: number | null
  comparisonLabel?: string // "vs Mar" or "vs 2024"
  comparisonSuffix?: string // " YTD" for current year comparisons

  /** Nudge text (monthly only, when net is positive) */
  nudgeText?: string
  showNudge?: boolean

  colors: DashboardHeroColors
}

/**
 * Unified hero section for Monthly and Yearly dashboard views.
 * Supports two variants:
 * - Option A: Net Cash Flow (neutral color, always shows net)
 * - Option B: Saved/Overspent (semantic colors based on state)
 */
export function DashboardHero({
  netDollar,
  incomeDollar,
  savingsRate,
  variant,
  dayOfPeriod,
  totalDays,
  showDayIndicator,
  comparisonDollar,
  comparisonLabel,
  comparisonSuffix = '',
  nudgeText,
  showNudge,
  colors,
}: DashboardHeroProps) {
  const styles = useMemo(() => createDashboardHeroStyles(), [])

  const isOptionA = variant === 'optionA'
  const hasComparison = comparisonDollar !== null && comparisonDollar !== undefined && comparisonLabel

  // Option A: Net Cash Flow (neutral color)
  if (isOptionA) {
    return (
      <>
        {showDayIndicator && dayOfPeriod !== undefined && totalDays !== undefined && dayOfPeriod > 0 && (
          <Text style={[styles.dayIndicator, { color: colors.textSecondary }]}>
            Day {dayOfPeriod} of {totalDays}
          </Text>
        )}

        <View style={styles.container}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Net Cash Flow
          </Text>

          <Text style={[styles.primaryValue, { color: colors.text }]}>
            {netDollar >= 0 ? '+' : '-'}{formatUsdInt(Math.abs(netDollar))}
          </Text>

          {hasComparison && (
            <Text style={[styles.comparison, { color: colors.textSecondary }]}>
              <Text style={{ color: comparisonDollar >= 0 ? colors.success : colors.danger }}>
                {comparisonDollar >= 0 ? '↑' : '↓'} {formatUsdInt(Math.abs(comparisonDollar))}
              </Text>
              {' '}{comparisonLabel}{comparisonSuffix}
            </Text>
          )}

          {incomeDollar > 0 && (
            <Text style={[styles.supporting, { color: colors.textSecondary }]}>
              {savingsRate >= 0 ? 'Saved' : 'Overspent'} {Math.abs(savingsRate)}% of income
            </Text>
          )}

          {showNudge && nudgeText && netDollar > 0 && (
            <Text style={[styles.nudge, { color: colors.textSecondary }]}>
              {nudgeText}
            </Text>
          )}
        </View>
      </>
    )
  }

  // Option B: Saved/Overspent with semantic colors
  return (
    <>
      {showDayIndicator && dayOfPeriod !== undefined && totalDays !== undefined && dayOfPeriod > 0 && (
        <Text style={[styles.dayIndicator, { color: colors.textSecondary }]}>
          Day {dayOfPeriod} of {totalDays}
        </Text>
      )}

      <View style={styles.container}>
        {incomeDollar > 0 ? (
          netDollar > 0 ? (
            // Positive savings
            <>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Saved
              </Text>
              <Text style={[styles.primaryValue, { color: colors.success }]}>
                {formatUsdInt(netDollar)}
              </Text>
              <Text style={[styles.comparison, { color: colors.textSecondary }]}>
                That's <Text style={{ fontWeight: '600', color: colors.success }}>{savingsRate}%</Text> of income
              </Text>
              {hasComparison && (
                <Text style={[styles.comparisonSmall, { color: colors.textSecondary }]}>
                  <Text style={{ color: comparisonDollar >= 0 ? colors.success : colors.danger }}>
                    {comparisonDollar >= 0 ? '↑' : '↓'} {formatUsdInt(Math.abs(comparisonDollar))}
                  </Text>
                  {' '}{comparisonLabel}{comparisonSuffix}
                </Text>
              )}
            </>
          ) : netDollar < 0 ? (
            // Overspending
            <>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Spending exceeds income by
              </Text>
              <Text style={[styles.primaryValue, { color: colors.danger }]}>
                {formatUsdInt(Math.abs(netDollar))}
              </Text>
              <Text style={[styles.comparison, { color: colors.textSecondary }]}>
                That's <Text style={{ fontWeight: '600', color: colors.danger }}>{Math.abs(savingsRate)}%</Text> of income
              </Text>
              {hasComparison && (
                <Text style={[styles.comparisonSmall, { color: colors.textSecondary }]}>
                  <Text style={{ color: comparisonDollar >= 0 ? colors.success : colors.danger }}>
                    {comparisonDollar >= 0 ? '↑' : '↓'} {formatUsdInt(Math.abs(comparisonDollar))}
                  </Text>
                  {' '}{comparisonLabel}{comparisonSuffix}
                </Text>
              )}
            </>
          ) : (
            // Breaking even
            <>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Breaking even
              </Text>
              <Text style={[styles.primaryValueMd, { color: colors.textSecondary }]}>
                {formatUsdInt(0)}
              </Text>
              <Text style={[styles.noIncomeSubtitle, { color: colors.textSecondary }]}>
                net
              </Text>
              {hasComparison && (
                <Text style={[styles.comparisonSmall, { color: colors.textSecondary }]}>
                  <Text style={{ color: comparisonDollar >= 0 ? colors.success : colors.danger }}>
                    {comparisonDollar >= 0 ? '↑' : '↓'} {formatUsdInt(Math.abs(comparisonDollar))}
                  </Text>
                  {' '}{comparisonLabel}{comparisonSuffix}
                </Text>
              )}
            </>
          )
        ) : (
          // No income
          <>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Net Cash Flow
            </Text>
            <Text style={[styles.primaryValueSm, { color: colors.textSecondary }]}>
              No income recorded
            </Text>
            {netDollar < 0 && (
              <Text style={[styles.comparison, { color: colors.textSecondary }]}>
                <Text style={{ fontWeight: '600', color: colors.danger }}>{formatUsdInt(Math.abs(netDollar))}</Text> spent
              </Text>
            )}
          </>
        )}
      </View>
    </>
  )
}
