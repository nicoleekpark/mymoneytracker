import React, { useState } from 'react'
import { Modal, Pressable, Text, View } from 'react-native'

import { formatUsdInt } from '@/shared/format/currency'
import type { MonthlyProjection } from '@/domain/transaction/transaction.usecase'

type Colors = {
  text: string
  textMuted: string
  surface: string
  surfaceAlt: string
  border: string
  success: string
  danger: string
}

type Props = {
  data: MonthlyProjection
  colors: Colors
}

function ProgressBar({ progress, color }: { progress: number; color: string }) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100)

  return (
    <View
      style={{
        height: 6,
        backgroundColor: color + '33',
        borderRadius: 3,
        overflow: 'hidden',
        marginTop: 12,
      }}
    >
      <View
        style={{
          height: '100%',
          width: `${clampedProgress}%`,
          backgroundColor: color,
          borderRadius: 3,
        }}
      />
    </View>
  )
}

function InfoButton({ onPress, color }: { onPress: () => void; color: string }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={{
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: color + '20',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: 9, fontWeight: '700', color }}>i</Text>
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
          padding: 32,
        }}
        onPress={onClose}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 24,
            width: '100%',
            maxWidth: 320,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 16 }}>
            {title}
          </Text>
          {content.map((line, i) => (
            <Text key={i} style={{ fontSize: 14, color: colors.textMuted, lineHeight: 20, marginBottom: 8 }}>
              {line}
            </Text>
          ))}
          <Pressable
            onPress={onClose}
            style={{
              marginTop: 16,
              backgroundColor: colors.text,
              borderRadius: 8,
              paddingVertical: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.surface }}>Got it</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  )
}

export function MonthlyProjectionCard({ data, colors }: Props) {
  const { daysElapsed, daysInMonth, currentExpense, projectedExpense, projectedSavings, projectedSavingsRate } = data

  const [showExpenseInfo, setShowExpenseInfo] = useState(false)
  const [showSavingsInfo, setShowSavingsInfo] = useState(false)

  // Don't show if no data
  if (daysElapsed === 0) return null

  const expenseProgress = projectedExpense > 0 ? (currentExpense / projectedExpense) * 100 : 0

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 16,
        gap: 12,
      }}
    >
      {/* Info Modals */}
      <InfoModal
        visible={showExpenseInfo}
        onClose={() => setShowExpenseInfo(false)}
        title="How Expense is Projected"
        content={[
          'Formula: (current expense / days elapsed) × days in month',
          `Your daily average: ${formatUsdInt(Math.round(currentExpense / daysElapsed))}`,
          `Projected: ${formatUsdInt(Math.round(currentExpense / daysElapsed))} × ${daysInMonth} days`,
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
          'Based on your spending and earning pace so far this month.',
        ]}
        colors={colors}
      />

      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.5 }}>
          PROJECTION
        </Text>
        <Text style={{ fontSize: 12, color: colors.textMuted }}>
          Day {daysElapsed} of {daysInMonth}
        </Text>
      </View>

      {/* Bento Grid - 2 tiles */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {/* Tile 1: Expense */}
        <View
          style={{
            flex: 1,
            backgroundColor: colors.surfaceAlt,
            borderRadius: 12,
            padding: 14,
          }}
        >
          {/* Accent Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: colors.danger + '18',
              borderRadius: 6,
              paddingVertical: 6,
              paddingHorizontal: 10,
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.danger, letterSpacing: 0.5 }}>
              EXPENSE
            </Text>
            <InfoButton onPress={() => setShowExpenseInfo(true)} color={colors.danger} />
          </View>

          {/* Amount */}
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text, textAlign: 'center' }}>
            {formatUsdInt(projectedExpense)}
          </Text>

          {/* Progress Bar */}
          <ProgressBar progress={expenseProgress} color={colors.text} />

          {/* Sub label */}
          <Text style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center', marginTop: 8 }}>
            projected for month
          </Text>
        </View>

        {/* Tile 2: Savings */}
        <View
          style={{
            flex: 1,
            backgroundColor: colors.surfaceAlt,
            borderRadius: 12,
            padding: 14,
          }}
        >
          {/* Accent Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: colors.success + '18',
              borderRadius: 6,
              paddingVertical: 6,
              paddingHorizontal: 10,
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.success, letterSpacing: 0.5 }}>
              SAVINGS
            </Text>
            <InfoButton onPress={() => setShowSavingsInfo(true)} color={colors.success} />
          </View>

          {/* Amount */}
          <Text
            style={{
              fontSize: 22,
              fontWeight: '800',
              color: projectedSavings >= 0 ? colors.success : colors.text,
              textAlign: 'center',
            }}
          >
            {projectedSavings >= 0 ? '+' : ''}{formatUsdInt(projectedSavings)}
          </Text>

          {/* Spacer to align with progress bar */}
          <View style={{ height: 18, marginTop: 12 }} />

          {/* Sub label */}
          <Text style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center', marginTop: 8 }}>
            {projectedSavingsRate}% rate projected
          </Text>
        </View>
      </View>
    </View>
  )
}
