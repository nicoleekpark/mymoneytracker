/**
 * Safe JSON Parsing Utilities
 *
 * Provides consistent error handling for JSON parsing across the codebase.
 */

import { logger } from './logger'

/**
 * Safely parse JSON with logging on failure.
 *
 * @param json - The JSON string to parse
 * @param context - Context for error logging (e.g., 'DraftMapper', 'SettingsStorage')
 * @param contextId - Optional ID for the item being parsed (e.g., draftId, notificationId)
 * @returns Parsed value or null on failure
 *
 * @example
 * ```typescript
 * const tags = tryParseJson<string[]>(row.tags, 'DraftMapper', row.id)
 * if (tags && Array.isArray(tags)) {
 *   // use tags
 * }
 * ```
 */
export function tryParseJson<T>(
  json: string | null | undefined,
  context: string,
  contextId?: string
): T | null {
  if (!json) return null

  try {
    return JSON.parse(json) as T
  } catch (e) {
    logger.warn(context, 'Failed to parse JSON', {
      contextId,
      rawValue: json.slice(0, 100),
      error: e instanceof Error ? e.message : String(e),
    })
    return null
  }
}

/**
 * Safely parse JSON array with validation.
 * Returns empty array on failure instead of null.
 *
 * @param json - The JSON string to parse
 * @param context - Context for error logging
 * @param contextId - Optional ID for the item being parsed
 * @returns Parsed array or empty array on failure
 */
export function tryParseJsonArray<T>(
  json: string | null | undefined,
  context: string,
  contextId?: string
): T[] {
  const parsed = tryParseJson<T[]>(json, context, contextId)
  if (parsed && Array.isArray(parsed)) {
    return parsed
  }
  return []
}
