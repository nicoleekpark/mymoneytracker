/**
 * Integration tests for SqliteTransactionRepository.
 *
 * Uses an in-memory SQLite database (better-sqlite3) to test
 * the actual SQL queries and data transformations.
 */
import { SqliteTransactionRepository } from '@/infrastructure/repositories/SqliteTransactionRepository'
import type { CategoryRepository } from '@/core/domain/category/category.repository'
import type { CategoryRef } from '@/core/domain/category/category.types'
import type { UUID } from '@/core/domain/common/uuid'
import type { Transaction } from '@/core/domain/transaction/transaction.types'
import {
  createTestDataSource,
  initTestSchema,
  type TestDataSource,
} from '../setup/testDatabase'
import {
  seedTestAccounts,
  seedTestCategories,
  testAccounts,
  testCategories,
  insertTransaction,
} from '../setup/testFixtures'

// Create a mock CategoryRepository for tests
function createMockCategoryRepo(): CategoryRepository {
  const categoryMap = new Map<UUID, CategoryRef>()
  const idMap = new Map<string, UUID>()

  // Build maps from test categories
  for (const cat of Object.values(testCategories)) {
    if ('parentId' in cat) {
      // Child category - extract parent key from key (e.g., "food.eating_out" -> parent is "food")
      const parts = cat.key.split('.')
      const parentKey = parts[0]
      const subKey = parts[1]
      categoryMap.set(cat.id, {
        type: cat.type as 'expense' | 'income' | 'transfer',
        categoryKey: parentKey,
        subCategoryKey: subKey,
      })
    } else {
      // Parent category
      categoryMap.set(cat.id, {
        type: cat.type as 'expense' | 'income' | 'transfer',
        categoryKey: cat.key,
      })
    }
    idMap.set(cat.key, cat.id)
  }

  return {
    getIdByKey(categoryKey: string): UUID {
      const id = idMap.get(categoryKey)
      if (!id) throw new Error(`Category not found: ${categoryKey}`)
      return id
    },

    getSubCategoryIdByKeyAndParent(subKey: string, parentKey: string): UUID {
      const fullKey = `${parentKey}.${subKey}`
      const id = idMap.get(fullKey)
      if (!id) throw new Error(`Subcategory not found: ${fullKey}`)
      return id
    },

    resolveCategoryId(ref?: CategoryRef): UUID | null {
      if (!ref) return null
      const key = ref.subCategoryKey
        ? `${ref.categoryKey}.${ref.subCategoryKey}`
        : ref.categoryKey
      return idMap.get(key) ?? null
    },

    resolveCategoryRefFromDbId(categoryDbId: UUID): CategoryRef | null {
      return categoryMap.get(categoryDbId) ?? null
    },

    batchResolveCategoryRefs(categoryDbIds: UUID[]): Map<UUID, CategoryRef> {
      const result = new Map<UUID, CategoryRef>()
      for (const id of categoryDbIds) {
        const ref = categoryMap.get(id)
        if (ref) result.set(id, ref)
      }
      return result
    },
  }
}

describe('SqliteTransactionRepository', () => {
  let ds: TestDataSource
  let repo: SqliteTransactionRepository
  let categoryRepo: CategoryRepository

  beforeEach(() => {
    ds = createTestDataSource()
    initTestSchema(ds)
    seedTestAccounts(ds)
    seedTestCategories(ds)
    categoryRepo = createMockCategoryRepo()
    repo = new SqliteTransactionRepository(ds, categoryRepo)
  })

  afterEach(() => {
    ds.close()
  })

  describe('CRUD operations', () => {
    describe('insert', () => {
      it('inserts an expense transaction', () => {
        const tx: Transaction = {
          id: 'tx-new-1',
          key: 'tx:new-expense',
          occurredAt: new Date('2024-03-15T10:00:00Z'),
          type: 'expense',
          item: 'Test Expense',
          money: { amount: 2500, currency: 'USD' },
          accountId: testAccounts.checking.id,
          category: { type: 'expense', categoryKey: 'food', subCategoryKey: 'eating_out' },
        }

        repo.insert(tx)

        const result = repo.getById('tx-new-1')
        expect(result).not.toBeNull()
        expect(result?.id).toBe('tx-new-1')
        expect(result?.type).toBe('expense')
        expect(result?.money.amount).toBe(2500)
      })

      it('inserts an income transaction', () => {
        const tx: Transaction = {
          id: 'tx-new-2',
          key: 'tx:new-income',
          occurredAt: new Date('2024-03-01T09:00:00Z'),
          type: 'income',
          item: 'Bonus',
          money: { amount: 100000, currency: 'USD' },
          accountId: testAccounts.checking.id,
        }

        repo.insert(tx)

        const result = repo.getById('tx-new-2')
        expect(result?.type).toBe('income')
        expect(result?.money.amount).toBe(100000)
      })

      it('inserts a transfer transaction', () => {
        const tx: Transaction = {
          id: 'tx-new-3',
          key: 'tx:new-transfer',
          occurredAt: new Date('2024-03-10T15:00:00Z'),
          type: 'transfer',
          money: { amount: 50000, currency: 'USD' },
          fromAccountId: testAccounts.checking.id,
          toAccountId: testAccounts.savings.id,
        }

        repo.insert(tx)

        const result = repo.getById('tx-new-3')
        expect(result?.type).toBe('transfer')
        expect(result?.fromAccountId).toBe(testAccounts.checking.id)
        expect(result?.toAccountId).toBe(testAccounts.savings.id)
      })
    })

    describe('insertWithTags', () => {
      it('inserts transaction with tags atomically', () => {
        const tx: Transaction = {
          id: 'tx-tagged',
          key: 'tx:tagged',
          occurredAt: new Date('2024-03-15T10:00:00Z'),
          type: 'expense',
          money: { amount: 1500, currency: 'USD' },
          accountId: testAccounts.checking.id,
        }

        repo.insertWithTags(tx, ['work', 'lunch'])

        const result = repo.getById('tx-tagged')
        expect(result).not.toBeNull()

        const tags = repo.getTagsForTransaction('tx-tagged')
        expect(tags).toContain('work')
        expect(tags).toContain('lunch')
      })

      it('handles empty tags array', () => {
        const tx: Transaction = {
          id: 'tx-no-tags',
          key: 'tx:no-tags',
          occurredAt: new Date('2024-03-15T10:00:00Z'),
          type: 'expense',
          money: { amount: 1500, currency: 'USD' },
          accountId: testAccounts.checking.id,
        }

        repo.insertWithTags(tx, [])

        const tags = repo.getTagsForTransaction('tx-no-tags')
        expect(tags).toEqual([])
      })
    })

    describe('getById', () => {
      it('returns null for non-existent transaction', () => {
        const result = repo.getById('nonexistent-id')
        expect(result).toBeNull()
      })

      it('returns transaction with category ref resolved', () => {
        insertTransaction(ds, {
          id: 'tx-with-cat',
          occurredAt: '2024-03-15T10:00:00Z',
          type: 'expense',
          amountCents: 1500,
          accountId: testAccounts.checking.id,
          categoryId: testCategories.foodEatingOut.id,
        })

        const result = repo.getById('tx-with-cat')

        expect(result?.category).toEqual({
          type: 'expense',
          categoryKey: 'food',
          subCategoryKey: 'eating_out',
        })
      })
    })

    describe('update', () => {
      it('updates transaction fields', () => {
        insertTransaction(ds, {
          id: 'tx-to-update',
          occurredAt: '2024-03-15T10:00:00Z',
          type: 'expense',
          item: 'Original Item',
          amountCents: 1500,
          accountId: testAccounts.checking.id,
        })

        const updated: Transaction = {
          id: 'tx-to-update',
          key: 'tx:tx-to-update',
          occurredAt: new Date('2024-03-16T10:00:00Z'),
          type: 'expense',
          item: 'Updated Item',
          money: { amount: 2500, currency: 'USD' },
          accountId: testAccounts.checking.id,
        }

        repo.update(updated)

        const result = repo.getById('tx-to-update')
        expect(result?.item).toBe('Updated Item')
        expect(result?.money.amount).toBe(2500)
      })
    })

    describe('updateWithTags', () => {
      it('replaces existing tags', () => {
        const tx: Transaction = {
          id: 'tx-update-tags',
          key: 'tx:update-tags',
          occurredAt: new Date('2024-03-15T10:00:00Z'),
          type: 'expense',
          money: { amount: 1500, currency: 'USD' },
          accountId: testAccounts.checking.id,
        }
        repo.insertWithTags(tx, ['old-tag'])

        repo.updateWithTags(tx, ['new-tag-1', 'new-tag-2'])

        const tags = repo.getTagsForTransaction('tx-update-tags')
        expect(tags).not.toContain('old-tag')
        expect(tags).toContain('new-tag-1')
        expect(tags).toContain('new-tag-2')
      })
    })

    describe('delete', () => {
      it('removes transaction from database', () => {
        insertTransaction(ds, {
          id: 'tx-to-delete',
          occurredAt: '2024-03-15T10:00:00Z',
          type: 'expense',
          amountCents: 1500,
          accountId: testAccounts.checking.id,
        })

        repo.delete('tx-to-delete')

        const result = repo.getById('tx-to-delete')
        expect(result).toBeNull()
      })
    })

    describe('list', () => {
      it('returns transactions ordered by occurred_at DESC', () => {
        insertTransaction(ds, {
          id: 'tx-old',
          occurredAt: '2024-01-01T10:00:00Z',
          type: 'expense',
          amountCents: 1000,
          accountId: testAccounts.checking.id,
        })
        insertTransaction(ds, {
          id: 'tx-new',
          occurredAt: '2024-03-15T10:00:00Z',
          type: 'expense',
          amountCents: 2000,
          accountId: testAccounts.checking.id,
        })
        insertTransaction(ds, {
          id: 'tx-mid',
          occurredAt: '2024-02-10T10:00:00Z',
          type: 'expense',
          amountCents: 1500,
          accountId: testAccounts.checking.id,
        })

        const result = repo.list()

        expect(result[0].id).toBe('tx-new')
        expect(result[1].id).toBe('tx-mid')
        expect(result[2].id).toBe('tx-old')
      })

      it('respects limit parameter', () => {
        for (let i = 0; i < 10; i++) {
          insertTransaction(ds, {
            id: `tx-bulk-${i}`,
            occurredAt: `2024-03-${String(i + 1).padStart(2, '0')}T10:00:00Z`,
            type: 'expense',
            amountCents: 1000,
            accountId: testAccounts.checking.id,
          })
        }

        const result = repo.list(5)

        expect(result).toHaveLength(5)
      })
    })
  })

  describe('aggregations', () => {
    beforeEach(() => {
      // Seed transactions for aggregation tests
      insertTransaction(ds, {
        id: 'tx-jan-expense-1',
        occurredAt: '2024-01-15T10:00:00Z',
        type: 'expense',
        amountCents: 5000,
        accountId: testAccounts.checking.id,
        categoryId: testCategories.foodEatingOut.id,
      })
      insertTransaction(ds, {
        id: 'tx-jan-expense-2',
        occurredAt: '2024-01-20T10:00:00Z',
        type: 'expense',
        amountCents: 3000,
        accountId: testAccounts.checking.id,
        categoryId: testCategories.foodGroceries.id,
      })
      insertTransaction(ds, {
        id: 'tx-jan-income-1',
        occurredAt: '2024-01-01T10:00:00Z',
        type: 'income',
        amountCents: 500000,
        accountId: testAccounts.checking.id,
        categoryId: testCategories.salaryBase.id,
      })
      insertTransaction(ds, {
        id: 'tx-feb-expense-1',
        occurredAt: '2024-02-15T10:00:00Z',
        type: 'expense',
        amountCents: 10000,
        accountId: testAccounts.checking.id,
        categoryId: testCategories.housingRent.id,
      })
    })

    describe('getExpenseTotalForMonth', () => {
      it('returns sum of expenses for specified month', () => {
        const total = repo.getExpenseTotalForMonth('2024-01')

        expect(total).toBe(8000) // 5000 + 3000
      })

      it('returns 0 for month with no expenses', () => {
        const total = repo.getExpenseTotalForMonth('2024-12')

        expect(total).toBe(0)
      })
    })

    describe('getIncomeTotalForMonth', () => {
      it('returns sum of income for specified month', () => {
        const total = repo.getIncomeTotalForMonth('2024-01')

        expect(total).toBe(500000)
      })
    })

    describe('listMonthlyExpenseByCategory', () => {
      it('returns expense totals grouped by category', () => {
        const result = repo.listMonthlyExpenseByCategory('2024-01')

        expect(result).toHaveLength(2)
        // Should be ordered by total DESC
        expect(result[0].totalCents).toBe(5000)
        expect(result[1].totalCents).toBe(3000)
      })
    })

    describe('listDailyExpenseTotalsForMonth', () => {
      it('returns daily expense totals', () => {
        const result = repo.listDailyExpenseTotalsForMonth('2024-01')

        expect(result).toHaveLength(2)
        expect(result[0].day).toBe('2024-01-15')
        expect(result[0].totalCents).toBe(5000)
        expect(result[1].day).toBe('2024-01-20')
        expect(result[1].totalCents).toBe(3000)
      })
    })

    describe('getYearTotals', () => {
      it('returns income and expense totals for year', () => {
        const result = repo.getYearTotals(2024)

        expect(result.incomeCents).toBe(500000)
        expect(result.expenseCents).toBe(18000) // 8000 + 10000
      })
    })

    describe('getMonthTotals', () => {
      it('returns income and expense totals for month', () => {
        const result = repo.getMonthTotals('2024-01')

        expect(result.incomeCents).toBe(500000)
        expect(result.expenseCents).toBe(8000)
      })
    })
  })

  describe('balance calculations', () => {
    beforeEach(() => {
      // Income on Jan 1
      insertTransaction(ds, {
        id: 'tx-income',
        occurredAt: '2024-01-01T10:00:00Z',
        type: 'income',
        amountCents: 100000, // +$1000
        accountId: testAccounts.checking.id,
      })
      // Expense on Jan 15
      insertTransaction(ds, {
        id: 'tx-expense',
        occurredAt: '2024-01-15T10:00:00Z',
        type: 'expense',
        amountCents: 30000, // -$300
        accountId: testAccounts.checking.id,
      })
      // Transfer on Jan 20 (transfers have account_id = NULL)
      insertTransaction(ds, {
        id: 'tx-transfer',
        occurredAt: '2024-01-20T10:00:00Z',
        type: 'transfer',
        amountCents: 20000,
        fromAccountId: testAccounts.checking.id,
        toAccountId: testAccounts.savings.id,
      })
    })

    describe('getAccountBalanceBeforeDate', () => {
      it('calculates balance before specified date', () => {
        // Before any transactions
        const balanceDec = repo.getAccountBalanceBeforeDate(testAccounts.checking.id, '2024-01-01')
        expect(balanceDec).toBe(0)

        // After income, before expense
        const balanceJan10 = repo.getAccountBalanceBeforeDate(testAccounts.checking.id, '2024-01-10')
        expect(balanceJan10).toBe(100000) // +$1000

        // After expense, before transfer
        const balanceJan18 = repo.getAccountBalanceBeforeDate(testAccounts.checking.id, '2024-01-18')
        expect(balanceJan18).toBe(70000) // +$1000 - $300
      })
    })

    describe('getAccountBalanceAtEndOfMonth', () => {
      it('calculates balance at end of month for income/expense only', () => {
        const balance = repo.getAccountBalanceAtEndOfMonth(testAccounts.checking.id, '2024-01')

        // Note: Current implementation only considers transactions with account_id matching,
        // so transfers (which have account_id=NULL) are NOT included in the calculation.
        // Balance = $1000 income - $300 expense = $700
        expect(balance).toBe(70000)
      })

      it('returns 0 for account with no direct transactions', () => {
        // Savings only has a transfer TO it, but transfers have account_id=NULL
        const balance = repo.getAccountBalanceAtEndOfMonth(testAccounts.savings.id, '2024-01')

        // No direct income/expense transactions to savings account
        expect(balance).toBe(0)
      })
    })
  })

  describe('listInDateRange', () => {
    beforeEach(() => {
      insertTransaction(ds, {
        id: 'tx-dec',
        occurredAt: '2023-12-15T10:00:00Z',
        type: 'expense',
        amountCents: 1000,
        accountId: testAccounts.checking.id,
      })
      insertTransaction(ds, {
        id: 'tx-jan',
        occurredAt: '2024-01-15T10:00:00Z',
        type: 'expense',
        amountCents: 2000,
        accountId: testAccounts.checking.id,
      })
      insertTransaction(ds, {
        id: 'tx-feb',
        occurredAt: '2024-02-15T10:00:00Z',
        type: 'expense',
        amountCents: 3000,
        accountId: testAccounts.checking.id,
      })
    })

    it('returns transactions within date range', () => {
      const result = repo.listInDateRange('2024-01-01', '2024-01-31')

      expect(result.items).toHaveLength(1)
      expect(result.items[0].id).toBe('tx-jan')
    })

    it('indicates if there are older transactions', () => {
      const result = repo.listInDateRange('2024-01-01', '2024-02-28')

      expect(result.hasMore).toBe(true) // Dec transaction exists
    })

    it('indicates no more when all transactions included', () => {
      const result = repo.listInDateRange('2023-01-01', '2024-12-31')

      expect(result.hasMore).toBe(false)
    })

    it('returns oldestDate from result set', () => {
      const result = repo.listInDateRange('2024-01-01', '2024-02-28')

      expect(result.oldestDate).toBe('2024-01-15T10:00:00.000Z')
    })
  })

  describe('listTransfersForMonth', () => {
    beforeEach(() => {
      insertTransaction(ds, {
        id: 'tx-transfer-jan',
        occurredAt: '2024-01-15T10:00:00Z',
        type: 'transfer',
        amountCents: 10000,
        fromAccountId: testAccounts.checking.id,
        toAccountId: testAccounts.savings.id,
      })
      insertTransaction(ds, {
        id: 'tx-expense-jan',
        occurredAt: '2024-01-16T10:00:00Z',
        type: 'expense',
        amountCents: 5000,
        accountId: testAccounts.checking.id,
      })
    })

    it('returns only transfer transactions', () => {
      const result = repo.listTransfersForMonth('2024-01')

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('tx-transfer-jan')
      expect(result[0].type).toBe('transfer')
    })
  })
})
