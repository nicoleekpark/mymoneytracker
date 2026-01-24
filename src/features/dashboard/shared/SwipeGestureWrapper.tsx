import React from 'react'
import type { ReactNode } from 'react'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated'

type Props = {
  children: ReactNode
  onSwipeLeft: () => void
  onSwipeRight: () => void
  canSwipeLeft: boolean
  canSwipeRight: boolean
  enabled?: boolean
}

const SWIPE_THRESHOLD = 50

export function SwipeGestureWrapper(props: Props) {
  const {
    children,
    onSwipeLeft,
    onSwipeRight,
    canSwipeLeft,
    canSwipeRight,
    enabled = true
  } = props

  const translateX = useSharedValue(0)

  const panGesture = Gesture.Pan()
    .enabled(enabled)
    .onUpdate((event) => {
      // Limit the drag based on what's allowed
      if (event.translationX > 0 && !canSwipeRight) {
        translateX.value = event.translationX * 0.2 // Resistance feel
      } else if (event.translationX < 0 && !canSwipeLeft) {
        translateX.value = event.translationX * 0.2 // Resistance feel
      } else {
        translateX.value = event.translationX * 0.5 // Partial follow
      }
    })
    .onEnd((event) => {
      const didSwipeRight = event.translationX > SWIPE_THRESHOLD && canSwipeRight
      const didSwipeLeft = event.translationX < -SWIPE_THRESHOLD && canSwipeLeft

      if (didSwipeRight) {
        runOnJS(onSwipeRight)()
      } else if (didSwipeLeft) {
        runOnJS(onSwipeLeft)()
      }

      // Spring back to center
      translateX.value = withSpring(0, {
        damping: 20,
        stiffness: 200
      })
    })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }]
  }))

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  )
}
