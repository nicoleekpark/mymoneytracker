/**
 * PaymentChipsReorderModal
 *
 * Modal for reordering payment method chips (drag-and-drop only, no add/remove).
 */

import type { Account } from '@/core/domain/account'
import { useHoHTheme } from '@/shared/providers'
import { CategoryIcon } from '@/shared/components'
import { usePaymentChipsOrderStore, getOrderedAccounts } from '@/shared/store'
import { fontSize, fontWeight, letterSpacing } from '@/shared/theme/tokens/typography'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import React, { useCallback, useMemo } from 'react'
import {
  Modal,
  Pressable,
  StyleSheet,
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
      <GestureHandlerRootView style={styles.gestureRoot}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={[styles.sheet, { backgroundColor: theme.semantic.surface, paddingBottom: insets.bottom + spacing.lg }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.semantic.border }]}>
            <Text style={[styles.headerTitle, { color: theme.semantic.text }]}>Reorder Payment Methods</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={[styles.headerDone, { color: theme.semantic.primary }]}>Done</Text>
            </Pressable>
          </View>

          <View style={styles.content}>
            <Text style={[styles.dragHint, { color: theme.semantic.textSecondary }]}>
              Hold and drag to reorder
            </Text>
            <DraggableChipList
              chips={chipDisplayList}
              onReorder={handleReorder}
              onRemove={handleRemove}
              showRemoveButton={false}
            />
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    maxHeight: '70%',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  headerDone: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  content: {
    padding: spacing.lg,
  },
  dragHint: {
    fontSize: fontSize.xs,
    marginBottom: spacing.md,
  },
})
