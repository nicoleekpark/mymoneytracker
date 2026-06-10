// =============================================================================
// MODAL HELPERS
// =============================================================================
// Dynamic style helper functions for modal components.
// =============================================================================

import { OPACITY_SOFT, OPACITY_SUBTLE } from './constants'
import type { ModalBaseColors, ModalColors } from './types'

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
