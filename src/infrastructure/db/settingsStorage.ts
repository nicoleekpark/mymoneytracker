/**
 * Settings Storage Utility
 *
 * Simple key-value storage for persisting Zustand store state.
 * Uses the app_settings SQLite table.
 */

import { queryFirst, exec } from './sqlite'
import { tryParseJson } from '@/shared/utils/json'

type SettingsRow = {
  key: string
  value: string
  updated_at: string
}

/**
 * Get a value from settings storage
 * @returns parsed JSON value or null if not found
 */
export function getStoredValue<T>(key: string): T | null {
  const row = queryFirst<SettingsRow>(
    `SELECT value FROM app_settings WHERE key = ?`,
    [key]
  )

  if (!row) return null

  return tryParseJson<T>(row.value, 'SettingsStorage', key)
}

/**
 * Set a value in settings storage
 * @param key - The key to store under
 * @param value - The value to store (will be JSON stringified)
 */
export function setStoredValue<T>(key: string, value: T): void {
  const now = new Date().toISOString()
  const jsonValue = JSON.stringify(value)

  exec(
    `INSERT INTO app_settings (key, value, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = ?`,
    [key, jsonValue, now, jsonValue, now]
  )
}

/**
 * Delete a value from settings storage
 */
export function deleteStoredValue(key: string): void {
  exec(`DELETE FROM app_settings WHERE key = ?`, [key])
}

/**
 * Storage keys for different stores
 */
export const STORAGE_KEYS = {
  SETTINGS: 'store:settings',
  TAGS: 'store:tags',
  QUICK_CHIPS: 'store:quickChips',
} as const
