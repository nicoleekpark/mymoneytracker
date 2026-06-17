import { getTransactionsForDate } from '@/core/services/transaction'
import type { Transaction } from '@/core/domain/transaction'
import { formatCompactUsd } from '@/shared/format/currency'
import { fontSize, fontWeight } from '@/shared/theme/tokens/typography'
import { radius } from '@/shared/theme/tokens/radius'
import { getTodayYMD } from '@/shared/utils/date'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import type { BottomSheetModal } from '@gorhom/bottom-sheet'

import { getDaysInMonth } from '@/core/domain/transaction'
import { parseYYYYMM } from '@/features/dashboard/utils/period.utils'
import { firstWeekdayIndex } from '../monthly.utils'
import type { CalendarColors, DailyFlow } from './calendar.types'
import { DayDetailSheet, type SelectedDay } from './DayDetailSheet'

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const

// Cell height - fixed size showing amounts
const CELL_HEIGHT = 56

// Gap between cells
const GAP = 4

// Magnitude thresholds for weight scaling (Stripe-style)
const MAGNITUDE_SMALL = 100   // <$100: regular
const MAGNITUDE_MEDIUM = 1000 // $100-999: medium, $1K+: semibold

type MagnitudeTier = 'small' | 'medium' | 'large'

function getMagnitudeTier(amount: number): MagnitudeTier {
  const abs = Math.abs(amount)
  if (abs < MAGNITUDE_SMALL) return 'small'
  if (abs < MAGNITUDE_MEDIUM) return 'medium'
  return 'large'
}

// Get semantic color + weight based on amount (Stripe-style weight scaling)
function getAmountStyle(
  net: number,
  colors: CalendarColors
): { color: string; fontWeight: 400 | 500 | 600 } {
  const tier = getMagnitudeTier(net)
  const baseColor = net >= 0 ? colors.success : colors.danger

  switch (tier) {
    case 'small':
      return { color: baseColor, fontWeight: 400 }
    case 'medium':
      return { color: baseColor, fontWeight: 500 }
    case 'large':
      return { color: baseColor, fontWeight: 600 }
  }
}

type Props = Readonly<{
  monthYYYYMM: string
  daily: DailyFlow[]
  colors: CalendarColors
  onPressDay?: (ymd: string) => void
  /** Set of YMD strings that are manually marked as zero-spend */
  manualZeroSpendDays?: Set<string>
  /** Callback when zero-spend is toggled for a day */
  onToggleZeroSpend?: (ymd: string, isZeroSpend: boolean) => void
}>

/**
 * Calendar with "Net Color + Amounts" style
 * - Background color = net result (green for positive, red for negative)
 * - Always shows income/expense amounts below dates
 * - Tap day to see transaction details in tooltip popup
 */
export function MonthlyCalendar({ monthYYYYMM, daily, colors, onPressDay, manualZeroSpendDays, onToggleZeroSpend }: Props) {
  const { year, month } = parseYYYYMM(monthYYYYMM)
  const [selectedDay, setSelectedDay] = useState<SelectedDay | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingTx, setLoadingTx] = useState(false)
  const bottomSheetRef = useRef<BottomSheetModal>(null)

  const map = useMemo(() => {
    const m = new Map<string, {
      income: number
      expense: number
      net: number
      hasIncome: boolean
      hasExpense: boolean
      txCount: number
      isZeroSpend: boolean
    }>()
    for (const r of daily) {
      const net = r.incomeDollar - r.expenseDollar
      const hasIncome = r.incomeDollar > 0
      const hasExpense = r.expenseDollar > 0
      m.set(r.day, {
        income: r.incomeDollar,
        expense: r.expenseDollar,
        net,
        hasIncome,
        hasExpense,
        txCount: r.txCount,
        isZeroSpend: hasIncome && !hasExpense
      })
    }
    return m
  }, [daily])

  const { first, dim } = useMemo(() => {
    return { first: firstWeekdayIndex(year, month), dim: getDaysInMonth(year, month) }
  }, [year, month])

  const todayYMD = useMemo(() => getTodayYMD(), [])

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

  // No background for minimal ledger-like style (1A)
  const getBgColor = () => 'transparent'

  const handleDayPress = useCallback((ymd: string, dayNum: number) => {
    const v = map.get(ymd)
    setSelectedDay({
      ymd,
      dayNum,
      income: v?.income ?? 0,
      expense: v?.expense ?? 0,
      txCount: v?.txCount ?? 0,
      net: v?.net ?? 0,
      isFuture: ymd > todayYMD
    })
  }, [map, todayYMD])

  // Present bottom sheet when selectedDay changes
  useEffect(() => {
    if (selectedDay) {
      bottomSheetRef.current?.present()
    }
  }, [selectedDay])

  const handleViewAll = useCallback(() => {
    if (selectedDay) {
      bottomSheetRef.current?.dismiss()
      onPressDay?.(selectedDay.ymd)
    }
  }, [selectedDay, onPressDay])

  const handleDismiss = useCallback(() => {
    bottomSheetRef.current?.dismiss()
  }, [])

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
    const isFuture = ymd > todayYMD
    const isSelected = selectedDay?.ymd === ymd
    const hasActivity = v !== undefined && (v.hasIncome || v.hasExpense)
    // Zero-spend: either automatic (income but no expense) or manually marked
    const isZeroSpend = (v?.isZeroSpend ?? false) || (manualZeroSpendDays?.has(ymd) ?? false)
    const bgColor = getBgColor()

    // Get semantic color style for amount
    const amountStyle = hasActivity ? getAmountStyle(v!.net, colors) : null

    // Build accessibility label
    const a11yParts: string[] = [`Day ${dayNum}`]
    if (isToday) a11yParts.push('today')
    if (hasActivity && v) {
      if (v.income > 0) a11yParts.push(`income ${formatCompactUsd(v.income)}`)
      if (v.expense > 0) a11yParts.push(`expense ${formatCompactUsd(v.expense)}`)
      a11yParts.push(`net ${v.net >= 0 ? 'positive' : 'negative'} ${formatCompactUsd(Math.abs(v.net))}`)
      a11yParts.push(`${v.txCount} transaction${v.txCount !== 1 ? 's' : ''}`)
    } else {
      a11yParts.push('no transactions')
    }
    if (isZeroSpend) a11yParts.push('zero spend day')
    const a11yLabel = a11yParts.join(', ')

    // Future dates without activity are disabled; future dates WITH activity are clickable
    const isDisabled = isFuture && !hasActivity

    return (
      <View key={cellKey} style={wrapperStyle}>
        <Pressable
          onPress={() => handleDayPress(ymd, dayNum)}
          disabled={isDisabled}
          accessibilityRole="button"
          accessibilityLabel={a11yLabel}
          accessibilityState={{ selected: isSelected, disabled: isDisabled }}
          style={{
            height: CELL_HEIGHT,
            backgroundColor: bgColor,
            borderRadius: radius.xs,
            borderWidth: isSelected ? 2 : 0,
            borderColor: isSelected ? colors.primary : 'transparent',
            paddingTop: 6,
            paddingHorizontal: 2,
            alignItems: 'center',
            overflow: 'hidden',
            opacity: isDisabled ? 0.3 : 1
          }}
        >
        {/* Zero-spend indicator: top-left corner triangle */}
        {isZeroSpend && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderTopWidth: 10,
              borderRightWidth: 10,
              borderBottomWidth: 0,
              borderLeftWidth: 0,
              borderTopColor: colors.highlight,
              borderRightColor: 'transparent',
              borderBottomColor: 'transparent',
              borderLeftColor: 'transparent'
            }}
          />
        )}

        {/* Day number */}
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: radius.full,
            backgroundColor: isToday ? colors.primary : 'transparent',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Text
            style={{
              fontSize: fontSize.sm,
              fontWeight: fontWeight.medium,
              color: isToday ? '#fff' : hasActivity ? colors.text : colors.textSecondary
            }}
          >
            {dayNum}
          </Text>
        </View>

        {/* Amount with semantic color + weight scaling */}
        {hasActivity && amountStyle && (
          <View style={{ alignItems: 'center', marginTop: 3 }}>
            <Text
              style={{
                fontSize: fontSize.xs,
                fontWeight: amountStyle.fontWeight,
                color: amountStyle.color
              }}
            >
              {v!.net >= 0 ? '+' : '-'}{formatCompactUsd(Math.abs(v!.net))}
            </Text>
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
            <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.text }}>{w}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid - one row per week */}
      {weeks.map((week, weekIdx) => (
        <View key={`week-${weekIdx}`} style={{ flexDirection: 'row' }}>
          {week.map((day, dayIdx) => renderDayCell(day, `day-${weekIdx}-${dayIdx}`))}
        </View>
      ))}


      {/* Day Detail Bottom Sheet - key forces remount on day change for fresh sizing */}
      <DayDetailSheet
        key={selectedDay?.ymd ?? 'none'}
        ref={bottomSheetRef}
        selectedDay={selectedDay}
        transactions={transactions}
        loadingTx={loadingTx}
        colors={colors}
        onViewAll={handleViewAll}
        zeroSpendDays={manualZeroSpendDays}
        onToggleZeroSpend={onToggleZeroSpend}
        onDismiss={handleDismiss}
      />
    </View>
  )
}
