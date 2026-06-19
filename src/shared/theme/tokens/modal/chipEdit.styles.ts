// =============================================================================
// CHIP EDIT MODAL STYLES
// =============================================================================
// Styles for chip edit/reorder modals (QuickChipsEditModal, PaymentChipsReorderModal).
// These modals share: header with Done button, draggable chip list, section titles.
// =============================================================================

import { StyleSheet } from 'react-native'
import { BACKDROP } from '../backdrop'
import { radius } from '../radius'
import { spacing } from '../spacing'
import { fontSize, fontWeight, letterSpacing } from '../typography'
import { MODAL_ROW_HEIGHT } from './constants'

export const chipEditStyles = StyleSheet.create({
  // ===========================================================================
  // CONTAINER
  // ===========================================================================
  gestureRoot: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: BACKDROP.medium,
  },
  sheet: {
    maxHeight: '80%',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },

  // ===========================================================================
  // HEADER (Title + Done button)
  // ===========================================================================
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  headerDone: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },

  // ===========================================================================
  // CONTENT
  // ===========================================================================
  content: {
    padding: spacing.lg,
  },

  // ===========================================================================
  // SECTION
  // ===========================================================================
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.wider,
    marginBottom: spacing.sm,
  },
  sectionTitleWithMargin: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.wider,
    marginBottom: spacing.sm,
    marginTop: spacing.xl,
  },
  dragHint: {
    fontSize: fontSize.xs,
    marginBottom: spacing.sm,
    marginTop: -spacing.xs,
  },

  // ===========================================================================
  // CHIPS LIST (Container for add items)
  // ===========================================================================
  chipsList: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },

  // ===========================================================================
  // CHIP ROW
  // ===========================================================================
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    minHeight: MODAL_ROW_HEIGHT,
  },
  chipRowAdd: {
    paddingLeft: spacing.lg,
  },
  labelContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  parentLabel: {
    fontSize: fontSize.xs,
    marginBottom: 1,
  },
  chipLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  chipType: {
    fontSize: fontSize.xs,
    marginRight: spacing.sm,
  },
  chipRemoveBtn: {
    padding: spacing.xs,
  },

  // ===========================================================================
  // EMPTY STATE
  // ===========================================================================
  emptyText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
})
