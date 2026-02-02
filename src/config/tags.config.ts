/**
 * Tags Configuration
 *
 * Source of truth for premade and occurrence tags.
 * Synced to database via system.tags.seed.ts
 *
 * Tag categories:
 * - premade: Common expense classifications
 * - occurrence: Frequency-based tags for recurring tracking
 * - custom: User-created (not defined here)
 */

export type TagCategory = 'premade' | 'occurrence' | 'custom'

export type TagConfig = {
  key: string
  name: string
  category: TagCategory
  color?: string
}

/**
 * Premade tags for common expense classifications
 */
export const PREMADE_TAGS: TagConfig[] = [
  { key: 'tag:subscription', name: 'subscription', category: 'premade', color: '#6366F1' },
  { key: 'tag:emergency', name: 'emergency', category: 'premade', color: '#EF4444' },
  { key: 'tag:unplanned', name: 'unplanned', category: 'premade', color: '#F59E0B' },
  { key: 'tag:work', name: 'work', category: 'premade', color: '#3B82F6' },
]

/**
 * Occurrence tags for tracking recurring expenses
 */
export const OCCURRENCE_TAGS: TagConfig[] = [
  { key: 'tag:weekly', name: 'weekly', category: 'occurrence', color: '#10B981' },
  { key: 'tag:monthly', name: 'monthly', category: 'occurrence', color: '#14B8A6' },
  { key: 'tag:yearly', name: 'yearly', category: 'occurrence', color: '#06B6D4' },
  { key: 'tag:one-time', name: 'one-time', category: 'occurrence', color: '#8B5CF6' },
]

/**
 * All system tags (premade + occurrence)
 */
export const SYSTEM_TAGS: TagConfig[] = [...PREMADE_TAGS, ...OCCURRENCE_TAGS]

/**
 * Get tag config by key
 */
export function getTagConfig(key: string): TagConfig | undefined {
  return SYSTEM_TAGS.find((t) => t.key === key)
}

/**
 * Get all tags by category
 */
export function getTagsByCategory(category: TagCategory): TagConfig[] {
  return SYSTEM_TAGS.filter((t) => t.category === category)
}
