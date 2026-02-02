/**
 * Suggestions Store
 *
 * Stores historical transaction data for auto-suggestions.
 * Persists to SQLite for data to survive app restarts.
 * Tracks items, merchants, and tags with frequency for smart ordering.
 */

import { create } from 'zustand'
import { suggestionsRepository } from '@/infrastructure/repositories'

type SuggestionsState = {
  isLoaded: boolean

  /** Record a used item (call after saving transaction) */
  recordItem: (value: string) => void

  /** Record a used merchant (call after saving transaction) */
  recordMerchant: (value: string) => void

  /** Get item suggestions matching query */
  getItemSuggestions: (query: string, limit?: number) => string[]

  /** Get merchant suggestions matching query */
  getMerchantSuggestions: (query: string, limit?: number) => string[]

  /** Initialize store (called on app start) */
  init: () => void
}

export const useSuggestionsStore = create<SuggestionsState>((set, get) => ({
  isLoaded: false,

  init: () => {
    // Mark as loaded - actual data is read directly from SQLite
    set({ isLoaded: true })
  },

  recordItem: (value) => {
    const normalized = value.trim()
    if (!normalized) return
    try {
      suggestionsRepository.recordItem(normalized)
    } catch (error) {
      console.error('Failed to record item suggestion:', error)
    }
  },

  recordMerchant: (value) => {
    const normalized = value.trim()
    if (!normalized) return
    try {
      suggestionsRepository.recordMerchant(normalized)
    } catch (error) {
      console.error('Failed to record merchant suggestion:', error)
    }
  },

  getItemSuggestions: (query, limit = 5) => {
    try {
      return suggestionsRepository.searchItems(query, limit)
    } catch (error) {
      console.error('Failed to get item suggestions:', error)
      return []
    }
  },

  getMerchantSuggestions: (query, limit = 5) => {
    try {
      return suggestionsRepository.searchMerchants(query, limit)
    } catch (error) {
      console.error('Failed to get merchant suggestions:', error)
      return []
    }
  },
}))
