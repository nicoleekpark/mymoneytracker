import { exec, queryFirst } from '../sqlite'
import type { Migration } from './types'

/**
 * Migration: Consolidate duplicate subcategory keys
 *
 * Addresses duplicate subcategory keys across parents:
 * - home_insurance: existed in both housing and insurance → keep only insurance
 * - pet_insurance: existed in both pets and insurance → keep only insurance
 * - cash_gift: existed in both gifts and income → rename to distinct keys
 *
 * NOTE: Handles the case where the seeder already created the new keys from
 * the updated config before this migration ran. In that case, we re-point
 * transactions and delete the old keys instead of renaming.
 */
export const m20260615100000_consolidate_duplicate_subcategories: Migration = {
  id: 20260615100000,
  name: 'consolidate_duplicate_subcategories',
  up: () => {
    // Helper to check if a category key exists
    const keyExists = (key: string) =>
      !!queryFirst<{ id: string }>(`SELECT id FROM categories WHERE key = ? LIMIT 1`, [key])

    // 1. Re-point transactions from housing.home_insurance → insurance.home_insurance
    exec(`
      UPDATE transactions
      SET category_id = (
        SELECT id FROM categories WHERE key = 'insurance.home_insurance' LIMIT 1
      )
      WHERE category_id IN (
        SELECT id FROM categories WHERE key = 'housing.home_insurance'
      )
      AND EXISTS (SELECT 1 FROM categories WHERE key = 'insurance.home_insurance');
    `)

    // 2. Re-point transactions from pets.pet_insurance → insurance.pet_insurance
    exec(`
      UPDATE transactions
      SET category_id = (
        SELECT id FROM categories WHERE key = 'insurance.pet_insurance' LIMIT 1
      )
      WHERE category_id IN (
        SELECT id FROM categories WHERE key = 'pets.pet_insurance'
      )
      AND EXISTS (SELECT 1 FROM categories WHERE key = 'insurance.pet_insurance');
    `)

    // 3. Handle gifts.cash_gift → gifts.cash_gift_given
    if (keyExists('gifts.cash_gift_given')) {
      // New key already exists (seeder ran first) - re-point and delete old
      exec(`
        UPDATE transactions
        SET category_id = (
          SELECT id FROM categories WHERE key = 'gifts.cash_gift_given' LIMIT 1
        )
        WHERE category_id IN (
          SELECT id FROM categories WHERE key = 'gifts.cash_gift'
        );
      `)
      exec(`DELETE FROM categories WHERE key = 'gifts.cash_gift';`)
    } else if (keyExists('gifts.cash_gift')) {
      // Old key exists, new doesn't - rename
      exec(`
        UPDATE categories
        SET key = 'gifts.cash_gift_given', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
        WHERE key = 'gifts.cash_gift';
      `)
    }

    // 4. Handle income.cash_gift → income.cash_gift_received
    if (keyExists('income.cash_gift_received')) {
      // New key already exists (seeder ran first) - re-point and delete old
      exec(`
        UPDATE transactions
        SET category_id = (
          SELECT id FROM categories WHERE key = 'income.cash_gift_received' LIMIT 1
        )
        WHERE category_id IN (
          SELECT id FROM categories WHERE key = 'income.cash_gift'
        );
      `)
      exec(`DELETE FROM categories WHERE key = 'income.cash_gift';`)
    } else if (keyExists('income.cash_gift')) {
      // Old key exists, new doesn't - rename
      exec(`
        UPDATE categories
        SET key = 'income.cash_gift_received', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
        WHERE key = 'income.cash_gift';
      `)
    }

    // 5. Delete orphaned housing.home_insurance (no longer in config)
    exec(`DELETE FROM categories WHERE key = 'housing.home_insurance';`)

    // 6. Delete orphaned pets.pet_insurance (no longer in config)
    exec(`DELETE FROM categories WHERE key = 'pets.pet_insurance';`)
  },
}
