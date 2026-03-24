import type { UUID } from '@/domain/common/uuid'
import type {
  AddItemInput,
  AddPricePointInput,
  AddStoreInput,
  AddTransactionItemInput,
  ItemPriceSummary,
  PricePoint,
  PricePointWithStore,
  Store,
  TrackedItem,
  TransactionItem,
} from './price-tracker.types'

/**
 * PriceTrackerRepository interface - defines data access contract for price tracking.
 * Implementations handle persistence details (SQLite, etc.)
 */
export interface PriceTrackerRepository {
  // ─────────────────────────────────────────────────────────────────────────────
  // Stores
  // ─────────────────────────────────────────────────────────────────────────────

  insertStore(input: AddStoreInput): Store
  updateStore(store: Store): void
  getStoreById(id: UUID): Store | null
  getStoreByMerchant(merchant: string): Store | null
  listStores(includeArchived?: boolean): Store[]
  archiveStore(id: UUID): void

  // ─────────────────────────────────────────────────────────────────────────────
  // Tracked Items
  // ─────────────────────────────────────────────────────────────────────────────

  insertItem(input: AddItemInput): TrackedItem
  updateItem(item: TrackedItem): void
  getItemById(id: UUID): TrackedItem | null
  getItemByNormalizedName(normalizedName: string): TrackedItem | null
  searchItems(query: string, limit?: number): TrackedItem[]
  listItems(category?: string, includeArchived?: boolean): TrackedItem[]
  archiveItem(id: UUID): void

  // ─────────────────────────────────────────────────────────────────────────────
  // Price Points
  // ─────────────────────────────────────────────────────────────────────────────

  insertPricePoint(input: AddPricePointInput): PricePoint
  getPricePointById(id: UUID): PricePoint | null
  listPricePointsForItem(itemId: UUID, limit?: number): PricePointWithStore[]
  listPricePointsForStore(storeId: UUID, limit?: number): PricePoint[]
  getLatestPriceForItemAtStore(itemId: UUID, storeId: UUID): PricePoint | null
  getLowestPriceForItem(itemId: UUID): PricePointWithStore | null
  deletePricePoint(id: UUID): void

  // ─────────────────────────────────────────────────────────────────────────────
  // Transaction Items
  // ─────────────────────────────────────────────────────────────────────────────

  insertTransactionItem(input: AddTransactionItemInput): TransactionItem
  updateTransactionItem(item: TransactionItem): void
  getTransactionItemById(id: UUID): TransactionItem | null
  listTransactionItems(transactionId: UUID): TransactionItem[]
  deleteTransactionItem(id: UUID): void
  deleteTransactionItemsForTransaction(transactionId: UUID): void

  // ─────────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Find an item by name or create a new one if it doesn't exist.
   */
  findOrCreateItemByName(name: string, category?: string): TrackedItem

  /**
   * Find a store by merchant alias or create a new one if it doesn't exist.
   */
  findOrCreateStoreByMerchant(merchant: string): Store

  // ─────────────────────────────────────────────────────────────────────────────
  // Aggregations
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get item summaries with latest and lowest prices.
   */
  listItemPriceSummaries(limit?: number): ItemPriceSummary[]

  /**
   * Count price points for an item.
   */
  countPricePointsForItem(itemId: UUID): number
}
