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
 * Supports inline "Saved ✓" success state (Option D feedback)
 */

import React, { useEffect } from 'react'
import { Pressable, Text, View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useHoHTheme } from '@/shared/providers'
import { useKeyboardOffset } from '@/shared/hooks'
import { HIT_SLOP_LG, OPACITY_PRESSED, OPACITY_DISABLED } from '@/shared/theme/tokens/buttons'
import { modalStyles } from '@/shared/theme/tokens/modal'
import { spacing } from '@/shared/theme/tokens/spacing'

type BottomCTABarProps = {
  amountDisplay: string
  canSave: boolean
  bottomInset: number
  /** Show success state ("Saved ✓") instead of normal button */
  saved?: boolean
  onSave: () => void
  onSaveAndNew: () => void
  onSaveDraft: () => void
}

export function BottomCTABar({
  amountDisplay,
  canSave,
  bottomInset,
  saved,
  onSave,
  onSaveAndNew,
  onSaveDraft,
}: BottomCTABarProps) {
  const theme = useHoHTheme()
  const { animatedStyle } = useKeyboardOffset(bottomInset)

  // Animation for success state
  const scale = useSharedValue(1)

  useEffect(() => {
    if (saved) {
      // Subtle pop animation on success
      scale.value = withSequence(
        withSpring(1.02, { damping: 10, stiffness: 400 }),
        withSpring(1, { damping: 12, stiffness: 300 })
      )
    } else {
      scale.value = 1
    }
  }, [saved, scale])

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View style={[modalStyles.ctaContainerAbsolute, { backgroundColor: theme.semantic.background }, animatedStyle]}>
      {/* Primary: Save $X.XX - shows success state when saved */}
      <Animated.View style={animatedButtonStyle}>
        <Pressable
          onPress={onSave}
          disabled={!canSave || saved}
          style={({ pressed }) => [
            modalStyles.ctaPrimaryButton,
            {
              backgroundColor: saved ? theme.semantic.success : theme.semantic.primary,
              opacity: !canSave ? OPACITY_DISABLED : pressed ? OPACITY_PRESSED : 1,
            },
          ]}
        >
          {saved ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <FontAwesome name="check" size={16} color={theme.semantic.onPrimary} />
              <Text style={[modalStyles.ctaPrimaryText, { color: theme.semantic.onPrimary }]}>
                Saved
              </Text>
            </View>
          ) : (
            <Text style={[modalStyles.ctaPrimaryText, { color: theme.semantic.onPrimary }]}>
              Save ${amountDisplay}
            </Text>
          )}
        </Pressable>
      </Animated.View>

      {/* Secondary: Text links - hidden when saved */}
      {!saved && (
        <View style={modalStyles.ctaSecondaryRow}>
          <Pressable
            onPress={onSaveAndNew}
            disabled={!canSave}
            hitSlop={HIT_SLOP_LG}
            style={({ pressed }) => [
              modalStyles.ctaTextButton,
              { opacity: !canSave ? OPACITY_DISABLED : pressed ? OPACITY_PRESSED : 1 },
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
            hitSlop={HIT_SLOP_LG}
            style={({ pressed }) => [
              modalStyles.ctaTextButton,
              { opacity: pressed ? OPACITY_PRESSED : 1 },
            ]}
          >
            <Text style={[modalStyles.ctaTextButtonLabel, { color: theme.semantic.textSecondary }]}>
              Draft
            </Text>
          </Pressable>
        </View>
      )}
    </Animated.View>
  )
}
