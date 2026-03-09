import {
  formatUsdInt,
  formatCompactAmount,
  formatSignedUsdInt
} from '@/shared/format/currency'

describe('currency formatting', () => {
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
  })
})
