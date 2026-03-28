import React, { useState } from 'react'
import { LayoutAnimation, Platform, Pressable, Text, UIManager, View } from 'react-native'

import { formatUsdInt } from '@/shared/format/currency'
import { fontSize, fontWeight, letterSpacing } from '@/shared/theme/tokens/typography'
import { radius } from '@/shared/theme/tokens/radius'
import { spacing } from '@/shared/theme/tokens/spacing'
import { MONTH_NAMES_SHORT } from '../../utils'

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

export type GoalProgressColors = Readonly<{
  text: string
  textSecondary: string
  border: string
  surface: string
  surfaceAlt: string
  primary: string
  success: string
  danger: string
}>

type MonthlyDataItem = {
  month: string
  incomeDollar: number
  expenseDollar: number
  netDollar: number
}

type Props = {
  year: number
  totalIncome: number
  totalExpense: number
  monthlyData: MonthlyDataItem[]
  colors: GoalProgressColors
}

// Single month bar component
function MonthBar({
  monthIndex,
  data,
  maxAmount,
  isFuture,
  isSelected,
  onPress,
  colors
}: {
  monthIndex: number
  data: MonthlyDataItem | undefined
  maxAmount: number
  isFuture: boolean
  isSelected: boolean
  onPress: () => void
  colors: GoalProgressColors
}) {
  const income = data?.incomeDollar ?? 0
  const expense = data?.expenseDollar ?? 0
  const hasData = income > 0 || expense > 0

  // Calculate bar heights (max 40px)
  const maxBarHeight = 40
  const incomeHeight = maxAmount > 0 ? (income / maxAmount) * maxBarHeight : 0
  const expenseHeight = maxAmount > 0 ? (expense / maxAmount) * maxBarHeight : 0

  const barOpacity = isFuture ? 0.3 : 1

  return (
    <Pressable onPress={onPress} style={{ alignItems: 'center', flex: 1 }}>
      {/* Bars container */}
      <View
        style={{
          height: maxBarHeight + 4,
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 2,
          flexDirection: 'row'
        }}
      >
        {/* Income bar (green) */}
        <View
          style={{
            width: 6,
            height: Math.max(hasData ? 4 : 2, incomeHeight),
            backgroundColor: isFuture ? colors.surfaceAlt : colors.success,
            borderRadius: radius.xs,
            opacity: barOpacity
          }}
        />
        {/* Expense bar (red) */}
        <View
          style={{
            width: 6,
            height: Math.max(hasData ? 4 : 2, expenseHeight),
            backgroundColor: isFuture ? colors.surfaceAlt : colors.danger,
            borderRadius: radius.xs,
            opacity: barOpacity
          }}
        />
      </View>

      {/* Month label */}
      <Text
        style={{
          fontSize: fontSize.xs,
          fontWeight: isSelected ? fontWeight.heavy : fontWeight.semibold,
          color: isSelected ? colors.text : colors.textSecondary,
          marginTop: 4,
          opacity: isFuture ? 0.4 : 1
        }}
      >
        {MONTH_NAMES_SHORT[monthIndex].charAt(0)}
      </Text>

      {/* Selection indicator */}
      {isSelected && (
        <View
          style={{
            width: 4,
            height: 4,
            borderRadius: radius.full,
            backgroundColor: colors.primary,
            marginTop: 2
          }}
        />
      )}
    </Pressable>
  )
}

export function GoalProgressHeader(props: Props) {
  const { year, totalIncome, totalExpense, monthlyData, colors } = props

  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const isPastYear = year < currentYear
  const isFutureYear = year > currentYear

  const netCashFlow = totalIncome - totalExpense

  // Find max amount for scaling bars
  const maxAmount = Math.max(
    ...monthlyData.map(m => Math.max(m.incomeDollar, m.expenseDollar)),
    1
  )

  // Find best month (highest net)
  const bestMonth = monthlyData.reduce(
    (best, m, idx) => {
      const net = m.incomeDollar - m.expenseDollar
      if (net > best.net) return { idx, net }
      return best
    },
    { idx: -1, net: -Infinity }
  )

  function handleMonthPress(monthIndex: number) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setSelectedMonth(prev => (prev === monthIndex ? null : monthIndex))
  }

  const selectedData = selectedMonth !== null ? monthlyData[selectedMonth] : null

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing.lg
      }}
    >
      {/* Header row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.textSecondary, letterSpacing: letterSpacing.wider }}>
          {year} OVERVIEW
        </Text>
        <View style={{ alignItems: 'flex-end' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text
              style={{
                fontSize: fontSize['2xl'],
                color: netCashFlow >= 0 ? colors.success : colors.danger
              }}
            >
              {netCashFlow >= 0 ? '↑' : '↓'}
            </Text>
            <Text
              style={{
                fontSize: fontSize['3xl'],
                fontWeight: fontWeight.black,
                color: netCashFlow >= 0 ? colors.success : colors.danger
              }}
            >
              {formatUsdInt(Math.abs(netCashFlow))}
            </Text>
          </View>
          <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.textSecondary }}>
            net
          </Text>
        </View>
      </View>

      {/* Monthly bars */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
        {Array.from({ length: 12 }).map((_, idx) => {
          const monthData = monthlyData[idx]
          const isFuture = !isPastYear && !isFutureYear && idx >= currentMonth
          const isAllFuture = isFutureYear

          return (
            <MonthBar
              key={idx}
              monthIndex={idx}
              data={monthData}
              maxAmount={maxAmount}
              isFuture={isFuture || isAllFuture}
              isSelected={selectedMonth === idx}
              onPress={() => handleMonthPress(idx)}
              colors={colors}
            />
          )
        })}
      </View>

      {/* Selected month details or best month hint */}
      {selectedData ? (
        <View
          style={{
            backgroundColor: colors.surfaceAlt,
            borderRadius: radius.md,
            padding: spacing.md,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.text }}>
            {MONTH_NAMES_SHORT[selectedMonth!]}
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.lg }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.heavy, color: colors.success }}>
                {formatUsdInt(selectedData.incomeDollar)}
              </Text>
              <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>in</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.heavy, color: colors.danger }}>
                {formatUsdInt(selectedData.expenseDollar)}
              </Text>
              <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>out</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Text style={{ fontSize: fontSize.xs, color: selectedData.netDollar >= 0 ? colors.success : colors.danger }}>
                  {selectedData.netDollar >= 0 ? '↑' : '↓'}
                </Text>
                <Text
                  style={{
                    fontSize: fontSize.sm,
                    fontWeight: fontWeight.heavy,
                    color: selectedData.netDollar >= 0 ? colors.success : colors.danger
                  }}
                >
                  {formatUsdInt(Math.abs(selectedData.netDollar))}
                </Text>
              </View>
              <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>net</Text>
            </View>
          </View>
        </View>
      ) : bestMonth.idx >= 0 && bestMonth.net > 0 ? (
        <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, textAlign: 'center' }}>
          {MONTH_NAMES_SHORT[bestMonth.idx]}: ↑ {formatUsdInt(bestMonth.net)} (best month)
        </Text>
      ) : (
        <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, textAlign: 'center' }}>
          Tap a month to see details
        </Text>
      )}
    </View>
  )
}
