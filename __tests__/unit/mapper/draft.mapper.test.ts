import { rowToDraft, draftToRow, type DraftRow, type DraftTransaction } from '@/infrastructure/mappers/draft.mapper'

describe('draft.mapper', () => {
  describe('rowToDraft', () => {
    it('converts a complete row to domain draft', () => {
      const row: DraftRow = {
        id: 'draft-1',
        type: 'expense',
        item: 'Coffee',
        amount_cents: 450,
        currency: 'USD',
        merchant: 'Starbucks',
        note: 'Morning coffee',
        tags: '["food","daily"]',
        category_type: 'expense',
        category_key: 'food',
        subcategory_key: 'coffee',
        account_key: 'checking',
        occurred_at: '2024-03-15T10:00:00.000Z',
        receipt_uri: 'file://receipts/1.jpg',
        created_at: '2024-03-15T09:00:00.000Z',
        updated_at: '2024-03-15T09:00:00.000Z',
        starred: 1,
      }

      const draft = rowToDraft(row)

      expect(draft.id).toBe('draft-1')
      expect(draft.type).toBe('expense')
      expect(draft.item).toBe('Coffee')
      expect(draft.amountCents).toBe(450)
      expect(draft.merchant).toBe('Starbucks')
      expect(draft.note).toBe('Morning coffee')
      expect(draft.tags).toEqual(['food', 'daily'])
      expect(draft.categoryRef).toEqual({
        type: 'expense',
        categoryKey: 'food',
        subCategoryKey: 'coffee',
      })
      expect(draft.accountKey).toBe('checking')
      expect(draft.occurredAt).toBe('2024-03-15T10:00:00.000Z')
      expect(draft.receiptUri).toBe('file://receipts/1.jpg')
      expect(draft.createdAt).toBe('2024-03-15T09:00:00.000Z')
      expect(draft.starred).toBe(true)
    })

    it('handles null values correctly', () => {
      const row: DraftRow = {
        id: 'draft-2',
        type: 'income',
        item: null,
        amount_cents: null,
        currency: null,
        merchant: null,
        note: null,
        tags: null,
        category_type: null,
        category_key: null,
        subcategory_key: null,
        account_key: null,
        occurred_at: null,
        receipt_uri: null,
        created_at: '2024-03-15T09:00:00.000Z',
        updated_at: '2024-03-15T09:00:00.000Z',
        starred: 0,
      }

      const draft = rowToDraft(row)

      expect(draft.item).toBe('')
      expect(draft.amountCents).toBe(0)
      expect(draft.merchant).toBeUndefined()
      expect(draft.note).toBeUndefined()
      expect(draft.tags).toBeUndefined()
      expect(draft.categoryRef).toBeUndefined()
      expect(draft.accountKey).toBeUndefined()
      expect(draft.receiptUri).toBeUndefined()
      expect(draft.starred).toBe(false)
      // occurredAt should default to current date
      expect(draft.occurredAt).toBeDefined()
    })

    it('handles empty tags array', () => {
      const row: DraftRow = {
        id: 'draft-3',
        type: 'expense',
        item: 'Test',
        amount_cents: 100,
        currency: 'USD',
        merchant: null,
        note: null,
        tags: '[]',
        category_type: null,
        category_key: null,
        subcategory_key: null,
        account_key: null,
        occurred_at: '2024-03-15T10:00:00.000Z',
        receipt_uri: null,
        created_at: '2024-03-15T09:00:00.000Z',
        updated_at: '2024-03-15T09:00:00.000Z',
        starred: 0,
      }

      const draft = rowToDraft(row)
      expect(draft.tags).toBeUndefined()
    })

    it('handles invalid JSON in tags', () => {
      const row: DraftRow = {
        id: 'draft-4',
        type: 'expense',
        item: 'Test',
        amount_cents: 100,
        currency: 'USD',
        merchant: null,
        note: null,
        tags: 'invalid-json',
        category_type: null,
        category_key: null,
        subcategory_key: null,
        account_key: null,
        occurred_at: '2024-03-15T10:00:00.000Z',
        receipt_uri: null,
        created_at: '2024-03-15T09:00:00.000Z',
        updated_at: '2024-03-15T09:00:00.000Z',
        starred: 0,
      }

      const draft = rowToDraft(row)
      expect(draft.tags).toBeUndefined()
    })

    it('creates categoryRef only when type and key are present', () => {
      const row: DraftRow = {
        id: 'draft-5',
        type: 'expense',
        item: 'Test',
        amount_cents: 100,
        currency: 'USD',
        merchant: null,
        note: null,
        tags: null,
        category_type: 'expense',
        category_key: null, // key missing
        subcategory_key: null,
        account_key: null,
        occurred_at: '2024-03-15T10:00:00.000Z',
        receipt_uri: null,
        created_at: '2024-03-15T09:00:00.000Z',
        updated_at: '2024-03-15T09:00:00.000Z',
        starred: 0,
      }

      const draft = rowToDraft(row)
      expect(draft.categoryRef).toBeUndefined()
    })
  })

  describe('draftToRow', () => {
    it('converts a complete draft to row', () => {
      const draft: DraftTransaction = {
        id: 'draft-1',
        type: 'expense',
        item: 'Coffee',
        amountCents: 450,
        merchant: 'Starbucks',
        note: 'Morning coffee',
        tags: ['food', 'daily'],
        categoryRef: {
          type: 'expense',
          categoryKey: 'food',
          subCategoryKey: 'coffee',
        },
        accountKey: 'checking',
        occurredAt: '2024-03-15T10:00:00.000Z',
        receiptUri: 'file://receipts/1.jpg',
        createdAt: '2024-03-15T09:00:00.000Z',
        starred: true,
      }

      const row = draftToRow(draft)

      expect(row.id).toBe('draft-1')
      expect(row.type).toBe('expense')
      expect(row.item).toBe('Coffee')
      expect(row.amount_cents).toBe(450)
      expect(row.currency).toBe('USD')
      expect(row.merchant).toBe('Starbucks')
      expect(row.note).toBe('Morning coffee')
      expect(row.tags).toBe('["food","daily"]')
      expect(row.category_type).toBe('expense')
      expect(row.category_key).toBe('food')
      expect(row.subcategory_key).toBe('coffee')
      expect(row.account_key).toBe('checking')
      expect(row.occurred_at).toBe('2024-03-15T10:00:00.000Z')
      expect(row.receipt_uri).toBe('file://receipts/1.jpg')
      expect(row.created_at).toBe('2024-03-15T09:00:00.000Z')
      expect(row.starred).toBe(1)
    })

    it('handles undefined optional fields', () => {
      const draft: DraftTransaction = {
        id: 'draft-2',
        type: 'income',
        item: '',
        amountCents: 0,
        occurredAt: '2024-03-15T10:00:00.000Z',
        createdAt: '2024-03-15T09:00:00.000Z',
        starred: false,
      }

      const row = draftToRow(draft)

      expect(row.item).toBeNull()
      expect(row.amount_cents).toBeNull()
      expect(row.merchant).toBeNull()
      expect(row.note).toBeNull()
      expect(row.tags).toBe('[]')
      expect(row.category_type).toBeNull()
      expect(row.category_key).toBeNull()
      expect(row.subcategory_key).toBeNull()
      expect(row.account_key).toBeNull()
      expect(row.receipt_uri).toBeNull()
      expect(row.starred).toBe(0)
    })

    it('handles empty tags array', () => {
      const draft: DraftTransaction = {
        id: 'draft-3',
        type: 'expense',
        item: 'Test',
        amountCents: 100,
        tags: [],
        occurredAt: '2024-03-15T10:00:00.000Z',
        createdAt: '2024-03-15T09:00:00.000Z',
        starred: false,
      }

      const row = draftToRow(draft)
      expect(row.tags).toBe('[]')
    })
  })

  describe('roundtrip conversion', () => {
    it('preserves data through row -> draft -> row conversion', () => {
      const originalRow: DraftRow = {
        id: 'draft-roundtrip',
        type: 'expense',
        item: 'Groceries',
        amount_cents: 5000,
        currency: 'USD',
        merchant: 'Trader Joes',
        note: 'Weekly shopping',
        tags: '["groceries","weekly"]',
        category_type: 'expense',
        category_key: 'food',
        subcategory_key: 'groceries',
        account_key: 'credit',
        occurred_at: '2024-03-15T10:00:00.000Z',
        receipt_uri: 'file://receipts/2.jpg',
        created_at: '2024-03-15T09:00:00.000Z',
        updated_at: '2024-03-15T09:00:00.000Z',
        starred: 1,
      }

      const draft = rowToDraft(originalRow)
      const convertedRow = draftToRow(draft)

      expect(convertedRow.id).toBe(originalRow.id)
      expect(convertedRow.type).toBe(originalRow.type)
      expect(convertedRow.item).toBe(originalRow.item)
      expect(convertedRow.amount_cents).toBe(originalRow.amount_cents)
      expect(convertedRow.merchant).toBe(originalRow.merchant)
      expect(convertedRow.note).toBe(originalRow.note)
      expect(convertedRow.category_type).toBe(originalRow.category_type)
      expect(convertedRow.category_key).toBe(originalRow.category_key)
      expect(convertedRow.subcategory_key).toBe(originalRow.subcategory_key)
      expect(convertedRow.account_key).toBe(originalRow.account_key)
      expect(convertedRow.occurred_at).toBe(originalRow.occurred_at)
      expect(convertedRow.receipt_uri).toBe(originalRow.receipt_uri)
      expect(convertedRow.starred).toBe(originalRow.starred)
    })
  })
})
