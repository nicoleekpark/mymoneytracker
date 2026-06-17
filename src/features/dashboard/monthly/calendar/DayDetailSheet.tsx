import FontAwesome from '@expo/vector-icons/FontAwesome'
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet'
import React, { forwardRef, useCallback, useMemo } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'

import type { Transaction } from '@/core/domain/transaction/transaction.types'
import { formatUsdInt } from '@/shared/format/currency'
import { getScrollContentPadding, modalStyles } from '@/shared/theme/tokens/modal'
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

export const DayDetailSheet = forwardRef<BottomSheetModal, Props>(
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
    // Single fixed snap point - dynamic calculation doesn't work well with BottomSheetModal
    // because snapPoints are cached when sheet opens
    const snapPoints = ['50%']

    // Filter out Opening Balance and sort by absolute value (impact-first)
    const sortedTx = useMemo(() => {
      return [...transactions]
        .filter((tx) => tx.item !== 'Opening Balance')
        .sort((a, b) => Math.abs(b.money.amount) - Math.abs(a.money.amount))
    }, [transactions])

    // Backdrop
    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
      ),
      []
    )

    // Custom handle with grabber
    const renderHandle = useCallback(
      () => (
        <View style={modalStyles.dragHandleContainer}>
          <View
            style={[
              modalStyles.dragHandle,
              { backgroundColor: colors.textSecondary, opacity: 0.4 },
            ]}
          />
        </View>
      ),
      [colors.textSecondary]
    )

    if (!selectedDay) return null

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        handleComponent={renderHandle}
        backgroundStyle={[
          modalStyles.modal,
          {
            backgroundColor: colors.surface,
            borderWidth: 0,
            shadowOpacity: 0,
            elevation: 0,
          },
        ]}
        enablePanDownToClose
      >
        <BottomSheetScrollView
          contentContainerStyle={{
            paddingHorizontal: spacing.xl,
            paddingBottom: getScrollContentPadding(0),
          }}
        >
          {/* Header: Date */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.md,
            }}
          >
            <Text
              style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text }}
            >
              {formatDayLabel(selectedDay.ymd, selectedDay.dayNum)}
            </Text>
          </View>

          {/* Content depends on whether there are transactions */}
          {selectedDay.txCount > 0 ? (
            <>
              {/* Net - Same line layout */}
              <View
                style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: spacing.lg }}
              >
                <Text
                  style={{
                    fontSize: fontSize.sm,
                    color: colors.textSecondary,
                    marginRight: spacing.sm,
                  }}
                >
                  Net
                </Text>
                <Text
                  style={{
                    fontSize: fontSize.lg,
                    fontWeight: fontWeight.bold,
                    color: selectedDay.net >= 0 ? colors.success : colors.danger,
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {formatAmountAccounting(selectedDay.net)}
                </Text>
              </View>

              {/* Inflow / Outflow with middle divider */}
              <View style={{ flexDirection: 'row', marginBottom: spacing.xl }}>
                {/* Inflow */}
                <View style={{ flex: 1, alignItems: 'center', paddingVertical: spacing.sm }}>
                  <Text
                    style={{
                      fontSize: fontSize.xs,
                      fontWeight: fontWeight.medium,
                      color: colors.textSecondary,
                      letterSpacing: letterSpacing.wider,
                      marginBottom: 2,
                    }}
                  >
                    Inflow
                  </Text>
                  <Text
                    style={{
                      fontSize: fontSize.md,
                      fontWeight: fontWeight.semibold,
                      color: selectedDay.income > 0 ? colors.success : colors.textSecondary,
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    {formatUsdInt(selectedDay.income)}
                  </Text>
                </View>

                {/* Middle divider */}
                <View
                  style={{ width: 1, backgroundColor: colors.border, marginVertical: spacing.xs }}
                />

                {/* Outflow */}
                <View style={{ flex: 1, alignItems: 'center', paddingVertical: spacing.sm }}>
                  <Text
                    style={{
                      fontSize: fontSize.xs,
                      fontWeight: fontWeight.medium,
                      color: colors.textSecondary,
                      letterSpacing: letterSpacing.wider,
                      marginBottom: 2,
                    }}
                  >
                    Outflow
                  </Text>
                  <Text
                    style={{
                      fontSize: fontSize.md,
                      fontWeight: fontWeight.semibold,
                      color: selectedDay.expense > 0 ? colors.danger : colors.textSecondary,
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    ({formatUsdInt(selectedDay.expense)})
                  </Text>
                </View>
              </View>

              {/* Transaction List */}
              <View style={{ marginBottom: spacing.lg }}>
                <Text
                  style={{
                    fontSize: fontSize.xs,
                    fontWeight: fontWeight.semibold,
                    color: colors.textSecondary,
                    marginBottom: spacing.md,
                  }}
                >
                  Top transactions
                </Text>

                {loadingTx ? (
                  <View style={{ paddingVertical: spacing.xl, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color={colors.textSecondary} />
                  </View>
                ) : (
                  <View>
                    {sortedTx.map((tx, idx) => (
                      <View
                        key={tx.id}
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          paddingVertical: spacing.sm,
                          borderBottomWidth: idx < sortedTx.length - 1 ? 1 : 0,
                          borderBottomColor: colors.border,
                        }}
                      >
                        <View style={{ flex: 1, marginRight: spacing.sm }}>
                          <Text
                            style={{
                              fontSize: fontSize.sm,
                              fontWeight: fontWeight.medium,
                              color: colors.text,
                            }}
                            numberOfLines={1}
                          >
                            {getTxDisplayName(tx)}
                          </Text>
                          {tx.category && (
                            <Text
                              style={{
                                fontSize: fontSize.xs,
                                color: colors.textSecondary,
                                marginTop: 2,
                              }}
                            >
                              {tx.category.subCategoryKey || tx.category.categoryKey}
                            </Text>
                          )}
                        </View>
                        <Text
                          style={{
                            fontSize: fontSize.sm,
                            fontWeight: fontWeight.semibold,
                            color: tx.type === 'income' ? colors.success : colors.danger,
                            fontVariant: ['tabular-nums'],
                          }}
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

              {/* View All CTA */}
              <Pressable
                onPress={onViewAll}
                style={[modalStyles.saveButton, { backgroundColor: colors.textSecondary + '10' }]}
              >
                <Text style={[modalStyles.saveButtonText, { color: colors.textSecondary }]}>
                  View all {selectedDay.txCount} transactions →
                </Text>
              </Pressable>
            </>
          ) : (
            /* No transactions - clean centered view */
            <View style={{ alignItems: 'center', paddingVertical: spacing.md }}>
              <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.lg }}>
                No transactions
              </Text>

              {/* Zero-spend toggle (only for past/present dates) */}
              {onToggleZeroSpend && !selectedDay.isFuture && (
                <Pressable
                  onPress={() => {
                    const isCurrentlyMarked = zeroSpendDays?.has(selectedDay.ymd) ?? false
                    onToggleZeroSpend(selectedDay.ymd, !isCurrentlyMarked)
                    setTimeout(() => onDismiss?.(), 150)
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.sm,
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.lg,
                    borderRadius: 20,
                    backgroundColor: zeroSpendDays?.has(selectedDay.ymd)
                      ? colors.highlight + '20'
                      : colors.surfaceAlt,
                  }}
                >
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      borderWidth: 2,
                      borderColor: zeroSpendDays?.has(selectedDay.ymd)
                        ? colors.highlight
                        : colors.border,
                      backgroundColor: zeroSpendDays?.has(selectedDay.ymd)
                        ? colors.highlight
                        : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {zeroSpendDays?.has(selectedDay.ymd) && (
                      <FontAwesome name="check" size={10} color="#fff" />
                    )}
                  </View>
                  <Text style={{ fontSize: fontSize.sm, color: colors.text }}>
                    Mark as zero-spend day
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    )
  }
)

DayDetailSheet.displayName = 'DayDetailSheet'
