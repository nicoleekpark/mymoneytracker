/**
 * Drafts Store
 *
 * @persistence SQLITE - Persisted to drafts table via draftRepository.
 * @scope SESSION - Hydrated on app start, synced to DB on changes.
 *
 * Manages pending transaction drafts that haven't been finalized.
 */

import type { CategoryRef } from '@/core/domain/category'
import type { TransactionType } from '@/core/domain/transaction'
import { draftRepository } from '@/infrastructure/repositories'
import type { DraftTransaction as DraftTransactionDB } from '@/infrastructure/mappers/draft.mapper'
import { logError } from '@/shared/utils/logger'
import { uuid } from '@/shared/utils/uuid'
import { create } from 'zustand'

export type DraftTransaction = {
  id: string
  type: TransactionType
  item: string
  amountCents: number
  merchant?: string
  note?: string
  tags?: string[]
  categoryRef?: CategoryRef
  accountKey?: string
  occurredAt: string // ISO string
  receiptUri?: string
  createdAt: string // ISO string
  starred?: boolean
}

// Convert store type to repository type
function toDbDraft(draft: DraftTransaction): DraftTransactionDB {
  return {
    ...draft,
    starred: draft.starred ?? false,
  }
}

// Convert repository type to store type
function fromDbDraft(draft: DraftTransactionDB): DraftTransaction {
  return {
    ...draft,
    starred: draft.starred,
  }
}

type DraftsState = {
  drafts: DraftTransaction[]
  isLoaded: boolean
  loadDrafts: () => void
  addDraft: (draft: Omit<DraftTransaction, 'id' | 'createdAt'>) => void
  updateDraft: (id: string, updates: Partial<Omit<DraftTransaction, 'id' | 'createdAt'>>) => void
  removeDraft: (id: string) => void
  getDraft: (id: string) => DraftTransaction | undefined
  toggleStar: (id: string) => void
  clearAllDrafts: () => void
}

export const useDraftsStore = create<DraftsState>((set, get) => ({
  drafts: [],
  isLoaded: false,

  loadDrafts: () => {
    try {
      const dbDrafts = draftRepository.list()
      set({ drafts: dbDrafts.map(fromDbDraft), isLoaded: true })
    } catch (error) {
      logError('Drafts', error)
      set({ isLoaded: true })
    }
  },

  addDraft: (draft) => {
    const newDraft: DraftTransaction = {
      ...draft,
      id: uuid(),
      createdAt: new Date().toISOString(),
      starred: draft.starred ?? false,
    }

    try {
      draftRepository.insert(toDbDraft(newDraft))
      set((state) => ({ drafts: [newDraft, ...state.drafts] }))
    } catch (error) {
      logError('Drafts', error)
      // Still update local state for UX
      set((state) => ({ drafts: [newDraft, ...state.drafts] }))
    }
  },

  updateDraft: (id, updates) => {
    const current = get().drafts.find((d) => d.id === id)
    if (!current) return

    const updated: DraftTransaction = { ...current, ...updates }

    try {
      draftRepository.update(toDbDraft(updated))
      set((state) => ({
        drafts: state.drafts.map((d) => (d.id === id ? updated : d)),
      }))
    } catch (error) {
      logError('Drafts', error)
      set((state) => ({
        drafts: state.drafts.map((d) => (d.id === id ? updated : d)),
      }))
    }
  },

  removeDraft: (id) => {
    try {
      draftRepository.delete(id)
      set((state) => ({
        drafts: state.drafts.filter((d) => d.id !== id),
      }))
    } catch (error) {
      logError('Drafts', error)
      set((state) => ({
        drafts: state.drafts.filter((d) => d.id !== id),
      }))
    }
  },

  getDraft: (id) => {
    return get().drafts.find((d) => d.id === id)
  },

  toggleStar: (id) => {
    try {
      const newStarred = draftRepository.toggleStar(id)
      set((state) => ({
        drafts: state.drafts.map((d) =>
          d.id === id ? { ...d, starred: newStarred } : d
        ),
      }))
    } catch (error) {
      logError('Drafts', error)
      set((state) => ({
        drafts: state.drafts.map((d) =>
          d.id === id ? { ...d, starred: !d.starred } : d
        ),
      }))
    }
  },

  clearAllDrafts: () => {
    try {
      draftRepository.clearAll()
      set({ drafts: [] })
    } catch (error) {
      logError('Drafts', error)
      set({ drafts: [] })
    }
  },
}))
