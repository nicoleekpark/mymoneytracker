import { useCallback, useMemo, useRef, useState } from 'react'
import type { TextInput } from 'react-native'
import { Keyboard } from 'react-native'

import { CATEGORIES } from '@/config/categories.config'
import type { CategoryRef } from '@/domain/category'
import type { TransactionType } from '@/domain/transaction'
import { normalizeForSearch, scoreText } from '@/shared/utils/search'

function buildCategoryLabel(cat: { name: string }): string {
  return cat.name
}

function buildSubLabel(sc: { name: string }): string {
  return sc.name
}

export type CategorySearchRow =
  | { kind: 'category'; cat: (typeof CATEGORIES)[number]; score: number; tie: number }
  | {
      kind: 'subcategory'
      cat: (typeof CATEGORIES)[number]
      sub: (typeof CATEGORIES)[number]['subCategories'][number]
      score: number
      tie: number
    }

export type CategoryPickerState = Readonly<{
  categoryRef: CategoryRef | null
  setCategoryRef: (ref: CategoryRef | null) => void
  showCategoryModal: boolean
  categoryQuery: string
  setCategoryQuery: (q: string) => void
  showSubCategoryModal: boolean
  categorySearchRef: React.RefObject<TextInput | null>
  categoriesForType: (typeof CATEGORIES)[number][]
  selectedCategory: (typeof CATEGORIES)[number] | null
  subCategoriesForSelected: (typeof CATEGORIES)[number]['subCategories']
  searchRows: CategorySearchRow[]
  categoryDisplay: string
  subCategoryDisplay: string
  openCategory: () => void
  closeCategory: () => void
  openSubCategory: () => void
  closeSubCategory: () => void
  chooseCategory: (cat: (typeof CATEGORIES)[number]) => void
  chooseSubFromSearch: (
    cat: (typeof CATEGORIES)[number],
    sub: (typeof CATEGORIES)[number]['subCategories'][number]
  ) => void
  chooseSubCategory: (subCategoryKey?: string) => void
  reopenCategoryFromSub: () => void
  resetCategory: () => void
}>

export function useCategoryPicker(type: TransactionType): CategoryPickerState {
  const categorySearchRef = useRef<TextInput | null>(null)

  const [categoryRef, setCategoryRef] = useState<CategoryRef | null>(null)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [categoryQuery, setCategoryQuery] = useState('')
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false)

  const categoriesForType = useMemo(() => {
    return CATEGORIES.filter((c) => c.type === type)
  }, [type])

  const selectedCategory = useMemo(() => {
    if (!categoryRef) return null
    return categoriesForType.find((c) => c.key === categoryRef.categoryKey) ?? null
  }, [categoriesForType, categoryRef])

  const subCategoriesForSelected = useMemo(() => {
    return selectedCategory?.subCategories ?? []
  }, [selectedCategory])

  const searchRows = useMemo<CategorySearchRow[]>(() => {
    const q = normalizeForSearch(categoryQuery)

    if (!q) {
      return categoriesForType.map((cat, idx) => ({
        kind: 'category',
        cat,
        score: 1,
        tie: idx,
      }))
    }

    const rows: CategorySearchRow[] = []
    let tie = 0

    for (const cat of categoriesForType) {
      const catName = normalizeForSearch(cat.name)
      const catKey = normalizeForSearch(cat.key)

      const catScore = Math.max(scoreText(q, catName, 900), scoreText(q, catKey, 850))
      if (catScore > 0) rows.push({ kind: 'category', cat, score: catScore, tie: tie++ })

      for (const sub of cat.subCategories ?? []) {
        const subName = normalizeForSearch(sub.name)
        const subKey = normalizeForSearch(sub.key)

        const subScore = Math.max(scoreText(q, subName, 700), scoreText(q, subKey, 650))
        if (subScore > 0) rows.push({ kind: 'subcategory', cat, sub, score: subScore, tie: tie++ })
      }
    }

    rows.sort((a, b) => (b.score !== a.score ? b.score - a.score : a.tie - b.tie))
    return rows
  }, [categoriesForType, categoryQuery])

  const categoryDisplay = useMemo(() => {
    if (!categoryRef) return 'Select'

    const cat = CATEGORIES.find((c) => c.type === categoryRef.type && c.key === categoryRef.categoryKey)
    if (!cat) return 'Select'

    if (!categoryRef.subCategoryKey) return buildCategoryLabel(cat)

    const sc = cat.subCategories.find((s) => s.key === categoryRef.subCategoryKey)
    if (!sc) return buildCategoryLabel(cat)

    return `${buildCategoryLabel(cat)}  ›  ${buildSubLabel(sc)}`
  }, [categoryRef])

  const subCategoryDisplay = useMemo(() => {
    if (!selectedCategory) return 'Select'
    if (!selectedCategory.subCategories?.length) return 'None'
    if (!categoryRef?.subCategoryKey) return 'Select'

    const sc = selectedCategory.subCategories.find((s) => s.key === categoryRef.subCategoryKey)
    return sc ? buildSubLabel(sc) : 'Select'
  }, [selectedCategory, categoryRef])

  const openCategory = useCallback(() => {
    Keyboard.dismiss()
    setShowSubCategoryModal(false)
    setCategoryQuery('')
    setShowCategoryModal(true)
  }, [])

  const closeCategory = useCallback(() => {
    setShowCategoryModal(false)
    setCategoryQuery('')
  }, [])

  const openSubCategory = useCallback(() => {
    Keyboard.dismiss()
    if (!selectedCategory) return
    setShowSubCategoryModal(true)
  }, [selectedCategory])

  const closeSubCategory = useCallback(() => {
    setShowSubCategoryModal(false)
  }, [])

  const chooseCategory = useCallback(
    (cat: (typeof CATEGORIES)[number]) => {
      setCategoryRef({ type, categoryKey: cat.key })
      setShowCategoryModal(false)
      setCategoryQuery('')
      // Subcategories are now handled inline in the modal, no need to open separate modal
    },
    [type]
  )

  const chooseSubFromSearch = useCallback(
    (cat: (typeof CATEGORIES)[number], sub: (typeof CATEGORIES)[number]['subCategories'][number]) => {
      setCategoryRef({ type, categoryKey: cat.key, subCategoryKey: sub.key })
      setShowSubCategoryModal(false)
      setShowCategoryModal(false)
      setCategoryQuery('')
    },
    [type]
  )

  const chooseSubCategory = useCallback(
    (subCategoryKey?: string) => {
      if (!categoryRef) return
      const next: CategoryRef = subCategoryKey
        ? { type, categoryKey: categoryRef.categoryKey, subCategoryKey }
        : { type, categoryKey: categoryRef.categoryKey }

      setCategoryRef(next)
      setShowSubCategoryModal(false)
    },
    [type, categoryRef]
  )

  const reopenCategoryFromSub = useCallback(() => {
    setShowSubCategoryModal(false)
    setCategoryQuery('')
    setTimeout(() => {
      setShowCategoryModal(true)
    }, 200)
  }, [])

  const resetCategory = useCallback(() => {
    setCategoryRef(null)
  }, [])

  return {
    categoryRef,
    setCategoryRef,
    showCategoryModal,
    categoryQuery,
    setCategoryQuery,
    showSubCategoryModal,
    categorySearchRef,
    categoriesForType,
    selectedCategory,
    subCategoriesForSelected,
    searchRows,
    categoryDisplay,
    subCategoryDisplay,
    openCategory,
    closeCategory,
    openSubCategory,
    closeSubCategory,
    chooseCategory,
    chooseSubFromSearch,
    chooseSubCategory,
    reopenCategoryFromSub,
    resetCategory,
  }
}

export { buildCategoryLabel, buildSubLabel }
