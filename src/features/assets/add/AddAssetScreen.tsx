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
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import type { AssetCategory, AssetCategoryMeta } from '@/core/domain/asset'
import { ASSET_CATEGORIES, getCategoryMeta } from '@/core/domain/asset'
import { createAssetItem, getCurrentYearMonth, setBalance } from '@/core/services/asset'
import { AmountKeypadSheet } from '@/shared/components'
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
import { fontSize, fontWeight, letterSpacing } from '@/shared/theme/tokens/typography'

// ─── Tab Structure (matches AddAccountScreen pattern) ─────────────────────────

type AssetTab = 'assets' | 'liabilities'

const ASSET_TABS: { key: AssetTab; label: string }[] = [
  { key: 'assets', label: 'Assets' },
  { key: 'liabilities', label: 'Liabilities' },
]

/**
 * Categories per tab (excluding account-linked and kids)
 */
const CATEGORIES_BY_TAB: Record<AssetTab, { key: AssetCategory; label: string; icon: string }[]> = {
  assets: [
    { key: 'real_estate', label: 'Real Estate', icon: 'home' },
    { key: 'retirement_funds', label: 'Retirement', icon: 'university' },
    { key: 'investments', label: 'Investments', icon: 'line-chart' },
    { key: 'other', label: 'Other', icon: 'ellipsis-h' },
  ],
  liabilities: [
    { key: 'loans', label: 'Loans', icon: 'bank' },
    { key: 'other', label: 'Other', icon: 'ellipsis-h' },
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

  // UI state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastKey, setToastKey] = useState(0)
  const [highlightName, setHighlightName] = useState(false)

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
  }, [tab])

  const showToast = useCallback((message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    setToastMessage(message)
    setToastKey(k => k + 1)
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), MODAL_TOAST_DURATION)
  }, [])

  // Derived state
  const selectedMeta = useMemo(() => getCategoryMeta(category), [category])
  const isLiability = tab === 'liabilities'
  const valueDisplay = formatCentsForDisplay(valueCents)
  const canSubmit = name.trim().length > 0
  const categories = CATEGORIES_BY_TAB[tab]

  const handleCancel = useCallback(() => {
    Keyboard.dismiss()
    router.back()
  }, [])

  // Amount keypad handlers
  const handleKeypadDigit = useCallback((digit: string) => {
    setValueCents(prev => {
      let next = prev
      for (const d of digit) {
        next = next * 10 + parseInt(d, 10)
      }
      return next > 9999999999 ? prev : next
    })
  }, [])

  const handleKeypadBackspace = useCallback(() => {
    setValueCents(prev => Math.floor(prev / 10))
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
      const newAsset = createAssetItem(
        selectedMeta.field,
        category,
        trimmedName,
        null
      )

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
  }, [name, category, selectedMeta, valueCents, isLiability, invalidateAssets, showToast])

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
      <View style={modalStyles.header}>
        <Pressable onPress={handleCancel} hitSlop={12} style={modalStyles.cancelButton}>
          <Text style={[modalStyles.cancelText, { color: semantic.textSecondary }]}>
            Cancel
          </Text>
        </Pressable>
      </View>

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
          { paddingBottom: getScrollContentWithSimpleCTAPadding(insets.bottom, keyboardHeight) },
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
        </View>
      </ScrollView>

      {/* Save Button - fixed at bottom */}
      <View
        style={[
          localStyles.saveContainer,
          {
            backgroundColor: semantic.surface,
            paddingBottom: Math.max(insets.bottom, spacing.lg),
          },
        ]}
      >
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={({ pressed }) => [
            localStyles.saveButton,
            {
              backgroundColor: canSubmit ? semantic.primary : semantic.surfaceAlt,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text
            style={[
              localStyles.saveButtonText,
              { color: canSubmit ? semantic.onPrimary : semantic.textSecondary },
            ]}
          >
            Save
          </Text>
        </Pressable>
      </View>

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
              bottom: getScrollContentWithSimpleCTAPadding(insets.bottom, 0),
              alignSelf: 'center',
            },
          ]}
          pointerEvents="none"
        >
          <Text style={[modalStyles.toastText, { color: semantic.surface }]}>
            {toastMessage}
          </Text>
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
    case 'retirement_funds':
      return 'e.g., 401(k)'
    case 'investments':
      return 'e.g., Fidelity Brokerage'
    case 'loans':
      return 'e.g., Mortgage'
    case 'other':
      return 'e.g., Pokemon Cards'
    default:
      return 'Enter name'
  }
}

// ─── Local Styles (matches AddAccountScreen) ──────────────────────────────────

const localStyles = StyleSheet.create({
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
  saveContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  saveButton: {
    width: '100%',
    height: spacing['3xl'],
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
})
