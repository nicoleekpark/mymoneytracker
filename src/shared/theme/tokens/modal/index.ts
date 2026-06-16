// =============================================================================
// MODAL DESIGN SYSTEM
// =============================================================================
// Universal modal patterns for bottom sheet modals.
// Split into focused modules for maintainability.
//
// Structure:
// - constants.ts  → Dimensions, durations, opacity values
// - types.ts      → Color type contracts
// - helpers.ts    → Dynamic style helper functions
// - core.styles   → Drag handle, header, CTA, toast, loading
// - field.styles  → Form fields, inputs, chips
// - detail.styles → Read-only detail views
// - selection.styles → Category/account pickers (feature-specific)
//
// Usage:
// For backward compatibility, import from '@/shared/theme/tokens/modal':
//   import { modalStyles, MODAL_ROW_HEIGHT } from '@/shared/theme/tokens/modal'
//
// For new code, prefer direct module imports:
//   import { coreStyles } from '@/shared/theme/tokens/modal/core.styles'
// =============================================================================

// Re-export constants
export {
  MODAL_ROW_HEIGHT,
  MODAL_GRABBER_WIDTH,
  MODAL_GRABBER_HEIGHT,
  MODAL_CHIP_MAX_WIDTH,
  MODAL_KEY_HEIGHT,
  MODAL_TOAST_DURATION,
  MODAL_PULSE_DURATION,
  MODAL_FADE_DURATION,
  OPACITY_SOFT,
  OPACITY_SUBTLE,
  OPACITY_BORDER,
  DRAG_SPRING_CONFIG,
  DRAG_SCALE_SPRING_CONFIG,
} from './constants'

// Re-export types
export type { ModalBaseColors, ModalColors } from './types'

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
} from './helpers'

// Re-export individual style modules
export { coreStyles } from './core.styles'
export { fieldStyles } from './field.styles'
export { detailStyles } from './detail.styles'
export { selectionStyles } from './selection.styles'
export { chipEditStyles } from './chipEdit.styles'
