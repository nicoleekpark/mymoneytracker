// =============================================================================
// VIEW STYLES - Universal Design System
// =============================================================================
// STRICT RULE: All views/pages MUST use these standard types and styles.
// This ensures visual consistency across the entire app.
// =============================================================================

import { fontSize, fontWeight, displaySize } from './typography'
import { spacing } from './spacing'
import { radius } from './radius'
import { opacity } from './opacity'

// -----------------------------------------------------------------------------
// Standard Color Types - USE THESE FOR ALL VIEWS
// -----------------------------------------------------------------------------
// RULE: Never create custom color types. Always extend from BaseViewColors.
// RULE: Never use 'textMuted' - always use 'textSecondary'.
// -----------------------------------------------------------------------------

/**
 * Base colors required by all views.
 * Extend this type when a view needs additional semantic colors.
 */
export type BaseViewColors = Readonly<{
  text: string
  textSecondary: string  // NEVER use 'textMuted'
  border: string
  surface: string
  surfaceAlt: string
}>

/**
 * Standard view colors with semantic status colors.
 * Use this for most dashboard/feature views.
 */
export type StandardViewColors = BaseViewColors & Readonly<{
  primary: string
  success: string
  danger: string
  warning: string
}>

/**
 * Create StandardViewColors from theme semantic colors.
 * Use this helper in DashboardScreen and other parent components.
 */
export function createViewColors(semantic: {
  text: string
  textSecondary: string
  border: string
  surface: string
  surfaceAlt: string
  primary: string
  success: string
  danger: string
  warning: string
}): StandardViewColors {
  return {
    text: semantic.text,
    textSecondary: semantic.textSecondary,
    border: semantic.border,
    surface: semantic.surface,
    surfaceAlt: semantic.surfaceAlt,
    primary: semantic.primary,
    success: semantic.success,
    danger: semantic.danger,
    warning: semantic.warning,
  }
}

// -----------------------------------------------------------------------------
// Component Size Constants
// -----------------------------------------------------------------------------
// Use these instead of raw numbers for consistent sizing across the app.
// -----------------------------------------------------------------------------

/** Category indicator dot (10x10) - used in category lists */
export const CATEGORY_DOT_SIZE = 10

/** Small category dot (8x8) - used in transaction rows */
export const CATEGORY_DOT_SIZE_SM = 8

/**
 * @deprecated Use MODAL_GRABBER_WIDTH from '@/shared/theme/tokens/modal' instead.
 */
export const GRABBER_WIDTH = 36
/**
 * @deprecated Use MODAL_GRABBER_HEIGHT from '@/shared/theme/tokens/modal' instead.
 */
export const GRABBER_HEIGHT = 4

/** Small badge/pill dimensions for filter counts, type indicators */
export const BADGE_MIN_SIZE = spacing.md  // 16px

/** Tiny font size for badges and info indicators (not in fontSize scale) */
export const FONT_SIZE_TINY = 9
export const FONT_SIZE_BADGE = 10

/** Fallback color for uncategorized/unknown items */
export const UNCATEGORIZED_COLOR = '#888'

// -----------------------------------------------------------------------------
// Pre-composed Component Styles
// -----------------------------------------------------------------------------
// Use these for consistent styling across all views.
// Import: import { componentStyles } from '@/shared/theme/tokens/viewStyles'
// -----------------------------------------------------------------------------

export const componentStyles = {
  // ---------------------------------------------------------------------------
  // Section Headers
  // ---------------------------------------------------------------------------
  sectionHeader: {
    title: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.semibold,
    },
    divider: {
      height: 1,
      marginBottom: spacing.lg,
      opacity: opacity.divider,
    },
  },

  // ---------------------------------------------------------------------------
  // Hero Section (large centered display)
  // ---------------------------------------------------------------------------
  hero: {
    label: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.medium,
      letterSpacing: 0.5,
      marginBottom: spacing.sm,
    },
    value: {
      fontSize: displaySize.xl, // 48px
      fontWeight: fontWeight.heavy,
      letterSpacing: -1,
    },
    subtitle: {
      fontSize: fontSize.sm,
      marginTop: spacing.sm,
    },
  },

  // ---------------------------------------------------------------------------
  // Stat Cards (two-column layout like Accessible/Tied up)
  // ---------------------------------------------------------------------------
  statCard: {
    container: {
      flex: 1,
      padding: spacing.lg,
      alignItems: 'center' as const,
    },
    label: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.medium,
      letterSpacing: 0.5,
      marginBottom: spacing.xs,
    },
    value: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold,
    },
    hint: {
      fontSize: fontSize.xs,
      marginTop: spacing.xs,
    },
  },

  // ---------------------------------------------------------------------------
  // List Rows
  // ---------------------------------------------------------------------------
  listRow: {
    container: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
    },
    title: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
    },
    subtitle: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.medium,
    },
    amount: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      fontVariant: ['tabular-nums'] as const,
    },
  },

  // ---------------------------------------------------------------------------
  // Category Rows (expandable lists)
  // ---------------------------------------------------------------------------
  categoryRow: {
    label: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
    },
    amount: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      fontVariant: ['tabular-nums'] as const,
    },
    subItem: {
      label: {
        fontSize: fontSize.xs,
      },
      amount: {
        fontSize: fontSize.xs,
        fontVariant: ['tabular-nums'] as const,
      },
    },
  },

  // ---------------------------------------------------------------------------
  // Form Fields
  // ---------------------------------------------------------------------------
  formField: {
    label: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.medium,
      letterSpacing: 0.5,
      marginBottom: spacing.sm,
    },
    value: {
      fontSize: fontSize.md,
    },
    placeholder: {
      fontSize: fontSize.sm,
      opacity: opacity.divider,
    },
  },

  // ---------------------------------------------------------------------------
  // Info Indicators (tappable info buttons)
  // ---------------------------------------------------------------------------
  infoIndicator: {
    container: {
      width: 14,
      height: 14,
      borderRadius: radius.full,
      borderWidth: 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      opacity: opacity.tertiary,
    },
    text: {
      fontSize: FONT_SIZE_TINY,  // 9px - below minimum scale for tiny indicators
      fontWeight: fontWeight.bold,
    },
  },

  // ---------------------------------------------------------------------------
  // Badges/Pills
  // ---------------------------------------------------------------------------
  badge: {
    container: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.full,
      borderWidth: 1,
    },
    text: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
    },
  },

  // ---------------------------------------------------------------------------
  // Chart Labels
  // ---------------------------------------------------------------------------
  chartLabel: {
    axis: {
      fontSize: fontSize.xs,
      opacity: opacity.muted,
    },
    value: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.medium,
    },
  },

  // ---------------------------------------------------------------------------
  // Empty States
  // ---------------------------------------------------------------------------
  emptyState: {
    title: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.semibold,
      textAlign: 'center' as const,
    },
    subtitle: {
      fontSize: fontSize.md,
      textAlign: 'center' as const,
      lineHeight: 20,
    },
  },
} as const

// -----------------------------------------------------------------------------
// Layout Constants
// -----------------------------------------------------------------------------
/** Standard spacing between major sections */
export const SECTION_GAP = spacing['2xl']

// -----------------------------------------------------------------------------
// List Layout Constants (for SectionList/FlatList getItemLayout)
// -----------------------------------------------------------------------------
/** Transaction list row height - fixed for consistent scrolling */
export const LIST_ROW_HEIGHT = 56

/** Section header height (day headers in transaction list) */
export const LIST_SECTION_HEADER_HEIGHT = 40

/** List item separator height */
export const LIST_SEPARATOR_HEIGHT = 1

/** Tab bar height - used by tab navigator and FAB positioning */
export const TAB_BAR_HEIGHT = 72

/** Tab bar icon size */
export const TAB_BAR_ICON_SIZE = 20

/** Tab bar icon vertical offset - aligns icon visually in tab bar */
export const TAB_BAR_ICON_OFFSET = -3

// -----------------------------------------------------------------------------
// Numeric Display Rules
// -----------------------------------------------------------------------------
// RULE: Always use fontVariant: ['tabular-nums'] for amounts in columns/tables.
// This ensures digits have equal width for proper alignment.
// -----------------------------------------------------------------------------
export const numericStyles = {
  tabular: {
    fontVariant: ['tabular-nums'] as const,
  },
  amount: {
    fontWeight: fontWeight.semibold,
    fontVariant: ['tabular-nums'] as const,
  },
  percentage: {
    fontWeight: fontWeight.medium,
    fontVariant: ['tabular-nums'] as const,
  },
} as const
