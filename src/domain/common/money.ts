export function centsToDollars(cents: number): number {
  return Number.isFinite(cents) ? cents / 100 : 0
}

export function dollarsToCents(dollars: number): number {
  return Number.isFinite(dollars) ? Math.round(dollars * 100) : 0
}