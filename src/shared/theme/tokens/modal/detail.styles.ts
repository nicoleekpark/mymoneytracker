// =============================================================================
// MODAL DETAIL STYLES
// =============================================================================
// Styles for read-only detail views: transaction details, account details.
// =============================================================================

import { StyleSheet } from 'react-native'
import { fontSize, fontWeight } from '../typography'
import { spacing } from '../spacing'
import { MODAL_ROW_HEIGHT, MODAL_INDICATOR_DOT_SIZE } from './constants'

// -----------------------------------------------------------------------------
// Detail Styles
// -----------------------------------------------------------------------------

export const detailStyles = StyleSheet.create({
  // ===========================================================================
  // DETAIL ROW (Horizontal layout: label left, value right)
  // ===========================================================================
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    minHeight: MODAL_ROW_HEIGHT,
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    flex: 0.35,
  },
  detailValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    flex: 0.65,
    textAlign: 'right',
  },
  detailValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    flex: 0.65,
  },

  // ===========================================================================
  // CLOSE BUTTON
  // ===========================================================================
  detailCloseButton: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.md,
    zIndex: 10,
    padding: spacing.sm,
  },

  // ===========================================================================
  // SECTION HEADER (e.g., "Items")
  // ===========================================================================
  detailSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  detailSectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  detailSectionSubtitle: {
    fontSize: fontSize.sm,
  },

  // ===========================================================================
  // NOTE SECTION (Full width text block)
  // ===========================================================================
  noteSection: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  noteSectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
  noteSectionText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: 20,
  },

  // ===========================================================================
  // ITEM ROW (For itemized transactions)
  // ===========================================================================
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  itemRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  itemRowDot: {
    width: MODAL_INDICATOR_DOT_SIZE,
    height: MODAL_INDICATOR_DOT_SIZE,
    borderRadius: MODAL_INDICATOR_DOT_SIZE / 2,
  },
  itemRowName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    flexShrink: 1,
  },
  itemRowQty: {
    fontSize: fontSize.xs,
  },
  itemRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemRowPrice: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    fontVariant: ['tabular-nums'],
  },
})
