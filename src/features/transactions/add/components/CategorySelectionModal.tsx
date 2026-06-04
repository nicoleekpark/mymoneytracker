import { CATEGORIES } from '@/shared/config/categories.config'
import { useHoHTheme } from '@/shared/providers'
import { CategoryIcon } from '@/shared/components'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { fontSize, fontWeight, letterSpacing } from '@/shared/theme/tokens/typography'
import React, { useMemo, useState } from 'react'
import type { TextInput } from 'react-native'
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import type { CategorySearchRow } from '../hooks/useCategoryPicker'

type CategoryItem = (typeof CATEGORIES)[number]
type SubCategoryItem = CategoryItem['subCategories'][number]

type Props = Readonly<{
  visible: boolean
  categoryQuery: string
  searchRows: CategorySearchRow[]
  categorySearchRef: React.RefObject<TextInput | null>
  initialCategory?: CategoryItem | null // Pre-select category to show subcategories
  onQueryChange: (q: string) => void
  onClose: () => void
  onChooseCategory: (cat: CategoryItem) => void
  onChooseSubFromSearch: (cat: CategoryItem, sub: SubCategoryItem) => void
}>

// Default frequent categories (will be replaced with actual usage data)
const DEFAULT_FREQUENT_KEYS = ['food', 'transport', 'lifestyle', 'housing']
// Recent will be empty initially, populated from usage
const DEFAULT_RECENT_KEYS: string[] = ['food', 'transport', 'subscriptions']

export function CategorySelectionModal({
  visible,
  categoryQuery,
  searchRows,
  categorySearchRef,
  initialCategory,
  onQueryChange,
  onClose,
  onChooseCategory,
  onChooseSubFromSearch,
}: Props) {
  const theme = useHoHTheme()
  const insets = useSafeAreaInsets()

  // Navigation state for drill-down
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null)

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (visible) {
      // When opening, if initialCategory has subcategories, show them first
      if (initialCategory && initialCategory.subCategories?.length > 0) {
        setSelectedCategory(initialCategory)
      } else {
        setSelectedCategory(null)
      }
      onQueryChange('')
    } else {
      setSelectedCategory(null)
      onQueryChange('')
    }
  }, [visible, initialCategory])

  // Category grouping
  const CATEGORY_GROUPS: { key: string; title: string; categoryKeys: string[] }[] = [
    { key: 'everyday', title: 'Everyday', categoryKeys: ['food', 'transport', 'lifestyle'] },
    { key: 'monthly', title: 'Monthly Fixed', categoryKeys: ['housing', 'communication', 'subscriptions', 'insurance'] },
    { key: 'care', title: 'Care', categoryKeys: ['health', 'family', 'pets'] },
    { key: 'occasional', title: 'Occasional', categoryKeys: ['social', 'travel', 'gifts', 'donations'] },
    { key: 'financial', title: 'Financial', categoryKeys: ['taxes', 'debt', 'fees'] },
    { key: 'professional', title: 'Professional', categoryKeys: ['education', 'business'] },
  ]

  // Get all categories from search rows
  const allCategories = useMemo(() => {
    return searchRows
      .filter((r): r is CategorySearchRow & { kind: 'category' } => r.kind === 'category')
      .map(r => r.cat)
  }, [searchRows])

  // Recent categories (chips)
  const recentCategories = useMemo(() => {
    return DEFAULT_RECENT_KEYS
      .map(key => allCategories.find(c => c.key === key))
      .filter((c): c is CategoryItem => !!c)
  }, [allCategories])

  // Frequent categories (chips)
  const frequentCategories = useMemo(() => {
    return DEFAULT_FREQUENT_KEYS
      .map(key => allCategories.find(c => c.key === key))
      .filter((c): c is CategoryItem => !!c)
  }, [allCategories])

  // Grouped categories for "All Categories" section
  const groupedCategories = useMemo(() => {
    const groups: { key: string; title: string; items: CategoryItem[] }[] = []

    for (const group of CATEGORY_GROUPS) {
      const items = allCategories.filter(c => group.categoryKeys.includes(c.key))
      if (items.length > 0) {
        groups.push({ key: group.key, title: group.title, items })
      }
    }

    return groups
  }, [allCategories])

  // Check if searching
  const isSearching = categoryQuery.trim().length > 0

  // Handlers
  const handleCategoryPress = (cat: CategoryItem) => {
    if (cat.subCategories?.length > 0) {
      setSelectedCategory(cat)
    } else {
      onChooseCategory(cat)
    }
  }

  const handleSubCategoryPress = (cat: CategoryItem, sub: SubCategoryItem) => {
    onChooseSubFromSearch(cat, sub)
  }

  const handleBack = () => {
    setSelectedCategory(null)
    onQueryChange('')
  }

  const handleCancel = () => {
    setSelectedCategory(null)
    onClose()
  }

  // Get subcategory preview text
  const getSubcategoryPreview = (cat: CategoryItem) => {
    if (!cat.subCategories?.length) return ''
    return cat.subCategories.slice(0, 3).map(s => s.name).join(' • ')
  }

  // Render subcategory screen (drill-down)
  const renderSubcategoryScreen = () => {
    if (!selectedCategory) return null

    const q = categoryQuery.trim().toLowerCase()
    const filteredSubs = selectedCategory.subCategories?.filter(
      sub => !q || sub.name.toLowerCase().includes(q)
    ) || []

    return (
      <>
        {/* Section Label */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.semantic.textSecondary }]}>
            SUBCATEGORIES
          </Text>
          <Text style={[styles.sectionHint, { color: theme.semantic.textSecondary }]}>
            {selectedCategory.name}
          </Text>
        </View>

        {/* Subcategory List */}
        <View style={[styles.listContainer, { borderColor: theme.semantic.border }]}>
          {filteredSubs.map((sub, index) => (
            <Pressable
              key={sub.key}
              onPress={() => handleSubCategoryPress(selectedCategory, sub)}
              style={[
                styles.listRow,
                index > 0 && { borderTopWidth: 1, borderTopColor: theme.semantic.border }
              ]}
            >
              <View style={[styles.listRowIcon, { backgroundColor: sub.color + '20' }]}>
                <CategoryIcon name={sub.icon} size={18} color={sub.color} />
              </View>
              <View style={styles.listRowContent}>
                <Text style={[styles.listRowTitle, { color: theme.semantic.text }]}>
                  {sub.name}
                </Text>
                <Text style={[styles.listRowSubtitle, { color: theme.semantic.textSecondary }]}>
                  in {selectedCategory.name}
                </Text>
              </View>
            </Pressable>
          ))}

          {/* Option to select just the parent category */}
          <Pressable
            onPress={() => onChooseCategory(selectedCategory)}
            style={[
              styles.listRow,
              { borderTopWidth: 1, borderTopColor: theme.semantic.border }
            ]}
          >
            <View style={[styles.listRowIcon, { backgroundColor: selectedCategory.color + '20' }]}>
              <CategoryIcon name={selectedCategory.icon} size={18} color={selectedCategory.color} />
            </View>
            <View style={styles.listRowContent}>
              <Text style={[styles.listRowTitle, { color: theme.semantic.textSecondary }]}>
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
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.semantic.textSecondary }]}>
              RESULTS
            </Text>
            <Text style={[styles.sectionHint, { color: theme.semantic.textSecondary }]}>
              {searchRows.length}
            </Text>
          </View>

          <View style={[styles.listContainer, { borderColor: theme.semantic.border }]}>
            {searchRows.slice(0, 20).map((row, index) => {
              if (row.kind === 'category') {
                return (
                  <Pressable
                    key={`c:${row.cat.key}`}
                    onPress={() => handleCategoryPress(row.cat)}
                    style={[
                      styles.listRow,
                      index > 0 && { borderTopWidth: 1, borderTopColor: theme.semantic.border }
                    ]}
                  >
                    <View style={[styles.listRowIcon, { backgroundColor: row.cat.color + '20' }]}>
                      <CategoryIcon name={row.cat.icon} size={18} color={row.cat.color} />
                    </View>
                    <View style={styles.listRowContent}>
                      <Text style={[styles.listRowTitle, { color: theme.semantic.text }]}>
                        {row.cat.name}
                      </Text>
                      <Text style={[styles.listRowSubtitle, { color: theme.semantic.textSecondary }]}>
                        Category
                      </Text>
                    </View>
                    {row.cat.subCategories?.length > 0 && (
                      <Text style={[styles.chevron, { color: theme.semantic.textSecondary }]}>›</Text>
                    )}
                  </Pressable>
                )
              } else {
                return (
                  <Pressable
                    key={`s:${row.cat.key}:${row.sub.key}`}
                    onPress={() => handleSubCategoryPress(row.cat, row.sub)}
                    style={[
                      styles.listRow,
                      index > 0 && { borderTopWidth: 1, borderTopColor: theme.semantic.border }
                    ]}
                  >
                    <View style={[styles.listRowIcon, { backgroundColor: row.sub.color + '20' }]}>
                      <CategoryIcon name={row.sub.icon} size={18} color={row.sub.color} />
                    </View>
                    <View style={styles.listRowContent}>
                      <Text style={[styles.listRowTitle, { color: theme.semantic.text }]}>
                        {row.sub.name}
                      </Text>
                      <Text style={[styles.listRowSubtitle, { color: theme.semantic.textSecondary }]}>
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
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.semantic.textSecondary }]}>
                RECENT
              </Text>
              <Text style={[styles.sectionHint, { color: theme.semantic.textSecondary }]}>
                auto
              </Text>
            </View>
            <View style={styles.chipRow}>
              {recentCategories.map(cat => (
                <Pressable
                  key={cat.key}
                  onPress={() => handleCategoryPress(cat)}
                  style={[styles.chip, { backgroundColor: theme.semantic.surfaceAlt, borderColor: theme.semantic.border }]}
                >
                  <View style={[styles.chipIcon, { backgroundColor: cat.color + '20' }]}>
                    <CategoryIcon name={cat.icon} size={14} color={cat.color} />
                  </View>
                  <Text style={[styles.chipText, { color: theme.semantic.text }]}>
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
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.semantic.textSecondary }]}>
                FREQUENT
              </Text>
              <Text style={[styles.sectionHint, { color: theme.semantic.textSecondary }]}>
                auto
              </Text>
            </View>
            <View style={styles.chipRow}>
              {frequentCategories.map(cat => (
                <Pressable
                  key={cat.key}
                  onPress={() => handleCategoryPress(cat)}
                  style={[styles.chip, { backgroundColor: theme.semantic.surfaceAlt, borderColor: theme.semantic.border }]}
                >
                  <View style={[styles.chipIcon, { backgroundColor: cat.color + '20' }]}>
                    <CategoryIcon name={cat.icon} size={14} color={cat.color} />
                  </View>
                  <Text style={[styles.chipText, { color: theme.semantic.text }]}>
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* All Categories - Grouped with subcategory preview */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.semantic.textSecondary }]}>
            ALL CATEGORIES
          </Text>
        </View>

        {groupedCategories.map(group => (
          <View key={group.key} style={styles.groupSection}>
            <Text style={[styles.groupTitle, { color: theme.semantic.textSecondary }]}>
              {group.title}
            </Text>
            <View style={[styles.listContainer, { borderColor: theme.semantic.border }]}>
              {group.items.map((cat, index) => (
                <Pressable
                  key={cat.key}
                  onPress={() => handleCategoryPress(cat)}
                  style={[
                    styles.listRow,
                    index > 0 && { borderTopWidth: 1, borderTopColor: theme.semantic.border }
                  ]}
                >
                  <View style={[styles.listRowIcon, { backgroundColor: cat.color + '20' }]}>
                    <CategoryIcon name={cat.icon} size={18} color={cat.color} />
                  </View>
                  <View style={styles.listRowContent}>
                    <Text style={[styles.listRowTitle, { color: theme.semantic.text }]}>
                      {cat.name}
                    </Text>
                    {cat.subCategories?.length > 0 && (
                      <Text
                        style={[styles.listRowSubtitle, { color: theme.semantic.textSecondary }]}
                        numberOfLines={1}
                      >
                        {getSubcategoryPreview(cat)}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.chevron, { color: theme.semantic.textSecondary }]}>›</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </>
    )
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleCancel}>
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={handleCancel} />

      {/* Sheet */}
      <View style={[styles.sheet, { backgroundColor: theme.semantic.surface, borderColor: theme.semantic.border, paddingBottom: insets.bottom }]}>
        {/* Drag Handle */}
        <View style={styles.handleContainer}>
          <View style={[styles.handle, { backgroundColor: theme.semantic.border }]} />
        </View>

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.semantic.border }]}>
          {selectedCategory ? (
            <Pressable onPress={handleBack} hitSlop={10}>
              <Text style={[styles.headerLink, { color: theme.semantic.primary }]}>Back</Text>
            </Pressable>
          ) : (
            <Pressable onPress={handleCancel} hitSlop={10}>
              <Text style={[styles.headerLink, { color: theme.semantic.primary }]}>Cancel</Text>
            </Pressable>
          )}

          <Text style={[styles.headerTitle, { color: theme.semantic.text }]}>
            {selectedCategory ? selectedCategory.name : 'Category'}
          </Text>

          <View style={{ width: 50 }} />
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBox, { backgroundColor: theme.semantic.surfaceAlt, borderColor: theme.semantic.border }]}>
            <Text style={{ opacity: 0.5, marginRight: spacing.sm }}>🔍</Text>
            <RNTextInput
              ref={categorySearchRef}
              value={categoryQuery}
              onChangeText={onQueryChange}
              placeholder={selectedCategory ? "Search subcategories..." : "Search categories + subcategories..."}
              placeholderTextColor={theme.semantic.textSecondary}
              style={[styles.searchInput, { color: theme.semantic.text }]}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {selectedCategory ? renderSubcategoryScreen() : renderMainScreen()}
        </ScrollView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 0.12,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    flex: 1,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  handleContainer: {
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: radius.full,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerLink: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  headerTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.heavy,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    padding: 0,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: letterSpacing.wider,
  },
  sectionHint: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  // Chip Row (Recent/Frequent)
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  chipIcon: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  // Group Section
  groupSection: {
    marginTop: spacing.md,
  },
  groupTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  // List Container
  listContainer: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    minHeight: 52,
  },
  listRowIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listRowContent: {
    flex: 1,
    gap: 2,
  },
  listRowTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  listRowSubtitle: {
    fontSize: fontSize.xs,
  },
  chevron: {
    fontSize: fontSize.lg,
  },
})
