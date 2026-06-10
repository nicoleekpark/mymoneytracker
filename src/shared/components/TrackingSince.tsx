import React from 'react'
import { StyleSheet, Text } from 'react-native'
import { formatTrackingSince } from '@/shared/format/date'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import { spacing } from '@/shared/theme/tokens/spacing'

type TrackingSinceProps = {
  /** The date of the first transaction */
  date: Date | null
  /** Text color (typically textSecondary) */
  color: string
}

/**
 * Displays "Tracking since Mon YYYY" text.
 * Used in All scope views (Overview, Accounts, etc.)
 *
 * @example
 * ```tsx
 * <TrackingSince date={firstTransactionDate} color={colors.textSecondary} />
 * ```
 */
export function TrackingSince({ date, color }: TrackingSinceProps) {
  if (!date) return null

  return (
    <Text style={[styles.text, { color }]}>
      {formatTrackingSince(date)}
    </Text>
  )
}

const styles = StyleSheet.create({
  text: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textAlign: 'right',
    marginBottom: spacing.xs,
  },
})
