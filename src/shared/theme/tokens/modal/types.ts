// =============================================================================
// MODAL TYPES
// =============================================================================
// Type contracts for modal color requirements.
// =============================================================================

/**
 * Base colors required for modal field components.
 * Use this for simple field label color logic.
 */
export type ModalBaseColors = Readonly<{
  text: string
  textSecondary: string
}>

/**
 * Full color set for modal components.
 * Pass this from your theme to ensure consistency.
 */
export type ModalColors = Readonly<{
  // Base colors
  surface: string
  surfaceAlt: string
  text: string
  textSecondary: string
  border: string
  // Action colors
  primary: string
  onPrimary?: string
  // Status colors (optional - for warnings, estimated badges, etc.)
  warning?: string
  warningSoft?: string
  success?: string
  danger?: string
}>
