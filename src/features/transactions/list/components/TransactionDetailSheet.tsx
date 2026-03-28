import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
  type BottomSheetBackdropProps
} from '@gorhom/bottom-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import FontAwesome from '@expo/vector-icons/FontAwesome'
import { CATEGORIES } from '@/shared/config'
import type { Transaction } from '@/core/domain/transaction'
import { safeDate } from '@/core/domain/transaction'
import { getActiveAccounts } from '@/core/services/account'
import {
  getTransactionItems,
  getItemById,
  getPriceHistoryForItem,
  getLowestPriceForItem,
} from '@/core/services/price-tracker'
import type {
  TransactionItem,
  TrackedItem,
  PricePointWithStore,
} from '@/core/domain/price-tracker'
import { useHoHTheme } from '@/shared/providers'
import { CategoryIcon } from '@/shared/components'
import { formatCurrency } from '@/shared/format/currency'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import { spacing } from '@/shared/theme/tokens/spacing'
import { radius } from '@/shared/theme/tokens/radius'
import { ItemPriceHistorySheet } from '@/features/price-tracker'

type Props = {
  transaction: Transaction | null
  sheetRef: React.RefObject<BottomSheetModal | null>
  onDismiss: () => void
  onEdit: (tx: Transaction) => void
  onDelete?: (tx: Transaction) => void
}

export function TransactionDetailSheet({ transaction, sheetRef, onDismiss, onEdit, onDelete }: Props) {
  const theme = useHoHTheme()
  const insets = useSafeAreaInsets()
  const snapPoints = useMemo(() => ['90%'], [])

  const accounts = useMemo(() => getActiveAccounts(), [])
  const accountNameById = useMemo(() => {
    const m = new Map<string, string>()
    for (const a of accounts) m.set(a.id, a.name)
    return m
  }, [accounts])

  // Transaction items state
  const [transactionItems, setTransactionItems] = useState<TransactionItem[]>([])

  // Price history sheet state
  const priceHistorySheetRef = useRef<BottomSheetModal>(null)
  const [selectedItem, setSelectedItem] = useState<TrackedItem | null>(null)
  const [selectedPriceHistory, setSelectedPriceHistory] = useState<PricePointWithStore[]>([])
  const [selectedLowestPrice, setSelectedLowestPrice] = useState<PricePointWithStore | null>(null)

  // Load transaction items when transaction changes
  useEffect(() => {
    if (transaction) {
      const items = getTransactionItems(transaction.id)
      setTransactionItems(items)
    } else {
      setTransactionItems([])
    }
  }, [transaction])

  // Calculate items total
  const itemsTotal = useMemo(() => {
    return transactionItems.reduce((sum, item) => sum + item.priceCents, 0) / 100
  }, [transactionItems])

  // Handle item tap - open price history
  const handleItemPress = useCallback((txItem: TransactionItem) => {
    if (txItem.itemId) {
      const trackedItem = getItemById(txItem.itemId)
      if (trackedItem) {
        setSelectedItem(trackedItem)
        const history = getPriceHistoryForItem(trackedItem.id, 50)
        const lowest = getLowestPriceForItem(trackedItem.id)
        setSelectedPriceHistory(history)
        setSelectedLowestPrice(lowest)
        priceHistorySheetRef.current?.present()
      }
    }
  }, [])

  const handlePriceHistoryDismiss = useCallback(() => {
    setSelectedItem(null)
    setSelectedPriceHistory([])
    setSelectedLowestPrice(null)
  }, [])

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  )

  const renderHandle = useCallback(
    () => (
      <View style={styles.handleContainer}>
        <View style={[styles.handle, { backgroundColor: theme.semantic.border }]} />
      </View>
    ),
    [theme.semantic.border]
  )

  if (!transaction) return null

  const d = safeDate(transaction)
  const dateTimeStr = d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) + ' • ' + d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })

  const accountName = accountNameById.get(transaction.accountId ?? '') || 'Unknown'
  const isIncome = transaction.type === 'income'
  const isTransfer = transaction.type === 'transfer'

  // Fallback chain for display: item → merchant → category → type
  const itemRaw = (transaction.item ?? '').trim()
  const merchantRaw = (transaction.merchant ?? '').trim()
  const typeLabel = isIncome ? 'Income' : isTransfer ? 'Transfer' : 'Expense'

  // Get category name for fallback
  const catRef = transaction.category
  const cat = catRef ? CATEGORIES.find((c) => c.key === catRef.categoryKey && c.type === catRef.type) : null
  const subCat = catRef?.subCategoryKey ? cat?.subCategories?.find((s) => s.key === catRef.subCategoryKey) : null
  const categoryName = subCat?.name ?? cat?.name ?? null

  let primaryText: string
  let secondaryText: string | null = null

  if (itemRaw.length > 0) {
    primaryText = itemRaw
    secondaryText = merchantRaw.length > 0 ? merchantRaw : null
  } else if (merchantRaw.length > 0) {
    primaryText = merchantRaw
  } else if (categoryName) {
    primaryText = categoryName
  } else {
    primaryText = typeLabel
  }

  const amountColor = isIncome
    ? theme.semantic.success
    : isTransfer
      ? theme.semantic.info
      : theme.semantic.text

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      backdropComponent={renderBackdrop}
      handleComponent={renderHandle}
      backgroundStyle={{ backgroundColor: theme.semantic.surface }}
      enablePanDownToClose
      onDismiss={onDismiss}
    >
      <View style={styles.sheetContainer}>
        {/* Close X button */}
        <Pressable
          onPress={() => sheetRef.current?.dismiss()}
          style={styles.closeX}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Close"
        >
          <FontAwesome name="times" size={18} color={theme.semantic.textSecondary as string} />
        </Pressable>

        <BottomSheetScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
        {/* Header - Amount */}
        <View style={styles.header}>
          <Text style={[styles.amount, { color: amountColor }]}>
            {isIncome ? '+' : ''}{formatCurrency(transaction.money.amount)}
          </Text>
          <Text style={[styles.itemTitle, { color: theme.semantic.text }]}>
            {primaryText}
          </Text>
          {secondaryText && (
            <Text style={[styles.merchant, { color: theme.semantic.textSecondary }]}>
              {secondaryText}
            </Text>
          )}
        </View>

        {/* Details */}
        <View style={styles.detailsSection}>
          {/* Date & Time - combined */}
          <View style={[styles.detailRow, { borderBottomColor: theme.semantic.border }]}>
            <Text style={[styles.detailLabel, { color: theme.semantic.textSecondary }]}>Date</Text>
            <Text style={[styles.detailValue, { color: theme.semantic.text }]}>{dateTimeStr}</Text>
          </View>

          {/* Account */}
          <View style={[styles.detailRow, { borderBottomColor: theme.semantic.border }]}>
            <Text style={[styles.detailLabel, { color: theme.semantic.textSecondary }]}>
              {isIncome ? 'Account' : 'Paid with'}
            </Text>
            <Text style={[styles.detailValue, { color: theme.semantic.text }]}>{accountName}</Text>
          </View>

          {/* Category */}
          {transaction.category && (() => {
            const catRef = transaction.category
            const cat = CATEGORIES.find((c) => c.key === catRef.categoryKey && c.type === catRef.type)
            const subCat = catRef.subCategoryKey
              ? cat?.subCategories?.find((s) => s.key === catRef.subCategoryKey)
              : null

            const icon = subCat?.icon ?? cat?.icon ?? 'circle'
            const color = subCat?.color ?? cat?.color ?? theme.semantic.textSecondary
            const name = cat?.name ?? catRef.categoryKey
            const subName = subCat?.name

            return (
              <View style={[styles.detailRow, { borderBottomColor: theme.semantic.border }]}>
                <Text style={[styles.detailLabel, { color: theme.semantic.textSecondary }]}>Category</Text>
                <View style={styles.categoryValue}>
                  <CategoryIcon
                    name={icon}
                    size={16}
                    color={color as string}
                  />
                  <Text style={[styles.categoryText, { color: theme.semantic.text }]} numberOfLines={1}>
                    {name}
                    {subName && ` › ${subName}`}
                  </Text>
                </View>
              </View>
            )
          })()}

          {/* Tags */}
          {transaction.tags && transaction.tags.length > 0 && (
            <View style={[styles.detailRow, { borderBottomColor: theme.semantic.border }]}>
              <Text style={[styles.detailLabel, { color: theme.semantic.textSecondary }]}>Tags</Text>
              <View style={styles.tagsRow}>
                {transaction.tags.map((tag) => (
                  <View
                    key={tag}
                    style={[styles.tag, { backgroundColor: theme.semantic.surfaceAlt }]}
                  >
                    <Text style={[styles.tagText, { color: theme.semantic.textSecondary }]}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Estimated Badge */}
          {transaction.isEstimated && (
            <View style={[styles.detailRow, { borderBottomColor: theme.semantic.border }]}>
              <Text style={[styles.detailLabel, { color: theme.semantic.textSecondary }]}>Status</Text>
              <View style={[styles.estimatedBadge, { backgroundColor: theme.semantic.warningSoft }]}>
                <Text style={[styles.estimatedText, { color: theme.semantic.warning }]}>
                  Estimated
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Items Section */}
        {transactionItems.length > 0 && (
          <View style={styles.itemsSection}>
            <View style={[styles.itemsSectionHeader, { borderBottomColor: theme.semantic.border }]}>
              <Text style={[styles.itemsSectionTitle, { color: theme.semantic.textSecondary }]}>Items</Text>
              <Text style={[styles.itemsSectionCount, { color: theme.semantic.textSecondary }]}>
                {transactionItems.length} {transactionItems.length === 1 ? 'item' : 'items'} · {formatCurrency(itemsTotal)}
              </Text>
            </View>

            {transactionItems.map((txItem) => (
              <Pressable
                key={txItem.id}
                onPress={() => handleItemPress(txItem)}
                style={[styles.itemRow, { borderBottomColor: theme.semantic.border }]}
                disabled={!txItem.itemId}
              >
                <View style={styles.itemLeft}>
                  <Text style={styles.itemEmoji}>📦</Text>
                  <Text style={[styles.itemName, { color: theme.semantic.text }]}>{txItem.name}</Text>
                  {txItem.quantity > 1 && (
                    <Text style={[styles.itemQty, { color: theme.semantic.textSecondary }]}>
                      × {txItem.quantity}{txItem.unit ? ` ${txItem.unit}` : ''}
                    </Text>
                  )}
                </View>
                <View style={styles.itemRight}>
                  <Text style={[styles.itemPrice, { color: theme.semantic.text }]}>
                    {formatCurrency(txItem.priceCents / 100)}
                  </Text>
                  {txItem.itemId && (
                    <Text style={[styles.itemChevron, { color: theme.semantic.textSecondary }]}>›</Text>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Note - Full width section */}
        {transaction.note && (
          <View style={styles.noteSection}>
            <Text style={[styles.noteSectionLabel, { color: theme.semantic.textSecondary }]}>Note</Text>
            <Text style={[styles.noteSectionText, { color: theme.semantic.text }]}>
              {transaction.note}
            </Text>
          </View>
        )}
        </BottomSheetScrollView>

        {/* Fixed Footer Buttons */}
        <View style={[styles.footer, { backgroundColor: theme.semantic.surface, paddingBottom: insets.bottom + spacing.lg }]}>
          <Pressable
            onPress={() => onEdit(transaction)}
            style={[styles.editButton, { backgroundColor: theme.semantic.primary }]}
          >
            <Text style={[styles.editButtonText, { color: theme.semantic.onPrimary }]}>
              Edit
            </Text>
          </Pressable>
          {onDelete && (
            <Pressable
              onPress={() => {
                sheetRef.current?.dismiss()
                onDelete(transaction)
              }}
              style={styles.deleteButton}
            >
              <Text style={[styles.deleteButtonText, { color: theme.semantic.danger }]}>
                Delete Transaction
              </Text>
            </Pressable>
          )}
        </View>

        {/* Item Price History Sheet */}
        <ItemPriceHistorySheet
          item={selectedItem}
          priceHistory={selectedPriceHistory}
          lowestPrice={selectedLowestPrice}
          sheetRef={priceHistorySheetRef}
          onDismiss={handlePriceHistoryDismiss}
        />
      </View>
    </BottomSheetModal>
  )
}

const styles = StyleSheet.create({
  sheetContainer: {
    flex: 1,
  },
  closeX: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.md,
    zIndex: 10,
    padding: spacing.sm,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.xl
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  amount: {
    fontSize: 40,
    fontWeight: fontWeight.heavy,
    letterSpacing: -1,
  },
  itemTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  merchant: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  detailsSection: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    flex: 0.4,
  },
  detailValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    flex: 0.6,
    textAlign: 'right',
  },
  categoryValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    flex: 0.6,
  },
  categoryText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textAlign: 'right',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    flex: 0.6,
  },
  tag: {
    paddingVertical: spacing.xs - 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
  },
  tagText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  estimatedBadge: {
    paddingVertical: spacing.xs - 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
  },
  estimatedText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  editButton: {
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  deleteButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  deleteButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  noteSection: {
    marginBottom: spacing.xl,
  },
  noteSectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
  noteSectionText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: 20,
  },
  // Items Section
  itemsSection: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  itemsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  itemsSectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  itemsSectionCount: {
    fontSize: fontSize.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  itemEmoji: {
    fontSize: 18,
  },
  itemName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    flexShrink: 1,
  },
  itemQty: {
    fontSize: fontSize.xs,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemPrice: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    fontVariant: ['tabular-nums'],
  },
  itemChevron: {
    fontSize: fontSize.lg,
  },
})
