/**
 * Backdrop overlay colors for modals, sheets, and overlays.
 * Use these constants instead of hardcoded rgba values.
 */
export const BACKDROP = {
  /** Light overlay (0.3) - subtle dimming, e.g., app bar dropdowns */
  light: 'rgba(0, 0, 0, 0.3)',
  /** Medium overlay (0.5) - standard modal backdrop */
  medium: 'rgba(0, 0, 0, 0.5)',
  /** Dark overlay (0.6) - prominent modals, category selection */
  dark: 'rgba(0, 0, 0, 0.6)',
  /** Heavy overlay (0.85) - high-emphasis overlays, FAB expanded state */
  heavy: 'rgba(0, 0, 0, 0.85)',
} as const

export type BackdropLevel = keyof typeof BACKDROP
