import React, { useMemo } from 'react'
import { Text, View } from 'react-native'
import { formatUsdInt } from '@/shared/format/currency'
import type { BaseViewColors } from '@/shared/theme/tokens/viewStyles'
import { createStatsRowStyles } from './StatsRow.styles'

type StatsRowColors = BaseViewColors & {
  success: string
  danger: string
}

type StatsRowProps = {
  incomeDollar: number
  expenseDollar: number
  colors: StatsRowColors
}

/**
 * Displays Income and Expense side by side with a divider.
 * Used in both Monthly and Yearly dashboard views.
 */
export function StatsRow({ incomeDollar, expenseDollar, colors }: StatsRowProps) {
  const styles = useMemo(() => createStatsRowStyles(), [])

  return (
    <View style={styles.container}>
      {/* Income */}
      <View style={styles.statBox}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Income
        </Text>
        <Text style={[styles.value, { color: colors.success }]}>
          {formatUsdInt(incomeDollar)}
        </Text>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Expense */}
      <View style={styles.statBox}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Expense
        </Text>
        <Text style={[styles.value, { color: colors.danger }]}>
          {formatUsdInt(expenseDollar)}
        </Text>
      </View>
    </View>
  )
}
