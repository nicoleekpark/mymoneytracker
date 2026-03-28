import { StyleSheet } from 'react-native'

import type { useHoHTheme } from '@/shared/providers'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import { spacing } from '@/shared/theme/tokens/spacing'

export function createScopeChipsStyles(theme: ReturnType<typeof useHoHTheme>) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    chip: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs
    },
    chipActive: {},
    chipText: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.normal,
      color: theme.semantic.textSecondary,
      opacity: 0.6
    },
    chipTextActive: {
      color: theme.semantic.text, // White for selected chip
      fontWeight: fontWeight.semibold,
      opacity: 1
    }
  })
}

export type ScopeChipsStyles = ReturnType<typeof createScopeChipsStyles>
