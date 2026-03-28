import {
  parseAssetField,
  parseAssetCategory,
  parseFamilyMemberRole,
  AssetFieldSchema,
  AssetCategorySchema,
  FamilyMemberRoleSchema,
} from '@/core/domain/asset/asset.schema'

describe('asset.schema', () => {
  describe('AssetFieldSchema', () => {
    it('accepts valid fields', () => {
      expect(AssetFieldSchema.safeParse('fixed_assets').success).toBe(true)
      expect(AssetFieldSchema.safeParse('current_assets').success).toBe(true)
      expect(AssetFieldSchema.safeParse('liabilities').success).toBe(true)
    })

    it('rejects invalid values', () => {
      expect(AssetFieldSchema.safeParse('assets').success).toBe(false)
      expect(AssetFieldSchema.safeParse('').success).toBe(false)
    })
  })

  describe('AssetCategorySchema', () => {
    it('accepts all valid categories', () => {
      const validCategories = [
        'real_estate', 'retirement_funds', 'cash_savings', 'investments',
        'kids', 'credit_card', 'loans', 'other'
      ]
      validCategories.forEach(category => {
        expect(AssetCategorySchema.safeParse(category).success).toBe(true)
      })
    })

    it('rejects invalid values', () => {
      expect(AssetCategorySchema.safeParse('stocks').success).toBe(false)
      expect(AssetCategorySchema.safeParse('').success).toBe(false)
    })
  })

  describe('FamilyMemberRoleSchema', () => {
    it('accepts valid roles', () => {
      expect(FamilyMemberRoleSchema.safeParse('parent').success).toBe(true)
      expect(FamilyMemberRoleSchema.safeParse('child').success).toBe(true)
    })

    it('rejects invalid values', () => {
      expect(FamilyMemberRoleSchema.safeParse('grandparent').success).toBe(false)
      expect(FamilyMemberRoleSchema.safeParse('').success).toBe(false)
    })
  })

  describe('parseAssetField', () => {
    it('returns valid value unchanged', () => {
      expect(parseAssetField('fixed_assets')).toBe('fixed_assets')
      expect(parseAssetField('current_assets')).toBe('current_assets')
      expect(parseAssetField('liabilities')).toBe('liabilities')
    })

    it('returns fallback for invalid string', () => {
      expect(parseAssetField('assets')).toBe('current_assets')
      expect(parseAssetField('')).toBe('current_assets')
    })

    it('returns fallback for non-string types', () => {
      expect(parseAssetField(null)).toBe('current_assets')
      expect(parseAssetField(undefined)).toBe('current_assets')
      expect(parseAssetField(123)).toBe('current_assets')
    })
  })

  describe('parseAssetCategory', () => {
    it('returns valid value unchanged', () => {
      expect(parseAssetCategory('real_estate')).toBe('real_estate')
      expect(parseAssetCategory('cash_savings')).toBe('cash_savings')
      expect(parseAssetCategory('investments')).toBe('investments')
      expect(parseAssetCategory('credit_card')).toBe('credit_card')
    })

    it('returns fallback for invalid string', () => {
      expect(parseAssetCategory('stocks')).toBe('other')
      expect(parseAssetCategory('bonds')).toBe('other')
      expect(parseAssetCategory('')).toBe('other')
    })

    it('returns fallback for non-string types', () => {
      expect(parseAssetCategory(null)).toBe('other')
      expect(parseAssetCategory(undefined)).toBe('other')
      expect(parseAssetCategory({})).toBe('other')
    })
  })

  describe('parseFamilyMemberRole', () => {
    it('returns valid value unchanged', () => {
      expect(parseFamilyMemberRole('parent')).toBe('parent')
      expect(parseFamilyMemberRole('child')).toBe('child')
    })

    it('returns fallback for invalid string', () => {
      expect(parseFamilyMemberRole('grandparent')).toBe('parent')
      expect(parseFamilyMemberRole('sibling')).toBe('parent')
      expect(parseFamilyMemberRole('')).toBe('parent')
    })

    it('returns fallback for non-string types', () => {
      expect(parseFamilyMemberRole(null)).toBe('parent')
      expect(parseFamilyMemberRole(undefined)).toBe('parent')
      expect(parseFamilyMemberRole(42)).toBe('parent')
    })
  })
})
