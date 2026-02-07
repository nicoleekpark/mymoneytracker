import { formatUsdInt } from '@/shared/format/currency'
import { useRouter } from 'expo-router'
import React, { useMemo } from 'react'
import { ScrollView, Text, View } from 'react-native'

import { useBudgetSummary } from './budget'
import { MonthlyCalendar, type CalendarColors, type DailyFlow } from './calendar'
import { useMonthlyDailyFlow } from './calendar/useMonthlyDailyFlow'
import { MonthlyCategoryContent, MonthlyIncomeContent } from './category'
import { useMonthlyProjection } from './projection'
import { useMonthlySummary } from './useMonthlySummary'
import { getMonthNameShort } from '../types/dashboard.types'

function buildMonthTitle(monthYYYYMM: string) {
  const [y, m] = monthYYYYMM.split('-')
  const month = Number(m)
  return `${getMonthNameShort(month)} ${y}`
}

const TRANSACTIONS_ROUTE = '/transactions' as const

// Section gap for combined style
const SECTION_GAP = 40

// Accent line colors
const ACCENT_COLORS = {
  green: '#4ade80',
  blue: '#60a5fa',
  red: '#f87171',
}

/**
 * Section header with accent line - stronger styling
 */
function SectionHeader({
  title,
  accentColor,
  rightText,
  rightColor,
  colors
}: {
  title: string
  accentColor: string
  rightText?: string
  rightColor?: string
  colors: CalendarColors
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <View style={{ width: 3, height: 20, borderRadius: 2, backgroundColor: accentColor }} />
      <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
        {title}
      </Text>
      {rightText && (
        <Text style={{ marginLeft: 'auto', fontSize: 14, fontWeight: '700', color: rightColor || colors.text }}>
          {rightText}
        </Text>
      )}
    </View>
  )
}

export function MonthlyBody(props: { monthYYYYMM: string; colors: CalendarColors }) {
  const { monthYYYYMM, colors } = props
  const router = useRouter()

  const { loading, error, daily } = useMonthlyDailyFlow(monthYYYYMM)
  const { data: budgetData } = useBudgetSummary(monthYYYYMM)
  const { data: projectionData } = useMonthlyProjection(monthYYYYMM)
  const { data: summaryData } = useMonthlySummary(monthYYYYMM)

  const title = useMemo(() => buildMonthTitle(monthYYYYMM), [monthYYYYMM])

  function onPressDay(ymd: string) {
    router.push({
      pathname: TRANSACTIONS_ROUTE,
      params: { focusDate: ymd }
    })
  }

  // Calculate totals from summary data (works for all months)
  const totalExpense = summaryData.expenseTotalDollar
  const totalIncome = summaryData.incomeTotalDollar
  const savings = summaryData.netCashFlowDollar

  // Savings rate calculation
  const savingsRate = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0

  // Check if viewing current month or past
  const now = new Date()
  const currentYYYYMM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const isCurrentMonth = monthYYYYMM === currentYYYYMM

  // Budget calculations
  const budgetBarWidth = budgetData
    ? Math.min((budgetData.spentDollar / budgetData.budgetDollar) * 100, 100)
    : 0

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Section 1: Hero - Month Overview */}
      <View style={{ marginBottom: SECTION_GAP }}>
        {/* Day indicator (month title removed - duplicate with date picker) */}
        {projectionData.daysElapsed > 0 && (
          <Text style={{ fontSize: 12, fontWeight: '500', color: colors.textMuted, textAlign: 'right', marginBottom: 4 }}>
            Day {projectionData.daysElapsed} of {projectionData.daysInMonth}
          </Text>
        )}

        {/* Hero savings rate */}
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          {totalIncome > 0 ? (
            savings > 0 ? (
              // Positive savings
              <>
                <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 4 }}>
                  {isCurrentMonth ? "You're saving" : 'You saved'}
                </Text>
                <Text style={{ fontSize: 52, fontWeight: '800', color: colors.success }}>
                  {savingsRate}%
                </Text>
                <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
                  of income
                </Text>
                <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 8 }}>
                  That's <Text style={{ fontSize: 16, fontWeight: '700', color: colors.success }}>{formatUsdInt(savings)}</Text>
                </Text>
              </>
            ) : savings < 0 ? (
              // Overspent
              <>
                <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 4 }}>
                  {isCurrentMonth ? "You're overspending" : 'You overspent'}
                </Text>
                <Text style={{ fontSize: 52, fontWeight: '800', color: colors.danger }}>
                  {Math.abs(savingsRate)}%
                </Text>
                <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
                  of income
                </Text>
                <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 8 }}>
                  That's <Text style={{ fontSize: 16, fontWeight: '700', color: colors.danger }}>{formatUsdInt(Math.abs(savings))}</Text>
                </Text>
              </>
            ) : (
              // Broke even (savings = 0)
              <>
                <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 4 }}>
                  {isCurrentMonth ? "You're breaking even" : 'You broke even'}
                </Text>
                <Text style={{ fontSize: 32, fontWeight: '700', color: colors.textMuted, marginTop: 8 }}>
                  {formatUsdInt(0)}
                </Text>
                <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
                  saved
                </Text>
              </>
            )
          ) : (
            // No income
            <>
              <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 4 }}>
                Savings
              </Text>
              <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textMuted, marginTop: 8 }}>
                {isCurrentMonth ? 'No income yet' : 'No income'}
              </Text>
              {savings < 0 && (
                <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 8 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.danger }}>{formatUsdInt(Math.abs(savings))}</Text> spent
                </Text>
              )}
            </>
          )}
        </View>

        {/* Income / Expense row */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View
            style={{
              flex: 1,                                               
              backgroundColor: 'transparent',                        
              borderWidth: 1,                                        
              borderColor: colors.border, // or colors.surfaceAlt    
              borderRadius: 12,                                      
              padding: 16,                                           
              alignItems: 'center' 
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: '600',
                color: colors.text,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 4
              }}
            >
              Income
            </Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.success }}>
              {formatUsdInt(totalIncome)}
            </Text>
          </View>
          <View
            style={{
              flex: 1,                                             
              backgroundColor: 'transparent',                        
              borderWidth: 1,                                        
              borderColor: colors.border, // or colors.surfaceAlt    
              borderRadius: 12,                                      
              padding: 16,                                           
              alignItems: 'center' 
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: '600',
                color: colors.text,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 4
              }}
            >
              Expense
            </Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.danger }}>
              {formatUsdInt(totalExpense)}
            </Text>
          </View>
        </View>
      </View>

      {/* Section 2: Budget */}
      {budgetData && (
        <View style={{ marginBottom: SECTION_GAP }}>
          <SectionHeader
            title="Budget"
            accentColor={ACCENT_COLORS.green}
            rightText={formatUsdInt(budgetData.budgetDollar)}
            rightColor={colors.text}
            colors={colors}
          />
          {/* Progress row: spent | bar | left */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {/* Spent amount */}
            <View>
              <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>
                {formatUsdInt(budgetData.spentDollar)}
              </Text>
              <Text style={{ fontSize: 10, fontWeight: '500', color: colors.textMuted, marginTop: 2 }}>
                spent
              </Text>
            </View>
            {/* Progress bar */}
            <View
              style={{
                flex: 1,
                height: 8,
                backgroundColor: colors.surfaceAlt,
                borderRadius: 4,
                overflow: 'hidden'
              }}
            >
              <View
                style={{
                  height: '100%',
                  width: `${budgetBarWidth}%`,
                  backgroundColor: budgetData.remainingDollar >= 0 ? colors.success : colors.danger,
                  borderRadius: 4
                }}
              />
            </View>
            {/* Remaining amount */}
            <View style={{ alignItems: 'flex-end' }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '700',
                  color: budgetData.remainingDollar >= 0 ? colors.success : colors.danger
                }}
              >
                {formatUsdInt(Math.abs(budgetData.remainingDollar))}
              </Text>
              <Text style={{ fontSize: 10, fontWeight: '500', color: colors.textMuted, marginTop: 2 }}>
                {budgetData.remainingDollar >= 0 ? 'left' : 'over'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Section 3: Daily Cash Flow */}
      <View style={{ marginBottom: SECTION_GAP }}>
        <SectionHeader
          title="Daily activity"
          accentColor={ACCENT_COLORS.blue}
          colors={colors}
        />
        {error && <Text style={{ color: colors.danger }}>{error}</Text>}
        {!error && (
          <MonthlyCalendar
            monthYYYYMM={monthYYYYMM}
            daily={daily}
            colors={colors}
            onPressDay={onPressDay}
          />
        )}
      </View>

      {/* Section 4: Spending by Category */}
      <View style={{ marginBottom: SECTION_GAP }}>
        <SectionHeader
          title="Where it went"
          accentColor={ACCENT_COLORS.red}
          rightText={totalExpense > 0 ? formatUsdInt(totalExpense) : undefined}
          rightColor={colors.danger}
          colors={colors}
        />
        <MonthlyCategoryContent
          monthYYYYMM={monthYYYYMM}
          colors={colors}
          hideHeader
        />
      </View>

      {/* Section 5: Income by Category */}
      {totalIncome > 0 && (
        <View style={{ marginBottom: SECTION_GAP }}>
          <SectionHeader
            title="Where it came from"
            accentColor={ACCENT_COLORS.green}
            rightText={formatUsdInt(totalIncome)}
            rightColor={colors.success}
            colors={colors}
          />
          <MonthlyIncomeContent
            monthYYYYMM={monthYYYYMM}
            colors={colors}
            hideHeader
          />
        </View>
      )}
    </ScrollView>
  )
}
