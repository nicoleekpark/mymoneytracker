import FontAwesome from '@expo/vector-icons/FontAwesome'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { getAccountById, updateAccount } from '@/core/services/account'
import { Screen } from '@/shared/layout/Screen'
import { useHoHTheme } from '@/shared/providers'
import { useDataRefreshStore } from '@/shared/store'
import { getFieldLabelColor, getScrollContentWithSimpleCTAPadding, getSheetBottomPadding, MODAL_TOAST_DURATION, modalStyles } from '@/shared/theme/tokens/modal'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'

export default function EditAccountScreen() {
  const theme = useHoHTheme()
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams<{ accountId: string }>()
  const { invalidateTransactions } = useDataRefreshStore()
  const nameInputRef = useRef<TextInput>(null)
  const { semantic } = theme

  // Load account data
  const account = useMemo(() => {
    if (!params.accountId) return null
    return getAccountById(params.accountId)
  }, [params.accountId])

  // Form state
  const [name, setName] = useState('')
  const [nameFocused, setNameFocused] = useState(false)
  const [bankName, setBankName] = useState('')
  const [lastFour, setLastFour] = useState('')

  // Initialize form with account data
  useEffect(() => {
    if (account) {
      setName(account.name)
      setBankName(account.bankName ?? '')
      setLastFour(account.lastFourDigits ?? '')
    }
  }, [account])

  // UI state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastKey, setToastKey] = useState(0)
  const [highlightName, setHighlightName] = useState(false)
  const [keyboardVisible, setKeyboardVisible] = useState(false)

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

  // Track keyboard visibility
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true))
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false))

    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

  const showToast = useCallback((message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    setToastMessage(message)
    setToastKey((k) => k + 1)
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), MODAL_TOAST_DURATION)
  }, [])

  const handleCancel = useCallback(() => {
    Keyboard.dismiss()
    router.back()
  }, [])

  const handleSubmit = useCallback(() => {
    if (!account) return

    const trimmedName = name.trim()

    if (!trimmedName) {
      showToast('Please enter a nickname')
      setHighlightName(true)
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current)
      highlightTimeoutRef.current = setTimeout(() => setHighlightName(false), 2000)
      return
    }

    try {
      updateAccount(account.id, {
        name: trimmedName,
        bankName: bankName.trim() || null,
        lastFourDigits: lastFour.trim() || null,
      })

      // Trigger data refresh
      invalidateTransactions()

      // Navigate back
      Keyboard.dismiss()
      router.back()
    } catch (error) {
      showToast('Failed to update account')
    }
  }, [account, name, bankName, lastFour, invalidateTransactions, showToast])

  const canSubmit = name.trim().length > 0
  const hasChanges = account && (
    name.trim() !== account.name ||
    (bankName.trim() || null) !== (account.bankName || null) ||
    (lastFour.trim() || null) !== (account.lastFourDigits || null)
  )

  // Get label for institution field based on kind
  const institutionLabel = useMemo(() => {
    if (!account) return 'Institution'
    if (account.kind === 'credit_card') return 'Card issuer'
    if (account.kind === 'loan') return 'Lender'
    if (account.kind === 'investment') return 'Brokerage'
    return 'Bank name'
  }, [account])

  const institutionPlaceholder = useMemo(() => {
    if (!account) return 'Add institution'
    if (account.kind === 'credit_card') return 'e.g., Chase, Amex'
    if (account.kind === 'loan') return 'e.g., SoFi, Marcus'
    if (account.kind === 'investment') return 'e.g., Fidelity, Vanguard'
    return 'e.g., Chase, Wells Fargo'
  }, [account])

  const showLastFour = account && (
    account.kind === 'checking' ||
    account.kind === 'savings' ||
    account.kind === 'credit_card'
  )

  if (!account) {
    return (
      <Screen edges={[]} padded={false} topPadding={false} style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: semantic.textSecondary }}>Account not found</Text>
        </View>
      </Screen>
    )
  }

  return (
    <Screen
      edges={[]}
      padded={false}
      topPadding={false}
      style={{ flex: 1 }}
      contentStyle={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 20}
      >
        {/* Drag Handle */}
        <View style={modalStyles.dragHandleContainer}>
          <View style={[modalStyles.dragHandle, { backgroundColor: semantic.border }]} />
        </View>

        {/* Header */}
        <View style={modalStyles.header}>
          <Pressable onPress={handleCancel} hitSlop={12} style={modalStyles.cancelButton}>
            <Text style={[modalStyles.cancelText, { color: semantic.textSecondary }]}>Cancel</Text>
          </Pressable>
        </View>

        {/* Title */}
        <View style={[modalStyles.typeTabs, { borderBottomColor: semantic.border }]}>
          <Text style={[modalStyles.typeTabText, { color: semantic.text, fontWeight: '700' }]}>
            Edit Account
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            modalStyles.content,
            // Note: safeAreaBottom=0 because iOS card-style modals already handle safe area
            { paddingBottom: getScrollContentWithSimpleCTAPadding(0) },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero: Nickname Input */}
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

          {/* Account Type Badge */}
          <View style={localStyles.badgeRow}>
            <View style={[localStyles.badge, { backgroundColor: semantic.surfaceAlt }]}>
              <FontAwesome
                name={
                  account.kind === 'credit_card' ? 'credit-card' :
                  account.kind === 'cash' ? 'money' :
                  account.kind === 'investment' ? 'line-chart' :
                  account.kind === 'loan' ? 'file-text-o' :
                  'bank'
                }
                size={12}
                color={semantic.textSecondary}
              />
              <Text style={[localStyles.badgeText, { color: semantic.textSecondary }]}>
                {account.kind.replace('_', ' ')}
              </Text>
            </View>
          </View>

          {/* Field Group */}
          <View style={modalStyles.fieldGroup}>
            {/* Institution Name (Optional) */}
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
                  value={bankName}
                  onChangeText={setBankName}
                  style={[modalStyles.fieldInput, { color: semantic.text }]}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            </View>
            <View style={[modalStyles.sectionDivider, { backgroundColor: semantic.border }]} />

            {/* Last 4 Digits (Optional) - Only for bank/card */}
            {showLastFour && (
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
          </View>

          {/* Save Button - inside ScrollView so it scrolls with content */}
          <View style={[localStyles.ctaContainer, { marginTop: spacing.xl }]}>
            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit || !hasChanges}
              style={[
                localStyles.saveButton,
                { backgroundColor: canSubmit && hasChanges ? semantic.primary : semantic.surfaceAlt },
              ]}
            >
              <Text
                style={[
                  localStyles.saveButtonText,
                  { color: canSubmit && hasChanges ? semantic.surface : semantic.textSecondary },
                ]}
              >
                Save Changes
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        {/* Toast - floating above content */}
        {toastMessage && (
          <Animated.View
            key={toastKey}
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(150)}
            style={[
              modalStyles.toast,
              { backgroundColor: semantic.text, position: 'absolute', bottom: getSheetBottomPadding(insets.bottom), alignSelf: 'center' }
            ]}
            pointerEvents="none"
          >
            <Text style={[modalStyles.toastText, { color: semantic.surface }]}>{toastMessage}</Text>
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  )
}

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
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textTransform: 'capitalize',
  },
  ctaContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  saveButton: {
    paddingVertical: spacing.md + spacing.xs,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
})
