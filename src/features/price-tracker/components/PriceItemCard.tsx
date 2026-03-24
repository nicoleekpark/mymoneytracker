import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useHoHTheme } from '@/providers'
import { radius } from '@/theme/tokens/radius'
import { spacing } from '@/theme/tokens/spacing'
import { fontSize, fontWeight } from '@/theme/tokens/typography'
import { formatCurrency } from '@/shared/format/currency'
import type { ItemPriceSummaryDollar } from '@/domain/price-tracker'

type Props = {
  summary: ItemPriceSummaryDollar
  onPress: () => void
}

export function PriceItemCard({ summary, onPress }: Props) {
  const theme = useHoHTheme()
  const { item, latestPrice, lowestPrice, pricePointCount } = summary

  const hasMultiplePrices = pricePointCount > 1

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.semantic.surface, borderColor: theme.semantic.border }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.itemMain}>
          <View style={[styles.emoji, { backgroundColor: theme.semantic.surfaceAlt }]}>
            <Text style={styles.emojiText}>{item.icon || '📦'}</Text>
          </View>
          <View style={styles.itemInfo}>
            <Text style={[styles.itemName, { color: theme.semantic.text }]}>{item.name}</Text>
            <Text style={[styles.itemMeta, { color: theme.semantic.textSecondary }]}>
              {item.unit ? `per ${item.unit}` : 'each'} · {pricePointCount} {pricePointCount === 1 ? 'price' : 'prices'}
            </Text>
          </View>
        </View>

        {latestPrice && (
          <View style={styles.priceBlock}>
            <Text style={[styles.currentPrice, { color: theme.semantic.text }]}>
              {formatCurrency(latestPrice.priceDollar)}
            </Text>
            <Text style={[styles.priceLabel, { color: theme.semantic.textSecondary }]}>latest</Text>
          </View>
        )}
      </View>

      {/* Price comparison */}
      {hasMultiplePrices && lowestPrice && latestPrice && (
        <View style={[styles.stores, { borderTopColor: theme.semantic.border }]}>
          {/* Best price row */}
          <View style={[styles.storeRow, styles.bestRow, { backgroundColor: theme.semantic.successSoft }]}>
            <View style={styles.storeLeft}>
              <View style={[styles.bestBadge, { backgroundColor: 'rgba(34, 197, 94, 0.2)' }]}>
                <Text style={[styles.bestBadgeText, { color: theme.semantic.success }]}>BEST</Text>
              </View>
              <View>
                <Text style={[styles.storeName, { color: theme.semantic.text }]}>{lowestPrice.storeName}</Text>
                <Text style={[styles.storeDate, { color: theme.semantic.textSecondary }]}>
                  {formatRelativeDate(lowestPrice.occurredAt)}
                </Text>
              </View>
            </View>
            <Text style={[styles.storePrice, { color: theme.semantic.success }]}>
              {formatCurrency(lowestPrice.priceDollar)}
            </Text>
          </View>

          {/* Latest price row (if different from best) */}
          {lowestPrice.id !== latestPrice.id && (
            <View style={styles.storeRow}>
              <View style={styles.storeLeft}>
                <View style={styles.storeBadgeSpacer} />
                <View>
                  <Text style={[styles.storeName, { color: theme.semantic.text }]}>{latestPrice.storeName}</Text>
                  <Text style={[styles.storeDate, { color: theme.semantic.textSecondary }]}>
                    {formatRelativeDate(latestPrice.occurredAt)}
                  </Text>
                </View>
              </View>
              <Text style={[styles.storePrice, { color: theme.semantic.text }]}>
                {formatCurrency(latestPrice.priceDollar)}
              </Text>
            </View>
          )}
        </View>
      )}
    </Pressable>
  )
}

function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
  },
  itemMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  emoji: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 24,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  itemMeta: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  currentPrice: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    fontVariant: ['tabular-nums'],
  },
  priceLabel: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  stores: {
    borderTopWidth: 1,
  },
  storeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  bestRow: {
    // background set dynamically
  },
  storeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bestBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  bestBadgeText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
  },
  storeBadgeSpacer: {
    width: 38, // approximate width of BEST badge
  },
  storeName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  storeDate: {
    fontSize: fontSize.xs,
    marginTop: 1,
  },
  storePrice: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    fontVariant: ['tabular-nums'],
  },
})
