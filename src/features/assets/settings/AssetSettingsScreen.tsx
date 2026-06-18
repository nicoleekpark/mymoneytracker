/**
 * AssetSettingsScreen
 *
 * Full-screen modal for asset management.
 * Lists assets grouped by category with Add New Asset CTA.
 *
 * Note: Account-linked assets (checking, savings, credit cards) are managed
 * through Accounts Settings. This screen is for manual assets only:
 * - Real estate
 * - Retirement funds (401k, IRA)
 * - Investments/Brokerage (manual balance updates)
 * - Kids savings
 */

import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router, useFocusEffect } from 'expo-router'
import React, { useCallback, useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import type { AssetCategory, AssetItem } from '@/core/domain/asset'
import { getCategoryMeta } from '@/core/domain/asset'
import { getAssetItems, getBalancesForMonth, getCurrentYearMonth } from '@/core/services/asset'
import { EmptyState } from '@/shared/components'
import { formatCurrency } from '@/shared/format/currency'
import { Screen } from '@/shared/layout/Screen'
import { useHoHTheme } from '@/shared/providers'
import { modalStyles } from '@/shared/theme/tokens/modal'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { fontSize, fontWeight, letterSpacing } from '@/shared/theme/tokens/typography'

type GroupedAssets = {
  category: AssetCategory
  categoryName: string
  icon: string
  assets: (AssetItem & { balance: number })[]
}

/**
 * Categories that are managed manually (not linked to accounts)
 * Account-linked categories are managed through Accounts Settings
 */
const MANUAL_CATEGORIES: AssetCategory[] = [
  'real_estate',
  'retirement_funds',
  'investments',
  'kids',
  'loans',
  'other',
]

/**
 * Account-linked categories - shown at the bottom of the list
 * These categories only contain account-synced items (no manual assets possible)
 */
const ACCOUNT_LINKED_CATEGORIES: AssetCategory[] = ['cash_savings', 'credit_card']

export default function AssetSettingsScreen() {
  const theme = useHoHTheme()
  const insets = useSafeAreaInsets()
  const { semantic } = theme

  const [assets, setAssets] = useState<AssetItem[]>([])
  const [balances, setBalances] = useState<Map<string, number>>(new Map())

  const refreshAssets = useCallback(() => {
    const items = getAssetItems()
    const currentMonth = getCurrentYearMonth()
    const balanceMap = getBalancesForMonth(currentMonth)
    setAssets(items.filter((a) => !a.isArchived))
    setBalances(balanceMap)
  }, [])

  useFocusEffect(refreshAssets)

  // Group assets by category
  const groupedAssets = useMemo((): GroupedAssets[] => {
    const groups = new Map<AssetCategory, (AssetItem & { balance: number })[]>()

    for (const asset of assets) {
      if (!groups.has(asset.category)) {
        groups.set(asset.category, [])
      }
      groups.get(asset.category)!.push({
        ...asset,
        balance: balances.get(asset.id) ?? 0,
      })
    }

    const result: GroupedAssets[] = []

    // First show manual categories
    for (const category of MANUAL_CATEGORIES) {
      const items = groups.get(category)
      if (items && items.length > 0) {
        const meta = getCategoryMeta(category)
        if (meta) {
          result.push({
            category,
            categoryName: meta.name,
            icon: meta.icon,
            assets: items.sort((a, b) => b.balance - a.balance),
          })
        }
      }
    }

    // Then show account-linked categories
    for (const category of ACCOUNT_LINKED_CATEGORIES) {
      const items = groups.get(category)
      if (items && items.length > 0) {
        const meta = getCategoryMeta(category)
        if (meta) {
          result.push({
            category,
            categoryName: meta.name,
            icon: meta.icon,
            assets: items.sort((a, b) => b.balance - a.balance),
          })
        }
      }
    }

    return result
  }, [assets, balances])

  const handleClose = useCallback(() => {
    router.back()
  }, [])

  const handleAddAsset = useCallback(() => {
    router.push('/(modal)/asset-settings/add')
  }, [])

  const handleAssetTap = useCallback((assetId: string) => {
    router.push({
      pathname: '/(modal)/asset-settings/asset-detail',
      params: { assetId },
    })
  }, [])

  const getAssetIcon = (
    category: AssetCategory
  ): React.ComponentProps<typeof FontAwesome>['name'] => {
    switch (category) {
      case 'real_estate':
        return 'home'
      case 'retirement_funds':
        return 'shield'
      case 'investments':
        return 'line-chart'
      case 'kids':
        return 'child'
      case 'cash_savings':
        return 'bank'
      case 'credit_card':
        return 'credit-card'
      case 'loans':
        return 'file-text-o'
      default:
        return 'cube'
    }
  }

  /**
   * Check if an asset is account-linked (synced from Accounts, not manually added)
   * Account-derived assets have IDs prefixed with "acct:"
   */
  const isAccountLinked = (asset: AssetItem): boolean => {
    return asset.id.startsWith('acct:')
  }

  const manualAssetCount = assets.filter((a) => MANUAL_CATEGORIES.includes(a.category)).length

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
      <View style={[modalStyles.header, { borderBottomWidth: 0 }]}>
        <Pressable onPress={handleClose} hitSlop={12} style={modalStyles.cancelButton}>
          <Text style={[modalStyles.cancelText, { color: semantic.textSecondary }]}>Close</Text>
        </Pressable>
      </View>

      {/* Title - Center aligned */}
      <View
        style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.md, alignItems: 'center' }}
      >
        <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: semantic.text }}>
          Assets
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Asset Sections */}
        {groupedAssets.map((group) => (
          <View key={group.category} style={styles.section}>
            {(() => {
              // Show section badge if ALL assets in this group are account-linked
              const allAccountLinked =
                group.assets.length > 0 && group.assets.every((a) => isAccountLinked(a))
              return (
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: semantic.textSecondary }]}>
                    {group.categoryName}
                  </Text>
                  {allAccountLinked && (
                    <Text
                      style={[
                        styles.linkedBadge,
                        { color: semantic.textSecondary, backgroundColor: semantic.surfaceAlt },
                      ]}
                    >
                      Via Accounts
                    </Text>
                  )}
                </View>
              )
            })()}
            {(() => {
              // Check if all assets in group are account-linked (section has badge)
              const allAccountLinked =
                group.assets.length > 0 && group.assets.every((a) => isAccountLinked(a))

              return group.assets.map((asset, index) => {
                const linkedToAccount = isAccountLinked(asset)
                return (
                  <Pressable
                    key={asset.id}
                    onPress={() => !linkedToAccount && handleAssetTap(asset.id)}
                    disabled={linkedToAccount}
                    style={({ pressed }) => [
                      styles.assetRow,
                      index < group.assets.length - 1 && [
                        styles.assetRowBorder,
                        { borderBottomColor: semantic.border },
                      ],
                      { opacity: pressed && !linkedToAccount ? 0.6 : 1 },
                    ]}
                  >
                    <View style={[styles.assetIcon, { backgroundColor: semantic.surfaceAlt }]}>
                      <FontAwesome
                        name={getAssetIcon(group.category)}
                        size={14}
                        color={semantic.textSecondary}
                      />
                    </View>
                    <View style={styles.assetInfo}>
                      <Text style={[styles.assetName, { color: semantic.text }]} numberOfLines={1}>
                        {asset.name}
                      </Text>
                      {/* Show individual "Via Accounts" only if section doesn't have the badge */}
                      {linkedToAccount && !allAccountLinked && (
                        <Text style={[styles.viaAccountsLabel, { color: semantic.textSecondary }]}>
                          Via Accounts
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.assetBalance,
                        {
                          color: asset.balance >= 0 ? semantic.text : semantic.danger,
                        },
                      ]}
                    >
                      {formatCurrency(Math.abs(asset.balance))}
                    </Text>
                    {!linkedToAccount && (
                      <FontAwesome
                        name="chevron-right"
                        size={12}
                        color={semantic.textSecondary}
                        style={{ marginLeft: spacing.sm }}
                      />
                    )}
                  </Pressable>
                )
              })
            })()}
          </View>
        ))}

        {/* Empty State */}
        {manualAssetCount === 0 && (
          <EmptyState
            icon="home"
            iconSize={40}
            title="No manual assets yet"
            description="Add real estate, retirement accounts, or other assets that need manual balance updates."
            colors={{ text: semantic.text, textSecondary: semantic.textSecondary }}
          />
        )}

        {/* Note about account-linked assets */}
        {groupedAssets.some((g) => g.assets.some((a) => isAccountLinked(a))) && (
          <View style={[styles.noteBox, { backgroundColor: semantic.surfaceAlt }]}>
            <FontAwesome name="info-circle" size={14} color={semantic.textSecondary} />
            <Text style={[styles.noteText, { color: semantic.textSecondary }]}>
              Bank accounts and credit cards are auto-calculated from your transactions. Manage them
              in Accounts Settings.
            </Text>
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
          onPress={handleAddAsset}
          style={({ pressed }) => [
            modalStyles.ctaPrimaryButton,
            { backgroundColor: semantic.primary, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={[modalStyles.ctaPrimaryText, { color: semantic.onPrimary }]}>
            + Add Manual Asset
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: letterSpacing.wider,
  },
  linkedBadge: {
    fontSize: 10,
    fontWeight: fontWeight.medium,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  assetRowBorder: {
    borderBottomWidth: 1,
  },
  assetIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  viaAccountsLabel: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  assetBalance: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    fontVariant: ['tabular-nums'],
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  noteText: {
    flex: 1,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
})
