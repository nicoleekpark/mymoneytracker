/**
 * Format a currency amount with 2 decimal places.
 * Negative amounts are shown in parentheses: ($ 123.45)
 */
export function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) return '$ 0.00'

  const abs = Math.abs(amount).toFixed(2)
  if (amount < 0) {
    return `($ ${abs})`
  }
  return `$ ${abs}`
}

/**
 * Format a currency amount as an integer (rounded).
 * Always shows absolute value: $ 123
 */
export function formatUsdInt(amount: number): string {
  const v = Math.round(Math.abs(Number(amount) || 0))
  return `$ ${v}`
}

/**
 * Format a currency amount as an integer with sign.
 * Positive: +$ 123, Negative: -$ 123, Zero: $ 0
 */
export function formatSignedUsdInt(amount: number): string {
  const v = Math.round(Number(amount) || 0)
  if (v === 0) return '$ 0'
  const abs = Math.abs(v)
  return v > 0 ? `+$ ${abs}` : `-$ ${abs}`
}

/**
 * Format an expense amount as an integer.
 * Expenses are shown without sign: $ 123
 */
export function formatExpenseInt(amount: number): string {
  return formatUsdInt(amount)
}

/**
 * Format an income amount as an integer.
 * Incomes are shown with a plus sign: +$ 123
 */
export function formatIncomeInt(amount: number): string {
  const v = Math.round(Math.abs(Number(amount) || 0))
  return `+$ ${v}`
}