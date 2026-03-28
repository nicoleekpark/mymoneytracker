import {
  StoreCategorySchema,
  ItemCategorySchema,
  parseStoreCategory,
  parseItemCategory,
} from '@/core/domain/price-tracker/price-tracker.schema'

describe('price-tracker.schema', () => {
  describe('StoreCategorySchema', () => {
    it('accepts valid store categories', () => {
      const validCategories = ['grocery', 'coffee', 'pharmacy', 'restaurant', 'general']
      validCategories.forEach(category => {
        expect(StoreCategorySchema.safeParse(category).success).toBe(true)
      })
    })

    it('rejects invalid values', () => {
      expect(StoreCategorySchema.safeParse('supermarket').success).toBe(false)
      expect(StoreCategorySchema.safeParse('').success).toBe(false)
    })
  })

  describe('ItemCategorySchema', () => {
    it('accepts valid item categories', () => {
      const validCategories = ['produce', 'dairy', 'meat', 'bakery', 'pantry', 'beverage', 'coffee', 'household', 'general']
      validCategories.forEach(category => {
        expect(ItemCategorySchema.safeParse(category).success).toBe(true)
      })
    })

    it('rejects invalid values', () => {
      expect(ItemCategorySchema.safeParse('food').success).toBe(false)
      expect(ItemCategorySchema.safeParse('').success).toBe(false)
    })
  })

  describe('parseStoreCategory', () => {
    it('returns valid value unchanged', () => {
      expect(parseStoreCategory('grocery')).toBe('grocery')
      expect(parseStoreCategory('coffee')).toBe('coffee')
      expect(parseStoreCategory('pharmacy')).toBe('pharmacy')
    })

    it('returns fallback for invalid value', () => {
      expect(parseStoreCategory('supermarket')).toBe('general')
      expect(parseStoreCategory(null)).toBe('general')
      expect(parseStoreCategory(undefined)).toBe('general')
    })
  })

  describe('parseItemCategory', () => {
    it('returns valid value unchanged', () => {
      expect(parseItemCategory('produce')).toBe('produce')
      expect(parseItemCategory('dairy')).toBe('dairy')
      expect(parseItemCategory('meat')).toBe('meat')
    })

    it('returns fallback for invalid value', () => {
      expect(parseItemCategory('food')).toBe('general')
      expect(parseItemCategory(null)).toBe('general')
      expect(parseItemCategory(undefined)).toBe('general')
    })
  })
})
