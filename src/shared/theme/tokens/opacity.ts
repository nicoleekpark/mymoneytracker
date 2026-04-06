// =============================================================================
// OPACITY TOKENS - Semantic Opacity Values
// =============================================================================
// Use these tokens instead of hardcoded opacity values for consistency.
// =============================================================================

/**
 * Semantic opacity values for consistent visual hierarchy.
 *
 * Usage:
 * - `divider` (0.5): Borders, separators, section dividers
 * - `tertiary` (0.6): Indicator dots, nudge text, subtle hints
 * - `muted` (0.7): Chart axes, loading states, disabled elements
 * - `secondary` (0.8): Subcategory text, supporting information
 */
export const opacity = {
  /** Borders, separators, section dividers */
  divider: 0.5,

  /** Indicator dots, nudge text, subtle hints */
  tertiary: 0.6,

  /** Chart axes, loading states, disabled elements */
  muted: 0.7,

  /** Subcategory text, supporting information */
  secondary: 0.8,
} as const

export type OpacityToken = keyof typeof opacity
