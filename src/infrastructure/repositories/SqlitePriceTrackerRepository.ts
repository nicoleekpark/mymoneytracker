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
} from '@/domain/price-tracker/price-tracker.types'
import type { PriceTrackerRepository } from '@/domain/price-tracker/price-tracker.repository'
import {
  createPricePoint,
  createStore,
  createTrackedItem,
  createTransactionItem,
  normalizeItemName,
} from '@/domain/price-tracker/price-tracker.model'
import type { DataSource } from '../db/DataSource'
import {
  rowToPricePoint,
  rowToPricePointWithStore,
  rowToStore,
  rowToTrackedItem,
  rowToTransactionItem,
  type PricePointRow,
  type PricePointWithStoreRow,
  type StoreRow,
  type TrackedItemRow,
  type TransactionItemRow,
} from '../mappers/price-tracker.mapper'

/**
 * SQLite implementation of PriceTrackerRepository.
 */
export class SqlitePriceTrackerRepository implements PriceTrackerRepository {
  constructor(private readonly dataSource: DataSource) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // Stores
  // ─────────────────────────────────────────────────────────────────────────────

  insertStore(input: AddStoreInput): Store {
    const store = createStore(input)
    const now = new Date().toISOString()

    this.dataSource.exec(
      `
      INSERT INTO stores (id, name, merchant_alias, category, icon, color, is_favorite, is_archived, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        store.id,
        store.name,
        store.merchantAlias ?? null,
        store.category,
        store.icon ?? null,
        store.color ?? null,
        store.isFavorite ? 1 : 0,
        store.isArchived ? 1 : 0,
        store.sortOrder,
        now,
        now,
      ]
    )

    return store
  }

  updateStore(store: Store): void {
    const now = new Date().toISOString()

    this.dataSource.exec(
      `
      UPDATE stores SET
        name = ?,
        merchant_alias = ?,
        category = ?,
        icon = ?,
        color = ?,
        is_favorite = ?,
        is_archived = ?,
        sort_order = ?,
        updated_at = ?
      WHERE id = ?
      `,
      [
        store.name,
        store.merchantAlias ?? null,
        store.category,
        store.icon ?? null,
        store.color ?? null,
        store.isFavorite ? 1 : 0,
        store.isArchived ? 1 : 0,
        store.sortOrder,
        now,
        store.id,
      ]
    )
  }

  getStoreById(id: UUID): Store | null {
    const row = this.dataSource.queryFirst<StoreRow>(
      `SELECT * FROM stores WHERE id = ?`,
      [id]
    )
    return row ? rowToStore(row) : null
  }

  getStoreByMerchant(merchant: string): Store | null {
    const normalized = merchant.trim().toLowerCase()
    const row = this.dataSource.queryFirst<StoreRow>(
      `SELECT * FROM stores WHERE LOWER(merchant_alias) = ? OR LOWER(name) = ?`,
      [normalized, normalized]
    )
    return row ? rowToStore(row) : null
  }

  listStores(includeArchived = false): Store[] {
    const sql = includeArchived
      ? `SELECT * FROM stores ORDER BY is_favorite DESC, sort_order ASC, name ASC`
      : `SELECT * FROM stores WHERE is_archived = 0 ORDER BY is_favorite DESC, sort_order ASC, name ASC`

    const rows = this.dataSource.queryAll<StoreRow>(sql)
    return rows.map(rowToStore)
  }

  archiveStore(id: UUID): void {
    const now = new Date().toISOString()
    this.dataSource.exec(
      `UPDATE stores SET is_archived = 1, updated_at = ? WHERE id = ?`,
      [now, id]
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Tracked Items
  // ─────────────────────────────────────────────────────────────────────────────

  insertItem(input: AddItemInput): TrackedItem {
    const item = createTrackedItem(input)
    const now = new Date().toISOString()

    this.dataSource.exec(
      `
      INSERT INTO tracked_items (id, name, normalized_name, category, unit, icon, is_favorite, is_archived, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        item.id,
        item.name,
        item.normalizedName,
        item.category,
        item.unit ?? null,
        item.icon ?? null,
        item.isFavorite ? 1 : 0,
        item.isArchived ? 1 : 0,
        now,
        now,
      ]
    )

    return item
  }

  updateItem(item: TrackedItem): void {
    const now = new Date().toISOString()

    this.dataSource.exec(
      `
      UPDATE tracked_items SET
        name = ?,
        normalized_name = ?,
        category = ?,
        unit = ?,
        icon = ?,
        is_favorite = ?,
        is_archived = ?,
        updated_at = ?
      WHERE id = ?
      `,
      [
        item.name,
        item.normalizedName,
        item.category,
        item.unit ?? null,
        item.icon ?? null,
        item.isFavorite ? 1 : 0,
        item.isArchived ? 1 : 0,
        now,
        item.id,
      ]
    )
  }

  getItemById(id: UUID): TrackedItem | null {
    const row = this.dataSource.queryFirst<TrackedItemRow>(
      `SELECT * FROM tracked_items WHERE id = ?`,
      [id]
    )
    return row ? rowToTrackedItem(row) : null
  }

  getItemByNormalizedName(normalizedName: string): TrackedItem | null {
    const row = this.dataSource.queryFirst<TrackedItemRow>(
      `SELECT * FROM tracked_items WHERE normalized_name = ?`,
      [normalizedName]
    )
    return row ? rowToTrackedItem(row) : null
  }

  searchItems(query: string, limit = 10): TrackedItem[] {
    const normalized = normalizeItemName(query)
    if (!normalized) return []

    const rows = this.dataSource.queryAll<TrackedItemRow>(
      `
      SELECT * FROM tracked_items
      WHERE is_archived = 0
        AND normalized_name LIKE ?
      ORDER BY is_favorite DESC, name ASC
      LIMIT ?
      `,
      [`%${normalized}%`, limit]
    )

    return rows.map(rowToTrackedItem)
  }

  listItems(category?: string, includeArchived = false): TrackedItem[] {
    let sql = `SELECT * FROM tracked_items`
    const args: unknown[] = []
    const conditions: string[] = []

    if (!includeArchived) {
      conditions.push(`is_archived = 0`)
    }

    if (category) {
      conditions.push(`category = ?`)
      args.push(category)
    }

    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(' AND ')
    }

    sql += ` ORDER BY is_favorite DESC, name ASC`

    const rows = this.dataSource.queryAll<TrackedItemRow>(sql, args)
    return rows.map(rowToTrackedItem)
  }

  archiveItem(id: UUID): void {
    const now = new Date().toISOString()
    this.dataSource.exec(
      `UPDATE tracked_items SET is_archived = 1, updated_at = ? WHERE id = ?`,
      [now, id]
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Price Points
  // ─────────────────────────────────────────────────────────────────────────────

  insertPricePoint(input: AddPricePointInput): PricePoint {
    const pp = createPricePoint(input)
    const now = new Date().toISOString()

    this.dataSource.exec(
      `
      INSERT INTO price_points (id, item_id, store_id, price_cents, quantity, occurred_at, transaction_id, note, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        pp.id,
        pp.itemId,
        pp.storeId,
        pp.priceCents,
        pp.quantity,
        pp.occurredAt.toISOString(),
        pp.transactionId ?? null,
        pp.note ?? null,
        now,
      ]
    )

    return pp
  }

  getPricePointById(id: UUID): PricePoint | null {
    const row = this.dataSource.queryFirst<PricePointRow>(
      `SELECT * FROM price_points WHERE id = ?`,
      [id]
    )
    return row ? rowToPricePoint(row) : null
  }

  listPricePointsForItem(itemId: UUID, limit = 50): PricePointWithStore[] {
    const rows = this.dataSource.queryAll<PricePointWithStoreRow>(
      `
      SELECT
        pp.*,
        s.name AS store_name,
        s.category AS store_category,
        s.color AS store_color
      FROM price_points pp
      JOIN stores s ON pp.store_id = s.id
      WHERE pp.item_id = ?
      ORDER BY pp.occurred_at DESC
      LIMIT ?
      `,
      [itemId, limit]
    )

    return rows.map(rowToPricePointWithStore)
  }

  listPricePointsForStore(storeId: UUID, limit = 50): PricePoint[] {
    const rows = this.dataSource.queryAll<PricePointRow>(
      `
      SELECT * FROM price_points
      WHERE store_id = ?
      ORDER BY occurred_at DESC
      LIMIT ?
      `,
      [storeId, limit]
    )

    return rows.map(rowToPricePoint)
  }

  getLatestPriceForItemAtStore(itemId: UUID, storeId: UUID): PricePoint | null {
    const row = this.dataSource.queryFirst<PricePointRow>(
      `
      SELECT * FROM price_points
      WHERE item_id = ? AND store_id = ?
      ORDER BY occurred_at DESC
      LIMIT 1
      `,
      [itemId, storeId]
    )

    return row ? rowToPricePoint(row) : null
  }

  getLowestPriceForItem(itemId: UUID): PricePointWithStore | null {
    const row = this.dataSource.queryFirst<PricePointWithStoreRow>(
      `
      SELECT
        pp.*,
        s.name AS store_name,
        s.category AS store_category,
        s.color AS store_color
      FROM price_points pp
      JOIN stores s ON pp.store_id = s.id
      WHERE pp.item_id = ?
      ORDER BY (pp.price_cents / pp.quantity) ASC
      LIMIT 1
      `,
      [itemId]
    )

    return row ? rowToPricePointWithStore(row) : null
  }

  deletePricePoint(id: UUID): void {
    this.dataSource.exec(`DELETE FROM price_points WHERE id = ?`, [id])
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Transaction Items
  // ─────────────────────────────────────────────────────────────────────────────

  insertTransactionItem(input: AddTransactionItemInput): TransactionItem {
    const item = createTransactionItem(input)
    const now = new Date().toISOString()

    this.dataSource.exec(
      `
      INSERT INTO transaction_items (id, transaction_id, item_id, name, price_cents, quantity, unit, sort_order, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        item.id,
        item.transactionId,
        item.itemId ?? null,
        item.name,
        item.priceCents,
        item.quantity,
        item.unit ?? null,
        item.sortOrder,
        now,
      ]
    )

    return item
  }

  updateTransactionItem(item: TransactionItem): void {
    this.dataSource.exec(
      `
      UPDATE transaction_items SET
        item_id = ?,
        name = ?,
        price_cents = ?,
        quantity = ?,
        unit = ?,
        sort_order = ?
      WHERE id = ?
      `,
      [
        item.itemId ?? null,
        item.name,
        item.priceCents,
        item.quantity,
        item.unit ?? null,
        item.sortOrder,
        item.id,
      ]
    )
  }

  getTransactionItemById(id: UUID): TransactionItem | null {
    const row = this.dataSource.queryFirst<TransactionItemRow>(
      `SELECT * FROM transaction_items WHERE id = ?`,
      [id]
    )
    return row ? rowToTransactionItem(row) : null
  }

  listTransactionItems(transactionId: UUID): TransactionItem[] {
    const rows = this.dataSource.queryAll<TransactionItemRow>(
      `
      SELECT * FROM transaction_items
      WHERE transaction_id = ?
      ORDER BY sort_order ASC
      `,
      [transactionId]
    )

    return rows.map(rowToTransactionItem)
  }

  deleteTransactionItem(id: UUID): void {
    this.dataSource.exec(`DELETE FROM transaction_items WHERE id = ?`, [id])
  }

  deleteTransactionItemsForTransaction(transactionId: UUID): void {
    this.dataSource.exec(`DELETE FROM transaction_items WHERE transaction_id = ?`, [transactionId])
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────────

  findOrCreateItemByName(name: string, category?: string): TrackedItem {
    const normalized = normalizeItemName(name)
    const existing = this.getItemByNormalizedName(normalized)

    if (existing) {
      return existing
    }

    return this.insertItem({
      name,
      category: category as any,
    })
  }

  findOrCreateStoreByMerchant(merchant: string): Store {
    const existing = this.getStoreByMerchant(merchant)

    if (existing) {
      return existing
    }

    return this.insertStore({
      name: merchant,
      merchantAlias: merchant,
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Aggregations
  // ─────────────────────────────────────────────────────────────────────────────

  listItemPriceSummaries(limit = 50): ItemPriceSummary[] {
    // Get items with price point counts
    const items = this.dataSource.queryAll<TrackedItemRow & { price_point_count: number }>(
      `
      SELECT ti.*, COUNT(pp.id) AS price_point_count
      FROM tracked_items ti
      LEFT JOIN price_points pp ON ti.id = pp.item_id
      WHERE ti.is_archived = 0
      GROUP BY ti.id
      ORDER BY ti.is_favorite DESC, price_point_count DESC, ti.name ASC
      LIMIT ?
      `,
      [limit]
    )

    return items.map((item) => {
      const trackedItem = rowToTrackedItem(item)

      // Get latest price
      const latestRow = this.dataSource.queryFirst<PricePointWithStoreRow>(
        `
        SELECT
          pp.*,
          s.name AS store_name,
          s.category AS store_category,
          s.color AS store_color
        FROM price_points pp
        JOIN stores s ON pp.store_id = s.id
        WHERE pp.item_id = ?
        ORDER BY pp.occurred_at DESC
        LIMIT 1
        `,
        [item.id]
      )

      // Get lowest price (price per unit)
      const lowestRow = this.dataSource.queryFirst<PricePointWithStoreRow>(
        `
        SELECT
          pp.*,
          s.name AS store_name,
          s.category AS store_category,
          s.color AS store_color
        FROM price_points pp
        JOIN stores s ON pp.store_id = s.id
        WHERE pp.item_id = ?
        ORDER BY (pp.price_cents / pp.quantity) ASC
        LIMIT 1
        `,
        [item.id]
      )

      return {
        item: trackedItem,
        latestPrice: latestRow ? rowToPricePointWithStore(latestRow) : undefined,
        lowestPrice: lowestRow ? rowToPricePointWithStore(lowestRow) : undefined,
        pricePointCount: item.price_point_count,
      }
    })
  }

  countPricePointsForItem(itemId: UUID): number {
    const row = this.dataSource.queryFirst<{ count: number }>(
      `SELECT COUNT(*) AS count FROM price_points WHERE item_id = ?`,
      [itemId]
    )
    return row?.count ?? 0
  }
}
