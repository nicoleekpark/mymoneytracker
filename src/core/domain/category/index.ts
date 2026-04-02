// Domain layer - Category (pure types, models, interfaces)
// Use cases moved to @/core/services/category

export type { CategoryRef, CategoryType, CategoryIndex } from './category.types'

export { assertValidCategoryRef, normalizeSubKeyFromDbKey } from './category.model'

export { UNCATEGORIZED_KEY, UNCATEGORIZED_LABEL } from './category.constants'

// Zod schemas for runtime validation
export {
  CategoryTypeSchema,
  parseCategoryType,
} from './category.schema'
