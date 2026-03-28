import React from 'react'
import { Text, View } from 'react-native'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import { spacing } from '@/shared/theme/tokens/spacing'
import type { BaseViewColors } from '@/shared/theme/tokens/viewStyles'

type Props = {
  title: string
  /** Optional text displayed on the right side (bold, same size as title) */
  rightText?: string
  /** Color for rightText - defaults to colors.text */
  rightColor?: string
  /** Optional small label on the right (smaller than rightText) */
  rightLabel?: string
  /** Optional description below the title */
  description?: string
  /** Theme colors - requires at least text, textSecondary, border */
  colors: Pick<BaseViewColors, 'text' | 'textSecondary' | 'border'>
}

/**
 * Section header with divider above.
 * Used across all dashboard views for consistent section styling.
 */
export function SectionHeader({
  title,
  rightText,
  rightColor,
  rightLabel,
  description,
  colors
}: Props) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      {/* Divider above section */}
      <View
        style={{
          height: 1,
          backgroundColor: colors.border,
          marginBottom: spacing.lg,
          opacity: 0.5
        }}
      />
      {/* Title row */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text
          style={{
            fontSize: fontSize.lg,
            fontWeight: fontWeight.semibold,
            color: colors.text
          }}
        >
          {title}
        </Text>
        {/* Right text - bold, same size as title */}
        {rightText && (
          <Text
            style={{
              marginLeft: 'auto',
              fontSize: fontSize.lg,
              fontWeight: fontWeight.semibold,
              color: rightColor || colors.text
            }}
          >
            {rightText}
          </Text>
        )}
        {/* Right label - smaller, secondary style */}
        {rightLabel && !rightText && (
          <Text
            style={{
              marginLeft: 'auto',
              fontSize: fontSize.sm,
              fontWeight: fontWeight.medium,
              color: colors.textSecondary
            }}
          >
            {rightLabel}
          </Text>
        )}
      </View>
      {/* Optional description below title */}
      {description && (
        <Text
          style={{
            fontSize: fontSize.xs,
            color: colors.textSecondary,
            marginTop: spacing.sm
          }}
        >
          {description}
        </Text>
      )}
    </View>
  )
}
