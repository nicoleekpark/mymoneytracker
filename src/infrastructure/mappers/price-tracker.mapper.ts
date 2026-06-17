import type { UUID } from '@/core/domain/common/uuid'
import type {
  ItemCategory,
  PricePoint,
  PricePointWithStore,
  Store,
  StoreCategory,
  TrackedItem,
  TransactionItem,
} from '@/core/domain/price-tracker/price-tracker.types'
import { toLocalISOString } from '@/shared/utils/date'

// ─────────────────────────────────────────────────────────────────────────────
// Row Types (snake_case to match database columns)
// ─────────────────────────────────────────────────────────────────────────────

export type StoreRow = Readonly<{
  id: UUID
  name: string
  merchant_alias: string | null
  category: string
  icon: string | null
  color: string | null
  is_favorite: number
  is_archived: number
  sort_order: number
  created_at: string
  updated_at: string
}>

export type TrackedItemRow = Readonly<{
  id: UUID
  name: string
  normalized_name: string
  category: string
  unit: string | null
  icon: string | null
  is_favorite: number
  is_archived: number
  created_at: string
  updated_at: string
}>

export type PricePointRow = Readonly<{
  id: UUID
  item_id: UUID
  store_id: UUID
  price_cents: number
  quantity: number
  occurred_at: string
  transaction_id: UUID | null
  note: string | null
  created_at: string
}>

export type PricePointWithStoreRow = PricePointRow &
  Readonly<{
    store_name: string
    store_category: string
    store_color: string | null
  }>

export type TransactionItemRow = Readonly<{
  id: UUID
  transaction_id: UUID
  item_id: UUID | null
  name: string
  price_cents: number
  quantity: number
  unit: string | null
  sort_order: number
  created_at: string
}>

// ─────────────────────────────────────────────────────────────────────────────
// Row to Domain Converters
// ─────────────────────────────────────────────────────────────────────────────

export function rowToStore(row: StoreRow): Store {
  return {
    id: row.id,
    name: row.name,
    merchantAlias: row.merchant_alias ?? undefined,
    category: row.category as StoreCategory,
    icon: row.icon ?? undefined,
    color: row.color ?? undefined,
    isFavorite: row.is_favorite === 1,
    isArchived: row.is_archived === 1,
    sortOrder: row.sort_order,
  }
}

export function rowToTrackedItem(row: TrackedItemRow): TrackedItem {
  return {
    id: row.id,
    name: row.name,
    normalizedName: row.normalized_name,
    category: row.category as ItemCategory,
    unit: row.unit ?? undefined,
    icon: row.icon ?? undefined,
    isFavorite: row.is_favorite === 1,
    isArchived: row.is_archived === 1,
  }
}

export function rowToPricePoint(row: PricePointRow): PricePoint {
  return {
    id: row.id,
    itemId: row.item_id,
    storeId: row.store_id,
    priceCents: row.price_cents,
    quantity: row.quantity,
    occurredAt: new Date(row.occurred_at),
    transactionId: row.transaction_id ?? undefined,
    note: row.note ?? undefined,
  }
}

export function rowToPricePointWithStore(row: PricePointWithStoreRow): PricePointWithStore {
  return {
    ...rowToPricePoint(row),
    storeName: row.store_name,
    storeCategory: row.store_category as StoreCategory,
    storeColor: row.store_color ?? undefined,
  }
}

export function rowToTransactionItem(row: TransactionItemRow): TransactionItem {
  return {
    id: row.id,
    transactionId: row.transaction_id,
    itemId: row.item_id ?? undefined,
    name: row.name,
    priceCents: row.price_cents,
    quantity: row.quantity,
    unit: row.unit ?? undefined,
    sortOrder: row.sort_order,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Domain to Row Converters
// ─────────────────────────────────────────────────────────────────────────────

export function storeToRow(store: Store): Omit<StoreRow, 'created_at' | 'updated_at'> {
  return {
    id: store.id,
    name: store.name,
    merchant_alias: store.merchantAlias ?? null,
    category: store.category,
    icon: store.icon ?? null,
    color: store.color ?? null,
    is_favorite: store.isFavorite ? 1 : 0,
    is_archived: store.isArchived ? 1 : 0,
    sort_order: store.sortOrder,
  }
}

export function trackedItemToRow(item: TrackedItem): Omit<TrackedItemRow, 'created_at' | 'updated_at'> {
  return {
    id: item.id,
    name: item.name,
    normalized_name: item.normalizedName,
    category: item.category,
    unit: item.unit ?? null,
    icon: item.icon ?? null,
    is_favorite: item.isFavorite ? 1 : 0,
    is_archived: item.isArchived ? 1 : 0,
  }
}

export function pricePointToRow(pp: PricePoint): Omit<PricePointRow, 'created_at'> {
  return {
    id: pp.id,
    item_id: pp.itemId,
    store_id: pp.storeId,
    price_cents: pp.priceCents,
    quantity: pp.quantity,
    occurred_at: toLocalISOString(pp.occurredAt),
    transaction_id: pp.transactionId ?? null,
    note: pp.note ?? null,
  }
}

export function transactionItemToRow(item: TransactionItem): Omit<TransactionItemRow, 'created_at'> {
  return {
    id: item.id,
    transaction_id: item.transactionId,
    item_id: item.itemId ?? null,
    name: item.name,
    price_cents: item.priceCents,
    quantity: item.quantity,
    unit: item.unit ?? null,
    sort_order: item.sortOrder,
  }
}
