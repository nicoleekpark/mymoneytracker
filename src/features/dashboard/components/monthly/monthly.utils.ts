export function parseYYYYMM(monthYYYYMM: string): { year: number; month: number } {
  const [y, m] = monthYYYYMM.split('-')
  return { year: Number(y), month: Number(m) }
}

export function daysInMonth(year: number, month1to12: number): number {
  return new Date(year, month1to12, 0).getDate()
}

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
