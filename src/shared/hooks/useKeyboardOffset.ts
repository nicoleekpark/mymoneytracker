/**
 * useKeyboardOffset
 *
 * Returns an animated bottom offset value that responds to keyboard show/hide.
 * When keyboard is visible, returns keyboard height.
 * When keyboard is hidden, returns the provided safe area inset.
 *
 * Usage:
 * ```tsx
 * const insets = useSafeAreaInsets()
 * const { animatedStyle } = useKeyboardOffset(insets.bottom)
 *
 * <Animated.View style={[styles.container, animatedStyle]}>
 * ```
 */

import { useEffect } from 'react'
import { Keyboard, Platform } from 'react-native'
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

const ANIMATION_DURATION = 250

export function useKeyboardOffset(safeAreaBottom: number) {
  const keyboardHeight = useSharedValue(0)

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

    const showSub = Keyboard.addListener(showEvent, (e) => {
      keyboardHeight.value = withTiming(e.endCoordinates.height, { duration: ANIMATION_DURATION })
    })
    const hideSub = Keyboard.addListener(hideEvent, () => {
      keyboardHeight.value = withTiming(0, { duration: ANIMATION_DURATION })
    })

    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [keyboardHeight])

  const animatedStyle = useAnimatedStyle(() => {
    const bottomOffset = keyboardHeight.value > 0
      ? keyboardHeight.value
      : safeAreaBottom

    return {
      bottom: bottomOffset,
    }
  })

  return {
    animatedStyle,
    keyboardHeight,
  }
}
