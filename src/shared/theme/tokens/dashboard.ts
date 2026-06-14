/**
 * Dashboard Design Tokens
 *
 * Styles and constants for dashboard header components including:
 * - Period navigation row
 * - Scope tabs (Monthly/Yearly/All)
 * - Member selection chips
 */

import { StyleSheet } from 'react-native'
import { spacing } from './spacing'
import { fontSize, fontWeight } from './typography'
import { radius } from './radius'

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Height constants derived from content:
 * - HEADER_ROW_HEIGHT: Members + Period nav row
 *   = paddingTop (md=12) + content (~32) + paddingBottom (sm=8) = 52
 * - SCOPE_TABS_HEIGHT: Monthly/Yearly/All tabs row
 *   = paddingVertical (sm=8*2=16) + text (~20) + underline (2+xs=6) = 42
 */
export const DASHBOARD_HEADER_ROW_HEIGHT = spacing['3xl'] + spacing.xs // 52
export const DASHBOARD_SCOPE_TABS_HEIGHT = spacing['3xl'] - spacing.sm + spacing.xs // 44

/**
 * Scope options for dashboard views
 */
export const SCOPE_OPTIONS = [
  { key: 'month' as const, label: 'Monthly' },
  { key: 'year' as const, label: 'Yearly' },
  { key: 'all' as const, label: 'All' },
] as const

export type DashboardScope = typeof SCOPE_OPTIONS[number]['key']

// ─── Styles ───────────────────────────────────────────────────────────────────

export const dashboardStyles = StyleSheet.create({
  // Header container
  headerContainer: {
    paddingBottom: spacing.sm,
  },

  // Row 1: Members + Period navigation
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    minHeight: DASHBOARD_HEADER_ROW_HEIGHT,
  },

  // Member chips scroll container
  memberChipsContainer: {
    flex: 1,
  },
  memberChipsContent: {
    gap: spacing.sm,
  },

  // Member chip
  memberChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  memberChipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  // Period navigation
  periodNavContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    minWidth: 120,
    maxWidth: 160,
  },
  periodNavArrow: {
    padding: spacing.xs,
  },
  periodLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    minWidth: 100,
    textAlign: 'center',
  },

  // Row 2: Scope tabs
  scopeTabsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    minHeight: DASHBOARD_SCOPE_TABS_HEIGHT,
    gap: spacing.xl,
  },

  // Scope tab
  scopeTab: {
    paddingVertical: spacing.sm,
  },
  scopeTabText: {
    fontSize: fontSize.sm,
  },
  scopeTabUnderline: {
    height: 2,
    marginTop: spacing.xs,
    borderRadius: 1,
  },

  // Today button
  todayButton: {
    paddingVertical: spacing.sm,
  },
  todayButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
  },
})

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Get member chip style based on selection state
 */
export function getMemberChipStyle(isSelected: boolean, colors: { text: string; surface: string }) {
  return {
    backgroundColor: isSelected ? colors.text : 'transparent',
  }
}

/**
 * Get member chip text color based on selection state
 */
export function getMemberChipTextColor(isSelected: boolean, colors: { surface: string; textSecondary: string }) {
  return isSelected ? colors.surface : colors.textSecondary
}

/**
 * Get scope tab text style based on active state
 */
export function getScopeTabTextStyle(isActive: boolean, colors: { text: string; textSecondary: string }) {
  return {
    fontWeight: isActive ? fontWeight.semibold : fontWeight.normal,
    color: isActive ? colors.text : colors.textSecondary,
  }
}

/**
 * Get scope tab underline color based on active state
 */
export function getScopeTabUnderlineColor(isActive: boolean, colors: { text: string }) {
  return isActive ? colors.text : 'transparent'
}
