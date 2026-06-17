/**
 * SaveFAB
 *
 * Google Calendar-style floating action button for save actions.
 * - Tap: Opens menu with circular buttons stacked vertically
 * - Shows dimmed backdrop when menu is open
 * - Options appear above the main FAB with labels on the left
 * - Supports inline "Saved ✓" success state (Option D feedback)
 */

import React, { useState, useEffect } from 'react'
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import Animated, {
  FadeIn,
  FadeOut,
  FadeInUp,
  FadeOutDown,
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useHoHTheme } from '@/shared/providers'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import { spacing } from '@/shared/theme/tokens/spacing'
import { radius } from '@/shared/theme/tokens/radius'
import { BACKDROP } from '@/shared/theme/tokens/backdrop'

type SaveFABProps = {
  disabled?: boolean
  bottomOffset?: number
  /** Show success state ("Saved ✓") instead of normal checkmark */
  saved?: boolean
  onSaveAndClose: () => void
  onSaveAndNew: () => void
  onSaveAsDraft: () => void
}

// Button sizes using tokens (touch target compliant: 44pt minimum)
const MAIN_SIZE = spacing['3xl'] + spacing.sm // 48 + 8 = 56
const OPTION_SIZE = spacing['3xl'] // 48

export function SaveFAB({
  disabled,
  bottomOffset = spacing.xl,
  saved,
  onSaveAndClose,
  onSaveAndNew,
  onSaveAsDraft,
}: SaveFABProps) {
  const theme = useHoHTheme()
  const [menuOpen, setMenuOpen] = useState(false)

  // Animation for success state
  const scale = useSharedValue(1)
  const labelOpacity = useSharedValue(0)
  const labelTranslateX = useSharedValue(20)

  useEffect(() => {
    if (saved) {
      // Pop animation on success
      scale.value = withSequence(
        withSpring(1.15, { damping: 8, stiffness: 400 }),
        withSpring(1, { damping: 10, stiffness: 300 })
      )
      // Fade in label
      labelOpacity.value = withTiming(1, { duration: 200 })
      labelTranslateX.value = withSpring(0, { damping: 12, stiffness: 300 })
    } else {
      scale.value = 1
      labelOpacity.value = 0
      labelTranslateX.value = 20
    }
  }, [saved, scale, labelOpacity, labelTranslateX])

  const animatedFABStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const animatedLabelStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
    transform: [{ translateX: labelTranslateX.value }],
  }))

  const handleFABPress = () => {
    if (disabled || saved) return
    setMenuOpen(true)
  }

  const handleClose = () => {
    setMenuOpen(false)
  }

  const handleSaveAndClose = () => {
    setMenuOpen(false)
    setTimeout(() => onSaveAndClose(), 100)
  }

  const handleSaveAndNew = () => {
    setMenuOpen(false)
    setTimeout(() => onSaveAndNew(), 100)
  }

  const handleSaveAsDraft = () => {
    setMenuOpen(false)
    setTimeout(() => onSaveAsDraft(), 100)
  }

  return (
    <>
      {/* Main FAB Button - shows success state when saved */}
      <View style={[styles.fabContainer, { bottom: bottomOffset }]}>
        {/* "Saved" label that appears on success */}
        <Animated.Text
          style={[
            styles.savedLabel,
            { color: theme.semantic.success },
            animatedLabelStyle,
          ]}
        >
          Saved
        </Animated.Text>
        <Animated.View style={animatedFABStyle}>
          <TouchableOpacity
            onPress={handleFABPress}
            activeOpacity={0.8}
            disabled={disabled || saved}
            style={[
              styles.fabMain,
              {
                backgroundColor: saved
                  ? theme.semantic.success
                  : disabled
                  ? theme.semantic.primary + '60'
                  : theme.semantic.primary,
              },
            ]}
          >
            <FontAwesome name="check" size={spacing.xl} color={theme.semantic.onPrimary} />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Menu Modal */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="none"
        onRequestClose={handleClose}
      >
        {/* Dimmed Backdrop - 85% dark */}
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose}>
          <Animated.View
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(100)}
            style={styles.backdropOverlay}
          />
        </Pressable>

        {/* Menu Options - Positioned at bottom right, aligned to right edge */}
        <View
          style={[styles.menuContainer, { bottom: bottomOffset }]}
          pointerEvents="box-none"
        >
          {/* Draft - smallest, top */}
          <Animated.View
            entering={FadeInUp.duration(200).delay(80)}
            exiting={FadeOutDown.duration(100)}
            style={styles.menuRow}
          >
            <Text style={[styles.menuLabel, { color: theme.semantic.onPrimary }]}>Draft</Text>
            <TouchableOpacity
              onPress={handleSaveAsDraft}
              activeOpacity={0.8}
              style={[styles.fabOption, { backgroundColor: theme.semantic.warning }]}
            >
              <FontAwesome name="bookmark-o" size={fontSize.lg} color={theme.semantic.onPrimary} />
            </TouchableOpacity>
          </Animated.View>

          {/* Save & New - middle */}
          <Animated.View
            entering={FadeInUp.duration(200).delay(40)}
            exiting={FadeOutDown.duration(100)}
            style={styles.menuRow}
          >
            <Text style={[styles.menuLabel, { color: theme.semantic.onPrimary }]}>& New</Text>
            <TouchableOpacity
              onPress={handleSaveAndNew}
              activeOpacity={0.8}
              style={[styles.fabOption, { backgroundColor: theme.semantic.textSecondary }]}
            >
              <FontAwesome name="plus" size={fontSize.lg} color={theme.semantic.onPrimary} />
            </TouchableOpacity>
          </Animated.View>

          {/* Save & Close - Primary action, largest, bottom */}
          <Animated.View
            entering={FadeInUp.duration(200)}
            exiting={FadeOutDown.duration(100)}
            style={styles.menuRow}
          >
            <Text style={[styles.menuLabel, { color: theme.semantic.onPrimary }]}>Save & Close</Text>
            <TouchableOpacity
              onPress={handleSaveAndClose}
              activeOpacity={0.8}
              style={[styles.fabMainInMenu, { backgroundColor: theme.semantic.primary }]}
            >
              <FontAwesome name="check" size={spacing.xl} color={theme.semantic.onPrimary} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    right: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  savedLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  fabMain: {
    width: MAIN_SIZE,
    height: MAIN_SIZE,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: spacing.xs / 2 },
    shadowOpacity: 0.3,
    shadowRadius: spacing.xs,
    elevation: 6,
  },
  fabMainInMenu: {
    width: MAIN_SIZE,
    height: MAIN_SIZE,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: spacing.xs / 2 },
    shadowOpacity: 0.3,
    shadowRadius: spacing.xs,
    elevation: 6,
  },
  fabOption: {
    width: OPTION_SIZE,
    height: OPTION_SIZE,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: spacing.xs / 2 },
    shadowOpacity: 0.25,
    shadowRadius: spacing.xs - 1,
    elevation: 4,
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BACKDROP.heavy,
  },
  menuContainer: {
    position: 'absolute',
    right: spacing.xl,
    gap: spacing.lg,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  menuLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    // Color set inline via theme.semantic.onPrimary
  },
})
