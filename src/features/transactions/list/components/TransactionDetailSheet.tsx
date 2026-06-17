import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
  type BottomSheetBackdropProps
} from '@gorhom/bottom-sheet'
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
import { CategoryIcon, CTAContainer } from '@/shared/components'
import { formatCurrency } from '@/shared/format/currency'
import { modalStyles, getScrollContentWithCTAPadding, MODAL_SNAP_FULL } from '@/shared/theme/tokens/modal'
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
  const snapPoints = MODAL_SNAP_FULL

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
      <View style={modalStyles.dragHandleContainer}>
        <View style={[modalStyles.dragHandle, { backgroundColor: theme.semantic.border }]} />
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
  }) + ' · ' + d.toLocaleTimeString('en-US', {
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
      backgroundStyle={[
        modalStyles.modal,
        {
          backgroundColor: theme.semantic.surface,
          borderWidth: 0,
          shadowOpacity: 0,
          elevation: 0,
        },
      ]}
      enablePanDownToClose
      onDismiss={onDismiss}
    >
      <View style={styles.sheetContainer}>
        {/* Close X button */}
        <Pressable
          onPress={() => sheetRef.current?.dismiss()}
          style={modalStyles.detailCloseButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Close"
        >
          <FontAwesome name="times" size={18} color={theme.semantic.textSecondary as string} />
        </Pressable>

        <BottomSheetScrollView
          style={styles.scrollView}
          contentContainerStyle={[modalStyles.content, { paddingBottom: getScrollContentWithCTAPadding(0) }]}
        >
          {/* Header - Amount */}
          <View style={modalStyles.heroContainer}>
            <Text style={[modalStyles.heroAmount, { color: amountColor }]}>
              {isIncome ? '+' : ''}{formatCurrency(transaction.money.amount)}
            </Text>
            <Text style={[styles.heroTitle, { color: theme.semantic.text }]}>
              {primaryText}
            </Text>
            {secondaryText && (
              <Text style={[modalStyles.heroHint, { color: theme.semantic.textSecondary }]}>
                {secondaryText}
              </Text>
            )}
          </View>

          {/* Details */}
          <View style={modalStyles.fieldGroup}>
            {/* Date & Time */}
            <View style={[modalStyles.detailRow, { borderBottomColor: theme.semantic.border }]}>
              <Text style={[modalStyles.detailLabel, { color: theme.semantic.textSecondary }]}>Date</Text>
              <Text style={[modalStyles.detailValue, { color: theme.semantic.text }]}>{dateTimeStr}</Text>
            </View>

            {/* Account */}
            <View style={[modalStyles.detailRow, { borderBottomColor: theme.semantic.border }]}>
              <Text style={[modalStyles.detailLabel, { color: theme.semantic.textSecondary }]}>
                {isIncome ? 'Account' : 'Paid with'}
              </Text>
              <Text style={[modalStyles.detailValue, { color: theme.semantic.text }]}>{accountName}</Text>
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
                <View style={[modalStyles.detailRow, { borderBottomColor: theme.semantic.border }]}>
                  <Text style={[modalStyles.detailLabel, { color: theme.semantic.textSecondary }]}>Category</Text>
                  <View style={modalStyles.detailValueRow}>
                    <CategoryIcon name={icon} size={16} color={color as string} />
                    <Text style={[modalStyles.detailValue, { color: theme.semantic.text, flex: 0 }]} numberOfLines={1}>
                      {name}{subName && ` › ${subName}`}
                    </Text>
                  </View>
                </View>
              )
            })()}

            {/* Tags */}
            {transaction.tags && transaction.tags.length > 0 && (
              <View style={[modalStyles.detailRow, { borderBottomColor: theme.semantic.border }]}>
                <Text style={[modalStyles.detailLabel, { color: theme.semantic.textSecondary }]}>Tags</Text>
                <View style={styles.tagsContainer}>
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
              <View style={[modalStyles.detailRow, { borderBottomColor: theme.semantic.border }]}>
                <Text style={[modalStyles.detailLabel, { color: theme.semantic.textSecondary }]}>Status</Text>
                <View style={[modalStyles.badge, { backgroundColor: theme.semantic.warningSoft, borderColor: theme.semantic.warning + '40' }]}>
                  <Text style={[modalStyles.badgeText, { color: theme.semantic.warning }]}>
                    Estimated
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Items Section */}
          {transactionItems.length > 0 && (
            <View style={styles.itemsSection}>
              <View style={[modalStyles.detailSectionHeader, { borderBottomColor: theme.semantic.border }]}>
                <Text style={[modalStyles.detailSectionTitle, { color: theme.semantic.textSecondary }]}>Items</Text>
                <Text style={[modalStyles.detailSectionSubtitle, { color: theme.semantic.textSecondary }]}>
                  {transactionItems.length} {transactionItems.length === 1 ? 'item' : 'items'} · {formatCurrency(itemsTotal)}
                </Text>
              </View>

              {transactionItems.map((txItem) => (
                <Pressable
                  key={txItem.id}
                  onPress={() => handleItemPress(txItem)}
                  style={[modalStyles.itemRow, { borderBottomColor: theme.semantic.border }]}
                  disabled={!txItem.itemId}
                >
                  <View style={modalStyles.itemRowLeft}>
                    <View style={[modalStyles.itemRowDot, { backgroundColor: theme.semantic.primary }]} />
                    <Text style={[modalStyles.itemRowName, { color: theme.semantic.text }]}>{txItem.name}</Text>
                    {txItem.quantity > 1 && (
                      <Text style={[modalStyles.itemRowQty, { color: theme.semantic.textSecondary }]}>
                        × {txItem.quantity}{txItem.unit ? ` ${txItem.unit}` : ''}
                      </Text>
                    )}
                  </View>
                  <View style={modalStyles.itemRowRight}>
                    <Text style={[modalStyles.itemRowPrice, { color: theme.semantic.text }]}>
                      {formatCurrency(txItem.priceCents / 100)}
                    </Text>
                    {txItem.itemId && (
                      <Text style={[modalStyles.chevronInline, { color: theme.semantic.textSecondary }]}>›</Text>
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          {/* Note */}
          {transaction.note && (
            <View style={modalStyles.noteSection}>
              <Text style={[modalStyles.noteSectionLabel, { color: theme.semantic.textSecondary }]}>Note</Text>
              <Text style={[modalStyles.noteSectionText, { color: theme.semantic.text }]}>
                {transaction.note}
              </Text>
            </View>
          )}
        </BottomSheetScrollView>

        {/* Fixed Footer Buttons */}
        <CTAContainer insideBottomSheet>
          <Pressable
            onPress={() => onEdit(transaction)}
            style={[modalStyles.ctaPrimaryButton, { backgroundColor: theme.semantic.primary }]}
          >
            <Text style={[modalStyles.ctaPrimaryText, { color: theme.semantic.onPrimary }]}>
              Edit
            </Text>
          </Pressable>
          {onDelete && (
            <Pressable
              onPress={() => {
                sheetRef.current?.dismiss()
                onDelete(transaction)
              }}
              style={modalStyles.ctaDangerTextButton}
            >
              <Text style={[modalStyles.ctaDangerTextButtonLabel, { color: theme.semantic.danger }]}>
                Delete Transaction
              </Text>
            </Pressable>
          )}
        </CTAContainer>

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

// Only keep styles that are NOT in the design system
const styles = StyleSheet.create({
  sheetContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    flex: 0.65,
  },
  tag: {
    paddingVertical: spacing.xs - 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  itemsSection: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
})
