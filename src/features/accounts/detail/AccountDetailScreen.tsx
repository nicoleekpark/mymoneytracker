import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router, useLocalSearchParams, useSegments } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { archiveAccount, deleteAccount, getAccountById, getAccountTransactionCount, updateAccount } from '@/core/services/account'
import { adjustAccountBalance, getAccountBalanceAtEndOfMonth } from '@/core/services/transaction'
import { isInvestmentAccount } from '@/core/domain/account'
import { AmountKeypadSheet } from '@/shared/components'
import { CATEGORIES_INDEX } from '@/shared/config/categories.index'
import { Screen } from '@/shared/layout/Screen'
import { formatCentsForDisplay, formatCurrency } from '@/shared/format/currency'
import { useHoHTheme } from '@/shared/providers'
import { useDataRefreshStore } from '@/shared/store'
import { modalStyles, getScrollContentPadding, MODAL_TOAST_DURATION } from '@/shared/theme/tokens/modal'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { fontSize, fontWeight, letterSpacing } from '@/shared/theme/tokens/typography'

export default function AccountDetailScreen() {
  const theme = useHoHTheme()
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams<{ accountId: string }>()
  const segments = useSegments()
  const { transactionVersion, invalidateTransactions } = useDataRefreshStore()
  const { semantic } = theme

  // Determine if opened from nested flow (show "‹ Back") or directly (show "Close")
  const isNestedFlow = segments.includes('account-settings' as never)

  // Re-fetch account when transactionVersion changes (account updates call invalidateTransactions)
  const account = useMemo(() => {
    void transactionVersion // dependency to trigger re-fetch
    if (!params.accountId) return null
    return getAccountById(params.accountId)
  }, [params.accountId, transactionVersion])

  // Current balance - re-fetch when transactionVersion changes
  const currentBalance = useMemo(() => {
    void transactionVersion // dependency to trigger re-fetch
    if (!account) return 0
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return getAccountBalanceAtEndOfMonth(account.id, currentMonth)
  }, [account, transactionVersion])

  // Editable fields
  const [name, setName] = useState('')
  const [bankName, setBankName] = useState('')
  const [lastFourDigits, setLastFourDigits] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Balance editing state
  const [showKeypad, setShowKeypad] = useState(false)
  const [balanceCents, setBalanceCents] = useState(0)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastKey, setToastKey] = useState(0)
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    }
  }, [])

  const showToast = useCallback((message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    setToastMessage(message)
    setToastKey((k) => k + 1)
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), MODAL_TOAST_DURATION)
  }, [])

  // Initialize editable fields from account
  useEffect(() => {
    if (account) {
      setName(account.name)
      setBankName(account.bankName || '')
      setLastFourDigits(account.lastFourDigits || '')
    }
  }, [account])

  // Check if there are unsaved changes
  const hasChanges = useMemo(() => {
    if (!account) return false
    return (
      name !== account.name ||
      bankName !== (account.bankName || '') ||
      lastFourDigits !== (account.lastFourDigits || '')
    )
  }, [account, name, bankName, lastFourDigits])

  // Balance keypad helpers
  const balanceDisplay = useMemo(() => {
    return formatCentsForDisplay(balanceCents)
  }, [balanceCents])

  const handleOpenKeypad = useCallback(() => {
    if (!account) return
    // Initialize keypad with current balance (in cents)
    const balanceInCents = Math.abs(Math.round(currentBalance * 100))
    setBalanceCents(balanceInCents)
    Keyboard.dismiss()
    setShowKeypad(true)
  }, [account, currentBalance])

  const handleKeypadDigit = useCallback((digit: string) => {
    setBalanceCents((prev) => {
      let next = prev
      for (const d of digit) {
        next = next * 10 + parseInt(d, 10)
      }
      // Cap at $999,999.99
      return next > 99999999 ? prev : next
    })
  }, [])

  const handleKeypadBackspace = useCallback(() => {
    setBalanceCents((prev) => Math.floor(prev / 10))
  }, [])

  const handleKeypadClear = useCallback(() => {
    setBalanceCents(0)
  }, [])

  const handleKeypadDone = useCallback(() => {
    if (!account) {
      setShowKeypad(false)
      return
    }

    const isLiability = account.nature === 'liability'
    const currentBalanceInCents = Math.round(currentBalance * 100)

    // For liabilities: user enters debt as positive, but balance is stored negative
    // For assets: user enters balance as-is
    const targetBalanceInCents = isLiability ? -balanceCents : balanceCents

    // No change, just close
    if (currentBalanceInCents === targetBalanceInCents) {
      setShowKeypad(false)
      return
    }

    // Calculate the adjustment amount (difference)
    const adjustmentCents = targetBalanceInCents - currentBalanceInCents
    const adjustmentAmount = adjustmentCents / 100

    try {
      adjustAccountBalance(CATEGORIES_INDEX, account.id, adjustmentAmount)
      invalidateTransactions()
      showToast('Balance updated')
      setShowKeypad(false)
    } catch (error) {
      console.error('Failed to adjust balance:', error)
      const message = error instanceof Error ? error.message : 'Failed to update balance'
      showToast(message)
    }
  }, [account, currentBalance, balanceCents, invalidateTransactions, showToast])

  const handleBack = useCallback(() => {
    if (hasChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      )
    } else {
      router.back()
    }
  }, [hasChanges])

  const handleSave = useCallback(async () => {
    if (!account || !hasChanges) return

    // Validate name
    if (!name.trim()) {
      Alert.alert('Error', 'Account name is required')
      return
    }

    setIsSaving(true)
    try {
      updateAccount(account.id, {
        name: name.trim(),
        bankName: bankName.trim() || undefined,
        lastFourDigits: lastFourDigits.trim() || undefined,
      })
      invalidateTransactions()
      Keyboard.dismiss()
      router.back()
    } catch (error) {
      Alert.alert('Error', 'Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }, [account, name, bankName, lastFourDigits, hasChanges, invalidateTransactions])

  const handleViewTransactions = useCallback(() => {
    if (!account) return
    router.replace({
      pathname: '/(tabs)/transactions',
      params: { accountId: account.id },
    })
  }, [account])

  // Close = soft delete (archive). Transactions stay linked, data preserved for charts/trends.
  const handleClose = useCallback(() => {
    if (!account) return

    Alert.alert(
      'Close Account',
      `This will hide "${account.name}" from your accounts list.\n\nAll transactions and spending history will be preserved.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close Account',
          style: 'destructive',
          onPress: () => {
            try {
              const accountName = account.name
              archiveAccount(account.id)
              invalidateTransactions()
              router.replace({
                pathname: '/(modal)/account-settings',
                params: { deleted: `"${accountName}" closed` },
              })
            } catch (error) {
              Alert.alert('Error', 'Failed to close account')
            }
          },
        },
      ]
    )
  }, [account, invalidateTransactions])

  // Delete = hard delete with cascade. Removes account AND all transactions.
  const handleDelete = useCallback(() => {
    if (!account) return

    const txCount = getAccountTransactionCount(account.id)
    const hasTransactions = txCount > 0

    const message = hasTransactions
      ? `Permanently delete "${account.name}" and ${txCount} transaction${txCount === 1 ? '' : 's'}?\n\nThis will remove all spending history for this account. This cannot be undone.`
      : `Permanently delete "${account.name}"?\n\nThis cannot be undone.`

    Alert.alert(
      'Delete Account',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: hasTransactions ? 'Delete All' : 'Delete',
          style: 'destructive',
          onPress: () => {
            try {
              const accountName = account.name
              deleteAccount(account.id)
              invalidateTransactions()
              router.replace({
                pathname: '/(modal)/account-settings',
                params: { deleted: `"${accountName}" deleted` },
              })
            } catch (error) {
              console.error('Delete account error:', error)
              const message = error instanceof Error ? error.message : 'Failed to delete account'
              Alert.alert('Error', message)
            }
          },
        },
      ]
    )
  }, [account, invalidateTransactions])

  const getAccountTypeLabel = (kind: string, nature: string) => {
    const typeLabel = kind.replace('_', ' ')
    const capitalizedType = typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)
    const natureLabel = nature === 'liability' ? 'Liability' : 'Asset'
    return `${capitalizedType} (${natureLabel})`
  }

  if (!account) {
    return (
      <Screen edges={[]} padded={false} topPadding={false} style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: semantic.textSecondary }}>Account not found</Text>
        </View>
      </Screen>
    )
  }

  const isDebt = account.nature === 'liability'
  const isCash = account.kind === 'cash'
  const displayBalance = isDebt ? -Math.abs(currentBalance) : currentBalance

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

      {/* Header: Back + Title + Save */}
      <View style={[modalStyles.header, { justifyContent: 'space-between' }]}>
        <Pressable onPress={handleBack} hitSlop={12} style={modalStyles.cancelButton}>
          <Text style={[modalStyles.cancelText, { color: semantic.textSecondary }]}>
            {isNestedFlow ? '‹ Back' : 'Close'}
          </Text>
        </Pressable>
        <Text
          style={[styles.headerTitle, { color: semantic.text }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {account.name}
        </Text>
        {hasChanges ? (
          <Pressable
            onPress={handleSave}
            disabled={isSaving}
            hitSlop={12}
            style={[modalStyles.cancelButton, { opacity: isSaving ? 0.5 : 1 }]}
          >
            <Text style={[modalStyles.cancelText, { color: semantic.primary }]}>Save</Text>
          </Pressable>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      {/* Header Divider */}
      <View style={{ height: 1, backgroundColor: semantic.border }} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: getScrollContentPadding(insets.bottom),
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Balance Hero - Tappable to edit */}
        <Pressable
          onPress={handleOpenKeypad}
          style={({ pressed }) => [
            styles.balanceHero,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={[styles.balanceLabel, { color: semantic.textSecondary }]}>
            Current Balance
          </Text>
          <View style={styles.balanceRow}>
            <Text
              style={[
                styles.balanceValue,
                { color: isDebt ? semantic.danger : semantic.text },
              ]}
            >
              {formatCurrency(displayBalance)}
            </Text>
            <FontAwesome
              name="pencil"
              size={14}
              color={semantic.textSecondary}
              style={styles.editIcon}
            />
          </View>
          <Text style={[styles.balanceHint, { color: semantic.textSecondary }]}>
            {isInvestmentAccount(account) ? 'Tap to update market value' : 'Tap to adjust balance'}
          </Text>
        </Pressable>

        {/* Editable Fields */}
        <View style={styles.section}>
          {/* Account Name / Nickname */}
          <View style={[styles.editField, { backgroundColor: semantic.surfaceAlt }]}>
            <Text style={[styles.editFieldLabel, { color: semantic.textSecondary }]}>
              {isCash ? 'Nickname' : 'Account Name'}
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={[modalStyles.fieldInput, { color: semantic.text }]}
              placeholder={isCash ? 'e.g., Vacation, Emergency' : 'Enter account name'}
              placeholderTextColor={semantic.textSecondary}
            />
          </View>

          {/* Source (Cash) or Institution (Other) */}
          <View style={[styles.editField, { backgroundColor: semantic.surfaceAlt }]}>
            <Text style={[styles.editFieldLabel, { color: semantic.textSecondary }]}>
              {isCash ? 'Source' : 'Institution'} <Text style={styles.optionalLabel}>(optional)</Text>
            </Text>
            <TextInput
              value={bankName}
              onChangeText={setBankName}
              style={[modalStyles.fieldInput, { color: semantic.text }]}
              placeholder={isCash ? 'e.g., ATM, Gift, Salary' : 'e.g., Chase, Bank of America'}
              placeholderTextColor={semantic.textSecondary}
            />
          </View>

          {/* Last 4 Digits - Only for non-cash accounts */}
          {!isCash && (
            <View style={[styles.editField, { backgroundColor: semantic.surfaceAlt }]}>
              <Text style={[styles.editFieldLabel, { color: semantic.textSecondary }]}>
                Last 4 Digits <Text style={styles.optionalLabel}>(optional)</Text>
              </Text>
              <TextInput
                value={lastFourDigits}
                onChangeText={(text) => setLastFourDigits(text.replace(/\D/g, '').slice(0, 4))}
                style={[modalStyles.fieldInput, { color: semantic.text }]}
                placeholder="e.g., 4521"
                placeholderTextColor={semantic.textSecondary}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>
          )}
        </View>

        {/* Account Type (Read-only) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: semantic.textSecondary }]}>
            Account Type
          </Text>
          <View style={[styles.readOnlyField, { backgroundColor: semantic.surfaceAlt }]}>
            <Text style={[styles.readOnlyValue, { color: semantic.text }]}>
              {getAccountTypeLabel(account.kind, account.nature)}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: semantic.textSecondary }]}>
            Quick Actions
          </Text>
          <View style={[styles.actionList, { backgroundColor: semantic.surfaceAlt }]}>
            <Pressable
              onPress={handleViewTransactions}
              style={({ pressed }) => [
                styles.actionRow,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <FontAwesome name="list" size={16} color={semantic.textSecondary} />
              <Text style={[styles.actionLabel, { color: semantic.text }]}>
                View Transactions
              </Text>
              <FontAwesome name="chevron-right" size={12} color={semantic.textSecondary} />
            </Pressable>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: semantic.textSecondary }]}>
            Account Actions
          </Text>
          <View style={[styles.actionList, { backgroundColor: semantic.surfaceAlt }]}>
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => [
                styles.actionRow,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <FontAwesome name="times-circle" size={16} color={semantic.textSecondary} />
              <View style={styles.actionLabelGroup}>
                <Text style={[styles.actionLabel, { color: semantic.text }]}>
                  Close Account
                </Text>
                <Text style={[styles.actionHint, { color: semantic.textSecondary }]}>
                  Keeps transaction history
                </Text>
              </View>
              <FontAwesome name="chevron-right" size={12} color={semantic.textSecondary} />
            </Pressable>
            <View style={[styles.actionDivider, { backgroundColor: semantic.border }]} />
            <Pressable
              onPress={handleDelete}
              style={({ pressed }) => [
                styles.actionRow,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <FontAwesome name="trash" size={16} color={semantic.danger} />
              <View style={styles.actionLabelGroup}>
                <Text style={[styles.actionLabel, { color: semantic.danger }]}>
                  Delete Account
                </Text>
                <Text style={[styles.actionHint, { color: semantic.textSecondary }]}>
                  Removes all transactions
                </Text>
              </View>
              <FontAwesome name="chevron-right" size={12} color={semantic.danger} />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Toast */}
      {toastMessage && (
        <Animated.View
          key={toastKey}
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(150)}
          style={[
            modalStyles.toast,
            { backgroundColor: semantic.text, position: 'absolute', bottom: getScrollContentPadding(insets.bottom), alignSelf: 'center' }
          ]}
          pointerEvents="none"
        >
          <Text style={[modalStyles.toastText, { color: semantic.surface }]}>{toastMessage}</Text>
        </Animated.View>
      )}

      {/* Amount Keypad Sheet */}
      <AmountKeypadSheet
        visible={showKeypad}
        amountDisplay={balanceDisplay}
        hideEstimated
        onDigit={handleKeypadDigit}
        onBackspace={handleKeypadBackspace}
        onClear={handleKeypadClear}
        onDone={handleKeypadDone}
        onClose={() => setShowKeypad(false)}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },
  headerSpacer: {
    width: 50,
  },
  balanceHero: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  balanceLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: letterSpacing.wider,
    marginBottom: spacing.xs,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: fontWeight.heavy,
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  editIcon: {
    marginTop: spacing.xs,
  },
  balanceHint: {
    fontSize: fontSize.xs,
    marginTop: spacing.sm,
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
  editField: {
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  editFieldLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
  optionalLabel: {
    fontWeight: fontWeight.normal,
    opacity: 0.7,
  },
  readOnlyField: {
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  readOnlyValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  actionList: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  actionLabelGroup: {
    flex: 1,
  },
  actionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  actionHint: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  actionDivider: {
    height: 1,
    marginLeft: spacing.md + 16 + spacing.md, // icon width + gaps
  },
})
