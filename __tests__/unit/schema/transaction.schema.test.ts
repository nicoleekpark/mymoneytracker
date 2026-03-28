import {
  parseTransactionType,
  TransactionTypeSchema,
  MoneySchema,
} from '@/core/domain/transaction/transaction.schema'

describe('transaction.schema', () => {
  describe('TransactionTypeSchema', () => {
    it('accepts valid transaction types', () => {
      expect(TransactionTypeSchema.safeParse('income').success).toBe(true)
      expect(TransactionTypeSchema.safeParse('expense').success).toBe(true)
      expect(TransactionTypeSchema.safeParse('transfer').success).toBe(true)
    })

    it('rejects invalid values', () => {
      expect(TransactionTypeSchema.safeParse('payment').success).toBe(false)
      expect(TransactionTypeSchema.safeParse('refund').success).toBe(false)
      expect(TransactionTypeSchema.safeParse('').success).toBe(false)
      expect(TransactionTypeSchema.safeParse(null).success).toBe(false)
    })
  })

  describe('MoneySchema', () => {
    it('accepts valid money objects', () => {
      expect(MoneySchema.safeParse({ amount: 100, currency: 'USD' }).success).toBe(true)
      expect(MoneySchema.safeParse({ amount: 0, currency: 'EUR' }).success).toBe(true)
      expect(MoneySchema.safeParse({ amount: -50.5, currency: 'JPY' }).success).toBe(true)
    })

    it('rejects invalid money objects', () => {
      expect(MoneySchema.safeParse({ amount: '100', currency: 'USD' }).success).toBe(false)
      expect(MoneySchema.safeParse({ amount: 100 }).success).toBe(false)
      expect(MoneySchema.safeParse({ currency: 'USD' }).success).toBe(false)
      expect(MoneySchema.safeParse(null).success).toBe(false)
    })
  })

  describe('parseTransactionType', () => {
    it('returns valid value unchanged', () => {
      expect(parseTransactionType('income')).toBe('income')
      expect(parseTransactionType('expense')).toBe('expense')
      expect(parseTransactionType('transfer')).toBe('transfer')
    })

    it('returns fallback for invalid string', () => {
      expect(parseTransactionType('payment')).toBe('expense')
      expect(parseTransactionType('refund')).toBe('expense')
      expect(parseTransactionType('')).toBe('expense')
    })

    it('returns fallback for non-string types', () => {
      expect(parseTransactionType(null)).toBe('expense')
      expect(parseTransactionType(undefined)).toBe('expense')
      expect(parseTransactionType(123)).toBe('expense')
      expect(parseTransactionType({})).toBe('expense')
    })
  })
})
