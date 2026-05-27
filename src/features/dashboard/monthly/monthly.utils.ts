// Re-export from canonical locations for backward compatibility
export { parseYYYYMM, getDaysInMonthFromYYYYMM as daysInMonthFromYYYYMM } from '../utils/period.utils'
export { getDaysInMonth } from '@/core/domain/transaction'

// 0=Sun..6=Sat
export function firstWeekdayIndex(year: number, month1to12: number): number {
  return new Date(year, month1to12 - 1, 1).getDay()
}

export function clamp01(n: number): number {
  if (n < 0) return 0
  if (n > 1) return 1
  return n
}

export function formatUsd(amount: number): string {
  const sign = amount < 0 ? '-' : ''
  const abs = Math.abs(amount)
  return `${sign}$${abs.toFixed(2)}`
}

export function formatSignedUsdInt(amount: number) {
  if (!Number.isFinite(amount)) return '$ 0'
  const abs = Math.round(Math.abs(amount))
  if (abs === 0) return '$ 0'
  const s = `$ ${abs}`
  if (amount < 0) return `(${s})`
  return s
}
