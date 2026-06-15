/**
 * Asset Detail Screen
 *
 * Matches AccountDetailScreen layout exactly:
 * - Header: Back + asset name + Save
 * - Tappable balance hero
 * - Card-based editable fields
 * - Asset Type section (read-only)
 * - Quick Actions section
 * - Asset Actions section (Archive/Delete)
 */

import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import type { AssetItem } from '@/core/domain/asset'
import { getCategoryMeta } from '@/core/domain/asset'
import {
  archiveAssetItem,
  deleteAssetItem,
  getAssetItems,
  getBalancesForMonth,
  getCurrentYearMonth,
  setBalance,
  updateAssetItem,
} from '@/core/services/asset'
import { AmountKeypadSheet } from '@/shared/components'
import { formatCentsForDisplay, formatUsdInt } from '@/shared/format/currency'
import { Screen } from '@/shared/layout/Screen'
import { useHoHTheme } from '@/shared/providers'
import { useDataRefreshStore } from '@/shared/store'
import { getScrollContentPadding, modalStyles, MODAL_TOAST_DURATION } from '@/shared/theme/tokens/modal'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { fontSize, fontWeight, letterSpacing } from '@/shared/theme/tokens/typography'

export default function AssetDetailScreen() {
  const { assetId } = useLocalSearchParams<{ assetId: string }>()
  const theme = useHoHTheme()
  const insets = useSafeAreaInsets()
  const { semantic } = theme
  const { invalidateAssets } = useDataRefreshStore()

  const [asset, setAsset] = useState<AssetItem | null>(null)
  const [currentBalance, setCurrentBalance] = useState<number>(0)
  const [name, setName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Balance editing state
  const [showKeypad, setShowKeypad] = useState(false)
  const [balanceCents, setBalanceCents] = useState(0)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastKey, setToastKey] = useState(0)
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentMonth = getCurrentYearMonth()

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

  const refreshAsset = useCallback(() => {
    if (!assetId) return

    // Skip if this is an account-based asset (prefixed with "acct:")
    if (assetId.startsWith('acct:')) {
      setAsset(null)
      return
    }

    const items = getAssetItems()
    const found = items.find(a => a.id === assetId)
    setAsset(found ?? null)

    if (found) {
      setName(found.name)
      const balances = getBalancesForMonth(currentMonth)
      const balance = balances.get(assetId) ?? 0
      setCurrentBalance(balance)
    }
  }, [assetId, currentMonth])

  useFocusEffect(refreshAsset)

  const categoryMeta = useMemo(() => {
    if (!asset) return null
    return getCategoryMeta(asset.category)
  }, [asset])

  const isLiability = asset?.field === 'liabilities'
  const displayBalance = isLiability ? Math.abs(currentBalance) : currentBalance

  // Check for unsaved changes
  const hasChanges = useMemo(() => {
    if (!asset) return false
    return name !== asset.name
  }, [asset, name])

  // Balance keypad helpers
  const balanceDisplay = useMemo(() => {
    return formatCentsForDisplay(balanceCents)
  }, [balanceCents])

  const handleOpenKeypad = useCallback(() => {
    if (!asset) return
    const balanceInCents = Math.abs(Math.round(currentBalance * 100))
    setBalanceCents(balanceInCents)
    Keyboard.dismiss()
    setShowKeypad(true)
  }, [asset, currentBalance])

  const handleKeypadDigit = useCallback((digit: string) => {
    setBalanceCents((prev) => {
      let next = prev
      for (const d of digit) {
        next = next * 10 + parseInt(d, 10)
      }
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
    if (!asset) {
      setShowKeypad(false)
      return
    }

    const currentBalanceInCents = Math.round(Math.abs(currentBalance) * 100)
    const newBalanceInCents = balanceCents

    if (currentBalanceInCents === newBalanceInCents) {
      setShowKeypad(false)
      return
    }

    try {
      const dollars = newBalanceInCents / 100
      const finalBalance = isLiability ? -dollars : dollars
      setBalance(asset.id, currentMonth, finalBalance)
      setCurrentBalance(finalBalance)
      invalidateAssets()
      showToast('Balance updated')
      setShowKeypad(false)
    } catch (error) {
      console.error('Failed to update balance:', error)
      const message = error instanceof Error ? error.message : 'Failed to update balance'
      showToast(message)
    }
  }, [asset, currentBalance, balanceCents, currentMonth, isLiability, invalidateAssets, showToast])

  const handleBack = useCallback(() => {
    if (hasChanges) {
      Alert.alert('Unsaved Changes', 'You have unsaved changes. Discard them?', [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() },
      ])
    } else {
      router.back()
    }
  }, [hasChanges])

  const handleSave = useCallback(() => {
    if (!asset || !hasChanges) return

    // Validate name
    if (!name.trim()) {
      Alert.alert('Error', 'Asset name is required')
      return
    }

    setIsSaving(true)
    try {
      updateAssetItem(asset.id, { name: name.trim() })
      invalidateAssets()
      Keyboard.dismiss()
      router.back()
    } catch (error) {
      console.error('Failed to save:', error)
      showToast('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }, [asset, hasChanges, name, invalidateAssets, showToast])

  // Archive = soft delete. Hides from list but preserves balance history.
  const handleArchive = useCallback(() => {
    if (!asset) return

    Alert.alert(
      'Archive Asset',
      `This will hide "${asset.name}" from your assets list.\n\nBalance history will be preserved.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: () => {
            try {
              const assetName = asset.name
              archiveAssetItem(asset.id)
              invalidateAssets()
              router.replace({
                pathname: '/(modal)/asset-settings',
                params: { deleted: `"${assetName}" archived` },
              })
            } catch (error) {
              Alert.alert('Error', 'Failed to archive asset')
            }
          },
        },
      ]
    )
  }, [asset, invalidateAssets])

  // Delete = hard delete. Removes asset and all balance history.
  const handleDelete = useCallback(() => {
    if (!asset) return

    Alert.alert(
      'Delete Asset',
      `Permanently delete "${asset.name}"?\n\nThis will remove all balance history. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            try {
              const assetName = asset.name
              deleteAssetItem(asset.id)
              invalidateAssets()
              router.replace({
                pathname: '/(modal)/asset-settings',
                params: { deleted: `"${assetName}" deleted` },
              })
            } catch (error) {
              console.error('Delete asset error:', error)
              const message = error instanceof Error ? error.message : 'Failed to delete asset'
              Alert.alert('Error', message)
            }
          },
        },
      ]
    )
  }, [asset, invalidateAssets])

  const handleViewHistory = useCallback(() => {
    if (!asset) return
    router.push({
      pathname: '/(modal)/net-worth-history',
      params: { assetId: asset.id },
    })
  }, [asset])

  // Account-based assets should redirect to account detail
  if (assetId?.startsWith('acct:')) {
    return (
      <Screen edges={[]} padded={false} topPadding={false} style={{ flex: 1 }} contentStyle={{ flex: 1 }}>
        <View style={modalStyles.dragHandleContainer}>
          <View style={[modalStyles.dragHandle, { backgroundColor: semantic.border }]} />
        </View>
        <View style={[modalStyles.header, { justifyContent: 'space-between' }]}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={modalStyles.cancelButton}>
            <Text style={[modalStyles.cancelText, { color: semantic.textSecondary }]}>‹ Back</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: semantic.text }]}>Asset Detail</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={{ height: 1, backgroundColor: semantic.border }} />
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: semantic.textSecondary }]}>
            This is an account-based asset. Edit it from Account Settings.
          </Text>
        </View>
      </Screen>
    )
  }

  if (!asset) {
    return (
      <Screen edges={[]} padded={false} topPadding={false} style={{ flex: 1 }} contentStyle={{ flex: 1 }}>
        <View style={modalStyles.dragHandleContainer}>
          <View style={[modalStyles.dragHandle, { backgroundColor: semantic.border }]} />
        </View>
        <View style={[modalStyles.header, { justifyContent: 'space-between' }]}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={modalStyles.cancelButton}>
            <Text style={[modalStyles.cancelText, { color: semantic.textSecondary }]}>‹ Back</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: semantic.text }]}>Asset Detail</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={{ height: 1, backgroundColor: semantic.border }} />
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: semantic.textSecondary }]}>Asset not found</Text>
        </View>
      </Screen>
    )
  }

  return (
    <Screen edges={[]} padded={false} topPadding={false} style={{ flex: 1 }} contentStyle={{ flex: 1 }}>
      {/* Drag Handle */}
      <View style={modalStyles.dragHandleContainer}>
        <View style={[modalStyles.dragHandle, { backgroundColor: semantic.border }]} />
      </View>

      {/* Header: Back + Title + Save */}
      <View style={[modalStyles.header, { justifyContent: 'space-between' }]}>
        <Pressable onPress={handleBack} hitSlop={12} style={modalStyles.cancelButton}>
          <Text style={[modalStyles.cancelText, { color: semantic.textSecondary }]}>‹ Back</Text>
        </Pressable>
        <Text
          style={[styles.headerTitle, { color: semantic.text }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {asset.name}
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
            {isLiability ? 'Amount Owed' : 'Current Value'}
          </Text>
          <View style={styles.balanceRow}>
            <Text
              style={[
                styles.balanceValue,
                { color: isLiability ? semantic.danger : semantic.text },
              ]}
            >
              {formatUsdInt(displayBalance)}
            </Text>
            <FontAwesome
              name="pencil"
              size={14}
              color={semantic.textSecondary}
              style={styles.editIcon}
            />
          </View>
          <Text style={[styles.balanceHint, { color: semantic.textSecondary }]}>
            Tap to update {isLiability ? 'balance' : 'value'}
          </Text>
        </Pressable>

        {/* Editable Fields */}
        <View style={styles.section}>
          {/* Asset Name */}
          <View style={[styles.editField, { backgroundColor: semantic.surfaceAlt }]}>
            <Text style={[styles.editFieldLabel, { color: semantic.textSecondary }]}>
              Asset Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={[modalStyles.fieldInput, { color: semantic.text }]}
              placeholder="Enter asset name"
              placeholderTextColor={semantic.textSecondary}
            />
          </View>
        </View>

        {/* Asset Type (Read-only) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: semantic.textSecondary }]}>
            Asset Type
          </Text>
          <View style={[styles.readOnlyField, { backgroundColor: semantic.surfaceAlt }]}>
            <Text style={[styles.readOnlyValue, { color: semantic.text }]}>
              {categoryMeta?.name ?? asset.category} ({isLiability ? 'Liability' : 'Asset'})
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
              onPress={handleViewHistory}
              style={({ pressed }) => [
                styles.actionRow,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <FontAwesome name="line-chart" size={16} color={semantic.textSecondary} />
              <Text style={[styles.actionLabel, { color: semantic.text }]}>
                View Balance History
              </Text>
              <FontAwesome name="chevron-right" size={12} color={semantic.textSecondary} />
            </Pressable>
          </View>
        </View>

        {/* Asset Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: semantic.textSecondary }]}>
            Asset Actions
          </Text>
          <View style={[styles.actionList, { backgroundColor: semantic.surfaceAlt }]}>
            <Pressable
              onPress={handleArchive}
              style={({ pressed }) => [
                styles.actionRow,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <FontAwesome name="archive" size={16} color={semantic.textSecondary} />
              <View style={styles.actionLabelGroup}>
                <Text style={[styles.actionLabel, { color: semantic.text }]}>
                  Archive Asset
                </Text>
                <Text style={[styles.actionHint, { color: semantic.textSecondary }]}>
                  Keeps balance history
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
                  Delete Asset
                </Text>
                <Text style={[styles.actionHint, { color: semantic.textSecondary }]}>
                  Removes all history
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
            { backgroundColor: semantic.text, position: 'absolute', bottom: getScrollContentPadding(insets.bottom), alignSelf: 'center' },
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.md,
    textAlign: 'center',
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
