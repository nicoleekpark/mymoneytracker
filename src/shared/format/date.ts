/**
 * Pad a number to 2 digits with leading zero
 */
export function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}

/**
 * Get month key in YYYY-MM format
 */
export function monthKey(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`
}

/**
 * Format day header like "Tue, Jan 14"
 */
export function formatDayHeader(d: Date): string {
  const weekday = d.toLocaleString(undefined, { weekday: 'short' })
  const month = d.toLocaleString(undefined, { month: 'short' })
  return `${weekday}, ${month} ${d.getDate()}`
}

/**
 * Check if two dates are in the same month
 */
export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

/**
 * Format date as YYYY-MM-DD
 */
export function ymd(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

/**
 * Transaction list row date
 * Example: JAN 9 10:12 AM
 */
export function formatTransactionRowDate(date: Date): string {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return ''
  }

  const month = date
    .toLocaleString('en-US', { month: 'short' })
    .toUpperCase()

  const day = date.getDate()

  let hours = date.getHours()
  const minutes = pad2(date.getMinutes())
  const ampm = hours >= 12 ? 'PM' : 'AM'

  hours = hours % 12
  if (hours === 0) hours = 12

  return `${month} ${day} ${hours}:${minutes} ${ampm}`
}

/**
 * Month section title
 * Example: JANUARY 2026
 */
export function formatMonthSectionTitle(date: Date): string {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return ''
  }

  const month = date
    .toLocaleString('en-US', { month: 'long' })
    .toUpperCase()

  return `${month} ${date.getFullYear()}`
}

/**
 * Format YYYY-MM to readable format
 * Example: "2026-01" -> "Jan 2026"
 */
export function formatYearMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-')
  if (!year || !month) return yearMonth

  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
  const monthName = date.toLocaleString('en-US', { month: 'short' })

  return `${monthName} ${year}`
}

/**
 * Format "tracking since" date string.
 * Example: Date(2025, 0, 15) -> "Tracking since Jan 2025"
 */
export function formatTrackingSince(date: Date | null): string {
  if (!date) return 'No data yet'
  const monthName = date.toLocaleString('en-US', { month: 'short' })
  return `Tracking since ${monthName} ${date.getFullYear()}`
}

/**
 * Get number of days in a given month.
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/**
 * Get months elapsed between two dates.
 */
export function getMonthsElapsed(start: Date, end: Date): number {
  const startYear = start.getFullYear()
  const startMonth = start.getMonth()
  const endYear = end.getFullYear()
  const endMonth = end.getMonth()
  return (endYear - startYear) * 12 + (endMonth - startMonth) + 1
}
