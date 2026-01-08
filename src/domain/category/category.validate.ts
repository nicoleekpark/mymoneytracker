import type { CategoryIndex } from '@/config/categories.index'
import type { CategoryRef } from './category.ref'

export function isValidCategoryRef(index: CategoryIndex, ref: CategoryRef | null | undefined): boolean {
  if (!ref) return false

  if (
    typeof ref !== 'object' ||
    typeof (ref as any).type !== 'string' ||
    typeof (ref as any).categoryId !== 'string'
  ) {
    return false
  }

  const typeMap = index[ref.type]
  const subIds = typeMap?.[ref.categoryId]
  if (!subIds) return false

  if (ref.subCategoryId && !subIds.includes(ref.subCategoryId)) return false
  return true
}

export function assertValidCategoryRef(index: CategoryIndex, ref: CategoryRef): void {
  if (!isValidCategoryRef(index, ref)) {
    const safe: any = ref
    throw new Error(
    `Invalid CategoryRef: ${safe?.type ?? 'undefined'}/${safe?.categoryId ?? 'undefined'}/${safe?.subCategoryId ?? ''}`
    )
  }
}

// CategoryIndex = {
//   expense: {
//     housing: ['property_tax', 'utilities', 'hoa', 'repairs', 'home_insurance'],
//     food: ['groceries', 'eating_out'],
//     lifestyle: ['home_items', 'clothes', 'beauty', 'electronics', 'misc'],
//     ...
//   },
//   income: {
//     ...
//   },
//   transfer: {
//     savings: ['monthly_savings', 'emergency', 'investing', 'retirement']
//   }
// }