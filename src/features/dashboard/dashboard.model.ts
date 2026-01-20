export type DashboardMode = 'overview' | 'cashflow' | 'accounts' | 'networth'
export type Scope = 'month' | 'year' | 'all'

export type Period =
  | { year: number; month: number }
  | { year: number }

export const MODES: ReadonlyArray<{ key: DashboardMode; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'cashflow', label: 'Cash Flow' },
  { key: 'accounts', label: 'Accounts' },
  { key: 'networth', label: 'Net Worth' }
]

export function clampMonth(m: number): number {
  if (!Number.isFinite(m)) return 1
  if (m < 1) return 1
  if (m > 12) return 12
  return m
}

export function formatPeriodLabel(scope: Scope, period: Period): string {
  if (scope === 'all') return 'All time'
  if (scope === 'year') return `${period.year}`

  const month = 'month' in period ? clampMonth(period.month) : 1
  const mm = String(month).padStart(2, '0')
  return `${period.year}-${mm}`
}

export function getMaxYearMonth(now = new Date()): { year: number; month: number } {
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

export function ymIndex(x: { year: number; month: number }): number {
  return x.year * 12 + (x.month - 1)
}
