import type { CategoryIndex } from '@/config/categories.index'
import type { CategoryRef, CategoryType } from './category.types'

export function normalizeSubKeyFromDbKey(dbKey: string): string {
  // DB가 "food.eating_out"로 저장돼있으면 "eating_out"로 정규화
  const parts = dbKey.split('.')
  return parts[parts.length - 1] || dbKey
}

export function isValidCategoryRef(index: CategoryIndex, ref: CategoryRef | null | undefined): boolean {
  if (!ref) return false

  if (
    typeof ref !== 'object' ||
    typeof (ref as any).type !== 'string' ||
    typeof (ref as any).categoryKey !== 'string'
  ) {
    return false
  }

  const type = ref.type as CategoryType
  const typeMap = (index as any)[type]
  const subKeys: string[] | undefined = typeMap?.[ref.categoryKey]
  if (!subKeys) return false

  if (ref.subCategoryKey && !subKeys.includes(ref.subCategoryKey)) return false
  return true
}

export function assertValidCategoryRef(index: CategoryIndex, ref: CategoryRef): void {
  if (!isValidCategoryRef(index, ref)) {
    throw new Error(`Invalid CategoryRef: ${ref.type}/${ref.categoryKey}/${ref.subCategoryKey ?? ''}`)
  }
}