/**
 * Repository interface for draft transactions.
 * Defines the contract for draft persistence.
 */

import type { DraftTransaction } from './draft.types'

export interface DraftRepository {
  /**
   * List all drafts, newest first.
   */
  list(): DraftTransaction[]

  /**
   * Get a single draft by ID.
   */
  getById(id: string): DraftTransaction | null

  /**
   * Insert a new draft.
   */
  insert(draft: DraftTransaction): void

  /**
   * Update an existing draft.
   */
  update(draft: DraftTransaction): void

  /**
   * Delete a draft by ID.
   */
  delete(id: string): void

  /**
   * Toggle starred status for a draft.
   * Returns the new starred state.
   */
  toggleStar(id: string): boolean

  /**
   * Clear all drafts.
   * Returns the number of deleted drafts.
   */
  clearAll(): number
}
