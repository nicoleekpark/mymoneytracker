import { CATEGORIES } from '@/config/categories.config'
import { UNCATEGORIZED_COLOR } from '@/theme/tokens/viewStyles'
import type { CategoryType } from '@/domain/category/category.types'

export type CategoryMeta = {
  name: string
  icon: string
  color: string
}

type CategoryRef = {
  type: CategoryType
  categoryKey: string
  subCategoryKey?: string
}

/**
 * Get display metadata for a category reference.
 * Returns fallback values for uncategorized items.
 */
export function getCategoryMeta(ref?: CategoryRef): CategoryMeta {
  if (!ref) {
    return { name: 'Other', icon: 'cube', color: UNCATEGORIZED_COLOR }
  }

  const cat = CATEGORIES.find(c => c.type === ref.type && c.key === ref.categoryKey)
  if (!cat) {
    return { name: ref.categoryKey, icon: 'cube', color: UNCATEGORIZED_COLOR }
  }

  return { name: cat.name, icon: cat.icon, color: cat.color }
}

/**
 * Get display metadata for a subcategory.
 * Returns null if parent or subcategory not found.
 */
export function getSubcategoryMeta(
  parentKey: string,
  subKey: string
): CategoryMeta | null {
  const parent = CATEGORIES.find(c => c.key === parentKey)
  if (!parent) return null

  const sub = parent.subCategories.find(s => s.key === subKey)
  if (!sub) return null

  return { name: sub.name, icon: sub.icon, color: sub.color }
}
