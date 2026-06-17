/**
 * TransactionFilterSheet
 *
 * Bottom sheet for filtering transactions by type, category, etc.
 */

import FontAwesome from '@expo/vector-icons/FontAwesome'
import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
  type BottomSheetFooterProps,
} from '@gorhom/bottom-sheet'
import React, { useCallback, useMemo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { CATEGORIES } from '@/shared/config'
import { useHoHTheme } from '@/shared/providers'
import { HIT_SLOP_MD_VALUE } from '@/shared/theme/tokens/buttons'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import { modalStyles, MODAL_SNAP_FULL } from '@/shared/theme/tokens/modal'

export type TransactionType = 'expense' | 'income' | 'transfer'
export type DraftMode = 'hidden' | 'only' | 'all'

export type TransactionFilters = {
  types: TransactionType[]
  categoryKeys: string[]
  draftMode: DraftMode
}

export const DEFAULT_FILTERS: TransactionFilters = {
  types: [],
  categoryKeys: [],
  draftMode: 'hidden',
}

type TransactionFilterSheetProps = {
  sheetRef: React.RefObject<BottomSheetModal | null>
  filters: TransactionFilters
  onFiltersChange: (filters: TransactionFilters) => void
  draftCount: number
  onDismiss?: () => void
}

const TYPE_OPTIONS: { key: TransactionType; label: string; icon: string }[] = [
  { key: 'expense', label: 'Expenses', icon: 'arrow-down' },
  { key: 'income', label: 'Income', icon: 'arrow-up' },
  { key: 'transfer', label: 'Transfers', icon: 'exchange' },
]

export function TransactionFilterSheet({
  sheetRef,
  filters,
  onFiltersChange,
  draftCount,
  onDismiss,
}: TransactionFilterSheetProps) {
  const theme = useHoHTheme()
  const insets = useSafeAreaInsets()
  const snapPoints = MODAL_SNAP_FULL

  const handleApply = () => {
    sheetRef.current?.dismiss()
  }

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  )

  const activeCount =
    filters.types.length + filters.categoryKeys.length + (filters.draftMode !== 'hidden' ? 1 : 0)

  // Tab bar height + some padding to ensure button is fully visible
  // const TAB_BAR_HEIGHT = 5
  const footerBottomPadding = Math.max(insets.bottom)

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props} bottomInset={0}>
        <View
          style={[
            styles.footer,
            {
              backgroundColor: theme.semantic.surface,
              borderTopColor: theme.semantic.border,
              paddingBottom: footerBottomPadding,
            },
          ]}
        >
          <Pressable
            onPress={handleApply}
            style={[modalStyles.ctaPrimaryButton, { backgroundColor: theme.semantic.primary }]}
          >
            <Text style={[modalStyles.ctaPrimaryText, { color: theme.semantic.onPrimary }]}>
              Apply{activeCount > 0 ? ` (${activeCount})` : ''}
            </Text>
          </Pressable>
        </View>
      </BottomSheetFooter>
    ),
    [theme, activeCount, handleApply, footerBottomPadding]
  )

  const toggleType = (type: TransactionType) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type]
    onFiltersChange({ ...filters, types: newTypes })
  }

  const toggleCategory = (categoryKey: string) => {
    const newCategories = filters.categoryKeys.includes(categoryKey)
      ? filters.categoryKeys.filter((c) => c !== categoryKey)
      : [...filters.categoryKeys, categoryKey]
    onFiltersChange({ ...filters, categoryKeys: newCategories })
  }

  const setDraftMode = (mode: DraftMode) => {
    onFiltersChange({ ...filters, draftMode: mode })
  }

  const clearAll = () => {
    onFiltersChange(DEFAULT_FILTERS)
  }

  // Get unique expense categories
  const expenseCategories = useMemo(() => CATEGORIES.filter((c) => c.type === 'expense'), [])

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}
      onDismiss={onDismiss}
      backgroundStyle={[
        modalStyles.modal,
        {
          backgroundColor: theme.semantic.surface,
          borderWidth: 0,
          shadowOpacity: 0,
          elevation: 0,
        },
      ]}
      handleIndicatorStyle={{ backgroundColor: theme.semantic.border }}
    >
      <BottomSheetScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.semantic.text }]}>Filters</Text>
          {activeCount > 0 && (
            <Pressable onPress={clearAll} hitSlop={HIT_SLOP_MD_VALUE}>
              <Text style={[styles.clearBtn, { color: theme.semantic.primary }]}>Clear all</Text>
            </Pressable>
          )}
        </View>

        {/* Transaction Type */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.semantic.textSecondary }]}>Type</Text>
          <View style={styles.chipRow}>
            {TYPE_OPTIONS.map((opt) => {
              const selected = filters.types.includes(opt.key)
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => toggleType(opt.key)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected
                        ? theme.semantic.primarySoft
                        : theme.semantic.surfaceAlt,
                      borderColor: selected ? theme.semantic.primary : theme.semantic.border,
                    },
                  ]}
                >
                  <FontAwesome
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- FontAwesome icon name typing
                    name={opt.icon as any}
                    size={12}
                    color={selected ? theme.semantic.primary : theme.semantic.textSecondary}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      { color: selected ? theme.semantic.primary : theme.semantic.text },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.semantic.textSecondary }]}>
            Category
          </Text>
          <View style={styles.chipRow}>
            {expenseCategories.map((cat) => {
              const selected = filters.categoryKeys.includes(cat.key)
              return (
                <Pressable
                  key={cat.key}
                  onPress={() => toggleCategory(cat.key)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected
                        ? theme.semantic.primarySoft
                        : theme.semantic.surfaceAlt,
                      borderColor: selected ? theme.semantic.primary : theme.semantic.border,
                    },
                  ]}
                >
                  <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                  <Text
                    style={[
                      styles.chipText,
                      { color: selected ? theme.semantic.primary : theme.semantic.text },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>

        {/* Drafts */}
        {draftCount > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.semantic.textSecondary }]}>
              Drafts ({draftCount})
            </Text>
            <View style={styles.chipRow}>
              {/* Hidden */}
              <Pressable
                onPress={() => setDraftMode('hidden')}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      filters.draftMode === 'hidden'
                        ? theme.semantic.surfaceAlt
                        : theme.semantic.surfaceAlt,
                    borderColor:
                      filters.draftMode === 'hidden'
                        ? theme.semantic.text
                        : theme.semantic.border,
                  },
                ]}
              >
                <FontAwesome
                  name="eye-slash"
                  size={12}
                  color={
                    filters.draftMode === 'hidden'
                      ? theme.semantic.text
                      : theme.semantic.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.chipText,
                    {
                      color:
                        filters.draftMode === 'hidden'
                          ? theme.semantic.text
                          : theme.semantic.textSecondary,
                    },
                  ]}
                >
                  Hidden
                </Text>
              </Pressable>

              {/* Only Drafts */}
              <Pressable
                onPress={() => setDraftMode('only')}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      filters.draftMode === 'only'
                        ? theme.semantic.warningSoft
                        : theme.semantic.surfaceAlt,
                    borderColor:
                      filters.draftMode === 'only'
                        ? theme.semantic.warning
                        : theme.semantic.border,
                  },
                ]}
              >
                <FontAwesome
                  name="file-text-o"
                  size={12}
                  color={
                    filters.draftMode === 'only'
                      ? theme.semantic.warning
                      : theme.semantic.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.chipText,
                    {
                      color:
                        filters.draftMode === 'only'
                          ? theme.semantic.warning
                          : theme.semantic.textSecondary,
                    },
                  ]}
                >
                  Only Drafts
                </Text>
              </Pressable>

              {/* All (with drafts at top) */}
              <Pressable
                onPress={() => setDraftMode('all')}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      filters.draftMode === 'all'
                        ? theme.semantic.primarySoft
                        : theme.semantic.surfaceAlt,
                    borderColor:
                      filters.draftMode === 'all'
                        ? theme.semantic.primary
                        : theme.semantic.border,
                  },
                ]}
              >
                <FontAwesome
                  name="list"
                  size={12}
                  color={
                    filters.draftMode === 'all'
                      ? theme.semantic.primary
                      : theme.semantic.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.chipText,
                    {
                      color:
                        filters.draftMode === 'all'
                          ? theme.semantic.primary
                          : theme.semantic.textSecondary,
                    },
                  ]}
                >
                  All
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  )
}

export function getActiveFilterCount(filters: TransactionFilters): number {
  return filters.types.length + filters.categoryKeys.length + (filters.draftMode !== 'hidden' ? 1 : 0)
}

export type ActiveFilterChip = {
  key: string
  label: string
  type: 'type' | 'category' | 'status'
  color?: string
}

export function getActiveFilterChips(filters: TransactionFilters): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = []

  // Type chips
  for (const t of filters.types) {
    const opt = TYPE_OPTIONS.find((o) => o.key === t)
    if (opt) {
      chips.push({ key: `type-${t}`, label: opt.label, type: 'type' })
    }
  }

  // Category chips
  for (const catKey of filters.categoryKeys) {
    const cat = CATEGORIES.find((c) => c.key === catKey)
    if (cat) {
      chips.push({ key: `cat-${catKey}`, label: cat.name, type: 'category', color: cat.color })
    }
  }

  // Drafts chip
  if (filters.draftMode === 'only') {
    chips.push({ key: 'drafts', label: 'Only Drafts', type: 'status' })
  } else if (filters.draftMode === 'all') {
    chips.push({ key: 'drafts', label: 'Drafts', type: 'status' })
  }

  return chips
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 100, // Extra space for sticky footer
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  clearBtn: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  section: {
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bottomSpacer: {
    height: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
})
