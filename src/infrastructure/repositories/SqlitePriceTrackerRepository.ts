import type { UUID } from '@/core/domain/common/uuid'
import type {
  AddItemInput,
  AddPricePointInput,
  AddStoreInput,
  AddTransactionItemInput,
  ItemCategory,
  ItemPriceSummary,
  PricePoint,
  PricePointWithStore,
  Store,
  TrackedItem,
  TransactionItem,
} from '@/core/domain/price-tracker/price-tracker.types'
import type { PriceTrackerRepository } from '@/core/domain/price-tracker/price-tracker.repository'
import {
  createPricePoint,
  createStore,
  createTrackedItem,
  createTransactionItem,
  normalizeItemName,
} from '@/core/domain/price-tracker/price-tracker.model'
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
      category: category as ItemCategory | undefined,
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
    // Fetch items with their latest and lowest prices in a single query
    // Uses window functions to avoid N+1 queries
    type ItemSummaryRow = TrackedItemRow & {
      price_point_count: number
      // Latest price fields (prefixed with latest_)
      latest_pp_id: string | null
      latest_store_id: string | null
      latest_price_cents: number | null
      latest_quantity: number | null
      latest_occurred_at: string | null
      latest_transaction_id: string | null
      latest_note: string | null
      latest_pp_created_at: string | null
      latest_store_name: string | null
      latest_store_category: string | null
      latest_store_color: string | null
      // Lowest price fields (prefixed with lowest_)
      lowest_pp_id: string | null
      lowest_store_id: string | null
      lowest_price_cents: number | null
      lowest_quantity: number | null
      lowest_occurred_at: string | null
      lowest_transaction_id: string | null
      lowest_note: string | null
      lowest_pp_created_at: string | null
      lowest_store_name: string | null
      lowest_store_category: string | null
      lowest_store_color: string | null
    }

    const rows = this.dataSource.queryAll<ItemSummaryRow>(
      `
      WITH item_stats AS (
        SELECT
          ti.*,
          COUNT(pp.id) AS price_point_count
        FROM tracked_items ti
        LEFT JOIN price_points pp ON ti.id = pp.item_id
        WHERE ti.is_archived = 0
        GROUP BY ti.id
        ORDER BY ti.is_favorite DESC, price_point_count DESC, ti.name ASC
        LIMIT ?
      ),
      latest_prices AS (
        SELECT
          pp.item_id,
          pp.id AS pp_id,
          pp.store_id,
          pp.price_cents,
          pp.quantity,
          pp.occurred_at,
          pp.transaction_id,
          pp.note,
          pp.created_at AS pp_created_at,
          s.name AS store_name,
          s.category AS store_category,
          s.color AS store_color,
          ROW_NUMBER() OVER (PARTITION BY pp.item_id ORDER BY pp.occurred_at DESC) AS rn
        FROM price_points pp
        JOIN stores s ON pp.store_id = s.id
        WHERE pp.item_id IN (SELECT id FROM item_stats)
      ),
      lowest_prices AS (
        SELECT
          pp.item_id,
          pp.id AS pp_id,
          pp.store_id,
          pp.price_cents,
          pp.quantity,
          pp.occurred_at,
          pp.transaction_id,
          pp.note,
          pp.created_at AS pp_created_at,
          s.name AS store_name,
          s.category AS store_category,
          s.color AS store_color,
          ROW_NUMBER() OVER (PARTITION BY pp.item_id ORDER BY (pp.price_cents * 1.0 / pp.quantity) ASC) AS rn
        FROM price_points pp
        JOIN stores s ON pp.store_id = s.id
        WHERE pp.item_id IN (SELECT id FROM item_stats)
      )
      SELECT
        i.*,
        lp.pp_id AS latest_pp_id,
        lp.store_id AS latest_store_id,
        lp.price_cents AS latest_price_cents,
        lp.quantity AS latest_quantity,
        lp.occurred_at AS latest_occurred_at,
        lp.transaction_id AS latest_transaction_id,
        lp.note AS latest_note,
        lp.pp_created_at AS latest_pp_created_at,
        lp.store_name AS latest_store_name,
        lp.store_category AS latest_store_category,
        lp.store_color AS latest_store_color,
        lo.pp_id AS lowest_pp_id,
        lo.store_id AS lowest_store_id,
        lo.price_cents AS lowest_price_cents,
        lo.quantity AS lowest_quantity,
        lo.occurred_at AS lowest_occurred_at,
        lo.transaction_id AS lowest_transaction_id,
        lo.note AS lowest_note,
        lo.pp_created_at AS lowest_pp_created_at,
        lo.store_name AS lowest_store_name,
        lo.store_category AS lowest_store_category,
        lo.store_color AS lowest_store_color
      FROM item_stats i
      LEFT JOIN latest_prices lp ON i.id = lp.item_id AND lp.rn = 1
      LEFT JOIN lowest_prices lo ON i.id = lo.item_id AND lo.rn = 1
      ORDER BY i.is_favorite DESC, i.price_point_count DESC, i.name ASC
      `,
      [limit]
    )

    return rows.map((row) => {
      const item = rowToTrackedItem(row)

      // Build latest price if present
      let latestPrice: PricePointWithStore | undefined
      if (row.latest_pp_id) {
        latestPrice = rowToPricePointWithStore({
          id: row.latest_pp_id,
          item_id: row.id,
          store_id: row.latest_store_id!,
          price_cents: row.latest_price_cents!,
          quantity: row.latest_quantity!,
          occurred_at: row.latest_occurred_at!,
          transaction_id: row.latest_transaction_id,
          note: row.latest_note,
          created_at: row.latest_pp_created_at!,
          store_name: row.latest_store_name!,
          store_category: row.latest_store_category!,
          store_color: row.latest_store_color,
        })
      }

      // Build lowest price if present
      let lowestPrice: PricePointWithStore | undefined
      if (row.lowest_pp_id) {
        lowestPrice = rowToPricePointWithStore({
          id: row.lowest_pp_id,
          item_id: row.id,
          store_id: row.lowest_store_id!,
          price_cents: row.lowest_price_cents!,
          quantity: row.lowest_quantity!,
          occurred_at: row.lowest_occurred_at!,
          transaction_id: row.lowest_transaction_id,
          note: row.lowest_note,
          created_at: row.lowest_pp_created_at!,
          store_name: row.lowest_store_name!,
          store_category: row.lowest_store_category!,
          store_color: row.lowest_store_color,
        })
      }

      return {
        item,
        latestPrice,
        lowestPrice,
        pricePointCount: row.price_point_count,
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
