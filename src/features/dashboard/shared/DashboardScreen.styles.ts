import type { useHoHTheme } from '@/shared/providers'
import { StyleSheet } from 'react-native'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import { spacing } from '@/shared/theme/tokens/spacing'

export function createDashboardStyles(theme: ReturnType<typeof useHoHTheme>) {
  return StyleSheet.create({
    modeRow: {
      paddingBottom: 0,
      borderBottomWidth: 1,
      borderBottomColor: theme.semantic.border,
      alignItems: 'center'
    },

    // Mode tabs - bookmark style (Overview, Assets, etc.)
    tab: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      marginRight: spacing.xs,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent'
    },

    tabSelected: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      marginRight: spacing.xs,
      borderBottomWidth: 2,
      borderBottomColor: theme.semantic.text // White underline
    },

    tabText: {
      color: theme.semantic.textSecondary,
      fontSize: fontSize.md,
      fontWeight: fontWeight.medium
    },

    tabTextSelected: {
      color: theme.semantic.text, // White for selected tab
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold
    },

    body: {
      flex: 1,
      paddingTop: spacing.md
    }
  })
}

export type DashboardStyles = ReturnType<typeof createDashboardStyles>
