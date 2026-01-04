import { buildCategoryIndex, type CategoryIndex } from '@/config/categories.index'
import { createTransaction, type Transaction } from '@/domain/transaction/transaction'
import { create } from 'zustand'

type AppState = {
  categoryIndex: CategoryIndex
  transactions: Transaction[]
  addTransaction: (input: Transaction) => void
}

export const useAppStore = create<AppState>((set, get) => {
  const categoryIndex = buildCategoryIndex()

  return {
    categoryIndex,
    transactions: [],
    addTransaction: (input) => {
      const tx = createTransaction(get().categoryIndex, input)
      set(state => ({ transactions: [tx, ...state.transactions] }))
    }
  }
})
