import { buildCategoryIndex, type CategoryIndex } from '@/config/categories.index'
import { create } from 'zustand'

type AppState = {
  categoryIndex: CategoryIndex

  isAddTransactionOpen: boolean
  openAddTransactionModal: () => void
  closeAddTransactionModal: () => void
}

export const useAppStore = create<AppState>((set) => {
  const categoryIndex = buildCategoryIndex()

  return {
    categoryIndex,

    isAddTransactionOpen: false,
    openAddTransactionModal: () => set({ isAddTransactionOpen: true }),
    closeAddTransactionModal: () => set({ isAddTransactionOpen: false })
  }
})
