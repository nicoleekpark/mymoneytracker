// =============================================================================
// MODAL SELECTION STYLES
// =============================================================================
// Styles for selection screens: category picker, account picker, search.
// NOTE: These are feature-specific and may be moved to features/ later.
// =============================================================================

import { StyleSheet } from 'react-native'
import { fontSize, fontWeight, letterSpacing } from '../typography'
import { spacing } from '../spacing'
import { radius } from '../radius'

// -----------------------------------------------------------------------------
// Selection Styles
// -----------------------------------------------------------------------------

export const selectionStyles = StyleSheet.create({
  // ===========================================================================
  // SELECTION SCREEN HEADER
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
  // SELECTION LIST
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
  // SELECTION GROUP (Grouped sections)
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
  // SELECTION ADD BUTTON
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
