import React, { useEffect, useCallback } from 'react'
import { StyleSheet, Text, Pressable, View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated'

import { fontSize, fontWeight, letterSpacing } from '@/shared/theme/tokens/typography'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'

const TOAST_DURATION = 5000 // 5 seconds

type Props = {
  visible: boolean
  message: string
  onUndo: () => void
  onDismiss: () => void
  theme: {
    text: string
    surface: string
    primary: string
    onPrimary: string
  }
}

export function UndoToast({ visible, message, onUndo, onDismiss, theme }: Props) {
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(50)
  const progress = useSharedValue(0)

  const handleDismiss = useCallback(() => {
    onDismiss()
  }, [onDismiss])

  useEffect(() => {
    if (visible) {
      // Animate in
      opacity.value = withTiming(1, { duration: 200 })
      translateY.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.cubic) })

      // Progress bar countdown
      progress.value = 0
      progress.value = withTiming(1, { duration: TOAST_DURATION, easing: Easing.linear })

      // Auto-dismiss after duration
      const timeout = setTimeout(() => {
        handleDismiss()
      }, TOAST_DURATION)

      return () => clearTimeout(timeout)
    } else {
      // Animate out
      opacity.value = withTiming(0, { duration: 150 })
      translateY.value = withTiming(50, { duration: 150 })
      progress.value = 0
    }
  }, [visible, handleDismiss, opacity, translateY, progress])

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }))

  const progressStyle = useAnimatedStyle(() => ({
    width: `${(1 - progress.value) * 100}%`,
  }))

  if (!visible) return null

  return (
    <Animated.View style={[styles.container, { backgroundColor: theme.text }, containerStyle]}>
      {/* Progress bar */}
      <Animated.View
        style={[
          styles.progressBar,
          { backgroundColor: theme.primary },
          progressStyle,
        ]}
      />

      <View style={styles.content}>
        <Text style={[styles.message, { color: theme.surface }]} numberOfLines={1}>
          {message}
        </Text>

        <Pressable onPress={onUndo} style={styles.undoButton}>
          <Text style={[styles.undoText, { color: theme.primary }]}>UNDO</Text>
        </Pressable>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing['3xl'],
    left: spacing.xl,
    right: spacing.xl,
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  message: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  undoButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  undoText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.wider,
  },
})
