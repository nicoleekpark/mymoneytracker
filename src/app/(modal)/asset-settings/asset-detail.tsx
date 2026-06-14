/**
 * Asset Detail Screen
 *
 * For viewing and editing manual asset details.
 * Shows balance history and allows updating current month balance.
 */

import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import React, { useCallback, useMemo, useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import type { AssetCategory, AssetItem } from '@/core/domain/asset'
import { getCategoryMeta } from '@/core/domain/asset'
import {
  getAssetItems,
  getBalancesForMonth,
  getCurrentYearMonth,
  setBalance,
  getTrend,
} from '@/core/services/asset'
import { formatUsdInt } from '@/shared/format/currency'
import { Screen } from '@/shared/layout/Screen'
import { useHoHTheme } from '@/shared/providers'
import { modalStyles } from '@/shared/theme/tokens/modal'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { fontSize, fontWeight, letterSpacing } from '@/shared/theme/tokens/typography'

type BalanceHistory = {
  yearMonth: string
  amount: number
}

export default function AssetDetailScreen() {
  const { assetId } = useLocalSearchParams<{ assetId: string }>()
  const theme = useHoHTheme()
  const insets = useSafeAreaInsets()
  const { semantic } = theme

  const [asset, setAsset] = useState<AssetItem | null>(null)
  const [currentBalance, setCurrentBalance] = useState<number>(0)
  const [editingBalance, setEditingBalance] = useState<string>('')
  const [isEditing, setIsEditing] = useState(false)
  const [balanceHistory, setBalanceHistory] = useState<BalanceHistory[]>([])

  const currentMonth = getCurrentYearMonth()

  const refreshAsset = useCallback(() => {
    if (!assetId) return

    const items = getAssetItems()
    const found = items.find(a => a.id === assetId)
    setAsset(found ?? null)

    if (found) {
      // Get current balance
      const balances = getBalancesForMonth(currentMonth)
      const balance = balances.get(assetId) ?? 0
      setCurrentBalance(balance)
      setEditingBalance(Math.abs(balance).toString())

      // Get balance history (last 12 months)
      const history: BalanceHistory[] = []
      for (let i = 0; i < 12; i++) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        const monthBalances = getBalancesForMonth(yearMonth)
        const amount = monthBalances.get(assetId) ?? 0
        if (amount !== 0 || i === 0) {
          history.push({ yearMonth, amount })
        }
      }
      setBalanceHistory(history)
    }
  }, [assetId, currentMonth])

  useFocusEffect(refreshAsset)

  const categoryMeta = useMemo(() => {
    if (!asset) return null
    return getCategoryMeta(asset.category)
  }, [asset])

  const handleBack = useCallback(() => {
    router.back()
  }, [])

  const handleSaveBalance = useCallback(() => {
    if (!asset) return

    const newAmount = parseFloat(editingBalance.replace(/[^0-9.-]/g, ''))
    if (isNaN(newAmount)) {
      Alert.alert('Invalid Amount', 'Please enter a valid number.')
      return
    }

    // For liabilities, store as negative
    const finalAmount = asset.field === 'liabilities' ? -Math.abs(newAmount) : Math.abs(newAmount)
    setBalance(asset.id, currentMonth, finalAmount)
    setCurrentBalance(finalAmount)
    setIsEditing(false)
    refreshAsset()
  }, [asset, editingBalance, currentMonth, refreshAsset])

  const handleArchive = useCallback(() => {
    if (!asset) return

    Alert.alert(
      'Archive Asset',
      `Are you sure you want to archive "${asset.name}"? It will be hidden from the list but data will be preserved.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement archive
            router.back()
          },
        },
      ]
    )
  }, [asset])

  const getAssetIcon = (category: AssetCategory): React.ComponentProps<typeof FontAwesome>['name'] => {
    switch (category) {
      case 'real_estate':
        return 'home'
      case 'retirement_funds':
        return 'shield'
      case 'investments':
        return 'line-chart'
      case 'kids':
        return 'child'
      case 'loans':
        return 'file-text-o'
      default:
        return 'cube'
    }
  }

  const formatMonthLabel = (yearMonth: string): string => {
    const [year, month] = yearMonth.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  if (!asset) {
    return (
      <Screen
        edges={[]}
        padded={false}
        topPadding={false}
        style={{ flex: 1 }}
        contentStyle={{ flex: 1 }}
      >
        <View style={[modalStyles.header, { justifyContent: 'space-between' }]}>
          <Pressable onPress={handleBack} hitSlop={12} style={modalStyles.cancelButton}>
            <Text style={[modalStyles.cancelText, { color: semantic.primary }]}>← Back</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: semantic.text }]}>Asset Detail</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: semantic.textSecondary }]}>
            Asset not found
          </Text>
        </View>
      </Screen>
    )
  }

  return (
    <Screen
      edges={[]}
      padded={false}
      topPadding={false}
      style={{ flex: 1 }}
      contentStyle={{ flex: 1 }}
    >
      {/* Header */}
      <View style={[modalStyles.header, { justifyContent: 'space-between' }]}>
        <Pressable onPress={handleBack} hitSlop={12} style={modalStyles.cancelButton}>
          <Text style={[modalStyles.cancelText, { color: semantic.primary }]}>← Back</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: semantic.text }]} numberOfLines={1}>
          {asset.name}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Header Divider */}
      <View style={{ height: 1, backgroundColor: semantic.border }} />

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Asset Info Card */}
        <View style={[styles.infoCard, { backgroundColor: semantic.surfaceAlt }]}>
          <View style={[styles.iconContainer, { backgroundColor: semantic.surface }]}>
            <FontAwesome
              name={getAssetIcon(asset.category)}
              size={24}
              color={semantic.primary}
            />
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.categoryLabel, { color: semantic.textSecondary }]}>
              {categoryMeta?.name ?? asset.category}
            </Text>
            <Text style={[styles.assetName, { color: semantic.text }]}>
              {asset.name}
            </Text>
          </View>
        </View>

        {/* Current Balance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: semantic.textSecondary }]}>
            CURRENT BALANCE
          </Text>
          <View style={[styles.balanceCard, { backgroundColor: semantic.surfaceAlt }]}>
            <Text style={[styles.balanceMonth, { color: semantic.textSecondary }]}>
              {formatMonthLabel(currentMonth)}
            </Text>
            {isEditing ? (
              <View style={styles.editRow}>
                <Text style={[styles.currencySign, { color: semantic.text }]}>$</Text>
                <TextInput
                  style={[styles.balanceInput, { color: semantic.text }]}
                  value={editingBalance}
                  onChangeText={setEditingBalance}
                  keyboardType="numeric"
                  autoFocus
                  selectTextOnFocus
                />
                <Pressable
                  onPress={handleSaveBalance}
                  style={[styles.saveButton, { backgroundColor: semantic.primary }]}
                >
                  <Text style={[styles.saveButtonText, { color: semantic.onPrimary }]}>Save</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setIsEditing(false)
                    setEditingBalance(Math.abs(currentBalance).toString())
                  }}
                  style={styles.cancelEditButton}
                >
                  <Text style={[styles.cancelEditText, { color: semantic.textSecondary }]}>Cancel</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => setIsEditing(true)}
                style={({ pressed }) => [
                  styles.balanceRow,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <Text style={[
                  styles.balanceAmount,
                  { color: currentBalance >= 0 ? semantic.text : semantic.danger }
                ]}>
                  {formatUsdInt(Math.abs(currentBalance))}
                </Text>
                <FontAwesome name="pencil" size={14} color={semantic.textSecondary} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Balance History Section */}
        {balanceHistory.length > 1 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: semantic.textSecondary }]}>
              BALANCE HISTORY
            </Text>
            <View style={[styles.historyCard, { backgroundColor: semantic.surfaceAlt }]}>
              {balanceHistory.slice(1).map((entry, index) => (
                <View
                  key={entry.yearMonth}
                  style={[
                    styles.historyRow,
                    index < balanceHistory.length - 2 && [
                      styles.historyRowBorder,
                      { borderBottomColor: semantic.border },
                    ],
                  ]}
                >
                  <Text style={[styles.historyMonth, { color: semantic.textSecondary }]}>
                    {formatMonthLabel(entry.yearMonth)}
                  </Text>
                  <Text style={[
                    styles.historyAmount,
                    { color: entry.amount >= 0 ? semantic.text : semantic.danger }
                  ]}>
                    {formatUsdInt(Math.abs(entry.amount))}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Asset Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: semantic.textSecondary }]}>
            SETTINGS
          </Text>
          <View style={[styles.settingsCard, { backgroundColor: semantic.surfaceAlt }]}>
            <View style={[styles.settingRow, { borderBottomColor: semantic.border }]}>
              <Text style={[styles.settingLabel, { color: semantic.text }]}>Category</Text>
              <Text style={[styles.settingValue, { color: semantic.textSecondary }]}>
                {categoryMeta?.name ?? asset.category}
              </Text>
            </View>
            <View style={[styles.settingRow, { borderBottomColor: semantic.border }]}>
              <Text style={[styles.settingLabel, { color: semantic.text }]}>Liquidifiable</Text>
              <Text style={[styles.settingValue, { color: semantic.textSecondary }]}>
                {asset.isLiquidifiable ? 'Yes' : 'No'}
              </Text>
            </View>
            <View style={styles.settingRowLast}>
              <Text style={[styles.settingLabel, { color: semantic.text }]}>Type</Text>
              <Text style={[styles.settingValue, { color: semantic.textSecondary }]}>
                {asset.field === 'liabilities' ? 'Liability' : 'Asset'}
              </Text>
            </View>
          </View>
        </View>

        {/* Archive Button */}
        <Pressable
          onPress={handleArchive}
          style={({ pressed }) => [
            styles.archiveButton,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <FontAwesome name="archive" size={14} color={semantic.danger} />
          <Text style={[styles.archiveText, { color: semantic.danger }]}>Archive Asset</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
    flex: 1,
    marginHorizontal: spacing.md,
  },
  headerSpacer: {
    minWidth: 50,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: fontSize.md,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: letterSpacing.wider,
    marginBottom: spacing.xs,
  },
  assetName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
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
  balanceCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  balanceMonth: {
    fontSize: fontSize.xs,
    marginBottom: spacing.sm,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceAmount: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    fontVariant: ['tabular-nums'],
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  currencySign: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  balanceInput: {
    flex: 1,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    fontVariant: ['tabular-nums'],
    padding: 0,
  },
  saveButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
  saveButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  cancelEditButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  cancelEditText: {
    fontSize: fontSize.sm,
  },
  historyCard: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  historyRowBorder: {
    borderBottomWidth: 1,
  },
  historyMonth: {
    fontSize: fontSize.sm,
  },
  historyAmount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    fontVariant: ['tabular-nums'],
  },
  settingsCard: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  settingRowLast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  settingLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  settingValue: {
    fontSize: fontSize.sm,
  },
  archiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    marginTop: spacing.md,
  },
  archiveText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
})
