import { StyleSheet } from 'react-native'

import type { useHoHTheme } from '@/providers'

export function createScopeChipsStyles(theme: ReturnType<typeof useHoHTheme>) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.semantic.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.semantic.border,
      overflow: 'hidden'
    },
    chip: {
      paddingHorizontal: 10,
      paddingVertical: 6
    },
    chipActive: {
      backgroundColor: theme.semantic.primary
    },
    chipText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.semantic.text
    },
    chipTextActive: {
      color: '#FFFFFF'
    }
  })
}

export type ScopeChipsStyles = ReturnType<typeof createScopeChipsStyles>
