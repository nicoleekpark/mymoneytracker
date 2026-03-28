import React, { useState } from 'react'
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { formatCurrency } from '@/shared/format/currency'
import { fontSize, fontWeight, letterSpacing } from '@/shared/theme/tokens/typography'
import { spacing } from '@/shared/theme/tokens/spacing'
import { radius } from '@/shared/theme/tokens/radius'
import type { AccountActivity, AccountsColors } from '../accounts.types'
import { getActivityLabels } from '../accounts.types'

type Props = {
  activity: AccountActivity
  colors: AccountsColors
  showBalanceChange: boolean
  onNavigate: () => void
}

export function AccountRow({ activity, colors, showBalanceChange, onNavigate }: Props) {
  const [expanded, setExpanded] = useState(false)
  const { account, startBalance, endBalance, totalOut, totalIn, transactionCount, hasActivity } = activity
  const { outLabel, inLabel } = getActivityLabels(account)

  const isLiability = account.nature === 'liability'
  const hasBalanceData = showBalanceChange && startBalance !== null
  const balanceChange = hasBalanceData ? endBalance - (startBalance ?? 0) : 0

  // For display: show debt as positive numbers
  const displayStartBalance = isLiability ? Math.abs(startBalance ?? 0) : (startBalance ?? 0)
  const displayEndBalance = isLiability ? Math.abs(endBalance) : endBalance

  // Delta display logic
  const getDeltaColor = () => {
    if (balanceChange === 0) return colors.textSecondary
    if (isLiability) {
      // For debt: positive change means more debt (bad), negative means less debt (good)
      return balanceChange > 0 ? colors.danger : colors.success
    }
    // For assets: positive change is good, negative is bad
    return balanceChange > 0 ? colors.success : colors.danger
  }

  const formatDeltaText = () => {
    if (balanceChange === 0) return 'No change'
    if (isLiability) {
      // Show as "$X more debt" or "$X less debt"
      const absChange = Math.abs(balanceChange)
      const direction = balanceChange > 0 ? 'more' : 'less'
      return `${formatCurrency(absChange)} ${direction} debt`
    }
    // For assets: show as "$X more" or "$X less"
    const absChange = Math.abs(balanceChange)
    const direction = balanceChange > 0 ? 'more' : 'less'
    return `${formatCurrency(absChange)} ${direction}`
  }

  const handleRowPress = () => {
    if (!hasActivity) return
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpanded(!expanded)
  }

  const handleNavigate = () => {
    onNavigate()
  }

  // No activity state - collapsed single line
  if (!hasActivity) {
    return (
      <View style={styles.rowCollapsed}>
        <Text style={[styles.accountNameCollapsed, { color: colors.textSecondary }]} numberOfLines={1}>
          {account.name}
        </Text>
        <Text style={[styles.balanceCollapsed, { color: colors.textSecondary }]}>
          {formatCurrency(displayEndBalance)}
        </Text>
        <View style={[styles.noActivityBadge, { backgroundColor: colors.surfaceAlt }]}>
          <Text style={[styles.noActivityText, { color: colors.textSecondary }]}>
            No activity
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.row}>
      {/* Pressable area for expand/collapse */}
      <Pressable
        onPress={handleRowPress}
        style={({ pressed }) => [pressed && { opacity: 0.7 }]}
      >
        {/* Account name + transaction count */}
        <View style={styles.nameRow}>
          <Text style={[styles.accountName, { color: colors.text }]} numberOfLines={1}>
            {account.name}
          </Text>
          <Text style={[styles.txnCount, { color: colors.textSecondary }]}>
            {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Balance row: Start ────[ change ]──── End */}
        {hasBalanceData ? (
          <>
            {/* Column labels */}
            <View style={styles.columnLabels}>
              <Text style={[styles.columnLabel, { color: colors.textSecondary }]}>
                Start of period
              </Text>
              <Text style={[styles.columnLabel, styles.columnLabelEnd, { color: colors.textSecondary }]}>
                End of period
              </Text>
            </View>
            <View style={styles.balanceRow}>
              <Text style={[styles.balanceValue, { color: colors.text }]}>
                {formatCurrency(displayStartBalance)}
              </Text>
              <View style={styles.lineContainer}>
                <View style={[styles.line, { backgroundColor: colors.border }]} />
                <Text style={[styles.changeText, { color: getDeltaColor() }]}>
                  {formatDeltaText()}
                </Text>
                <View style={[styles.line, { backgroundColor: colors.border }]} />
              </View>
              <Text style={[styles.balanceValue, styles.balanceValueEnd, { color: colors.text }]}>
                {formatCurrency(displayEndBalance)}
              </Text>
            </View>
          </>
        ) : (
          <Text style={[styles.singleBalance, { color: colors.text }]}>
            {formatCurrency(displayEndBalance)}
          </Text>
        )}
      </Pressable>

      {/* Expanded: Activity breakdown in middle + chevron at end */}
      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.expandedRow}>
            {/* Left spacer to align with start balance */}
            <View style={styles.expandedSpacer} />

            {/* Activity in the middle */}
            <View style={styles.activityContainer}>
              {totalOut > 0 && (
                <View style={styles.activityItem}>
                  <Text style={[styles.activityArrow, { color: colors.textSecondary }]}>▸</Text>
                  <Text style={[styles.activityLabel, { color: colors.textSecondary }]}>
                    {outLabel.toLowerCase()}
                  </Text>
                  <Text style={[styles.activityValue, { color: colors.danger }]}>
                    {formatCurrency(totalOut)}
                  </Text>
                </View>
              )}
              {totalIn > 0 && (
                <View style={styles.activityItem}>
                  <Text style={[styles.activityArrow, { color: colors.textSecondary }]}>▸</Text>
                  <Text style={[styles.activityLabel, { color: colors.textSecondary }]}>
                    {inLabel.toLowerCase()}
                  </Text>
                  <Text style={[styles.activityValue, { color: colors.success }]}>
                    {formatCurrency(totalIn)}
                  </Text>
                </View>
              )}
            </View>

            {/* Chevron for navigation */}
            <Pressable
              onPress={handleNavigate}
              style={({ pressed }) => [
                styles.navButton,
                { backgroundColor: colors.surfaceAlt },
                pressed && { opacity: 0.7 }
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <FontAwesome name="chevron-right" size={12} color={colors.primary} />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: spacing.md,
  },
  // Collapsed no-activity row
  rowCollapsed: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  accountNameCollapsed: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  balanceCollapsed: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    fontVariant: ['tabular-nums'],
  },
  noActivityBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
  },
  noActivityText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  accountName: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  txnCount: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  columnLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  columnLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.wide,
  },
  columnLabelEnd: {
    textAlign: 'right',
  },
  noActivity: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    fontStyle: 'italic',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    fontVariant: ['tabular-nums'],
    minWidth: 70,
  },
  balanceValueEnd: {
    textAlign: 'right',
  },
  singleBalance: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
  },
  lineContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  line: {
    flex: 1,
    height: 1,
  },
  changeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    fontVariant: ['tabular-nums'],
    marginHorizontal: spacing.sm,
    textAlign: 'center',
  },
  expandedContent: {
    marginTop: spacing.sm,
  },
  expandedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  expandedSpacer: {
    minWidth: 70, // matches balanceValue width
  },
  activityContainer: {
    flex: 1,
    marginHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityArrow: {
    fontSize: fontSize.xs,
    marginRight: spacing.xs,
    width: 12,
  },
  activityLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginRight: spacing.sm,
  },
  activityValue: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    fontVariant: ['tabular-nums'],
  },
  navButton: {
    width: 28,
    height: 28,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
