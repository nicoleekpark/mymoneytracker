import { centsToDollars, dollarsToCents } from '@/core/domain/common/money'

describe('money', () => {
  describe('centsToDollars', () => {
    it('converts cents to dollars', () => {
      expect(centsToDollars(100)).toBe(1)
      expect(centsToDollars(150)).toBe(1.5)
      expect(centsToDollars(1234)).toBe(12.34)
    })

    it('handles zero', () => {
      expect(centsToDollars(0)).toBe(0)
    })

    it('handles negative values', () => {
      expect(centsToDollars(-500)).toBe(-5)
    })

    it('returns 0 for non-finite values', () => {
      expect(centsToDollars(NaN)).toBe(0)
      expect(centsToDollars(Infinity)).toBe(0)
      expect(centsToDollars(-Infinity)).toBe(0)
    })
  })

  describe('dollarsToCents', () => {
    it('converts dollars to cents', () => {
      expect(dollarsToCents(1)).toBe(100)
      expect(dollarsToCents(1.5)).toBe(150)
      expect(dollarsToCents(12.34)).toBe(1234)
    })

    it('handles zero', () => {
      expect(dollarsToCents(0)).toBe(0)
    })

    it('handles negative values', () => {
      expect(dollarsToCents(-5)).toBe(-500)
    })

    it('rounds to nearest cent', () => {
      expect(dollarsToCents(1.999)).toBe(200)
      expect(dollarsToCents(1.994)).toBe(199)
      expect(dollarsToCents(1.995)).toBe(200)
    })

    it('returns 0 for non-finite values', () => {
      expect(dollarsToCents(NaN)).toBe(0)
      expect(dollarsToCents(Infinity)).toBe(0)
      expect(dollarsToCents(-Infinity)).toBe(0)
    })
  })

  describe('roundtrip conversion', () => {
    it('preserves value through conversion', () => {
      const originalCents = 1234
      const dollars = centsToDollars(originalCents)
      const backToCents = dollarsToCents(dollars)
      expect(backToCents).toBe(originalCents)
    })
  })
})
