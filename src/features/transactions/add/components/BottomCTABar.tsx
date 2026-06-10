/**
 * BottomCTABar
 *
 * Bottom-anchored action bar for save actions.
 * Positions itself above the keyboard using keyboard events directly.
 * Does NOT rely on KeyboardAvoidingView.
 *
 * Uses design system styles from modalStyles.
 *
 * Layout: Full-width primary button + text links below
 */

import React, { useEffect } from 'react'
import { Keyboard, Platform, Pressable, Text, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { useHoHTheme } from '@/shared/providers'
import { modalStyles } from '@/shared/theme/tokens/modal'
import { spacing } from '@/shared/theme/tokens/spacing'

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
