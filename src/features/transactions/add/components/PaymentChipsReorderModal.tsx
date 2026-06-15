/**
 * PaymentChipsReorderModal
 *
 * Modal for reordering payment method chips (drag-and-drop only, no add/remove).
 */

import type { Account } from '@/core/domain/account'
import { useHoHTheme } from '@/shared/providers'
import { usePaymentChipsOrderStore, getOrderedAccounts } from '@/shared/store'
import { chipEditStyles, getSheetBottomPadding } from '@/shared/theme/tokens/modal'
import React, { useCallback, useMemo } from 'react'
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { DraggableChipList, type ChipDisplayInfo } from './DraggableChipList'

type Props = {
  visible: boolean
  accounts: Account[]
  onClose: () => void
}

export function PaymentChipsReorderModal({ visible, accounts, onClose }: Props) {
  const theme = useHoHTheme()
  const insets = useSafeAreaInsets()

  const { orderedKeys, moveChip } = usePaymentChipsOrderStore()

  // Get ordered accounts
  const orderedAccounts = useMemo(() => {
    return getOrderedAccounts(accounts, orderedKeys)
  }, [accounts, orderedKeys])

  // Build chip display list for draggable component
  const chipDisplayList = useMemo((): ChipDisplayInfo[] => {
    return orderedAccounts.map(acc => ({
      key: acc.key,
      type: 'payment' as const,
      label: acc.name,
      icon: acc.kind === 'credit_card' ? 'credit-card' : acc.kind === 'cash' ? 'money' : 'bank',
      color: '#5A6A6A',
    }))
  }, [orderedAccounts])

  // Get all account keys for moveChip
  const allAccountKeys = useMemo(() => accounts.map(a => a.key), [accounts])

  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    moveChip(fromIndex, toIndex, allAccountKeys)
  }, [moveChip, allAccountKeys])

  // No remove functionality - just reorder
  const handleRemove = useCallback(() => {
    // Intentionally empty - no remove for payment chips
  }, [])

  if (accounts.length === 0) {
    return null
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <GestureHandlerRootView style={chipEditStyles.gestureRoot}>
        <Pressable style={chipEditStyles.backdrop} onPress={onClose} />

        <View style={[chipEditStyles.sheet, { backgroundColor: theme.semantic.surface, paddingBottom: getSheetBottomPadding(insets.bottom) }]}>
          {/* Header */}
          <View style={[chipEditStyles.header, { borderBottomColor: theme.semantic.border }]}>
            <Text style={[chipEditStyles.headerTitle, { color: theme.semantic.text }]}>Reorder Payment Methods</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={[chipEditStyles.headerDone, { color: theme.semantic.primary }]}>Done</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={chipEditStyles.content} showsVerticalScrollIndicator={false}>
            {/* Section title - matching QuickChipsEditModal */}
            <Text style={[chipEditStyles.sectionTitle, { color: theme.semantic.textSecondary }]}>
              YOUR PAYMENT METHODS
            </Text>
            <Text style={[chipEditStyles.dragHint, { color: theme.semantic.textSecondary }]}>
              Hold and drag to reorder
            </Text>
            <DraggableChipList
              chips={chipDisplayList}
              onReorder={handleReorder}
              onRemove={handleRemove}
              showRemoveButton={false}
            />
          </ScrollView>
        </View>
      </GestureHandlerRootView>
    </Modal>
  )
}

