/**
 * Navigation Store for Add Transaction Flow
 *
 * Manages callbacks and state sharing between screens in the add-transaction stack.
 * This allows child screens (category-selection, account-selection) to communicate
 * selections back to the main AddTransactionScreen.
 */

import { create } from 'zustand'
import type { CategoryRef } from '@/core/domain/category'
import type { TransactionType } from '@/core/domain/transaction'
import type { Account } from '@/core/domain/account'
import { CATEGORIES } from '@/shared/config/categories.config'

type CategoryItem = (typeof CATEGORIES)[number]
type SubCategoryItem = CategoryItem['subCategories'][number]

type CategorySelectionCallback = {
  onChooseCategory: (cat: CategoryItem) => void
  onChooseSubCategory: (cat: CategoryItem, sub: SubCategoryItem) => void
}

type AccountSelectionCallback = {
  onChooseAccount: (key: string) => void
  onAddAccount: () => void
}

type AddTransactionNavState = {
  // Category selection
  categoryType: TransactionType
  categoryCallback: CategorySelectionCallback | null
  initialCategoryRef: CategoryRef | null

  // Account selection
  accounts: Account[]
  currentAccountKey: string | null
  accountCallback: AccountSelectionCallback | null

  // Actions
  openCategorySelection: (
    type: TransactionType,
    initialRef: CategoryRef | null,
    callback: CategorySelectionCallback
  ) => void
  closeCategorySelection: () => void

  openAccountSelection: (
    accounts: Account[],
    currentKey: string | null,
    callback: AccountSelectionCallback
  ) => void
  closeAccountSelection: () => void
}

export const useAddTransactionNavStore = create<AddTransactionNavState>((set) => ({
  // Initial state
  categoryType: 'expense',
  categoryCallback: null,
  initialCategoryRef: null,

  accounts: [],
  currentAccountKey: null,
  accountCallback: null,

  // Actions
  openCategorySelection: (type, initialRef, callback) =>
    set({
      categoryType: type,
      initialCategoryRef: initialRef,
      categoryCallback: callback,
    }),

  closeCategorySelection: () =>
    set({
      categoryCallback: null,
      initialCategoryRef: null,
    }),

  openAccountSelection: (accounts, currentKey, callback) =>
    set({
      accounts,
      currentAccountKey: currentKey,
      accountCallback: callback,
    }),

  closeAccountSelection: () =>
    set({
      accountCallback: null,
      accounts: [],
      currentAccountKey: null,
    }),
}))
