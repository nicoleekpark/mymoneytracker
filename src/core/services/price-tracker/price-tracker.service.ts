// ═══════════════════════════════════════════════════════════════════════════
// APPLICATION SERVICE: Price Tracker
// Business logic functions that orchestrate domain + infrastructure.
// ═══════════════════════════════════════════════════════════════════════════

import type { UUID } from '@/core/domain/common/uuid'
import { centsToDollars } from '@/core/domain/common/money'
import type {
  AddItemInput,
  AddPricePointInput,
  AddStoreInput,
  AddTransactionItemInput,
  ItemPriceSummary,
  PricePointWithStore,
  Store,
  TrackedItem,
  TransactionItem,
} from '@/core/domain/price-tracker'
import { priceTrackerRepository } from '@/infrastructure/repositories'

// ─────────────────────────────────────────────────────────────────────────────
// Stores
// ─────────────────────────────────────────────────────────────────────────────

export function addStore(input: AddStoreInput): Store {
  return priceTrackerRepository.insertStore(input)
}

export function getStoreById(id: UUID): Store | null {
  return priceTrackerRepository.getStoreById(id)
}

export function getStoreByMerchant(merchant: string): Store | null {
  return priceTrackerRepository.getStoreByMerchant(merchant)
}

export function getStores(includeArchived = false): Store[] {
  return priceTrackerRepository.listStores(includeArchived)
}

export function archiveStore(id: UUID): void {
  priceTrackerRepository.archiveStore(id)
}

// ─────────────────────────────────────────────────────────────────────────────
// Tracked Items
// ─────────────────────────────────────────────────────────────────────────────

export function addItem(input: AddItemInput): TrackedItem {
  return priceTrackerRepository.insertItem(input)
}

export function getItemById(id: UUID): TrackedItem | null {
  return priceTrackerRepository.getItemById(id)
}

export function searchItems(query: string, limit = 10): TrackedItem[] {
  return priceTrackerRepository.searchItems(query, limit)
}

export function getItems(category?: string, includeArchived = false): TrackedItem[] {
  return priceTrackerRepository.listItems(category, includeArchived)
}

export function archiveItem(id: UUID): void {
  priceTrackerRepository.archiveItem(id)
}

// ─────────────────────────────────────────────────────────────────────────────
// Price Points
// ─────────────────────────────────────────────────────────────────────────────

export function addPricePoint(input: AddPricePointInput): void {
  priceTrackerRepository.insertPricePoint(input)
}

export function getPriceHistoryForItem(itemId: UUID, limit = 50): PricePointWithStore[] {
  return priceTrackerRepository.listPricePointsForItem(itemId, limit)
}

export function getLowestPriceForItem(itemId: UUID): PricePointWithStore | null {
  return priceTrackerRepository.getLowestPriceForItem(itemId)
}

export function getLatestPriceForItemAtStore(itemId: UUID, storeId: UUID): PricePointWithStore | null {
  const pricePoint = priceTrackerRepository.getLatestPriceForItemAtStore(itemId, storeId)
  if (!pricePoint) return null
  // Fetch store to return PricePointWithStore
  const store = priceTrackerRepository.getStoreById(storeId)
  if (!store) return null
  return {
    ...pricePoint,
    storeName: store.name,
    storeCategory: store.category,
    storeColor: store.color,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Transaction Items
// ─────────────────────────────────────────────────────────────────────────────

export function addTransactionItem(input: AddTransactionItemInput): TransactionItem {
  return priceTrackerRepository.insertTransactionItem(input)
}

export function getTransactionItems(transactionId: UUID): TransactionItem[] {
  return priceTrackerRepository.listTransactionItems(transactionId)
}

export function deleteTransactionItems(transactionId: UUID): void {
  priceTrackerRepository.deleteTransactionItemsForTransaction(transactionId)
}

// ─────────────────────────────────────────────────────────────────────────────
// Combined Operations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Add an item to a transaction and optionally record a price point.
 * If the item name matches an existing tracked item, links to it.
 */
export function addItemToTransaction(
  transactionId: UUID,
  input: {
    name: string
    priceCents: number
    quantity?: number
    unit?: string
    storeId?: UUID
    recordPricePoint?: boolean
    occurredAt?: Date
  }
): TransactionItem {
  // Find or create the tracked item
  const trackedItem = priceTrackerRepository.findOrCreateItemByName(input.name)

  // Create transaction item
  const txItem = priceTrackerRepository.insertTransactionItem({
    transactionId,
    itemId: trackedItem.id,
    name: input.name,
    priceCents: input.priceCents,
    quantity: input.quantity,
    unit: input.unit,
  })

  // Optionally record a price point
  if (input.recordPricePoint && input.storeId) {
    priceTrackerRepository.insertPricePoint({
      itemId: trackedItem.id,
      storeId: input.storeId,
      priceCents: input.priceCents,
      quantity: input.quantity,
      transactionId,
      occurredAt: input.occurredAt,
    })
  }

  return txItem
}

/**
 * Get or create a store from a merchant name.
 */
export function getOrCreateStoreFromMerchant(merchant: string): Store {
  return priceTrackerRepository.findOrCreateStoreByMerchant(merchant)
}

// ─────────────────────────────────────────────────────────────────────────────
// Summaries
// ─────────────────────────────────────────────────────────────────────────────

export function getItemPriceSummaries(limit = 50): ItemPriceSummary[] {
  return priceTrackerRepository.listItemPriceSummaries(limit)
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatting Helpers (dollar-based)
// ─────────────────────────────────────────────────────────────────────────────

export type ItemPriceSummaryDollar = {
  item: TrackedItem
  latestPrice?: PricePointWithStore & { priceDollar: number }
  lowestPrice?: PricePointWithStore & { priceDollar: number }
  pricePointCount: number
}

export function getItemPriceSummariesDollar(limit = 50): ItemPriceSummaryDollar[] {
  const summaries = priceTrackerRepository.listItemPriceSummaries(limit)

  return summaries.map((s) => ({
    ...s,
    latestPrice: s.latestPrice
      ? { ...s.latestPrice, priceDollar: centsToDollars(s.latestPrice.priceCents) }
      : undefined,
    lowestPrice: s.lowestPrice
      ? { ...s.lowestPrice, priceDollar: centsToDollars(s.lowestPrice.priceCents) }
      : undefined,
  }))
}
