/**
 * ScalePressable
 *
 * A pressable component with subtle scale animation on press.
 * Uses react-native-reanimated for smooth 60fps animations.
 */

import React from 'react'
import { Pressable, type PressableProps, type ViewStyle } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

type ScalePressableProps = PressableProps & {
  scaleValue?: number // Scale when pressed (default 0.96)
  children: React.ReactNode
  style?: ViewStyle | ViewStyle[]
}

export function ScalePressable({
  scaleValue = 0.96,
  children,
  style,
  onPressIn,
  onPressOut,
  ...props
}: ScalePressableProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = (e: Parameters<NonNullable<PressableProps['onPressIn']>>[0]) => {
    scale.value = withSpring(scaleValue, {
      damping: 15,
      stiffness: 400,
    })
    onPressIn?.(e)
  }

  const handlePressOut = (e: Parameters<NonNullable<PressableProps['onPressOut']>>[0]) => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 400,
    })
    onPressOut?.(e)
  }

  return (
    <AnimatedPressable
      {...props}
      style={[style, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {children}
    </AnimatedPressable>
  )
}
