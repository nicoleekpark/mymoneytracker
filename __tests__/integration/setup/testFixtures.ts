/**
 * Test Fixtures
 *
 * Provides seed data and helper functions for integration tests.
 */
import type { DataSource } from '@/infrastructure/db/DataSource'

// ─────────────────────────────────────────────────────────────────────────────
// Test Accounts
// ─────────────────────────────────────────────────────────────────────────────

export const testAccounts = {
  checking: {
    id: 'acc-checking',
    key: 'acct:checking',
    name: 'Checking Account',
    nature: 'asset',
    kind: 'checking',
  },
  savings: {
    id: 'acc-savings',
    key: 'acct:savings',
    name: 'Savings Account',
    nature: 'asset',
    kind: 'savings',
  },
  creditCard: {
    id: 'acc-credit-card',
    key: 'acct:credit_card',
    name: 'Credit Card',
    nature: 'liability',
    kind: 'credit_card',
  },
  cash: {
    id: 'acc-cash',
    key: 'acct:cash',
    name: 'Cash Wallet',
    nature: 'asset',
    kind: 'cash',
  },
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Test Categories
// ─────────────────────────────────────────────────────────────────────────────

export const testCategories = {
  // Expense categories
  food: {
    id: 'cat-food',
    type: 'expense',
    key: 'food',
    name: 'Food & Dining',
  },
  foodEatingOut: {
    id: 'cat-food-eating_out',
    type: 'expense',
    key: 'food.eating_out',
    name: 'Eating Out',
    parentId: 'cat-food',
  },
  foodGroceries: {
    id: 'cat-food-groceries',
    type: 'expense',
    key: 'food.groceries',
    name: 'Groceries',
    parentId: 'cat-food',
  },
  housing: {
    id: 'cat-housing',
    type: 'expense',
    key: 'housing',
    name: 'Housing',
  },
  housingRent: {
    id: 'cat-housing-rent',
    type: 'expense',
    key: 'housing.rent',
    name: 'Rent',
    parentId: 'cat-housing',
  },
  transport: {
    id: 'cat-transport',
    type: 'expense',
    key: 'transport',
    name: 'Transportation',
  },

  // Income categories
  salary: {
    id: 'cat-salary',
    type: 'income',
    key: 'salary',
    name: 'Salary',
  },
  salaryBase: {
    id: 'cat-salary-base',
    type: 'income',
    key: 'salary.base',
    name: 'Base Salary',
    parentId: 'cat-salary',
  },
  investment: {
    id: 'cat-investment',
    type: 'income',
    key: 'investment',
    name: 'Investment',
  },

  // Transfer categories
  internal: {
    id: 'cat-internal',
    type: 'transfer',
    key: 'internal',
    name: 'Internal Transfer',
  },
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Test Transactions
// ─────────────────────────────────────────────────────────────────────────────

export const testTransactions = {
  expense1: {
    id: 'tx-expense-1',
    key: 'tx:2024-01-15:expense:lunch',
    occurredAt: '2024-01-15T12:00:00.000Z',
    type: 'expense',
    item: 'Lunch',
    amountCents: 1500,
    accountId: testAccounts.checking.id,
    categoryId: testCategories.foodEatingOut.id,
    merchant: 'Restaurant',
  },
  expense2: {
    id: 'tx-expense-2',
    key: 'tx:2024-01-16:expense:groceries',
    occurredAt: '2024-01-16T14:00:00.000Z',
    type: 'expense',
    item: 'Weekly Groceries',
    amountCents: 8500,
    accountId: testAccounts.creditCard.id,
    categoryId: testCategories.foodGroceries.id,
    merchant: 'Supermarket',
  },
  expense3: {
    id: 'tx-expense-3',
    key: 'tx:2024-01-31:expense:rent',
    occurredAt: '2024-01-31T10:00:00.000Z',
    type: 'expense',
    item: 'January Rent',
    amountCents: 200000,
    accountId: testAccounts.checking.id,
    categoryId: testCategories.housingRent.id,
  },
  income1: {
    id: 'tx-income-1',
    key: 'tx:2024-01-01:income:salary',
    occurredAt: '2024-01-01T09:00:00.000Z',
    type: 'income',
    item: 'January Salary',
    amountCents: 500000,
    accountId: testAccounts.checking.id,
    categoryId: testCategories.salaryBase.id,
  },
  income2: {
    id: 'tx-income-2',
    key: 'tx:2024-02-01:income:salary',
    occurredAt: '2024-02-01T09:00:00.000Z',
    type: 'income',
    item: 'February Salary',
    amountCents: 500000,
    accountId: testAccounts.checking.id,
    categoryId: testCategories.salaryBase.id,
  },
  transfer1: {
    id: 'tx-transfer-1',
    key: 'tx:2024-01-05:transfer:savings',
    occurredAt: '2024-01-05T18:00:00.000Z',
    type: 'transfer',
    item: 'Monthly Savings',
    amountCents: 50000,
    fromAccountId: testAccounts.checking.id,
    toAccountId: testAccounts.savings.id,
    categoryId: testCategories.internal.id,
  },
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Seeding Functions
// ─────────────────────────────────────────────────────────────────────────────

export function seedTestAccounts(ds: DataSource): void {
  const now = new Date().toISOString()

  for (const account of Object.values(testAccounts)) {
    ds.exec(
      `INSERT INTO accounts (id, key, name, nature, kind, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [account.id, account.key, account.name, account.nature, account.kind, now, now]
    )
  }
}

export function seedTestCategories(ds: DataSource): void {
  const now = new Date().toISOString()

  // Insert parent categories first
  const parents = Object.values(testCategories).filter((c) => !('parentId' in c))
  for (const cat of parents) {
    ds.exec(
      `INSERT INTO categories (id, type, key, name, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [cat.id, cat.type, cat.key, cat.name, now, now]
    )
  }

  // Insert child categories
  const children = Object.values(testCategories).filter((c) => 'parentId' in c)
  for (const cat of children) {
    ds.exec(
      `INSERT INTO categories (id, type, key, name, parent_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [cat.id, cat.type, cat.key, cat.name, (cat as any).parentId, now, now]
    )
  }
}

export function seedTestTransactions(ds: DataSource): void {
  const now = new Date().toISOString()

  for (const tx of Object.values(testTransactions)) {
    if (tx.type === 'transfer') {
      ds.exec(
        `INSERT INTO transactions (id, key, occurred_at, type, item, amount_cents, from_account_id, to_account_id, category_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tx.id,
          tx.key,
          tx.occurredAt,
          tx.type,
          tx.item,
          tx.amountCents,
          (tx as any).fromAccountId,
          (tx as any).toAccountId,
          tx.categoryId ?? null,
          now,
          now,
        ]
      )
    } else {
      ds.exec(
        `INSERT INTO transactions (id, key, occurred_at, type, item, amount_cents, account_id, category_id, merchant, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tx.id,
          tx.key,
          tx.occurredAt,
          tx.type,
          tx.item,
          tx.amountCents,
          (tx as any).accountId,
          tx.categoryId ?? null,
          (tx as any).merchant ?? null,
          now,
          now,
        ]
      )
    }
  }
}

/**
 * Seed all test data (accounts, categories, transactions).
 */
export function seedTestData(ds: DataSource): void {
  seedTestAccounts(ds)
  seedTestCategories(ds)
  seedTestTransactions(ds)
}

/**
 * Create a test transaction row insert helper.
 */
export function insertTransaction(
  ds: DataSource,
  tx: {
    id: string
    key?: string
    occurredAt: string
    type: 'expense' | 'income' | 'transfer'
    item?: string
    amountCents: number
    accountId?: string
    fromAccountId?: string
    toAccountId?: string
    categoryId?: string | null
    merchant?: string | null
    note?: string | null
  }
): void {
  const now = new Date().toISOString()

  if (tx.type === 'transfer') {
    ds.exec(
      `INSERT INTO transactions (id, key, occurred_at, type, item, amount_cents, from_account_id, to_account_id, category_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tx.id,
        tx.key ?? `tx:${tx.id}`,
        tx.occurredAt,
        tx.type,
        tx.item ?? null,
        tx.amountCents,
        tx.fromAccountId,
        tx.toAccountId,
        tx.categoryId ?? null,
        now,
        now,
      ]
    )
  } else {
    ds.exec(
      `INSERT INTO transactions (id, key, occurred_at, type, item, amount_cents, account_id, category_id, merchant, note, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tx.id,
        tx.key ?? `tx:${tx.id}`,
        tx.occurredAt,
        tx.type,
        tx.item ?? null,
        tx.amountCents,
        tx.accountId,
        tx.categoryId ?? null,
        tx.merchant ?? null,
        tx.note ?? null,
        now,
        now,
      ]
    )
  }
}
