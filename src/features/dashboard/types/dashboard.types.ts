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

export const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
] as const

export const MONTH_NAMES_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const

export function getMonthNameShort(month: number): string {
  return MONTH_NAMES_SHORT[clampMonth(month) - 1]
}

export function getMonthNameFull(month: number): string {
  return MONTH_NAMES_FULL[clampMonth(month) - 1]
}

export function formatPeriodLabelFull(scope: Scope, period: Period): string {
  if (scope === 'all') return 'All time'
  if (scope === 'year') return `${period.year}`

  const month = 'month' in period ? clampMonth(period.month) : 1
  return `${MONTH_NAMES_SHORT[month - 1]} ${period.year}`
}

export function isCurrentPeriod(scope: Scope, period: Period, now = new Date()): boolean {
  const current = getMaxYearMonth(now)
  if (scope === 'all') return true
  if (scope === 'year') return period.year === current.year
  const month = 'month' in period ? period.month : 1
  return period.year === current.year && month === current.month
}
