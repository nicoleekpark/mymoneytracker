/**
 * QuickChipsEditModal
 *
 * Modal for editing quick action chips - add, remove, reorder.
 */

import { CATEGORIES } from '@/shared/config'
import type { Account } from '@/core/domain/account'
import { useHoHTheme } from '@/shared/providers'
import { CategoryIcon } from '@/shared/components'
import { useQuickChipsStore, SPECIAL_CHIP_KEYS, type QuickChipConfig } from '@/shared/store'
import { fontSize, fontWeight, letterSpacing } from '@/shared/theme/tokens/typography'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { getSheetBottomPadding } from '@/shared/theme/tokens/modal'
import { BACKDROP } from '@/shared/theme/tokens/backdrop'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import React, { useCallback, useMemo } from 'react'
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { DraggableChipList, type ChipDisplayInfo } from './DraggableChipList'

type Props = {
  visible: boolean
  transactionType: 'expense' | 'income'
  accounts: Account[]
  onClose: () => void
}

export function QuickChipsEditModal({ visible, transactionType, accounts, onClose }: Props) {
  const theme = useHoHTheme()
  const insets = useSafeAreaInsets()

  const {
    expenseChips,
    incomeChips,
    addChip,
    removeChip,
    moveChip,
  } = useQuickChipsStore()

  const currentChips = transactionType === 'expense' ? expenseChips : incomeChips

  // Available categories for this transaction type
  const availableCategories = useMemo(() => {
    return CATEGORIES.filter(c => c.type === transactionType)
  }, [transactionType])

  // Build list of available items (not already in chips)
  const availableItems = useMemo(() => {
    const items: { type: 'category' | 'payment' | 'special'; key: string; subCategoryKey?: string; label: string; icon: string; color: string }[] = []

    // Special chips first - Repeat Last
    if (!currentChips.some(c => c.type === 'special' && c.key === SPECIAL_CHIP_KEYS.REPEAT_LAST)) {
      items.push({
        type: 'special',
        key: SPECIAL_CHIP_KEYS.REPEAT_LAST,
        label: 'Repeat Last',
        icon: 'repeat',
        color: '#5A7A8A',
      })
    }

    // Categories and subcategories not in current chips
    availableCategories.forEach(cat => {
      // Parent category (only if no subcategory version of it is in chips)
      if (!currentChips.some(c => c.type === 'category' && c.key === cat.key && !c.subCategoryKey)) {
        items.push({
          type: 'category',
          key: cat.key,
          label: cat.name,
          icon: cat.icon,
          color: cat.color,
        })
      }

      // Subcategories
      cat.subCategories?.forEach(sub => {
        if (!currentChips.some(c => c.type === 'category' && c.key === cat.key && c.subCategoryKey === sub.key)) {
          items.push({
            type: 'category',
            key: cat.key,
            subCategoryKey: sub.key,
            label: `${cat.name} › ${sub.name}`,
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
        return { key: chip.key, type: 'special', label: 'Repeat Last', icon: 'repeat', color: '#5A7A8A' }
      }
      return null
    } else if (chip.type === 'category') {
      const cat = CATEGORIES.find(c => c.key === chip.key)
      if (!cat) return null

      // If subcategory, find it and show combined label
      if (chip.subCategoryKey) {
        const sub = cat.subCategories?.find(s => s.key === chip.subCategoryKey)
        if (sub) {
          return {
            key: chip.key,
            subCategoryKey: chip.subCategoryKey,
            type: 'category',
            label: `${cat.name} › ${sub.name}`,
            icon: sub.icon,
            color: sub.color,
          }
        }
      }

      return { key: chip.key, type: 'category', label: cat.name, icon: cat.icon, color: cat.color }
    } else if (chip.type === 'payment') {
      const acc = accounts.find(a => a.key === chip.key)
      return acc ? {
        key: chip.key,
        type: 'payment',
        label: acc.name,
        icon: acc.kind === 'credit_card' ? 'credit-card' : acc.kind === 'cash' ? 'money' : 'bank',
        color: '#5A6A6A',
      } : null
    }
    return null
  }

  // Build chip display list for draggable component
  const chipDisplayList = useMemo((): ChipDisplayInfo[] => {
    return currentChips
      .map(chip => getChipDisplay(chip))
      .filter((d): d is ChipDisplayInfo => d !== null)
  }, [currentChips, accounts])

  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    moveChip(transactionType, fromIndex, toIndex)
  }, [transactionType, moveChip])

  const handleRemove = useCallback((chip: ChipDisplayInfo) => {
    removeChip(transactionType, chip.key, chip.subCategoryKey)
  }, [transactionType, removeChip])

  const handleAdd = (item: { type: 'category' | 'payment' | 'special'; key: string; subCategoryKey?: string }) => {
    addChip(transactionType, { type: item.type, key: item.key, subCategoryKey: item.subCategoryKey })
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.gestureRoot}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={[styles.sheet, { backgroundColor: theme.semantic.surface, paddingBottom: getSheetBottomPadding(insets.bottom) }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.semantic.border }]}>
            <Text style={[styles.headerTitle, { color: theme.semantic.text }]}>Edit Quick Actions</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={[styles.headerDone, { color: theme.semantic.primary }]}>Done</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Current Chips - Draggable */}
            <Text style={[styles.sectionTitle, { color: theme.semantic.textSecondary }]}>
              YOUR QUICK ACTIONS
            </Text>
            {chipDisplayList.length > 0 && (
              <Text style={[styles.dragHint, { color: theme.semantic.textSecondary }]}>
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
                <Text style={[styles.sectionTitle, { color: theme.semantic.textSecondary, marginTop: spacing.xl }]}>
                  ADD MORE
                </Text>
                <View style={[styles.chipsList, { backgroundColor: theme.semantic.surfaceAlt }]}>
                  {availableItems.map((item) => (
                    <Pressable
                      key={`${item.type}-${item.key}-${item.subCategoryKey ?? ''}`}
                      onPress={() => handleAdd(item)}
                      style={[styles.chipRow, styles.addRow, { borderBottomColor: theme.semantic.border }]}
                    >
                      <CategoryIcon name={item.icon} size={16} color={item.color} />
                      <Text style={[styles.chipLabel, { color: theme.semantic.text }]} numberOfLines={1}>
                        {item.label}
                      </Text>
                      <Text style={[styles.chipType, { color: theme.semantic.textSecondary }]}>
                        {item.type === 'special' ? 'Special' : item.subCategoryKey ? 'Subcategory' : 'Category'}
                      </Text>
                      <FontAwesome name="plus-circle" size={18} color={theme.semantic.primary} />
                    </Pressable>
                  ))}
                </View>
              </>
            )}
          </ScrollView>
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
    backgroundColor: BACKDROP.medium,
  },
  sheet: {
    maxHeight: '80%',
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
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.wider,
    marginBottom: spacing.sm,
  },
  dragHint: {
    fontSize: fontSize.xs,
    marginBottom: spacing.sm,
    marginTop: -spacing.xs,
  },
  chipsList: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    minHeight: 52,
  },
  addRow: {
    paddingLeft: spacing.lg,
  },
  chipLabel: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  chipType: {
    fontSize: fontSize.xs,
    marginRight: spacing.sm,
  },
  removeBtn: {
    padding: spacing.xs,
  },
  emptyText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
})
