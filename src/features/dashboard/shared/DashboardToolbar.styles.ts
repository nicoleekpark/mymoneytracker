import { StyleSheet } from 'react-native'

import type { useHoHTheme } from '@/providers'
import { fontSize } from '@/theme/tokens/typography'
import { radius } from '@/theme/tokens/radius'

export function createDashboardToolbarStyles(theme: ReturnType<typeof useHoHTheme>) {
  return StyleSheet.create({
    toolbar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 40,
      paddingHorizontal: 2
    },
    periodSection: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 40,
      gap: 0
    },
    chevronBtn: {
      padding: 6,
      borderRadius: radius.sm
    },
    chevronBtnDisabled: {
      opacity: 0.3
    },
    chevronText: {
      fontSize: fontSize.md,
      fontWeight: '600',
      color: theme.semantic.text
    },
    periodBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 4,
      paddingVertical: 4,
      borderRadius: radius.sm
    },
    periodText: {
      fontSize: fontSize.lg,
      fontWeight: '600',
      color: theme.semantic.text
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2
    },
    todayChip: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent'
    },
    todayText: {
      fontSize: fontSize.sm,
      fontWeight: '500',
      color: theme.semantic.textSecondary
    }
  })
}

export type DashboardToolbarStyles = ReturnType<typeof createDashboardToolbarStyles>
