import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { formatCurrency } from '@/shared/format/currency'
import { fontSize, fontWeight, letterSpacing } from '@/shared/theme/tokens/typography'
import { spacing } from '@/shared/theme/tokens/spacing'
import { radius } from '@/shared/theme/tokens/radius'
import type { SectionSummary, AccountsColors } from '../accounts.types'

type Props = {
  summary: SectionSummary
  colors: AccountsColors
  onPress: () => void
}

export function SummaryCard({ summary, colors, onPress }: Props) {
  const { label, startBalance, endBalance, delta, isLiability } = summary
  const hasTimeline = startBalance !== null && delta !== null

  // For debt, show as positive numbers (absolute values)
  const displayStart = isLiability ? Math.abs(startBalance ?? 0) : (startBalance ?? 0)
  const displayEnd = isLiability ? Math.abs(endBalance) : endBalance

  // Delta color logic: for debt, increasing debt is bad
  // For assets, positive delta is good
  const getDeltaColor = () => {
    if (delta === null || delta === 0) return colors.textSecondary
    if (isLiability) {
      // Debt section: delta is negative when debt increased
      // So positive delta = debt decreased (good), negative delta = debt increased (bad)
      return delta > 0 ? colors.success : colors.danger
    }
    // Assets: positive delta is good, negative is bad
    return delta > 0 ? colors.success : colors.danger
  }

  const formatDelta = () => {
    if (delta === null) return ''
    if (delta === 0) return 'No change'
    if (isLiability) {
      // For debt: show as "$X more debt" or "$X less debt"
      // delta > 0 means debt decreased, delta < 0 means debt increased
      const debtChange = Math.abs(delta)
      const direction = delta < 0 ? 'more' : 'less'
      return `${formatCurrency(debtChange)} ${direction} debt`
    }
    // For assets: show as "$X more" or "$X less"
    const absChange = Math.abs(delta)
    const direction = delta > 0 ? 'more' : 'less'
    return `${formatCurrency(absChange)} ${direction}`
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        pressed && styles.cardPressed,
      ]}
    >
      {/* Label + tap hint */}
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label.toUpperCase()}
        </Text>
        <Text style={[styles.tapHint, { color: colors.textSecondary }]}>
          View ›
        </Text>
      </View>

      {/* Balance display */}
      {hasTimeline ? (
        <>
          <Text style={[styles.timeline, { color: colors.text }]}>
            {formatCurrency(displayStart)} → {formatCurrency(displayEnd)}
          </Text>
          <Text style={[styles.delta, { color: getDeltaColor() }]}>
            {formatDelta()}
          </Text>
        </>
      ) : (
        <Text style={[styles.balance, { color: colors.text }]}>
          {formatCurrency(displayEnd)}
        </Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 100,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  cardPressed: {
    opacity: 0.7,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.wider,
  },
  tapHint: {
    fontSize: 10,
    fontWeight: fontWeight.medium,
    opacity: 0.6,
  },
  timeline: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    fontVariant: ['tabular-nums'],
  },
  balance: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    fontVariant: ['tabular-nums'],
  },
  delta: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    fontVariant: ['tabular-nums'],
    marginTop: spacing.xs,
  },
})
