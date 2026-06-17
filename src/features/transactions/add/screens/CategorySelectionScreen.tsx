/**
 * CategorySelectionScreen
 *
 * Full-screen category selection that slides in from right.
 * Uses modal design system for consistent styling.
 */

import { CategoryIcon } from '@/shared/components'
import { CATEGORIES } from '@/shared/config/categories.config'
import { Screen } from '@/shared/layout/Screen'
import { useHoHTheme } from '@/shared/providers'
import { getScrollContentPadding, modalStyles } from '@/shared/theme/tokens/modal'
import { spacing } from '@/shared/theme/tokens/spacing'
import { router } from 'expo-router'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, TextInput as RNTextInput, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { normalizeForSearch, scoreText } from '@/shared/utils/search'
import { useAddTransactionNavStore } from '../store/addTransactionNav.store'

type CategoryItem = (typeof CATEGORIES)[number]
type SubCategoryItem = CategoryItem['subCategories'][number]

// Default frequent categories (will be replaced with actual usage data)
const DEFAULT_FREQUENT_KEYS = ['food', 'transport', 'lifestyle', 'housing']
// Recent will be empty initially, populated from usage
const DEFAULT_RECENT_KEYS: string[] = ['food', 'transport', 'subscriptions']

// Category grouping
const CATEGORY_GROUPS: { key: string; title: string; categoryKeys: string[] }[] = [
  { key: 'everyday', title: 'Everyday', categoryKeys: ['food', 'transport', 'lifestyle'] },
  {
    key: 'monthly',
    title: 'Monthly Fixed',
    categoryKeys: ['housing', 'communication', 'subscriptions', 'insurance'],
  },
  { key: 'care', title: 'Care', categoryKeys: ['health', 'family', 'pets'] },
  {
    key: 'occasional',
    title: 'Occasional',
    categoryKeys: ['social', 'travel', 'gifts', 'donations'],
  },
  { key: 'financial', title: 'Financial', categoryKeys: ['taxes', 'debt', 'fees'] },
  { key: 'professional', title: 'Professional', categoryKeys: ['education', 'business'] },
]

export function CategorySelectionScreen() {
  const { semantic } = useHoHTheme()
  const insets = useSafeAreaInsets()
  const searchInputRef = useRef<RNTextInput>(null)

  // Get state from navigation store
  const { categoryType, categoryCallback, initialCategoryRef, closeCategorySelection } =
    useAddTransactionNavStore()

  // Local state
  const [categoryQuery, setCategoryQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null)

  // Initialize with initial category if provided
  useEffect(() => {
    if (initialCategoryRef) {
      const cat = CATEGORIES.find((c) => c.key === initialCategoryRef.categoryKey)
      if (cat && cat.subCategories?.length > 0 && !initialCategoryRef.subCategoryKey) {
        setSelectedCategory(cat)
      }
    }
  }, [initialCategoryRef])

  // Filter categories by type
  const categoriesForType = useMemo(() => {
    return CATEGORIES.filter((c) => c.type === categoryType)
  }, [categoryType])

  // Recent categories (chips)
  const recentCategories = useMemo(() => {
    return DEFAULT_RECENT_KEYS.map((key) => categoriesForType.find((c) => c.key === key)).filter(
      (c): c is CategoryItem => !!c
    )
  }, [categoriesForType])

  // Frequent categories (chips)
  const frequentCategories = useMemo(() => {
    return DEFAULT_FREQUENT_KEYS.map((key) => categoriesForType.find((c) => c.key === key)).filter(
      (c): c is CategoryItem => !!c
    )
  }, [categoriesForType])

  // Search results
  const searchRows = useMemo(() => {
    const q = normalizeForSearch(categoryQuery)
    if (!q) {
      return categoriesForType.map((cat, i) => ({
        kind: 'category' as const,
        cat,
        score: 0,
        tie: i,
      }))
    }

    const results: Array<
      | { kind: 'category'; cat: CategoryItem; score: number; tie: number }
      | { kind: 'subcategory'; cat: CategoryItem; sub: SubCategoryItem; score: number; tie: number }
    > = []

    categoriesForType.forEach((cat, catIndex) => {
      const catScore = scoreText(q, normalizeForSearch(cat.name), 900)
      if (catScore > 0) {
        results.push({ kind: 'category', cat, score: catScore, tie: catIndex })
      }

      cat.subCategories?.forEach((sub, subIndex) => {
        const subScore = scoreText(q, normalizeForSearch(sub.name), 700)
        if (subScore > 0) {
          results.push({
            kind: 'subcategory',
            cat,
            sub,
            score: subScore,
            tie: catIndex * 100 + subIndex,
          })
        }
      })
    })

    return results.sort((a, b) => b.score - a.score || a.tie - b.tie)
  }, [categoriesForType, categoryQuery])

  // Grouped categories for "All Categories" section
  const groupedCategories = useMemo(() => {
    const groups: { key: string; title: string; items: CategoryItem[] }[] = []

    for (const group of CATEGORY_GROUPS) {
      const items = categoriesForType.filter((c) => group.categoryKeys.includes(c.key))
      if (items.length > 0) {
        groups.push({ key: group.key, title: group.title, items })
      }
    }

    return groups
  }, [categoriesForType])

  // Check if searching
  const isSearching = categoryQuery.trim().length > 0

  // Handlers
  const handleCategoryPress = (cat: CategoryItem) => {
    if (cat.subCategories?.length > 0) {
      setSelectedCategory(cat)
      setCategoryQuery('')
    } else {
      categoryCallback?.onChooseCategory(cat)
      closeCategorySelection()
      router.back()
    }
  }

  const handleSubCategoryPress = (cat: CategoryItem, sub: SubCategoryItem) => {
    categoryCallback?.onChooseSubCategory(cat, sub)
    closeCategorySelection()
    router.back()
  }

  const handleBack = () => {
    if (selectedCategory) {
      setSelectedCategory(null)
      setCategoryQuery('')
    } else {
      closeCategorySelection()
      router.back()
    }
  }

  // Get subcategory preview text
  const getSubcategoryPreview = (cat: CategoryItem) => {
    if (!cat.subCategories?.length) return ''
    return cat.subCategories
      .slice(0, 3)
      .map((s) => s.name)
      .join(' • ')
  }

  // Render subcategory screen (drill-down)
  const renderSubcategoryScreen = () => {
    if (!selectedCategory) return null

    const q = categoryQuery.trim().toLowerCase()
    const filteredSubs =
      selectedCategory.subCategories?.filter((sub) => !q || sub.name.toLowerCase().includes(q)) ||
      []

    return (
      <>
        {/* Section Label */}
        <View style={modalStyles.selectionSectionHeader}>
          <Text style={[modalStyles.selectionSectionTitle, { color: semantic.textSecondary }]}>
            SUBCATEGORIES
          </Text>
          <Text style={[modalStyles.selectionSectionHint, { color: semantic.textSecondary }]}>
            {selectedCategory.name}
          </Text>
        </View>

        {/* Subcategory List */}
        <View style={[modalStyles.selectionListContainer, { borderColor: semantic.border }]}>
          {filteredSubs.map((sub, index) => (
            <Pressable
              key={sub.key}
              onPress={() => handleSubCategoryPress(selectedCategory, sub)}
              style={[
                modalStyles.selectionListRow,
                index > 0 && { borderTopWidth: 1, borderTopColor: semantic.border },
              ]}
            >
              <View
                style={[modalStyles.selectionListRowIcon, { backgroundColor: sub.color + '20' }]}
              >
                <CategoryIcon name={sub.icon} size={18} color={sub.color} />
              </View>
              <View style={modalStyles.selectionListRowContent}>
                <Text style={[modalStyles.selectionListRowTitle, { color: semantic.text }]}>
                  {sub.name}
                </Text>
                <Text
                  style={[modalStyles.selectionListRowSubtitle, { color: semantic.textSecondary }]}
                >
                  in {selectedCategory.name}
                </Text>
              </View>
            </Pressable>
          ))}

          {/* Option to select just the parent category */}
          <Pressable
            onPress={() => {
              categoryCallback?.onChooseCategory(selectedCategory)
              closeCategorySelection()
              router.back()
            }}
            style={[
              modalStyles.selectionListRow,
              { borderTopWidth: 1, borderTopColor: semantic.border },
            ]}
          >
            <View
              style={[
                modalStyles.selectionListRowIcon,
                { backgroundColor: selectedCategory.color + '20' },
              ]}
            >
              <CategoryIcon name={selectedCategory.icon} size={18} color={selectedCategory.color} />
            </View>
            <View style={modalStyles.selectionListRowContent}>
              <Text style={[modalStyles.selectionListRowTitle, { color: semantic.textSecondary }]}>
                Just "{selectedCategory.name}"
              </Text>
            </View>
          </Pressable>
        </View>
      </>
    )
  }

  // Render main category screen
  const renderMainScreen = () => {
    // If searching, show search results
    if (isSearching) {
      return (
        <>
          <View style={modalStyles.selectionSectionHeader}>
            <Text style={[modalStyles.selectionSectionTitle, { color: semantic.textSecondary }]}>
              RESULTS
            </Text>
            <Text style={[modalStyles.selectionSectionHint, { color: semantic.textSecondary }]}>
              {searchRows.length}
            </Text>
          </View>

          <View style={[modalStyles.selectionListContainer, { borderColor: semantic.border }]}>
            {searchRows.slice(0, 20).map((row, index) => {
              if (row.kind === 'category') {
                return (
                  <Pressable
                    key={`c:${row.cat.key}`}
                    onPress={() => handleCategoryPress(row.cat)}
                    style={[
                      modalStyles.selectionListRow,
                      index > 0 && { borderTopWidth: 1, borderTopColor: semantic.border },
                    ]}
                  >
                    <View
                      style={[
                        modalStyles.selectionListRowIcon,
                        { backgroundColor: row.cat.color + '20' },
                      ]}
                    >
                      <CategoryIcon name={row.cat.icon} size={18} color={row.cat.color} />
                    </View>
                    <View style={modalStyles.selectionListRowContent}>
                      <Text style={[modalStyles.selectionListRowTitle, { color: semantic.text }]}>
                        {row.cat.name}
                      </Text>
                      <Text
                        style={[
                          modalStyles.selectionListRowSubtitle,
                          { color: semantic.textSecondary },
                        ]}
                      >
                        Category
                      </Text>
                    </View>
                    {row.cat.subCategories?.length > 0 && (
                      <Text
                        style={[
                          modalStyles.selectionListRowChevron,
                          { color: semantic.textSecondary },
                        ]}
                      >
                        ›
                      </Text>
                    )}
                  </Pressable>
                )
              } else {
                return (
                  <Pressable
                    key={`s:${row.cat.key}:${row.sub.key}`}
                    onPress={() => handleSubCategoryPress(row.cat, row.sub)}
                    style={[
                      modalStyles.selectionListRow,
                      index > 0 && { borderTopWidth: 1, borderTopColor: semantic.border },
                    ]}
                  >
                    <View
                      style={[
                        modalStyles.selectionListRowIcon,
                        { backgroundColor: row.sub.color + '20' },
                      ]}
                    >
                      <CategoryIcon name={row.sub.icon} size={18} color={row.sub.color} />
                    </View>
                    <View style={modalStyles.selectionListRowContent}>
                      <Text style={[modalStyles.selectionListRowTitle, { color: semantic.text }]}>
                        {row.sub.name}
                      </Text>
                      <Text
                        style={[
                          modalStyles.selectionListRowSubtitle,
                          { color: semantic.textSecondary },
                        ]}
                      >
                        in {row.cat.name}
                      </Text>
                    </View>
                  </Pressable>
                )
              }
            })}
          </View>
        </>
      )
    }

    // Default view: Recent + Frequent + All Categories
    return (
      <>
        {/* Recent Section */}
        {recentCategories.length > 0 && (
          <>
            <View style={modalStyles.selectionSectionHeader}>
              <Text style={[modalStyles.selectionSectionTitle, { color: semantic.textSecondary }]}>
                RECENT
              </Text>
              <Text style={[modalStyles.selectionSectionHint, { color: semantic.textSecondary }]}>
                auto
              </Text>
            </View>
            <View style={modalStyles.selectionChipRow}>
              {recentCategories.map((cat) => (
                <Pressable
                  key={cat.key}
                  onPress={() => handleCategoryPress(cat)}
                  style={[
                    modalStyles.selectionChip,
                    { backgroundColor: semantic.surfaceAlt, borderColor: semantic.border },
                  ]}
                >
                  <View
                    style={[modalStyles.selectionChipIcon, { backgroundColor: cat.color + '20' }]}
                  >
                    <CategoryIcon name={cat.icon} size={14} color={cat.color} />
                  </View>
                  <Text style={[modalStyles.selectionChipText, { color: semantic.text }]}>
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* Frequent Section */}
        {frequentCategories.length > 0 && (
          <>
            <View style={modalStyles.selectionSectionHeader}>
              <Text style={[modalStyles.selectionSectionTitle, { color: semantic.textSecondary }]}>
                FREQUENT
              </Text>
              <Text style={[modalStyles.selectionSectionHint, { color: semantic.textSecondary }]}>
                auto
              </Text>
            </View>
            <View style={modalStyles.selectionChipRow}>
              {frequentCategories.map((cat) => (
                <Pressable
                  key={cat.key}
                  onPress={() => handleCategoryPress(cat)}
                  style={[
                    modalStyles.selectionChip,
                    { backgroundColor: semantic.surfaceAlt, borderColor: semantic.border },
                  ]}
                >
                  <View
                    style={[modalStyles.selectionChipIcon, { backgroundColor: cat.color + '20' }]}
                  >
                    <CategoryIcon name={cat.icon} size={14} color={cat.color} />
                  </View>
                  <Text style={[modalStyles.selectionChipText, { color: semantic.text }]}>
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* All Categories - Grouped with subcategory preview */}
        <View style={modalStyles.selectionSectionHeader}>
          <Text style={[modalStyles.selectionSectionTitle, { color: semantic.textSecondary }]}>
            ALL CATEGORIES
          </Text>
        </View>

        {groupedCategories.map((group) => (
          <View key={group.key} style={modalStyles.selectionGroup}>
            <Text style={[modalStyles.selectionGroupTitle, { color: semantic.textSecondary }]}>
              {group.title}
            </Text>
            <View style={[modalStyles.selectionListContainer, { borderColor: semantic.border }]}>
              {group.items.map((cat, index) => (
                <Pressable
                  key={cat.key}
                  onPress={() => handleCategoryPress(cat)}
                  style={[
                    modalStyles.selectionListRow,
                    index > 0 && { borderTopWidth: 1, borderTopColor: semantic.border },
                  ]}
                >
                  <View
                    style={[
                      modalStyles.selectionListRowIcon,
                      { backgroundColor: cat.color + '20' },
                    ]}
                  >
                    <CategoryIcon name={cat.icon} size={18} color={cat.color} />
                  </View>
                  <View style={modalStyles.selectionListRowContent}>
                    <Text style={[modalStyles.selectionListRowTitle, { color: semantic.text }]}>
                      {cat.name}
                    </Text>
                    {cat.subCategories?.length > 0 && (
                      <Text
                        style={[
                          modalStyles.selectionListRowSubtitle,
                          { color: semantic.textSecondary },
                        ]}
                        numberOfLines={1}
                      >
                        {getSubcategoryPreview(cat)}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[modalStyles.selectionListRowChevron, { color: semantic.textSecondary }]}
                  >
                    ›
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </>
    )
  }

  return (
    <Screen
      edges={['top']}
      padded={false}
      topPadding={false}
      style={{ flex: 1, backgroundColor: semantic.surface }}
    >
      {/* Drag Handle */}
      <View style={modalStyles.dragHandleContainer}>
        <View style={[modalStyles.dragHandle, { backgroundColor: semantic.border }]} />
      </View>

      {/* Header (Cancel/Back only - matches AddTransactionScreen) */}
      <View style={[modalStyles.header, { borderBottomWidth: 0 }]}>
        <Pressable onPress={handleBack} hitSlop={12} style={modalStyles.cancelButton}>
          <Text style={[modalStyles.cancelText, { color: semantic.textSecondary }]}>
            {selectedCategory ? 'Back' : 'Cancel'}
          </Text>
        </Pressable>
      </View>

      {/* Title Row */}
      <View style={[modalStyles.typeTabs, { borderBottomWidth: 0, paddingVertical: spacing.md }]}>
        <Text style={[modalStyles.typeTabText, { color: semantic.text, fontWeight: '700' }]}>
          {selectedCategory ? selectedCategory.name : 'Category'}
        </Text>
      </View>

      {/* Search Input */}
      <View style={modalStyles.searchContainer}>
        <View
          style={[
            modalStyles.searchBox,
            { backgroundColor: semantic.surfaceAlt, borderColor: semantic.border },
          ]}
        >
          <Text style={modalStyles.searchIcon}>🔍</Text>
          <RNTextInput
            ref={searchInputRef}
            value={categoryQuery}
            onChangeText={setCategoryQuery}
            placeholder={
              selectedCategory ? 'Search subcategories...' : 'Search categories + subcategories...'
            }
            placeholderTextColor={semantic.textSecondary}
            style={[modalStyles.searchInput, { color: semantic.text }]}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: getScrollContentPadding(insets.bottom),
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {selectedCategory ? renderSubcategoryScreen() : renderMainScreen()}
      </ScrollView>
    </Screen>
  )
}
