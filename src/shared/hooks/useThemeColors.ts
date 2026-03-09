import { useMemo } from 'react'
import { useHoHTheme } from '@/providers'
import type { StandardViewColors } from '@/theme/tokens/viewStyles'

/**
 * Returns memoized theme colors for view components.
 * Prevents unnecessary re-renders from new object references.
 *
 * @example
 * const colors = useThemeColors()
 * <MonthlyBody colors={colors} />
 */
export function useThemeColors(): StandardViewColors {
  const theme = useHoHTheme()

  return useMemo(
    () => ({
      text: theme.semantic.text,
      textSecondary: theme.semantic.textSecondary,
      border: theme.semantic.border,
      surface: theme.semantic.surface,
      surfaceAlt: theme.semantic.surfaceAlt,
      primary: theme.semantic.primary,
      success: theme.semantic.success,
      danger: theme.semantic.danger,
      warning: theme.semantic.warning,
    }),
    [theme]
  )
}

/**
 * Extended colors with highlight (used by MonthlyBody calendar).
 */
export type ExtendedViewColors = StandardViewColors & {
  highlight: string
}

export function useExtendedThemeColors(): ExtendedViewColors {
  const theme = useHoHTheme()

  return useMemo(
    () => ({
      text: theme.semantic.text,
      textSecondary: theme.semantic.textSecondary,
      border: theme.semantic.border,
      surface: theme.semantic.background,
      surfaceAlt: theme.semantic.surfaceAlt,
      primary: theme.semantic.primary,
      success: theme.semantic.success,
      danger: theme.semantic.danger,
      warning: theme.semantic.warning,
      highlight: theme.semantic.highlight,
    }),
    [theme]
  )
}
