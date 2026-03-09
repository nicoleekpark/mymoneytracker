import type { CategoryIndex } from '@/config'
import type { CategoryRef, CategoryType } from './category.types'

/** when "food.eating_out", normalize it to "eating_out" */
export function normalizeSubKeyFromDbKey(dbKey: string): string {
  const parts = dbKey.split('.')
  return parts[parts.length - 1] || dbKey
}

/**
 * Validates that a CategoryRef points to a valid category in the index.
 * Uses type narrowing to avoid 'any' casts.
 */
function isValidCategoryRef(index: CategoryIndex, ref: CategoryRef | null | undefined): boolean {
  if (!ref) return false

  // Validate ref has required string properties
  if (typeof ref !== 'object') return false
  if (!('type' in ref) || typeof ref.type !== 'string') return false
  if (!('categoryKey' in ref) || typeof ref.categoryKey !== 'string') return false

  // Validate type is a known category type
  const validTypes: CategoryType[] = ['expense', 'income', 'transfer']
  if (!validTypes.includes(ref.type)) return false

  // Look up category in index
  const typeMap = index[ref.type]
  const subKeys = typeMap?.[ref.categoryKey] as readonly string[] | undefined
  if (!subKeys) return false

  // Validate subcategory if provided
  if (ref.subCategoryKey && !subKeys.includes(ref.subCategoryKey)) return false
  return true
}

export function assertValidCategoryRef(index: CategoryIndex, ref: CategoryRef): void {
  if (!isValidCategoryRef(index, ref)) {
    throw new Error(`Invalid CategoryRef: ${ref.type}/${ref.categoryKey}/${ref.subCategoryKey ?? ''}`)
  }
}