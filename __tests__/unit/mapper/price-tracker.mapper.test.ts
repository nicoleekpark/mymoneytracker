import {
  rowToStore,
  rowToTrackedItem,
  rowToPricePoint,
  rowToPricePointWithStore,
  rowToTransactionItem,
  storeToRow,
  trackedItemToRow,
  pricePointToRow,
  transactionItemToRow,
  type StoreRow,
  type TrackedItemRow,
  type PricePointRow,
  type PricePointWithStoreRow,
  type TransactionItemRow,
} from '@/infrastructure/mappers/price-tracker.mapper'
import type { Store, TrackedItem, PricePoint, TransactionItem } from '@/core/domain/price-tracker/price-tracker.types'

describe('price-tracker.mapper', () => {
  describe('Store mappers', () => {
    describe('rowToStore', () => {
      it('converts a complete store row to domain', () => {
        const row: StoreRow = {
          id: 'store-1',
          name: 'Trader Joes',
          merchant_alias: 'TRADER JOE',
          category: 'grocery',
          icon: '🛒',
          color: '#FF5733',
          is_favorite: 1,
          is_archived: 0,
          sort_order: 1,
          created_at: '2024-03-15T10:00:00.000Z',
          updated_at: '2024-03-15T10:00:00.000Z',
        }

        const store = rowToStore(row)

        expect(store.id).toBe('store-1')
        expect(store.name).toBe('Trader Joes')
        expect(store.merchantAlias).toBe('TRADER JOE')
        expect(store.category).toBe('grocery')
        expect(store.icon).toBe('🛒')
        expect(store.color).toBe('#FF5733')
        expect(store.isFavorite).toBe(true)
        expect(store.isArchived).toBe(false)
        expect(store.sortOrder).toBe(1)
      })

      it('handles null optional fields', () => {
        const row: StoreRow = {
          id: 'store-2',
          name: 'Generic Store',
          merchant_alias: null,
          category: 'general',
          icon: null,
          color: null,
          is_favorite: 0,
          is_archived: 1,
          sort_order: 2,
          created_at: '2024-03-15T10:00:00.000Z',
          updated_at: '2024-03-15T10:00:00.000Z',
        }

        const store = rowToStore(row)

        expect(store.merchantAlias).toBeUndefined()
        expect(store.icon).toBeUndefined()
        expect(store.color).toBeUndefined()
        expect(store.isFavorite).toBe(false)
        expect(store.isArchived).toBe(true)
      })
    })

    describe('storeToRow', () => {
      it('converts a complete store to row', () => {
        const store: Store = {
          id: 'store-1',
          name: 'Costco',
          merchantAlias: 'COSTCO WHOLESALE',
          category: 'grocery',
          icon: '🏪',
          color: '#0073CF',
          isFavorite: true,
          isArchived: false,
          sortOrder: 1,
        }

        const row = storeToRow(store)

        expect(row.id).toBe('store-1')
        expect(row.name).toBe('Costco')
        expect(row.merchant_alias).toBe('COSTCO WHOLESALE')
        expect(row.category).toBe('grocery')
        expect(row.icon).toBe('🏪')
        expect(row.color).toBe('#0073CF')
        expect(row.is_favorite).toBe(1)
        expect(row.is_archived).toBe(0)
        expect(row.sort_order).toBe(1)
      })

      it('handles undefined optional fields', () => {
        const store: Store = {
          id: 'store-2',
          name: 'Local Shop',
          category: 'general',
          isFavorite: false,
          isArchived: true,
          sortOrder: 5,
        }

        const row = storeToRow(store)

        expect(row.merchant_alias).toBeNull()
        expect(row.icon).toBeNull()
        expect(row.color).toBeNull()
        expect(row.is_favorite).toBe(0)
        expect(row.is_archived).toBe(1)
      })
    })
  })

  describe('TrackedItem mappers', () => {
    describe('rowToTrackedItem', () => {
      it('converts a tracked item row to domain', () => {
        const row: TrackedItemRow = {
          id: 'item-1',
          name: 'Organic Milk',
          normalized_name: 'organic milk',
          category: 'dairy',
          unit: 'gallon',
          icon: '🥛',
          is_favorite: 1,
          is_archived: 0,
          created_at: '2024-03-15T10:00:00.000Z',
          updated_at: '2024-03-15T10:00:00.000Z',
        }

        const item = rowToTrackedItem(row)

        expect(item.id).toBe('item-1')
        expect(item.name).toBe('Organic Milk')
        expect(item.normalizedName).toBe('organic milk')
        expect(item.category).toBe('dairy')
        expect(item.unit).toBe('gallon')
        expect(item.icon).toBe('🥛')
        expect(item.isFavorite).toBe(true)
        expect(item.isArchived).toBe(false)
      })

      it('handles null optional fields', () => {
        const row: TrackedItemRow = {
          id: 'item-2',
          name: 'Generic Item',
          normalized_name: 'generic item',
          category: 'general',
          unit: null,
          icon: null,
          is_favorite: 0,
          is_archived: 1,
          created_at: '2024-03-15T10:00:00.000Z',
          updated_at: '2024-03-15T10:00:00.000Z',
        }

        const item = rowToTrackedItem(row)

        expect(item.unit).toBeUndefined()
        expect(item.icon).toBeUndefined()
        expect(item.isFavorite).toBe(false)
        expect(item.isArchived).toBe(true)
      })
    })

    describe('trackedItemToRow', () => {
      it('converts a tracked item to row', () => {
        const item: TrackedItem = {
          id: 'item-1',
          name: 'Eggs',
          normalizedName: 'eggs',
          category: 'dairy',
          unit: 'dozen',
          icon: '🥚',
          isFavorite: true,
          isArchived: false,
        }

        const row = trackedItemToRow(item)

        expect(row.id).toBe('item-1')
        expect(row.name).toBe('Eggs')
        expect(row.normalized_name).toBe('eggs')
        expect(row.category).toBe('dairy')
        expect(row.unit).toBe('dozen')
        expect(row.icon).toBe('🥚')
        expect(row.is_favorite).toBe(1)
        expect(row.is_archived).toBe(0)
      })
    })
  })

  describe('PricePoint mappers', () => {
    describe('rowToPricePoint', () => {
      it('converts a price point row to domain', () => {
        const row: PricePointRow = {
          id: 'pp-1',
          item_id: 'item-1',
          store_id: 'store-1',
          price_cents: 499,
          quantity: 1,
          occurred_at: '2024-03-15T10:00:00.000Z',
          transaction_id: 'tx-1',
          note: 'On sale',
          created_at: '2024-03-15T10:00:00.000Z',
        }

        const pp = rowToPricePoint(row)

        expect(pp.id).toBe('pp-1')
        expect(pp.itemId).toBe('item-1')
        expect(pp.storeId).toBe('store-1')
        expect(pp.priceCents).toBe(499)
        expect(pp.quantity).toBe(1)
        expect(pp.occurredAt).toEqual(new Date('2024-03-15T10:00:00.000Z'))
        expect(pp.transactionId).toBe('tx-1')
        expect(pp.note).toBe('On sale')
      })

      it('handles null optional fields', () => {
        const row: PricePointRow = {
          id: 'pp-2',
          item_id: 'item-2',
          store_id: 'store-2',
          price_cents: 299,
          quantity: 2,
          occurred_at: '2024-03-15T10:00:00.000Z',
          transaction_id: null,
          note: null,
          created_at: '2024-03-15T10:00:00.000Z',
        }

        const pp = rowToPricePoint(row)

        expect(pp.transactionId).toBeUndefined()
        expect(pp.note).toBeUndefined()
      })
    })

    describe('rowToPricePointWithStore', () => {
      it('includes store info in the domain object', () => {
        const row: PricePointWithStoreRow = {
          id: 'pp-1',
          item_id: 'item-1',
          store_id: 'store-1',
          price_cents: 399,
          quantity: 1,
          occurred_at: '2024-03-15T10:00:00.000Z',
          transaction_id: null,
          note: null,
          created_at: '2024-03-15T10:00:00.000Z',
          store_name: 'Whole Foods',
          store_category: 'grocery',
          store_color: '#00674B',
        }

        const pp = rowToPricePointWithStore(row)

        expect(pp.storeName).toBe('Whole Foods')
        expect(pp.storeCategory).toBe('grocery')
        expect(pp.storeColor).toBe('#00674B')
      })

      it('handles null store color', () => {
        const row: PricePointWithStoreRow = {
          id: 'pp-2',
          item_id: 'item-1',
          store_id: 'store-2',
          price_cents: 299,
          quantity: 1,
          occurred_at: '2024-03-15T10:00:00.000Z',
          transaction_id: null,
          note: null,
          created_at: '2024-03-15T10:00:00.000Z',
          store_name: 'Local Store',
          store_category: 'general',
          store_color: null,
        }

        const pp = rowToPricePointWithStore(row)

        expect(pp.storeColor).toBeUndefined()
      })
    })

    describe('pricePointToRow', () => {
      it('converts a price point to row', () => {
        const pp: PricePoint = {
          id: 'pp-1',
          itemId: 'item-1',
          storeId: 'store-1',
          priceCents: 599,
          quantity: 2,
          occurredAt: new Date('2024-03-15T10:00:00.000Z'),
          transactionId: 'tx-1',
          note: 'Bulk purchase',
        }

        const row = pricePointToRow(pp)

        expect(row.id).toBe('pp-1')
        expect(row.item_id).toBe('item-1')
        expect(row.store_id).toBe('store-1')
        expect(row.price_cents).toBe(599)
        expect(row.quantity).toBe(2)
        expect(row.occurred_at).toBe('2024-03-15T10:00:00.000Z')
        expect(row.transaction_id).toBe('tx-1')
        expect(row.note).toBe('Bulk purchase')
      })

      it('handles undefined optional fields', () => {
        const pp: PricePoint = {
          id: 'pp-2',
          itemId: 'item-1',
          storeId: 'store-1',
          priceCents: 199,
          quantity: 1,
          occurredAt: new Date('2024-03-15T10:00:00.000Z'),
        }

        const row = pricePointToRow(pp)

        expect(row.transaction_id).toBeNull()
        expect(row.note).toBeNull()
      })
    })
  })

  describe('TransactionItem mappers', () => {
    describe('rowToTransactionItem', () => {
      it('converts a transaction item row to domain', () => {
        const row: TransactionItemRow = {
          id: 'ti-1',
          transaction_id: 'tx-1',
          item_id: 'item-1',
          name: 'Apples',
          price_cents: 299,
          quantity: 3,
          unit: 'lb',
          sort_order: 0,
          created_at: '2024-03-15T10:00:00.000Z',
        }

        const item = rowToTransactionItem(row)

        expect(item.id).toBe('ti-1')
        expect(item.transactionId).toBe('tx-1')
        expect(item.itemId).toBe('item-1')
        expect(item.name).toBe('Apples')
        expect(item.priceCents).toBe(299)
        expect(item.quantity).toBe(3)
        expect(item.unit).toBe('lb')
        expect(item.sortOrder).toBe(0)
      })

      it('handles null optional fields', () => {
        const row: TransactionItemRow = {
          id: 'ti-2',
          transaction_id: 'tx-1',
          item_id: null,
          name: 'Misc Item',
          price_cents: 100,
          quantity: 1,
          unit: null,
          sort_order: 1,
          created_at: '2024-03-15T10:00:00.000Z',
        }

        const item = rowToTransactionItem(row)

        expect(item.itemId).toBeUndefined()
        expect(item.unit).toBeUndefined()
      })
    })

    describe('transactionItemToRow', () => {
      it('converts a transaction item to row', () => {
        const item: TransactionItem = {
          id: 'ti-1',
          transactionId: 'tx-1',
          itemId: 'item-1',
          name: 'Bananas',
          priceCents: 129,
          quantity: 1,
          unit: 'bunch',
          sortOrder: 0,
        }

        const row = transactionItemToRow(item)

        expect(row.id).toBe('ti-1')
        expect(row.transaction_id).toBe('tx-1')
        expect(row.item_id).toBe('item-1')
        expect(row.name).toBe('Bananas')
        expect(row.price_cents).toBe(129)
        expect(row.quantity).toBe(1)
        expect(row.unit).toBe('bunch')
        expect(row.sort_order).toBe(0)
      })

      it('handles undefined optional fields', () => {
        const item: TransactionItem = {
          id: 'ti-2',
          transactionId: 'tx-1',
          name: 'Unknown Item',
          priceCents: 50,
          quantity: 1,
          sortOrder: 2,
        }

        const row = transactionItemToRow(item)

        expect(row.item_id).toBeNull()
        expect(row.unit).toBeNull()
      })
    })
  })

  describe('Roundtrip conversions', () => {
    it('Store: preserves data through row -> domain -> row', () => {
      const originalRow: StoreRow = {
        id: 'store-rt',
        name: 'Test Store',
        merchant_alias: 'TEST',
        category: 'grocery',
        icon: '🏪',
        color: '#123456',
        is_favorite: 1,
        is_archived: 0,
        sort_order: 3,
        created_at: '2024-03-15T10:00:00.000Z',
        updated_at: '2024-03-15T10:00:00.000Z',
      }

      const domain = rowToStore(originalRow)
      const convertedRow = storeToRow(domain)

      expect(convertedRow.id).toBe(originalRow.id)
      expect(convertedRow.name).toBe(originalRow.name)
      expect(convertedRow.merchant_alias).toBe(originalRow.merchant_alias)
      expect(convertedRow.category).toBe(originalRow.category)
      expect(convertedRow.is_favorite).toBe(originalRow.is_favorite)
      expect(convertedRow.is_archived).toBe(originalRow.is_archived)
    })

    it('PricePoint: preserves data through row -> domain -> row', () => {
      const originalRow: PricePointRow = {
        id: 'pp-rt',
        item_id: 'item-1',
        store_id: 'store-1',
        price_cents: 899,
        quantity: 2,
        occurred_at: '2024-03-15T10:00:00.000Z',
        transaction_id: 'tx-1',
        note: 'Test note',
        created_at: '2024-03-15T10:00:00.000Z',
      }

      const domain = rowToPricePoint(originalRow)
      const convertedRow = pricePointToRow(domain)

      expect(convertedRow.id).toBe(originalRow.id)
      expect(convertedRow.item_id).toBe(originalRow.item_id)
      expect(convertedRow.store_id).toBe(originalRow.store_id)
      expect(convertedRow.price_cents).toBe(originalRow.price_cents)
      expect(convertedRow.quantity).toBe(originalRow.quantity)
      expect(convertedRow.transaction_id).toBe(originalRow.transaction_id)
      expect(convertedRow.note).toBe(originalRow.note)
    })
  })
})
