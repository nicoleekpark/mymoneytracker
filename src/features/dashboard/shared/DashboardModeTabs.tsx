import React from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'

import type { DashboardMode } from '../types'
import type { DashboardStyles } from './DashboardScreen.styles'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

function AnimatedTab({
  mode,
  selected,
  onPress,
  styles
}: {
  mode: { key: DashboardMode; label: string }
  selected: boolean
  onPress: () => void
  styles: DashboardStyles
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
      style={[selected ? styles.tabSelected : styles.tab, animatedStyle]}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
    >
      <Text style={selected ? styles.tabTextSelected : styles.tabText}>{mode.label}</Text>
    </AnimatedPressable>
  )
}

export function DashboardModeTabs(props: {
  modes: ReadonlyArray<{ key: DashboardMode; label: string }>
  value: DashboardMode
  onChange: (m: DashboardMode) => void
  styles: DashboardStyles
}) {
  const { modes, value, onChange, styles } = props

  return (
    <View style={styles.modeRow}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
      >
        {modes.map((m) => (
          <AnimatedTab
            key={m.key}
            mode={m}
            selected={m.key === value}
            onPress={() => onChange(m.key)}
            styles={styles}
          />
        ))}
      </ScrollView>
    </View>
  )
}
