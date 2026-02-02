/**
 * Tags Store
 *
 * Manages user-created tags and provides access to premade tags.
 */

import type { Tag, TagCategory } from '@/domain/tag'
import { SYSTEM_TAGS, OCCURRENCE_TAGS } from '@/domain/tag'
import { uuid } from '@/shared/utils/uuid'
import { create } from 'zustand'

type TagsState = {
  /** User-created custom tags */
  customTags: Tag[]

  /** Create a new custom tag */
  createTag: (name: string, category?: TagCategory) => Tag

  /** Delete a custom tag */
  deleteTag: (id: string) => void

  /** Get all available tags (premade + custom) */
  getAllTags: () => Tag[]

  /** Get tags by category */
  getTagsByCategory: (category: TagCategory) => Tag[]

  /** Check if a tag name already exists */
  tagExists: (name: string) => boolean
}

/**
 * Convert premade tag names to Tag objects
 */
function createPremadeTags(names: readonly string[], category: TagCategory): Tag[] {
  return names.map((name) => ({
    id: `premade-${category}-${name}`,
    name,
    category,
    createdAt: '2024-01-01T00:00:00.000Z', // Static date for premade
  }))
}

const QUICK_TAGS = createPremadeTags(SYSTEM_TAGS, 'quick')
const OCCURRENCE_TAG_OBJECTS = createPremadeTags(OCCURRENCE_TAGS, 'occurrence')

export const useTagsStore = create<TagsState>((set, get) => ({
  customTags: [],

  createTag: (name, category = 'custom') => {
    const trimmedName = name.trim().toLowerCase()

    // Check if already exists
    if (get().tagExists(trimmedName)) {
      const existing = get().getAllTags().find(
        (t) => t.name.toLowerCase() === trimmedName
      )
      return existing!
    }

    const newTag: Tag = {
      id: uuid(),
      name: trimmedName,
      category,
      createdAt: new Date().toISOString(),
    }

    set((state) => ({
      customTags: [...state.customTags, newTag],
    }))

    return newTag
  },

  deleteTag: (id) => {
    set((state) => ({
      customTags: state.customTags.filter((t) => t.id !== id),
    }))
  },

  getAllTags: () => {
    const { customTags } = get()
    return [...QUICK_TAGS, ...OCCURRENCE_TAG_OBJECTS, ...customTags]
  },

  getTagsByCategory: (category) => {
    if (category === 'quick') return QUICK_TAGS
    if (category === 'occurrence') return OCCURRENCE_TAG_OBJECTS
    return get().customTags.filter((t) => t.category === category)
  },

  tagExists: (name) => {
    const normalizedName = name.trim().toLowerCase()
    return get().getAllTags().some(
      (t) => t.name.toLowerCase() === normalizedName
    )
  },
}))
