/**
 * QuickChipsEditModal
 *
 * Modal for editing quick action chips - add, remove, reorder.
 */

import type { Account } from '@/core/domain/account'
import { CategoryIcon } from '@/shared/components'
import { CATEGORIES } from '@/shared/config'
import { useHoHTheme } from '@/shared/providers'
import { SPECIAL_CHIP_KEYS, useQuickChipsStore, type QuickChipConfig } from '@/shared/store'
import { chipEditStyles } from '@/shared/theme/tokens/modal'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import React, { useCallback, useMemo } from 'react'
import { Pressable, Text, View } from 'react-native'
import { ChipEditModalShell } from './ChipEditModalShell'
import { DraggableChipList, type ChipDisplayInfo } from './DraggableChipList'

type Props = {
  visible: boolean
  transactionType: 'expense' | 'income'
  accounts: Account[]
  onClose: () => void
}

export function QuickChipsEditModal({ visible, transactionType, accounts, onClose }: Props) {
  const theme = useHoHTheme()

  const { expenseChips, incomeChips, addChip, removeChip, moveChip } = useQuickChipsStore()

  const currentChips = transactionType === 'expense' ? expenseChips : incomeChips

  // Available categories for this transaction type
  const availableCategories = useMemo(() => {
    return CATEGORIES.filter((c) => c.type === transactionType)
  }, [transactionType])

  // Build list of available items (not already in chips)
  const availableItems = useMemo(() => {
    const items: {
      type: 'category' | 'payment' | 'special'
      key: string
      subCategoryKey?: string
      label: string
      parentLabel?: string
      icon: string
      color: string
    }[] = []

    // Special chips first - Repeat Last
    if (
      !currentChips.some((c) => c.type === 'special' && c.key === SPECIAL_CHIP_KEYS.REPEAT_LAST)
    ) {
      items.push({
        type: 'special',
        key: SPECIAL_CHIP_KEYS.REPEAT_LAST,
        label: 'Repeat Last',
        icon: 'repeat',
        color: '#5A7A8A',
      })
    }

    // Categories and subcategories not in current chips
    availableCategories.forEach((cat) => {
      // Parent category (only if no subcategory version of it is in chips)
      if (
        !currentChips.some((c) => c.type === 'category' && c.key === cat.key && !c.subCategoryKey)
      ) {
        items.push({
          type: 'category',
          key: cat.key,
          label: cat.name,
          icon: cat.icon,
          color: cat.color,
        })
      }

      // Subcategories
      cat.subCategories?.forEach((sub) => {
        if (
          !currentChips.some(
            (c) => c.type === 'category' && c.key === cat.key && c.subCategoryKey === sub.key
          )
        ) {
          items.push({
            type: 'category',
            key: cat.key,
            subCategoryKey: sub.key,
            label: sub.name,
            parentLabel: cat.name,
            icon: sub.icon,
            color: sub.color,
          })
        }
      })
    })

    // Note: Payment methods are managed separately in PaymentChipsReorderModal

    return items
  }, [availableCategories, currentChips])

  // Get display info for a chip config
  const getChipDisplay = (chip: QuickChipConfig): ChipDisplayInfo | null => {
    if (chip.type === 'special') {
      if (chip.key === SPECIAL_CHIP_KEYS.REPEAT_LAST) {
        return {
          key: chip.key,
          type: 'special',
          label: 'Repeat Last',
          icon: 'repeat',
          color: '#5A7A8A',
        }
      }
      return null
    } else if (chip.type === 'category') {
      const cat = CATEGORIES.find((c) => c.key === chip.key)
      if (!cat) return null

      // If subcategory, show on two lines
      if (chip.subCategoryKey) {
        const sub = cat.subCategories?.find((s) => s.key === chip.subCategoryKey)
        if (sub) {
          return {
            key: chip.key,
            subCategoryKey: chip.subCategoryKey,
            type: 'category',
            label: sub.name,
            parentLabel: cat.name,
            icon: sub.icon,
            color: sub.color,
          }
        }
      }

      return { key: chip.key, type: 'category', label: cat.name, icon: cat.icon, color: cat.color }
    } else if (chip.type === 'payment') {
      const acc = accounts.find((a) => a.key === chip.key)
      return acc
        ? {
            key: chip.key,
            type: 'payment',
            label: acc.name,
            icon:
              acc.kind === 'credit_card' ? 'credit-card' : acc.kind === 'cash' ? 'money' : 'bank',
            color: '#5A6A6A',
          }
        : null
    }
    return null
  }

  // Build chip display list for draggable component
  const chipDisplayList = useMemo((): ChipDisplayInfo[] => {
    return currentChips
      .map((chip) => getChipDisplay(chip))
      .filter((d): d is ChipDisplayInfo => d !== null)
  }, [currentChips, accounts])

  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      moveChip(transactionType, fromIndex, toIndex)
    },
    [transactionType, moveChip]
  )

  const handleRemove = useCallback(
    (chip: ChipDisplayInfo) => {
      removeChip(transactionType, chip.key, chip.subCategoryKey)
    },
    [transactionType, removeChip]
  )

  const handleAdd = (item: {
    type: 'category' | 'payment' | 'special'
    key: string
    subCategoryKey?: string
  }) => {
    addChip(transactionType, {
      type: item.type,
      key: item.key,
      subCategoryKey: item.subCategoryKey,
    })
  }

  return (
    <ChipEditModalShell visible={visible} title="Reorder Categories" onClose={onClose}>
      {/* Current Chips - Draggable */}
      <Text style={[chipEditStyles.sectionTitle, { color: theme.semantic.textSecondary }]}>
        YOUR CATEGORIES
      </Text>
      {chipDisplayList.length > 0 && (
        <Text style={[chipEditStyles.dragHint, { color: theme.semantic.textSecondary }]}>
          Hold and drag to reorder
        </Text>
      )}
      <DraggableChipList
        chips={chipDisplayList}
        onReorder={handleReorder}
        onRemove={handleRemove}
      />

      {/* Available to Add */}
      {availableItems.length > 0 && (
        <>
          <Text
            style={[chipEditStyles.sectionTitleWithMargin, { color: theme.semantic.textSecondary }]}
          >
            ADD MORE
          </Text>
          <View style={[chipEditStyles.chipsList, { backgroundColor: theme.semantic.surfaceAlt }]}>
            {availableItems.map((item) => (
              <Pressable
                key={`${item.type}-${item.key}-${item.subCategoryKey ?? ''}`}
                onPress={() => handleAdd(item)}
                style={[
                  chipEditStyles.chipRow,
                  chipEditStyles.chipRowAdd,
                  { borderBottomColor: theme.semantic.border },
                ]}
              >
                <CategoryIcon name={item.icon} size={16} color={item.color} />
                <View style={chipEditStyles.labelContainer}>
                  {item.parentLabel && (
                    <Text
                      style={[chipEditStyles.parentLabel, { color: theme.semantic.textSecondary }]}
                      numberOfLines={1}
                    >
                      {item.parentLabel}
                    </Text>
                  )}
                  <Text
                    style={[chipEditStyles.chipLabel, { color: theme.semantic.text }]}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                </View>
                <Text style={[chipEditStyles.chipType, { color: theme.semantic.textSecondary }]}>
                  {item.type === 'special'
                    ? 'Special'
                    : item.subCategoryKey
                      ? 'Subcategory'
                      : 'Category'}
                </Text>
                <FontAwesome name="plus-circle" size={18} color={theme.semantic.primary} />
              </Pressable>
            ))}
          </View>
        </>
      )}
    </ChipEditModalShell>
  )
}
