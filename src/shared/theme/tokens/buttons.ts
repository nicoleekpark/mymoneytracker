// =============================================================================
// BUTTON DESIGN TOKENS
// =============================================================================
// Centralized constants for button sizing, touch targets, and feedback.
// Apple HIG recommends 44pt minimum touch target.
// =============================================================================

import type { Insets } from 'react-native'

// -----------------------------------------------------------------------------
// Touch Target Sizes
// -----------------------------------------------------------------------------

/** Minimum touch target size (Apple HIG) */
export const TOUCH_TARGET_MIN = 44

/** Standard icon button size */
export const BUTTON_ICON_SIZE = 44

/** Small icon button size (with hitSlop to reach 44pt) */
export const BUTTON_ICON_SMALL_SIZE = 32

/** Icon button with badge */
export const BUTTON_ICON_BADGE_SIZE = 40

/** Avatar button size */
export const BUTTON_AVATAR_SIZE = 32

/** FAB main button size */
export const FAB_SIZE = 56

/** FAB secondary button size */
export const FAB_SECONDARY_SIZE = 48

/** Standard row height for tappable rows */
export const ROW_TAPPABLE_HEIGHT = 52

// -----------------------------------------------------------------------------
// hitSlop Presets
// -----------------------------------------------------------------------------
// hitSlop extends the tappable area beyond the visible bounds.
// Use to ensure small elements meet 44pt minimum touch target.

/** No hitSlop (for full-width buttons) */
export const HIT_SLOP_NONE: Insets = { top: 0, right: 0, bottom: 0, left: 0 }

/** Small hitSlop for elements already close to 44pt */
export const HIT_SLOP_SM: Insets = { top: 4, right: 4, bottom: 4, left: 4 }

/** Medium hitSlop for 32-36pt elements */
export const HIT_SLOP_MD: Insets = { top: 8, right: 8, bottom: 8, left: 8 }

/** Large hitSlop for text links and small icons */
export const HIT_SLOP_LG: Insets = { top: 12, right: 12, bottom: 12, left: 12 }

/** Extra large hitSlop for very small elements */
export const HIT_SLOP_XL: Insets = { top: 16, right: 16, bottom: 16, left: 16 }

// Numeric versions for hitSlop={number} shorthand
export const HIT_SLOP_SM_VALUE = 4
export const HIT_SLOP_MD_VALUE = 8
export const HIT_SLOP_LG_VALUE = 12
export const HIT_SLOP_XL_VALUE = 16

// -----------------------------------------------------------------------------
// Opacity Feedback
// -----------------------------------------------------------------------------

/** Normal state */
export const OPACITY_NORMAL = 1.0

/** Pressed state */
export const OPACITY_PRESSED = 0.7

/** Disabled state */
export const OPACITY_DISABLED = 0.4

/** Muted press (for secondary actions) */
export const OPACITY_PRESSED_MUTED = 0.5

// -----------------------------------------------------------------------------
// Scale Animation Values (for ScalePressable)
// -----------------------------------------------------------------------------

/** Standard press scale */
export const SCALE_PRESSED = 0.96

/** Deep press scale (for emphasis) */
export const SCALE_PRESSED_DEEP = 0.94

// -----------------------------------------------------------------------------
// Icon Sizes
// -----------------------------------------------------------------------------

/** Standard icon size in buttons */
export const ICON_SIZE_SM = 14

/** Medium icon size */
export const ICON_SIZE_MD = 18

/** Large icon size */
export const ICON_SIZE_LG = 20

/** Extra large icon size (FAB) */
export const ICON_SIZE_XL = 24
