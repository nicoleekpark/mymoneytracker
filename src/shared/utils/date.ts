/**
 * Date utilities for local timezone handling.
 *
 * IMPORTANT: This app always uses LOCAL time, never UTC.
 * - Transactions are stored with local date/time
 * - Calendar dates are local dates
 * - Date ranges are local dates
 *
 * Never use toISOString() for user-facing dates as it converts to UTC.
 */

/**
 * Format a Date to local ISO-like string (YYYY-MM-DDTHH:mm:ss.sss).
 * Unlike toISOString() which converts to UTC, this preserves the local date.
 *
 * @example
 * // 8 PM May 5th local stays as 2026-05-05T20:00:00.000
 * // (not 2026-05-06T03:00:00.000Z in UTC)
 * toLocalISOString(new Date(2026, 4, 5, 20, 0, 0))
 * // => "2026-05-05T20:00:00.000"
 */
export function toLocalISOString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  const ms = String(date.getMilliseconds()).padStart(3, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}`
}

/**
 * Get local date as YYYY-MM-DD string.
 * Unlike toISOString().slice(0, 10) which could return wrong date near midnight,
 * this always returns the correct local date.
 *
 * @example
 * // At 11 PM May 5th in PST (which is May 6th in UTC)
 * toLocalDateString(new Date())
 * // => "2026-05-05" (correct local date, not "2026-05-06")
 */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Get today's date as YYYY-MM-DD string in local timezone.
 */
export function getTodayYMD(): string {
  return toLocalDateString(new Date())
}
