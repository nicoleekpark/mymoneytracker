/**
 * ModalSaveBar
 *
 * Bottom-anchored save button for modals.
 * Positions itself above the keyboard using keyboard events directly.
 * Does NOT rely on KeyboardAvoidingView.
 *
 * Uses design system styles from modalStyles.
 *
 * Usage: Place as last child in the modal (positions itself absolutely)
 */

import React, { useEffect } from 'react'
import { Keyboard, Platform, Pressable, Text } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { useHoHTheme } from '@/shared/providers'
import { modalStyles } from '@/shared/theme/tokens/modal'
import { spacing } from '@/shared/theme/tokens/spacing'

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
  const keyboardHeight = useSharedValue(0)

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

    const showSub = Keyboard.addListener(showEvent, (e) => {
      keyboardHeight.value = withTiming(e.endCoordinates.height, { duration: 250 })
    })
    const hideSub = Keyboard.addListener(hideEvent, () => {
      keyboardHeight.value = withTiming(0, { duration: 250 })
    })

    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

  const animatedStyle = useAnimatedStyle(() => {
    // When keyboard is open, position above keyboard
    // When keyboard is closed, position above safe area
    const bottomOffset = keyboardHeight.value > 0
      ? keyboardHeight.value
      : bottomInset

    return {
      bottom: bottomOffset,
    }
  })

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
