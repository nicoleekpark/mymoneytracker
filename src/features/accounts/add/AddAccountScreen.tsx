import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router, useSegments } from 'expo-router'
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

import type { AccountKind } from '@/core/domain/account'
import { createAccount } from '@/core/services/account'
import { ModalSaveBar } from '@/shared/components'
import { CATEGORIES_INDEX } from '@/shared/config/categories.index'
import { useKeyboardHeight } from '@/shared/hooks'
import { Screen } from '@/shared/layout/Screen'
import { useHoHTheme } from '@/shared/providers'
import { useDataRefreshStore } from '@/shared/store'
import { getFieldLabelColor, MODAL_TOAST_DURATION, modalStyles } from '@/shared/theme/tokens/modal'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'

// ─── Account Category Structure ─────────────────────────────────────────────

type AccountCategory = 'bank' | 'card' | 'cash' | 'other'

const ACCOUNT_CATEGORIES: { key: AccountCategory; label: string }[] = [
  { key: 'bank', label: 'Bank' },
  { key: 'card', label: 'Card' },
  { key: 'cash', label: 'Cash' },
  { key: 'other', label: 'Other' },
]

const ACCOUNT_SUBTYPES: Record<
  AccountCategory,
  { key: AccountKind; label: string; icon: string }[]
> = {
  bank: [
    { key: 'checking', label: 'Checking', icon: 'bank' },
    { key: 'savings', label: 'Savings', icon: 'bank' },
  ],
  card: [{ key: 'credit_card', label: 'Credit Card', icon: 'credit-card' }],
  cash: [{ key: 'cash', label: 'Cash', icon: 'money' }],
  other: [
    { key: 'investment', label: 'Investment', icon: 'line-chart' },
    { key: 'loan', label: 'Loan', icon: 'file-text-o' },
    { key: 'other', label: 'Other', icon: 'cube' },
  ],
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function AddAccountScreen() {
  const theme = useHoHTheme()
  const insets = useSafeAreaInsets()
  const segments = useSegments()
  const { invalidateTransactions } = useDataRefreshStore()
  const nameInputRef = useRef<TextInput>(null)
  const scrollViewRef = useRef<ScrollView>(null)
  const institutionInputRef = useRef<TextInput>(null)
  const lastFourInputRef = useRef<TextInput>(null)
  const balanceInputRef = useRef<TextInput>(null)
  const { semantic } = theme

  // Determine if opened from transaction flow (show "Back") or directly (show "Cancel")
  const isFromTransactionFlow = segments.includes('add-transaction' as never)

  // Form state
  const [category, setCategory] = useState<AccountCategory>('bank')
  const [kind, setKind] = useState<AccountKind>('checking')
  const [name, setName] = useState('')
  const [nameFocused, setNameFocused] = useState(false)
  const [bankName, setBankName] = useState('')
  const [lastFour, setLastFour] = useState('')
  const [balance, setBalance] = useState('')

  // UI state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastKey, setToastKey] = useState(0)
  const [highlightName, setHighlightName] = useState(false)

  // Keyboard height for ScrollView padding (design system hook)
  const keyboardHeight = useKeyboardHeight()

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

  const showToast = useCallback((message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    setToastMessage(message)
    setToastKey((k) => k + 1)
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), MODAL_TOAST_DURATION)
  }, [])

  // Auto-select first subtype when category changes
  // For cash, also set default name
  useEffect(() => {
    const subtypes = ACCOUNT_SUBTYPES[category]
    if (subtypes.length > 0) {
      setKind(subtypes[0].key)
    }
    // Auto-set name for cash
    if (category === 'cash') {
      setName('Cash')
    }
  }, [category])

  const handleCancel = useCallback(() => {
    Keyboard.dismiss()
    router.back()
  }, [])

  const handleSubmit = useCallback(() => {
    const trimmedName = name.trim()

    if (!trimmedName) {
      showToast('Please enter a nickname')
      setHighlightName(true)
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current)
      highlightTimeoutRef.current = setTimeout(() => setHighlightName(false), 2000)
      return
    }

    try {
      createAccount(CATEGORIES_INDEX, {
        name: trimmedName,
        kind,
        bankName: bankName.trim() || undefined,
        lastFourDigits: lastFour.trim() || undefined,
        initialBalance: balance ? parseFloat(balance) : undefined,
      })

      // Trigger data refresh for callers
      invalidateTransactions()

      // Navigate back
      Keyboard.dismiss()
      router.back()
    } catch (error) {
      showToast('Failed to create account')
    }
  }, [name, kind, bankName, lastFour, balance, invalidateTransactions, showToast])

  const isLiability = kind === 'credit_card' || kind === 'loan'
  const canSubmit = name.trim().length > 0
  const subtypes = ACCOUNT_SUBTYPES[category]

  // Get label for institution field based on kind
  const institutionLabel = useMemo(() => {
    if (kind === 'credit_card') return 'Card issuer'
    if (kind === 'loan') return 'Lender'
    if (kind === 'investment') return 'Brokerage'
    return 'Bank name'
  }, [kind])

  const institutionPlaceholder = useMemo(() => {
    if (kind === 'credit_card') return 'e.g., Chase, Amex'
    if (kind === 'loan') return 'e.g., SoFi, Marcus'
    if (kind === 'investment') return 'e.g., Fidelity, Vanguard'
    return 'e.g., Chase, Wells Fargo'
  }, [kind])

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
              {isFromTransactionFlow ? 'Back' : 'Cancel'}
            </Text>
          </Pressable>
        </View>

        {/* Category Tabs */}
        <View style={[modalStyles.typeTabs, { borderBottomColor: semantic.border }]}>
          {ACCOUNT_CATEGORIES.map((cat) => {
            const selected = cat.key === category
            return (
              <Pressable
                key={cat.key}
                onPress={() => setCategory(cat.key)}
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
                  {cat.label}
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
            { paddingBottom: insets.bottom + 52 + spacing.xl * 2 + keyboardHeight },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero: Nickname Input (simplified for cash) */}
          {category === 'cash' ? (
            <View style={localStyles.heroContainer}>
              <FontAwesome name="money" size={32} color={semantic.primary} />
              <Text style={[localStyles.cashTitle, { color: semantic.text }]}>Cash</Text>
              <Text style={[localStyles.heroHint, { color: semantic.textSecondary }]}>
                Enter your current cash on hand
              </Text>
            </View>
          ) : (
            <View
              style={[
                localStyles.heroContainer,
                highlightName && { backgroundColor: (semantic.warning ?? semantic.danger) + '15' },
              ]}
            >
              <View style={localStyles.heroInputWrapper}>
                {!name && !nameFocused && (
                  <Text style={[localStyles.heroPlaceholder, { color: semantic.textSecondary }]}>
                    Account nickname
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
          )}

          {/* Subtype Chips */}
          {subtypes.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={localStyles.chipsRow}
              contentContainerStyle={localStyles.chipsContent}
            >
              {subtypes.map((subtype) => {
                const selected = kind === subtype.key
                return (
                  <Pressable
                    key={subtype.key}
                    onPress={() => setKind(subtype.key)}
                    style={[
                      localStyles.chip,
                      {
                        backgroundColor: selected ? semantic.primary + '20' : semantic.surfaceAlt,
                        borderColor: selected ? semantic.primary : semantic.border,
                      },
                    ]}
                  >
                    <FontAwesome
                      name={subtype.icon as any}
                      size={14}
                      color={selected ? semantic.primary : semantic.textSecondary}
                    />
                    <Text
                      style={[
                        localStyles.chipText,
                        { color: selected ? semantic.primary : semantic.textSecondary },
                      ]}
                    >
                      {subtype.label}
                    </Text>
                  </Pressable>
                )
              })}
            </ScrollView>
          )}

          {/* Field Group */}
          <View style={modalStyles.fieldGroup}>
            {/* Institution Name (Optional) - Hidden for cash */}
            {category !== 'cash' && (
              <>
                <View style={[modalStyles.fieldRow, modalStyles.fieldRowNoBorder, { paddingRight: 0 }]}>
                  <Text
                    style={[modalStyles.fieldLabel, { color: getFieldLabelColor(!!bankName, semantic) }]}
                  >
                    {institutionLabel} <Text style={modalStyles.optionalLabel}>(optional)</Text>
                  </Text>
                  <View style={modalStyles.fieldInputWrapper}>
                    {!bankName && (
                      <Text
                        style={[
                          modalStyles.fieldPlaceholder,
                          modalStyles.fieldInputPlaceholder,
                          { color: semantic.textSecondary },
                        ]}
                      >
                        {institutionPlaceholder}
                      </Text>
                    )}
                    <TextInput
                      ref={institutionInputRef}
                      value={bankName}
                      onChangeText={setBankName}
                      style={[modalStyles.fieldInput, { color: semantic.text }]}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  </View>
                </View>
                <View style={[modalStyles.sectionDivider, { backgroundColor: semantic.border }]} />
              </>
            )}

            {/* Last 4 Digits (Optional) - Only for bank accounts and cards (not cash) */}
            {(category === 'bank' || category === 'card') && kind !== 'cash' && (
              <>
                <View
                  style={[modalStyles.fieldRow, modalStyles.fieldRowNoBorder, { paddingRight: 0 }]}
                >
                  <Text
                    style={[
                      modalStyles.fieldLabel,
                      { color: getFieldLabelColor(!!lastFour, semantic) },
                    ]}
                  >
                    Last 4 digits <Text style={modalStyles.optionalLabel}>(optional)</Text>
                  </Text>
                  <View style={modalStyles.fieldInputWrapper}>
                    {!lastFour && (
                      <Text
                        style={[
                          modalStyles.fieldPlaceholder,
                          modalStyles.fieldInputPlaceholder,
                          { color: semantic.textSecondary },
                        ]}
                      >
                        For identification
                      </Text>
                    )}
                    <TextInput
                      ref={lastFourInputRef}
                      value={lastFour}
                      onChangeText={(text) => setLastFour(text.replace(/\D/g, '').slice(0, 4))}
                      style={[modalStyles.fieldInput, { color: semantic.text }]}
                      keyboardType="number-pad"
                      maxLength={4}
                    />
                  </View>
                </View>
                <View style={[modalStyles.sectionDivider, { backgroundColor: semantic.border }]} />
              </>
            )}

            {/* Current Balance (Optional) */}
            <View style={[modalStyles.fieldRow, modalStyles.fieldRowNoBorder, { paddingRight: 0 }]}>
              <Text
                style={[modalStyles.fieldLabel, { color: getFieldLabelColor(!!balance, semantic) }]}
              >
                {isLiability ? 'Current balance owed' : 'Current balance'}{' '}
                <Text style={modalStyles.optionalLabel}>(optional)</Text>
              </Text>
              <View style={modalStyles.fieldInputWrapper}>
                {!balance && (
                  <Text
                    style={[
                      modalStyles.fieldPlaceholder,
                      modalStyles.fieldInputPlaceholder,
                      { color: semantic.textSecondary },
                    ]}
                  >
                    $0.00
                  </Text>
                )}
                <TextInput
                  ref={balanceInputRef}
                  value={balance ? `$${balance}` : ''}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/[^0-9.]/g, '')
                    const parts = cleaned.split('.')
                    if (parts.length > 2) return
                    if (parts[1] && parts[1].length > 2) return
                    setBalance(cleaned)
                  }}
                  style={[modalStyles.fieldInput, { color: semantic.text }]}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            {isLiability && balance && (
              <Text style={[modalStyles.hint, { color: semantic.textSecondary }]}>
                This will be tracked as a liability
              </Text>
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

        {/* Toast - floating above button */}
        {toastMessage && (
          <Animated.View
            key={toastKey}
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(150)}
            style={[
              modalStyles.toast,
              { backgroundColor: semantic.text, position: 'absolute', bottom: insets.bottom + spacing['3xl'] * 2, alignSelf: 'center' }
            ]}
            pointerEvents="none"
          >
            <Text style={[modalStyles.toastText, { color: semantic.surface }]}>{toastMessage}</Text>
          </Animated.View>
        )}
    </Screen>
  )
}

// ─── Local Styles ────────────────────────────────────────────────────────────

const localStyles = StyleSheet.create({
  // Hero area
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
  cashTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.md,
  },

  // Chips
  chipsRow: {
    marginBottom: spacing.lg,
  },
  chipsContent: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
})
