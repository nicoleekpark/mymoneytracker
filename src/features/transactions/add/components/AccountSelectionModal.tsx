/**
 * AccountSelectionModal
 *
 * Modal for selecting a payment method / account.
 * Organized into sections: Frequently Used, Recent, All Accounts
 */

import type { Account } from '@/core/domain/account'
import { Screen } from '@/shared/layout/Screen'
import { useHoHTheme } from '@/shared/providers'
import { usePaymentFrequencyStore } from '@/shared/store'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { fontSize, fontWeight, letterSpacing } from '@/shared/theme/tokens/typography'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import React, { useMemo } from 'react'
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type Props = Readonly<{
  visible: boolean
  accountKey: string | null
  accountQuery: string
  filteredAccounts: Account[]
  onQueryChange: (q: string) => void
  onClose: () => void
  onChoose: (key: string) => void
  onAddAccount?: () => void
}>

type SectionData = {
  title: string
  data: Account[]
}

export function AccountSelectionModal({
  visible,
  accountKey,
  accountQuery,
  filteredAccounts,
  onQueryChange,
  onClose,
  onChoose,
  onAddAccount,
}: Props) {
  const theme = useHoHTheme()
  const insets = useSafeAreaInsets()

  const { getFrequentKeys, getRecentKeys } = usePaymentFrequencyStore()

  // Build sections: Frequently Used, Recent, All Accounts
  const sections = useMemo((): SectionData[] => {
    // If searching, just show flat filtered list
    if (accountQuery.trim()) {
      return [{ title: 'Search Results', data: filteredAccounts }]
    }

    const frequentKeys = getFrequentKeys(3)
    const recentKeys = getRecentKeys(3)

    // Build account lookup
    const accountMap = new Map(filteredAccounts.map((a) => [a.key, a]))

    // Frequently Used section
    const frequentAccounts = frequentKeys
      .map((key) => accountMap.get(key))
      .filter((a): a is Account => !!a)

    // Recent section (exclude items already in Frequent)
    const frequentSet = new Set(frequentKeys)
    const recentAccounts = recentKeys
      .filter((key) => !frequentSet.has(key))
      .map((key) => accountMap.get(key))
      .filter((a): a is Account => !!a)

    // All Accounts section
    const usedSet = new Set([...frequentKeys, ...recentKeys])
    const allAccounts = filteredAccounts.filter((a) => !usedSet.has(a.key))

    const result: SectionData[] = []

    if (frequentAccounts.length > 0) {
      result.push({ title: 'Frequently Used', data: frequentAccounts })
    }
    if (recentAccounts.length > 0) {
      result.push({ title: 'Recent', data: recentAccounts })
    }
    if (allAccounts.length > 0) {
      result.push({ title: 'All Accounts', data: allAccounts })
    }

    // If no sections (no usage data yet), just show all
    if (result.length === 0) {
      return [{ title: 'All Accounts', data: filteredAccounts }]
    }

    return result
  }, [filteredAccounts, accountQuery, getFrequentKeys, getRecentKeys])

  const getAccountIcon = (kind: Account['kind']) => {
    switch (kind) {
      case 'credit_card':
        return 'credit-card'
      case 'cash':
        return 'money'
      case 'checking':
      case 'savings':
        return 'bank'
      default:
        return 'university'
    }
  }

  const renderSectionHeader = ({ section }: { section: SectionData }) => (
    <View style={[styles.sectionHeader, { backgroundColor: theme.semantic.surface }]}>
      <Text style={[styles.sectionTitle, { color: theme.semantic.textSecondary }]}>
        {section.title.toUpperCase()}
      </Text>
    </View>
  )

  const renderItem = ({ item: a }: { item: Account }) => {
    const selected = a.key === accountKey
    const badge = `${a.kind}${a.nature === 'liability' ? ' • liability' : ''}`

    return (
      <Pressable
        onPress={() => onChoose(a.key)}
        style={[styles.row, { borderBottomColor: theme.semantic.border }]}
      >
        <View style={styles.rowLeft}>
          <View style={[styles.iconContainer, { backgroundColor: theme.semantic.surfaceAlt }]}>
            <FontAwesome
              name={getAccountIcon(a.kind)}
              size={14}
              color={theme.semantic.textSecondary}
            />
          </View>
          <View style={styles.rowInfo}>
            <Text style={[styles.accountName, { color: theme.semantic.text }]}>{a.name}</Text>
            <Text style={[styles.accountBadge, { color: theme.semantic.textSecondary }]}>
              {badge}
            </Text>
          </View>
        </View>

        {selected && <FontAwesome name="check" size={16} color={theme.semantic.primary} />}
      </Pressable>
    )
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <Screen
        edges={[]}
        padded={false}
        topPadding={false}
        style={{ flex: 1 }}
        contentStyle={{ flex: 1 }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          {/* Header */}
          <View
            style={[
              styles.headerBar,
              {
                borderBottomColor: theme.semantic.border,
                paddingTop: insets.top,
                height: 52 + insets.top,
              },
            ]}
          >
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={[styles.headerCancel, { color: theme.semantic.textSecondary }]}>
                Cancel
              </Text>
            </Pressable>

            <Text style={[styles.headerTitle, { color: theme.semantic.text }]}>Payment Method</Text>

            <View style={{ width: 56 }} />
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <View
              style={[
                styles.searchBox,
                { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surfaceAlt },
              ]}
            >
              <FontAwesome name="search" size={14} color={theme.semantic.textSecondary} />
              <TextInput
                value={accountQuery}
                onChangeText={onQueryChange}
                placeholder="Search accounts"
                placeholderTextColor={theme.semantic.textSecondary}
                style={[styles.searchInput, { color: theme.semantic.text }]}
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
                blurOnSubmit={false}
              />
              {accountQuery.length > 0 && (
                <Pressable onPress={() => onQueryChange('')} hitSlop={8}>
                  <FontAwesome name="times-circle" size={16} color={theme.semantic.textSecondary} />
                </Pressable>
              )}
            </View>
          </View>

          {/* Sectioned List */}
          <SectionList
            style={{ flex: 1 }}
            sections={sections}
            keyExtractor={(item) => item.key}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="on-drag"
            contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
            stickySectionHeadersEnabled={false}
            ListFooterComponent={
              onAddAccount ? (
                <Pressable onPress={onAddAccount} style={styles.addAccountRow}>
                  {/* <View style={[styles.iconContainer, { backgroundColor: theme.semantic.primary + '20' }]}>
                  <FontAwesome name="plus" size={14} color={theme.semantic.primary} />
                </View> */}
                  <Text style={[styles.addAccountText, { color: theme.semantic.primary }]}>
                    Add Account
                  </Text>
                </Pressable>
              ) : null
            }
          />
        </KeyboardAvoidingView>
      </Screen>
    </Modal>
  )
}

const styles = StyleSheet.create({
  headerBar: {
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  headerCancel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  headerTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    paddingVertical: spacing.xs,
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.wider,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 56,
    borderBottomWidth: 1,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  accountBadge: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginTop: 2,
  },
  addAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  addAccountText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
})
