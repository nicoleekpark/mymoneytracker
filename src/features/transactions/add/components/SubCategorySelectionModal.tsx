import { CATEGORIES } from '@/shared/config/categories.config'
import type { CategoryRef } from '@/core/domain/category'
import { useHoHTheme } from '@/shared/providers'
import { CategoryIcon } from '@/shared/components'
import { Screen } from '@/shared/layout/Screen'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { fontWeight } from '@/shared/theme/tokens/typography'
import React from 'react'
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type SubCategory = (typeof CATEGORIES)[number]['subCategories'][number]

type Props = Readonly<{
  visible: boolean
  categoryRef: CategoryRef | null
  selectedCategory: (typeof CATEGORIES)[number] | null
  subCategories: (typeof CATEGORIES)[number]['subCategories']
  onClose: () => void
  onChoose: (subCategoryKey?: string) => void
  onReopenCategory: () => void
}>

export function SubCategorySelectionModal({
  visible,
  categoryRef,
  selectedCategory,
  subCategories,
  onClose,
  onChoose,
  onReopenCategory,
}: Props) {
  const theme = useHoHTheme()
  const insets = useSafeAreaInsets()

  const listData: ({ key: string } | SubCategory)[] = [{ key: '__none__' }, ...subCategories]

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
            <Text style={{ color: theme.semantic.textSecondary, fontWeight: fontWeight.heavy }}>Cancel</Text>
          </Pressable>

          <Text style={{ color: theme.semantic.text, fontWeight: fontWeight.black }}>Subcategory</Text>

          <View style={{ width: 56 }} />
        </View>

        <View style={[styles.topRowWrap, { borderBottomColor: theme.semantic.border }]}>
          <Pressable
            onPress={onReopenCategory}
            style={[styles.topRow, { borderColor: theme.semantic.border, backgroundColor: theme.semantic.surface }]}
          >
            <Text style={{ color: theme.semantic.textSecondary, fontWeight: fontWeight.heavy }}>Category</Text>
            {selectedCategory ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <CategoryIcon name={selectedCategory.icon} size={16} color={selectedCategory.color} />
                <Text style={{ color: theme.semantic.text, fontWeight: fontWeight.black }}>{selectedCategory.name}</Text>
              </View>
            ) : (
              <Text style={{ color: theme.semantic.text, fontWeight: fontWeight.black }}>Select</Text>
            )}
            <Text style={{ color: theme.semantic.textSecondary, fontWeight: fontWeight.black }} />
          </Pressable>
        </View>

        <FlatList
          style={{ flex: 1 }}
          data={listData}
          keyExtractor={(x) => x.key}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
          renderItem={({ item: row }) => {
            if (row.key === '__none__') {
              const selected = !categoryRef?.subCategoryKey
              return (
                <Pressable onPress={() => onChoose(undefined)} style={[styles.row, { borderBottomColor: theme.semantic.border }]}>
                  <Text style={{ color: theme.semantic.text, fontWeight: fontWeight.black }}>None</Text>
                  <Text style={{ color: selected ? theme.semantic.primary : theme.semantic.textSecondary, fontWeight: fontWeight.black }}>
                    {selected ? '✓' : ''}
                  </Text>
                </Pressable>
              )
            }

            const sc = row as SubCategory
            const selected = categoryRef?.subCategoryKey === sc.key

            return (
              <Pressable onPress={() => onChoose(sc.key)} style={[styles.row, { borderBottomColor: theme.semantic.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.iconContainer}>
                    <CategoryIcon name={sc.icon} size={18} color={sc.color} />
                  </View>
                  <Text style={{ color: theme.semantic.text, fontWeight: fontWeight.black }}>{sc.name}</Text>
                </View>
                <Text style={{ color: selected ? theme.semantic.primary : theme.semantic.textSecondary, fontWeight: fontWeight.black }}>
                  {selected ? '✓' : ''}
                </Text>
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  topRowWrap: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  topRow: {
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
