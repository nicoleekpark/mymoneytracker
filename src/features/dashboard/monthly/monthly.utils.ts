

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

// // expense를 괄호로 보여주고 싶으면 이렇게 호출
// // formatExpenseInt(expenseDollar) => "($ 16)"
// export function formatExpenseInt(expenseDollar: number) {
//   return formatSignedUsdInt(-Math.abs(expenseDollar))
// }

// // income은 그냥
// export function formatIncomeInt(incomeDollar: number) {
//   return formatSignedUsdInt(Math.abs(incomeDollar))
// }

export function parseYYYYMM(monthYYYYMM: string): { year: number; month: number } {
  const [y, m] = monthYYYYMM.split('-')
  return { year: Number(y), month: Number(m) }
}

export function daysInMonth(year: number, month1to12: number): number {
  return new Date(year, month1to12, 0).getDate()
}
