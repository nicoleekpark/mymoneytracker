// =============================================================================
// MODAL HELPERS
// =============================================================================
// Dynamic style helper functions for modal components.
// =============================================================================

import { spacing } from '../spacing'
import { OPACITY_SOFT, OPACITY_SUBTLE } from './constants'
import type { ModalBaseColors, ModalColors } from './types'

// -----------------------------------------------------------------------------
// Safe Area Padding Helpers
// -----------------------------------------------------------------------------

/**
 * Get bottom padding for bottom sheet content.
 * Use for sheet containers that need safe area + standard padding.
 */
export function getSheetBottomPadding(safeAreaBottom: number): number {
  return safeAreaBottom + spacing.lg
}

/**
 * Get bottom padding for scrollable content in modals.
 * Use for ScrollView/FlatList contentContainerStyle.
 */
export function getScrollContentPadding(safeAreaBottom: number): number {
  return safeAreaBottom + spacing.xl
}

/**
 * Get bottom padding for scroll content with full CTA bar (button + secondary actions).
 * Provides enough space for content to scroll above fixed CTA.
 */
export function getScrollContentWithCTAPadding(safeAreaBottom: number, keyboardHeight = 0): number {
  const CTA_AREA_HEIGHT = spacing['3xl'] * 3 // 144px - button + secondary actions
  return safeAreaBottom + CTA_AREA_HEIGHT + keyboardHeight
}

/**
 * Get bottom padding for scroll content with simple CTA bar (single button only).
 * Use for screens with just one primary action button.
 */
export function getScrollContentWithSimpleCTAPadding(safeAreaBottom: number, keyboardHeight = 0): number {
  const CTA_AREA_HEIGHT = spacing['3xl'] * 2 // 96px - single button
  return safeAreaBottom + CTA_AREA_HEIGHT + keyboardHeight
}

// -----------------------------------------------------------------------------
// Style Helpers
// -----------------------------------------------------------------------------

/**
 * Get field label color based on whether the field has a value.
 * Labels float up and become secondary when a value is present.
 */
export function getFieldLabelColor(isFilled: boolean, colors: ModalBaseColors): string {
  return isFilled ? colors.textSecondary : colors.text
}

/**
 * Get chip style based on selection state.
 * Selected chips have primary background tint and border.
 */
export function getChipStyle(
  isSelected: boolean,
  colors: ModalColors
): { backgroundColor: string; borderColor: string } {
  return {
    backgroundColor: isSelected ? colors.primary + OPACITY_SOFT : colors.surfaceAlt,
    borderColor: isSelected ? colors.primary : colors.border,
  }
}

/**
 * Get tab style based on selection and disabled state.
 * Returns style properties for the tab element.
 */
export function getTabStyle(
  isSelected: boolean,
  isDisabled: boolean,
  colors: ModalColors
): {
  borderBottomColor: string
  color: string
  fontWeight: string
  opacity: number
} {
  return {
    borderBottomColor: isSelected && !isDisabled ? colors.primary : 'transparent',
    color: isDisabled
      ? colors.textSecondary
      : isSelected
        ? colors.text
        : colors.textSecondary,
    fontWeight: isSelected && !isDisabled ? '700' : '500',
    opacity: isDisabled ? 0.5 : 1,
  }
}

/**
 * Get row highlight background color for validation errors or selection feedback.
 */
export function getRowHighlightColor(
  type: 'primary' | 'warning',
  colors: ModalColors
): string {
  const baseColor = type === 'warning' ? colors.warning : colors.primary
  return baseColor ? baseColor + OPACITY_SUBTLE : 'transparent'
}
