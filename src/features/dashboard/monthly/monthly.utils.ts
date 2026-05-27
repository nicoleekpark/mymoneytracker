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
