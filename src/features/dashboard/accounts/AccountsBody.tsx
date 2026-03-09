import React, { useState } from 'react'
import { LayoutAnimation, Pressable, ScrollView, Text, View } from 'react-native'
import { router } from 'expo-router'
import { SectionHeader } from '@/shared/components'
import { formatCurrency } from '@/shared/format/currency'
import { fontSize, fontWeight } from '@/theme/tokens/typography'
import { spacing } from '@/theme/tokens/spacing'
import { SECTION_GAP } from '@/theme/tokens/viewStyles'
import { useAccountsData } from './hooks/useAccountsData'
import type { AccountsColors, AccountActivity, AccountGroup } from './accounts.types'
import type { Period, Scope } from '../types'

type Props = {
  colors: AccountsColors
  scope: Scope
  period: Period
}

/**
 * Summary section row - clean key-value layout
 */
function SummarySectionRow({
  label,
  startBalance,
  endBalance,
  delta,
  isLiability,
  colors,
  isLast,
  isCurrentPeriod
}: {
  label: string
  startBalance: number | null
  endBalance: number
  delta: number | null
  isLiability: boolean
  colors: AccountsColors
  isLast: boolean
  isCurrentPeriod: boolean
}) {
  const hasTimeline = startBalance !== null

  // For debt, show as positive numbers
  const displayStart = isLiability ? Math.abs(startBalance ?? 0) : (startBalance ?? 0)
  const displayEnd = isLiability ? Math.abs(endBalance) : endBalance

  const formatChange = () => {
    if (delta === null || delta === 0) return 'No change'
    const absChange = Math.abs(delta)
    if (isLiability) {
      return delta > 0
        ? `${formatCurrency(absChange)} less debt`
        : `${formatCurrency(absChange)} more debt`
    }
    return delta > 0
      ? `${formatCurrency(absChange)} more`
      : `${formatCurrency(absChange)} less`
  }

  const getChangeColor = () => {
    if (delta === null || delta === 0) return colors.textSecondary
    if (isLiability) {
      return delta > 0 ? colors.success : colors.danger
    }
    return delta > 0 ? colors.success : colors.danger
  }

  return (
    <View
      style={{
        paddingVertical: spacing.md,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.border
      }}
    >
      {/* Section title */}
      <Text style={{
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        color: colors.text,
        marginBottom: spacing.sm
      }}>
        Total {label}
      </Text>

      {/* Data rows */}
      {hasTimeline && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
          <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary }}>
            Start
          </Text>
          <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textSecondary, fontVariant: ['tabular-nums'] }}>
            {formatCurrency(displayStart)}
          </Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: hasTimeline ? spacing.xs : 0 }}>
        <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary }}>
          {hasTimeline ? (isCurrentPeriod ? 'Current' : 'End') : 'Balance'}
        </Text>
        <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, fontVariant: ['tabular-nums'] }}>
          {formatCurrency(displayEnd)}
        </Text>
      </View>

      {hasTimeline && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary }}>
            Change
          </Text>
          <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: getChangeColor(), fontVariant: ['tabular-nums'] }}>
            {formatChange()}
          </Text>
        </View>
      )}
    </View>
  )
}

/**
 * Account row - expandable with activity breakdown
 */
function AccountRow({
  activity,
  colors,
  showBalanceChange,
  isCurrentPeriod,
  onNavigate
}: {
  activity: AccountActivity
  colors: AccountsColors
  showBalanceChange: boolean
  isCurrentPeriod: boolean
  onNavigate: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const { account, startBalance, endBalance, totalOut, totalIn, transactionCount, hasActivity } = activity
  const isLiability = account.nature === 'liability'
  const hasBalanceData = showBalanceChange && startBalance !== null

  // For display: show debt as positive numbers
  const displayStart = isLiability ? Math.abs(startBalance ?? 0) : (startBalance ?? 0)
  const displayEnd = isLiability ? Math.abs(endBalance) : endBalance

  // Labels based on account type
  const getLabels = () => {
    if (account.kind === 'credit_card') {
      return { outLabel: 'Charged', inLabel: 'Paid back' }
    }
    if (account.kind === 'loan') {
      return { outLabel: 'Borrowed', inLabel: 'Paid back' }
    }
    // Cash/checking/savings/investment
    return { outLabel: 'Money out', inLabel: 'Money in' }
  }
  const { outLabel, inLabel } = getLabels()

  const handleRowPress = () => {
    if (!hasActivity || !hasBalanceData) return
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpanded(!expanded)
  }

  // Can expand if has activity (to show money in/out breakdown)
  const canExpand = hasActivity && (totalIn > 0 || totalOut > 0)

  // No activity - single line, dimmed, show "No activity" instead of balance
  if (!hasActivity) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm }}>
        {/* Empty chevron space for alignment */}
        <View style={{ width: 16 }} />
        <Text style={{ flex: 1, fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textSecondary }} numberOfLines={1}>
          {account.name}
        </Text>
        <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary, fontStyle: 'italic' }}>
          No activity
        </Text>
      </View>
    )
  }

  return (
    <View style={{ paddingVertical: spacing.sm }}>
      {/* Main row: Chevron + Account name + balance */}
      <Pressable
        onPress={handleRowPress}
        disabled={!canExpand}
        style={({ pressed }) => ({ opacity: pressed && canExpand ? 0.7 : 1 })}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Chevron indicator */}
          <Text style={{ fontSize: 10, color: colors.textSecondary, width: 16 }}>
            {canExpand ? (expanded ? '▼' : '▶') : ''}
          </Text>
          <Text style={{ flex: 1, fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text }} numberOfLines={1}>
            {account.name}
          </Text>
          <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, fontVariant: ['tabular-nums'] }}>
            {formatCurrency(displayEnd)}
          </Text>
        </View>

        {/* Sub row: Start → End + transaction link (hide Start → End when expanded) */}
        {hasBalanceData && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs, marginLeft: 16 }}>
            {!expanded && (
              <Text style={{ flex: 1, fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary, fontVariant: ['tabular-nums'] }}>
                {formatCurrency(displayStart)} → {formatCurrency(displayEnd)}
              </Text>
            )}
            {expanded && <View style={{ flex: 1 }} />}
            <Pressable
              onPress={(e) => {
                e.stopPropagation()
                onNavigate()
              }}
              hitSlop={{ top: 8, bottom: 8, left: 12, right: 4 }}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
            >
              <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary }}>
                {transactionCount} txn{transactionCount !== 1 ? 's' : ''} ›
              </Text>
            </Pressable>
          </View>
        )}

        {/* All-time view: just show transaction link */}
        {!hasBalanceData && (
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.xs, marginLeft: 16 }}>
            <Pressable
              onPress={(e) => {
                e.stopPropagation()
                onNavigate()
              }}
              hitSlop={{ top: 8, bottom: 8, left: 12, right: 4 }}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
            >
              <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary }}>
                {transactionCount} txn{transactionCount !== 1 ? 's' : ''} ›
              </Text>
            </Pressable>
          </View>
        )}
      </Pressable>

      {/* Expanded: Math-style breakdown */}
      {expanded && canExpand && (
        <View style={{ flexDirection: 'row', marginLeft: spacing.sm, marginTop: spacing.xs }}>
          {/* Indent line */}
          <View style={{ width: 1, backgroundColor: colors.border, marginRight: spacing.md, opacity: 0.5 }} />
          <View style={{ flex: 1 }}>
            {/* Start */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 3 }}>
              <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, flex: 1 }}>Start</Text>
              <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, fontVariant: ['tabular-nums'] }}>
                {formatCurrency(displayStart)}
              </Text>
            </View>
            {/* Money In / Paid back */}
            {totalIn > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 3 }}>
                <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, flex: 1 }}>{inLabel}</Text>
                <Text style={{ fontSize: fontSize.xs, color: colors.success, fontVariant: ['tabular-nums'] }}>
                  + {formatCurrency(totalIn)}
                </Text>
              </View>
            )}
            {/* Money Out / Charged */}
            {totalOut > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 3 }}>
                <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, flex: 1 }}>{outLabel}</Text>
                <Text style={{ fontSize: fontSize.xs, color: colors.danger, fontVariant: ['tabular-nums'] }}>
                  − {formatCurrency(totalOut)}
                </Text>
              </View>
            )}
            {/* End/Current (with top border as "equals" line) */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 3,
              marginTop: spacing.xs,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              paddingTop: spacing.xs
            }}>
              <Text style={{ fontSize: fontSize.xs, color: colors.text, flex: 1, fontWeight: fontWeight.medium }}>
                {isCurrentPeriod ? 'Current' : 'End'}
              </Text>
              <Text style={{ fontSize: fontSize.xs, color: colors.text, fontVariant: ['tabular-nums'], fontWeight: fontWeight.semibold }}>
                {formatCurrency(displayEnd)}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

/**
 * Account section (group of accounts)
 */
function AccountSection({
  group,
  colors,
  showBalanceChange,
  isCurrentPeriod,
  onAccountPress
}: {
  group: AccountGroup
  colors: AccountsColors
  showBalanceChange: boolean
  isCurrentPeriod: boolean
  onAccountPress: (accountId: string) => void
}) {
  return (
    <View style={{ marginBottom: SECTION_GAP }}>
      <SectionHeader
        title={group.label}
        colors={colors}
      />
      {group.accounts.map((activity) => (
        <AccountRow
          key={activity.account.id}
          activity={activity}
          colors={colors}
          showBalanceChange={showBalanceChange}
          isCurrentPeriod={isCurrentPeriod}
          onNavigate={() => onAccountPress(activity.account.id)}
        />
      ))}
    </View>
  )
}

export function AccountsBody({ colors, scope, period }: Props) {
  const { groups, sectionSummaries } = useAccountsData({ scope, period })

  const handleAccountPress = (accountId: string) => {
    router.push({
      pathname: '/(tabs)/transactions',
      params: { accountId }
    })
  }

  // Show timeline for month and year scopes
  const showBalanceChange = scope === 'month' || scope === 'year'

  // Determine if viewing current period
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const isCurrentPeriod = scope === 'all' ||
    (scope === 'year' && period.year === currentYear) ||
    (scope === 'month' && period.year === currentYear && 'month' in period && period.month === currentMonth)

  // Filter summaries to only show sections with accounts
  const visibleSummaries = sectionSummaries.filter(s => s.hasAccounts)

  if (groups.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl }}>
        <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.sm }}>
          No accounts
        </Text>
        <Text style={{ fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center' }}>
          Add accounts to track your balances and activity.
        </Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing['3xl'] }}
      showsVerticalScrollIndicator={false}
    >
      {/* Summary section */}
      {visibleSummaries.length > 0 && (
        <View style={{ marginBottom: SECTION_GAP }}>
          {visibleSummaries.map((summary, index) => (
            <SummarySectionRow
              key={summary.key}
              label={summary.label}
              startBalance={summary.startBalance}
              endBalance={summary.endBalance}
              delta={summary.delta}
              isLiability={summary.isLiability}
              colors={colors}
              isLast={index === visibleSummaries.length - 1}
              isCurrentPeriod={isCurrentPeriod}
            />
          ))}
        </View>
      )}

      {/* Account sections */}
      {groups.map((group) => (
        <AccountSection
          key={group.key}
          group={group}
          colors={colors}
          showBalanceChange={showBalanceChange}
          isCurrentPeriod={isCurrentPeriod}
          onAccountPress={handleAccountPress}
        />
      ))}
    </ScrollView>
  )
}
