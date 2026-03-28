import {
  parseAccountNature,
  parseAccountKind,
  AccountNatureSchema,
  AccountKindSchema,
} from '@/core/domain/account/account.schema'

describe('account.schema', () => {
  describe('AccountNatureSchema', () => {
    it('accepts valid values', () => {
      expect(AccountNatureSchema.safeParse('asset').success).toBe(true)
      expect(AccountNatureSchema.safeParse('liability').success).toBe(true)
    })

    it('rejects invalid values', () => {
      expect(AccountNatureSchema.safeParse('invalid').success).toBe(false)
      expect(AccountNatureSchema.safeParse('').success).toBe(false)
      expect(AccountNatureSchema.safeParse(null).success).toBe(false)
    })
  })

  describe('AccountKindSchema', () => {
    it('accepts all valid kinds', () => {
      const validKinds = ['cash', 'checking', 'savings', 'credit_card', 'loan', 'investment', 'other']
      validKinds.forEach(kind => {
        expect(AccountKindSchema.safeParse(kind).success).toBe(true)
      })
    })

    it('rejects invalid values', () => {
      expect(AccountKindSchema.safeParse('bank').success).toBe(false)
      expect(AccountKindSchema.safeParse('').success).toBe(false)
    })
  })

  describe('parseAccountNature', () => {
    it('returns valid value unchanged', () => {
      expect(parseAccountNature('asset')).toBe('asset')
      expect(parseAccountNature('liability')).toBe('liability')
    })

    it('returns fallback for invalid string', () => {
      expect(parseAccountNature('invalid')).toBe('asset')
      expect(parseAccountNature('')).toBe('asset')
    })

    it('returns fallback for non-string types', () => {
      expect(parseAccountNature(null)).toBe('asset')
      expect(parseAccountNature(undefined)).toBe('asset')
      expect(parseAccountNature(123)).toBe('asset')
      expect(parseAccountNature({})).toBe('asset')
    })
  })

  describe('parseAccountKind', () => {
    it('returns valid value unchanged', () => {
      expect(parseAccountKind('cash')).toBe('cash')
      expect(parseAccountKind('checking')).toBe('checking')
      expect(parseAccountKind('savings')).toBe('savings')
      expect(parseAccountKind('credit_card')).toBe('credit_card')
      expect(parseAccountKind('loan')).toBe('loan')
      expect(parseAccountKind('investment')).toBe('investment')
      expect(parseAccountKind('other')).toBe('other')
    })

    it('returns fallback for invalid string', () => {
      expect(parseAccountKind('bank')).toBe('other')
      expect(parseAccountKind('wallet')).toBe('other')
      expect(parseAccountKind('')).toBe('other')
    })

    it('returns fallback for non-string types', () => {
      expect(parseAccountKind(null)).toBe('other')
      expect(parseAccountKind(undefined)).toBe('other')
      expect(parseAccountKind(42)).toBe('other')
    })
  })
})
