import {
  formatCurrency,
  formatUsdInt,
  formatCompactAmount,
  formatSignedUsdInt,
  formatCompactUsd,
  formatSignedUsdCompact,
} from '@/shared/format/currency'

describe('currency formatting', () => {
  describe('formatCurrency', () => {
    it('formats positive amounts with 2 decimal places', () => {
      expect(formatCurrency(123.45)).toBe('$ 123.45')
      expect(formatCurrency(1000)).toBe('$ 1,000.00')
    })

    it('formats negative amounts in parentheses', () => {
      expect(formatCurrency(-123.45)).toBe('($ 123.45)')
      expect(formatCurrency(-1000)).toBe('($ 1,000.00)')
    })

    it('handles zero', () => {
      expect(formatCurrency(0)).toBe('$ 0.00')
    })

    it('handles non-finite values', () => {
      expect(formatCurrency(NaN)).toBe('$ 0.00')
      expect(formatCurrency(Infinity)).toBe('$ 0.00')
      expect(formatCurrency(-Infinity)).toBe('$ 0.00')
    })

    it('pads decimals when needed', () => {
      expect(formatCurrency(5)).toBe('$ 5.00')
      expect(formatCurrency(5.1)).toBe('$ 5.10')
    })

    it('formats large amounts with commas', () => {
      expect(formatCurrency(1234567.89)).toBe('$ 1,234,567.89')
    })
  })

  describe('formatUsdInt', () => {
    it('formats positive amounts', () => {
      expect(formatUsdInt(1234)).toBe('$ 1,234')
      expect(formatUsdInt(1000000)).toBe('$ 1,000,000')
    })

    it('formats negative amounts as absolute value', () => {
      expect(formatUsdInt(-500)).toBe('$ 500')
    })

    it('rounds decimals', () => {
      expect(formatUsdInt(99.7)).toBe('$ 100')
      expect(formatUsdInt(99.2)).toBe('$ 99')
    })

    it('handles zero', () => {
      expect(formatUsdInt(0)).toBe('$ 0')
    })

    it('handles NaN and undefined-like values', () => {
      expect(formatUsdInt(NaN)).toBe('$ 0')
      expect(formatUsdInt(null as unknown as number)).toBe('$ 0')
      expect(formatUsdInt(undefined as unknown as number)).toBe('$ 0')
    })
  })

  describe('formatSignedUsdInt', () => {
    it('formats positive with + prefix', () => {
      expect(formatSignedUsdInt(500)).toBe('+$ 500')
    })

    it('formats negative with - prefix', () => {
      expect(formatSignedUsdInt(-500)).toBe('-$ 500')
    })

    it('formats zero without sign', () => {
      expect(formatSignedUsdInt(0)).toBe('$ 0')
    })

    it('rounds decimals', () => {
      expect(formatSignedUsdInt(99.7)).toBe('+$ 100')
      expect(formatSignedUsdInt(-99.7)).toBe('-$ 100')
    })

    it('formats with thousands separator', () => {
      expect(formatSignedUsdInt(12345)).toBe('+$ 12,345')
      expect(formatSignedUsdInt(-12345)).toBe('-$ 12,345')
    })

    it('handles NaN', () => {
      expect(formatSignedUsdInt(NaN)).toBe('$ 0')
    })
  })

  describe('formatCompactUsd', () => {
    it('formats small values as integers', () => {
      expect(formatCompactUsd(450)).toBe('450')
      expect(formatCompactUsd(999)).toBe('999')
    })

    it('formats thousands with K suffix', () => {
      expect(formatCompactUsd(1000)).toBe('1K')
      expect(formatCompactUsd(1500)).toBe('1.5K')
      expect(formatCompactUsd(2500)).toBe('2.5K')
    })

    it('caps at 10K+ for very large values', () => {
      expect(formatCompactUsd(10000)).toBe('10K+')
      expect(formatCompactUsd(50000)).toBe('10K+')
      expect(formatCompactUsd(1000000)).toBe('10K+')
    })

    it('handles zero', () => {
      expect(formatCompactUsd(0)).toBe('0')
    })

    it('uses absolute value for negative numbers', () => {
      expect(formatCompactUsd(-500)).toBe('500')
      expect(formatCompactUsd(-2500)).toBe('2.5K')
    })

    it('rounds decimals', () => {
      expect(formatCompactUsd(999.9)).toBe('1K')
      expect(formatCompactUsd(450.4)).toBe('450')
    })

    it('handles NaN', () => {
      expect(formatCompactUsd(NaN)).toBe('0')
    })
  })

  describe('formatSignedUsdCompact', () => {
    it('formats small positive values with + sign', () => {
      expect(formatSignedUsdCompact(500)).toBe('+$500')
    })

    it('formats small negative values with - sign', () => {
      expect(formatSignedUsdCompact(-500)).toBe('-$500')
    })

    it('formats zero without sign', () => {
      expect(formatSignedUsdCompact(0)).toBe('$0')
    })

    it('formats thousands with k suffix and sign', () => {
      expect(formatSignedUsdCompact(1500)).toBe('+$1.5k')
      expect(formatSignedUsdCompact(-1500)).toBe('-$1.5k')
      expect(formatSignedUsdCompact(9600)).toBe('+$9.6k')
      expect(formatSignedUsdCompact(-9600)).toBe('-$9.6k')
    })

    it('rounds large K values', () => {
      expect(formatSignedUsdCompact(15000)).toBe('+$15k')
      expect(formatSignedUsdCompact(-15000)).toBe('-$15k')
    })

    it('handles edge case at exactly 1000', () => {
      expect(formatSignedUsdCompact(1000)).toBe('+$1.0k')
      expect(formatSignedUsdCompact(-1000)).toBe('-$1.0k')
    })

    it('rounds decimals', () => {
      expect(formatSignedUsdCompact(999.9)).toBe('+$1.0k')
    })

    it('handles NaN', () => {
      expect(formatSignedUsdCompact(NaN)).toBe('$0')
    })
  })

  describe('formatCompactAmount', () => {
    it('formats small amounts without suffix', () => {
      expect(formatCompactAmount(500)).toBe('$ 500')
      expect(formatCompactAmount(999)).toBe('$ 999')
    })

    it('formats thousands with K suffix', () => {
      expect(formatCompactAmount(1500)).toBe('$ 1.5K')
      expect(formatCompactAmount(15000)).toBe('$ 15K')
    })

    it('formats millions with M suffix', () => {
      expect(formatCompactAmount(1500000)).toBe('$ 1.5M')
      expect(formatCompactAmount(15000000)).toBe('$ 15M')
    })

    it('handles boundary at exactly 1000', () => {
      expect(formatCompactAmount(1000)).toBe('$ 1.0K')
    })

    it('handles boundary at exactly 1000000', () => {
      expect(formatCompactAmount(1000000)).toBe('$ 1.0M')
    })

    it('uses absolute value for negative numbers', () => {
      expect(formatCompactAmount(-5000)).toBe('$ 5.0K')
      expect(formatCompactAmount(-2000000)).toBe('$ 2.0M')
    })

    it('rounds decimal places appropriately', () => {
      expect(formatCompactAmount(1234)).toBe('$ 1.2K')
      expect(formatCompactAmount(1234567)).toBe('$ 1.2M')
    })
  })
})
