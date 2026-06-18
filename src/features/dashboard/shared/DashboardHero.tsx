import React, { useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { formatUsdInt } from '@/shared/format/currency'
import { InfoSheet } from '@/shared/components'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import type { BaseViewColors } from '@/shared/theme/tokens/viewStyles'
import { createDashboardHeroStyles } from './DashboardHero.styles'

/**
 * Small info indicator for tappable items (matches Assets page pattern)
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

type DashboardHeroColors = BaseViewColors & {
  success: string
  danger: string
  surface: string
  surfaceAlt: string
  primary: string
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
 * Info sheet explaining savings rate calculation
 */
function SavingsRateInfoSheet({
  visible,
  onClose,
  colors,
  incomeDollar,
  netDollar,
  savingsRate,
}: {
  visible: boolean
  onClose: () => void
  colors: DashboardHeroColors
  incomeDollar: number
  netDollar: number
  savingsRate: number
}) {
  const isPositive = netDollar >= 0

  return (
    <InfoSheet
      visible={visible}
      onClose={onClose}
      title={isPositive ? 'Savings Rate' : 'Overspending Rate'}
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
          lineHeight: 22,
          marginBottom: spacing.xl,
        }}
      >
        {isPositive
          ? 'The percentage of your income that you kept as savings after all expenses.'
          : 'The percentage by which your spending exceeded your income.'}
      </Text>

      {/* Formula - highlighted box */}
      <View
        style={{
          backgroundColor: colors.surfaceAlt,
          padding: spacing.lg,
          borderRadius: 12,
          alignItems: 'center',
          marginBottom: spacing.xl,
        }}
      >
        <Text
          style={{
            fontSize: fontSize.sm,
            fontWeight: fontWeight.semibold,
            color: colors.textSecondary,
            marginBottom: spacing.sm,
          }}
        >
          Formula
        </Text>
        <Text style={{ fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text }}>
          {isPositive ? '(Income − Expenses)' : '(Expenses − Income)'} ÷ Income × 100
        </Text>
      </View>

      {/* Your Numbers - math style aligned */}
      <View style={{ marginBottom: spacing.xl }}>
        <Text
          style={{
            fontSize: fontSize.sm,
            fontWeight: fontWeight.semibold,
            color: colors.text,
            marginBottom: spacing.sm,
          }}
        >
          Your numbers this period:
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
          <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>Total Income</Text>
          <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text }}>
            {formatUsdInt(incomeDollar)}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
          <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>
            {isPositive ? 'Net Savings' : 'Net Overspend'}
          </Text>
          <Text
            style={{
              fontSize: fontSize.sm,
              fontWeight: fontWeight.semibold,
              color: isPositive ? colors.success : colors.danger,
            }}
          >
            {isPositive ? '+' : '-'}{formatUsdInt(Math.abs(netDollar))}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            borderTopWidth: 1,
            borderTopColor: colors.textSecondary + '20',
            paddingTop: spacing.sm,
            marginTop: spacing.xs,
          }}
        >
          <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text }}>
            {isPositive ? 'Savings Rate' : 'Overspending Rate'}
          </Text>
          <Text
            style={{
              fontSize: fontSize.sm,
              fontWeight: fontWeight.bold,
              color: isPositive ? colors.success : colors.danger,
            }}
          >
            {Math.abs(savingsRate)}%
          </Text>
        </View>
      </View>

      {/* Explanation */}
      <View>
        <Text
          style={{
            fontSize: fontSize.sm,
            fontWeight: fontWeight.semibold,
            color: colors.text,
            marginBottom: spacing.sm,
          }}
        >
          What does this mean?
        </Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 22 }}>
          {isPositive
            ? `You saved ${Math.abs(savingsRate)}% of your income this period. This is the portion of your earnings that wasn't spent.`
            : `You spent ${Math.abs(savingsRate)}% more than you earned this period. This means your expenses exceeded your income.`}
        </Text>
      </View>
    </InfoSheet>
  )
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
  const [showSavingsInfo, setShowSavingsInfo] = useState(false)

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
            <Pressable
              onPress={() => setShowSavingsInfo(true)}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, marginTop: spacing.md }}
            >
              <Text style={[styles.supporting, { color: colors.textSecondary, marginTop: 0 }]}>
                {savingsRate >= 0 ? 'Saved' : 'Overspent'} {Math.abs(savingsRate)}% of income
              </Text>
              <InfoIndicator color={colors.textSecondary} />
            </Pressable>
          )}

          {showNudge && nudgeText && netDollar > 0 && (
            <Text style={[styles.nudge, { color: colors.textSecondary }]}>
              {nudgeText}
            </Text>
          )}
        </View>

        <SavingsRateInfoSheet
          visible={showSavingsInfo}
          onClose={() => setShowSavingsInfo(false)}
          colors={colors}
          incomeDollar={incomeDollar}
          netDollar={netDollar}
          savingsRate={savingsRate}
        />
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
              <Pressable
                onPress={() => setShowSavingsInfo(true)}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, marginTop: spacing.sm }}
              >
                <Text style={[styles.comparison, { color: colors.textSecondary, marginTop: 0 }]}>
                  That's <Text style={{ fontWeight: '600', color: colors.success }}>{savingsRate}%</Text> of income
                </Text>
                <InfoIndicator color={colors.textSecondary} />
              </Pressable>
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
              <Pressable
                onPress={() => setShowSavingsInfo(true)}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, marginTop: spacing.sm }}
              >
                <Text style={[styles.comparison, { color: colors.textSecondary, marginTop: 0 }]}>
                  That's <Text style={{ fontWeight: '600', color: colors.danger }}>{Math.abs(savingsRate)}%</Text> of income
                </Text>
                <InfoIndicator color={colors.textSecondary} />
              </Pressable>
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

      <SavingsRateInfoSheet
        visible={showSavingsInfo}
        onClose={() => setShowSavingsInfo(false)}
        colors={colors}
        incomeDollar={incomeDollar}
        netDollar={netDollar}
        savingsRate={savingsRate}
      />
    </>
  )
}
