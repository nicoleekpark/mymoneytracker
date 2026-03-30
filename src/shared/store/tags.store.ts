/**
 * Tags Store
 *
 * Manages user-created tags and provides access to premade tags.
 * Persists custom tags to SQLite via app_settings table.
 */

import type { Tag, TagCategory } from '@/core/domain/tag'
import { SYSTEM_TAGS, OCCURRENCE_TAGS } from '@/core/domain/tag'
import { uuid } from '@/shared/utils/uuid'
import { create } from 'zustand'

// Lazy import to avoid circular dependency / test issues
const getStorage = () => require('@/infrastructure/db/settingsStorage') as typeof import('@/infrastructure/db/settingsStorage')

type TagsState = {
  /** User-created custom tags */
  customTags: Tag[]

  /** Hydration state */
  _hydrated: boolean

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

  /** Hydrate from storage */
  _hydrate: () => void
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

function persistTags(customTags: Tag[]): void {
  try {
    const { setStoredValue, STORAGE_KEYS } = getStorage()
    setStoredValue(STORAGE_KEYS.TAGS, customTags)
  } catch {
    // Storage not available (tests, etc.)
  }
}

export const useTagsStore = create<TagsState>((set, get) => ({
  customTags: [],
  _hydrated: false,

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

    set((state) => {
      const newCustomTags = [...state.customTags, newTag]
      persistTags(newCustomTags)
      return { customTags: newCustomTags }
    })

    return newTag
  },

  deleteTag: (id) => {
    set((state) => {
      const newCustomTags = state.customTags.filter((t) => t.id !== id)
      persistTags(newCustomTags)
      return { customTags: newCustomTags }
    })
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

  _hydrate: () => {
    if (get()._hydrated) return
    try {
      const { getStoredValue, STORAGE_KEYS } = getStorage()
      const stored = getStoredValue<Tag[]>(STORAGE_KEYS.TAGS)
      if (stored && Array.isArray(stored)) {
        set({ customTags: stored, _hydrated: true })
      } else {
        set({ _hydrated: true })
      }
    } catch {
      // Storage not available (tests, etc.)
      set({ _hydrated: true })
    }
  },
}))

// Note: Hydration happens lazily - call _hydrate() after DB is initialized
