import { CATEGORIES } from '@/shared/config/categories.config'

describe('categories.config', () => {
  describe('no duplicate subcategory keys', () => {
    it('should not have any subcategory key appearing under multiple parent categories', () => {
      // Build a map: subkey -> [parent1, parent2, ...]
      const subKeyToParents = new Map<string, string[]>()

      for (const category of CATEGORIES) {
        for (const sub of category.subCategories) {
          const existing = subKeyToParents.get(sub.key) ?? []
          existing.push(category.key)
          subKeyToParents.set(sub.key, existing)
        }
      }

      // Find any duplicates
      const duplicates: { subKey: string; parents: string[] }[] = []
      for (const [subKey, parents] of subKeyToParents) {
        if (parents.length > 1) {
          duplicates.push({ subKey, parents })
        }
      }

      // Fail with descriptive message if duplicates found
      if (duplicates.length > 0) {
        const messages = duplicates.map(
          (d) => `  - "${d.subKey}" exists under: ${d.parents.join(', ')}`
        )
        fail(
          `Found duplicate subcategory keys across parents:\n${messages.join('\n')}\n\n` +
            `Each subcategory key must be unique across all parent categories. ` +
            `This prevents ambiguity when storing "${'{parent}.{subkey}'}" compound keys in the database.`
        )
      }

      // Also verify we actually have categories (sanity check)
      expect(CATEGORIES.length).toBeGreaterThan(0)
    })

    it('should have unique subcategory keys within each parent', () => {
      for (const category of CATEGORIES) {
        const subKeys = category.subCategories.map((s) => s.key)
        const uniqueKeys = new Set(subKeys)

        if (subKeys.length !== uniqueKeys.size) {
          const duplicates = subKeys.filter((k, i) => subKeys.indexOf(k) !== i)
          fail(
            `Category "${category.key}" has duplicate subcategory keys: ${duplicates.join(', ')}`
          )
        }
      }
    })
  })

  describe('category structure', () => {
    it('should have required fields on all categories', () => {
      for (const category of CATEGORIES) {
        expect(category.key).toBeTruthy()
        expect(category.name).toBeTruthy()
        expect(category.icon).toBeTruthy()
        expect(category.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
        expect(['expense', 'income', 'transfer']).toContain(category.type)
        expect(typeof category.isFixed).toBe('boolean')
        expect(Array.isArray(category.subCategories)).toBe(true)
      }
    })

    it('should have required fields on all subcategories', () => {
      for (const category of CATEGORIES) {
        for (const sub of category.subCategories) {
          expect(sub.key).toBeTruthy()
          expect(sub.name).toBeTruthy()
          expect(sub.icon).toBeTruthy()
          expect(sub.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
        }
      }
    })
  })
})
