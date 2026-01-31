import React, { useState } from 'react'
import { LayoutAnimation, Platform, Pressable, Text, UIManager, View } from 'react-native'

import { formatUsdInt, formatSignedUsdInt } from '@/shared/format/currency'
import { MONTH_NAMES_SHORT } from '../../types/dashboard.types'

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

type VerticalMetricProps = {
  icon: string
  value: number
  label: string
  subLabel?: string
  color: string
  bgColor: string
  colors: GoalProgressColors
}

function VerticalMetric({ icon, value, label, subLabel, color, bgColor, colors }: VerticalMetricProps) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        gap: 6
      }}
    >
      {/* Icon Circle */}
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: bgColor,
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>

      {/* Value */}
      <Text
        style={{
          fontSize: 18,
          fontWeight: '800',
          color: color
        }}
      >
        {formatUsdInt(Math.abs(value))}
      </Text>

      {/* Label */}
      <Text
        style={{
          fontSize: 11,
          fontWeight: '600',
          color: colors.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: 0.5
        }}
      >
        {label}
      </Text>

      {/* Sub Label */}
      {subLabel && (
        <Text
          style={{
            fontSize: 10,
            fontWeight: '600',
            color: color,
            marginTop: -4
          }}
        >
          {subLabel}
        </Text>
      )}
    </View>
  )
}

function MonthlyRow({
  item,
  colors,
  isPastYear,
  currentMonth
}: {
  item: MonthlyDataItem
  colors: GoalProgressColors
  isPastYear: boolean
  currentMonth: number
}) {
  const monthIndex = parseInt(item.month.split('-')[1], 10) - 1
  const isFuture = !isPastYear && monthIndex >= currentMonth

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
        opacity: isFuture ? 0.4 : 1
      }}
    >
      <Text style={{ width: 36, fontSize: 12, fontWeight: '600', color: colors.textSecondary }}>
        {MONTH_NAMES_SHORT[monthIndex]}
      </Text>
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 16 }}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: colors.success, minWidth: 55, textAlign: 'right' }}>
          {item.incomeDollar > 0 ? `+${formatUsdInt(item.incomeDollar).replace('$ ', '')}` : '-'}
        </Text>
        <Text style={{ fontSize: 12, fontWeight: '600', color: colors.danger, minWidth: 55, textAlign: 'right' }}>
          {item.expenseDollar > 0 ? `-${formatUsdInt(item.expenseDollar).replace('$ ', '')}` : '-'}
        </Text>
        <Text
          style={{
            fontSize: 12,
            fontWeight: '700',
            color: item.netDollar >= 0 ? colors.success : colors.danger,
            minWidth: 55,
            textAlign: 'right'
          }}
        >
          {item.netDollar !== 0 ? formatSignedUsdInt(item.netDollar).replace('$ ', '') : '-'}
        </Text>
      </View>
    </View>
  )
}

type Props = {
  year: number
  goalAmount: number
  currentNetAsset: number
  yearStartNetAsset: number
  totalAsset: number
  totalDebt: number
  liquidAsset: number
  totalIncome: number
  totalExpense: number
  monthlyData: MonthlyDataItem[]
  colors: GoalProgressColors
}

export function GoalProgressHeader(props: Props) {
  const {
    year,
    goalAmount,
    currentNetAsset,
    yearStartNetAsset,
    totalIncome,
    totalExpense,
    monthlyData,
    colors
  } = props

  const [isMonthlyExpanded, setIsMonthlyExpanded] = useState(false)

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const isPastYear = year < currentYear

  const yearChange = currentNetAsset - yearStartNetAsset
  const progressPercent = goalAmount > 0 ? Math.min(100, (currentNetAsset / goalAmount) * 100) : 0
  const netCashFlow = totalIncome - totalExpense

  const monthsForAvg = isPastYear ? 12 : currentMonth

  function toggleMonthly() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setIsMonthlyExpanded(prev => !prev)
  }

  return (
    <View style={{ gap: 12 }}>
      {/* Goal Progress Bar */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border
        }}
      >
        {/* Header row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View>
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary }}>
              Goal
            </Text>
            <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>
              {formatUsdInt(goalAmount)}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary }}>
              {isPastYear ? 'Year Change' : 'YTD Change'}
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '800',
                color: yearChange >= 0 ? colors.success : colors.danger
              }}
            >
              {formatSignedUsdInt(yearChange)}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View
          style={{
            height: 10,
            backgroundColor: colors.surfaceAlt,
            borderRadius: 5,
            overflow: 'hidden',
            marginBottom: 8
          }}
        >
          <View
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              backgroundColor: progressPercent >= 100 ? colors.success : colors.primary,
              borderRadius: 5
            }}
          />
        </View>

        {/* Progress label */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>
            {isPastYear ? 'Achieved' : 'Progress'}: {progressPercent.toFixed(0)}%
          </Text>
          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary }}>
            {isPastYear ? 'Year End' : 'Current'}: {formatUsdInt(currentNetAsset)}
          </Text>
        </View>
      </View>

      {/* Vertical Metrics - Inflow / Outflow / Net */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <VerticalMetric
          icon="↑"
          value={totalIncome}
          label="Inflow"
          color={colors.success}
          bgColor={`${colors.success}20`}
          colors={colors}
        />
        <VerticalMetric
          icon="↓"
          value={totalExpense}
          label="Outflow"
          color={colors.danger}
          bgColor={`${colors.danger}20`}
          colors={colors}
        />
        <VerticalMetric
          icon={netCashFlow >= 0 ? '✓' : '!'}
          value={netCashFlow}
          label="Net"
          subLabel={netCashFlow >= 0 ? 'Surplus' : 'Deficit'}
          color={netCashFlow >= 0 ? colors.success : colors.danger}
          bgColor={netCashFlow >= 0 ? `${colors.success}20` : `${colors.danger}20`}
          colors={colors}
        />
      </View>

      {/* Monthly Average - Expandable */}
      <Pressable onPress={toggleMonthly}>
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 14,
            borderWidth: 1,
            borderColor: colors.border
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 14 }}>📊</Text>
              <View>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
                  Monthly Average
                </Text>
                <Text style={{ fontSize: 10, color: colors.textSecondary }}>
                  {isMonthlyExpanded ? 'tap to collapse' : 'tap to see monthly breakdown'}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.success }}>
                  {formatUsdInt(totalIncome / monthsForAvg)}
                </Text>
                <Text style={{ fontSize: 9, color: colors.textSecondary }}>in</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.danger }}>
                  {formatUsdInt(totalExpense / monthsForAvg)}
                </Text>
                <Text style={{ fontSize: 9, color: colors.textSecondary }}>out</Text>
              </View>
            </View>
          </View>

          {/* Expanded Monthly Data */}
          {isMonthlyExpanded && (
            <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }}>
              {/* Header */}
              <View style={{ flexDirection: 'row', paddingVertical: 4, paddingHorizontal: 4 }}>
                <Text style={{ width: 36, fontSize: 10, fontWeight: '600', color: colors.textSecondary }}></Text>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 16 }}>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: colors.textSecondary, minWidth: 55, textAlign: 'right' }}>In</Text>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: colors.textSecondary, minWidth: 55, textAlign: 'right' }}>Out</Text>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: colors.textSecondary, minWidth: 55, textAlign: 'right' }}>Net</Text>
                </View>
              </View>

              {/* Monthly rows */}
              {monthlyData.map((item, idx) => (
                <MonthlyRow
                  key={item.month || idx}
                  item={item}
                  colors={colors}
                  isPastYear={isPastYear}
                  currentMonth={currentMonth}
                />
              ))}
            </View>
          )}
        </View>
      </Pressable>
    </View>
  )
}
