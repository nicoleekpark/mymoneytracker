// ═══════════════════════════════════════════════════════════════════════════
// DOMAIN CONSTANTS: Category
// Shared constants for category-related operations.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Key used for transactions without a category.
 * Used as fallback when categoryRef is null/undefined.
 *
 * @example
 * ```typescript
 * const categoryKey = transaction.categoryRef?.categoryKey ?? UNCATEGORIZED_KEY
 * ```
 */
export const UNCATEGORIZED_KEY = 'uncategorized' as const

/**
 * Display label for uncategorized transactions.
 */
export const UNCATEGORIZED_LABEL = 'Uncategorized' as const
