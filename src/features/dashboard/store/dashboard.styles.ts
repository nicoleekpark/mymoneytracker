import type { useHoHTheme } from '@/providers'
import { StyleSheet } from 'react-native'

export function createDashboardStyles(theme: ReturnType<typeof useHoHTheme>) {
  const onPrimary = '#FFFFFF'

  return StyleSheet.create({
    modeRow: {
      paddingBottom: 10
    },

    // Mode tabs (Overview, Cash Flow, etc.)
    pill: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      marginRight: 8,
      backgroundColor: theme.semantic.surface,
      borderColor: theme.semantic.border
    },

    pillSelected: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      marginRight: 8,
      backgroundColor: theme.semantic.primary,
      borderColor: theme.semantic.primary
    },

    pillText: {
      color: theme.semantic.text,
      fontSize: 13,
      fontWeight: '600'
    },

    pillTextSelected: {
      color: onPrimary,
      fontSize: 13,
      fontWeight: '700'
    },

    divider: {
      height: 1,
      backgroundColor: theme.semantic.border
    },

    body: {
      flex: 1,
      paddingTop: 14
    }
  })
}

export type DashboardStyles = ReturnType<typeof createDashboardStyles>
