/**
 * BottomCTABar
 *
 * Bottom-anchored action bar for save actions.
 * Positions itself above the keyboard using useKeyboardOffset hook.
 * Does NOT rely on KeyboardAvoidingView.
 *
 * Uses design system styles from modalStyles.
 *
 * Layout: Full-width primary button + text links below
 */

import React from 'react'
import { Pressable, Text, View } from 'react-native'
import Animated from 'react-native-reanimated'
import { useHoHTheme } from '@/shared/providers'
import { useKeyboardOffset } from '@/shared/hooks'
import { modalStyles } from '@/shared/theme/tokens/modal'

type BottomCTABarProps = {
  amountDisplay: string
  canSave: boolean
  bottomInset: number
  onSave: () => void
  onSaveAndNew: () => void
  onSaveDraft: () => void
}

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
  const { animatedStyle } = useKeyboardOffset(bottomInset)

  return (
    <Animated.View style={[modalStyles.ctaContainerAbsolute, { backgroundColor: theme.semantic.background }, animatedStyle]}>
      {/* Primary: Save $X.XX - full width */}
      <Pressable
        onPress={onSave}
        disabled={!canSave}
        style={({ pressed }) => [
          modalStyles.ctaPrimaryButton,
          {
            backgroundColor: theme.semantic.primary,
            opacity: !canSave ? OPACITY.disabled : pressed ? OPACITY.pressed : 1,
          },
        ]}
      >
        <Text style={[modalStyles.ctaPrimaryText, { color: theme.semantic.onPrimary }]}>
          Save ${amountDisplay}
        </Text>
      </Pressable>

      {/* Secondary: Text links */}
      <View style={modalStyles.ctaSecondaryRow}>
        <Pressable
          onPress={onSaveAndNew}
          disabled={!canSave}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={({ pressed }) => [
            modalStyles.ctaTextButton,
            { opacity: !canSave ? OPACITY.disabled : pressed ? OPACITY.pressed : 1 },
          ]}
        >
          <Text
            style={[
              modalStyles.ctaTextButtonLabel,
              { color: canSave ? theme.semantic.text : theme.semantic.textSecondary },
            ]}
          >
            Save & New
          </Text>
        </Pressable>

        <Text style={[modalStyles.ctaTextButtonLabel, { color: theme.semantic.textSecondary }]}>·</Text>

        <Pressable
          onPress={onSaveDraft}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={({ pressed }) => [
            modalStyles.ctaTextButton,
            { opacity: pressed ? OPACITY.pressed : 1 },
          ]}
        >
          <Text style={[modalStyles.ctaTextButtonLabel, { color: theme.semantic.textSecondary }]}>
            Draft
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  )
}
