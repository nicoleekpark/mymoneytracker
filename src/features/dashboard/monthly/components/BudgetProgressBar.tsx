import React from 'react'
import { Text, View } from 'react-native'
import { formatUsdInt } from '@/shared/format/currency'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import { spacing } from '@/shared/theme/tokens/spacing'
import { radius } from '@/shared/theme/tokens/radius'
import type { BaseViewColors } from '@/shared/theme/tokens/viewStyles'

type BudgetProgressBarColors = BaseViewColors & {
  success: string
  danger: string
}

type BudgetProgressBarProps = {
  spentDollar: number
  budgetDollar: number
  remainingDollar: number
  colors: BudgetProgressBarColors
}

/**
 * Budget progress bar with spent and remaining amounts.
 * Shows progress toward monthly budget with color-coded remaining amount.
 */
export function BudgetProgressBar({
  spentDollar,
  budgetDollar,
  remainingDollar,
  colors,
}: BudgetProgressBarProps) {
  const barWidth = Math.min((spentDollar / budgetDollar) * 100, 100)

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      {/* Spent amount */}
      <View>
        <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text }}>
          {formatUsdInt(spentDollar)}
        </Text>
        <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary, marginTop: spacing.xs }}>
          spent
        </Text>
      </View>

      {/* Progress bar */}
      <View
        style={{
          flex: 1,
          height: spacing.sm,
          backgroundColor: colors.surfaceAlt,
          borderRadius: radius.sm,
          overflow: 'hidden',
        }}
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: Math.round(barWidth),
          text: `${Math.round(barWidth)}% of budget spent`,
        }}
        accessibilityLabel={`Budget progress: ${formatUsdInt(spentDollar)} of ${formatUsdInt(budgetDollar)} spent`}
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

      {/* Remaining amount */}
      <View style={{ alignItems: 'flex-end' }}>
        <Text
          style={{
            fontSize: fontSize.lg,
            fontWeight: fontWeight.bold,
            color: remainingDollar >= 0 ? colors.success : colors.danger,
          }}
        >
          {formatUsdInt(Math.abs(remainingDollar))}
        </Text>
        <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary, marginTop: spacing.xs }}>
          {remainingDollar >= 0 ? 'available' : 'over'}
        </Text>
      </View>
    </View>
  )
}
