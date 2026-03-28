import React, { useMemo } from 'react'
import { Pressable, Text, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'

import { useHoHTheme } from '@/shared/providers'

import type { Scope } from '../types'
import { createScopeChipsStyles } from './ScopeChips.styles'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const SCOPES: ReadonlyArray<{ key: Scope; label: string }> = [
  { key: 'month', label: 'Monthly' },
  { key: 'year', label: 'Yearly' },
  { key: 'all', label: 'All' }
]

type Props = {
  value: Scope
  onChange: (scope: Scope) => void
}

function AnimatedChip({
  scope,
  isActive,
  onPress,
  styles
}: {
  scope: { key: Scope; label: string }
  isActive: boolean
  onPress: () => void
  styles: ReturnType<typeof createScopeChipsStyles>
}) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }))

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 })
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 })
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.chip, isActive && styles.chipActive, animatedStyle]}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
    >
      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
        {scope.label}
      </Text>
    </AnimatedPressable>
  )
}

export function ScopeChips({ value, onChange }: Props) {
  const theme = useHoHTheme()
  const styles = useMemo(() => createScopeChipsStyles(theme), [theme])

  return (
    <View style={styles.container}>
      {SCOPES.map((s) => (
        <AnimatedChip
          key={s.key}
          scope={s}
          isActive={s.key === value}
          onPress={() => onChange(s.key)}
          styles={styles}
        />
      ))}
    </View>
  )
}
