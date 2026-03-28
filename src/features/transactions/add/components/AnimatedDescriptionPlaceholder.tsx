/**
 * AnimatedDescriptionPlaceholder
 *
 * Rotating placeholder text that slides vertically through example descriptions.
 * Only animates when the input is empty and unfocused.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { fontSize } from '@/shared/theme/tokens/typography'
import { spacing } from '@/shared/theme/tokens/spacing'

const EXAMPLES = [
  'Coffee with Alex',
  'Date night dinner',
  'Uber to work',
  'Pet food for Maisie',
]

const CYCLE_INTERVAL_MS = 3000
const ANIMATION_DURATION_MS = 300
// Match TextInput line height
const LINE_HEIGHT = fontSize.md * 1.4

type AnimatedDescriptionPlaceholderProps = {
  isActive: boolean // true when field is empty and unfocused
  color: string
}

export function AnimatedDescriptionPlaceholder({
  isActive,
  color,
}: AnimatedDescriptionPlaceholderProps) {
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.floor(Math.random() * EXAMPLES.length)
  )
  const [nextIndex, setNextIndex] = useState<number | null>(null)

  const translateY = useSharedValue(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const currentIndexRef = useRef(currentIndex)

  // Keep ref in sync with state
  currentIndexRef.current = currentIndex

  const getRandomNextIndex = useCallback((current: number): number => {
    if (EXAMPLES.length <= 1) return 0
    let next: number
    do {
      next = Math.floor(Math.random() * EXAMPLES.length)
    } while (next === current)
    return next
  }, [])

  const completeTransition = useCallback((newIndex: number) => {
    setCurrentIndex(newIndex)
    setNextIndex(null)
    translateY.value = 0
  }, [translateY])

  const startCycle = useCallback(() => {
    const next = getRandomNextIndex(currentIndexRef.current)
    setNextIndex(next)

    translateY.value = withTiming(-LINE_HEIGHT, {
      duration: ANIMATION_DURATION_MS,
      easing: Easing.inOut(Easing.ease),
    })

    // Schedule state update after animation completes
    transitionTimeoutRef.current = setTimeout(() => {
      completeTransition(next)
    }, ANIMATION_DURATION_MS)
  }, [translateY, getRandomNextIndex, completeTransition])

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
        transitionTimeoutRef.current = null
      }
      translateY.value = 0
      setNextIndex(null)
      return
    }

    intervalRef.current = setInterval(startCycle, CYCLE_INTERVAL_MS)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
        transitionTimeoutRef.current = null
      }
    }
  }, [isActive, startCycle, translateY])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  if (!isActive) {
    return null
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.textContainer, animatedStyle]}>
        <Animated.Text style={[styles.placeholder, { color }]}>
          {EXAMPLES[currentIndex]}
        </Animated.Text>
        {nextIndex !== null && (
          <Animated.Text style={[styles.placeholder, { color }]}>
            {EXAMPLES[nextIndex]}
          </Animated.Text>
        )}
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: spacing.sm, // Match TextInput paddingVertical
    height: LINE_HEIGHT,
    overflow: 'hidden',
    justifyContent: 'flex-start',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  textContainer: {
    alignItems: 'center',
  },
  placeholder: {
    fontSize: fontSize.md,
    textAlign: 'center',
    height: LINE_HEIGHT,
    lineHeight: LINE_HEIGHT,
  },
})
