import { StyleSheet } from 'react-native'

import type { useHoHTheme } from '@/providers'

export function createScopeChipsStyles(theme: ReturnType<typeof useHoHTheme>) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    chip: {
      paddingHorizontal: 8,
      paddingVertical: 4
    },
    chipActive: {},
    chipText: {
      fontSize: 13,
      fontWeight: '400',
      color: theme.semantic.textSecondary,
      opacity: 0.6
    },
    chipTextActive: {
      color: theme.semantic.primary,
      fontWeight: '600',
      opacity: 1
    }
  })
}

export type ScopeChipsStyles = ReturnType<typeof createScopeChipsStyles>
