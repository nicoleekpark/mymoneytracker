/**
 * AccountSettingsScreen
 *
 * Full-screen modal for account management.
 * Lists accounts grouped by type with Add New Account CTA.
 */

import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import type { Account, AccountKind } from '@/core/domain/account'
import { getActiveAccounts, getArchivedAccounts, restoreAccount } from '@/core/services/account'
import { useToast } from '@/shared/components'
import { Screen } from '@/shared/layout/Screen'
import { useHoHTheme } from '@/shared/providers'
import { modalStyles } from '@/shared/theme/tokens/modal'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { fontSize, fontWeight, letterSpacing } from '@/shared/theme/tokens/typography'

type SectionKey = 'cashAndSavings' | 'debt' | 'investments' | 'other'

type GroupedAccounts = {
  key: SectionKey
  label: string
  accounts: Account[]
}

const SECTION_LABELS: Record<SectionKey, string> = {
  cashAndSavings: 'Cash & Savings',
  debt: 'Debt',
  investments: 'Investments',
  other: 'Other',
}

const SECTION_ORDER: SectionKey[] = ['cashAndSavings', 'debt', 'investments', 'other']

function getSectionKeyForKind(kind: AccountKind): SectionKey {
  switch (kind) {
    case 'cash':
    case 'checking':
    case 'savings':
      return 'cashAndSavings'
    case 'credit_card':
    case 'loan':
      return 'debt'
    case 'investment':
      return 'investments'
    default:
      return 'other'
  }
}

export default function AccountSettingsScreen() {
  const theme = useHoHTheme()
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams<{ deleted?: string }>()
  const { showToast } = useToast()
  const { semantic } = theme

  // Get accounts - refetch on focus to catch deletions/additions
  const [accounts, setAccounts] = useState<Account[]>([])
  const [archivedAccounts, setArchivedAccounts] = useState<Account[]>([])
  const [showArchived, setShowArchived] = useState(false)

  const refreshAccounts = useCallback(() => {
    setAccounts(getActiveAccounts())
    setArchivedAccounts(getArchivedAccounts())
  }, [])

  useFocusEffect(refreshAccounts)

  // Show toast when account was deleted
  useEffect(() => {
    if (params.deleted) {
      showToast(`"${params.deleted}" deleted`)
      // Clear the param to prevent re-showing on re-render
      router.setParams({ deleted: undefined })
    }
  }, [params.deleted, showToast])

  // Group accounts by section
  const groupedAccounts = useMemo((): GroupedAccounts[] => {
    const groups = new Map<SectionKey, Account[]>()

    for (const account of accounts) {
      const key = getSectionKeyForKind(account.kind)
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key)!.push(account)
    }

    const result: GroupedAccounts[] = []
    for (const key of SECTION_ORDER) {
      const accts = groups.get(key)
      if (accts && accts.length > 0) {
        result.push({
          key,
          label: SECTION_LABELS[key],
          accounts: accts,
        })
      }
    }
    return result
  }, [accounts])

  const handleClose = useCallback(() => {
    router.back()
  }, [])

  const handleAddAccount = useCallback(() => {
    router.push('/(modal)/account-settings/add-account')
  }, [])

  const handleAccountTap = useCallback((accountId: string) => {
    router.push({
      pathname: '/(modal)/account-settings/account-detail',
      params: { accountId },
    })
  }, [])

  const handleRestoreAccount = useCallback((account: Account) => {
    restoreAccount(account.id)
    refreshAccounts()
    showToast(`"${account.name}" restored`)
  }, [refreshAccounts, showToast])

  const getAccountIcon = (kind: string): React.ComponentProps<typeof FontAwesome>['name'] => {
    switch (kind) {
      case 'credit_card':
        return 'credit-card'
      case 'cash':
        return 'money'
      case 'checking':
      case 'savings':
        return 'bank'
      case 'investment':
        return 'line-chart'
      case 'loan':
        return 'file-text-o'
      default:
        return 'university'
    }
  }

  return (
    <Screen
      edges={[]}
      padded={false}
      topPadding={false}
      style={{ flex: 1 }}
      contentStyle={{ flex: 1 }}
    >
      {/* Drag Handle */}
      <View style={modalStyles.dragHandleContainer}>
        <View style={[modalStyles.dragHandle, { backgroundColor: semantic.border }]} />
      </View>

      {/* Header */}
      <View style={[modalStyles.header, { justifyContent: 'space-between' }]}>
        <Pressable onPress={handleClose} hitSlop={12} style={modalStyles.cancelButton}>
          <Text style={[modalStyles.cancelText, { color: semantic.textSecondary }]}>Close</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: semantic.text }]}>Accounts</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Header Divider */}
      <View style={{ height: 1, backgroundColor: semantic.border }} />

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 }, // Space for CTA
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Sections */}
        {groupedAccounts.map((group) => (
          <View key={group.key} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: semantic.textSecondary }]}>
              {group.label}
            </Text>
            {group.accounts.map((account, index) => (
              <Pressable
                key={account.id}
                onPress={() => handleAccountTap(account.id)}
                style={({ pressed }) => [
                  styles.accountRow,
                  index < group.accounts.length - 1 && [
                    styles.accountRowBorder,
                    { borderBottomColor: semantic.border },
                  ],
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <View style={[styles.accountIcon, { backgroundColor: semantic.surfaceAlt }]}>
                  <FontAwesome
                    name={getAccountIcon(account.kind)}
                    size={14}
                    color={semantic.textSecondary}
                  />
                </View>
                <View style={styles.accountInfo}>
                  <Text style={[styles.accountName, { color: semantic.text }]} numberOfLines={1}>
                    {account.name}
                  </Text>
                  {(account.bankName || account.lastFourDigits) && (
                    <Text
                      style={[styles.accountMeta, { color: semantic.textSecondary }]}
                      numberOfLines={1}
                    >
                      {[
                        account.lastFourDigits ? `••••${account.lastFourDigits}` : null,
                        account.bankName,
                      ]
                        .filter(Boolean)
                        .join(' • ')}
                    </Text>
                  )}
                </View>
                <FontAwesome name="chevron-right" size={12} color={semantic.textSecondary} />
              </Pressable>
            ))}
          </View>
        ))}

        {/* Empty State */}
        {accounts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: semantic.text }]}>No accounts yet</Text>
            <Text style={[styles.emptyHint, { color: semantic.textSecondary }]}>
              Add your first account to start tracking
            </Text>
          </View>
        )}

        {/* Archived Accounts - Collapsed by default */}
        {archivedAccounts.length > 0 && (
          <View style={styles.section}>
            <Pressable
              onPress={() => setShowArchived(!showArchived)}
              style={styles.collapsibleHeader}
            >
              <Text style={[styles.sectionTitle, { color: semantic.textSecondary, marginBottom: 0 }]}>
                Closed Accounts ({archivedAccounts.length})
              </Text>
              <FontAwesome
                name={showArchived ? 'chevron-up' : 'chevron-down'}
                size={10}
                color={semantic.textSecondary}
              />
            </Pressable>
            {showArchived && archivedAccounts.map((account, index) => (
              <View
                key={account.id}
                style={[
                  styles.accountRow,
                  index < archivedAccounts.length - 1 && [
                    styles.accountRowBorder,
                    { borderBottomColor: semantic.border },
                  ],
                ]}
              >
                <View style={[styles.accountIcon, { backgroundColor: semantic.surfaceAlt, opacity: 0.6 }]}>
                  <FontAwesome
                    name={getAccountIcon(account.kind)}
                    size={14}
                    color={semantic.textSecondary}
                  />
                </View>
                <View style={styles.accountInfo}>
                  <Text style={[styles.accountName, { color: semantic.textSecondary }]} numberOfLines={1}>
                    {account.name}
                  </Text>
                  {(account.bankName || account.lastFourDigits) && (
                    <Text
                      style={[styles.accountMeta, { color: semantic.textSecondary, opacity: 0.7 }]}
                      numberOfLines={1}
                    >
                      {[
                        account.lastFourDigits ? `••••${account.lastFourDigits}` : null,
                        account.bankName,
                      ]
                        .filter(Boolean)
                        .join(' • ')}
                    </Text>
                  )}
                </View>
                <Pressable
                  onPress={() => handleRestoreAccount(account)}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.restoreButton,
                    { backgroundColor: semantic.surfaceAlt, opacity: pressed ? 0.6 : 1 },
                  ]}
                >
                  <Text style={[styles.restoreButtonText, { color: semantic.primary }]}>Restore</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom CTA */}
      <View
        style={[
          modalStyles.ctaContainerAbsolute,
          {
            backgroundColor: semantic.surface,
            paddingBottom: Math.max(insets.bottom, spacing.lg),
          },
        ]}
      >
        <Pressable
          onPress={handleAddAccount}
          style={({ pressed }) => [
            modalStyles.ctaPrimaryButton,
            { backgroundColor: semantic.primary, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={[modalStyles.ctaPrimaryText, { color: semantic.onPrimary }]}>
            + Add New Account
          </Text>
        </Pressable>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    minWidth: 50,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: letterSpacing.wider,
    marginBottom: spacing.sm,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  accountRowBorder: {
    borderBottomWidth: 1,
  },
  accountIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  accountMeta: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  emptyHint: {
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  restoreButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  restoreButtonText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
})
