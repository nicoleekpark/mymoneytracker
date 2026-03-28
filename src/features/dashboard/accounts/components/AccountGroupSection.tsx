import React, { forwardRef } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { fontSize, fontWeight, letterSpacing } from '@/shared/theme/tokens/typography'
import { spacing } from '@/shared/theme/tokens/spacing'
import type { AccountGroup, AccountsColors } from '../accounts.types'
import { AccountRow } from './AccountRow'

type Props = {
  group: AccountGroup
  colors: AccountsColors
  showBalanceChange: boolean  // true for monthly/yearly view
  onAccountPress: (accountId: string) => void
}

export const AccountGroupSection = forwardRef<View, Props>(function AccountGroupSection(
  { group, colors, showBalanceChange, onAccountPress },
  ref
) {
  return (
    <View style={styles.section} ref={ref}>
      {/* Section header - minimal (label only, no total) */}
      <View style={[styles.header, { borderTopColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          {group.label.toUpperCase()}
        </Text>
      </View>

      {/* Account rows */}
      <View style={styles.rows}>
        {group.accounts.map((activity) => (
          <AccountRow
            key={activity.account.id}
            activity={activity}
            colors={colors}
            showBalanceChange={showBalanceChange}
            onNavigate={() => onAccountPress(activity.account.id)}
          />
        ))}
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.xl,
  },
  header: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.wider,
  },
  rows: {
    gap: 0,
  },
})
