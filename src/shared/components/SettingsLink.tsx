import FontAwesome from '@expo/vector-icons/FontAwesome'
import React from 'react'
import { Pressable, Text } from 'react-native'

import { OPACITY_PRESSED_MUTED } from '@/shared/theme/tokens/buttons'
import { spacing } from '@/shared/theme/tokens/spacing'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'

type Props = {
  label: string
  onPress: () => void
  color: string
}

/**
 * Settings link button used at the bottom of list screens.
 * Pattern: [gear icon] + label text in primary color, centered.
 *
 * Usage:
 * - AccountsBody: "Accounts Settings"
 * - AssetsBody: "Assets Settings"
 */
export function SettingsLink({ label, onPress, color }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.md,
        marginTop: spacing.lg,
        opacity: pressed ? OPACITY_PRESSED_MUTED : 1,
      })}
    >
      <FontAwesome name="cog" size={14} color={color} />
      <Text
        style={{
          fontSize: fontSize.sm,
          fontWeight: fontWeight.semibold,
          color,
        }}
      >
        {label}
      </Text>
    </Pressable>
  )
}
