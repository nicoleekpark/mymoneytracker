// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD TYPES
// Type definitions only. Utilities are in ../utils/period.utils.ts
// ═══════════════════════════════════════════════════════════════════════════

export type DashboardMode = 'overview' | 'assets' | 'accounts' | 'insights'
export type Scope = 'month' | 'year' | 'all'

export type Period =
  | { year: number; month: number }
  | { year: number }

export const MODES: ReadonlyArray<{ key: DashboardMode; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'assets', label: 'Assets' },
  { key: 'accounts', label: 'Accounts' },
  { key: 'insights', label: 'Insights' }
]
