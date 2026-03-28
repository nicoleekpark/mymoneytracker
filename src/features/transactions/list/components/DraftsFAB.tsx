/**
 * DraftsFAB
 *
 * Floating Action Button that shows draft count.
 * Only visible when drafts > 0.
 * Tap action: Navigate to Transactions with "Drafts" filter selected.
 */

import { useHoHTheme } from '@/shared/providers'
import { useDraftsStore } from '@/shared/store'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'

type DraftsFABProps = {
  onPress: () => void
  bottomOffset?: number
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export function DraftsFAB({ onPress, bottomOffset = 0 }: DraftsFABProps) {
  const theme = useHoHTheme()
  const drafts = useDraftsStore((s) => s.drafts)
  const draftCount = drafts.length

  // Hooks must be called before any conditional returns
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(1) }],
  }))

  // Don't render if no drafts
  if (draftCount === 0) {
    return null
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[
        styles.fab,
        { backgroundColor: theme.semantic.warning, bottom: spacing.xl + bottomOffset },
        animatedStyle,
      ]}
    >
      <FontAwesome name="file-text-o" size={20} color="#000" />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{draftCount}</Text>
      </View>
    </AnimatedPressable>
  )
}

const FAB_SIZE = 56
const BADGE_SIZE = 22

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  badgeText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
})
