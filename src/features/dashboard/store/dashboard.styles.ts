import type { useHoHTheme } from '@/providers'
import { StyleSheet } from 'react-native'
import { fontSize } from '@/theme/tokens/typography'

export function createDashboardStyles(theme: ReturnType<typeof useHoHTheme>) {
  const onPrimary = '#FFFFFF'

  return StyleSheet.create({
    modeRow: {
      paddingBottom: 0,
      borderBottomWidth: 1,
      borderBottomColor: theme.semantic.border,
      alignItems: 'center'
    },

    // Mode tabs - bookmark style (Overview, Assets, etc.)
    tab: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginRight: 4,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent'
    },

    tabSelected: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginRight: 4,
      borderBottomWidth: 2,
      borderBottomColor: theme.semantic.text // White underline
    },

    tabText: {
      color: theme.semantic.textSecondary,
      fontSize: fontSize.md,
      fontWeight: '500'
    },

    tabTextSelected: {
      color: theme.semantic.text, // White for selected tab
      fontSize: fontSize.md,
      fontWeight: '600'
    },

    body: {
      flex: 1,
      paddingTop: 14
    }
  })
}

export type DashboardStyles = ReturnType<typeof createDashboardStyles>
