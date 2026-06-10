// =============================================================================
// MODAL DESIGN SYSTEM - Universal Modal Patterns
// =============================================================================
// STRICT RULE: All bottom sheet modals MUST use these standard styles.
// This ensures visual consistency across AddTransaction, AddAccount, etc.
// Based on AddTransactionScreen spec as the reference implementation.
// =============================================================================

import { StyleSheet } from 'react-native'
import { fontSize, fontWeight, letterSpacing, displaySize } from './typography'
import { spacing } from './spacing'
import { radius } from './radius'

// -----------------------------------------------------------------------------
// Dimension Constants
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
// Animation Constants
// -----------------------------------------------------------------------------

/** Toast display duration in ms */
export const MODAL_TOAST_DURATION = 1500

/** Pulse animation duration in ms (for empty amount) */
export const MODAL_PULSE_DURATION = 1200

/** Fade animation duration in ms */
export const MODAL_FADE_DURATION = 150

// -----------------------------------------------------------------------------
// Color Types
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Helper Functions
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
    backgroundColor: isSelected ? colors.primary + '20' : colors.surfaceAlt,
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
  return baseColor ? baseColor + '15' : 'transparent'
}

// -----------------------------------------------------------------------------
// Pre-composed Modal Styles
// -----------------------------------------------------------------------------
// Import: import { modalStyles } from '@/shared/theme/tokens/modal'
// Usage: <View style={modalStyles.fieldRow}>...</View>
// For dynamic colors, combine with style array: [modalStyles.fieldRow, { borderColor: colors.border }]
// -----------------------------------------------------------------------------

export const modalStyles = StyleSheet.create({
  // ===========================================================================
  // DRAG HANDLE (Grabber)
  // ===========================================================================
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  dragHandle: {
    width: MODAL_GRABBER_WIDTH,
    height: MODAL_GRABBER_HEIGHT,
    borderRadius: radius.xs,
  },

  // ===========================================================================
  // HEADER
  // ===========================================================================
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  cancelButton: {
    paddingVertical: spacing.xs,
    paddingRight: spacing.md,
  },
  cancelText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },

  // ===========================================================================
  // CONTENT
  // ===========================================================================
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },

  // ===========================================================================
  // TYPE TABS
  // ===========================================================================
  typeTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    justifyContent: 'center',
  },
  typeTab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 3,
    marginBottom: -1,
  },
  typeTabText: {
    fontSize: fontSize.md,
  },
  typeTabContent: {
    alignItems: 'center',
  },
  typeTabBadge: {
    marginTop: spacing.xs - 2, // 2
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  typeTabBadgeText: {
    fontSize: 9, // FONT_SIZE_TINY
    fontWeight: fontWeight.medium,
  },

  // ===========================================================================
  // HERO AMOUNT
  // ===========================================================================
  heroContainer: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    marginBottom: spacing.lg,
  },
  heroTouchable: {
    alignItems: 'center',
  },
  heroAmount: {
    fontSize: displaySize.xl,
    fontWeight: fontWeight.heavy,
    letterSpacing: letterSpacing.tight * 5, // -1
  },
  heroHint: {
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  heroBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },

  // ===========================================================================
  // FIELD GROUP (Container for rows)
  // ===========================================================================
  fieldGroup: {
    // No background, no border radius - just rows with dividers
  },

  // ===========================================================================
  // FIELD ROW
  // ===========================================================================
  fieldRow: {
    position: 'relative',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingRight: spacing.xl, // room for chevron
    minHeight: MODAL_ROW_HEIGHT,
    borderBottomWidth: 1,
  },
  fieldRowLast: {
    borderBottomWidth: 0,
  },
  fieldRowNoBorder: {
    borderBottomWidth: 0,
  },

  // ===========================================================================
  // SECTION DIVIDER
  // ===========================================================================
  sectionDivider: {
    height: 1,
    marginVertical: spacing.xs,
  },

  // ===========================================================================
  // FIELD LABEL
  // ===========================================================================
  fieldLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.wider,
    marginBottom: spacing.sm,
  },
  optionalLabel: {
    fontWeight: fontWeight.normal,
    opacity: 0.7,
  },

  // ===========================================================================
  // FIELD INPUT
  // ===========================================================================
  fieldInputWrapper: {
    position: 'relative',
    width: '100%',
  },
  fieldInput: {
    width: '100%',
    fontSize: fontSize.md,
  },
  fieldInputPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  fieldPlaceholder: {
    fontSize: fontSize.sm,
    opacity: 0.5,
  },

  // ===========================================================================
  // FIELD VALUE
  // ===========================================================================
  fieldValue: {
    fontSize: fontSize.md,
  },
  fieldValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fieldValueTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  // ===========================================================================
  // ACCESSORIES (Chevron, Clear Button)
  // ===========================================================================
  chevron: {
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -(fontSize.lg / 2),
    fontSize: fontSize.lg,
  },
  chevronInline: {
    fontSize: fontSize.lg,
    marginLeft: spacing.xs,
  },
  clearButton: {
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -8,
    padding: spacing.xs,
  },

  // ===========================================================================
  // CHIPS (Quick actions, category/account selection)
  // ===========================================================================
  chipsScrollRow: {
    marginTop: -spacing.xs,
    marginBottom: spacing.md,
  },
  chipsContent: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    maxWidth: MODAL_CHIP_MAX_WIDTH,
  },
  chipEditButton: {
    width: spacing['2xl'],
    height: spacing['2xl'],
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },

  // ===========================================================================
  // MORE DETAILS
  // ===========================================================================
  moreDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    minHeight: MODAL_ROW_HEIGHT,
  },
  moreDetailsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  moreDetailsChevron: {
    fontSize: fontSize.lg,
  },

  // ===========================================================================
  // BADGE (Count indicators, status pills)
  // ===========================================================================
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  badgeDot: {
    width: spacing.xs + 2, // 6
    height: spacing.xs + 2, // 6
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: fontSize.xs,
  },

  // ===========================================================================
  // CTA BAR
  // ===========================================================================
  ctaContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  ctaContainerAbsolute: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  ctaPrimaryButton: {
    width: '100%',
    height: spacing['3xl'], // 48
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPrimaryText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  ctaSecondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  ctaTextButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  ctaTextButtonLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },

  // ===========================================================================
  // TOAST
  // ===========================================================================
  toast: {
    alignSelf: 'center',
    marginBottom: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  toastText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },

  // ===========================================================================
  // LOADING STATE
  // ===========================================================================
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'] * 2,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.sm,
  },

  // ===========================================================================
  // MODAL CONTAINER (Bottom Sheet)
  // ===========================================================================
  modal: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: 'hidden',
  },

  // ===========================================================================
  // TITLE (For standalone modals like AddAccount)
  // ===========================================================================
  titleContainer: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
  },

  // ===========================================================================
  // TAGS ROW
  // ===========================================================================
  tagsRow: {
    borderBottomWidth: 1,
  },

  // ===========================================================================
  // RECEIPT
  // ===========================================================================
  receiptPreview: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  receiptImage: {
    width: '100%',
    height: spacing['3xl'] * 4 + spacing.xs, // ~200
    borderRadius: radius.lg,
  },

  // ===========================================================================
  // HINT TEXT
  // ===========================================================================
  hint: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    fontStyle: 'italic',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },

  // ===========================================================================
  // SAVE BUTTON (For modals with single CTA)
  // ===========================================================================
  saveButtonContainer: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  saveButton: {
    paddingVertical: spacing.md + spacing.xs,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },

  // ===========================================================================
  // DESCRIPTION SUBTITLE (Hero area input)
  // ===========================================================================
  descSubtitle: {
    position: 'relative',
    width: '100%',
    maxWidth: 240,
    marginTop: spacing.md,
  },
  descSubtitleInput: {
    fontSize: fontSize.md,
    textAlign: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },

  // ===========================================================================
  // SELECTION SCREEN HEADER (Category/Account selection)
  // ===========================================================================
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  selectionHeaderLink: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    minWidth: 50,
  },
  selectionHeaderTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.heavy,
    textAlign: 'center',
    flex: 1,
  },
  selectionHeaderSpacer: {
    width: 50,
  },

  // ===========================================================================
  // SEARCH BOX
  // ===========================================================================
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    padding: 0,
  },
  searchIcon: {
    opacity: 0.5,
    marginRight: spacing.sm,
  },

  // ===========================================================================
  // SELECTION SECTION HEADER
  // ===========================================================================
  selectionSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  selectionSectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: letterSpacing.wider,
  },
  selectionSectionHint: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },

  // ===========================================================================
  // SELECTION CHIP ROW (Recent/Frequent quick picks)
  // ===========================================================================
  selectionChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  selectionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  selectionChipIcon: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionChipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  // ===========================================================================
  // SELECTION LIST (Category/Account list)
  // ===========================================================================
  selectionListContainer: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  selectionListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    minHeight: 56,
  },
  selectionListRowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionListRowContent: {
    flex: 1,
    gap: 2,
  },
  selectionListRowTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  selectionListRowSubtitle: {
    fontSize: fontSize.xs,
  },
  selectionListRowChevron: {
    fontSize: fontSize.lg,
  },

  // ===========================================================================
  // SELECTION GROUP (Grouped sections like "Everyday", "Monthly")
  // ===========================================================================
  selectionGroup: {
    marginTop: spacing.md,
  },
  selectionGroupTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },

  // ===========================================================================
  // SELECTION ADD BUTTON (Add Account link)
  // ===========================================================================
  selectionAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  selectionAddText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
})
