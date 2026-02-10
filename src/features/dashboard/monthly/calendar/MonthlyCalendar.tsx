import { getTransactionsForDate } from '@/domain/transaction/transaction.usecase'
import type { Transaction } from '@/domain/transaction/transaction.types'
import { formatCompactUsd, formatUsdInt } from '@/shared/format/currency'
import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native'

import { daysInMonth, firstWeekdayIndex, parseYYYYMM } from '../monthly.utils'
import type { CalendarColors, DailyFlow } from './calendar.types'
import { MONTH_NAMES_SHORT } from '../../types/dashboard.types'

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const

// Cell height - fixed size showing amounts
const CELL_HEIGHT = 56

// Max transactions to show in popup
const MAX_TX_IN_POPUP = 3

// Gap between cells
const GAP = 4

// Low variable spending threshold (dollars) - days under this get highlighted
const LOW_VARIABLE_SPEND_THRESHOLD = 20

type Props = Readonly<{
  monthYYYYMM: string
  daily: DailyFlow[]
  colors: CalendarColors
  onPressDay?: (ymd: string) => void
}>

type SelectedDay = {
  ymd: string
  dayNum: number
  income: number
  expense: number
  txCount: number
  net: number
}

/**
 * Calendar with "Net Color + Amounts" style
 * - Background color = net result (green for positive, red for negative)
 * - Always shows income/expense amounts below dates
 * - Tap day to see transaction details in tooltip popup
 */
export function MonthlyCalendar({ monthYYYYMM, daily, colors, onPressDay }: Props) {
  const { year, month } = parseYYYYMM(monthYYYYMM)
  const [selectedDay, setSelectedDay] = useState<SelectedDay | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingTx, setLoadingTx] = useState(false)

  const map = useMemo(() => {
    const m = new Map<string, {
      income: number
      expense: number
      variableExpense: number
      net: number
      hasIncome: boolean
      hasExpense: boolean
      txCount: number
      isLowVariableSpend: boolean
      isZeroSpend: boolean
    }>()
    for (const r of daily) {
      const net = r.incomeDollar - r.expenseDollar
      const hasIncome = r.incomeDollar > 0
      const hasExpense = r.expenseDollar > 0
      m.set(r.day, {
        income: r.incomeDollar,
        expense: r.expenseDollar,
        variableExpense: r.variableExpenseDollar,
        net,
        hasIncome,
        hasExpense,
        txCount: r.txCount,
        // Low variable spend: has expense but variable expense under threshold
        isLowVariableSpend: hasExpense && r.variableExpenseDollar < LOW_VARIABLE_SPEND_THRESHOLD,
        // Zero spend: has income but no expense
        isZeroSpend: hasIncome && !hasExpense
      })
    }
    return m
  }, [daily])

  const { first, dim } = useMemo(() => {
    return { first: firstWeekdayIndex(year, month), dim: daysInMonth(year, month) }
  }, [year, month])

  const todayYMD = useMemo(() => new Date().toISOString().slice(0, 10), [])

  // Fetch transactions when a day is selected
  useEffect(() => {
    if (!selectedDay) {
      setTransactions([])
      return
    }

    let alive = true
    setLoadingTx(true)

    getTransactionsForDate(selectedDay.ymd, 10)
      .then((txs) => {
        if (alive) setTransactions(txs)
      })
      .catch(() => {
        if (alive) setTransactions([])
      })
      .finally(() => {
        if (alive) setLoadingTx(false)
      })

    return () => { alive = false }
  }, [selectedDay?.ymd])

  // Color calculations - neutral background for all activity
  const getBgColor = (hasActivity: boolean) => {
    if (!hasActivity) return 'transparent'
    return colors.textMuted + '15' // neutral gray
  }

  function handleDayPress(ymd: string, dayNum: number) {
    const v = map.get(ymd)
    if (v && (v.hasIncome || v.hasExpense)) {
      setSelectedDay({
        ymd,
        dayNum,
        income: v.income,
        expense: v.expense,
        txCount: v.txCount,
        net: v.net
      })
    }
  }

  function handleDismiss() {
    setSelectedDay(null)
  }

  function handleViewAll() {
    if (selectedDay) {
      onPressDay?.(selectedDay.ymd)
      setSelectedDay(null)
    }
  }

  // Format date for display (avoid timezone issues by parsing manually)
  function formatDayLabel(ymd: string, dayNum: number) {
    const [yearStr, monthStr, dayStr] = ymd.split('-')
    const date = new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr))
    const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
    return `${weekday} ${MONTH_NAMES_SHORT[date.getMonth()]} ${dayNum}`
  }

  // Get transaction display name
  function getTxDisplayName(tx: Transaction): string {
    if (tx.item && tx.item.trim()) return tx.item.trim()
    if (tx.merchant && tx.merchant.trim()) return tx.merchant.trim()
    return tx.type === 'income' ? 'Income' : 'Expense'
  }

  const visibleTx = transactions.slice(0, MAX_TX_IN_POPUP)

  // Build weeks array for proper 7-column layout
  const weeks = useMemo(() => {
    const result: (number | null)[][] = []
    let currentWeek: (number | null)[] = Array(first).fill(null) // leading blanks

    for (let day = 1; day <= dim; day++) {
      currentWeek.push(day)
      if (currentWeek.length === 7) {
        result.push(currentWeek)
        currentWeek = []
      }
    }

    // Pad the last week with trailing blanks
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null)
      result.push(currentWeek)
    }

    return result
  }, [first, dim])

  // Cell wrapper ensures equal width for all cells (empty or filled)
  const CELL_MARGIN = GAP / 2

  // Render a single day cell
  function renderDayCell(dayNum: number | null, cellKey: string) {
    // Wrapper style - same for all cells
    const wrapperStyle = {
      flex: 1,
      marginHorizontal: CELL_MARGIN,
    }

    if (dayNum === null) {
      // Empty cell - just the wrapper with fixed height
      return (
        <View key={cellKey} style={wrapperStyle}>
          <View style={{ height: CELL_HEIGHT }} />
        </View>
      )
    }

    const dd = String(dayNum).padStart(2, '0')
    const ymd = `${monthYYYYMM}-${dd}`
    const v = map.get(ymd)
    const isToday = ymd === todayYMD
    const isSelected = selectedDay?.ymd === ymd
    const hasActivity = v !== undefined && (v.hasIncome || v.hasExpense)
    const hasIncome = v?.hasIncome ?? false
    const hasExpense = v?.hasExpense ?? false
    const isLowVariableSpend = v?.isLowVariableSpend ?? false
    const isZeroSpend = v?.isZeroSpend ?? false
    const bgColor = getBgColor(hasActivity)

    return (
      <View key={cellKey} style={wrapperStyle}>
        <Pressable
          onPress={() => handleDayPress(ymd, dayNum)}
          style={{
            height: CELL_HEIGHT,
            backgroundColor: bgColor,
            borderRadius: 8,
            borderWidth: isSelected ? 2 : 0,
            borderColor: isSelected ? colors.primary : 'transparent',
            paddingTop: 6,
            paddingHorizontal: 2,
            alignItems: 'center'
          }}
        >
        {/* Day number row with optional spend dot */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          {/* Today: filled circle background */}
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: isToday ? colors.primary : 'transparent',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: isToday ? '#fff' : hasActivity ? colors.text : colors.textMuted
              }}
            >
              {dayNum}
            </Text>
          </View>
          {/* Dot indicator: single dot for low-spend, concentric circles for zero-spend */}
          {isZeroSpend ? (
            /* Concentric circles for zero-spend (more special) */
            <View
              style={{
                width: 9,
                height: 9,
                borderRadius: 4.5,
                borderWidth: 1.5,
                borderColor: colors.highlight,
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 2
              }}
            >
              <View
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: colors.highlight
                }}
              />
            </View>
          ) : isLowVariableSpend ? (
            /* Single dot for low-spend */
            <View
              style={{
                width: 5,
                height: 5,
                borderRadius: 2.5,
                backgroundColor: colors.highlight,
                marginLeft: 2
              }}
            />
          ) : null}
        </View>

        {hasActivity && (
          <View style={{ alignItems: 'center', marginTop: 3 }}>
            {hasIncome && (
              <Text style={{ fontSize: 10, fontWeight: '700', color: colors.success }}>
                +{formatCompactUsd(v!.income)}
              </Text>
            )}
            {hasExpense && (
              <Text style={{ fontSize: 10, fontWeight: '700', color: colors.danger }}>
                -{formatCompactUsd(v!.expense)}
              </Text>
            )}
          </View>
        )}
        </Pressable>
      </View>
    )
  }

  return (
    <View style={{ gap: GAP, marginHorizontal: -CELL_MARGIN }}>
      {/* Weekday header */}
      <View style={{ flexDirection: 'row' }}>
        {WEEKDAYS.map((w, i) => (
          <View key={`wd-${i}`} style={{ flex: 1, marginHorizontal: CELL_MARGIN, alignItems: 'center', paddingVertical: 4 }}>
            <Text style={{ fontSize: 10, fontWeight: '600', color: colors.text }}>{w}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid - one row per week */}
      {weeks.map((week, weekIdx) => (
        <View key={`week-${weekIdx}`} style={{ flexDirection: 'row' }}>
          {week.map((day, dayIdx) => renderDayCell(day, `day-${weekIdx}-${dayIdx}`))}
        </View>
      ))}


      {/* Tooltip Popup Modal */}
      <Modal
        visible={selectedDay !== null}
        transparent
        animationType="fade"
        onRequestClose={handleDismiss}
      >
        <Pressable
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.3)'
          }}
          onPress={handleDismiss}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              width: 280,
              maxHeight: 400,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
              borderWidth: 1,
              borderColor: colors.border
            }}
          >
            {selectedDay && (
              <>
                {/* Header with close button */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>
                    {formatDayLabel(selectedDay.ymd, selectedDay.dayNum)}
                  </Text>
                  <Pressable
                    onPress={handleDismiss}
                    hitSlop={12}
                    style={{
                      padding: 4,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Text style={{ fontSize: 16, fontWeight: '500', color: colors.textMuted }}>
                      ✕
                    </Text>
                  </Pressable>
                </View>

                {/* Summary Row: INFLOW - OUTFLOW = NET */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: 16,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 10
                  }}
                >
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: colors.text, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                      Inflow
                    </Text>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: selectedDay.income > 0 ? colors.success : colors.textMuted }}>
                      {formatUsdInt(selectedDay.income)}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: '400', color: colors.textMuted, marginTop: 14 }}>
                    −
                  </Text>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: colors.text, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                      Outflow
                    </Text>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: selectedDay.expense > 0 ? colors.danger : colors.textMuted }}>
                      {formatUsdInt(selectedDay.expense)}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: '400', color: colors.textMuted, marginTop: 14 }}>
                    =
                  </Text>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: colors.text, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                      Net
                    </Text>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: '700',
                        color: selectedDay.net >= 0 ? colors.success : colors.danger
                      }}
                    >
                      {selectedDay.net >= 0 ? '+' : ''}{formatUsdInt(selectedDay.net)}
                    </Text>
                  </View>
                </View>

                {/* Transaction List */}
                {loadingTx ? (
                  <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color={colors.textMuted} />
                  </View>
                ) : (
                  <View style={{ marginBottom: 12 }}>
                    {visibleTx.map((tx, idx) => (
                      <View
                        key={tx.id}
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingVertical: 10,
                          borderBottomWidth: idx < visibleTx.length - 1 ? 1 : 0,
                          borderBottomColor: colors.border
                        }}
                      >
                        <Text
                          style={{ flex: 1, fontSize: 13, fontWeight: '600', color: colors.text, marginRight: 8 }}
                          numberOfLines={1}
                        >
                          {getTxDisplayName(tx)}
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: '700',
                            color: tx.type === 'income' ? colors.success : colors.danger
                          }}
                        >
                          {tx.type === 'income' ? '+' : '-'}{formatUsdInt(tx.money.amount)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* View All Button */}
                <Pressable
                  onPress={handleViewAll}
                  style={{
                    paddingVertical: 8,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.primary }}>
                    View all {selectedDay.txCount} transactions →
                  </Text>
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}
