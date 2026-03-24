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

// Usecases
export {
  addItem,
  addItemToTransaction,
  addPricePoint,
  addStore,
  addTransactionItem,
  archiveItem,
  archiveStore,
  deleteTransactionItems,
  getItemById,
  getItemPriceSummaries,
  getItemPriceSummariesDollar,
  getItems,
  getLatestPriceForItemAtStore,
  getLowestPriceForItem,
  getOrCreateStoreFromMerchant,
  getPriceHistoryForItem,
  getStoreById,
  getStoreByMerchant,
  getStores,
  getTransactionItems,
  searchItems,
} from './price-tracker.usecase'

export type { ItemPriceSummaryDollar } from './price-tracker.usecase'
