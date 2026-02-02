import { execMany } from '../sqlite'
import type { Migration } from './types'

/**
 * Transaction Drafts Table Migration
 *
 * Stores incomplete transactions for "save and sort out later" feature.
 * Drafts are promoted to transactions when completed.
 *
 * Workflow:
 * 1. User saves draft with partial data (item OR amount required)
 * 2. Draft appears in Notifications > Drafts tab
 * 3. User completes draft → promoted to transactions table
 * 4. Original draft row deleted
 *
 * Design decisions:
 * - Mirrors transactions table structure for easy promotion
 * - All fields nullable except id and type (flexible partial saves)
 * - category stored as separate fields (not FK) for draft flexibility
 * - No FK to accounts (draft may have invalid/outdated account)
 */
export const m20260131100300_create_drafts: Migration = {
  id: 20260131100300,
  name: 'create_drafts',
  up: () => {
    execMany(`
      CREATE TABLE IF NOT EXISTS transaction_drafts (
        id TEXT PRIMARY KEY NOT NULL,

        -- Transaction type (required)
        type TEXT NOT NULL CHECK (type IN ('expense', 'income', 'transfer')),

        -- Item description (optional for drafts)
        item TEXT,

        -- Amount in cents (optional for drafts)
        amount_cents INTEGER,

        -- Currency code
        currency TEXT DEFAULT 'USD',

        -- Merchant/location
        merchant TEXT,

        -- Notes
        note TEXT,

        -- Category reference (stored as strings, not FK)
        category_type TEXT,
        category_key TEXT,
        subcategory_key TEXT,

        -- Account reference (stored as key, not FK)
        account_key TEXT,

        -- When the transaction occurred (or will occur)
        occurred_at TEXT,

        -- Receipt image URI
        receipt_uri TEXT,

        -- Tags (stored as JSON array for draft flexibility)
        tags TEXT DEFAULT '[]',

        -- Timestamps
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      );

      -- Index for listing drafts by creation date (newest first)
      CREATE INDEX IF NOT EXISTS idx_drafts_created_at
        ON transaction_drafts(created_at DESC);

      -- Index for filtering by type
      CREATE INDEX IF NOT EXISTS idx_drafts_type
        ON transaction_drafts(type);
    `)
  },
}
