/**
 * AddAssetScreen
 *
 * Design matches AddAccountScreen exactly:
 * - Top tabs for field type (Assets, Liabilities)
 * - Chips for category selection
 * - Hero name input
 * - Value field
 */

import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import type { AssetCategory } from '@/core/domain/asset'
import { getCategoryMeta } from '@/core/domain/asset'
import { createAssetItem, getCurrentYearMonth, setBalance } from '@/core/services/asset'
import { AmountKeypadSheet, ModalSaveBar } from '@/shared/components'
import { formatCentsForDisplay } from '@/shared/format/currency'
import { useKeyboardHeight } from '@/shared/hooks'
import { Screen } from '@/shared/layout/Screen'
import { useHoHTheme } from '@/shared/providers'
import { useDataRefreshStore } from '@/shared/store'
import {
  getFieldLabelColor,
  getScrollContentWithSimpleCTAPadding,
  MODAL_TOAST_DURATION,
  modalStyles,
  selectionStyles,
} from '@/shared/theme/tokens/modal'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'

// ─── Tab Structure (matches AddAccountScreen pattern) ─────────────────────────

type AssetTab = 'assets' | 'liabilities'

const ASSET_TABS: { key: AssetTab; label: string }[] = [
  { key: 'assets', label: 'Assets' },
  { key: 'liabilities', label: 'Liabilities' },
]

/**
 * Categories per tab
 *
 * Note: Retirement accounts, investment accounts, and loans are added via
 * "Add Account" and automatically appear in Assets tab. This modal is for
 * assets/liabilities that aren't transaction-based (property values, valuables, etc.)
 */
const CATEGORIES_BY_TAB: Record<AssetTab, { key: AssetCategory; label: string; icon: string }[]> = {
  assets: [
    { key: 'real_estate', label: 'Real Estate', icon: 'home' },
    { key: 'other', label: 'Other', icon: 'ellipsis-h' }, // Vehicles, collectibles, etc.
  ],
  liabilities: [
    { key: 'other', label: 'Other', icon: 'ellipsis-h' }, // Informal debts
  ],
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AddAssetScreen() {
  const theme = useHoHTheme()
  const insets = useSafeAreaInsets()
  const { semantic } = theme
  const { invalidateAssets } = useDataRefreshStore()
  const nameInputRef = useRef<TextInput>(null)
  const scrollViewRef = useRef<ScrollView>(null)

  // Keyboard height for ScrollView padding
  const keyboardHeight = useKeyboardHeight()

  // Form state
  const [tab, setTab] = useState<AssetTab>('assets')
  const [category, setCategory] = useState<AssetCategory>('real_estate')
  const [name, setName] = useState('')
  const [nameFocused, setNameFocused] = useState(false)
  const [valueCents, setValueCents] = useState(0)
  const [showKeypad, setShowKeypad] = useState(false)
  const [isAccessible, setIsAccessible] = useState(false)

  // UI state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastKey, setToastKey] = useState(0)
  const [highlightName, setHighlightName] = useState(false)
  const [showAccessibleInfo, setShowAccessibleInfo] = useState(false)

  // Timeout refs
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current)
    }
  }, [])

  // Auto-select first category when tab changes
  useEffect(() => {
    const categories = CATEGORIES_BY_TAB[tab]
    if (categories.length > 0) {
      setCategory(categories[0].key)
    }
    setName('')
    setValueCents(0)
    setIsAccessible(false)
  }, [tab])

  const showToast = useCallback((message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    setToastMessage(message)
    setToastKey((k) => k + 1)
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), MODAL_TOAST_DURATION)
  }, [])

  // Derived state
  const isLiability = tab === 'liabilities'
  const derivedField = isLiability
    ? 'liabilities'
    : category === 'real_estate'
      ? 'fixed_assets'
      : 'current_assets'
  const selectedMeta = useMemo(
    () => getCategoryMeta(category, derivedField),
    [category, derivedField]
  )
  const valueDisplay = formatCentsForDisplay(valueCents)
  const canSubmit = name.trim().length > 0
  const categories = CATEGORIES_BY_TAB[tab]

  const handleCancel = useCallback(() => {
    Keyboard.dismiss()
    router.back()
  }, [])

  // Amount keypad handlers
  const handleKeypadDigit = useCallback((digit: string) => {
    setValueCents((prev) => {
      let next = prev
      for (const d of digit) {
        next = next * 10 + parseInt(d, 10)
      }
      return next > 9999999999 ? prev : next
    })
  }, [])

  const handleKeypadBackspace = useCallback(() => {
    setValueCents((prev) => Math.floor(prev / 10))
  }, [])

  const handleKeypadClear = useCallback(() => {
    setValueCents(0)
  }, [])

  const handleKeypadDone = useCallback(() => {
    setShowKeypad(false)
  }, [])

  const handleSubmit = useCallback(() => {
    const trimmedName = name.trim()

    if (!trimmedName) {
      showToast('Please enter a name')
      setHighlightName(true)
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current)
      highlightTimeoutRef.current = setTimeout(() => setHighlightName(false), 2000)
      return
    }

    if (!selectedMeta) return

    Keyboard.dismiss()

    try {
      // Determine field based on tab, not getCategoryMeta (which may return wrong field for 'other')
      const field = isLiability
        ? 'liabilities'
        : category === 'real_estate'
          ? 'fixed_assets'
          : 'current_assets'
      // For 'other' category, use user's selection for isLiquidifiable
      const liquidifiable = category === 'other' ? isAccessible : undefined
      const newAsset = createAssetItem(field, category, trimmedName, null, liquidifiable)

      if (valueCents > 0) {
        const dollars = valueCents / 100
        const finalBalance = isLiability ? -dollars : dollars
        setBalance(newAsset.id, getCurrentYearMonth(), finalBalance)
      }

      invalidateAssets()
      router.back()
    } catch (error) {
      console.error('AddAssetScreen: Failed to create asset', error)
      const message = error instanceof Error ? error.message : 'Failed to create asset'
      showToast(message)
    }
  }, [
    name,
    category,
    selectedMeta,
    valueCents,
    isLiability,
    isAccessible,
    invalidateAssets,
    showToast,
  ])

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
      <View
        style={[
          modalStyles.header,
          {
            justifyContent: 'space-between',
            borderBottomWidth: 0,
          },
        ]}
      >
        <Pressable onPress={handleCancel} hitSlop={12} style={modalStyles.cancelButton}>
          <Text style={[modalStyles.cancelText, { color: semantic.primary }]}>‹ Back</Text>
        </Pressable>
        <Text style={[localStyles.headerTitle, { color: semantic.text }]}>Add Asset</Text>
        <View style={{ minWidth: 50 }} />
      </View>
      <View style={{ height: 1, backgroundColor: semantic.border }} />

      {/* Tab Bar - matches AddAccountScreen */}
      <View style={[modalStyles.typeTabs, { borderBottomColor: semantic.border }]}>
        {ASSET_TABS.map((t) => {
          const selected = t.key === tab
          return (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[
                modalStyles.typeTab,
                { borderBottomColor: selected ? semantic.primary : 'transparent' },
              ]}
            >
              <Text
                style={[
                  modalStyles.typeTabText,
                  {
                    color: selected ? semantic.text : semantic.textSecondary,
                    fontWeight: selected ? '700' : '500',
                  },
                ]}
              >
                {t.label}
              </Text>
            </Pressable>
          )
        })}
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={[
          modalStyles.content,
          // Note: safeAreaBottom=0 because iOS card-style modals already handle safe area
          { paddingBottom: getScrollContentWithSimpleCTAPadding(0, keyboardHeight) },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero: Name Input */}
        <View
          style={[
            localStyles.heroContainer,
            highlightName && { backgroundColor: (semantic.warning ?? semantic.danger) + '15' },
          ]}
        >
          <View style={localStyles.heroInputWrapper}>
            {!name && !nameFocused && (
              <Text style={[localStyles.heroPlaceholder, { color: semantic.textSecondary }]}>
                {getNamePlaceholder(category)}
              </Text>
            )}
            <TextInput
              ref={nameInputRef}
              value={name}
              onChangeText={setName}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              style={[
                localStyles.heroInput,
                {
                  color: semantic.text,
                  borderBottomColor: highlightName
                    ? (semantic.warning ?? semantic.danger)
                    : name
                      ? semantic.primary
                      : semantic.border,
                },
              ]}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
            />
          </View>
          <Text style={[localStyles.heroHint, { color: semantic.textSecondary }]}>
            This is how it will appear in your list
          </Text>
        </View>

        {/* Category Chips - matches AddAccountScreen subtype chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: spacing.lg }}
          contentContainerStyle={{ gap: spacing.sm, paddingVertical: spacing.xs }}
        >
          {categories.map((cat) => {
            const selected = category === cat.key
            return (
              <Pressable
                key={cat.key}
                onPress={() => setCategory(cat.key)}
                style={[
                  selectionStyles.selectionChip,
                  {
                    backgroundColor: selected ? semantic.primary + '20' : semantic.surfaceAlt,
                    borderColor: selected ? semantic.primary : semantic.border,
                  },
                ]}
              >
                <FontAwesome
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- FontAwesome icon name typing
                  name={cat.icon as any}
                  size={14}
                  color={selected ? semantic.primary : semantic.textSecondary}
                />
                <Text
                  style={[
                    selectionStyles.selectionChipText,
                    { color: selected ? semantic.primary : semantic.textSecondary },
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>

        {/* Field Group */}
        <View style={modalStyles.fieldGroup}>
          {/* Current Value - opens keypad */}
          <Pressable
            onPress={() => {
              Keyboard.dismiss()
              setShowKeypad(true)
            }}
            style={[modalStyles.fieldRow, modalStyles.fieldRowNoBorder, { paddingRight: 0 }]}
          >
            <Text
              style={[
                modalStyles.fieldLabel,
                { color: getFieldLabelColor(valueCents > 0, semantic) },
              ]}
            >
              {isLiability ? 'Amount owed' : 'Current value'}{' '}
              <Text style={modalStyles.optionalLabel}>(optional)</Text>
            </Text>
            <View style={modalStyles.fieldInputWrapper}>
              <Text
                style={[
                  modalStyles.fieldInput,
                  { color: valueCents > 0 ? semantic.text : semantic.textSecondary },
                ]}
              >
                ${valueDisplay}
              </Text>
            </View>
          </Pressable>
          {isLiability && valueCents > 0 && (
            <Text style={[modalStyles.hint, { color: semantic.textSecondary }]}>
              This will be tracked as a liability
            </Text>
          )}

          {/* Accessible checkbox - only for 'other' category */}
          {category === 'other' && (
            <>
              <View style={[modalStyles.sectionDivider, { backgroundColor: semantic.border }]} />
              <View
                style={[modalStyles.fieldRow, modalStyles.fieldRowNoBorder, { paddingRight: 0 }]}
              >
                <Pressable
                  onPress={() => setIsAccessible(!isAccessible)}
                  style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: spacing.sm }}
                >
                  <View
                    style={[
                      localStyles.checkbox,
                      {
                        backgroundColor: isAccessible ? semantic.primary : 'transparent',
                        borderColor: isAccessible ? semantic.primary : semantic.border,
                      },
                    ]}
                  >
                    {isAccessible && (
                      <FontAwesome name="check" size={10} color={semantic.onPrimary} />
                    )}
                  </View>
                  <Text style={[modalStyles.fieldLabel, { color: semantic.text }]}>Accessible</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Save Button - fixed at bottom, moves with keyboard */}
      <ModalSaveBar
        label="Save"
        disabled={!canSubmit}
        bottomInset={insets.bottom}
        onPress={handleSubmit}
      />

      {/* Toast */}
      {toastMessage && (
        <Animated.View
          key={toastKey}
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(150)}
          style={[
            modalStyles.toast,
            {
              backgroundColor: semantic.text,
              position: 'absolute',
              bottom: getScrollContentWithSimpleCTAPadding(0),
              alignSelf: 'center',
            },
          ]}
          pointerEvents="none"
        >
          <Text style={[modalStyles.toastText, { color: semantic.surface }]}>{toastMessage}</Text>
        </Animated.View>
      )}

      {/* Amount Keypad Sheet */}
      <AmountKeypadSheet
        visible={showKeypad}
        amountDisplay={valueDisplay}
        hideEstimated
        onDigit={handleKeypadDigit}
        onBackspace={handleKeypadBackspace}
        onClear={handleKeypadClear}
        onDone={handleKeypadDone}
        onClose={handleKeypadDone}
      />
    </Screen>
  )
}

function getNamePlaceholder(category: AssetCategory): string {
  switch (category) {
    case 'real_estate':
      return 'e.g., Primary Residence'
    case 'other':
      return 'e.g., Car, Pokemon Cards'
    default:
      return 'Enter name'
  }
}

// ─── Local Styles (matches AddAccountScreen) ──────────────────────────────────

const localStyles = StyleSheet.create({
  headerTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
    flex: 1,
    marginHorizontal: spacing.md,
  },
  heroContainer: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radius.lg,
  },
  heroInputWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: 280,
  },
  heroPlaceholder: {
    position: 'absolute',
    top: spacing.sm,
    left: 0,
    right: 0,
    fontSize: fontSize.lg,
    textAlign: 'center',
  },
  heroInput: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 2,
  },
  heroHint: {
    fontSize: fontSize.xs,
    marginTop: spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoButton: {
    padding: spacing.xs,
  },
  infoIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
  },
})
