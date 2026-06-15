import React, { useCallback, useMemo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useHoHTheme } from '@/shared/providers'
import { spacing } from '@/shared/theme/tokens/spacing'
import { radius } from '@/shared/theme/tokens/radius'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import { modalStyles } from '@/shared/theme/tokens/modal'
import { formatCurrency } from '@/shared/format/currency'
import type { PricePointWithStore, TrackedItem } from '@/core/domain/price-tracker'

type Props = {
  item: TrackedItem | null
  priceHistory: PricePointWithStore[]
  lowestPrice: PricePointWithStore | null
  currentTransactionStoreId?: string
  sheetRef: React.RefObject<BottomSheetModal | null>
  onDismiss: () => void
}

export function ItemPriceHistorySheet({
  item,
  priceHistory,
  lowestPrice,
  currentTransactionStoreId,
  sheetRef,
  onDismiss,
}: Props) {
  const theme = useHoHTheme()
  const snapPoints = useMemo(() => ['70%'], [])

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
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

  if (!item) return null

  // Group prices by store, showing only the latest per store
  const latestByStore = useMemo(() => {
    const storeMap = new Map<string, PricePointWithStore>()
    for (const pp of priceHistory) {
      if (!storeMap.has(pp.storeId)) {
        storeMap.set(pp.storeId, pp)
      }
    }
    return Array.from(storeMap.values()).sort((a, b) => {
      // Sort by price (lowest first)
      const priceA = a.priceCents / a.quantity
      const priceB = b.priceCents / b.quantity
      return priceA - priceB
    })
  }, [priceHistory])

  const storeCount = latestByStore.length

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      backdropComponent={renderBackdrop}
      handleComponent={renderHandle}
      backgroundStyle={[modalStyles.modal, { backgroundColor: theme.semantic.surface }]}
      enablePanDownToClose
      onDismiss={onDismiss}
    >
      <View style={styles.sheetContainer}>
        {/* Close button */}
        <Pressable
          onPress={() => sheetRef.current?.dismiss()}
          style={modalStyles.detailCloseButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Close"
        >
          <FontAwesome name="times" size={18} color={theme.semantic.textSecondary as string} />
        </Pressable>

        <BottomSheetScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.emoji, { backgroundColor: theme.semantic.surfaceAlt }]}>
              <Text style={styles.emojiText}>{item.icon || '📦'}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={[styles.itemName, { color: theme.semantic.text }]}>{item.name}</Text>
              <Text style={[styles.itemMeta, { color: theme.semantic.textSecondary }]}>
                {item.unit ? `per ${item.unit}` : 'each'} · {storeCount} {storeCount === 1 ? 'store' : 'stores'} tracked
              </Text>
            </View>
          </View>

          {/* Price comparison */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.semantic.textSecondary }]}>PRICE COMPARISON</Text>

            {latestByStore.map((pp, _index) => {
              const isBest = lowestPrice && pp.id === lowestPrice.id
              const isCurrentStore = currentTransactionStoreId && pp.storeId === currentTransactionStoreId
              const unitPrice = pp.priceCents / pp.quantity / 100

              return (
                <View
                  key={pp.id}
                  style={[
                    styles.priceRow,
                    isBest && { backgroundColor: theme.semantic.successSoft },
                    isBest && { borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.3)' },
                  ]}
                >
                  <View style={styles.priceRowLeft}>
                    <Text style={[styles.storeName, { color: theme.semantic.text }]}>{pp.storeName}</Text>
                    <Text style={[styles.storeDate, { color: theme.semantic.textSecondary }]}>
                      {formatRelativeDate(pp.occurredAt)}
                      {isBest && ' · Best price'}
                      {isCurrentStore && ' · You paid'}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.storePrice,
                      { color: isBest ? theme.semantic.success : theme.semantic.text },
                    ]}
                  >
                    {formatCurrency(unitPrice)}
                  </Text>
                </View>
              )
            })}
          </View>

          {/* View full history CTA */}
          {priceHistory.length > storeCount && (
            <Pressable
              style={[styles.ctaButton, { backgroundColor: theme.semantic.surfaceAlt }]}
              onPress={() => {
                // v1.x: Navigate to full history (Price Tracker completion)
              }}
            >
              <FontAwesome name="line-chart" size={14} color={theme.semantic.primary as string} />
              <Text style={[styles.ctaText, { color: theme.semantic.primary }]}>View Full Price History</Text>
            </Pressable>
          )}
        </BottomSheetScrollView>
      </View>
    </BottomSheetModal>
  )
}

function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Updated today'
  if (diffDays === 1) return 'Updated yesterday'
  if (diffDays < 7) return `Updated ${diffDays} days ago`

  return `Updated ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

const styles = StyleSheet.create({
  sheetContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    marginBottom: spacing.md,
  },
  emoji: {
    width: 56,
    height: 56,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 32,
  },
  headerInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 20,
    fontWeight: fontWeight.bold,
  },
  itemMeta: {
    fontSize: fontSize.sm,
    marginTop: 4,
  },
  section: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
  },
  priceRowLeft: {
    flex: 1,
  },
  storeName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  storeDate: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  storePrice: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    fontVariant: ['tabular-nums'],
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginTop: spacing.lg,
  },
  ctaText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
})
