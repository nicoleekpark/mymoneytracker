import { StyleSheet } from 'react-native'
import { displaySize, fontSize, fontWeight, letterSpacing } from '@/shared/theme/tokens/typography'
import { spacing } from '@/shared/theme/tokens/spacing'
import { opacity } from '@/shared/theme/tokens/opacity'

export function createDashboardHeroStyles() {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
      marginBottom: spacing.sm,
    },
    dayIndicator: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.medium,
      textAlign: 'right',
      marginBottom: spacing.xs,
    },
    label: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.medium,
      letterSpacing: letterSpacing.wider,
      marginBottom: spacing.sm,
    },
    primaryValue: {
      fontSize: displaySize.xl,
      fontWeight: fontWeight.heavy,
      letterSpacing: -1,
    },
    primaryValueMd: {
      fontSize: displaySize.md,
      fontWeight: fontWeight.bold,
    },
    primaryValueSm: {
      fontSize: displaySize.sm,
      fontWeight: fontWeight.bold,
    },
    comparison: {
      fontSize: fontSize.sm,
      marginTop: spacing.sm,
    },
    comparisonSmall: {
      fontSize: fontSize.sm,
      marginTop: spacing.xs,
    },
    supporting: {
      fontSize: fontSize.xs,
      marginTop: spacing.md,
      opacity: opacity.secondary,
    },
    nudge: {
      fontSize: fontSize.xs,
      marginTop: spacing.sm,
      opacity: opacity.tertiary,
      fontStyle: 'italic',
    },
    noIncomeSubtitle: {
      fontSize: fontSize.sm,
      marginTop: spacing.xs,
    },
  })
}

export type DashboardHeroStyles = ReturnType<typeof createDashboardHeroStyles>
