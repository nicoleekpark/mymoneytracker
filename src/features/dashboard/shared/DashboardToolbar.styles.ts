import { StyleSheet } from 'react-native'

import type { useHoHTheme } from '@/shared/providers'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'

// Component-specific size
const TOOLBAR_HEIGHT = 40

export function createDashboardToolbarStyles(theme: ReturnType<typeof useHoHTheme>) {
  return StyleSheet.create({
    toolbar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: TOOLBAR_HEIGHT,
      paddingHorizontal: spacing.xs / 2 // 2
    },
    periodSection: {
      flexDirection: 'row',
      alignItems: 'center',
      height: TOOLBAR_HEIGHT,
      gap: 0
    },
    chevronBtn: {
      padding: spacing.sm - spacing.xs / 2, // 6
      borderRadius: radius.sm
    },
    chevronBtnDisabled: {
      opacity: 0.3
    },
    chevronText: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      color: theme.semantic.text
    },
    periodBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xs,
      borderRadius: radius.sm
    },
    periodText: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.semibold,
      color: theme.semantic.text
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs / 2 // 2
    },
    todayChip: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent'
    },
    todayText: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      color: theme.semantic.textSecondary
    }
  })
}

export type DashboardToolbarStyles = ReturnType<typeof createDashboardToolbarStyles>
