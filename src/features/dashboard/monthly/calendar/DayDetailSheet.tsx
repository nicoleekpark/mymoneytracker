import React, { forwardRef, useCallback, useMemo } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
  type BottomSheetBackdropProps
} from '@gorhom/bottom-sheet'

import type { Transaction } from '@/domain/transaction/transaction.types'
import { formatUsdInt } from '@/shared/format/currency'
import { fontSize, fontWeight } from '@/theme/tokens/typography'
import { spacing } from '@/theme/tokens/spacing'
import type { CalendarColors } from './calendar.types'
import { MONTH_NAMES_SHORT } from '../../types/dashboard.types'

export type SelectedDay = {
  ymd: string
  dayNum: number
  income: number
  expense: number
  txCount: number
  net: number
}

type Props = {
  selectedDay: SelectedDay | null
  transactions: Transaction[]
  loadingTx: boolean
  colors: CalendarColors
  onViewAll: () => void
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
  return tx.type === 'income' ? 'Income' : 'Expense'
}

export const DayDetailSheet = forwardRef<BottomSheetModal, Props>(
  ({ selectedDay, transactions, loadingTx, colors, onViewAll }, ref) => {
    // Snap points: smaller for empty days, larger for days with transactions
    const hasTransactions = (selectedDay?.txCount ?? 0) > 0
    const snapPoints = useMemo(
      () => hasTransactions ? ['60%', '90%'] : ['25%'],
      [hasTransactions]
    )

    // Sort transactions by absolute value (impact-first)
    const sortedTx = useMemo(() => {
      return [...transactions].sort(
        (a, b) => Math.abs(b.money.amount) - Math.abs(a.money.amount)
      )
    }, [transactions])

    // Backdrop
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

    // Custom handle with grabber
    const renderHandle = useCallback(
      () => (
        <View style={{ alignItems: 'center', paddingTop: spacing.sm, paddingBottom: spacing.xs }}>
          <View
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: colors.textSecondary,
              opacity: 0.4
            }}
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
        backgroundStyle={{ backgroundColor: colors.surface }}
        enablePanDownToClose
      >
        <BottomSheetScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing['2xl'] }}
        >
          {/* Header: Date + Close */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.md
            }}
          >
            <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text }}>
              {formatDayLabel(selectedDay.ymd, selectedDay.dayNum)}
            </Text>
          </View>

          {/* Content depends on whether there are transactions */}
          {selectedDay.txCount > 0 ? (
            <>
              {/* Net - Same line layout */}
              <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: spacing.lg }}>
                <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginRight: spacing.sm }}>
                  Net
                </Text>
                <Text
                  style={{
                    fontSize: fontSize.lg,
                    fontWeight: fontWeight.bold,
                    color: selectedDay.net >= 0 ? colors.success : colors.danger,
                    fontVariant: ['tabular-nums']
                  }}
                >
                  {formatAmountAccounting(selectedDay.net)}
                </Text>
              </View>

              {/* Inflow / Outflow with middle divider */}
              <View style={{ flexDirection: 'row', marginBottom: spacing.xl }}>
                {/* Inflow */}
                <View style={{ flex: 1, alignItems: 'center', paddingVertical: spacing.sm }}>
                  <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary, letterSpacing: 0.5, marginBottom: 2 }}>
                    Inflow
                  </Text>
                  <Text
                    style={{
                      fontSize: fontSize.md,
                      fontWeight: fontWeight.semibold,
                      color: selectedDay.income > 0 ? colors.success : colors.textSecondary,
                      fontVariant: ['tabular-nums']
                    }}
                  >
                    {formatUsdInt(selectedDay.income)}
                  </Text>
                </View>

                {/* Middle divider */}
                <View style={{ width: 1, backgroundColor: colors.border, marginVertical: spacing.xs }} />

                {/* Outflow */}
                <View style={{ flex: 1, alignItems: 'center', paddingVertical: spacing.sm }}>
                  <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary, letterSpacing: 0.5, marginBottom: 2 }}>
                    Outflow
                  </Text>
                  <Text
                    style={{
                      fontSize: fontSize.md,
                      fontWeight: fontWeight.semibold,
                      color: selectedDay.expense > 0 ? colors.danger : colors.textSecondary,
                      fontVariant: ['tabular-nums']
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
                    marginBottom: spacing.md
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
                          borderBottomColor: colors.border
                        }}
                      >
                        <View style={{ flex: 1, marginRight: spacing.sm }}>
                          <Text
                            style={{
                              fontSize: fontSize.sm,
                              fontWeight: fontWeight.medium,
                              color: colors.text
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
                                marginTop: 2
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
                            fontVariant: ['tabular-nums']
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
                style={{
                  paddingVertical: spacing.md,
                  alignItems: 'center',
                  backgroundColor: colors.textSecondary + '10',
                  borderRadius: spacing.sm
                }}
              >
                <Text
                  style={{
                    fontSize: fontSize.sm,
                    fontWeight: fontWeight.semibold,
                    color: colors.textSecondary
                  }}
                >
                  View all {selectedDay.txCount} transactions →
                </Text>
              </Pressable>
            </>
          ) : (
            /* No transactions - minimal view */
            <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.md }}>
              No transactions recorded
            </Text>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    )
  }
)

DayDetailSheet.displayName = 'DayDetailSheet'
