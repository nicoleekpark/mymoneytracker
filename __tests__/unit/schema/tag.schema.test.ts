import {
  TagCategorySchema,
  parseTagCategory,
} from '@/core/domain/tag/tag.schema'

describe('tag.schema', () => {
  describe('TagCategorySchema', () => {
    it('accepts valid tag categories', () => {
      expect(TagCategorySchema.safeParse('quick').success).toBe(true)
      expect(TagCategorySchema.safeParse('occurrence').success).toBe(true)
      expect(TagCategorySchema.safeParse('amount').success).toBe(true)
      expect(TagCategorySchema.safeParse('custom').success).toBe(true)
    })

    it('rejects invalid values', () => {
      expect(TagCategorySchema.safeParse('system').success).toBe(false)
      expect(TagCategorySchema.safeParse('').success).toBe(false)
      expect(TagCategorySchema.safeParse(null).success).toBe(false)
    })
  })

  describe('parseTagCategory', () => {
    it('returns valid value unchanged', () => {
      expect(parseTagCategory('quick')).toBe('quick')
      expect(parseTagCategory('occurrence')).toBe('occurrence')
      expect(parseTagCategory('amount')).toBe('amount')
      expect(parseTagCategory('custom')).toBe('custom')
    })

    it('returns fallback for invalid string', () => {
      expect(parseTagCategory('system')).toBe('custom')
      expect(parseTagCategory('')).toBe('custom')
    })

    it('returns fallback for non-string types', () => {
      expect(parseTagCategory(null)).toBe('custom')
      expect(parseTagCategory(undefined)).toBe('custom')
      expect(parseTagCategory(123)).toBe('custom')
    })
  })
})
