/**
 * ModalSaveBar
 *
 * Bottom-anchored save button for modals.
 * Positions itself above the keyboard using useKeyboardOffset hook.
 * Does NOT rely on KeyboardAvoidingView.
 *
 * Uses design system styles from modalStyles.
 *
 * Usage: Place as last child in the modal (positions itself absolutely)
 */

import React from 'react'
import { Pressable, Text } from 'react-native'
import Animated from 'react-native-reanimated'
import { useHoHTheme } from '@/shared/providers'
import { useKeyboardOffset } from '@/shared/hooks'
import { modalStyles } from '@/shared/theme/tokens/modal'

type Props = {
  label: string
  disabled?: boolean
  bottomInset: number
  onPress: () => void
}

const OPACITY = {
  pressed: 0.7,
  disabled: 0.4,
}

export function ModalSaveBar({ label, disabled = false, bottomInset, onPress }: Props) {
  const theme = useHoHTheme()
  const { animatedStyle } = useKeyboardOffset(bottomInset)

  return (
    <Animated.View style={[modalStyles.ctaContainerAbsolute, { backgroundColor: theme.semantic.background }, animatedStyle]}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          modalStyles.ctaPrimaryButton,
          {
            backgroundColor: disabled ? theme.semantic.surfaceAlt : theme.semantic.primary,
            opacity: pressed && !disabled ? OPACITY.pressed : 1,
          },
        ]}
      >
        <Text
          style={[
            modalStyles.ctaPrimaryText,
            { color: disabled ? theme.semantic.textSecondary : theme.semantic.onPrimary },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  )
}
