/**
 * Integration tests for account visibility repository methods.
 */
import { SqliteTransactionRepository } from '@/infrastructure/repositories/SqliteTransactionRepository'
import { SqliteCategoryRepository } from '@/infrastructure/repositories/SqliteCategoryRepository'
import { createTestDataSource, initTestSchema, type TestDataSource } from '../setup/testDatabase'
import { seedTestAccounts, seedTestCategories, insertTransaction } from '../setup/testFixtures'

describe('getFirstTransactionDateByAccount', () => {
  let ds: TestDataSource
  let transactionRepo: SqliteTransactionRepository

  beforeEach(() => {
    ds = createTestDataSource()
    initTestSchema(ds)
    seedTestAccounts(ds)
    seedTestCategories(ds)

    const categoryRepo = new SqliteCategoryRepository(ds)
    transactionRepo = new SqliteTransactionRepository(ds, categoryRepo)
  })

  afterEach(() => {
    ds.close()
  })

  it('returns empty map when no transactions exist', () => {
    const result = transactionRepo.getFirstTransactionDateByAccount()
    expect(result.size).toBe(0)
  })

  it('returns correct first date for single income transaction', () => {
    insertTransaction(ds, {
      id: 'tx-1',
      occurredAt: '2026-04-15T10:00:00.000Z',
      type: 'income',
      amountCents: 10000,
      accountId: 'acc-checking',
    })

    const result = transactionRepo.getFirstTransactionDateByAccount()

    expect(result.get('acc-checking')).toBe('2026-04-15')
  })

  it('returns earliest date when multiple transactions exist', () => {
    // Transaction in June
    insertTransaction(ds, {
      id: 'tx-1',
      occurredAt: '2026-06-15T10:00:00.000Z',
      type: 'expense',
      amountCents: 5000,
      accountId: 'acc-checking',
    })

    // Earlier transaction in April
    insertTransaction(ds, {
      id: 'tx-2',
      occurredAt: '2026-04-10T10:00:00.000Z',
      type: 'income',
      amountCents: 10000,
      accountId: 'acc-checking',
    })

    // Even earlier transaction in March
    insertTransaction(ds, {
      id: 'tx-3',
      occurredAt: '2026-03-01T10:00:00.000Z',
      type: 'income',
      amountCents: 20000,
      accountId: 'acc-checking',
    })

    const result = transactionRepo.getFirstTransactionDateByAccount()

    expect(result.get('acc-checking')).toBe('2026-03-01')
  })

  it('tracks first dates per account independently', () => {
    // Checking: April transaction
    insertTransaction(ds, {
      id: 'tx-1',
      occurredAt: '2026-04-15T10:00:00.000Z',
      type: 'income',
      amountCents: 10000,
      accountId: 'acc-checking',
    })

    // Savings: June transaction
    insertTransaction(ds, {
      id: 'tx-2',
      occurredAt: '2026-06-01T10:00:00.000Z',
      type: 'income',
      amountCents: 5000,
      accountId: 'acc-savings',
    })

    // Credit card: February transaction
    insertTransaction(ds, {
      id: 'tx-3',
      occurredAt: '2026-02-20T10:00:00.000Z',
      type: 'expense',
      amountCents: 3000,
      accountId: 'acc-credit-card',
    })

    const result = transactionRepo.getFirstTransactionDateByAccount()

    expect(result.get('acc-checking')).toBe('2026-04-15')
    expect(result.get('acc-savings')).toBe('2026-06-01')
    expect(result.get('acc-credit-card')).toBe('2026-02-20')
  })

  it('includes transfer transactions for both from and to accounts', () => {
    // Transfer from checking to savings in March
    insertTransaction(ds, {
      id: 'tx-transfer',
      occurredAt: '2026-03-15T10:00:00.000Z',
      type: 'transfer',
      amountCents: 10000,
      fromAccountId: 'acc-checking',
      toAccountId: 'acc-savings',
    })

    const result = transactionRepo.getFirstTransactionDateByAccount()

    // Both accounts should show March as first transaction date
    expect(result.get('acc-checking')).toBe('2026-03-15')
    expect(result.get('acc-savings')).toBe('2026-03-15')
  })

  it('picks earliest between transfers and regular transactions', () => {
    // Checking: income in April
    insertTransaction(ds, {
      id: 'tx-1',
      occurredAt: '2026-04-15T10:00:00.000Z',
      type: 'income',
      amountCents: 10000,
      accountId: 'acc-checking',
    })

    // Transfer from checking in February (earlier)
    insertTransaction(ds, {
      id: 'tx-transfer',
      occurredAt: '2026-02-01T10:00:00.000Z',
      type: 'transfer',
      amountCents: 5000,
      fromAccountId: 'acc-checking',
      toAccountId: 'acc-savings',
    })

    const result = transactionRepo.getFirstTransactionDateByAccount()

    // Checking should use February (transfer is earlier)
    expect(result.get('acc-checking')).toBe('2026-02-01')
    // Savings should use February (only has the transfer)
    expect(result.get('acc-savings')).toBe('2026-02-01')
  })
})
