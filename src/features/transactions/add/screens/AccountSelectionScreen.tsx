/**
 * AccountSelectionScreen
 *
 * Full-screen account/payment method selection that slides in from right.
 * Uses modal design system for consistent styling.
 */

import type { Account } from '@/core/domain/account'
import { getActiveAccounts } from '@/core/services/account'
import { Screen } from '@/shared/layout/Screen'
import { useHoHTheme } from '@/shared/providers'
import { usePaymentFrequencyStore } from '@/shared/store'
import { modalStyles, getScrollContentPadding } from '@/shared/theme/tokens/modal'
import { spacing } from '@/shared/theme/tokens/spacing'
import { normalizeForSearch } from '@/shared/utils/search'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useFocusEffect } from '@react-navigation/native'
import { router } from 'expo-router'
import React, { useCallback, useMemo, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SectionList,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useAddTransactionNavStore } from '../store/addTransactionNav.store'

type SectionData = {
  title: string
  data: Account[]
}

export function AccountSelectionScreen() {
  const { semantic } = useHoHTheme()
  const insets = useSafeAreaInsets()

  // Get state from navigation store
  const { currentAccountKey, accountCallback, closeAccountSelection } =
    useAddTransactionNavStore()

  // Local state
  const [accountQuery, setAccountQuery] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  // Refetch accounts when screen gains focus (e.g., returning from add-account)
  useFocusEffect(
    useCallback(() => {
      setRefreshKey((k) => k + 1)
    }, [])
  )

  // Use fresh accounts list (refreshKey forces re-fetch on focus)
  const accounts = useMemo(() => {
    void refreshKey // dependency to trigger refresh
    return getActiveAccounts()
  }, [refreshKey])

  // Filter accounts
  const filteredAccounts = useMemo(() => {
    const q = normalizeForSearch(accountQuery)
    if (!q) return accounts
    return accounts.filter((a) => {
      const hay = normalizeForSearch(`${a.key} ${a.name} ${a.nature} ${a.kind}`)
      return hay.includes(q)
    })
  }, [accounts, accountQuery])

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

  const handleClose = () => {
    closeAccountSelection()
    router.back()
  }

  const handleChoose = (key: string) => {
    accountCallback?.onChooseAccount(key)
    closeAccountSelection()
    router.back()
  }

  const handleAddAccount = () => {
    accountCallback?.onAddAccount()
    closeAccountSelection()
    // Navigate to add-account screen (within the same stack)
    router.push('/(modal)/add-transaction/add-account')
  }

  const renderSectionHeader = ({ section }: { section: SectionData }) => (
    <View style={[modalStyles.selectionSectionHeader, { backgroundColor: semantic.surface, paddingHorizontal: spacing.lg }]}>
      <Text style={[modalStyles.selectionSectionTitle, { color: semantic.textSecondary }]}>
        {section.title.toUpperCase()}
      </Text>
    </View>
  )

  const renderItem = ({ item: a, index: _index }: { item: Account; index: number }) => {
    const selected = a.key === currentAccountKey
    const badge = `${a.kind}${a.nature === 'liability' ? ' • liability' : ''}`

    return (
      <Pressable
        onPress={() => handleChoose(a.key)}
        style={[
          modalStyles.selectionListRow,
          { paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: semantic.border }
        ]}
      >
        <View style={[modalStyles.selectionListRowIcon, { backgroundColor: semantic.surfaceAlt }]}>
          <FontAwesome
            name={getAccountIcon(a.kind)}
            size={14}
            color={semantic.textSecondary}
          />
        </View>
        <View style={modalStyles.selectionListRowContent}>
          <Text style={[modalStyles.selectionListRowTitle, { color: semantic.text }]}>{a.name}</Text>
          <Text style={[modalStyles.selectionListRowSubtitle, { color: semantic.textSecondary }]}>
            {badge}
          </Text>
        </View>

        {selected && <FontAwesome name="check" size={16} color={semantic.primary} />}
      </Pressable>
    )
  }

  return (
    <Screen
      edges={['top']}
      padded={false}
      topPadding={false}
      style={{ flex: 1, backgroundColor: semantic.surface }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Drag Handle */}
        <View style={modalStyles.dragHandleContainer}>
          <View style={[modalStyles.dragHandle, { backgroundColor: semantic.border }]} />
        </View>

        {/* Header (Cancel only - matches AddTransactionScreen) */}
        <View style={modalStyles.header}>
          <Pressable onPress={handleClose} hitSlop={12} style={modalStyles.cancelButton}>
            <Text style={[modalStyles.cancelText, { color: semantic.textSecondary }]}>
              Cancel
            </Text>
          </Pressable>
        </View>

        {/* Title Row (matches Type Tabs position) */}
        <View style={[modalStyles.typeTabs, { borderBottomColor: semantic.border, paddingVertical: spacing.md }]}>
          <Text style={[modalStyles.typeTabText, { color: semantic.text, fontWeight: '700' }]}>
            Payment Method
          </Text>
        </View>

        {/* Search */}
        <View style={modalStyles.searchContainer}>
          <View style={[modalStyles.searchBox, { borderColor: semantic.border, backgroundColor: semantic.surfaceAlt }]}>
            <FontAwesome name="search" size={14} color={semantic.textSecondary} />
            <TextInput
              value={accountQuery}
              onChangeText={setAccountQuery}
              placeholder="Search accounts"
              placeholderTextColor={semantic.textSecondary}
              style={[modalStyles.searchInput, { color: semantic.text }]}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              blurOnSubmit={false}
            />
            {accountQuery.length > 0 && (
              <Pressable onPress={() => setAccountQuery('')} hitSlop={8}>
                <FontAwesome name="times-circle" size={16} color={semantic.textSecondary} />
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
          contentContainerStyle={{ paddingBottom: getScrollContentPadding(insets.bottom) }}
          stickySectionHeadersEnabled={false}
          ListFooterComponent={
            <Pressable onPress={handleAddAccount} style={modalStyles.selectionAddRow}>
              <Text style={[modalStyles.selectionAddText, { color: semantic.primary }]}>
                Add Account
              </Text>
            </Pressable>
          }
        />
      </KeyboardAvoidingView>
    </Screen>
  )
}
