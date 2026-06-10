/**
 * AccountSettingsSheet
 *
 * Bottom sheet for account management: Grouped account list + Add Account CTA.
 * Consistent with other modal designs (drag handle, Close button, bottom CTA).
 */

import FontAwesome from '@expo/vector-icons/FontAwesome'
import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetFooterProps,
} from '@gorhom/bottom-sheet'
import { router } from 'expo-router'
import React, { useCallback, useMemo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import type { Account } from '@/core/domain/account'
import { useHoHTheme } from '@/shared/providers'
import {
  modalStyles,
  getScrollContentPadding,
  MODAL_SNAP_FULL,
} from '@/shared/theme/tokens/modal'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { fontSize, fontWeight, letterSpacing } from '@/shared/theme/tokens/typography'
import {
  getSectionKeyForKind,
  SECTION_LABELS,
  SECTION_ORDER,
  type SectionKey,
} from '../accounts.types'

type AccountSettingsSheetProps = {
  sheetRef: React.RefObject<BottomSheetModal | null>
  accounts: Account[]
  onDismiss?: () => void
}

type GroupedAccounts = {
  key: SectionKey
  label: string
  accounts: Account[]
}

export function AccountSettingsSheet({
  sheetRef,
  accounts,
  onDismiss,
}: AccountSettingsSheetProps) {
  const theme = useHoHTheme()
  const insets = useSafeAreaInsets()
  const snapPoints = MODAL_SNAP_FULL

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

    // Build ordered groups
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

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  )

  const handleClose = useCallback(() => {
    sheetRef.current?.dismiss()
  }, [sheetRef])

  const handleAddAccount = useCallback(() => {
    sheetRef.current?.dismiss()
    router.push('/(modal)/add-account')
  }, [sheetRef])

  const handleManageAccount = useCallback(
    (accountId: string) => {
      sheetRef.current?.dismiss()
      router.push({
        pathname: '/(modal)/account-detail',
        params: { accountId, fromSettings: 'true' },
      })
    },
    [sheetRef]
  )

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

  // Footer with Add Account CTA
  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props} bottomInset={0}>
        <View
          style={[
            styles.footer,
            {
              backgroundColor: theme.semantic.surface,
              paddingBottom: Math.max(insets.bottom, spacing.lg),
            },
          ]}
        >
          <Pressable
            onPress={handleAddAccount}
            style={[modalStyles.ctaPrimaryButton, { backgroundColor: theme.semantic.primary }]}
          >
            <Text style={[modalStyles.ctaPrimaryText, { color: theme.semantic.onPrimary }]}>
              + Add New Account
            </Text>
          </Pressable>
        </View>
      </BottomSheetFooter>
    ),
    [theme, insets.bottom, handleAddAccount]
  )

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}
      onDismiss={onDismiss}
      backgroundStyle={[modalStyles.modal, { backgroundColor: theme.semantic.surface }]}
      handleIndicatorStyle={{ backgroundColor: theme.semantic.border }}
    >
      {/* Drag Handle */}
      <View style={modalStyles.dragHandleContainer}>
        <View style={[modalStyles.dragHandle, { backgroundColor: theme.semantic.border }]} />
      </View>

      {/* Header */}
      <View style={modalStyles.header}>
        <Pressable onPress={handleClose} hitSlop={12} style={modalStyles.cancelButton}>
          <Text style={[modalStyles.cancelText, { color: theme.semantic.textSecondary }]}>
            Close
          </Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.semantic.text }]}>Accounts</Text>
        <View style={styles.headerSpacer} />
      </View>

      <BottomSheetScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: getScrollContentPadding(insets.bottom) + 80 }, // Extra space for CTA
        ]}
      >
        {/* Grouped Account Sections */}
        {groupedAccounts.map((group) => (
          <View key={group.key} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.semantic.textSecondary }]}>
              {group.label}
            </Text>
            <View style={[styles.accountList, { backgroundColor: theme.semantic.surfaceAlt }]}>
              {group.accounts.map((account, index) => (
                <Pressable
                  key={account.id}
                  onPress={() => handleManageAccount(account.id)}
                  style={({ pressed }) => [
                    styles.accountRow,
                    index < group.accounts.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: theme.semantic.border,
                    },
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <View style={[styles.accountIcon, { backgroundColor: theme.semantic.surface }]}>
                    <FontAwesome
                      name={getAccountIcon(account.kind)}
                      size={14}
                      color={theme.semantic.textSecondary}
                    />
                  </View>
                  <View style={styles.accountInfo}>
                    <Text
                      style={[styles.accountName, { color: theme.semantic.text }]}
                      numberOfLines={1}
                    >
                      {account.name}
                    </Text>
                    {(account.bankName || account.lastFourDigits) && (
                      <Text
                        style={[styles.accountMeta, { color: theme.semantic.textSecondary }]}
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
                  <FontAwesome name="chevron-right" size={12} color={theme.semantic.textSecondary} />
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* Empty State */}
        {accounts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.semantic.textSecondary }]}>
              No accounts yet
            </Text>
            <Text style={[styles.emptyHint, { color: theme.semantic.textSecondary }]}>
              Add your first account to start tracking
            </Text>
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  headerSpacer: {
    width: 50,
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
    paddingLeft: spacing.xs,
  },
  accountList: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
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
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  emptyHint: {
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
})
