import React from 'react'
import { Text, View } from 'react-native'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import { spacing } from '@/shared/theme/tokens/spacing'
import { radius } from '@/shared/theme/tokens/radius'

type PlaceholderColors = {
  textSecondary: string
  surfaceAlt: string
}

type Props = {
  message: string
  subMessage?: string
  colors: PlaceholderColors
}

/**
 * Placeholder content for sections that need more data.
 * Shows a muted visual hint with explanation text.
 */
export function SectionPlaceholder({ message, subMessage, colors }: Props) {
  return (
    <View
      style={{
        alignItems: 'center',
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.lg,
        backgroundColor: colors.surfaceAlt,
        borderRadius: radius.lg,
      }}
    >
      {/* Visual placeholder - dotted line chart silhouette */}
      <View
        style={{
          width: '100%',
          height: 60,
          marginBottom: spacing.lg,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: '80%',
            height: 1,
            borderStyle: 'dashed',
            borderWidth: 1,
            borderColor: colors.textSecondary,
            opacity: 0.3,
          }}
        />
      </View>

      <Text
        style={{
          fontSize: fontSize.sm,
          fontWeight: fontWeight.medium,
          color: colors.textSecondary,
          textAlign: 'center',
        }}
      >
        {message}
      </Text>
      {subMessage && (
        <Text
          style={{
            fontSize: fontSize.xs,
            color: colors.textSecondary,
            textAlign: 'center',
            marginTop: spacing.xs,
            opacity: 0.7,
          }}
        >
          {subMessage}
        </Text>
      )}
    </View>
  )
}
