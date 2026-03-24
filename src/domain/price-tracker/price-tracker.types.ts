import type { UUID } from '@/domain/common/uuid'

// ─────────────────────────────────────────────────────────────────────────────
// Store Types
// ─────────────────────────────────────────────────────────────────────────────

export type StoreCategory = 'grocery' | 'coffee' | 'pharmacy' | 'restaurant' | 'general'

export type Store = Readonly<{
  id: UUID
  name: string
  merchantAlias?: string
  category: StoreCategory
  icon?: string
  color?: string
  isFavorite: boolean
  isArchived: boolean
  sortOrder: number
}>

export type AddStoreInput = Readonly<{
  name: string
  merchantAlias?: string
  category?: StoreCategory
  icon?: string
  color?: string
  isFavorite?: boolean
  sortOrder?: number
}>

// ─────────────────────────────────────────────────────────────────────────────
// Tracked Item Types
// ─────────────────────────────────────────────────────────────────────────────

export type ItemCategory =
  | 'produce'
  | 'dairy'
  | 'meat'
  | 'bakery'
  | 'pantry'
  | 'beverage'
  | 'coffee'
  | 'household'
  | 'general'

export type TrackedItem = Readonly<{
  id: UUID
  name: string
  normalizedName: string
  category: ItemCategory
  unit?: string
  icon?: string
  isFavorite: boolean
  isArchived: boolean
}>

export type AddItemInput = Readonly<{
  name: string
  category?: ItemCategory
  unit?: string
  icon?: string
  isFavorite?: boolean
}>

// ─────────────────────────────────────────────────────────────────────────────
// Price Point Types
// ─────────────────────────────────────────────────────────────────────────────

export type PricePoint = Readonly<{
  id: UUID
  itemId: UUID
  storeId: UUID
  priceCents: number
  quantity: number
  occurredAt: Date
  transactionId?: UUID
  note?: string
}>

export type AddPricePointInput = Readonly<{
  itemId: UUID
  storeId: UUID
  priceCents: number
  quantity?: number
  occurredAt?: Date
  transactionId?: UUID
  note?: string
}>

// ─────────────────────────────────────────────────────────────────────────────
// Transaction Item Types
// ─────────────────────────────────────────────────────────────────────────────

export type TransactionItem = Readonly<{
  id: UUID
  transactionId: UUID
  itemId?: UUID
  name: string
  priceCents: number
  quantity: number
  unit?: string
  sortOrder: number
}>

export type AddTransactionItemInput = Readonly<{
  transactionId: UUID
  itemId?: UUID
  name: string
  priceCents: number
  quantity?: number
  unit?: string
  sortOrder?: number
}>

// ─────────────────────────────────────────────────────────────────────────────
// Aggregated Types
// ─────────────────────────────────────────────────────────────────────────────

export type PricePointWithStore = PricePoint &
  Readonly<{
    storeName: string
    storeCategory: StoreCategory
    storeColor?: string
  }>

export type ItemPriceSummary = Readonly<{
  item: TrackedItem
  latestPrice?: PricePointWithStore
  lowestPrice?: PricePointWithStore
  pricePointCount: number
}>
