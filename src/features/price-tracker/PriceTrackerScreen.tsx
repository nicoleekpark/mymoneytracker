import React, { useCallback, useMemo, useRef, useState } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { useHoHTheme } from '@/shared/providers'
import { Screen } from '@/shared/layout/Screen'
import { spacing } from '@/shared/theme/tokens/spacing'
import { radius } from '@/shared/theme/tokens/radius'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import { getPriceHistoryForItem, getLowestPriceForItem } from '@/core/services/price-tracker'
import type { ItemPriceSummaryDollar } from '@/core/services/price-tracker'
import type { PricePointWithStore, TrackedItem } from '@/core/domain/price-tracker'

import { usePriceTracker } from './hooks'
import { CategoryTabs, EmptyState, ItemSearchInput, PriceItemCard } from './components'
import { ItemPriceHistorySheet } from './sheets'

const CATEGORY_TABS = [
  { key: 'all', label: 'All' },
  { key: 'grocery', label: 'Groceries' },
  { key: 'coffee', label: 'Coffee' },
]

export default function PriceTrackerScreen() {
  const theme = useHoHTheme()
  const { items, stores, isLoading, refresh } = usePriceTracker()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  // Sheet state
  const sheetRef = useRef<BottomSheetModal>(null)
  const [selectedItem, setSelectedItem] = useState<TrackedItem | null>(null)
  const [selectedPriceHistory, setSelectedPriceHistory] = useState<PricePointWithStore[]>([])
  const [selectedLowestPrice, setSelectedLowestPrice] = useState<PricePointWithStore | null>(null)

  // Filter items
  const filteredItems = useMemo(() => {
    let result = items

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((item) => item.item.name.toLowerCase().includes(q))
    }

    // Filter by category
    if (activeCategory !== 'all') {
      // Map tab keys to item categories
      const categoryMap: Record<string, string[]> = {
        grocery: ['produce', 'dairy', 'meat', 'bakery', 'pantry', 'general'],
        coffee: ['coffee', 'beverage'],
      }
      const allowedCategories = categoryMap[activeCategory] ?? []
      result = result.filter((item) => allowedCategories.includes(item.item.category))
    }

    return result
  }, [items, searchQuery, activeCategory])

  const handleItemPress = useCallback((summary: ItemPriceSummaryDollar) => {
    const item = summary.item
    setSelectedItem(item)

    // Load full price history
    const history = getPriceHistoryForItem(item.id, 50)
    const lowest = getLowestPriceForItem(item.id)
    setSelectedPriceHistory(history)
    setSelectedLowestPrice(lowest)

    sheetRef.current?.present()
  }, [])

  const handleSheetDismiss = useCallback(() => {
    setSelectedItem(null)
    setSelectedPriceHistory([])
    setSelectedLowestPrice(null)
  }, [])

  const renderItem = useCallback(
    ({ item }: { item: ItemPriceSummaryDollar }) => (
      <PriceItemCard summary={item} onPress={() => handleItemPress(item)} />
    ),
    [handleItemPress]
  )

  const keyExtractor = useCallback((item: ItemPriceSummaryDollar) => item.item.id, [])

  return (
    <BottomSheetModalProvider>
      <Screen edges={[]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.semantic.surface, borderColor: theme.semantic.border }]}>
          <Text style={[styles.title, { color: theme.semantic.text }]}>Price Tracker</Text>
          <Text style={[styles.subtitle, { color: theme.semantic.textSecondary }]}>
            {stores.length} {stores.length === 1 ? 'store' : 'stores'} · {items.length}{' '}
            {items.length === 1 ? 'item' : 'items'}
          </Text>

          <CategoryTabs tabs={CATEGORY_TABS} activeKey={activeCategory} onSelect={setActiveCategory} />
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <ItemSearchInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Search items..." />
        </View>

        {/* List */}
        {filteredItems.length === 0 && !isLoading ? (
          <EmptyState />
        ) : (
          <FlatList
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onRefresh={refresh}
            refreshing={isLoading}
          />
        )}

        {/* Price History Sheet */}
        <ItemPriceHistorySheet
          item={selectedItem}
          priceHistory={selectedPriceHistory}
          lowestPrice={selectedLowestPrice}
          sheetRef={sheetRef}
          onDismiss={handleSheetDismiss}
        />
      </Screen>
    </BottomSheetModalProvider>
  )
}

const styles = StyleSheet.create({
  header: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: fontWeight.heavy,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: fontSize.sm,
  },
  searchContainer: {
    marginBottom: spacing.md,
  },
  listContent: {
    paddingBottom: spacing['2xl'],
  },
})
