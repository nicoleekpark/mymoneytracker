import {
  isExpense,
  isIncome,
  isTransfer,
  safeDate,
  currentMonthYYYYMM,
  slugify,
  getDaysInMonth,
  getYearProgressMonths
} from '@/domain/transaction/transaction.utils'
import type { Transaction } from '@/domain/transaction/transaction.types'

const mockExpense: Transaction = {
  id: 'test-1',
  key: 'test-expense',
  type: 'expense',
  occurredAt: new Date('2026-03-01'),
  item: 'Test expense',
  money: { amount: 1000, currency: 'USD' },
  accountId: 'acc-1',
}

const mockIncome: Transaction = {
  ...mockExpense,
  id: 'test-2',
  key: 'test-income',
  type: 'income',
}

const mockTransfer: Transaction = {
  id: 'test-3',
  key: 'test-transfer',
  type: 'transfer',
  occurredAt: new Date('2026-03-01'),
  item: 'Test transfer',
  money: { amount: 1000, currency: 'USD' },
  fromAccountId: 'acc-1',
  toAccountId: 'acc-2',
}

describe('transaction.utils', () => {
  describe('isExpense', () => {
    it('returns true for expense transactions', () => {
      expect(isExpense(mockExpense)).toBe(true)
    })

    it('returns false for non-expense transactions', () => {
      expect(isExpense(mockIncome)).toBe(false)
      expect(isExpense(mockTransfer)).toBe(false)
    })
  })

  describe('isIncome', () => {
    it('returns true for income transactions', () => {
      expect(isIncome(mockIncome)).toBe(true)
    })

    it('returns false for non-income transactions', () => {
      expect(isIncome(mockExpense)).toBe(false)
    })
  })

  describe('isTransfer', () => {
    it('returns true for transfer transactions', () => {
      expect(isTransfer(mockTransfer)).toBe(true)
    })

    it('returns false for non-transfer transactions', () => {
      expect(isTransfer(mockExpense)).toBe(false)
    })
  })

  describe('safeDate', () => {
    it('returns Date object when occurredAt is Date', () => {
      const result = safeDate(mockExpense)
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2026)
    })

    it('parses ISO string to Date', () => {
      const tx = { ...mockExpense, occurredAt: '2026-03-15T10:00:00Z' as unknown as Date }
      const result = safeDate(tx)
      expect(result.getDate()).toBe(15)
    })

    it('returns epoch for invalid date', () => {
      const tx = { ...mockExpense, occurredAt: 'invalid' as unknown as Date }
      const result = safeDate(tx)
      expect(result.getTime()).toBe(0)
    })
  })

  describe('currentMonthYYYYMM', () => {
    it('returns current month in YYYY-MM format', () => {
      const jan2026 = new Date(2026, 0, 15)
      expect(currentMonthYYYYMM(jan2026)).toBe('2026-01')

      const dec2026 = new Date(2026, 11, 1)
      expect(currentMonthYYYYMM(dec2026)).toBe('2026-12')
    })
  })

  describe('slugify', () => {
    it('converts to lowercase with underscores', () => {
      expect(slugify('Hello World')).toBe('hello_world')
    })

    it('removes special characters', () => {
      expect(slugify('Test@#$%Item!')).toBe('testitem')
    })

    it('truncates to 24 characters', () => {
      expect(slugify('this is a very long string that exceeds the limit')).toBe('this_is_a_very_long_stri')
    })
  })

  describe('getDaysInMonth', () => {
    it('returns correct days for various months', () => {
      expect(getDaysInMonth(2026, 1)).toBe(31) // January
      expect(getDaysInMonth(2026, 2)).toBe(28) // February (non-leap)
      expect(getDaysInMonth(2024, 2)).toBe(29) // February (leap year)
      expect(getDaysInMonth(2026, 4)).toBe(30) // April
    })
  })

  describe('getYearProgressMonths', () => {
    it('returns decimal months elapsed in year', () => {
      // Mid-January = 0 complete months + ~0.5 partial
      const midJan = new Date(2026, 0, 15)
      const janProgress = getYearProgressMonths(midJan)
      expect(janProgress).toBeGreaterThan(0.4)
      expect(janProgress).toBeLessThan(0.6)
    })

    it('returns higher value for later months', () => {
      const jan = getYearProgressMonths(new Date(2026, 0, 15))
      const jun = getYearProgressMonths(new Date(2026, 5, 15))
      expect(jun).toBeGreaterThan(jan)
    })
  })
})
