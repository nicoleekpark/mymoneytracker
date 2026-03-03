/**
 * BottomCTABar
 *
 * Bottom-anchored action bar for save actions.
 * Layout: [Draft] [Save $X.XX] [& New]
 */

import React, { useEffect, useState } from 'react'
import { Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { useHoHTheme } from '@/providers'
import { fontSize, fontWeight } from '@/theme/tokens/typography'
import { spacing } from '@/theme/tokens/spacing'
import { radius } from '@/theme/tokens/radius'

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
      {/* Draft - text button */}
      <Pressable
        onPress={onSaveDraft}
        style={({ pressed }) => [
          styles.textButton,
          { opacity: pressed ? OPACITY.pressed : 1 },
        ]}
      >
        <Text style={[styles.textButtonLabel, { color: theme.semantic.textSecondary }]}>
          Draft
        </Text>
      </Pressable>

      {/* Save $X.XX - primary */}
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

      {/* & New - outlined secondary */}
      <Pressable
        onPress={onSaveAndNew}
        disabled={!canSave}
        style={({ pressed }) => [
          styles.secondaryButton,
          {
            borderColor: canSave ? theme.semantic.border : theme.semantic.border + '60',
            opacity: !canSave ? OPACITY.disabled : pressed ? OPACITY.pressed : 1,
          },
        ]}
      >
        <Text
          style={[
            styles.secondaryButtonLabel,
            { color: canSave ? theme.semantic.text : theme.semantic.textSecondary },
          ]}
        >
          & New
        </Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  textButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  textButtonLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  primaryButton: {
    flex: 1,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  secondaryButton: {
    height: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
})
