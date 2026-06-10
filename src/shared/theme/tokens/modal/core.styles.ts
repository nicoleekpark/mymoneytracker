// =============================================================================
// MODAL CORE STYLES
// =============================================================================
// Base modal styles: drag handle, header, content, CTA bar, toast, loading.
// =============================================================================

import { StyleSheet } from 'react-native'
import { fontSize, fontWeight, letterSpacing, displaySize } from '../typography'
import { spacing } from '../spacing'
import { radius } from '../radius'
import { MODAL_GRABBER_WIDTH, MODAL_GRABBER_HEIGHT, MODAL_ROW_HEIGHT } from './constants'

export const coreStyles = StyleSheet.create({
  // ===========================================================================
  // MODAL CONTAINER (Bottom Sheet)
  // ===========================================================================
  modal: {
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    overflow: 'hidden',
  },

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
  ctaDangerTextButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  ctaDangerTextButtonLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },

  // ===========================================================================
  // SAVE BUTTON (Alias for single CTA modals)
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
  // MORE DETAILS ROW
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
  // TEXT STYLES (Common text patterns in modals)
  // ===========================================================================

  /** Bold title text - for modal headers, section titles */
  textTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.heavy,
  },

  /** Secondary link text - for cancel, back buttons */
  textLink: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  /** Primary text - for main content, list items */
  textPrimary: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  /** Secondary text - for hints, subtitles */
  textSecondary: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },

  /** Small label text - for badges, tags */
  textLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
})
