// =============================================================================
// MODAL CONSTANTS
// =============================================================================
// Dimension, animation, and opacity constants for modal components.
// =============================================================================

import { spacing } from '../spacing'

// -----------------------------------------------------------------------------
// Dimensions
// -----------------------------------------------------------------------------

/** Standard row height for modal field rows (48 + 4 = 52px) */
export const MODAL_ROW_HEIGHT = spacing['3xl'] + spacing.xs // 52

/** Drag handle / grabber width */
export const MODAL_GRABBER_WIDTH = spacing['2xl'] + spacing.xs // 36

/** Drag handle / grabber height */
export const MODAL_GRABBER_HEIGHT = spacing.xs + 1 // 5

/** Maximum width for chip labels (to prevent overflow) */
export const MODAL_CHIP_MAX_WIDTH = 100

/** Numeric keypad key height */
export const MODAL_KEY_HEIGHT = spacing['3xl'] // 48

// -----------------------------------------------------------------------------
// Snap Points (BottomSheetModal sizes)
// -----------------------------------------------------------------------------

/** Full modal - matches AddTransactionScreen (standard) */
export const MODAL_SNAP_FULL: string[] = ['90%']

/** Half-screen modal */
export const MODAL_SNAP_HALF: string[] = ['50%']

/** Compact modal for simple content */
export const MODAL_SNAP_COMPACT: string[] = ['45%']

/** Dynamic modal - expandable from half to full */
export const MODAL_SNAP_DYNAMIC: string[] = ['50%', '90%']

// -----------------------------------------------------------------------------
// Animation
// -----------------------------------------------------------------------------

/** Toast display duration in ms */
export const MODAL_TOAST_DURATION = 1500

/** Pulse animation duration in ms (for empty amount) */
export const MODAL_PULSE_DURATION = 1200

/** Fade animation duration in ms */
export const MODAL_FADE_DURATION = 150

// -----------------------------------------------------------------------------
// Opacity (for color overlays)
// -----------------------------------------------------------------------------

/** Soft overlay opacity (e.g., selected chip background) - 12.5% */
export const OPACITY_SOFT = '20'

/** Subtle overlay opacity (e.g., row highlight) - 9% */
export const OPACITY_SUBTLE = '15'

/** Border tint opacity - 25% */
export const OPACITY_BORDER = '40'
