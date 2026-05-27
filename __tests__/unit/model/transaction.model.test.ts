import { createTransaction } from '@/core/domain/transaction/transaction.model'
import type { CategoryIndex } from '@/core/domain/category/category.types'
import type { Transaction } from '@/core/domain/transaction/transaction.types'

// Mock category index for validation
const mockCategoryIndex: CategoryIndex = {
  expense: {
    food: ['eating_out', 'groceries'],
    housing: ['rent', 'utilities'],
  },
  income: {
    salary: ['base', 'bonus'],
    investment: ['dividends', 'capital_gains'],
  },
  transfer: {
    internal: ['rebalance'],
  },
}

const validExpenseBase = {
  id: 'tx-123',
  key: 'tx:2024-01-15:expense:lunch:restaurant:abc12345',
  occurredAt: new Date('2024-01-15'),
  type: 'expense' as const,
  item: 'Lunch',
  money: { amount: 1500, currency: 'USD' },
  accountId: 'acc-checking',
}

const validIncomeBase = {
  id: 'tx-456',
  key: 'tx:2024-01-15:income:salary:company:def67890',
  occurredAt: new Date('2024-01-15'),
  type: 'income' as const,
  item: 'Monthly Salary',
  money: { amount: 500000, currency: 'USD' },
  accountId: 'acc-checking',
}

const validTransferBase = {
  id: 'tx-789',
  key: 'tx:2024-01-15:transfer:savings:na:ghi11111',
  occurredAt: new Date('2024-01-15'),
  type: 'transfer' as const,
  money: { amount: 10000, currency: 'USD' },
  fromAccountId: 'acc-checking',
  toAccountId: 'acc-savings',
}

describe('transaction.model', () => {
  describe('createTransaction', () => {
    describe('valid expense creation', () => {
      it('creates a valid expense transaction', () => {
        const result = createTransaction(mockCategoryIndex, validExpenseBase)

        expect(result).toEqual(validExpenseBase)
        expect(result.type).toBe('expense')
        expect(result.accountId).toBe('acc-checking')
      })

      it('creates expense with category reference', () => {
        const txWithCategory: Transaction = {
          ...validExpenseBase,
          category: { type: 'expense', categoryKey: 'food', subCategoryKey: 'eating_out' },
        }

        const result = createTransaction(mockCategoryIndex, txWithCategory)

        expect(result.category).toEqual({
          type: 'expense',
          categoryKey: 'food',
          subCategoryKey: 'eating_out',
        })
      })

      it('creates expense with optional fields', () => {
        const txWithExtras: Transaction = {
          ...validExpenseBase,
          merchant: 'Restaurant ABC',
          note: 'Business lunch',
          tags: ['work', 'food'],
          isEstimated: true,
        }

        const result = createTransaction(mockCategoryIndex, txWithExtras)

        expect(result.merchant).toBe('Restaurant ABC')
        expect(result.note).toBe('Business lunch')
        expect(result.tags).toEqual(['work', 'food'])
        expect(result.isEstimated).toBe(true)
      })
    })

    describe('valid income creation', () => {
      it('creates a valid income transaction', () => {
        const result = createTransaction(mockCategoryIndex, validIncomeBase)

        expect(result).toEqual(validIncomeBase)
        expect(result.type).toBe('income')
      })

      it('creates income with category reference', () => {
        const txWithCategory: Transaction = {
          ...validIncomeBase,
          category: { type: 'income', categoryKey: 'salary', subCategoryKey: 'base' },
        }

        const result = createTransaction(mockCategoryIndex, txWithCategory)

        expect(result.category?.categoryKey).toBe('salary')
      })
    })

    describe('valid transfer creation', () => {
      it('creates a valid transfer transaction', () => {
        const result = createTransaction(mockCategoryIndex, validTransferBase)

        expect(result).toEqual(validTransferBase)
        expect(result.type).toBe('transfer')
        expect(result.fromAccountId).toBe('acc-checking')
        expect(result.toAccountId).toBe('acc-savings')
      })

      it('creates transfer with category reference', () => {
        const txWithCategory: Transaction = {
          ...validTransferBase,
          category: { type: 'transfer', categoryKey: 'internal', subCategoryKey: 'rebalance' },
        }

        const result = createTransaction(mockCategoryIndex, txWithCategory)

        expect(result.category?.type).toBe('transfer')
      })
    })

    describe('occurredAt validation', () => {
      it('throws for invalid Date object', () => {
        const invalidTx = {
          ...validExpenseBase,
          occurredAt: new Date('invalid-date'),
        }

        expect(() => createTransaction(mockCategoryIndex, invalidTx)).toThrow(
          'occurredAt must be a valid Date'
        )
      })

      it('throws for non-Date value', () => {
        const invalidTx = {
          ...validExpenseBase,
          occurredAt: 'not-a-date' as unknown as Date,
        }

        expect(() => createTransaction(mockCategoryIndex, invalidTx)).toThrow(
          'occurredAt must be a valid Date'
        )
      })

      it('accepts Date at epoch (1970-01-01)', () => {
        const epochTx = {
          ...validExpenseBase,
          occurredAt: new Date(0),
        }

        const result = createTransaction(mockCategoryIndex, epochTx)
        expect(result.occurredAt.getTime()).toBe(0)
      })
    })

    describe('money amount validation', () => {
      it('throws for zero amount', () => {
        const invalidTx = {
          ...validExpenseBase,
          money: { amount: 0, currency: 'USD' },
        }

        expect(() => createTransaction(mockCategoryIndex, invalidTx)).toThrow(
          'Money amount must be > 0'
        )
      })

      it('throws for negative amount', () => {
        const invalidTx = {
          ...validExpenseBase,
          money: { amount: -100, currency: 'USD' },
        }

        expect(() => createTransaction(mockCategoryIndex, invalidTx)).toThrow(
          'Money amount must be > 0'
        )
      })

      it('throws for NaN amount', () => {
        const invalidTx = {
          ...validExpenseBase,
          money: { amount: NaN, currency: 'USD' },
        }

        expect(() => createTransaction(mockCategoryIndex, invalidTx)).toThrow(
          'Money amount must be > 0'
        )
      })

      it('throws for Infinity amount', () => {
        const invalidTx = {
          ...validExpenseBase,
          money: { amount: Infinity, currency: 'USD' },
        }

        expect(() => createTransaction(mockCategoryIndex, invalidTx)).toThrow(
          'Money amount must be > 0'
        )
      })

      it('accepts small positive amount', () => {
        const smallAmountTx = {
          ...validExpenseBase,
          money: { amount: 0.01, currency: 'USD' },
        }

        const result = createTransaction(mockCategoryIndex, smallAmountTx)
        expect(result.money.amount).toBe(0.01)
      })

      it('accepts large amount', () => {
        const largeAmountTx = {
          ...validExpenseBase,
          money: { amount: 999999999, currency: 'USD' },
        }

        const result = createTransaction(mockCategoryIndex, largeAmountTx)
        expect(result.money.amount).toBe(999999999)
      })
    })

    describe('transfer account validation', () => {
      it('throws when transfer missing fromAccountId', () => {
        const invalidTransfer = {
          ...validTransferBase,
          fromAccountId: undefined as unknown as string,
        }

        expect(() => createTransaction(mockCategoryIndex, invalidTransfer)).toThrow(
          'transfer requires fromAccountId and toAccountId'
        )
      })

      it('throws when transfer missing toAccountId', () => {
        const invalidTransfer = {
          ...validTransferBase,
          toAccountId: undefined as unknown as string,
        }

        expect(() => createTransaction(mockCategoryIndex, invalidTransfer)).toThrow(
          'transfer requires fromAccountId and toAccountId'
        )
      })

      it('throws when fromAccountId equals toAccountId', () => {
        const invalidTransfer = {
          ...validTransferBase,
          fromAccountId: 'acc-same',
          toAccountId: 'acc-same',
        }

        expect(() => createTransaction(mockCategoryIndex, invalidTransfer)).toThrow(
          'fromAccountId and toAccountId must differ'
        )
      })

      it('throws when non-transfer has fromAccountId', () => {
        const invalidExpense = {
          ...validExpenseBase,
          fromAccountId: 'acc-checking',
        } as unknown as Transaction

        expect(() => createTransaction(mockCategoryIndex, invalidExpense)).toThrow(
          'non-transfer must not include fromAccountId/toAccountId'
        )
      })

      it('throws when non-transfer has toAccountId', () => {
        const invalidIncome = {
          ...validIncomeBase,
          toAccountId: 'acc-savings',
        } as unknown as Transaction

        expect(() => createTransaction(mockCategoryIndex, invalidIncome)).toThrow(
          'non-transfer must not include fromAccountId/toAccountId'
        )
      })
    })

    describe('category validation', () => {
      it('throws for invalid category type', () => {
        const invalidTx = {
          ...validExpenseBase,
          category: {
            type: 'invalid' as 'expense',
            categoryKey: 'food',
          },
        }

        expect(() => createTransaction(mockCategoryIndex, invalidTx)).toThrow(
          /Invalid CategoryRef/
        )
      })

      it('throws for non-existent category key', () => {
        const invalidTx = {
          ...validExpenseBase,
          category: {
            type: 'expense',
            categoryKey: 'nonexistent',
          },
        }

        expect(() => createTransaction(mockCategoryIndex, invalidTx)).toThrow(
          /Invalid CategoryRef/
        )
      })

      it('throws for non-existent subcategory key', () => {
        const invalidTx = {
          ...validExpenseBase,
          category: {
            type: 'expense',
            categoryKey: 'food',
            subCategoryKey: 'nonexistent',
          },
        }

        expect(() => createTransaction(mockCategoryIndex, invalidTx)).toThrow(
          /Invalid CategoryRef/
        )
      })

      it('accepts category without subcategory', () => {
        const txWithCategory: Transaction = {
          ...validExpenseBase,
          category: { type: 'expense', categoryKey: 'food' },
        }

        const result = createTransaction(mockCategoryIndex, txWithCategory)
        expect(result.category?.subCategoryKey).toBeUndefined()
      })

      it('accepts undefined category', () => {
        const txNoCategory = { ...validExpenseBase }
        delete (txNoCategory as any).category

        const result = createTransaction(mockCategoryIndex, txNoCategory)
        expect(result.category).toBeUndefined()
      })
    })
  })
})
