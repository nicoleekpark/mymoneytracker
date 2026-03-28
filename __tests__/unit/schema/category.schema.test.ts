import {
  CategoryTypeSchema,
  parseCategoryType,
} from '@/core/domain/category/category.schema'

describe('category.schema', () => {
  describe('CategoryTypeSchema', () => {
    it('accepts valid category types', () => {
      expect(CategoryTypeSchema.safeParse('expense').success).toBe(true)
      expect(CategoryTypeSchema.safeParse('income').success).toBe(true)
      expect(CategoryTypeSchema.safeParse('transfer').success).toBe(true)
    })

    it('rejects invalid values', () => {
      expect(CategoryTypeSchema.safeParse('payment').success).toBe(false)
      expect(CategoryTypeSchema.safeParse('').success).toBe(false)
      expect(CategoryTypeSchema.safeParse(null).success).toBe(false)
    })
  })

  describe('parseCategoryType', () => {
    it('returns valid value unchanged', () => {
      expect(parseCategoryType('expense')).toBe('expense')
      expect(parseCategoryType('income')).toBe('income')
      expect(parseCategoryType('transfer')).toBe('transfer')
    })

    it('returns fallback for invalid string', () => {
      expect(parseCategoryType('payment')).toBe('expense')
      expect(parseCategoryType('')).toBe('expense')
    })

    it('returns fallback for non-string types', () => {
      expect(parseCategoryType(null)).toBe('expense')
      expect(parseCategoryType(undefined)).toBe('expense')
      expect(parseCategoryType(123)).toBe('expense')
    })
  })
})
