import { isExpense, isIncome, isTransfer, safeDate } from '@/domain/transaction/transaction.utils'
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
  ...mockExpense,
  id: 'test-3',
  key: 'test-transfer',
  type: 'transfer',
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
})
