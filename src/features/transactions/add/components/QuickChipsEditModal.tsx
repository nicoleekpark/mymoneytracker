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
import FontAwesome from '@expo/vector-icons/FontAwesome'
import React, { useMemo } from 'react'
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

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

    // Payment methods not in current chips (only for expense)
    if (transactionType === 'expense') {
      accounts.forEach(acc => {
        if (!currentChips.some(c => c.type === 'payment' && c.key === acc.key)) {
          items.push({
            type: 'payment',
            key: acc.key,
            label: acc.name,
            icon: acc.kind === 'credit_card' ? 'credit-card' : acc.kind === 'cash' ? 'money' : 'bank',
            color: '#5A6A6A',
          })
        }
      })
    }

    return items
  }, [availableCategories, accounts, currentChips, transactionType])

  // Get display info for a chip config
  const getChipDisplay = (chip: QuickChipConfig) => {
    if (chip.type === 'special') {
      if (chip.key === SPECIAL_CHIP_KEYS.REPEAT_LAST) {
        return { label: 'Repeat Last', icon: 'repeat', color: '#5A7A8A' }
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
            label: `${cat.name} › ${sub.name}`,
            icon: sub.icon,
            color: sub.color,
          }
        }
      }

      return { label: cat.name, icon: cat.icon, color: cat.color }
    } else if (chip.type === 'payment') {
      const acc = accounts.find(a => a.key === chip.key)
      return acc ? {
        label: acc.name,
        icon: acc.kind === 'credit_card' ? 'credit-card' : acc.kind === 'cash' ? 'money' : 'bank',
        color: '#5A6A6A',
      } : null
    }
    return null
  }

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      moveChip(transactionType, index, index - 1)
    }
  }

  const handleMoveDown = (index: number) => {
    if (index < currentChips.length - 1) {
      moveChip(transactionType, index, index + 1)
    }
  }

  const handleRemove = (chip: QuickChipConfig) => {
    removeChip(transactionType, chip.key, chip.subCategoryKey)
  }

  const handleAdd = (item: { type: 'category' | 'payment' | 'special'; key: string; subCategoryKey?: string }) => {
    addChip(transactionType, { type: item.type, key: item.key, subCategoryKey: item.subCategoryKey })
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={[styles.sheet, { backgroundColor: theme.semantic.surface, paddingBottom: insets.bottom + spacing.lg }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.semantic.border }]}>
          <Text style={[styles.headerTitle, { color: theme.semantic.text }]}>Edit Quick Actions</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Text style={[styles.headerDone, { color: theme.semantic.primary }]}>Done</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Current Chips */}
          <Text style={[styles.sectionTitle, { color: theme.semantic.textSecondary }]}>
            YOUR QUICK ACTIONS
          </Text>
          <View style={[styles.chipsList, { backgroundColor: theme.semantic.surfaceAlt }]}>
            {currentChips.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.semantic.textSecondary }]}>
                No quick actions. Add some below.
              </Text>
            ) : (
              currentChips.map((chip, index) => {
                const display = getChipDisplay(chip)
                if (!display) return null

                return (
                  <View
                    key={`${chip.type}-${chip.key}-${chip.subCategoryKey ?? ''}`}
                    style={[styles.chipRow, { borderBottomColor: theme.semantic.border }]}
                  >
                    {/* Reorder buttons */}
                    <View style={styles.reorderButtons}>
                      <Pressable
                        onPress={() => handleMoveUp(index)}
                        disabled={index === 0}
                        style={[styles.reorderBtn, { opacity: index === 0 ? 0.3 : 1 }]}
                        hitSlop={8}
                      >
                        <FontAwesome name="chevron-up" size={12} color={theme.semantic.textSecondary} />
                      </Pressable>
                      <Pressable
                        onPress={() => handleMoveDown(index)}
                        disabled={index === currentChips.length - 1}
                        style={[styles.reorderBtn, { opacity: index === currentChips.length - 1 ? 0.3 : 1 }]}
                        hitSlop={8}
                      >
                        <FontAwesome name="chevron-down" size={12} color={theme.semantic.textSecondary} />
                      </Pressable>
                    </View>

                    {/* Chip info */}
                    <CategoryIcon name={display.icon} size={16} color={display.color} />
                    <Text style={[styles.chipLabel, { color: theme.semantic.text }]} numberOfLines={1}>
                      {display.label}
                    </Text>
                    <Text style={[styles.chipType, { color: theme.semantic.textSecondary }]}>
                      {chip.type === 'special' ? 'Special' : chip.subCategoryKey ? 'Subcategory' : chip.type === 'category' ? 'Category' : 'Payment'}
                    </Text>

                    {/* Remove button */}
                    <Pressable onPress={() => handleRemove(chip)} hitSlop={8} style={styles.removeBtn}>
                      <FontAwesome name="times-circle" size={18} color={theme.semantic.danger} />
                    </Pressable>
                  </View>
                )
              })
            )}
          </View>

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
                      {item.type === 'special' ? 'Special' : item.subCategoryKey ? 'Subcategory' : item.type === 'category' ? 'Category' : 'Payment'}
                    </Text>
                    <FontAwesome name="plus-circle" size={18} color={theme.semantic.primary} />
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
  reorderButtons: {
    flexDirection: 'column',
    gap: 2,
    marginRight: spacing.xs,
  },
  reorderBtn: {
    padding: 4,
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
