/**
 * AnimatedQuickChip
 *
 * A quick action chip with animated background color on selection.
 * Combines scale animation (on press) and color animation (on selection change).
 */

import React, { useEffect } from 'react'
import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolateColor,
  Easing,
} from 'react-native-reanimated'
import { CategoryIcon } from '@/shared/components'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

type AnimatedQuickChipProps = {
  label: string
  icon: string
  iconColor: string
  selected: boolean
  selectedColor: string
  surfaceColor: string
  borderColor: string
  selectedBorderColor: string
  textColor: string
  onPress: () => void
  style?: ViewStyle
}

export function AnimatedQuickChip({
  label,
  icon,
  iconColor,
  selected,
  selectedColor,
  surfaceColor,
  borderColor: _borderColor,
  selectedBorderColor,
  textColor,
  onPress,
  style,
}: AnimatedQuickChipProps) {
  // Scale animation for press
  const scale = useSharedValue(1)

  // Color animation for selection
  const selectionProgress = useSharedValue(selected ? 1 : 0)

  // Animate selection changes
  useEffect(() => {
    selectionProgress.value = withTiming(selected ? 1 : 0, {
      duration: 200,
      easing: Easing.out(Easing.ease),
    })
  }, [selected, selectionProgress])

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      selectionProgress.value,
      [0, 1],
      [surfaceColor, selectedColor]
    )

    const border = interpolateColor(
      selectionProgress.value,
      [0, 1],
      ['transparent', selectedBorderColor]
    )

    return {
      transform: [{ scale: scale.value }],
      backgroundColor,
      borderColor: border,
    }
  })

  const handlePressIn = () => {
    scale.value = withSpring(0.96, {
      damping: 15,
      stiffness: 400,
    })
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 400,
    })
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.chip, style, animatedStyle]}
    >
      <CategoryIcon
        name={icon}
        size={14}
        color={iconColor}
      />
      <Text
        style={[styles.chipText, { color: textColor }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    maxWidth: 100,
  },
})
