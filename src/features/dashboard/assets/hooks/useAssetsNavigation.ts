// ═══════════════════════════════════════════════════════════════════════════
// HOOK: useAssetsNavigation
// Handles year-based navigation for Assets mode.
// Unlike other modes (calendar-based), Assets only navigates to years with data.
// ═══════════════════════════════════════════════════════════════════════════
//
// WHY THIS HOOK EXISTS:
// ---------------------
// Most dashboard modes (Overview, Insights, Accounts) use calendar-based
// navigation: user can go to any month from the earliest data up to today.
//
// Assets mode is different: it only shows years where asset snapshots exist.
// If user has data for 2022, 2023, 2024 but not 2021, they can't navigate to 2021.
//
// This hook encapsulates that "data-driven navigation" logic, keeping the
// orchestrator (DashboardScreen) clean.
//
// YEAR ARRAY LAYOUT:
// ------------------
// Years are stored newest-first: [2024, 2023, 2022]
//
//   Index:    0      1      2
//   Year:   2024   2023   2022
//             ↑             ↑
//           newest       oldest
//
// - "Prev" (←) = go to OLDER year = higher index
// - "Next" (→) = go to NEWER year = lower index
//
// ═══════════════════════════════════════════════════════════════════════════

// ─── React ──────────────────────────────────────────────────────────────────
import { useMemo, useState } from 'react'

// ─── Application ──────────────────────────────────────────────────────────────
import { getYearsWithData } from '@/core/services/asset'  // Fetches years that have asset records
import { logError } from '@/shared/utils/logger'   // Centralized error logging

// ─── Feature Types ──────────────────────────────────────────────────────────
import type { Period } from '../../types'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AssetsNavigationResult {
  /** Can navigate to previous (older) year? */
  canPrev: boolean
  /** Can navigate to next (newer) year? */
  canNext: boolean
  /** Navigate to previous (older) year */
  onPrev: () => void
  /** Navigate to next (newer) year */
  onNext: () => void
  /** List of years that have asset data (newest-first) */
  availableYears: number[]
}

// ─── Hook ───────────────────────────────────────────────────────────────────

/**
 * Assets mode navigation hook.
 *
 * @param period - Current period from dashboard store (contains .year)
 * @param setPeriod - Function to update the period in dashboard store
 * @returns Navigation controls: canPrev, canNext, onPrev, onNext, availableYears
 *
 * @example
 * ```tsx
 * const assetsNav = useAssetsNavigation(period, setPeriod)
 *
 * <Button disabled={!assetsNav.canPrev} onPress={assetsNav.onPrev}>←</Button>
 * <Button disabled={!assetsNav.canNext} onPress={assetsNav.onNext}>→</Button>
 * ```
 */
export function useAssetsNavigation(
  period: Period,
  setPeriod: (p: Period) => void
): AssetsNavigationResult {
  // ─── Step 1: Load available years (once on mount) ───────────────────────
  // useState with lazy initializer: getYearsWithData() runs once on first render
  // Returns years newest-first: [2024, 2023, 2022]
  const [availableYears] = useState<number[]>(() => {
    try {
      return getYearsWithData()
    } catch (e) {
      logError('AssetsNavigation', e)
      return [new Date().getFullYear()]  // Fallback to current year
    }
  })

  // ─── Step 2: Compute navigation bounds ──────────────────────────────────
  // These are memoized: only recompute when availableYears or period.year changes
  //
  // Example: availableYears = [2024, 2023, 2022], period.year = 2023
  //          yearIndex = 1
  //          canPrev = (1 < 2) = true   → can go to 2022
  //          canNext = (1 > 0) = true   → can go to 2024
  const canPrev = useMemo(() => {
    const yearIndex = availableYears.indexOf(period.year)
    return yearIndex < availableYears.length - 1  // Can go to older year
  }, [availableYears, period.year])

  const canNext = useMemo(() => {
    const yearIndex = availableYears.indexOf(period.year)
    return yearIndex > 0  // Can go to newer year
  }, [availableYears, period.year])

  // ─── Step 3: Navigation handlers ────────────────────────────────────────
  // These functions update the period in the dashboard store
  function onPrev() {
    const yearIndex = availableYears.indexOf(period.year)
    if (yearIndex < availableYears.length - 1) {
      setPeriod({ year: availableYears[yearIndex + 1] })  // Go to older year
    }
  }

  function onNext() {
    const yearIndex = availableYears.indexOf(period.year)
    if (yearIndex > 0) {
      setPeriod({ year: availableYears[yearIndex - 1] })  // Go to newer year
    }
  }

  return { canPrev, canNext, onPrev, onNext, availableYears }
}
