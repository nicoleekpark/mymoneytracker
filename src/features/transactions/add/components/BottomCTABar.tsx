/**
 * BottomCTABar
 *
 * Bottom-anchored action bar for save actions.
 * Layout A: Full-width primary button + text links below
 */

import React, { useEffect, useState } from 'react'
import { Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { useHoHTheme } from '@/shared/providers'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import { spacing } from '@/shared/theme/tokens/spacing'
import { radius } from '@/shared/theme/tokens/radius'

type BottomCTABarProps = {
  amountDisplay: string
  canSave: boolean
  bottomInset: number
  onSave: () => void
  onSaveAndNew: () => void
  onSaveDraft: () => void
}

// Minimum padding above keyboard when it's open
const KEYBOARD_SPACING = spacing.md

const OPACITY = {
  pressed: 0.7,
  disabled: 0.4,
}

export function BottomCTABar({
  amountDisplay,
  canSave,
  bottomInset,
  onSave,
  onSaveAndNew,
  onSaveDraft,
}: BottomCTABarProps) {
  const theme = useHoHTheme()
  const [keyboardVisible, setKeyboardVisible] = useState(false)

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

  // When keyboard is open, use fixed spacing; otherwise use safe area inset
  const computedPaddingBottom = keyboardVisible
    ? KEYBOARD_SPACING
    : bottomInset + spacing.md

  return (
    <View style={[styles.container, { paddingBottom: computedPaddingBottom }]}>
      {/* Primary: Save $X.XX - full width */}
      <Pressable
        onPress={onSave}
        disabled={!canSave}
        style={({ pressed }) => [
          styles.primaryButton,
          {
            backgroundColor: theme.semantic.primary,
            opacity: !canSave ? OPACITY.disabled : pressed ? OPACITY.pressed : 1,
          },
        ]}
      >
        <Text style={[styles.primaryButtonLabel, { color: theme.semantic.onPrimary }]}>
          Save ${amountDisplay}
        </Text>
      </Pressable>

      {/* Secondary: Text links */}
      <View style={styles.secondaryRow}>
        <Pressable
          onPress={onSaveAndNew}
          disabled={!canSave}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={({ pressed }) => [
            styles.textButton,
            { opacity: !canSave ? OPACITY.disabled : pressed ? OPACITY.pressed : 1 },
          ]}
        >
          <Text
            style={[
              styles.textButtonLabel,
              { color: canSave ? theme.semantic.text : theme.semantic.textSecondary },
            ]}
          >
            Save & New
          </Text>
        </Pressable>

        <Text style={[styles.separator, { color: theme.semantic.textSecondary }]}>·</Text>

        <Pressable
          onPress={onSaveDraft}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={({ pressed }) => [
            styles.textButton,
            { opacity: pressed ? OPACITY.pressed : 1 },
          ]}
        >
          <Text style={[styles.textButtonLabel, { color: theme.semantic.textSecondary }]}>
            Draft
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  primaryButton: {
    width: '100%',
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  secondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  textButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  textButtonLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  separator: {
    fontSize: fontSize.sm,
  },
})
