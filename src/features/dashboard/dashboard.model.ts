export type DashboardMode = 'overview' | 'cashflow' | 'accounts' | 'networth'
export type Scope = 'month' | 'year' | 'all'

export type Period =
  | { year: number; month: number }
  | { year: number }

export const MODES: Array<{ key: DashboardMode; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'cashflow', label: 'Cash Flow' },
  { key: 'accounts', label: 'Accounts' },
  { key: 'networth', label: 'Net Worth' },
]

export function clampMonth(m: number): number {
  if (m < 1) return 1
  if (m > 12) return 12
  return m
}

function monthLabel(m: number): string {
  // lightweight, no intl dependency
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return labels[clampMonth(m) - 1] ?? 'Jan'
}

export function formatPeriodLabel(scope: Scope, period: Period): string {
  if (scope === 'all') return 'All time'
  if (scope === 'year') return `${period.year}`

  const month = 'month' in period ? period.month : 1
  return `${monthLabel(month)} ${period.year}`
}
