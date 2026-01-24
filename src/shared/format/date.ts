function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
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
