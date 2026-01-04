import type { CategoryIndex } from '@/config/categories.index'
import type { CategoryRef } from './category.ref'

export function isValidCategoryRef(index: CategoryIndex, ref: CategoryRef): boolean {
  const typeMap = index[ref.type]
  const subIds = typeMap?.[ref.categoryId]
  if (!subIds) return false

  if (!ref.subCategoryId) return true
  return subIds.includes(ref.subCategoryId)
}

export function assertValidCategoryRef(index: CategoryIndex, ref: CategoryRef): void {
  if (!isValidCategoryRef(index, ref)) {
    throw new Error(`Invalid CategoryRef: ${ref.type}/${ref.categoryId}/${ref.subCategoryId ?? ''}`)
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