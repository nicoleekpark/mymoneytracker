import { StyleSheet } from 'react-native'
import { fontSize, fontWeight, letterSpacing } from '@/shared/theme/tokens/typography'
import { spacing } from '@/shared/theme/tokens/spacing'
import { opacity } from '@/shared/theme/tokens/opacity'

export function createStatsRowStyles() {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
    },
    statBox: {
      flex: 1,
      padding: spacing.lg,
      alignItems: 'center',
    },
    label: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.medium,
      letterSpacing: letterSpacing.wider,
      marginBottom: spacing.xs,
    },
    value: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold,
      fontVariant: ['tabular-nums'],
    },
    divider: {
      width: 1,
      marginVertical: spacing.sm,
      opacity: opacity.divider,
    },
  })
}

export type StatsRowStyles = ReturnType<typeof createStatsRowStyles>
