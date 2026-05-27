import {
  addTransaction,
  updateTransaction,
  removeTransaction,
  restoreTransaction,
  getTransactions,
  getTransactionsInRange,
  getTransactionsForDate,
  getTransactionById,
  getTransfersForMonth,
} from '@/core/services/transaction/transaction.crud'
import type { Transaction, AddTransactionInput } from '@/core/domain/transaction'
import type { CategoryIndex } from '@/shared/config/categories.index'

// Mock dependencies
jest.mock('@/infrastructure/repositories', () => ({
  transactionRepository: {
    insertWithTags: jest.fn(),
    updateWithTags: jest.fn(),
    delete: jest.fn(),
    getById: jest.fn(),
    list: jest.fn(),
    listInDateRange: jest.fn(),
    listForDate: jest.fn(),
    listTransfersForMonth: jest.fn(),
  },
}))

jest.mock('@/core/services/notification', () => ({
  checkBudgetAlert: jest.fn(),
}))

jest.mock('@/shared/utils/uuid', () => ({
  uuid: jest.fn(() => 'mock-uuid-123'),
}))

import { transactionRepository } from '@/infrastructure/repositories'
import { checkBudgetAlert } from '@/core/services/notification'
import { uuid } from '@/shared/utils/uuid'

const mockInsertWithTags = transactionRepository.insertWithTags as jest.MockedFunction<
  typeof transactionRepository.insertWithTags
>
const mockUpdateWithTags = transactionRepository.updateWithTags as jest.MockedFunction<
  typeof transactionRepository.updateWithTags
>
const mockDelete = transactionRepository.delete as jest.MockedFunction<
  typeof transactionRepository.delete
>
const mockGetById = transactionRepository.getById as jest.MockedFunction<
  typeof transactionRepository.getById
>
const mockList = transactionRepository.list as jest.MockedFunction<typeof transactionRepository.list>
const mockListInDateRange = transactionRepository.listInDateRange as jest.MockedFunction<
  typeof transactionRepository.listInDateRange
>
const mockListForDate = transactionRepository.listForDate as jest.MockedFunction<
  typeof transactionRepository.listForDate
>
const mockListTransfersForMonth = transactionRepository.listTransfersForMonth as jest.MockedFunction<
  typeof transactionRepository.listTransfersForMonth
>
const mockCheckBudgetAlert = checkBudgetAlert as jest.MockedFunction<typeof checkBudgetAlert>
const mockUuid = uuid as jest.MockedFunction<typeof uuid>

const mockCategoryIndex: CategoryIndex = {
  expense: {
    food: ['eating_out', 'groceries'],
    housing: ['rent', 'utilities'],
  },
  income: {
    salary: ['base', 'bonus'],
  },
  transfer: {
    internal: ['rebalance'],
  },
}

describe('transaction.crud', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUuid.mockReturnValue('mock-uuid-123')
  })

  describe('addTransaction', () => {
    it('generates UUID for new transaction', async () => {
      const input: AddTransactionInput = {
        type: 'expense',
        amount: 1500,
        accountId: 'acc-checking',
        item: 'Lunch',
      }

      await addTransaction(mockCategoryIndex, input)

      expect(mockInsertWithTags).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'mock-uuid-123' }),
        undefined
      )
    })

    it('generates txKey when not provided', async () => {
      const input: AddTransactionInput = {
        type: 'expense',
        amount: 1500,
        accountId: 'acc-checking',
        item: 'Coffee',
        merchant: 'Starbucks',
      }

      await addTransaction(mockCategoryIndex, input)

      expect(mockInsertWithTags).toHaveBeenCalledWith(
        expect.objectContaining({
          key: expect.stringMatching(/^tx:.*:expense:coffee:starbucks:/),
        }),
        undefined
      )
    })

    it('uses provided key when given', async () => {
      const input: AddTransactionInput = {
        type: 'expense',
        amount: 1500,
        accountId: 'acc-checking',
        key: 'custom-key-123',
      }

      await addTransaction(mockCategoryIndex, input)

      expect(mockInsertWithTags).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'custom-key-123' }),
        undefined
      )
    })

    it('trims whitespace from provided key', async () => {
      const input: AddTransactionInput = {
        type: 'expense',
        amount: 1500,
        accountId: 'acc-checking',
        key: '  custom-key  ',
      }

      await addTransaction(mockCategoryIndex, input)

      expect(mockInsertWithTags).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'custom-key' }),
        undefined
      )
    })

    it('generates key when provided key is only whitespace', async () => {
      const input: AddTransactionInput = {
        type: 'expense',
        amount: 1500,
        accountId: 'acc-checking',
        key: '   ',
      }

      await addTransaction(mockCategoryIndex, input)

      expect(mockInsertWithTags).toHaveBeenCalledWith(
        expect.objectContaining({
          key: expect.stringMatching(/^tx:/),
        }),
        undefined
      )
    })

    it('uses current date when occurredAt not provided', async () => {
      const before = new Date()
      const input: AddTransactionInput = {
        type: 'expense',
        amount: 1500,
        accountId: 'acc-checking',
      }

      await addTransaction(mockCategoryIndex, input)
      const after = new Date()

      const calledTx = mockInsertWithTags.mock.calls[0][0]
      expect(calledTx.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(calledTx.occurredAt.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('uses provided occurredAt date', async () => {
      const date = new Date('2024-06-15')
      const input: AddTransactionInput = {
        type: 'expense',
        amount: 1500,
        accountId: 'acc-checking',
        occurredAt: date,
      }

      await addTransaction(mockCategoryIndex, input)

      expect(mockInsertWithTags).toHaveBeenCalledWith(
        expect.objectContaining({ occurredAt: date }),
        undefined
      )
    })

    describe('input sanitization', () => {
      it('truncates merchant to 100 characters', async () => {
        const longMerchant = 'A'.repeat(150)
        const input: AddTransactionInput = {
          type: 'expense',
          amount: 1500,
          accountId: 'acc-checking',
          merchant: longMerchant,
        }

        await addTransaction(mockCategoryIndex, input)

        expect(mockInsertWithTags).toHaveBeenCalledWith(
          expect.objectContaining({ merchant: 'A'.repeat(100) }),
          undefined
        )
      })

      it('truncates note to 500 characters', async () => {
        const longNote = 'B'.repeat(600)
        const input: AddTransactionInput = {
          type: 'expense',
          amount: 1500,
          accountId: 'acc-checking',
          note: longNote,
        }

        await addTransaction(mockCategoryIndex, input)

        expect(mockInsertWithTags).toHaveBeenCalledWith(
          expect.objectContaining({ note: 'B'.repeat(500) }),
          undefined
        )
      })

      it('truncates item to 200 characters', async () => {
        const longItem = 'C'.repeat(250)
        const input: AddTransactionInput = {
          type: 'expense',
          amount: 1500,
          accountId: 'acc-checking',
          item: longItem,
        }

        await addTransaction(mockCategoryIndex, input)

        expect(mockInsertWithTags).toHaveBeenCalledWith(
          expect.objectContaining({ item: 'C'.repeat(200) }),
          undefined
        )
      })

      it('trims whitespace from merchant', async () => {
        const input: AddTransactionInput = {
          type: 'expense',
          amount: 1500,
          accountId: 'acc-checking',
          merchant: '  Starbucks  ',
        }

        await addTransaction(mockCategoryIndex, input)

        expect(mockInsertWithTags).toHaveBeenCalledWith(
          expect.objectContaining({ merchant: 'Starbucks' }),
          undefined
        )
      })

      it('converts whitespace-only strings to undefined', async () => {
        const input: AddTransactionInput = {
          type: 'expense',
          amount: 1500,
          accountId: 'acc-checking',
          merchant: '   ',
          note: '   ',
        }

        await addTransaction(mockCategoryIndex, input)

        expect(mockInsertWithTags).toHaveBeenCalledWith(
          expect.objectContaining({ merchant: undefined, note: undefined }),
          undefined
        )
      })
    })

    it('calls checkBudgetAlert for expense transactions', async () => {
      const input: AddTransactionInput = {
        type: 'expense',
        amount: 1500,
        accountId: 'acc-checking',
      }

      await addTransaction(mockCategoryIndex, input)

      expect(mockCheckBudgetAlert).toHaveBeenCalledTimes(1)
    })

    it('does not call checkBudgetAlert for income transactions', async () => {
      const input: AddTransactionInput = {
        type: 'income',
        amount: 500000,
        accountId: 'acc-checking',
      }

      await addTransaction(mockCategoryIndex, input)

      expect(mockCheckBudgetAlert).not.toHaveBeenCalled()
    })

    it('does not call checkBudgetAlert for transfer transactions', async () => {
      const input: AddTransactionInput = {
        type: 'transfer',
        amount: 10000,
        fromAccountId: 'acc-checking',
        toAccountId: 'acc-savings',
      }

      await addTransaction(mockCategoryIndex, input)

      expect(mockCheckBudgetAlert).not.toHaveBeenCalled()
    })

    it('passes tags to insertWithTags', async () => {
      const input: AddTransactionInput = {
        type: 'expense',
        amount: 1500,
        accountId: 'acc-checking',
        tags: ['work', 'food'],
      }

      await addTransaction(mockCategoryIndex, input)

      expect(mockInsertWithTags).toHaveBeenCalledWith(
        expect.anything(),
        ['work', 'food']
      )
    })

    it('returns the created transaction', async () => {
      const input: AddTransactionInput = {
        type: 'expense',
        amount: 1500,
        accountId: 'acc-checking',
        merchant: 'Test',
      }

      const result = await addTransaction(mockCategoryIndex, input)

      expect(result.id).toBe('mock-uuid-123')
      expect(result.type).toBe('expense')
      expect(result.money.amount).toBe(1500)
      expect(result.merchant).toBe('Test')
    })

    describe('transfer transactions', () => {
      it('creates transfer with fromAccountId and toAccountId', async () => {
        const input: AddTransactionInput = {
          type: 'transfer',
          amount: 10000,
          fromAccountId: 'acc-checking',
          toAccountId: 'acc-savings',
        }

        const result = await addTransaction(mockCategoryIndex, input)

        expect(result.type).toBe('transfer')
        expect(result.fromAccountId).toBe('acc-checking')
        expect(result.toAccountId).toBe('acc-savings')
      })
    })
  })

  describe('updateTransaction', () => {
    const existingTx: Transaction = {
      id: 'tx-existing',
      key: 'original-key-123',
      occurredAt: new Date('2024-01-15'),
      type: 'expense',
      money: { amount: 1500, currency: 'USD' },
      accountId: 'acc-checking',
    }

    beforeEach(() => {
      mockGetById.mockReturnValue(existingTx)
    })

    it('throws when transaction not found', async () => {
      mockGetById.mockReturnValue(null)

      const input: AddTransactionInput = {
        type: 'expense',
        amount: 2000,
        accountId: 'acc-checking',
      }

      await expect(updateTransaction(mockCategoryIndex, 'nonexistent-id', input)).rejects.toThrow(
        'Transaction not found: nonexistent-id'
      )
    })

    it('preserves original key', async () => {
      const input: AddTransactionInput = {
        type: 'expense',
        amount: 2000,
        accountId: 'acc-checking',
      }

      await updateTransaction(mockCategoryIndex, 'tx-existing', input)

      expect(mockUpdateWithTags).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'original-key-123' }),
        undefined
      )
    })

    it('preserves original id', async () => {
      const input: AddTransactionInput = {
        type: 'expense',
        amount: 2000,
        accountId: 'acc-checking',
      }

      await updateTransaction(mockCategoryIndex, 'tx-existing', input)

      expect(mockUpdateWithTags).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'tx-existing' }),
        undefined
      )
    })

    it('updates all provided fields', async () => {
      const input: AddTransactionInput = {
        type: 'expense',
        amount: 2500,
        accountId: 'acc-savings',
        merchant: 'New Merchant',
        note: 'Updated note',
        category: { type: 'expense', categoryKey: 'food' },
      }

      await updateTransaction(mockCategoryIndex, 'tx-existing', input)

      expect(mockUpdateWithTags).toHaveBeenCalledWith(
        expect.objectContaining({
          money: { amount: 2500, currency: 'USD' },
          accountId: 'acc-savings',
          merchant: 'New Merchant',
          note: 'Updated note',
          category: { type: 'expense', categoryKey: 'food' },
        }),
        undefined
      )
    })

    it('sanitizes updated inputs', async () => {
      const input: AddTransactionInput = {
        type: 'expense',
        amount: 2000,
        accountId: 'acc-checking',
        merchant: 'M'.repeat(150),
      }

      await updateTransaction(mockCategoryIndex, 'tx-existing', input)

      expect(mockUpdateWithTags).toHaveBeenCalledWith(
        expect.objectContaining({ merchant: 'M'.repeat(100) }),
        undefined
      )
    })

    it('calls checkBudgetAlert for expense updates', async () => {
      const input: AddTransactionInput = {
        type: 'expense',
        amount: 2000,
        accountId: 'acc-checking',
      }

      await updateTransaction(mockCategoryIndex, 'tx-existing', input)

      expect(mockCheckBudgetAlert).toHaveBeenCalledTimes(1)
    })

    it('does not call checkBudgetAlert when changing to income', async () => {
      const input: AddTransactionInput = {
        type: 'income',
        amount: 2000,
        accountId: 'acc-checking',
      }

      await updateTransaction(mockCategoryIndex, 'tx-existing', input)

      expect(mockCheckBudgetAlert).not.toHaveBeenCalled()
    })

    it('passes tags to updateWithTags', async () => {
      const input: AddTransactionInput = {
        type: 'expense',
        amount: 2000,
        accountId: 'acc-checking',
        tags: ['updated-tag'],
      }

      await updateTransaction(mockCategoryIndex, 'tx-existing', input)

      expect(mockUpdateWithTags).toHaveBeenCalledWith(
        expect.anything(),
        ['updated-tag']
      )
    })

    it('returns the updated transaction', async () => {
      const input: AddTransactionInput = {
        type: 'expense',
        amount: 2500,
        accountId: 'acc-checking',
      }

      const result = await updateTransaction(mockCategoryIndex, 'tx-existing', input)

      expect(result.id).toBe('tx-existing')
      expect(result.key).toBe('original-key-123')
      expect(result.money.amount).toBe(2500)
    })
  })

  describe('removeTransaction', () => {
    it('calls delete on repository', async () => {
      await removeTransaction('tx-to-delete')

      expect(mockDelete).toHaveBeenCalledWith('tx-to-delete')
    })
  })

  describe('restoreTransaction', () => {
    it('calls insertWithTags with transaction and tags', async () => {
      const tx: Transaction = {
        id: 'tx-restored',
        key: 'restored-key',
        occurredAt: new Date('2024-01-15'),
        type: 'expense',
        money: { amount: 1500, currency: 'USD' },
        accountId: 'acc-checking',
        tags: ['restored', 'tag'],
      }

      await restoreTransaction(tx)

      expect(mockInsertWithTags).toHaveBeenCalledWith(tx, ['restored', 'tag'])
    })

    it('passes undefined tags when transaction has no tags', async () => {
      const tx: Transaction = {
        id: 'tx-restored',
        key: 'restored-key',
        occurredAt: new Date('2024-01-15'),
        type: 'expense',
        money: { amount: 1500, currency: 'USD' },
        accountId: 'acc-checking',
      }

      await restoreTransaction(tx)

      expect(mockInsertWithTags).toHaveBeenCalledWith(tx, undefined)
    })
  })

  describe('read operations', () => {
    describe('getTransactions', () => {
      it('calls list with default limit', async () => {
        mockList.mockReturnValue([])

        await getTransactions()

        expect(mockList).toHaveBeenCalledWith(200)
      })

      it('calls list with custom limit', async () => {
        mockList.mockReturnValue([])

        await getTransactions(50)

        expect(mockList).toHaveBeenCalledWith(50)
      })

      it('returns transactions from repository', async () => {
        const mockTxs: Transaction[] = [
          {
            id: 'tx-1',
            key: 'key-1',
            occurredAt: new Date(),
            type: 'expense',
            money: { amount: 1000, currency: 'USD' },
            accountId: 'acc-1',
          },
        ]
        mockList.mockReturnValue(mockTxs)

        const result = await getTransactions()

        expect(result).toEqual(mockTxs)
      })
    })

    describe('getTransactionsInRange', () => {
      it('uses default date range of 1 year', async () => {
        mockListInDateRange.mockReturnValue({ items: [], hasMore: false, oldestDate: null })

        await getTransactionsInRange()

        const call = mockListInDateRange.mock.calls[0]
        const fromDate = new Date(call[0])
        const toDate = new Date(call[1])

        // Should be approximately 1 year apart
        const diffMs = toDate.getTime() - fromDate.getTime()
        const diffDays = diffMs / (1000 * 60 * 60 * 24)
        expect(diffDays).toBeGreaterThanOrEqual(364)
        expect(diffDays).toBeLessThanOrEqual(366)
      })

      it('uses provided date range', async () => {
        mockListInDateRange.mockReturnValue({ items: [], hasMore: false, oldestDate: null })

        const from = new Date('2024-01-01')
        const to = new Date('2024-06-30')

        await getTransactionsInRange(from, to)

        expect(mockListInDateRange).toHaveBeenCalledWith('2024-01-01', '2024-06-30', 500)
      })

      it('uses custom limit', async () => {
        mockListInDateRange.mockReturnValue({ items: [], hasMore: false, oldestDate: null })

        await getTransactionsInRange(new Date(), new Date(), 100)

        expect(mockListInDateRange).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String),
          100
        )
      })
    })

    describe('getTransactionsForDate', () => {
      it('calls listForDate with date string and default limit', async () => {
        mockListForDate.mockReturnValue([])

        await getTransactionsForDate('2024-06-15')

        expect(mockListForDate).toHaveBeenCalledWith('2024-06-15', 50)
      })

      it('uses custom limit', async () => {
        mockListForDate.mockReturnValue([])

        await getTransactionsForDate('2024-06-15', 100)

        expect(mockListForDate).toHaveBeenCalledWith('2024-06-15', 100)
      })
    })

    describe('getTransactionById', () => {
      it('returns transaction when found', async () => {
        const mockTx: Transaction = {
          id: 'tx-123',
          key: 'key-123',
          occurredAt: new Date(),
          type: 'expense',
          money: { amount: 1000, currency: 'USD' },
          accountId: 'acc-1',
        }
        mockGetById.mockReturnValue(mockTx)

        const result = await getTransactionById('tx-123')

        expect(result).toEqual(mockTx)
      })

      it('returns null when not found', async () => {
        mockGetById.mockReturnValue(null)

        const result = await getTransactionById('nonexistent')

        expect(result).toBeNull()
      })
    })

    describe('getTransfersForMonth', () => {
      it('calls listTransfersForMonth with month string and default limit', async () => {
        mockListTransfersForMonth.mockReturnValue([])

        await getTransfersForMonth('2024-06')

        expect(mockListTransfersForMonth).toHaveBeenCalledWith('2024-06', 500)
      })

      it('uses custom limit', async () => {
        mockListTransfersForMonth.mockReturnValue([])

        await getTransfersForMonth('2024-06', 100)

        expect(mockListTransfersForMonth).toHaveBeenCalledWith('2024-06', 100)
      })
    })
  })
})
