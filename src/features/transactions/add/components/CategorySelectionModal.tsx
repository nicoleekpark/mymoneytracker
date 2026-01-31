import { CATEGORIES } from '@/config/categories.config'
import { useHoHTheme } from '@/providers'
import { CategoryIcon } from '@/shared/components'
import { Screen } from '@/shared/layout/Screen'
import React from 'react'
import type { TextInput } from 'react-native'
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput as RNTextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import type { CategorySearchRow } from '../hooks/useCategoryPicker'

type Props = Readonly<{
  visible: boolean
  categoryQuery: string
  searchRows: CategorySearchRow[]
  categorySearchRef: React.RefObject<TextInput | null>
  onQueryChange: (q: string) => void
  onClose: () => void
  onChooseCategory: (cat: (typeof CATEGORIES)[number]) => void
  onChooseSubFromSearch: (
    cat: (typeof CATEGORIES)[number],
    sub: (typeof CATEGORIES)[number]['subCategories'][number]
  ) => void
}>

export function CategorySelectionModal({
  visible,
  categoryQuery,
  searchRows,
  categorySearchRef,
  onQueryChange,
  onClose,
  onChooseCategory,
  onChooseSubFromSearch,
}: Props) {
  const theme = useHoHTheme()
  const insets = useSafeAreaInsets()

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <Screen edges={[]} padded={false} topPadding={false} style={{ flex: 1 }} contentStyle={{ flex: 1 }}>
        <View
          style={[
            styles.headerBar,
            {
              borderBottomColor: theme.semantic.border,
              paddingTop: insets.top,
              height: 52 + insets.top,
            },
          ]}
        >
          <Pressable onPress={onClose} hitSlop={10}>
            <Text style={{ color: theme.semantic.textSecondary, fontWeight: '800' }}>Cancel</Text>
          </Pressable>

          <Text style={{ color: theme.semantic.text, fontWeight: '900' }}>Category</Text>

          <View style={{ width: 56 }} />
        </View>

        <View style={[styles.searchWrap, { borderBottomColor: theme.semantic.border }]}>
          <View
            style={[
              styles.searchBox,
              { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface, marginBottom: 0 },
            ]}
          >
            <RNTextInput
              ref={categorySearchRef}
              value={categoryQuery}
              onChangeText={onQueryChange}
              placeholder="Search category or subcategory"
              placeholderTextColor={theme.semantic.textSecondary}
              style={{ color: theme.semantic.text, fontWeight: '700' }}
              autoCorrect={false}
              autoCapitalize="none"
              autoFocus={false}
              returnKeyType="search"
              blurOnSubmit={false}
            />
          </View>
        </View>

        <FlatList
          style={{ flex: 1 }}
          data={searchRows}
          keyExtractor={(row) => (row.kind === 'category' ? `c:${row.cat.key}` : `s:${row.cat.key}:${row.sub.key}`)}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }}
          renderItem={({ item: row }) => {
            if (row.kind === 'category') {
              const cat = row.cat
              return (
                <Pressable onPress={() => onChooseCategory(cat)} style={[styles.row, { borderBottomColor: theme.semantic.border }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.iconContainer}>
                      <CategoryIcon name={cat.icon} size={18} color={cat.color} />
                    </View>
                    <Text style={{ color: theme.semantic.text, fontWeight: '900' }}>{cat.name}</Text>
                  </View>
                  <Text style={{ color: theme.semantic.textSecondary, fontWeight: '900' }}>
                    {cat.subCategories?.length ? '›' : ''}
                  </Text>
                </Pressable>
              )
            }

            const { cat, sub } = row
            return (
              <Pressable onPress={() => onChooseSubFromSearch(cat, sub)} style={[styles.row, { borderBottomColor: theme.semantic.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.iconContainer}>
                    <CategoryIcon name={sub.icon} size={18} color={sub.color} />
                  </View>
                  <Text style={{ color: theme.semantic.text, fontWeight: '900' }}>{sub.name}</Text>
                  <Text style={{ color: theme.semantic.textSecondary, fontWeight: '800', fontSize: 12, marginLeft: 6 }}>in {cat.name}</Text>
                </View>

                <Text style={{ color: theme.semantic.primary, fontWeight: '900' }}>✓</Text>
              </Pressable>
            )
          }}
        />
      </Screen>
    </Modal>
  )
}

const styles = StyleSheet.create({
  headerBar: {
    minHeight: 52,
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchBox: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  row: {
    height: 52,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
