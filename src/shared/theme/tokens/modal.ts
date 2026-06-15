// =============================================================================
// MODAL DESIGN SYSTEM - Re-export
// =============================================================================
// This file re-exports from ./modal/ for backward compatibility.
// All modal design system code is now in the ./modal/ folder.
//
// Existing imports will continue to work:
//   import { modalStyles, MODAL_ROW_HEIGHT } from '@/shared/theme/tokens/modal'
//
// For new code, prefer direct module imports:
//   import { coreStyles } from '@/shared/theme/tokens/modal/core.styles'
//   import { fieldStyles } from '@/shared/theme/tokens/modal/field.styles'
// =============================================================================

// Re-export constants
export {
  MODAL_ROW_HEIGHT,
  MODAL_GRABBER_WIDTH,
  MODAL_GRABBER_HEIGHT,
  MODAL_CHIP_MAX_WIDTH,
  MODAL_KEY_HEIGHT,
  MODAL_INDICATOR_DOT_SIZE,
  MODAL_TOAST_DURATION,
  MODAL_PULSE_DURATION,
  MODAL_FADE_DURATION,
  OPACITY_SOFT,
  OPACITY_SUBTLE,
  OPACITY_BORDER,
  // Snap points
  MODAL_SNAP_FULL,
  MODAL_SNAP_HALF,
  MODAL_SNAP_COMPACT,
  MODAL_SNAP_DYNAMIC,
} from './modal/constants'

// Re-export types
export type { ModalBaseColors, ModalColors } from './modal/types'

// Re-export helpers
export {
  // Style helpers
  getFieldLabelColor,
  getChipStyle,
  getTabStyle,
  getRowHighlightColor,
  // Safe area padding helpers
  getSheetBottomPadding,
  getScrollContentPadding,
  getScrollContentWithCTAPadding,
  getScrollContentWithSimpleCTAPadding,
} from './modal/helpers'

// Re-export individual style modules
export { coreStyles } from './modal/core.styles'
export { fieldStyles } from './modal/field.styles'
export { detailStyles } from './modal/detail.styles'
export { selectionStyles } from './modal/selection.styles'
export { chipEditStyles } from './modal/chipEdit.styles'

// Import and compose modalStyles for backward compatibility
import { coreStyles } from './modal/core.styles'
import { fieldStyles } from './modal/field.styles'
import { detailStyles } from './modal/detail.styles'
import { selectionStyles } from './modal/selection.styles'
import { chipEditStyles } from './modal/chipEdit.styles'

/**
 * Combined modal styles for backward compatibility.
 * Prefer importing specific style modules for new code.
 */
export const modalStyles = {
  ...coreStyles,
  ...fieldStyles,
  ...detailStyles,
  ...selectionStyles,
  ...chipEditStyles,
} as const
