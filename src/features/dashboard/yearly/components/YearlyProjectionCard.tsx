import React, { useState } from 'react'
import { Modal, Pressable, Text, View } from 'react-native'

import { formatUsdInt } from '@/shared/format/currency'
import { fontSize, fontWeight, letterSpacing } from '@/theme/tokens/typography'
import { radius } from '@/theme/tokens/radius'
import { spacing } from '@/theme/tokens/spacing'
import { componentStyles } from '@/theme/tokens/viewStyles'
import type { YearlyProjection } from '@/domain/transaction/transaction.usecase'

// Component-specific sizes
const PROGRESS_BAR_HEIGHT = 6
const INFO_BUTTON_SIZE = 14
const ACCENT_HEADER_PADDING_V = 5
const ACCENT_HEADER_PADDING_H = 8
const LINE_HEIGHT_MD = 20

type Colors = {
  text: string
  textSecondary: string
  surface: string
  surfaceAlt: string
  border: string
  success: string
  danger: string
  primary: string
}

type Props = {
  year: number
  data: YearlyProjection
  colors: Colors
}

function ProgressBar({ progress, color }: { progress: number; color: string }) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100)

  return (
    <View
      style={{
        height: PROGRESS_BAR_HEIGHT,
        backgroundColor: color + '33',
        borderRadius: radius.full,
        overflow: 'hidden',
        marginTop: spacing.sm + spacing.xs / 2, // 10
      }}
    >
      <View
        style={{
          height: '100%',
          width: `${clampedProgress}%`,
          backgroundColor: color,
          borderRadius: radius.full,
        }}
      />
    </View>
  )
}

function InfoButton({ onPress, color }: { onPress: () => void; color: string }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: spacing.sm, bottom: spacing.sm, left: spacing.sm, right: spacing.sm }}
      style={{
        width: INFO_BUTTON_SIZE,
        height: INFO_BUTTON_SIZE,
        borderRadius: radius.full,
        backgroundColor: color + '20',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.bold, color }}>i</Text>
    </Pressable>
  )
}

function InfoModal({
  visible,
  onClose,
  title,
  content,
  colors,
}: {
  visible: boolean
  onClose: () => void
  title: string
  content: string[]
  colors: Colors
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.7)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: spacing['2xl'],
        }}
        onPress={onClose}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.xl,
            padding: spacing.xl,
            width: '100%',
            maxWidth: 320,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.lg }}>
            {title}
          </Text>
          {content.map((line, i) => (
            <Text key={i} style={{ fontSize: fontSize.md, color: colors.textSecondary, lineHeight: LINE_HEIGHT_MD, marginBottom: spacing.sm }}>
              {line}
            </Text>
          ))}
          <Pressable
            onPress={onClose}
            style={{
              marginTop: spacing.lg,
              backgroundColor: colors.text,
              borderRadius: radius.md,
              paddingVertical: spacing.md,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.surface }}>Got it</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  )
}

export function YearlyProjectionCard({ year, data, colors }: Props) {
  const {
    projectedIncome,
    projectedExpense,
    projectedSavings,
    projectedSavingsRate,
    monthsElapsed,
    currentIncome,
    currentExpense,
    avgMonthlyIncome,
    avgMonthlyExpense,
    vsLastYear,
  } = data

  const [showIncomeInfo, setShowIncomeInfo] = useState(false)
  const [showExpenseInfo, setShowExpenseInfo] = useState(false)
  const [showSavingsInfo, setShowSavingsInfo] = useState(false)
  const [showVsLastYearInfo, setShowVsLastYearInfo] = useState(false)

  // Don't show if no data
  if (monthsElapsed === 0) return null

  const incomeProgress = projectedIncome > 0 ? (currentIncome / projectedIncome) * 100 : 0
  const expenseProgress = projectedExpense > 0 ? (currentExpense / projectedExpense) * 100 : 0
  const monthProgress = Math.round(monthsElapsed)

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.lg,
        gap: spacing.md,
      }}
    >
      {/* Info Modals */}
      <InfoModal
        visible={showIncomeInfo}
        onClose={() => setShowIncomeInfo(false)}
        title="How Income is Projected"
        content={[
          'Formula: (year-to-date income / months elapsed) × 12',
          `Your monthly average: ${formatUsdInt(avgMonthlyIncome)}`,
          `Projected: ${formatUsdInt(avgMonthlyIncome)} × 12 months`,
        ]}
        colors={colors}
      />
      <InfoModal
        visible={showExpenseInfo}
        onClose={() => setShowExpenseInfo(false)}
        title="How Expense is Projected"
        content={[
          'Formula: (year-to-date expense / months elapsed) × 12',
          `Your monthly average: ${formatUsdInt(avgMonthlyExpense)}`,
          `Projected: ${formatUsdInt(avgMonthlyExpense)} × 12 months`,
        ]}
        colors={colors}
      />
      <InfoModal
        visible={showSavingsInfo}
        onClose={() => setShowSavingsInfo(false)}
        title="How Savings is Projected"
        content={[
          'Formula: projected income − projected expense',
          'Savings Rate = (savings / income) × 100',
          'Based on your income and spending patterns this year.',
        ]}
        colors={colors}
      />
      <InfoModal
        visible={showVsLastYearInfo}
        onClose={() => setShowVsLastYearInfo(false)}
        title="Comparison to Last Year"
        content={[
          'Shows the difference between this year\'s projected savings and last year\'s actual savings.',
          '↑ more saved = you\'re on track to save more',
          '↓ less saved = you\'re on track to save less',
        ]}
        colors={colors}
      />

      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.textSecondary, letterSpacing: letterSpacing.wider }}>
          PROJECTION
        </Text>
        <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>
          Month {monthProgress} of 12
        </Text>
      </View>

      {/* Bento Grid - Row 1: Income & Expense */}
      <View style={{ flexDirection: 'row', gap: spacing.sm + spacing.xs / 2 }}>
        {/* Tile 1: Income */}
        <View
          style={{
            flex: 1,
            backgroundColor: colors.surfaceAlt,
            borderRadius: radius.lg,
            padding: spacing.md,
          }}
        >
          {/* Accent Header - Neutral */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: colors.text + '10',
              borderRadius: radius.sm,
              paddingVertical: ACCENT_HEADER_PADDING_V,
              paddingHorizontal: ACCENT_HEADER_PADDING_H,
              marginBottom: spacing.md - 2,
            }}
          >
            <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.textSecondary, letterSpacing: letterSpacing.wider }}>
              INCOME
            </Text>
            <InfoButton onPress={() => setShowIncomeInfo(true)} color={colors.textSecondary} />
          </View>

          {/* Amount */}
          <Text style={{ fontSize: fontSize.xl, fontWeight: fontWeight.heavy, color: colors.text, textAlign: 'center' }}>
            {formatUsdInt(projectedIncome)}
          </Text>

          {/* Progress Bar */}
          <ProgressBar progress={incomeProgress} color={colors.text} />
        </View>

        {/* Tile 2: Expense */}
        <View
          style={{
            flex: 1,
            backgroundColor: colors.surfaceAlt,
            borderRadius: radius.lg,
            padding: spacing.md,
          }}
        >
          {/* Accent Header - Danger */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: colors.danger + '18',
              borderRadius: radius.sm,
              paddingVertical: ACCENT_HEADER_PADDING_V,
              paddingHorizontal: ACCENT_HEADER_PADDING_H,
              marginBottom: spacing.md - 2,
            }}
          >
            <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.danger, letterSpacing: letterSpacing.wider }}>
              EXPENSE
            </Text>
            <InfoButton onPress={() => setShowExpenseInfo(true)} color={colors.danger} />
          </View>

          {/* Amount */}
          <Text style={{ fontSize: fontSize.xl, fontWeight: fontWeight.heavy, color: colors.text, textAlign: 'center' }}>
            {formatUsdInt(projectedExpense)}
          </Text>

          {/* Progress Bar */}
          <ProgressBar progress={expenseProgress} color={colors.text} />
        </View>
      </View>

      {/* Bento Grid - Row 2: Savings & vs Last Year */}
      <View style={{ flexDirection: 'row', gap: spacing.sm + spacing.xs / 2 }}>
        {/* Tile 3: Savings */}
        <View
          style={{
            flex: 1,
            backgroundColor: colors.surfaceAlt,
            borderRadius: radius.lg,
            padding: spacing.md,
          }}
        >
          {/* Accent Header - Success */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: colors.success + '18',
              borderRadius: radius.sm,
              paddingVertical: ACCENT_HEADER_PADDING_V,
              paddingHorizontal: ACCENT_HEADER_PADDING_H,
              marginBottom: spacing.md - 2,
            }}
          >
            <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.success, letterSpacing: letterSpacing.wider }}>
              SAVINGS
            </Text>
            <InfoButton onPress={() => setShowSavingsInfo(true)} color={colors.success} />
          </View>

          {/* Amount */}
          <Text
            style={{
              fontSize: fontSize.xl,
              fontWeight: fontWeight.heavy,
              color: projectedSavings >= 0 ? colors.success : colors.text,
              textAlign: 'center',
            }}
          >
            {projectedSavings >= 0 ? '+' : ''}{formatUsdInt(projectedSavings)}
          </Text>

          {/* Sub label */}
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm }}>
            {projectedSavingsRate}% rate
          </Text>
        </View>

        {/* Tile 4: vs Last Year */}
        <View
          style={{
            flex: 1,
            backgroundColor: colors.surfaceAlt,
            borderRadius: radius.lg,
            padding: spacing.md,
          }}
        >
          {/* Accent Header - Primary/Blue */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: colors.primary + '18',
              borderRadius: radius.sm,
              paddingVertical: ACCENT_HEADER_PADDING_V,
              paddingHorizontal: ACCENT_HEADER_PADDING_H,
              marginBottom: spacing.md - 2,
            }}
          >
            <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.primary, letterSpacing: letterSpacing.wider }}>
              VS LAST YEAR
            </Text>
            <InfoButton onPress={() => setShowVsLastYearInfo(true)} color={colors.primary} />
          </View>

          {vsLastYear ? (
            <>
              {/* Amount */}
              <Text style={{ fontSize: fontSize.xl, fontWeight: fontWeight.heavy, color: colors.text, textAlign: 'center' }}>
                {vsLastYear.isMoreSaved ? '+' : '-'}{formatUsdInt(vsLastYear.delta)}
              </Text>

              {/* Sub label */}
              <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm }}>
                <Text style={{ color: vsLastYear.isMoreSaved ? colors.success : colors.text }}>
                  {vsLastYear.isMoreSaved ? '↑' : '↓'}
                </Text>
                {' '}{vsLastYear.isMoreSaved ? 'more saved' : 'less saved'}
              </Text>
            </>
          ) : (
            <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center', marginTop: 4 }}>
              No data
            </Text>
          )}
        </View>
      </View>
    </View>
  )
}
