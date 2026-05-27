import {
  normalizeSubKeyFromDbKey,
  assertValidCategoryRef,
} from '@/core/domain/category/category.model'
import type { CategoryIndex, CategoryRef } from '@/core/domain/category/category.types'

const mockCategoryIndex: CategoryIndex = {
  expense: {
    food: ['eating_out', 'groceries', 'coffee'],
    housing: ['rent', 'utilities', 'insurance'],
    transport: ['gas', 'parking', 'public_transit'],
  },
  income: {
    salary: ['base', 'bonus', 'overtime'],
    investment: ['dividends', 'capital_gains'],
  },
  transfer: {
    internal: ['rebalance'],
    external: ['send', 'receive'],
  },
}

describe('category.model', () => {
  describe('normalizeSubKeyFromDbKey', () => {
    it('extracts subcategory from dotted key', () => {
      expect(normalizeSubKeyFromDbKey('food.eating_out')).toBe('eating_out')
    })

    it('extracts last part from multi-dotted key', () => {
      expect(normalizeSubKeyFromDbKey('a.b.c.last_part')).toBe('last_part')
    })

    it('returns original key when no dot present', () => {
      expect(normalizeSubKeyFromDbKey('standalone')).toBe('standalone')
    })

    it('returns empty string for empty input', () => {
      expect(normalizeSubKeyFromDbKey('')).toBe('')
    })

    it('handles key ending with dot', () => {
      // When key ends with dot, the last part is the key itself (no splitting occurs)
      expect(normalizeSubKeyFromDbKey('food.')).toBe('food.')
    })

    it('handles key starting with dot', () => {
      expect(normalizeSubKeyFromDbKey('.subcategory')).toBe('subcategory')
    })

    it('handles double dots', () => {
      expect(normalizeSubKeyFromDbKey('food..eating_out')).toBe('eating_out')
    })

    it('handles single dot', () => {
      // Single dot doesn't get split - returned as is
      expect(normalizeSubKeyFromDbKey('.')).toBe('.')
    })
  })

  describe('assertValidCategoryRef', () => {
    describe('valid category references', () => {
      it('accepts valid expense category with subcategory', () => {
        const ref: CategoryRef = {
          type: 'expense',
          categoryKey: 'food',
          subCategoryKey: 'eating_out',
        }

        expect(() => assertValidCategoryRef(mockCategoryIndex, ref)).not.toThrow()
      })

      it('accepts valid income category with subcategory', () => {
        const ref: CategoryRef = {
          type: 'income',
          categoryKey: 'salary',
          subCategoryKey: 'bonus',
        }

        expect(() => assertValidCategoryRef(mockCategoryIndex, ref)).not.toThrow()
      })

      it('accepts valid transfer category with subcategory', () => {
        const ref: CategoryRef = {
          type: 'transfer',
          categoryKey: 'internal',
          subCategoryKey: 'rebalance',
        }

        expect(() => assertValidCategoryRef(mockCategoryIndex, ref)).not.toThrow()
      })

      it('accepts category without subcategory', () => {
        const ref: CategoryRef = {
          type: 'expense',
          categoryKey: 'food',
        }

        expect(() => assertValidCategoryRef(mockCategoryIndex, ref)).not.toThrow()
      })

      it('accepts category with undefined subcategory', () => {
        const ref: CategoryRef = {
          type: 'expense',
          categoryKey: 'housing',
          subCategoryKey: undefined,
        }

        expect(() => assertValidCategoryRef(mockCategoryIndex, ref)).not.toThrow()
      })
    })

    describe('invalid category references', () => {
      it('throws for null ref', () => {
        // The function throws when trying to access properties of null
        expect(() =>
          assertValidCategoryRef(mockCategoryIndex, null as unknown as CategoryRef)
        ).toThrow()
      })

      it('throws for undefined ref', () => {
        // The function throws when trying to access properties of undefined
        expect(() =>
          assertValidCategoryRef(mockCategoryIndex, undefined as unknown as CategoryRef)
        ).toThrow()
      })

      it('throws for non-object ref', () => {
        expect(() =>
          assertValidCategoryRef(mockCategoryIndex, 'string' as unknown as CategoryRef)
        ).toThrow(/Invalid CategoryRef/)
      })

      it('throws for invalid type', () => {
        const ref = {
          type: 'invalid',
          categoryKey: 'food',
        } as unknown as CategoryRef

        expect(() => assertValidCategoryRef(mockCategoryIndex, ref)).toThrow(
          /Invalid CategoryRef.*invalid\/food/
        )
      })

      it('throws for non-string type', () => {
        const ref = {
          type: 123,
          categoryKey: 'food',
        } as unknown as CategoryRef

        expect(() => assertValidCategoryRef(mockCategoryIndex, ref)).toThrow(/Invalid CategoryRef/)
      })

      it('throws for non-existent category key', () => {
        const ref: CategoryRef = {
          type: 'expense',
          categoryKey: 'nonexistent',
        }

        expect(() => assertValidCategoryRef(mockCategoryIndex, ref)).toThrow(
          /Invalid CategoryRef.*expense\/nonexistent/
        )
      })

      it('throws for non-string category key', () => {
        const ref = {
          type: 'expense',
          categoryKey: 123,
        } as unknown as CategoryRef

        expect(() => assertValidCategoryRef(mockCategoryIndex, ref)).toThrow(/Invalid CategoryRef/)
      })

      it('throws for missing categoryKey', () => {
        const ref = {
          type: 'expense',
        } as unknown as CategoryRef

        expect(() => assertValidCategoryRef(mockCategoryIndex, ref)).toThrow(/Invalid CategoryRef/)
      })

      it('throws for non-existent subcategory key', () => {
        const ref: CategoryRef = {
          type: 'expense',
          categoryKey: 'food',
          subCategoryKey: 'nonexistent',
        }

        expect(() => assertValidCategoryRef(mockCategoryIndex, ref)).toThrow(
          /Invalid CategoryRef.*expense\/food\/nonexistent/
        )
      })

      it('throws for subcategory that belongs to different category', () => {
        const ref: CategoryRef = {
          type: 'expense',
          categoryKey: 'food',
          subCategoryKey: 'rent', // belongs to housing, not food
        }

        expect(() => assertValidCategoryRef(mockCategoryIndex, ref)).toThrow(
          /Invalid CategoryRef/
        )
      })
    })

    describe('edge cases', () => {
      it('handles empty string type', () => {
        const ref = {
          type: '',
          categoryKey: 'food',
        } as unknown as CategoryRef

        expect(() => assertValidCategoryRef(mockCategoryIndex, ref)).toThrow(/Invalid CategoryRef/)
      })

      it('handles empty string categoryKey', () => {
        const ref: CategoryRef = {
          type: 'expense',
          categoryKey: '',
        }

        expect(() => assertValidCategoryRef(mockCategoryIndex, ref)).toThrow(/Invalid CategoryRef/)
      })

      it('handles empty string subcategoryKey', () => {
        const ref: CategoryRef = {
          type: 'expense',
          categoryKey: 'food',
          subCategoryKey: '',
        }

        // Empty string is falsy, so it should be treated as "no subcategory"
        expect(() => assertValidCategoryRef(mockCategoryIndex, ref)).not.toThrow()
      })

      it('handles empty category index', () => {
        const emptyIndex: CategoryIndex = {
          expense: {},
          income: {},
          transfer: {},
        }
        const ref: CategoryRef = {
          type: 'expense',
          categoryKey: 'food',
        }

        expect(() => assertValidCategoryRef(emptyIndex, ref)).toThrow(/Invalid CategoryRef/)
      })

      it('handles category with no subcategories', () => {
        const indexWithEmpty: CategoryIndex = {
          expense: {
            miscellaneous: [], // category with no subcategories
          },
          income: {},
          transfer: {},
        }
        const ref: CategoryRef = {
          type: 'expense',
          categoryKey: 'miscellaneous',
        }

        expect(() => assertValidCategoryRef(indexWithEmpty, ref)).not.toThrow()
      })
    })
  })
})
