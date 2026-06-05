import { spacing } from '@/shared/theme/tokens/spacing'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import React from 'react'
import { Text, View } from 'react-native'

type EmptyStateColors = {
  text: string
  textSecondary: string
}

type Props = {
  title: string
  description?: string
  colors: EmptyStateColors
}

/**
 * Empty state component for screens/sections with no data.
 * Displays a centered message with optional description.
 */
export function EmptyState({ title, description, colors }: Props) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing['3xl'],
      }}
    >
      <Text
        style={{
          fontSize: fontSize.lg,
          fontWeight: fontWeight.semibold,
          color: colors.text,
          textAlign: 'center',
          marginBottom: spacing.sm,
        }}
      >
        {title}
      </Text>
      {description && (
        <Text
          style={{
            fontSize: fontSize.md,
            color: colors.textSecondary,
            textAlign: 'center',
            lineHeight: 22,
          }}
        >
          {description}
        </Text>
      )}
    </View>
  )
}
