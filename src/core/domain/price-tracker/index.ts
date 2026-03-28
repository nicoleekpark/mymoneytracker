// Domain layer - Price Tracker (pure types, models, interfaces)
// Use cases moved to @/application/price-tracker

// Types
export type {
  AddItemInput,
  AddPricePointInput,
  AddStoreInput,
  AddTransactionItemInput,
  ItemCategory,
  ItemPriceSummary,
  PricePoint,
  PricePointWithStore,
  Store,
  StoreCategory,
  TrackedItem,
  TransactionItem,
} from './price-tracker.types'

// Model (factories, constants, validation)
export {
  createPricePoint,
  createStore,
  createTrackedItem,
  createTransactionItem,
  isValidItemCategory,
  isValidStoreCategory,
  ITEM_CATEGORIES,
  normalizeItemName,
  STORE_CATEGORIES,
} from './price-tracker.model'

// Repository interface
export type { PriceTrackerRepository } from './price-tracker.repository'

// Zod schemas for runtime validation
export {
  StoreCategorySchema,
  ItemCategorySchema,
  parseStoreCategory,
  parseItemCategory,
} from './price-tracker.schema'
