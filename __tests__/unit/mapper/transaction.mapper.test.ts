import {
  rowToTransaction,
  transactionToRow,
  type TransactionRow,
} from '@/infrastructure/mappers/transaction.mapper'
import type { Transaction } from '@/core/domain/transaction/transaction.types'
import type { CategoryRef } from '@/core/domain/category/category.types'

// Mock resolvers
const mockResolveCategoryRef = (id: string): CategoryRef => ({
  type: 'expense',
  categoryKey: id,
})

const mockResolveCategoryId = (ref?: CategoryRef): string | null => {
  if (!ref) return null
  return ref.categoryKey
}

describe('transaction.mapper', () => {
  describe('rowToTransaction', () => {
    it('converts expense row to Transaction', () => {
      const row: TransactionRow = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        key: 'tx:test',
        occurred_at: '2026-03-15T10:00:00.000Z',
        type: 'expense',
        item: 'Coffee',
        amount_cents: 500,
        currency: 'USD',
        account_id: 'acc-1',
        from_account_id: null,
        to_account_id: null,
        category_id: 'cat-1',
        merchant: 'Starbucks',
        note: 'Morning coffee',
        member_id: null,
        is_estimated: 0,
      }

      const tx = rowToTransaction(row, mockResolveCategoryRef)

      expect(tx.id).toBe(row.id)
      expect(tx.key).toBe('tx:test')
      expect(tx.occurredAt).toBeInstanceOf(Date)
      expect(tx.type).toBe('expense')
      expect(tx.item).toBe('Coffee')
      expect(tx.money.amount).toBe(5) // cents to dollars
      expect(tx.money.currency).toBe('USD')
      expect(tx.merchant).toBe('Starbucks')
      expect(tx.note).toBe('Morning coffee')
      expect(tx.category).toBeDefined()
      expect(tx.isEstimated).toBeUndefined() // 0 becomes undefined

      // Type narrowing for expense
      if (tx.type === 'expense') {
        expect(tx.accountId).toBe('acc-1')
      }
    })

    it('converts income row to Transaction', () => {
      const row: TransactionRow = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        key: 'tx:income',
        occurred_at: '2026-03-01T00:00:00.000Z',
        type: 'income',
        item: 'Salary',
        amount_cents: 500000,
        currency: 'USD',
        account_id: 'acc-1',
        from_account_id: null,
        to_account_id: null,
        category_id: null,
        merchant: null,
        note: null,
        member_id: null,
        is_estimated: 0,
      }

      const tx = rowToTransaction(row, mockResolveCategoryRef)

      expect(tx.type).toBe('income')
      expect(tx.money.amount).toBe(5000)
      expect(tx.category).toBeUndefined() // no category_id

      if (tx.type === 'income') {
        expect(tx.accountId).toBe('acc-1')
      }
    })

    it('converts transfer row to Transaction', () => {
      const row: TransactionRow = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        key: 'tx:transfer',
        occurred_at: '2026-03-10T00:00:00.000Z',
        type: 'transfer',
        item: 'Transfer to savings',
        amount_cents: 100000,
        currency: 'USD',
        account_id: null,
        from_account_id: 'acc-1',
        to_account_id: 'acc-2',
        category_id: null,
        merchant: null,
        note: null,
        member_id: null,
        is_estimated: 0,
      }

      const tx = rowToTransaction(row, mockResolveCategoryRef)

      expect(tx.type).toBe('transfer')

      if (tx.type === 'transfer') {
        expect(tx.fromAccountId).toBe('acc-1')
        expect(tx.toAccountId).toBe('acc-2')
      }
    })

    it('handles "Not added" item as undefined', () => {
      const row: TransactionRow = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        key: 'tx:test',
        occurred_at: '2026-03-15T00:00:00.000Z',
        type: 'expense',
        item: 'Not added',
        amount_cents: 100,
        currency: 'USD',
        account_id: 'acc-1',
        from_account_id: null,
        to_account_id: null,
        category_id: null,
        merchant: null,
        note: null,
        member_id: null,
        is_estimated: 0,
      }

      const tx = rowToTransaction(row, mockResolveCategoryRef)

      expect(tx.item).toBeUndefined()
    })

    it('sets isEstimated when is_estimated is 1', () => {
      const row: TransactionRow = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        key: 'tx:test',
        occurred_at: '2026-03-15T00:00:00.000Z',
        type: 'expense',
        item: null,
        amount_cents: 100,
        currency: 'USD',
        account_id: 'acc-1',
        from_account_id: null,
        to_account_id: null,
        category_id: null,
        merchant: null,
        note: null,
        member_id: null,
        is_estimated: 1,
      }

      const tx = rowToTransaction(row, mockResolveCategoryRef)

      expect(tx.isEstimated).toBe(true)
    })

    it('includes tags when provided', () => {
      const row: TransactionRow = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        key: 'tx:test',
        occurred_at: '2026-03-15T00:00:00.000Z',
        type: 'expense',
        item: null,
        amount_cents: 100,
        currency: 'USD',
        account_id: 'acc-1',
        from_account_id: null,
        to_account_id: null,
        category_id: null,
        merchant: null,
        note: null,
        member_id: null,
        is_estimated: 0,
      }

      const tx = rowToTransaction(row, mockResolveCategoryRef, ['tag1', 'tag2'])

      expect(tx.tags).toEqual(['tag1', 'tag2'])
    })

    it('uses fallback for invalid transaction type', () => {
      const row = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        key: 'tx:test',
        occurred_at: '2026-03-15T00:00:00.000Z',
        type: 'invalid_type' as const,
        item: null,
        amount_cents: 100,
        currency: 'USD',
        account_id: 'acc-1',
        from_account_id: null,
        to_account_id: null,
        category_id: null,
        merchant: null,
        note: null,
        member_id: null,
        is_estimated: 0,
      }

      const tx = rowToTransaction(row as unknown as TransactionRow, mockResolveCategoryRef)

      expect(tx.type).toBe('expense') // fallback
    })
  })

  describe('transactionToRow', () => {
    it('converts expense Transaction to row', () => {
      const tx: Transaction = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        key: 'tx:test',
        occurredAt: new Date('2026-03-15T10:00:00.000Z'),
        type: 'expense',
        item: 'Coffee',
        money: { amount: 5, currency: 'USD' },
        accountId: 'acc-1',
        category: { type: 'expense', categoryKey: 'food' },
        merchant: 'Starbucks',
        note: 'Morning coffee',
      }

      const row = transactionToRow(tx, mockResolveCategoryId)

      expect(row.id).toBe(tx.id)
      expect(row.key).toBe('tx:test')
      expect(row.occurred_at).toBe('2026-03-15T10:00:00.000Z')
      expect(row.type).toBe('expense')
      expect(row.item).toBe('Coffee')
      expect(row.amount_cents).toBe(500) // dollars to cents
      expect(row.currency).toBe('USD')
      expect(row.account_id).toBe('acc-1')
      expect(row.from_account_id).toBeNull()
      expect(row.to_account_id).toBeNull()
      expect(row.category_id).toBe('food')
      expect(row.merchant).toBe('Starbucks')
      expect(row.note).toBe('Morning coffee')
      expect(row.is_estimated).toBe(0)
    })

    it('converts transfer Transaction to row', () => {
      const tx: Transaction = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        key: 'tx:transfer',
        occurredAt: new Date('2026-03-15T10:00:00.000Z'),
        type: 'transfer',
        money: { amount: 1000, currency: 'USD' },
        fromAccountId: 'acc-1',
        toAccountId: 'acc-2',
      }

      const row = transactionToRow(tx, mockResolveCategoryId)

      expect(row.type).toBe('transfer')
      expect(row.account_id).toBeNull()
      expect(row.from_account_id).toBe('acc-1')
      expect(row.to_account_id).toBe('acc-2')
    })

    it('sets is_estimated to 1 when true', () => {
      const tx: Transaction = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        key: 'tx:test',
        occurredAt: new Date('2026-03-15T10:00:00.000Z'),
        type: 'expense',
        money: { amount: 5, currency: 'USD' },
        accountId: 'acc-1',
        isEstimated: true,
      }

      const row = transactionToRow(tx, mockResolveCategoryId)

      expect(row.is_estimated).toBe(1)
    })

    it('handles undefined optional fields as null', () => {
      const tx: Transaction = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        key: 'tx:test',
        occurredAt: new Date('2026-03-15T10:00:00.000Z'),
        type: 'expense',
        money: { amount: 5, currency: 'USD' },
        accountId: 'acc-1',
      }

      const row = transactionToRow(tx, mockResolveCategoryId)

      expect(row.item).toBeNull()
      expect(row.category_id).toBeNull()
      expect(row.merchant).toBeNull()
      expect(row.note).toBeNull()
      expect(row.member_id).toBeNull()
    })
  })
})
