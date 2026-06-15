/**
 * SaveFAB
 *
 * Google Calendar-style floating action button for save actions.
 * - Tap: Opens menu with circular buttons stacked vertically
 * - Shows dimmed backdrop when menu is open
 * - Options appear above the main FAB with labels on the left
 */

import React, { useState } from 'react'
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
  onSaveAndClose,
  onSaveAndNew,
  onSaveAsDraft,
}: SaveFABProps) {
  const theme = useHoHTheme()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleFABPress = () => {
    if (disabled) return
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
      {/* Main FAB Button */}
      <TouchableOpacity
        onPress={handleFABPress}
        activeOpacity={0.8}
        disabled={disabled}
        style={[
          styles.fabMain,
          {
            bottom: bottomOffset,
            backgroundColor: disabled
              ? theme.semantic.primary + '60'
              : theme.semantic.primary,
          },
        ]}
      >
        <FontAwesome name="check" size={spacing.xl} color={theme.semantic.onPrimary} />
      </TouchableOpacity>

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
  fabMain: {
    position: 'absolute',
    right: spacing.xl,
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
