/**
 * Test Database Setup
 *
 * Creates an in-memory SQLite database for integration tests.
 * Uses better-sqlite3 which has a synchronous API matching our DataSource interface.
 */
import Database from 'better-sqlite3'
import type { DataSource } from '@/infrastructure/db/DataSource'

/**
 * Create a test DataSource with an in-memory SQLite database.
 * Each call creates a fresh, empty database.
 */
export function createTestDataSource(): DataSource & { close: () => void } {
  const db = new Database(':memory:')

  return {
    exec(sql: string, args?: unknown[]): void {
      if (args && args.length > 0) {
        db.prepare(sql).run(...args)
      } else {
        db.exec(sql)
      }
    },

    queryAll<T>(sql: string, args?: unknown[]): T[] {
      const stmt = db.prepare(sql)
      return (args && args.length > 0 ? stmt.all(...args) : stmt.all()) as T[]
    },

    queryFirst<T>(sql: string, args?: unknown[]): T | null {
      const stmt = db.prepare(sql)
      const result = args && args.length > 0 ? stmt.get(...args) : stmt.get()
      return (result as T) ?? null
    },

    withTransaction<T>(fn: () => T): T {
      return db.transaction(fn)()
    },

    close(): void {
      db.close()
    },
  }
}

/**
 * Initialize the database schema for tests.
 * Creates all necessary tables matching production schema.
 */
export function initTestSchema(ds: DataSource): void {
  ds.exec(`
    PRAGMA foreign_keys = ON;

    -- Accounts table
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY NOT NULL,
      key TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      nature TEXT NOT NULL CHECK (nature IN ('asset','liability')),
      kind TEXT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_system INTEGER NOT NULL DEFAULT 0 CHECK (is_system IN (0,1)),
      is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0,1)),
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );

    -- Categories table
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('expense','income','transfer')),
      key TEXT NOT NULL,
      name TEXT NOT NULL,
      parent_id TEXT,
      icon TEXT,
      color TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_system INTEGER NOT NULL DEFAULT 0 CHECK (is_system IN (0,1)),
      is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0,1)),
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE RESTRICT
    );

    CREATE UNIQUE INDEX IF NOT EXISTS uq_categories_type_key ON categories(type, key);

    -- Transactions table
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      key TEXT UNIQUE,
      occurred_at TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('expense','income','transfer')),
      item TEXT,
      amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
      currency TEXT NOT NULL DEFAULT 'USD',
      account_id TEXT,
      from_account_id TEXT,
      to_account_id TEXT,
      category_id TEXT,
      merchant TEXT,
      note TEXT,
      member_id TEXT,
      is_estimated INTEGER NOT NULL DEFAULT 0 CHECK (is_estimated IN (0,1)),
      is_opening_balance INTEGER NOT NULL DEFAULT 0 CHECK (is_opening_balance IN (0,1)),
      is_system INTEGER NOT NULL DEFAULT 0 CHECK (is_system IN (0,1)),
      fee_cents INTEGER DEFAULT NULL,
      parent_transaction_id TEXT REFERENCES transactions(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      CHECK (
        (type IN ('expense','income')
          AND account_id IS NOT NULL
          AND from_account_id IS NULL
          AND to_account_id IS NULL
        )
        OR
        (type = 'transfer'
          AND account_id IS NULL
          AND from_account_id IS NOT NULL
          AND to_account_id IS NOT NULL
          AND from_account_id != to_account_id
        )
      ),
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE RESTRICT,
      FOREIGN KEY (from_account_id) REFERENCES accounts(id) ON DELETE RESTRICT,
      FOREIGN KEY (to_account_id) REFERENCES accounts(id) ON DELETE RESTRICT,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_occurred_at_id
      ON transactions(occurred_at DESC, id DESC);
    CREATE INDEX IF NOT EXISTS idx_transactions_account_id
      ON transactions(account_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_type
      ON transactions(type);

    -- Tags table
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL CHECK (category IN ('premade', 'occurrence', 'custom')),
      color TEXT,
      is_system INTEGER NOT NULL DEFAULT 0 CHECK (is_system IN (0, 1)),
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    -- Transaction tags junction table
    CREATE TABLE IF NOT EXISTS transaction_tags (
      transaction_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      PRIMARY KEY (transaction_id, tag_id),
      FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_transaction_tags_transaction_id
      ON transaction_tags(transaction_id);
    CREATE INDEX IF NOT EXISTS idx_transaction_tags_tag_id
      ON transaction_tags(tag_id);
  `)
}

export type TestDataSource = ReturnType<typeof createTestDataSource>
