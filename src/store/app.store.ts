import { buildCategoryIndex, type CategoryIndex } from '@/config/categories.index'
import { create } from 'zustand'

type AppState = {
  categoryIndex: CategoryIndex
}

export const useAppStore = create<AppState>((set, get) => {
  const categoryIndex = buildCategoryIndex()
  return { categoryIndex }
})
