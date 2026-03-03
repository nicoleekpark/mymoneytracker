/**
 * SwipeableAddButton
 *
 * Slack-style swipeable button for the Add Transaction dock.
 * - Tap: Save & close
 * - Swipe left: Reveals green checkmark, Save & close
 * - Swipe right: Reveals "More" action sheet with Save & Add Another, Save as Draft
 *
 * Edge Peek design: Colored edges peek out 6px to indicate swipeable affordance
 */

import React, { useCallback } from 'react'
import { Alert, StyleSheet, Text, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { fontSize } from '@/theme/tokens/typography'
import { radius } from '@/theme/tokens/radius'
import { spacing } from '@/theme/tokens/spacing'

type SwipeableAddButtonProps = {
  label: string
  disabled?: boolean
  primaryColor: string
  onPrimaryColor: string
  successColor: string
  infoColor: string
  onSaveAndClose: () => void
  onSaveAndAddAnother: () => void
  onSaveAsDraft?: () => void
}

const SWIPE_THRESHOLD = 80 // pixels to trigger action
const BUTTON_HEIGHT = 52
const EDGE_PEEK = 6 // pixels of colored edge visible at rest

export function SwipeableAddButton({
  label,
  disabled,
  primaryColor,
  onPrimaryColor,
  successColor,
  infoColor,
  onSaveAndClose,
  onSaveAndAddAnother,
  onSaveAsDraft,
}: SwipeableAddButtonProps) {
  const translateX = useSharedValue(0)
  const scale = useSharedValue(1)

  const handleSaveAndClose = useCallback(() => {
    onSaveAndClose()
  }, [onSaveAndClose])

  const handleShowMoreActions = useCallback(() => {
    // Slack-style action sheet with additional options
    Alert.alert(
      'Save Options',
      undefined,
      [
        {
          text: 'Save & Add Another',
          onPress: onSaveAndAddAnother,
        },
        ...(onSaveAsDraft ? [{
          text: 'Save as Draft',
          onPress: onSaveAsDraft,
        }] : []),
        {
          text: 'Cancel',
          style: 'cancel' as const,
        },
      ]
    )
  }, [onSaveAndAddAnother, onSaveAsDraft])

  const panGesture = Gesture.Pan()
    .enabled(!disabled)
    .activeOffsetX([-10, 10]) // Require 10px horizontal movement to activate
    .onUpdate((event) => {
      // Clamp translation
      translateX.value = Math.max(-SWIPE_THRESHOLD * 1.2, Math.min(SWIPE_THRESHOLD * 1.2, event.translationX))
    })
    .onEnd((event) => {
      if (event.translationX < -SWIPE_THRESHOLD) {
        // Swipe left - save & close
        runOnJS(handleSaveAndClose)()
      } else if (event.translationX > SWIPE_THRESHOLD) {
        // Swipe right - show more actions
        runOnJS(handleShowMoreActions)()
      }
      // Spring back to center
      translateX.value = withSpring(0, { damping: 15, stiffness: 150 })
    })

  const tapGesture = Gesture.Tap()
    .enabled(!disabled)
    .onStart(() => {
      scale.value = withSpring(0.96, { damping: 15, stiffness: 400 })
    })
    .onEnd(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 })
      runOnJS(handleSaveAndClose)()
    })

  const composedGesture = Gesture.Simultaneous(
    Gesture.Race(panGesture, tapGesture)
  )

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value },
    ],
  }))

  // Left reveal opacity (save & close) - shows when swiping left
  const leftRevealStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, -20, 0],
      [1, 0.7, 0.4],
      Extrapolation.CLAMP
    ),
  }))

  // Right reveal opacity (more actions) - shows when swiping right
  const rightRevealStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, 20, SWIPE_THRESHOLD],
      [0.4, 0.7, 1],
      Extrapolation.CLAMP
    ),
  }))

  return (
    <View style={styles.container}>
      {/* Left reveal - Done/Save (green) - positioned on right side */}
      <Animated.View
        style={[
          styles.reveal,
          styles.leftReveal,
          { backgroundColor: successColor },
          leftRevealStyle
        ]}
      >
        <FontAwesome name="check" size={20} color="#fff" />
        <Text style={styles.revealText}>Done</Text>
      </Animated.View>

      {/* Right reveal - More actions (blue) - positioned on left side */}
      <Animated.View
        style={[
          styles.reveal,
          styles.rightReveal,
          { backgroundColor: infoColor },
          rightRevealStyle
        ]}
      >
        <Text style={styles.revealText}>More</Text>
        <FontAwesome name="ellipsis-h" size={16} color="#fff" />
      </Animated.View>

      {/* Main button - slightly inset to show edge peek */}
      <GestureDetector gesture={composedGesture}>
        <Animated.View
          style={[
            styles.button,
            {
              backgroundColor: disabled ? primaryColor + '60' : primaryColor,
              marginHorizontal: EDGE_PEEK,
            },
            buttonAnimatedStyle,
          ]}
        >
          <Text style={[styles.buttonText, { color: onPrimaryColor }]}>
            {label}
          </Text>
        </Animated.View>
      </GestureDetector>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: BUTTON_HEIGHT,
    position: 'relative',
  },
  reveal: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  leftReveal: {
    // Full width, content centered
  },
  rightReveal: {
    // Full width, content centered
  },
  revealText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  button: {
    flex: 1,
    height: BUTTON_HEIGHT,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  buttonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
})
