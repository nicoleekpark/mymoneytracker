import FontAwesome from '@expo/vector-icons/FontAwesome'
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react'
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import type { Transaction } from '@/core/domain/transaction/transaction.types'
import { formatUsdInt } from '@/shared/format/currency'
import { modalStyles } from '@/shared/theme/tokens/modal'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { fontSize, fontWeight, letterSpacing } from '@/shared/theme/tokens/typography'
import { MONTH_NAMES_SHORT } from '../../utils'
import type { CalendarColors } from './calendar.types'

export type SelectedDay = {
  ymd: string
  dayNum: number
  income: number
  expense: number
  txCount: number
  net: number
  isFuture: boolean
}

export type DayDetailSheetRef = {
  present: () => void
  dismiss: () => void
}

type Props = {
  selectedDay: SelectedDay | null
  transactions: Transaction[]
  loadingTx: boolean
  colors: CalendarColors
  onViewAll: () => void
  /** Set of YMD strings that are marked as zero-spend */
  zeroSpendDays?: Set<string>
  /** Callback when zero-spend is toggled for a day */
  onToggleZeroSpend?: (ymd: string, isZeroSpend: boolean) => void
  /** Callback to dismiss the sheet */
  onDismiss?: () => void
}

// Format amount with parentheses for negatives (accounting style)
function formatAmountAccounting(amount: number): string {
  const formatted = formatUsdInt(Math.abs(amount))
  return amount < 0 ? `(${formatted})` : formatted
}

// Format date for display
function formatDayLabel(ymd: string, dayNum: number) {
  const [yearStr, monthStr] = ymd.split('-')
  const date = new Date(Number(yearStr), Number(monthStr) - 1, dayNum)
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
  return `${weekday}, ${MONTH_NAMES_SHORT[date.getMonth()]} ${dayNum}`
}

// Get transaction display name
function getTxDisplayName(tx: Transaction): string {
  if (tx.item && tx.item.trim()) return tx.item.trim()
  if (tx.merchant && tx.merchant.trim()) return tx.merchant.trim()
  return 'No description'
}

export const DayDetailSheet = forwardRef<DayDetailSheetRef, Props>(
  (
    {
      selectedDay,
      transactions,
      loadingTx,
      colors,
      onViewAll,
      zeroSpendDays,
      onToggleZeroSpend,
      onDismiss,
    },
    ref
  ) => {
    const insets = useSafeAreaInsets()
    const [visible, setVisible] = useState(false)

    // Expose present/dismiss methods via ref
    useImperativeHandle(ref, () => ({
      present: () => setVisible(true),
      dismiss: () => setVisible(false),
    }))

    const handleClose = useCallback(() => {
      setVisible(false)
      onDismiss?.()
    }, [onDismiss])

    // Filter out Opening Balance and sort by absolute value (impact-first)
    const sortedTx = useMemo(() => {
      return [...transactions]
        .filter((tx) => tx.item !== 'Opening Balance')
        .sort((a, b) => Math.abs(b.money.amount) - Math.abs(a.money.amount))
    }, [transactions])

    const hasTransactions = (selectedDay?.txCount ?? 0) > 0

    if (!selectedDay) return null

    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          {/* Drag Handle */}
          <View style={modalStyles.dragHandleContainer}>
            <View
              style={[
                modalStyles.dragHandle,
                { backgroundColor: colors.textSecondary, opacity: 0.4 },
              ]}
            />
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
              {formatDayLabel(selectedDay.ymd, selectedDay.dayNum)}
            </Text>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + (hasTransactions ? 120 : 80) },
            ]}
          >
            {/* Content depends on whether there are transactions */}
            {selectedDay.txCount > 0 ? (
              <>
                {/* Net - Center aligned */}
                <View style={styles.netContainer}>
                  <Text style={[styles.netLabel, { color: colors.textSecondary }]}>Net</Text>
                  <Text
                    style={[
                      styles.netValue,
                      { color: selectedDay.net >= 0 ? colors.success : colors.danger },
                    ]}
                  >
                    {formatAmountAccounting(selectedDay.net)}
                  </Text>
                </View>

                {/* Inflow / Outflow with middle divider */}
                <View style={styles.flowContainer}>
                  {/* Inflow */}
                  <View style={styles.flowItem}>
                    <Text style={[styles.flowLabel, { color: colors.textSecondary }]}>Inflow</Text>
                    <Text
                      style={[
                        styles.flowValue,
                        { color: selectedDay.income > 0 ? colors.success : colors.textSecondary },
                      ]}
                    >
                      {formatUsdInt(selectedDay.income)}
                    </Text>
                  </View>

                  {/* Middle divider */}
                  <View style={[styles.flowDivider, { backgroundColor: colors.border }]} />

                  {/* Outflow */}
                  <View style={styles.flowItem}>
                    <Text style={[styles.flowLabel, { color: colors.textSecondary }]}>Outflow</Text>
                    <Text
                      style={[
                        styles.flowValue,
                        { color: selectedDay.expense > 0 ? colors.danger : colors.textSecondary },
                      ]}
                    >
                      ({formatUsdInt(selectedDay.expense)})
                    </Text>
                  </View>
                </View>

                {/* Transaction List */}
                <View style={styles.txListContainer}>
                  <Text style={[styles.txListTitle, { color: colors.textSecondary }]}>
                    Transactions
                  </Text>

                  {loadingTx ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color={colors.textSecondary} />
                    </View>
                  ) : (
                    <View>
                      {sortedTx.map((tx, idx) => (
                        <View
                          key={tx.id}
                          style={[
                            styles.txRow,
                            idx < sortedTx.length - 1 && [
                              styles.txRowBorder,
                              { borderBottomColor: colors.border },
                            ],
                          ]}
                        >
                          <View style={styles.txInfo}>
                            <Text style={[styles.txName, { color: colors.text }]} numberOfLines={1}>
                              {getTxDisplayName(tx)}
                            </Text>
                            {tx.category && (
                              <Text style={[styles.txCategory, { color: colors.textSecondary }]}>
                                {tx.category.subCategoryKey || tx.category.categoryKey}
                              </Text>
                            )}
                          </View>
                          <Text
                            style={[
                              styles.txAmount,
                              { color: tx.type === 'income' ? colors.success : colors.danger },
                            ]}
                          >
                            {tx.type === 'income'
                              ? formatUsdInt(tx.money.amount)
                              : `(${formatUsdInt(tx.money.amount)})`}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </>
            ) : (
              /* No transactions - clean centered view */
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No transactions
                </Text>

                {/* Zero-spend toggle (only for past/present dates) */}
                {onToggleZeroSpend && !selectedDay.isFuture && (
                  <Pressable
                    onPress={() => {
                      const isCurrentlyMarked = zeroSpendDays?.has(selectedDay.ymd) ?? false
                      onToggleZeroSpend(selectedDay.ymd, !isCurrentlyMarked)
                      setTimeout(() => handleClose(), 150)
                    }}
                    style={[
                      styles.zeroSpendButton,
                      {
                        backgroundColor: zeroSpendDays?.has(selectedDay.ymd)
                          ? colors.highlight + '20'
                          : colors.surfaceAlt,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: zeroSpendDays?.has(selectedDay.ymd)
                            ? colors.highlight
                            : colors.border,
                          backgroundColor: zeroSpendDays?.has(selectedDay.ymd)
                            ? colors.highlight
                            : 'transparent',
                        },
                      ]}
                    >
                      {zeroSpendDays?.has(selectedDay.ymd) && (
                        <FontAwesome name="check" size={10} color="#fff" />
                      )}
                    </View>
                    <Text style={[styles.zeroSpendText, { color: colors.text }]}>
                      Mark as zero-spend day
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
          </ScrollView>

          {/* Footer with buttons */}
          <View
            style={[
              styles.footer,
              {
                backgroundColor: colors.surface,
                borderTopColor: colors.border,
                paddingBottom: Math.max(insets.bottom, spacing.lg),
              },
            ]}
          >
            {/* View all button (only when there are transactions) */}
            {hasTransactions && (
              <Pressable
                onPress={onViewAll}
                style={[modalStyles.saveButton, { backgroundColor: colors.primary }]}
              >
                <Text style={[modalStyles.saveButtonText, { color: '#fff' }]}>
                  View all {selectedDay.txCount} transactions
                </Text>
              </Pressable>
            )}

            {/* Close button (secondary style) */}
            <Pressable
              onPress={handleClose}
              style={[
                modalStyles.saveButton,
                {
                  backgroundColor: 'transparent',
                  marginTop: hasTransactions ? spacing.sm : 0,
                },
              ]}
            >
              <Text style={[modalStyles.saveButtonText, { color: colors.textSecondary }]}>
                Close
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    )
  }
)

DayDetailSheet.displayName = 'DayDetailSheet'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
  },
  titleContainer: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
  },
  netContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  netLabel: {
    fontSize: fontSize.sm,
    marginRight: spacing.sm,
  },
  netValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    fontVariant: ['tabular-nums'],
  },
  flowContainer: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  flowItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  flowLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.wider,
    marginBottom: 2,
  },
  flowValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    fontVariant: ['tabular-nums'],
  },
  flowDivider: {
    width: 1,
    marginVertical: spacing.xs,
  },
  txListContainer: {
    marginBottom: spacing.lg,
  },
  txListTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  txRowBorder: {
    borderBottomWidth: 1,
  },
  txInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  txName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  txCategory: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  txAmount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    fontVariant: ['tabular-nums'],
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.sm,
    marginBottom: spacing.lg,
  },
  zeroSpendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 20,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zeroSpendText: {
    fontSize: fontSize.sm,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
})
