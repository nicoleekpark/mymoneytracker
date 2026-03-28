/**
 * Tag Domain Types
 */

export type TagCategory = 'quick' | 'occurrence' | 'amount' | 'custom'

export type Tag = {
  id: string
  name: string
  category: TagCategory
  color?: string
  createdAt: string
}

/**
 * Premade quick-access tags
 */
export const SYSTEM_TAGS: readonly string[] = [
  'subscription',
  'emergency',
  'unplanned',
  'work',
] as const

/**
 * Occurrence-based tags
 */
export const OCCURRENCE_TAGS: readonly string[] = [
  'weekly',
  'monthly',
  'yearly',
  'one-time',
] as const

/**
 * Amount-based tags (can be suggested based on transaction amount)
 */
export const AMOUNT_TAGS: readonly string[] = [
  'small',
  'medium',
  'large',
] as const
