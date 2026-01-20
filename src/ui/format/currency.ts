export function formatCurrency(amount: number) {
  if (!Number.isFinite(amount)) return '$ 0.00'

  const abs = Math.abs(amount).toFixed(2)
  if (amount < 0) {
    return `($ ${abs})`
  }
  return `$ ${abs}`
}