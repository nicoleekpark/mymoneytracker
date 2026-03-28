import { uuid } from '@/shared/utils/uuid'
import type {
  AddItemInput,
  AddPricePointInput,
  AddStoreInput,
  AddTransactionItemInput,
  ItemCategory,
  PricePoint,
  Store,
  StoreCategory,
  TrackedItem,
  TransactionItem,
} from './price-tracker.types'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

export const STORE_CATEGORIES: StoreCategory[] = ['grocery', 'coffee', 'pharmacy', 'restaurant', 'general']
export const ITEM_CATEGORIES: ItemCategory[] = [
  'produce',
  'dairy',
  'meat',
  'bakery',
  'pantry',
  'beverage',
  'coffee',
  'household',
  'general',
]

// ─────────────────────────────────────────────────────────────────────────────
// Normalization
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalize item name for consistent matching.
 * Trims, lowercases, and removes extra whitespace.
 */
export function normalizeItemName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

// ─────────────────────────────────────────────────────────────────────────────
// Factories
// ─────────────────────────────────────────────────────────────────────────────

export function createStore(input: AddStoreInput): Store {
  if (!input.name.trim()) {
    throw new Error('Store name is required')
  }

  return {
    id: uuid(),
    name: input.name.trim(),
    merchantAlias: input.merchantAlias?.trim() || undefined,
    category: input.category ?? 'general',
    icon: input.icon,
    color: input.color,
    isFavorite: input.isFavorite ?? false,
    isArchived: false,
    sortOrder: input.sortOrder ?? 0,
  }
}

export function createTrackedItem(input: AddItemInput): TrackedItem {
  if (!input.name.trim()) {
    throw new Error('Item name is required')
  }

  return {
    id: uuid(),
    name: input.name.trim(),
    normalizedName: normalizeItemName(input.name),
    category: input.category ?? 'general',
    unit: input.unit,
    icon: input.icon,
    isFavorite: input.isFavorite ?? false,
    isArchived: false,
  }
}

export function createPricePoint(input: AddPricePointInput): PricePoint {
  if (input.priceCents <= 0) {
    throw new Error('Price must be greater than 0')
  }

  if (input.quantity !== undefined && input.quantity <= 0) {
    throw new Error('Quantity must be greater than 0')
  }

  return {
    id: uuid(),
    itemId: input.itemId,
    storeId: input.storeId,
    priceCents: input.priceCents,
    quantity: input.quantity ?? 1,
    occurredAt: input.occurredAt ?? new Date(),
    transactionId: input.transactionId,
    note: input.note,
  }
}

export function createTransactionItem(input: AddTransactionItemInput): TransactionItem {
  if (!input.name.trim()) {
    throw new Error('Item name is required')
  }

  if (input.priceCents <= 0) {
    throw new Error('Price must be greater than 0')
  }

  return {
    id: uuid(),
    transactionId: input.transactionId,
    itemId: input.itemId,
    name: input.name.trim(),
    priceCents: input.priceCents,
    quantity: input.quantity ?? 1,
    unit: input.unit,
    sortOrder: input.sortOrder ?? 0,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

export function isValidStoreCategory(category: string): category is StoreCategory {
  return STORE_CATEGORIES.includes(category as StoreCategory)
}

export function isValidItemCategory(category: string): category is ItemCategory {
  return ITEM_CATEGORIES.includes(category as ItemCategory)
}
