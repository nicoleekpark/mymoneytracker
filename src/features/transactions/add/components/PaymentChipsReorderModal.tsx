/**
 * PaymentChipsReorderModal
 *
 * Modal for reordering payment method chips (drag-and-drop only, no add/remove).
 */

import type { Account } from '@/core/domain/account'
import { useHoHTheme } from '@/shared/providers'
import { usePaymentChipsOrderStore, getOrderedAccounts } from '@/shared/store'
import { chipEditStyles } from '@/shared/theme/tokens/modal'
import React, { useCallback, useEffect, useMemo } from 'react'
import { Text } from 'react-native'
import { ChipEditModalShell } from './ChipEditModalShell'
import { DraggableChipList, type ChipDisplayInfo } from './DraggableChipList'

type Props = {
  visible: boolean
  accounts: Account[]
  onClose: () => void
}

export function PaymentChipsReorderModal({ visible, accounts, onClose }: Props) {
  const theme = useHoHTheme()

  // Use explicit selectors to ensure proper Zustand subscription
  const orderedKeys = usePaymentChipsOrderStore((state) => state.orderedKeys)
  const setOrder = usePaymentChipsOrderStore((state) => state.setOrder)
  const moveChipInOrder = usePaymentChipsOrderStore((state) => state.moveChipInOrder)

  // Initialize or repair orderedKeys when modal opens
  // This ensures moveChipInOrder has clean data to work with
  useEffect(() => {
    if (!visible || accounts.length === 0) return

    // Check for corrupted data (null values in orderedKeys)
    const hasNulls = orderedKeys?.some((k) => k === null || k === undefined)
    if (hasNulls) {
      // Rebuild clean order: keep valid keys in their order, append any missing accounts
      const validKeys = (orderedKeys ?? []).filter((k): k is string => k != null)
      const accountKeys = accounts.map((a) => a.key)
      const orderedValid = validKeys.filter((k) => accountKeys.includes(k))
      const missing = accountKeys.filter((k) => !orderedValid.includes(k))
      setOrder([...orderedValid, ...missing])
      return
    }

    // Initialize if not set
    if (!orderedKeys || orderedKeys.length === 0) {
      setOrder(accounts.map((a) => a.key))
    }
  }, [visible, accounts, orderedKeys, setOrder])

  // Get ordered accounts (computed fresh each render)
  const orderedAccounts = useMemo(
    () => getOrderedAccounts(accounts, orderedKeys),
    [accounts, orderedKeys]
  )

  // Build chip display list for draggable component
  const chipDisplayList: ChipDisplayInfo[] = useMemo(
    () =>
      orderedAccounts.map((acc) => ({
        key: acc.key,
        type: 'payment' as const,
        label: acc.name,
        icon: acc.kind === 'credit_card' ? 'credit-card' : acc.kind === 'cash' ? 'money' : 'bank',
        color: '#5A6A6A',
      })),
    [orderedAccounts]
  )

  // Use stable callback that calls store action directly (same pattern as QuickChipsEditModal)
  // The store's moveChipInOrder uses get() internally, avoiding stale closure issues
  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      moveChipInOrder(fromIndex, toIndex)
    },
    [moveChipInOrder]
  )

  // No remove functionality - just reorder
  const handleRemove = useCallback(() => {
    // Intentionally empty - no remove for payment chips
  }, [])

  if (accounts.length === 0) {
    return null
  }

  return (
    <ChipEditModalShell visible={visible} title="Reorder Payment Methods" onClose={onClose}>
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
    </ChipEditModalShell>
  )
}
