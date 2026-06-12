// =============================================================================
// MODAL FIELD STYLES
// =============================================================================
// Styles for form fields: rows, labels, inputs, chips, tags.
// =============================================================================

import { StyleSheet } from 'react-native'
import { fontSize, fontWeight, letterSpacing } from '../typography'
import { spacing } from '../spacing'
import { radius } from '../radius'
import { MODAL_ROW_HEIGHT, MODAL_CHIP_MAX_WIDTH } from './constants'

// -----------------------------------------------------------------------------
// Base Row Properties (shared across row variants)
// -----------------------------------------------------------------------------

const baseRowProperties = {
  paddingVertical: spacing.md,
  borderBottomWidth: 1,
  minHeight: MODAL_ROW_HEIGHT,
} as const

// -----------------------------------------------------------------------------
// Field Styles
// -----------------------------------------------------------------------------

export const fieldStyles = StyleSheet.create({
  // ===========================================================================
  // FIELD GROUP (Container for rows)
  // ===========================================================================
  fieldGroup: {
    // No background, no border radius - just rows with dividers
  },

  // ===========================================================================
  // FIELD ROW (Vertical layout: label above input)
  // ===========================================================================
  fieldRow: {
    ...baseRowProperties,
    position: 'relative',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingRight: spacing.xl, // room for chevron
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
  // NOTE: fieldInput uses fontWeight.normal (400) intentionally.
  // This ensures native placeholders appear lighter than semibold/medium text.
  // Industry best practice: placeholders = normal weight + muted color.
  // ===========================================================================
  fieldInputWrapper: {
    position: 'relative',
    width: '100%',
  },
  fieldInput: {
    width: '100%',
    fontSize: fontSize.md,
    fontWeight: fontWeight.normal,  // Intentional: keeps placeholders light
  },
  fieldInputPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  fieldPlaceholder: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    opacity: 0.5,
  },

  // ===========================================================================
  // FIELD VALUE (Read-only display)
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
  // TAGS ROW
  // ===========================================================================
  tagsRow: {
    borderBottomWidth: 1,
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
})
