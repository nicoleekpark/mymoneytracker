/**
 * AmountKeypadSheet
 *
 * Bottom sheet with numeric keypad for amount entry.
 * Features:
 * - Spring-animated slide up/down
 * - "Estimated amount" toggle
 * - Clear/Done actions
 */

import React from 'react'
import {
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native'
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useHoHTheme } from '@/providers'
import { ScalePressable } from '@/shared/components'
import { fontSize, fontWeight } from '@/theme/tokens/typography'
import { spacing } from '@/theme/tokens/spacing'
import { radius } from '@/theme/tokens/radius'

type AmountKeypadSheetProps = {
  visible: boolean
  amountDisplay: string
  isEstimated: boolean
  onDigit: (digit: string) => void
  onBackspace: () => void
  onClear: () => void
  onEstimatedChange: (value: boolean) => void
  onDone: () => void
  onClose: () => void
}

export function AmountKeypadSheet({
  visible,
  amountDisplay,
  isEstimated,
  onDigit,
  onBackspace,
  onClear,
  onEstimatedChange,
  onDone,
  onClose,
}: AmountKeypadSheetProps) {
  const theme = useHoHTheme()

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <Animated.View
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(100)}
          style={styles.backdrop}
        />
      </Pressable>

      {/* Sheet */}
      <Animated.View
        entering={SlideInDown.duration(250)}
        exiting={SlideOutDown.duration(200)}
        style={[styles.sheet, { backgroundColor: theme.semantic.surface }]}
      >
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={[styles.handle, { backgroundColor: theme.semantic.border }]} />
        </View>

        {/* Amount preview */}
        <View style={styles.amountPreview}>
          <Text style={[styles.amountText, { color: theme.semantic.text }]}>
            {isEstimated ? '~' : ''}${amountDisplay}
          </Text>
        </View>

        {/* Estimated toggle */}
        <View style={[styles.estimatedRow, { backgroundColor: theme.semantic.surfaceAlt }]}>
          <View style={styles.estimatedLabel}>
            <Text style={[styles.estimatedIcon, { color: theme.semantic.warning }]}>~</Text>
            <Text style={[styles.estimatedText, { color: theme.semantic.text }]}>
              Estimated amount
            </Text>
          </View>
          <Switch
            value={isEstimated}
            onValueChange={onEstimatedChange}
            trackColor={{ false: theme.semantic.border, true: theme.semantic.warning }}
            thumbColor="#fff"
          />
        </View>

        {/* Keypad grid */}
        <View style={styles.keypad}>
          {/* Row 1: 1 2 3 */}
          <View style={styles.keypadRow}>
            {['1', '2', '3'].map((d) => (
              <ScalePressable
                key={d}
                onPress={() => onDigit(d)}
                style={[styles.key, { backgroundColor: theme.semantic.surfaceAlt }]}
              >
                <Text style={[styles.keyText, { color: theme.semantic.text }]}>{d}</Text>
              </ScalePressable>
            ))}
          </View>
          {/* Row 2: 4 5 6 */}
          <View style={styles.keypadRow}>
            {['4', '5', '6'].map((d) => (
              <ScalePressable
                key={d}
                onPress={() => onDigit(d)}
                style={[styles.key, { backgroundColor: theme.semantic.surfaceAlt }]}
              >
                <Text style={[styles.keyText, { color: theme.semantic.text }]}>{d}</Text>
              </ScalePressable>
            ))}
          </View>
          {/* Row 3: 7 8 9 */}
          <View style={styles.keypadRow}>
            {['7', '8', '9'].map((d) => (
              <ScalePressable
                key={d}
                onPress={() => onDigit(d)}
                style={[styles.key, { backgroundColor: theme.semantic.surfaceAlt }]}
              >
                <Text style={[styles.keyText, { color: theme.semantic.text }]}>{d}</Text>
              </ScalePressable>
            ))}
          </View>
          {/* Row 4: 00 0 ⌫ */}
          <View style={styles.keypadRow}>
            <ScalePressable
              onPress={() => {
                onDigit('0')
                onDigit('0')
              }}
              style={[styles.key, { backgroundColor: theme.semantic.surfaceAlt }]}
            >
              <Text style={[styles.keyText, { color: theme.semantic.text }]}>00</Text>
            </ScalePressable>
            <ScalePressable
              onPress={() => onDigit('0')}
              style={[styles.key, { backgroundColor: theme.semantic.surfaceAlt }]}
            >
              <Text style={[styles.keyText, { color: theme.semantic.text }]}>0</Text>
            </ScalePressable>
            <ScalePressable
              onPress={onBackspace}
              style={[styles.key, { backgroundColor: theme.semantic.surfaceAlt }]}
            >
              <FontAwesome name="long-arrow-left" size={20} color={theme.semantic.textSecondary} />
            </ScalePressable>
          </View>
          {/* Row 5: Clear (wide) + Done */}
          <View style={styles.keypadRow}>
            <ScalePressable
              onPress={onClear}
              style={[styles.key, styles.keyWide, { backgroundColor: theme.semantic.surfaceAlt }]}
            >
              <Text style={[styles.keyText, { color: theme.semantic.textSecondary }]}>Clear</Text>
            </ScalePressable>
            <ScalePressable
              onPress={onDone}
              style={[styles.key, { backgroundColor: theme.semantic.primary }]}
            >
              <Text style={[styles.keyText, { color: theme.semantic.onPrimary }]}>Done</Text>
            </ScalePressable>
          </View>
        </View>
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing['3xl'],
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  handle: {
    width: spacing['2xl'] + spacing.xs, // 36
    height: spacing.xs + 1, // 5
    borderRadius: radius.xs,
  },
  amountPreview: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  amountText: {
    fontSize: spacing['3xl'], // 48
    fontWeight: fontWeight.heavy,
    letterSpacing: -1,
  },
  estimatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
  },
  estimatedLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  estimatedIcon: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  estimatedText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  keypad: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  keypadRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  key: {
    flex: 1,
    height: spacing['3xl'], // 48
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyWide: {
    flex: 2,
  },
  keyText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
})
