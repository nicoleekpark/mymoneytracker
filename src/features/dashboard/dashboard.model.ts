export type DashboardMode = 'overview' | 'cashflow' | 'accounts' | 'networth'
export type Scope = 'month' | 'year' | 'all'

export type Period = Readonly<{
  year: number
  month?: number // 1-12 when scope === 'month'
}>

export const MODES: ReadonlyArray<{ key: DashboardMode; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'cashflow', label: 'Cash Flow' },
  { key: 'accounts', label: 'Accounts' },
  { key: 'networth', label: 'Net Worth' }
] as const

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
] as const

export function clampMonth(m: number): number {
  if (m < 1) return 1
  if (m > 12) return 12
  return m
}

export function formatPeriodLabel(scope: Scope, period: Period): string {
  if (scope === 'all') return 'All time'
  if (scope === 'year') return String(period.year)

  const month = clampMonth(period.month ?? 1)
  return `${MONTH_NAMES[month - 1]} ${period.year}`
}
