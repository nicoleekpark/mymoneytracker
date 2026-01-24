import { StyleSheet } from 'react-native'

import type { useHoHTheme } from '@/providers'

export function createDashboardToolbarStyles(theme: ReturnType<typeof useHoHTheme>) {
  return StyleSheet.create({
    toolbar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
      paddingHorizontal: 4
    },
    periodSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2
    },
    chevronBtn: {
      padding: 8,
      borderRadius: 8
    },
    chevronBtnDisabled: {
      opacity: 0.3
    },
    chevronText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.semantic.text
    },
    periodBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 8,
      gap: 4
    },
    periodText: {
      fontSize: 17,
      fontWeight: '600',
      color: theme.semantic.text
    },
    chevronDown: {
      fontSize: 12,
      color: theme.semantic.textSecondary
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8
    },
    todayChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: theme.semantic.surfaceAlt
    },
    todayText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.semantic.text
    }
  })
}

export type DashboardToolbarStyles = ReturnType<typeof createDashboardToolbarStyles>
